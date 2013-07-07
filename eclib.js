var crypto = require("crypto");

exports.weakCipher = function(message,key){
    var iv = new Buffer(16)
    iv.fill(0)
    var cipher = crypto.createCipheriv("aes256",key,iv)
    cipher.end(message)
    return cipher.read()
}

exports.weakDecipher = function(message,key){
    var iv = new Buffer(16)
    iv.fill(0)
    var decipher = crypto.createDecipheriv("aes256",key,iv)
    decipher.end(message)
    return decipher.read()
}

exports.arrayContains  = function(array,needle){
    for ( var i = 0; array.length > i; i++ ){
	if ( array[0] == needle ) {
	    return true
	}
    }
    return false
}


