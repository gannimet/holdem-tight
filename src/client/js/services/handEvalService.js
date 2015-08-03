(function(window, undefined) {
	
	var holdemServices = angular.module('holdemServices');

	holdemServices.service('handEvalService',
			['$http', '$q',
			function($http, $q) {

		this.evaluateShowdown = function(hands, board) {
			var deferred = $q.defer;

			$http.post('/api/evaluate', {
				hands: hands,
				board: board
			}).success(function(data, status) {
				deferred.resolve(data);
			}).error(function(reason) {
				deferred.reject(reason);
			});

			return deferred.promise;
		};
		
	}]);

})(window);
