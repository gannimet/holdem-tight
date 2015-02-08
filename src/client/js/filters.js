(function(window, undefined) {

	var holdemFilters = angular.module('holdemFilters', []);

	holdemFilters.filter('stackSize', [function() {
		return function(stack) {
			if (typeof(stack) === 'number') {
				return 'Stack size: ' + stack;
			}
		};
	}]);

})(window);
