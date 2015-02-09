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

			assignRoles();

			// Tell the world about the start of the game
			$rootScope.$broadcast('gameStarted');
		};

		this.nextHand = function() {
			assignRoles();
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
