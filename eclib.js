var crypto = require("crypto");

eclib.exports.weakCipher = function(message,key){
    var iv = new Buffer(16)
    iv.fill(0)
    var cipher = crypto.createCipheriv("aes256",key,iv)
    cipher.end(message)
    return cipher.read()
}

eclib.exports.weakDecipher = function(message,key){
    var iv = new Buffer(16)
    iv.fill(0)
    var decipher = crypto.createCipheriv("aes256",key,iv)
    cipher.end(message)
    return cipher.read()
}

eclib.exports.arrayContains  = function(array,needle){
    for ( var i = 0; array.length > i; i++ ){
	if ( array[0] == needle ) {
	    return true
	}
    }
    return false
}


