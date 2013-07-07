var net = require("net");
var crypto = require("crypto");
var protocol = require("./protocol");
var eclib = require("./eclib");
var serverKeys = crypto.getDiffieHellman("modp5");
/*
  So ideal setup would perhaps be chennels as event emitters, to which clients subscribes
  Going to go with a rough implementation first the circle back to emitters
*/
var clients = []
var channels = {}
var KEY_LENGTH = 192

serverKeys.generateKeys();

function exchangeKeys(client,data){
    client.publicKey = data
    if ( client.publicKey.length != KEY_LENGTH ) {
	console.log("Got public key with bad length : " + client.publicKey.length)
	console.log("From : " + client.s.remoteAddress);
	
    }
    console.log("Handshake OK")
    client.sharedSecret = serverKeys.computeSecret(client.publicKey,null)
    client.state = protocol.stateEnum.READY
    clients.push(client)
}

function relay(client,data){
    console.log("relaying")
    console.log(data)
    var message = JSON.parse(eclib.weakDecipher(data,client.sharedSecret.slice(0,32)).toString())
    var returnMessage = {}
    returnMessage.channel = message.channel

    if( typeof channels[message.channel] == "undefined"){
	console.log("Creating new channel")
	channels[message.channel] = {
	    secret : crypto.randomBytes(32),
	    clientSockets : new Array()
	}
	console.log(message.channel)
	channels[message.channel].clientSockets.push(client.s)

	returnMessage.key = channels[message.channel].secret

	console.log(returnMessage)
	var encryptedMessage = eclib.weakCipher(JSON.stringify(returnMessage),client.sharedSecret.slice(0,32))
	client.s.write(encryptedMessage)

    }else{
	
	returnMessage.channel = message.channel
	returnMessage.data=eclib.weakCipher(message.data,channels[message.channel].secret)
	returnMessage.key = ""
	
	if(!eclib.arrayContains(channels[message.channel].clientSockets,client.s)){
	    console.log("New member")
	    channels[message.channel].clientSockets.push(client.s)
	    returnMessage.key = channels[message.channel].secret


	    var encryptedMessage = eclib.weakCipher(JSON.stringify(returnMessage),client.sharedSecret.slice(0,32))
	    console.log(encryptedMessage)
	    client.s.write(encryptedMessage)
	    return
	}

	for( i in channels[message.channel].clientSockets ) {
	    if(!eclib.arrayContains(channels[message.channel].clientSockets,client)){
		channels[message.channel].clientSockets.push(client.s)
		returnMessage.key = channels[message.channel].secret
	    }
	    var encryptedMessage = eclib.weakCipher(JSON.stringify(returnMessage),client.sharedSecret.slice(0,32))
	    console.log(encryptedMessage)
	    channels[message.channel].clientSockets[i].write(encryptedMessage)
	}
    }
}


function serve(s){
    var client = {}
    console.log("Connection from : " + s.remoteAddress)    
    client.state = protocol.stateEnum.KEY_EXCHANGE  
    client.s = s
    
    s.write(serverKeys.getPublicKey())
       
    s.on("data",function(data){
	switch(client.state){
	case protocol.stateEnum.KEY_EXCHANGE:
	    exchangeKeys(client,data)
	    break
	case protocol.stateEnum.READY:
	    relay(client,data);
	    break
	}
    });
}

var server = net.createServer(serve).listen(1366);

