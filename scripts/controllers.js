var resumeApp = angular.module('resumeApp', []);

resumeApp.controller('resumeCtrl', function($scope, $http) {
	'use strict';
	$scope.projects = [
		{name:'Project 1', description:'description should be long', },
		{name:'Project 2'}
	];

	$scope.user = {authenticated:false, username:'', password:''};


	$scope.login = function() {
		$http.post('/authenticate', $scope.user)
			.success(function(authorized) {
				authorized = JSON.parse(authorized);
				if(!authorized) {
					alert('Invalid User');
				}
				$scope.user.authenticated = authorized;
				$scope.user.password = '';
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
})
.directive('ProjectForm', function() {
	'use strict';
	return {
		restruct: 'E',
		templateURL: '/projectForm.html',
	};
});