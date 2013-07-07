var net = require("net");
var crypto = require("crypto");
var readline = require("readline");

var protocol = require("./protocol");
var eclib = require("./eclib")

var client = {}

client.keys = crypto.getDiffieHellman("modp5")
client.keys.generateKeys()
client.state = protocol.stateEnum.KEY_EXCHANGE

var connection = net.connect({port : 1366})
var channels = {}
var channel = "";
connection.on("data",function(d){
    switch(client.state){
    case protocol.stateEnum.KEY_EXCHANGE:
	
	client.serverPublicKey = d
	console.log("Server public key length: " + client.serverPublicKey.length)
	console.log("Sending client public key")
	
	connection.write(client.keys.getPublicKey())
	client.sharedSecret = client.keys.computeSecret(client.serverPublicKey,null)
	console.log("Computed private key")
	console.log("Private key length: " + client.sharedSecret.length )
	client.state = protocol.stateEnum.READY
	console.log("Key exchange completed")
	
	break;
	
    case protocol.stateEnum.JOINING_CHANNEL:
	var message = JSON.parse(eclib.weakDecipher(d,client.SharedSecret.slice(0,32)))
	console.log(message)
	channels[message.channel].secret = message.key
	
	client.state = protocol.stateEnum.READY
	
	break;
	
    case protocol.stateEnum.READY:
	console.log(channels)
	var iv = new Buffer(16)
	iv.fill(0)
	console.log(d)
	var decipher = crypto.createDecipheriv("aes256",channels[channel].secret,iv)
	decipher.end(d)
	var message = JSON.parse(decipher.read().toString())
	console.log(message)
	channels[message.channel] = {}
    }
})

var rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
})

rl.on("line",function(l){
    if( client.state == protocol.stateEnum.READY){
	var message = {}
	if ( l.charAt(0) == "/" ) {
	    var cmdArray = l.split(" ")
	    cmdArray[0] = cmdArray[0].slice(1,cmdArray[0].length)
	    switch (cmdArray[0]){
	    case "join":
		channel = cmdArray[1]
		channels[channel] = {}
		channels[channel].status = "JOINING"
		message.data = "JOIN"
		client.state = protocol.stateEnum.JOINING_CHANNEL
		connection.write(eclib.weakCipher(new Buffer(JSON.stringify(message)),client.sharedSecret.slice(0,32)))
	    }
	}
    }


})
