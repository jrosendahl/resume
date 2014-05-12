'use strict';

module.exports   = function(request) {
	app.view.blocks.home(function(err, html) {
        request.route.reply.html(null,html);
    });
};