(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('callLabel', [function() {
		return function(amount) {
			if (amount) {
				return 'CALL ' + amount;
			} else {
				return 'CALL';
			}
		};
	}]);

})(window);