(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('cardInUse', ['$filter', function($filter) {
		return function(card) {
			if (card) {
				var cardName = $filter('cardName')(card);

				return cardName + ' is already in use in this hand.';
			}
		};
	}]);

})(window);