(function(window, undefined) {

	var holdemApp = angular.module('holdemApp', [
		'ngRoute',
		'ngAnimate',
		'holdemFilters',
		'holdemControllers',
		'holdemServices',
		'holdemDirectives',
		'holdemConstants'
	]);

	holdemApp.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/game', {
				templateUrl: '/partials/game',
				controller: 'GameCtrl'
			})
			.otherwise({
				redirectTo: '/game'
			});

		// Regular URLs instead of hashbang URLs
		$locationProvider.html5Mode(true);
	}]);

})(window);
