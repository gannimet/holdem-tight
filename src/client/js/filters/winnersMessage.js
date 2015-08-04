(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('winnersMessage', [function() {
		return function(tie, names, hand) {
			if (angular.isDefined(tie) && angular.isDefined(names) && angular.isDefined(hand)) {
				// TODO
				return 'Somebody won.';
			}
		};
	}]);

})(window);
