'use strict';
module.exports   = function(session, request, callback) {

	if(request.attributes.username === 'valid' && request.attributes.password === 'user') {
		session.authenticated = true;
		return callback(null,'json', true);
	}
	else {
		return callback(null, 'json', false);
	}

	
};