'use strict';
var dom = require('smelly');

module.exports = function(callback) {
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

    var editProjectForm = new dom.elelment('ProjectForm');
    html.body.appendChild(editProjectForm);


    
    var div_adminBox = new dom.div('adminBoxContainer');
    html.body.appendChild(div_adminBox);

    var button_newProject = new dom.element('button', 'newProjectButton');
    button_newProject.attributes['ng-show'] = 'user.authenticated';
    button_newProject.appendChild(new dom.textNode('New Project'));
    div_adminBox.appendChild(button_newProject);



    var div_loginForm = new dom.div('loginFormContainer');
    div_loginForm.attributes['ng-hide'] = 'user.authenticated';
    div_adminBox.appendChild(div_loginForm);

    var form_login = new dom.form();
    form_login.attributes.name = 'loginForm';
    div_loginForm.appendChild(form_login);

    var input_username = new dom.input('text', 'username');
    input_username.attributes['ng-model'] = 'user.username';
    form_login.appendChild(input_username);

    var input_password = new dom.input('password', 'password');
    input_password.attributes['ng-model'] = 'user.password';
    form_login.appendChild(input_password);

    var button_login = new dom.element('button');
    button_login.attributes['ng-click'] = 'login()';
    button_login.appendChild(new dom.textNode('Login'));
    form_login.appendChild(button_login);


   
    callback(null,html);
};