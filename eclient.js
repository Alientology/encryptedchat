var net      = require("net")
var crypto   = require("crypto")
var readline = require("readline")

var protocol = require("./protocol")
var eclib    = require("./eclib")

function Client(){
    this.keys = crypto.getDiffieHellman("modp5")
    this.state = protocol.stateEnum.KEY_EXCHANGE
    this.keychain = {}
    this.keys.generateKeys()
}

Client.prototype.computeSecret = function(name){
    this.keys.computeSecret(this.keychain[name].key,null)
    return true
}

Client.prototype.addKey = function(name,key){
    this.keychain[name] = {}
    this.keychain[name].key = key
    return true
}

Client.prototype.init = function(d,name){
    this.addKey("root",d)
    this.computeSecret("root")
    this.state = protocol.stateEnum.READY
}

Client.prototype.decrypt = function(d){
    var message = JSON.parse(eclib.weakDecipher(d,this.keychain[name].key,null))
    console.log(message)			     
}

var client = new Client()

var connection = net.connect({port : 1366})
connection.on("data",function(d){
    switch(client.state){
    case protocol.stateEnum.KEY_EXCHANGE:
	client.init(d)
	break
    case protocol.stateEnum.READY:
	client.decrypt(d,"root")
	break
	
    }

})

var rl = readline.createInterface({
    input  : process.stdin,
    output : process.stdout
})

rl.on("line", function(l){
    if(l.charAt(0) != "/" )
	return
    
    
    var options = l.split(" ")
    var command = options.pop()
    command = command.slice(1,command.length)
    
    switch(command){
    case "join":
	console.log("I join")
	break
    case "say":
	console.log("I Say")
	break
    }
    
    
})
