'use strict';
module.exports   = function(request) {
	if(request.attributes.username === 'valid' && request.attributes.password === 'user') {
		request.session.authenticated = true;
		return request.route.reply.json(null, true);
	}
	else {
		return request.route.reply.json(null, true);
	}
};