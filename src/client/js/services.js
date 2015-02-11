(function(window, undefined) {

	var holdemServices = angular.module('holdemServices', []);

	holdemServices.service('gameService', ['$rootScope', 'HOLDEM_EVENTS', function($rootScope, HOLDEM_EVENTS) {
		// Instance variables
		var self = this;
		this.players = [];
		this.gameStarted = false;
		this.currentRoles = null;
		this.handNr = null;
		
		// Public API
		this.addPlayer = function(player) {
			player.name = player.name || 'Player ' + (this.players.length + 1);
			player.stack = player.stack || 1500;

			this.players.push(player);

			// Tell the world about our new player
			$rootScope.$broadcast(HOLDEM_EVENTS.PLAYER_ADDED, this.players);
		};

		this.deletePlayer = function(playerIndex) {
			this.players.splice(playerIndex, 1);

			// Tell the world about the player we removed
			$rootScope.$broadcast(HOLDEM_EVENTS.PLAYER_DELETED, this.players);
		};

		this.startGame = function() {
			this.gameStarted = true;
			this.nextHand();

			// Tell the world about the start of the game
			$rootScope.$broadcast(HOLDEM_EVENTS.GAME_STARTED);
		};

		this.nextHand = function() {
			assignRoles();

			if (this.handNr) {
				this.handNr++;
			} else {
				this.handNr = 1;
			}

			// Tell the world about the new hand
			$rootScope.$broadcast(HOLDEM_EVENTS.NEXT_HAND_DEALT, this.handNr);
		};

		// Private utility functions
		function assignRoles() {
			if (!self.currentRoles) {
				// It's obviously the first hand,
				// assign initial roles
				if (self.players.length > 2) {
					self.currentRoles = {
						dealer: 0,
						smallBlind: 1,
						bigBlind: 2
					};
				} else {
					// Special rules for heads up
					self.currentRoles = {
						dealer: 0,
						smallBlind: 0,
						bigBlind: 1
					};
				}
			} else {
				// Shift all roles one player forward
				self.currentRoles = {
					dealer: (self.currentRoles.dealer + 1) % self.players.length,
					smallBlind: (self.currentRoles.smallBlind + 1) % self.players.length,
					bigBlind: (self.currentRoles.bigBlind + 1) % self.players.length
				};
			}

			// Tell the world about the newly assigned roles
			$rootScope.$broadcast(HOLDEM_EVENTS.ROLES_ASSIGNED, self.currentRoles);
		}
	}]);

	holdemServices.factory('uiService', [function() {
		return {

			successMessage: function(message) {
				alertify.success(message);
			},

			errorMessage: function(message) {
				alertify.error(message);
			},

			infoMessage: function(message) {
				alertify.info(message);
			},

			promptForInput: function(promptTxt, okBtnText, cancelBtnText, callback) {
				alertify.set({
					labels: {
						ok: okBtnText,
						cancel: cancelBtnText
					}
				});

				alertify.prompt(promptTxt, callback);
			}

		};
	}]);

})(window);
