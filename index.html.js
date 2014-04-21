'use strict';
var dom = require('smelly');
module.exports   = function(session, request, callback) {
	var html = new dom.doc();
    html.jsLinks = ['angular.js', 'controllers.js'];
    html.body.attributes['ng-controller'] = 'resumeCtrl';

    var message = new dom.div();
    message.appendChild(new dom.textNode('Hello Kitty'));
    html.body.appendChild(message);

    var projectList = new dom.ul();
    var projectListItem = new dom.li();
    html.body.appendChild(projectList);
    html.body.appendChild(projectListItem);

    projectListItem.attributes['ng-repeat'] = 'project in projects';
    projectListItem.appendChild(new dom.textNode('{{project.name}}'));


    callback(null,'html',html);
};