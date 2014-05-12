'use strict';
var dom = require('smelly');
module.exports = function(callback) {
	var div_formContainer = new dom.div('projectFormContainer');
	var form = new dom.form();
	div_formContainer.appendChild(form);

	var label_projectName = new dom.label('projectName');
	label_projectName.appendChild(new dom.textNode('Project Name'));
	form.appendChild(label_projectName);

	var input_projectName = new dom.input('text', 'projectName', 'projectName');
	form.appendChild(input_projectName);

	callback(null, div_formContainer);
};