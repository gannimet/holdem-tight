(function(window, undefined) {

	var holdemServices = angular.module('holdemServices', []);

	holdemServices.service('gameService',
			['$rootScope', 'HOLDEM_EVENTS', 'HOLDEM_ACTIONS', 'HOLDEM_BETTING_ROUNDS',
			function($rootScope, HOLDEM_EVENTS, HOLDEM_ACTIONS, HOLDEM_BETTING_ROUNDS) {
		// Instance variables
		var self = this;
		this.players = [];
		this.allHands = [];
		this.gameStarted = false;
		this.currentBettingRound = null;
		
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
			this.currentBettingRound = HOLDEM_BETTING_ROUNDS.PRE_FLOP;
			this.nextHand();

			// Tell the world about the start of the game, and
			// therefore the new betting round
			$rootScope.$broadcast(HOLDEM_EVENTS.GAME_STARTED);
			$rootScope.$broadcast(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, this.currentBettingRound);
		};

		this.nextHand = function() {
			var newHandNr = this.allHands.length + 1;

			this.allHands.push({
				handNr: newHandNr,
				blinds: {
					smallBlind: 10,
					bigBlind: 20
				}
			});
			
			assignRoles();
			recordBlindActions();

			// Tell the world about the new hand
			$rootScope.$broadcast(HOLDEM_EVENTS.NEXT_HAND_DEALT, newHandNr);
		};

		this.advanceBettingRound = function() {
			switch (this.currentBettingRound) {
				case HOLDEM_BETTING_ROUNDS.PRE_FLOP:
					this.currentBettingRound = HOLDEM_BETTING_ROUNDS.FLOP;
					break;
				case HOLDEM_BETTING_ROUNDS.FLOP:
					this.currentBettingRound = HOLDEM_BETTING_ROUNDS.TURN;
					break;
				case HOLDEM_BETTING_ROUNDS.TURN:
					this.currentBettingRound = HOLDEM_BETTING_ROUNDS.RIVER;
					break;
				case HOLDEM_BETTING_ROUNDS.RIVER:
					throw 'There is no betting round after the river';
			}

			// Tell the world about the new betting round
			$rootScope.$broadcast(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, this.currentBettingRound);
		};

		this.getCurrentHand = function() {
			if (this.allHands.length < 1) {
				return null;
			}

			return this.allHands[this.allHands.length - 1];
		};

		this.getPreviousHand = function() {
			if (this.allHands.length < 2) {
				return null;
			}

			return this.allHands[this.allHands.length - 2];
		};

		this.recordAction = function(action) {
			if (!action.player || !action.action) {
				return false;
			}

			action.bettingRound = this.currentBettingRound;
			getCurrentHand().actions.push(action);

			// Tell the world about the action
			$rootScope.$broadcast(HOLDEM_EVENTS.ACTION_PERFORMED, action);
		};

		// Private utility functions
		function assignRoles() {
			var currentHand = self.getCurrentHand();
			var previousHand = self.getPreviousHand();

			if (!previousHand) {
				// It's obviously the first hand,
				// assign initial roles
				if (self.players.length > 2) {
					currentHand.roles = {
						dealer: 0,
						smallBlind: 1,
						bigBlind: 2
					};
				} else {
					// Special rules for heads up
					currentHand.roles = {
						dealer: 0,
						smallBlind: 0,
						bigBlind: 1
					};
				}
			} else {
				// Shift all roles one player forward
				currentHand.roles = {
					dealer: (previousHand.roles.dealer + 1) % self.players.length,
					smallBlind: (previousHand.roles.smallBlind + 1) % self.players.length,
					bigBlind: (previousHand.roles.bigBlind + 1) % self.players.length
				};
			}

			// Tell the world about the newly assigned roles
			$rootScope.$broadcast(HOLDEM_EVENTS.ROLES_ASSIGNED, currentHand.roles);
		}

		function recordBlindActions() {
			var currentHand = self.getCurrentHand();

			var smallBlindAction = {
				player: currentHand.roles.smallBlind,
				action: HOLDEM_ACTIONS.BET,
				amount: currentHand.blinds.smallBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			};

			var bigBlindAction = {
				player: currentHand.roles.bigBlind,
				action: HOLDEM_ACTIONS.RAISE,
				amount: currentHand.blinds.bigBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			};

			currentHand.actions = [smallBlindAction, bigBlindAction];

			// Tell the world about these two actions
			$rootScope.$broadcast(HOLDEM_EVENTS.ACTION_PERFORMED, smallBlindAction);
			$rootScope.$broadcast(HOLDEM_EVENTS.ACTION_PERFORMED, bigBlindAction);
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
