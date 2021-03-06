(function(window, undefined) {
	
	var holdemConstants = angular.module('holdemConstants');

	holdemConstants.constant('HOLDEM_EVENTS', {
		GAME_STARTED: 'gameStarted',
		PLAYER_ADDED: 'playerAdded',
		PLAYER_DELETED: 'playerDeleted',
		NEXT_HAND_DEALT: 'nextHandDealt',
		ROLES_ASSIGNED: 'rolesAssigned',
		ACTION_PERFORMED: 'actionPerformed',
		BETTING_ROUND_ADVANCED: 'bettingRoundAdvanced',
		TURN_ASSIGNED: 'turnAssigned',
		PLAYER_WON_MONEY: 'playerWonMoney',
		PLAYER_FINISHED: 'playerFinished',
		PLAYER_WON_TOURNAMENT: 'playerWonTournament',
		HOLE_CARD_ASSIGNED: 'holeCardAssigned',
		FLOP_CARDS_ASSIGNED: 'flopCardsAssigned',
		TURN_CARD_ASSIGNED: 'turnCardAssigned',
		RIVER_CARD_ASSIGNED: 'riverCardAssigned',
		SHOWDOWN_EVALUATED: 'showdownEvaluated'
	});

})(window);