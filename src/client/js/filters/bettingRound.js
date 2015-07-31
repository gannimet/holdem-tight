(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('bettingRound', ['HOLDEM_BETTING_ROUNDS', function(HOLDEM_BETTING_ROUNDS) {
		return function(bettingRound) {
			if (bettingRound) {
				var bettingRoundStr;
				switch (bettingRound) {
					case HOLDEM_BETTING_ROUNDS.PRE_FLOP:
						bettingRoundStr = 'PRE-FLOP';
						break;
					case HOLDEM_BETTING_ROUNDS.FLOP:
						bettingRoundStr = 'FLOP';
						break;
					case HOLDEM_BETTING_ROUNDS.TURN:
						bettingRoundStr = 'TURN';
						break;
					case HOLDEM_BETTING_ROUNDS.RIVER:
						bettingRoundStr = 'RIVER';
						break;
					default:
						throw 'Illegal betting round';
				}

				return 'Current betting round: ' + bettingRoundStr;
			}
		};
	}]);

})(window);