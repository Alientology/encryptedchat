var net = require("net");
var crypto = require("crypto");
var protocol = require("./protocol");
var serverKeys = crypto.getDiffieHellman("modp5");

var clients = [];
var KEY_LENGTH = 192

serverKeys.generateKeys();

function exchangeKeys(client,data){
    client.publicKey = data
    if ( client.publicKey.length != KEY_LENGTH ) {
	console.log("Got public key with bad length : " + client.publicKey.length)
	console.log("From : " + client.s.remoteAddress);
    }
    client.privateKey = serverKeys.computeSecret(client.publicKey,null)
    client.state = protocol.stateEnum.READY
    clients.push(client)
}

function relay(client,data){
    var iv = new Buffer(16)
    iv.fill(0)

    var decipher = crypto.createDecipheriv("aes256",client.privateKey.slice(0,32),iv);
    
    decipher.end(data)
    
    console.log(decipher.read().toString())
    
}

function serve(s){
    var client = {}
    console.log("Connection from : " + s.remoteAddress)
    
    client.state = protocol.stateEnum.KEY_EXCHANGE
    
    clients.s = s
    
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

