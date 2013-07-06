var net = require("net");
var crypto = require("crypto");
var readline = require("readline");

var protocol = require("./protocol");

var client = {};

client.keys = crypto.getDiffieHellman("modp5");
client.keys.generateKeys();
client.state = protocol.stateEnum.KEY_EXCHANGE;

var connection = net.connect({port : 1366});

connection.on("data",function(d){
    switch(client.state){
	case protocol.stateEnum.KEY_EXCHANGE:
	client.serverPublicKey = d;
	console.log("Server public key length: " + client.serverPublicKey.length);
	console.log("Sending client public key");

	connection.write(client.keys.getPublicKey());
	client.privateKey = client.keys.computeSecret(client.serverPublicKey,null)
	console.log("Computed private key");
	console.log("Private key length: " + client.privateKey.length )
	client.state = protocol.stateEnum.READY;
	console.log("Key exchange completed");
	
	break;
	
	case protocol.stateEnum.READY:
	var iv = new Buffer(16);
	iv.fill(0);
	var decipher = crypto.createDecipheriv("aes256",client.privateKey.slice(0,32),iv);
	decipher.end(d);
	console.log(decipher.read().toString());
	
	break;
    };
});

var rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
});

rl.on("line",function(l){
    if( client.state == protocol.stateEnum.READY){
	var iv = new Buffer(16);
	iv.fill(0);
	console.log(client.privateKey);
	var cipher = crypto.createCipheriv("aes256",client.privateKey.slice(0,32),iv);
	cipher.end(l);
	var m = cipher.read()
	console.log(m)
	connection.write(m)
    }
    
});
