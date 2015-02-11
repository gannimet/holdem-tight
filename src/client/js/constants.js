(function(window, undefined) {

	var holdemConstants = angular.module('holdemConstants', []);

	holdemConstants.constant('HOLDEM_EVENTS', {
		GAME_STARTED: 'gameStarted',
		PLAYER_ADDED: 'playerAdded',
		PLAYER_DELETED: 'playerDeleted',
		NEXT_HAND_DEALT: 'nextHandDealt',
		ROLES_ASSIGNED: 'rolesAssigned'
	});

})(window);
