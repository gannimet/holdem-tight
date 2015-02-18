(function(window, undefined) {

	var holdemServices = angular.module('holdemServices', []);

	holdemServices.service('gameService',
			['$rootScope', 'HOLDEM_EVENTS', 'HOLDEM_ACTIONS', 'HOLDEM_BETTING_ROUNDS',
			function($rootScope, HOLDEM_EVENTS, HOLDEM_ACTIONS, HOLDEM_BETTING_ROUNDS) {
		// Instance variables
		var self = this;
		this.players = [];
		this.finishedPlayers = [];
		this.allHands = [];
		this.gameStarted = false;
		this.currentBettingRound = null;
		this.whoseTurnItIs = undefined;
		
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

		/**
		 * Whether the player with index playerIndex has already finished
		 */
		this.isPlayerFinished = function(playerIndex) {
			return this.finishedPlayers.indexOf(playerIndex) > -1;
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

		/**
		 * Add a new hand to the list, and make it "play ready",
		 * i.e. assign the roles, take the blinds, and post all the
		 * proper notifications
		 */
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
			assignTurn();

			// Tell the world about the new hand
			$rootScope.$broadcast(HOLDEM_EVENTS.NEXT_HAND_DEALT, newHandNr);
		};

		/**
		 * Advances play to the next betting round, if this is legal
		 * (i.e. if the previous betting round has been finished)
		 */
		this.advanceBettingRound = function() {
			if (!isCurrentBettingRoundFinished()) {
				throw 'Current betting round wasn\'t yet finished';
			}

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

		/**
		 * Returns the hand that is currently in play,
		 * or null if there isn't one
		 */
		this.getCurrentHand = function() {
			if (this.allHands.length < 1) {
				return null;
			}

			return this.allHands[this.allHands.length - 1];
		};

		/**
		 * Returns the hand that was played right before the
		 * current one
		 */
		this.getPreviousHand = function() {
			if (this.allHands.length < 2) {
				return null;
			}

			return this.allHands[this.allHands.length - 2];
		};

		/**
		 * Adds the action to the actions of the current hand,
		 * checking for validity first
		 */
		this.recordAction = function(action) {
			if (!action.player || !action.action) {
				throw 'No player or action given';
			}

			if (action.player !== this.whoseTurnItIs) {
				throw 'Player acted out of turn';
			}

			action.bettingRound = this.currentBettingRound;
			this.getCurrentHand().actions.push(action);

			// Tell the world about the action
			$rootScope.$broadcast(HOLDEM_EVENTS.ACTION_PERFORMED, action);

			// Move on to the next player
			assignTurn();
		};

		/**
		 * True, if the current betting round is finished and the next card
		 * can be dealt or a showdown can be performed respectively,
		 * false if there are still players to act in this betting round
		 */
		this.isCurrentBettingRoundFinished = function() {
			var thisRoundActions = getAllActionsOfCurrentBettingRound();
			var playerCommitments = collectPlayerCommitments(thisRoundActions);
			
			var referenceAmount;
			for (var playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
				if (playerCommitments.hasOwnProperty(playerIndex)) {
					// player has not folded and is not finished
					if (referenceAmount) {
						// we have a reference amount to compare with
						if (this.players[playerIndex].stack !== 0) {
							// and the player is NOT all in, so he
							// must have committed the referecne amount
							if (playerCommitments[playerIndex] !== referenceAmount) {
								// CONTRADICTION!
								return false;
							}
						}
					} else {
						// no reference amount yet, set to the
						// current player's commitment
						referenceAmount = playerCommitments[playerIndex];
					}
				}
			}

			// no contradiction found, so betting round is finished
			return true;
		};

		/**
		 * Returns the last performed action in the current hand
		 */
		this.getLastAction = function() {
			var currentHand = self.getCurrentHand();

			if (!currentHand.actions || !currentHand.actions.length) {
				throw 'No actions yet in current hand';
			}

			return currentHand.actions[currentHand.actions.length - 1];
		};

		// Private utility functions
		/**
		 * Assigns small blind, big blind and dealer position
		 * to the correct players, i.e. moves them on by one
		 * position compared to the previous hand, respecting already
		 * finished players
		 */
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

		/**
		 * Sets the instance variable whoseTurnItIs to the correct
		 * player, respecting already finished players and players
		 * who have already folded in this hand
		 */
		function assignTurn() {
			if (self.isCurrentBettingRoundFinished()) {
				self.whoseTurnItIs = earliestNonFinishedPlayer();
			} else {
				var playerWhoActedLast = self.getLastAction().player;

				self.whoseTurnItIs = nextNonFinishedPlayerAfter(playerWhoActedLast, false);
			}

			// Tell the world about the new player's turn
			$rootScope.$broadcast(HOLDEM_EVENTS.TURN_ASSIGNED, self.whoseTurnItIs);
		}

		/**
		 * Adds the forced blinds of the players in the roles of
		 * small blind and big blind to the actions of the current
		 * hand
		 */
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

		/**
		 * Returns the index of the player in the earliest position
		 * in the current hand that is not yet finished
		 */
		function earliestNonFinishedPlayer() {
			var currentHand = self.getCurrentHand();
			var smallBind = currentHand.roles.smallBlind;

			return nextNonFinishedPlayerAfter(smallBlind, true);
		}

		/**
		 * Returns the index of the next player that has not yet finished
		 * the game after the reference player
		 * @param {number} referencePlayer - index of the reference player
		 * @param {boolean} inclusive - whether or not referenceplayer should
		 * be considered as the possible next player
		 */
		function nextNonFinishedPlayerAfter(referencePlayer, inclusive) {
			var playerIndex;
			var exclusiveCorrection = inclusive ? 0 : 1;

			for (
					var i = referencePlayer + exclusiveCorrection;
					i < (referencePlayer + self.players.length - 1);
					i++
				) {
				playerIndex = i % self.players.length;
				if (!self.isPlayerFinished(playerIndex)) {
					return playerIndex;
				}
			}

			throw 'No unfinished player found';
		}

		/**
		 * Returns a list of all player's actions during the currently
		 * active betting round
		 */
		function getAllActionsOfCurrentBettingRound() {
			var allActions = self.getCurrentHand().actions;
			var result = [];

			for (var i = 0; i < allActions.length; i++) {
				if (allActions[i].bettingRound === self.currentBettingRound) {
					result.push(allActions[i]);
				}
			}

			return result;
		}

		/**
		 * Returns an object describing the total amount of chips committed
		 * by every player, if any
		 * @param {Array} actions - list of all actions for which to collect
		 * the players' commitments
		 * @return {Object} An object describing every player's commitments
		 * given the supplied list of actions, with the player's index as key
		 * and the total amount of chips as value. Players who folded do not
		 * appear in the result object
		 */
		function collectPlayerCommitments(actions) {
			var playerCommitments = {};

			var currentAction;
			for (var i = 0; i < actions.length; i++) {
				currentAction = actions[i];

				if (currentAction.action === HOLDEM_ACTIONS.FOLD) {
					// player is out of the hand
					delete playerCommitments[currentAction.player];
				} else if (currentAction.action === HOLDEM_ACTIONS.CHECK) {
					// a check is basically a bet of size 0
					playerCommitments[currentAction.player] = 0;
				} else {
					// Call, raise or bet

					if (playerCommitments.hasOwnProperty(currentAction.player)) {
						// player had already made commitment(s), add to them/it
						playerCommitments[currentAction.player] += currentAction.amount;
					} else {
						// no prior commitments, create new
						playerCommitments[currentAction.player] = currentAction.amount;
					}
				}
			}

			return playerCommitments;
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
