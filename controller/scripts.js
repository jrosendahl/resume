'use strict';
var fs = require('fs');
module.exports = function(request) {
	var jsdir = request.appDir + '/scripts/';
	var safeFile = request.url.pathname.replace('..','','g');
	safeFile = safeFile.replace('scripts/','');
	
	fs.readFile(jsdir + safeFile,function (err, file) {
		request.route.reply.text(err,  {file:file, contentType:'application/javascript'});
	});
};