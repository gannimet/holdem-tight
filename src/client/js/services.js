(function(window, undefined) {

	var holdemServices = angular.module('holdemServices', []);

	holdemServices.service('gameService', ['$rootScope', function($rootScope) {
		// Instance variables
		var self = this;
		this.players = [];
		this.gameStarted = false;
		this.currentRoles = null;
		
		// Public API
		this.addPlayer = function(player) {
			player.name = player.name || 'Player ' + (this.players.length + 1);
			player.stack = player.stack || 1500;

			this.players.push(player);

			// Tell the world about our new player
			$rootScope.$broadcast('playerAdded', this.players);
		};

		this.deletePlayer = function(playerIndex) {
			this.players.splice(playerIndex, 1);

			// Tell the world about the player we removed
			$rootScope.$broadcast('playerDeleted', this.players);
		};

		this.startGame = function() {
			this.gameStarted = true;

			assignTurns();

			// Tell the world about the start of the game
			$rootScope.$broadcast('gameStarted');
		};

		// Private utility functions
		function assignTurns() {
			if (!self.currentRoles) {
				self.currentRoles = {
					smallBlind: 0,
					bigBlind: 1 % self.players.length,
					dealer: 2 % self.players.length
				};
			} else {
				self.currentRoles = {
					smallBlind: (self.currentRoles.smallBlind + 1) % self.players.length,
					bigBlind: (self.currentRoles.bigBlind + 1) % self.players.length,
					dealer: (self.currentRoles.dealer + 1) % self.players.length
				};
			}

			// Tell the world about the newly assigned roles
			$rootScope.$broadcast('rolesAssigned', self.currentRoles);
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
