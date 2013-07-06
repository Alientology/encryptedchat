var net = require("net");
var crypto = require("crypto");
var protocol = require("./protocol");
var serverKeys = crypto.getDiffieHellman("modp5");

var clients = [];

clients.find = function(addrss){
    for(var i=0; this.length > i; i++){
	return i;
    }
    return false;
};

serverKeys.generateKeys();
var server = net.createServer(function(s){ 
    var client = {};

    client.state = protocol.stateEnum.KEY_EXCHANGE;
    s.write(serverKeys.getPublicKey());
    
    console.log("Connection from " + s.remoteAddress);
    
    s.on("data",function(d){
	switch(client.state){
	case protocol.stateEnum.KEY_EXCHANGE:
	    client.publicKey = d;
	    client.privateKey = serverKeys.computeSecret(client.publicKey,null);
	    console.log("Client public key length: " + client.publicKey.length);
	    console.log("Shared private key length: " + client.privateKey.length);
	    
	    /* Should do some verification on that */
	    client.state = protocol.stateEnum.READY;
	    console.log("Key exchange completed");
	    break;
	    
	case protocol.stateEnum.READY:
	    console.log("Attemptning to decrypt");
	    console.log("Buffer length: " + d);
	    console.log("..");
	    console.log(d);
	    var iv = new Buffer(16);
	    iv.fill(0);
	    //console.log(client.privateKey.toString("base64"));
	    var decipher = crypto.createDecipheriv("aes256",client.privateKey.slice(0,32),iv);
	    decipher.end(d);
	    console.log(decipher.read().toString());
	    break;
	    
	default:
	    break;
	}
	

    });
}).listen(1366);

