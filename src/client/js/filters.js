(function(window, undefined) {

	var holdemFilters = angular.module('holdemFilters', []);

	holdemFilters.filter('stackSize', [function() {
		return function(stack) {
			if (typeof(stack) === 'number') {
				return 'Stack size: ' + stack;
			}
		};
	}]);

	holdemFilters.filter('handNr', [function() {
		return function(handNr) {
			if (typeof(handNr) === 'number') {
				return 'Hand #' + handNr;
			}
		};
	}]);

	holdemFilters.filter('playerAction', ['HOLDEM_ACTIONS', function(HOLDEM_ACTIONS) {
		return function(action) {
			if (action) {
				var actionName = action.action;

				if (actionName === HOLDEM_ACTIONS.CHECK || actionName === HOLDEM_ACTIONS.FOLD) {
					return action.action;
				} else {
					return action.action + ' ' + action.amount;
				}
			} else {
				return '';
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

	holdemFilters.filter('checkOrFoldLabel', [function() {
		return function(isCheckingPossible) {
			if (isCheckingPossible) {
				return 'CHECK';
			} else {
				return 'FOLD';
			}
		};
	}]);

	holdemFilters.filter('betOrRaiseLabel', [function() {
		return function(isBettingPossible, amount) {
			if (isBettingPossible) {
				return 'BET' + (amount ? ' ' + amount : '');
			} else {
				return 'RAISE' + (amount ? ' ' + amount : '');
			}
		};
	}]);

	holdemFilters.filter('callLabel', [function() {
		return function(amount) {
			if (amount) {
				return 'CALL ' + amount;
			} else {
				return 'CALL';
			}
		};
	}]);

	holdemFilters.filter('blinds', [function() {
		return function(blinds) {
			if (blinds) {
				return blinds.smallBlind + '/' + blinds.bigBlind;
			}
		};
	}]);

})(window);
