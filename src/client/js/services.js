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
				},
				foldedPlayers: [],
				actions: []
			});
			
			assignRoles();
			self.whoseTurnItIs = this.getCurrentHand().roles.smallBlind;
			recordBlindActions();

			// Tell the world about the new hand
			$rootScope.$broadcast(HOLDEM_EVENTS.NEXT_HAND_DEALT, newHandNr);
		};

		/**
		 * Advances play to the next betting round, if this is legal
		 * (i.e. if the previous betting round has been finished)
		 */
		this.advanceBettingRound = function() {
			if (!this.isCurrentBettingRoundFinished()) {
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

			// Somebody has to start acting in the new betting round
			assignTurn(true);
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
		this.recordAction = function(action, isSmallBlind) {
			if (!action.hasOwnProperty('player') || !action.action) {
				throw 'No player or action given';
			}

			if (action.player !== this.whoseTurnItIs) {
				throw 'Player acted out of turn';
			}

			if (action.action !== HOLDEM_ACTIONS.FOLD && action.action !== HOLDEM_ACTIONS.CHECK) {
				if (!action.hasOwnProperty('amount')) {
					throw 'No amount given in a non-fold/check action';
				}
			}

			var currentHand = this.getCurrentHand();
			if (action.action === HOLDEM_ACTIONS.FOLD) {
				// if player folded, add him to folded players
				currentHand.foldedPlayers.push(action.player);
			} else if (action.action === HOLDEM_ACTIONS.CALL) {
				// check whether this is a legal call
				if (!isCorrectCall(action)) {
					throw 'Invalid call';
				}
			} else if (action.action === HOLDEM_ACTIONS.BET) {
				// check whether this is a legal bet
				if (!isCorrectBet(action, isSmallBlind)) {
					throw 'Invalid bet';
				}
			} else if (action.action === HOLDEM_ACTIONS.RAISE) {
				// check whether this is a legal raise
				if (!isCorrectRaise(action)) {
					throw 'Invalid raise';
				}
			} else if (action.action === HOLDEM_ACTIONS.CHECK) {
				// check whether this is a legal check
				if (!isCorrectCheck(action)) {
					throw 'Invalid check';
				}
			}

			// Reduce player's stack by action.amount
			if (action.hasOwnProperty('amount')) {
				this.players[action.player].stack -= action.amount;
			}

			action.bettingRound = this.currentBettingRound;
			currentHand.actions.push(action);

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
			var numberOfActivePlayers = this.players.length - this.getCurrentHand().foldedPlayers.length;

			// Every player needs to have had at least one chance to
			// act in this hand
			if (thisRoundActions.length < numberOfActivePlayers) {
				return false;
			}

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
		 * @param {boolean} isNewBettingRound - whether we start a
		 * new betting round and the turn needs to be assigned for
		 * the first time in it
		 */
		function assignTurn(isNewBettingRound) {
			if (isNewBettingRound) {
				self.whoseTurnItIs = earliestNonFinishedPlayer();

				// Tell the world about the new player's turn
				$rootScope.$broadcast(HOLDEM_EVENTS.TURN_ASSIGNED, self.whoseTurnItIs);
				return;
			}

			if (self.isCurrentBettingRoundFinished()) {
				// The turn will be assigned when the betting round
				// is advanced
				self.whoseTurnItIs = undefined;
			} else {
				var playerWhoActedLast = self.getLastAction().player;
				self.whoseTurnItIs = nextNonFinishedPlayerAfter(playerWhoActedLast, false);

				// Tell the world about the new player's turn
				$rootScope.$broadcast(HOLDEM_EVENTS.TURN_ASSIGNED, self.whoseTurnItIs);
			}
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
				amount: currentHand.blinds.smallBlind
			};

			var bigBlindAction = {
				player: currentHand.roles.bigBlind,
				action: HOLDEM_ACTIONS.RAISE,
				amount: currentHand.blinds.bigBlind
			};

			self.recordAction(smallBlindAction, true);
			self.recordAction(bigBlindAction);
		}

		/**
		 * Returns the index of the player in the earliest position
		 * in the current hand that is not yet finished
		 */
		function earliestNonFinishedPlayer() {
			var currentHand = self.getCurrentHand();
			var smallBlind = currentHand.roles.smallBlind;

			return nextNonFinishedPlayerAfter(smallBlind, true);
		}

		/**
		 * Returns the index of the next player that has not yet finished
		 * the game or folded the current hand after the reference player
		 * @param {number} referencePlayer - index of the reference player
		 * @param {boolean} inclusive - whether or not referenceplayer should
		 * be considered as the possible next player
		 */
		function nextNonFinishedPlayerAfter(referencePlayer, inclusive) {
			var playerIndex;
			var exclusiveCorrection = inclusive ? 0 : 1;
			var currentHand = self.getCurrentHand();

			for (
					var i = referencePlayer + exclusiveCorrection;
					i < (referencePlayer + self.players.length);
					i++
				) {
				playerIndex = i % self.players.length;
				if (!self.isPlayerFinished(playerIndex) &&
						currentHand.foldedPlayers.indexOf(playerIndex) < 0) {
					return playerIndex;
				}
			}

			throw 'No unfinished player found';
		}

		/**
		 * Returns a list of all player's actions during the currently
		 * active betting round
		 */
		function getAllActionsOfCurrentBettingRound(type) {
			var allActions = self.getCurrentHand().actions;
			var result = [];

			for (var i = 0; i < allActions.length; i++) {
				if (allActions[i].bettingRound === self.currentBettingRound) {
					if (type) {
						// Action type restriction given
						if (Array.isArray(type)) {
							// we were given a list of possible types
							if (type.indexOf(allActions[i].action) > -1) {
								result.push(allActions[i]);
							}
						} else {
							// we assume it's just one type, not a list
							if (allActions[i].action === type) {
								result.push(allActions[i]);
							}
						}
					} else {
						result.push(allActions[i]);
					}
				}
			}

			return result;
		}

		/**
		 * Returns an object describing the total amount of chips committed
		 * by every player, if any, over all actions in the supplied list
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

		/**
		 * Returns the biggest commitment in the supplied list of commitments
		 * @return {Object} An object describing the biggest commitment
		 * within the supplied list of commitments, with the player index as
		 * key and the committed amount as the value
		 */
		function getBiggestCommitment(commitments) {
			var maxCommitment;

			var currentAmount;
			for (var player in commitments) {
				if (commitments.hasOwnProperty(player)) {
					currentAmount = commitments[player];
					
					if (!maxCommitment || currentAmount > maxCommitment.amount) {
						// if maxCommitment wasn't set before OR
						// the current one is bigger, override it
						maxCommitment = {
							player: player,
							amount: currentAmount
						};
					}
				}
			}

			return maxCommitment;
		}

		/**
		 * Whether the supplied call was a correct action in the current situation
		 * of play. Takes into account the amount called, whether the player
		 * is all in and therefore perhaps can't call the required amount and
		 * whether a call was even a possible action
		 * @return {boolean} whether or not the call was correct
		 */
		function isCorrectCall(call) {
			if (call.action !== HOLDEM_ACTIONS.CALL) {
				return false;
			}

			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());
			var biggestCommitment = getBiggestCommitment(playerCommitments);

			if (call.player == biggestCommitment.player) {
				// the raiser is now the caller?
				// something's not quite right here
				return false;
			}

			var previousCallerCommitment = playerCommitments[call.player] || 0;
			if (self.players[call.player].stack === call.amount) {
				// this call puts the player all in, so it's fine
				return true;
			} else {
				// he's not all in with this call, so he has to call
				// the exact difference to the biggest commitment
				if (call.amount == (biggestCommitment.amount - previousCallerCommitment)) {
					return true;
				}
			}

			// Call was incorrect
			return false;
		}

		/**
		 * Whether the supplied bet was a correct action in the current situation
		 * of play. Takes into account the previous actions in the current betting
		 * round, the big blind and the stack of the player who makes the bet.
		 * @return {boolean} whether or not the bet was correct
		 */
		function isCorrectBet(bet, isSmallBlind) {
			if (bet.action !== HOLDEM_ACTIONS.BET) {
				return false;
			}

			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());
			var biggestCommitment = getBiggestCommitment(playerCommitments);
			
			if (!biggestCommitment || biggestCommitment.amount === 0) {
				// no bet yet
				if (bet.amount >= self.getCurrentHand().blinds.bigBlind) {
					// bet has at least the size of the big blind
					
					// bet may not exceed player's stack size
					return bet.amount <= self.players[bet.player].stack;
				} else {
					// bet less than the big blind, this is only legal
					// if it is a small blind bet …
					if (isSmallBlind) {
						return bet.player === self.getCurrentHand().roles.smallBlind;
					}
					// … or, if it is an all in bet
					return bet.amount === self.players[bet.player].stack;
				}
			}

			return false;
		}

		/**
		 * 
		 */
		function isCorrectRaise(raise) {
			if (raise.action !== HOLDEM_ACTIONS.RAISE) {
				return false;
			}

			var allBetsAndRaises = getAllActionsOfCurrentBettingRound([
				HOLDEM_ACTIONS.BET, HOLDEM_ACTIONS.RAISE]);
			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());

			if (allBetsAndRaises.length > 0) {
				// there has been at least one bet
				if (raise.amount === self.players[raise.player].stack) {
					// player is all in, in which case it is legal
					// to raise by less than the min raise, as long as
					// it is still more than the previous bet/raise
					var lastRaiseOrBet = allBetsAndRaises[allBetsAndRaises.length - 1];
					var lastRaiserOrBetterCommitment = playerCommitments[lastRaiseOrBet.player];
					var ourHypotheticalTotalCommitment = playerCommitments[raise.player] + raise.amount;

					return ourHypotheticalTotalCommitment > lastRaiserOrBetterCommitment;
				}
			} else {
				// not even a bet yet, so this can't be a raise
				return false;
			}

			if (allBetsAndRaises.length === 1) {
				// only one bet so far, this means our raise
				// has to be double the amount of that bet
				if (raise.amount >= 2 * allBetsAndRaises[0].amount) {
					// raise was big enough
					if (raise.amount <= self.players[raise.player].stack) {
						// but smaller than the player's stack
						// looks ok
						return true;
					}
				}
			} else if (allBetsAndRaises.length > 1) {
				// there was at least a bet and a raise, possibly re-raises
				var lastRaise = allBetsAndRaises[allBetsAndRaises.length - 1];
				var secondToLastRaiseOrBet = allBetsAndRaises[allBetsAndRaises.length - 2];

				// get absolute commitments by previous two raisers/betters
				var lastRaiserCommitment = playerCommitments[lastRaise.player];
				var secondToLastRaiserCommitment = playerCommitments[secondToLastRaiseOrBet.player];

				// the difference between these two total commitment is the
				// minimum amount to raise
				var minRaise = lastRaiserCommitment - secondToLastRaiserCommitment;
				var hypotheticalPlayerCommitmentWithThisRaise =
					(playerCommitments[raise.player] || 0) + raise.amount;
				var raiseSize = hypotheticalPlayerCommitmentWithThisRaise - lastRaiserCommitment;

				return raiseSize >= minRaise;
			}

			return false;
		}

		/**
		 * Whether the supplied check was a correct action in the current situation
		 * of play. Takes into account the previous actions in the current betting
		 * round.
		 * @return {boolean} whether or not the check was correct
		 */
		function isCorrectCheck(check) {
			if (check.action !== HOLDEM_ACTIONS.CHECK) {
				return false;
			}

			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());
			var biggestCommitment = getBiggestCommitment(playerCommitments);

			if (!biggestCommitment || biggestCommitment.amount === 0) {
				// no one has committed any chips yet
				// looks good to check
				return true;
			}

			return false;
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
