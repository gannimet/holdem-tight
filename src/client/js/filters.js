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
