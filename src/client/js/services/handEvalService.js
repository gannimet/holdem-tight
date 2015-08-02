(function(window, undefined) {
	
	var holdemServices = angular.module('holdemServices');

	holdemServices.service('handEvalService',
			['$http',
			function($http) {

		this.evaluateShowdown = function(hands, board) {
			$http.post('/api/evaluate', {
				hands: hands
			}).then(function(data, status) {
				console.info('response: ', data);
			});
		};
		
	}]);

})(window);
