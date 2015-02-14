(function(window, undefined) {

	var holdemFilters = angular.module('holdemFilters', []);

	holdemFilters.filter('stackSize', [function() {
		return function(stack) {
			if (typeof(stack) === 'number') {
				return 'Stack size: ' + stack;
			}
		};
	}]);

	holdemFilters.filter('handNrFilter', [function() {
		return function(handNr) {
			if (typeof(handNr) === 'number') {
				return 'Hand #' + handNr;
			}
		};
	}]);

	holdemFilters.filter('playerAction', [function() {
		return function(action) {
			if (action) {
				return action.action + ' ' + action.amount;
			}
		};
	}]);

})(window);
