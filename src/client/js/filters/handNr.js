(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('handNr', [function() {
		return function(handNr) {
			if (typeof(handNr) === 'number') {
				return 'Hand #' + handNr;
			}
		};
	}]);

})(window);