(function(window, undefined) {
	
	var holdemServices = angular.module('holdemServices');

	holdemServices.service('handEvalService',
			['$http',
			function($http) {
		this.evaluateHands = function(hands) {
			$http.post('/api/evaluate', {
				hands: hands
			}).then(function(data, status) {
				console.info('response: ', data);
			});
		};
	}]);

})(window);