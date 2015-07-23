(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('checkOrFoldLabel', [function() {
		return function(isCheckingPossible) {
			if (isCheckingPossible) {
				return 'CHECK';
			} else {
				return 'FOLD';
			}
		};
	}]);

})(window);