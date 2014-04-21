'use strict';
var fs = require('fs');
module.exports = function(session, request, callback) {
	var jsdir = 'scripts/';
	var safeFile = request.url.pathname.replace('..','','g');
	safeFile = safeFile.replace('scripts/','');
	
	fs.readFile(jsdir + safeFile,function (err, file) {
		if(err) {
			callback(err);
		}
		else {
			callback(null,'text',{file:file, contentType:'application/javascript'});
		}
	});
};