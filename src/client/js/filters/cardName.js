(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('cardName', ['cardService', function(cardService) {
		return function(card) {
			if (card) {
				var suit = cardService.getSuitByCode(card.suit);
				var rank = cardService.getRankByCode(card.rank);

				return rank.name + ' of ' + suit.name;
			}
		};
	}]);

})(window);