'use strict';

module.exports = function (request) {
	app.view.blocks.projectForm(function(err, html) {
		request.route.reply.html(err, html);
	});
};


