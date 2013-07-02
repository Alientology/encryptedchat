var net = require("net");
var crypto = require("crypto");
var readline = require("readline");

var protocol = require("./protocol");

var client = {};

client.keys = crypto.getDiffieHellman("modp5");
client.keys.generateKeys();
client.state = protocol.stateEnum.KEY_EXCHANGE;

var connection = net.connect({port : 1366},function(s){

});

connection.on("data",function(d){
    switch(client.state){
	case protocol.stateEnum.KEY_EXCHANGE:
	console.log("Got server public key");
	client.serverPublicKey = d;
	console.log(client.serverPublicKey);
	console.log("Sending client public key");
	connection.write(client.keys.getPublicKey());
	console.log(client.keys.getPublicKey());
	client.privateKey = client.keys.computeSecret(client.serverPublicKey,null)
	console.log("Computed private key");
	console.log(client.privateKey);
	client.state = protocol.stateEnum.READY;
	break;
    };
});

var rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
});
rl.on("line",function(l){
    if( client.state == protocol.stateEnum.READY){
	var cipher = crypto.createCipher("blowfish",client.privateKey);

	cipher.update(l)
	var message = cipher.final();
	console.log(message);
	connection.write(message);    
    }
    
});
