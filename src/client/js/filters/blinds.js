(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('blinds', [function() {
		return function(blinds) {
			if (blinds) {
				return blinds.smallBlind + '/' + blinds.bigBlind;
			}
		};
	}]);

})(window);