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
    client.hasServerPublicKey = false;

    console.log("Got connction");
    client.address = s.remoteAddress;
    console.log(clients.find(s.remoteAddress));
    console.log("Sending server public key");
    s.write(serverKeys.getPublicKey());
    console.log(serverKeys.getPublicKey());
    console.log("Length: " + serverKeys.getPublicKey().length);
    s.on("data",function(d){
	console.log("Socket emitted data.");	
	switch(client.state){
	case protocol.stateEnum.KEY_EXCHANGE:
	    console.log("Reading buffer as key exchange");
	    client.publicKey = d;
	    console.log("Got client public key:");
	    console.log(client.publicKey);
	    client.privateKey = serverKeys.computeSecret(client.publicKey,null);
	    console.log("Computed private key");
	    console.log(client.privateKey);
	    /* Should do some verification on that */
	    client.state = protocol.stateEnum.READY;
	    break;
	    
	case protocol.stateEnum.READY:
	    console.log("Attempting to decrypt");
	    console.log(d);
	    console.log("..");
	    var decipher = crypto.createDecipher("blowfish",client.privateKey);
	    decipher.update(d);
	    var message = decipher.final("utf8");
			    
	
	    console.log(message);
	    //Here we should have all the keys needed to start "secure" communications
	    break;
	    
	default:
	    break;
	}
	

    });
}).listen(1366);

