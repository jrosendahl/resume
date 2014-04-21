var resumeApp = angular.module('resumeApp', []);

resumeApp.controller('resumeCtrl', function($scope) {
	'use strict';
	$scope.projects = [
		{name:'Project 1'},
		{name:'Project 2'}
	];
});