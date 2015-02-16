(function(window, undefined) {

	var holdemConstants = angular.module('holdemConstants', []);

	holdemConstants.constant('HOLDEM_EVENTS', {
		GAME_STARTED: 'gameStarted',
		PLAYER_ADDED: 'playerAdded',
		PLAYER_DELETED: 'playerDeleted',
		NEXT_HAND_DEALT: 'nextHandDealt',
		ROLES_ASSIGNED: 'rolesAssigned',
		ACTION_PERFORMED: 'actionPerformed',
		BETTING_ROUND_ADVANCED: 'bettingRoundAdvanced',
		TURN_ASSIGNED: 'turnAssigned'
	});

	holdemConstants.constant('HOLDEM_ACTIONS', {
		FOLD: 'fold',
		CALL: 'call',
		RAISE: 'raise',
		BET: 'bet',
		CHECK: 'check'
	});

	holdemConstants.constant('HOLDEM_BETTING_ROUNDS', {
		PRE_FLOP: 'pre_flop',
		FLOP: 'flop',
		TURN: 'turn',
		RIVER: 'river'
	});

})(window);
