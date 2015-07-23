(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('betOrRaiseLabel', [function() {
		return function(isBettingPossible, amount) {
			if (isBettingPossible) {
				return 'BET' + (amount ? ' ' + amount : '');
			} else {
				return 'RAISE' + (amount ? ' ' + amount : '');
			}
		};
	}]);

})(window);