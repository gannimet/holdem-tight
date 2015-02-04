(function(window, undefined) {
		
	var holdemControllers = angular.module('holdemControllers', []);

	holdemControllers.controller('GameCtrl', ['$scope', function($scope) {
		$scope.message = 'Hello world!';
	}]);

})(window);
