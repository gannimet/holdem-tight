(function(window, undefined) {
	
	var holdemServices = angular.module('holdemServices');

	holdemServices.service('gameService',
			['$rootScope', 'HOLDEM_EVENTS', 'HOLDEM_ACTIONS', 'HOLDEM_BETTING_ROUNDS', 'cardService',
			function($rootScope, HOLDEM_EVENTS, HOLDEM_ACTIONS, HOLDEM_BETTING_ROUNDS, cardService) {
		// Instance variables
		var self = this;
		this.players = [];
		this.finishedPlayers = [];
		this.allHands = [];
		this.gameStarted = false;
		this.gameFinished = false;
		this.currentBettingRound = null;
		this.whoseTurnItIs = undefined;
		this.currentBlinds = {
			smallBlind: 10,
			bigBlind: 20
		};
		
		// Public API
		this.addPlayer = function(player) {
			if (this.gameStarted) {
				return false;
			}

			player = player || {};
			player.name = player.name || 'Player ' + (this.players.length + 1);
			player.stack = player.stack || 1500;

			this.players.push(player);

			// Tell the world about our new player
			$rootScope.$broadcast(HOLDEM_EVENTS.PLAYER_ADDED, this.players);
		};

		this.deletePlayer = function(playerIndex) {
			if (this.gameStarted) {
				return false;
			}

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

		/**
		 * Starts a game of no limit hold'em. Creates a first hand
		 * and notifies listeners about game start and the first
		 * betting round
		 */
		this.startGame = function() {
			this.gameStarted = true;
			this.currentBettingRound = HOLDEM_BETTING_ROUNDS.PRE_FLOP;

			// Tell the world about the start of the game
			$rootScope.$broadcast(HOLDEM_EVENTS.GAME_STARTED);

			this.nextHand();
		};

		/**
		 * Add a new hand to the list, and make it "play ready",
		 * i.e. assign the roles, take the blinds, and post all the
		 * proper notifications
		 */
		this.nextHand = function() {
			if (this.gameFinished) {
				throw 'Game already finished';
			}

			var newHandNr = this.allHands.length + 1;
			var commitments = {};
			this.currentBettingRound = HOLDEM_BETTING_ROUNDS.PRE_FLOP;

			// initialize every player commitment with 0
			for (var i = 0; i < this.players.length; i++) {
				if (this.finishedPlayers.indexOf(i) < 0) {
					commitments[i] = 0;
				}
			}

			var pot = {
				amount: 0,
				commitments: commitments
			};

			this.allHands.push({
				handNr: newHandNr,
				blinds: this.currentBlinds,
				foldedPlayers: [],
				actions: [],
				board: {
					flop: [null, null, null],
					turn: null,
					river: null
				},
				holeCards: [],
				pot: pot
			});
			
			// Tell the world about the new hand
			$rootScope.$broadcast(HOLDEM_EVENTS.NEXT_HAND_DEALT, newHandNr);
			$rootScope.$broadcast(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, this.currentBettingRound);
			
			assignRoles();
			self.whoseTurnItIs = this.getCurrentHand().roles.smallBlind;
			recordBlindActions();
		};

		/**
		 * Returns the hole cards of the player specified by playerIndex in the current hand
		 * @param {Integer} playerIndex - index of player whose cards shall be retrieved
		 */
		this.getHoleCardsOfPlayerInCurrentHand = function(playerIndex) {
			if (!this.gameStarted || !this.getCurrentHand()) {
				throw 'Game not started yet';
			}

			var holeCardsInCurrentHand = this.getCurrentHand().holeCards;

			for (var i = 0; i < holeCardsInCurrentHand.length; i++) {
				if (holeCardsInCurrentHand[i].player === playerIndex) {
					return holeCardsInCurrentHand[i].cards;
				}
			}
		};

		/**
		 * Assign hole cards to a player in the current hand
		 * @param {Integer} playerIndex - index of player to assign cards to
		 * @param {Object} card1 - card object with rank and suit
		 * @param {Object} card2 - card object with rank and suit
		 */
		this.assignHoleCardsToPlayer = function(playerIndex, card1, card2) {
			if (!card1 || !card2) {
				throw {
					message: 'Both cards need to be defined.'
				};
			}

			if (!this.gameStarted || !this.getCurrentHand()) {
				throw {
					message: 'Game not started yet.'
				};
			}

			if (this.isPlayerFinished(playerIndex)) {
				throw {
					message: this.players[playerIndex].name + ' is already finished.'
				};
			}

			if (cardService.areCardsEqual(card1, card2)) {
				throw {
					message: 'Cards have to be different.'
				};
			}

			if (isCardUsedInCurrentHand(card1, { place: 'hole', player: playerIndex })) {
				throw {
					message: card1.rank + ' of ' + card1.suit + ' is already in use in this hand.'
				};
			}

			if (isCardUsedInCurrentHand(card2, { place: 'hole', player: playerIndex })) {
				throw {
					message: card2.rank + ' of ' + card2.suit + ' is already in use in this hand.'
				};
			}

			// player could already have hole cards assigned
			var oldHoleCards = this.getHoleCardsOfPlayerInCurrentHand(playerIndex);
			if (oldHoleCards) {
				// Remove existing elements
				oldHoleCards.length = 0;
				// Add new ones
				oldHoleCards.push(card1);
				oldHoleCards.push(card2);
			} else {
				this.getCurrentHand().holeCards.push({
					player: playerIndex,
					cards: [card1, card2]
				});
			}

			// Tell the world about the assigned hole card
			$rootScope.$broadcast(HOLDEM_EVENTS.HOLE_CARD_ASSIGNED, playerIndex, [card1, card2]);
		};

		/**
		 * Get flop cards associated with current hand
		 * @return {Object[]} list of card objects in the flop. Elements of that list
		 * can be null
		 * @throws if game is not yet started or there is no current hand
		 */
		this.getFlopCardsInCurrentHand = function() {
			if (!this.gameStarted || !this.getCurrentHand()) {
				throw 'Game not started yet';
			}

			return this.getCurrentHand().board.flop;
		};

		/**
		 * Assign three card objects (possibly null) as flop cards of the current hand.
		 * @throws if game is not yet started or there is no current hand
		 */
		this.assignFlopCards = function(card1, card2, card3) {
			if (!this.gameStarted || !this.getCurrentHand()) {
				throw {
					message: 'Game not started yet.'
				};
			}

			if (cardService.areCardsEqual(card1, card2) ||
					cardService.areCardsEqual(card2, card3) ||
					cardService.areCardsEqual(card1, card3)) {
				throw {
					message: 'All cards have to be mutually different.'
				};
			}

			if (isCardUsedInCurrentHand(card1, { place: 'flop' })) {
				throw {
					message: card1.rank + ' of ' + card1.suit + ' is already in use in current hand.'
				};
			}

			if (isCardUsedInCurrentHand(card2, { place: 'flop' })) {
				throw {
					message: card2.rank + ' of ' + card2.suit + ' is already in use in current hand.'
				};
			}

			if (isCardUsedInCurrentHand(card3, { place: 'flop' })) {
				throw {
					message: card3.rank + ' of ' + card3.suit + ' is already in use in current hand.'
				};
			}

			this.getCurrentHand().board.flop = [card1, card2, card3];

			// Tell the world about the new flop
			$rootScope.$broadcast(HOLDEM_EVENTS.FLOP_CARDS_ASSIGNED, [card1, card2, card3]);
		};

		/**
		 * Get turn card associated with current hand
		 * @return {Object} turn card (possibly null)
		 * @throws if game is not yet started or there is no current hand
		 */
		this.getTurnCardInCurrentHand = function() {
			if (!this.gameStarted || !this.getCurrentHand) {
				throw 'Game not started yet';
			}

			return this.getCurrentHand().board.turn;
		};

		/**
		 * Assign card object (possibly null) as turn card of the current hand.
		 * @throws if game is not yet started or there is no current hand
		 */
		this.assignTurnCard = function(card) {
			if (!this.gameStarted || !this.getCurrentHand()) {
				throw {
					message: 'Game not started yet.'
				};
			}

			if (isCardUsedInCurrentHand(card, { place: 'turn' })) {
				throw {
					message: card.rank + ' of ' + card.suit + ' is already in use in current hand.'
				};
			}

			this.getCurrentHand().board.turn = card;

			// Tell the world about the new flop
			$rootScope.$broadcast(HOLDEM_EVENTS.TURN_CARD_ASSIGNED, card);
		};

		/**
		 * Get river card associated with current hand
		 * @return {Object} river card (possibly null)
		 * @throws if game is not yet started or there is no current hand
		 */
		this.getRiverCardInCurrentHand = function() {
			if (!this.gameStarted || !this.getCurrentHand) {
				throw 'Game not started yet';
			}

			return this.getCurrentHand().board.river;
		};

		/**
		 * Assign card object (possibly null) as river card of the current hand.
		 * @throws if game is not yet started or there is no current hand
		 */
		this.assignRiverCard = function(card) {
			if (!this.gameStarted || !this.getCurrentHand()) {
				throw {
					message: 'Game not started yet.'
				};
			}

			if (isCardUsedInCurrentHand(card, { place: 'river' })) {
				throw {
					message: card.rank + ' of ' + card.suit + ' is already in use in current hand.'
				};
			}

			this.getCurrentHand().board.river = card;

			// Tell the world about the new flop
			$rootScope.$broadcast(HOLDEM_EVENTS.RIVER_CARD_ASSIGNED, card);
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
			if (!this.doesHandRequireMoreAction() || this.isCurrentBettingRoundFinished()) {
				throw 'No more action required in this hand or betting round';
			}

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

			// Reduce player's stack by action.amount and add it to the pot
			if (action.hasOwnProperty('amount')) {
				this.players[action.player].stack -= action.amount;

				currentHand.pot.amount += action.amount;
				currentHand.pot.commitments[action.player] += action.amount;
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
			var thisRoundFolds = getAllActionsOfCurrentBettingRound(HOLDEM_ACTIONS.FOLD);

			var numberOfActivePlayers = this.players.length -
				this.finishedPlayers.length - this.getCurrentHand().foldedPlayers.length +
				thisRoundFolds.length;

			// Every player needs to have had at least one chance to
			// act in this hand (and blind actions pre-flop don't count)
			if (this.currentBettingRound === HOLDEM_BETTING_ROUNDS.PRE_FLOP) {
				if ((thisRoundActions.length - 2) < numberOfActivePlayers) {
					return false;
				}
			} else {
				if (thisRoundActions.length < numberOfActivePlayers) {
					return false;
				}
			}

			var playerCommitments = collectPlayerCommitments(thisRoundActions);
			var biggestCommitment = getBiggestCommitment(playerCommitments);

			for (var playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
				if (playerCommitments.hasOwnProperty(playerIndex)) {
					// player has not folded and is not finished
					if (this.players[playerIndex].stack !== 0) {
						// and the player is NOT all in, so he
						// must have committed the same amount as
						// the biggest commitment
						if (playerCommitments[playerIndex] !== biggestCommitment.amount) {
							// CONTRADICTION!
							return false;
						}
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

		/**
		 * Whether more betting action is required in the current hand.
		 * @return {boolean} true, if at least two players with chips
		 * are left in the hand
		 */
		this.doesHandRequireMoreAction = function() {
			// the betting round has to be finished first
			if (!this.isCurrentBettingRoundFinished()) {
				return true;
			}

			if (this.currentBettingRound === HOLDEM_BETTING_ROUNDS.RIVER &&
					this.isCurrentBettingRoundFinished()) {
				return false;
			}

			// there need to be at least two players with chips left
			// in the hand

			var playersInHand = this.players.reduce(function(playersLeft, player, playerIndex) {
				if (self.getCurrentHand().foldedPlayers.indexOf(playerIndex) < 0) {
					// player has not folded
					playersLeft.push(playerIndex);
				}

				return playersLeft;
			}, []);

			if (playersInHand.length < 2) {
				return false;
			}

			var playersWithChips = 0;
			for (var i = 0; i < playersInHand.length; i++) {
				if (this.players[playersInHand[i]].stack > 0) {
					playersWithChips++;
				}

				if (playersWithChips >= 2) {
					return true;
				}
			}

			return false;
		};

		this.doesHandRequireShowdown = function() {
			// if there is more action required
			if (this.doesHandRequireMoreAction()) {
				return false;
			}

			// there need to be at least two players left
			// in the hand
			var numberOfNonFinishedPlayers = this.players.length - this.finishedPlayers.length;
			var numberOfNonFoldedPlayers = numberOfNonFinishedPlayers - this.getCurrentHand().foldedPlayers.length;

			return numberOfNonFoldedPlayers >= 2;
		};

		/**
		 * Distributes the money in all the current side pots based on the
		 * supplied player ranking
		 * @param {Integer[]} playerRanking - list of player indices representing
		 * the player ranking. The earlier an index appears in the list, the
		 * better that player is ranked. If there is a tie, this should be
		 * indicated through a list of indices at that position. For example:
		 * the player ranking [2, [1, 4], 0] means that player 2 has the best hand,
		 * in second place it's a tie between 1 and 4, and 0 has the worst hand
		 */
		this.resolveCurrentHandByShowdown = function(playerRanking) {
			if (this.doesHandRequireMoreAction()) {
				throw 'Hand requires more action';
			}

			if (!this.doesHandRequireShowdown()) {
				throw 'Hand requires no showdown';
			}

			var sidePots = this.convertToSidePots(this.getCurrentHand().pot);

			// collct all the payments first before we actually increase the stacks
			var payments = [];

			for (var potIndex = 0; potIndex < sidePots.length; potIndex++) {
				var eligiblePlayers = sidePots[potIndex].eligiblePlayers;
				var potPaidOut = false;

				for (var rankingIndex = 0; rankingIndex < playerRanking.length; rankingIndex++) {
					if (!potPaidOut) {
						// there is still money to distribute in this pot
						if (Array.isArray(playerRanking[rankingIndex])) {
							// there is a tie in this spot
							var tie = playerRanking[rankingIndex];

							// collect all players in the tie that are eligible
							var tieWinners = [];
							for (var tieIndex = 0; tieIndex < tie.length; tieIndex++) {
								if (eligiblePlayers.indexOf(tie[tieIndex])) {
									// current tie candidate is eligible
									tieWinners.push(tie[tieIndex]);
								}
							}

							if (tieWinners.length > 0) {
								// we have (a) winner(s)
								var moneyForEach = sidePots[potIndex].amount / tieWinners.length;

								// distribute the money
								for (var winnerIndex = 0; winnerIndex < tieWinners.length; winnerIndex++) {
									payments.push({
										player: tieWinners[winnerIndex],
										amount: moneyForEach
									});
								}
								potPaidOut = true;
							}
						} else {
							// no tie in this position
							// current candidate to win this pot
							var rankedPlayer = playerRanking[rankingIndex];
							
							if (eligiblePlayers.indexOf(rankedPlayer) >= 0) {
								// player is eligible for this pot, so pay him out
								payments.push({
									player: rankedPlayer,
									amount: sidePots[potIndex].amount
								});
								potPaidOut = true;
							}
						}
					}
				}

				if (!potPaidOut) {
					// went through all ranked players and still the pot wasn't paid out
					throw 'Insufficient ranking. Side pot #' + potIndex + ' could not be paid out.';
				}
			}

			// Now that no errors were thrown, perform the actual payments
			this.getCurrentHand().payments = payments;
			for (var i = 0; i < payments.length; i++) {
				var payment = payments[i];

				payPlayer(payment.player, payment.amount);
			}

			finaliseHand();
		};

		this.resolveCurrentHandWithoutShowdown = function() {
			if (this.doesHandRequireMoreAction()) {
				throw 'Hand requires more action';
			}

			if (this.doesHandRequireShowdown()) {
				throw 'Hand requires showdown';
			}

			// there should only be one non-folded player left
			// find him
			var nonFoldedPlayers = [];
			for (var playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
				if (this.finishedPlayers.indexOf(playerIndex) < 0) {
					// player is not finished, so still active
					if (this.getCurrentHand().foldedPlayers.indexOf(playerIndex) < 0) {
						// player has also not folded
						nonFoldedPlayers.push(playerIndex);
					}
				}
			}

			if (nonFoldedPlayers.length !== 1) {
				throw 'Zero or more than one player have not folded, cannot resolve hand';
			}

			var winnerIndex = nonFoldedPlayers[0];
			var sidePots = this.convertToSidePots(this.getCurrentHand().pot);
			var payments = [];
			for (var potIndex = 0; potIndex < sidePots.length; potIndex++) {
				var sidePot = sidePots[potIndex];

				if (sidePot.eligiblePlayers.indexOf(winnerIndex) < 0) {
					// winner is not eligible?
					// this should not be possible
					throw 'Only non-folded player does not appear in eligible players';
				}

				payments.push({
					player: winnerIndex,
					amount: sidePot.amount
				});
			}

			// no errors detected, pay out winner
			for (var i = 0; i < payments.length; i++) {
				var payment = payments[i];
				payPlayer(payment.player, payment.amount);
			}

			finaliseHand();
		};

		/**
		 * Converts the supplied pot (as the current hand records it) into a
		 * list of side pots, each containing an amount and a list of player
		 * indices between which the pot will be played.
		 * @param {Object} wholePot - the pot as it is recorded in the pot
		 * attribute of a hand
		 * @param {Number} wholePot.amount - Total pot amount
		 * @param {Object} wholePot.commitments - Object describing which player
		 * (index as key) as commited which amount (amount as value) to the pot
		 * @return {Object[]} list of side pots, each with an amount and a list
		 * of eligible players
		 */
		this.convertToSidePots = function(wholePot) {
			var foldedPlayers = this.getCurrentHand().foldedPlayers;
			// collect all 'vertical lines' within the diagram
			var commitmentValues = collectUniqueCommitmentValuesOfNonFoldedPlayers(
				wholePot, foldedPlayers
			);
			commitmentValues.push(0);

			var numberOfPots = commitmentValues.length - 1;
			// sort commitmentValues ascending
			commitmentValues.sort(function(a, b) {
				return a - b;
			});

			// Create the proper number of pots
			var sidePots = [];
			for (var i = 0; i < numberOfPots; i++) {
				sidePots.push({
					amount: 0,
					eligiblePlayers: []
				});
			}

			for (var potIndex = 0; potIndex < numberOfPots; potIndex++) {
				// for each pot …
				for (var playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
					// for each player …
					if (wholePot.commitments.hasOwnProperty(playerIndex)) {
						// add the money 'between the lines' to the current side pot

						// calculate amount of money player put into the pot
						// between those two lines and add this money to the
						// current side pot
						sidePots[potIndex].amount += Math.max(
							Math.max(
								Math.min(
									wholePot.commitments[playerIndex],
									commitmentValues[potIndex + 1]
								),
								0
							) - commitmentValues[potIndex],
							0
						);
						
						// and if the player hasn't folded and has committed money
						// beyond the lower 'line', also add him to the eligible players
						if (foldedPlayers.indexOf(playerIndex) < 0 &&
								wholePot.commitments[playerIndex] > commitmentValues[potIndex]) {
							sidePots[potIndex].eligiblePlayers.push(playerIndex);
						}
					}
				}
			}

			return sidePots;
		};

		this.getAmountToCallForPlayer = function(player) {
			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());
			var biggestCommitment = getBiggestCommitment(playerCommitments);

			if (!biggestCommitment) {
				return false;
			}

			if (player == biggestCommitment.player) {
				// the raiser is now the caller?
				// something's not quite right here
				return false;
			}

			if (biggestCommitment.amount === 0) {
				// there was no bet yet, so there can
				// not be a call now
				return false;
			}

			var previousCallerCommitment = playerCommitments[player] || 0;
			return Math.min(
				this.players[player].stack,
				biggestCommitment.amount - previousCallerCommitment
			);
		};

		this.getAmountToMinRaiseForPlayer = function(player) {
			var allBetsAndRaises = getAllActionsOfCurrentBettingRound([
				HOLDEM_ACTIONS.BET, HOLDEM_ACTIONS.RAISE]);
			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());
			var ourStack = this.players[player].stack;

			if (allBetsAndRaises.length === 0) {
				// no bet yet, must min bet the big blind
				// (or less if it's an all in)
				return Math.min(
					ourStack,
					this.getCurrentHand().blinds.bigBlind
				);
			}

			// there has been at least one bet,
			// if we are the last raiser, there's no point in raising again
			var lastRaise = allBetsAndRaises[allBetsAndRaises.length - 1];
			if (player === lastRaise.player) {
				return false;
			}

			if (allBetsAndRaises.length === 1) {
				// only one bet so far, so either double
				// it or move all in with less
				var lastBet = allBetsAndRaises[0];
				return Math.min(
					ourStack,
					lastBet.amount * 2
				);
			} else {
				// at least a bet and a raise so far
				// either double the raise or shove
				var secondToLastRaiseOrBet = allBetsAndRaises[allBetsAndRaises.length - 2];

				// get absolute commitments by previous two raisers/betters
				var lastRaiserCommitment = playerCommitments[lastRaise.player];
				var secondToLastRaiserCommitment = playerCommitments[secondToLastRaiseOrBet.player];
				var ourCommitment = playerCommitments[player] || 0;

				var bigBlind = this.getCurrentHand().blinds.bigBlind;
				var minRaise = lastRaiserCommitment +
					Math.max(lastRaiserCommitment - secondToLastRaiserCommitment, bigBlind) -
					ourCommitment;

				if ((minRaise + ourCommitment) <= lastRaiserCommitment ||
						(ourStack + ourCommitment) <= lastRaiserCommitment) {
					// it wouldn't even be a raise at all
					return false;
				}

				return Math.min(
					ourStack,
					minRaise
				);
			}
		};

		this.isCheckingAnOptionForPlayer = function(player) {
			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());
			var biggestCommitment = getBiggestCommitment(playerCommitments);

			if (!biggestCommitment || biggestCommitment.amount === 0) {
				// no one has committed any chips yet
				// looks good to check
				return true;
			}

			// it is also OK to check if you already committed the biggest amount
			if (playerCommitments[player] === biggestCommitment.amount) {
				return true;
			}

			return false;
		};

		this.isBettingAnOptionForPlayer = function(player) {
			var playerCommitments = collectPlayerCommitments(getAllActionsOfCurrentBettingRound());
			var biggestCommitment = getBiggestCommitment(playerCommitments);

			return !biggestCommitment || biggestCommitment.amount === 0;
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
				var isHeadsUp = (self.players.length - self.finishedPlayers.length) === 2;
				var dealerPosition = nextNonFinishedPlayerAfter(previousHand.roles.dealer, false);
				var smallBlindPosition = nextNonFinishedPlayerAfter(dealerPosition, isHeadsUp);
				var bigBlindPosition = nextNonFinishedPlayerAfter(smallBlindPosition, false);

				currentHand.roles = {
					dealer: dealerPosition,
					smallBlind: smallBlindPosition,
					bigBlind: bigBlindPosition
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
				var numberOfActivePlayers = self.players.length - self.finishedPlayers.length;

				if (numberOfActivePlayers > 2) {
					self.whoseTurnItIs = earliestNonFinishedPlayer();
				} else {
					// special rule for heads up: the big blind
					// starts to act post-flop
					self.whoseTurnItIs = nextNonFinishedPlayerAfter(
						self.getCurrentHand().roles.smallBlind, false);
				}

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

				if (currentAction.action === HOLDEM_ACTIONS.CHECK) {
					// a check adds no money
					playerCommitments[currentAction.player] =
						playerCommitments[currentAction.player] || 0;
				} else if (currentAction.action === HOLDEM_ACTIONS.FOLD) {
					// player is out of the hand
					delete playerCommitments[currentAction.player];
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
		 * Returns an array of all unique values, that players who are not in the
		 * foldedPlayers list have committed to the pot
		 * @param {Object} pot - the pot, as it is recorded by every hand
		 * @param {Integer[]} foldedPlayers - a list of players who have already folded
		 * their hand, i.e. whose commitments should not be respected
		 * @return {Number[]} list of all unique commitments to the pot by non-folded
		 * players
		 */
		function collectUniqueCommitmentValuesOfNonFoldedPlayers(pot, foldedPlayers) {
			var commitmentValues = []; // unique values

			// collect all unique commitment values
			for (var playerIndex = 0; playerIndex < self.players.length; playerIndex++) {
				if (pot.commitments.hasOwnProperty(playerIndex) &&
						foldedPlayers.indexOf(playerIndex) < 0 &&
						commitmentValues.indexOf(pot.commitments[playerIndex]) < 0) {
					commitmentValues.push(pot.commitments[playerIndex]);
				}
			}

			return commitmentValues;
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

			return self.getAmountToCallForPlayer(call.player) === call.amount;
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

			if (!self.isBettingAnOptionForPlayer(bet.player)) {
				return false;
			}

			if (isSmallBlind) {
				return bet.amount === self.getCurrentHand().blinds.smallBlind;
			}

			return bet.amount >= self.getAmountToMinRaiseForPlayer(bet.player) &&
				bet.amount <= self.players[bet.player].stack;
		}

		/**
		 * Whether the supplied raise was a correct action in the current situation
		 * of play. Takes into acount the previous actions, stack sizes, raise
		 * amount and possible all in situations.
		 * @return {boolean} whether or not the raise was correct
		 */
		function isCorrectRaise(raise) {
			if (raise.action !== HOLDEM_ACTIONS.RAISE) {
				return false;
			}

			return raise.amount >= self.getAmountToMinRaiseForPlayer(raise.player) &&
				raise.amount <= self.players[raise.player].stack;
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

			return self.isCheckingAnOptionForPlayer(check.player);
		}

		/**
		 * Increases playerIndex's stack size by amount and
		 * notifies about the payment
		 * @param {Integer} playerIndex - index of the player to be paid
		 * @param {Number} amount - amount to be paid to playerIndex
		 */
		function payPlayer(playerIndex, amount) {
			self.players[playerIndex].stack += amount;

			// Tell the world about the payment
			$rootScope.$broadcast(HOLDEM_EVENTS.PLAYER_WON_MONEY, {
				player: playerIndex,
				amount: amount
			});
		}

		function finaliseHand() {
			finishDroppedOutPlayers();
			checkForWinner();
		}

		function finishDroppedOutPlayers() {
			for (var playerIndex = 0; playerIndex < self.players.length; playerIndex++) {
				if (self.finishedPlayers.indexOf(playerIndex) < 0) {
					// player was not yet finished
					if (self.players[playerIndex].stack === 0) {
						// player has no chips left
						// finish him
						self.finishedPlayers.push(playerIndex);
						
						// tell the world about the finished player
						$rootScope.$broadcast(HOLDEM_EVENTS.PLAYER_FINISHED, playerIndex);
					}
				}
			}
		}

		function checkForWinner() {
			// If there's only one player left, we have a winner!
			if ((self.players.length - self.finishedPlayers.length) === 1) {
				// find the winner
				var winners = [];
				for (var playerIndex = 0; playerIndex < self.players.length; playerIndex++) {
					if (self.finishedPlayers.indexOf(playerIndex) < 0) {
						// player is still in the game
						winners.push(playerIndex);
					}
				}

				// There can only be one winner
				if (winners.length !== 1) {
					throw 'More or less than one player left despite array lengths ' +
						'indicate there should only be one.';
				}

				self.gameFinished = true;
				// Tell the world about the winner
				$rootScope.$broadcast(HOLDEM_EVENTS.PLAYER_WON_TOURNAMENT, winners[0]);
			}
		}

		/**
		 * Whether or not a card is already in use in the current hand
		 * and can therefore not be assigned anywhere else.
		 * @param {Object} card - the card to be checked
		 * @param {Object} except - if specified, cards assigned in this
		 * position will be ignored.
		 * @param {string} except.place - Can be one of 'hole', 'flop', 'turn'
		 * or 'river'
		 * @param {number} except.player - If the place is 'hole', this specifies
		 * the player index of the player whose hole cards should be ignored
		 */
		function isCardUsedInCurrentHand(card, except) {
			var currentHand = self.getCurrentHand();
			var alreadyUsed = false;

			// Is it used in someone else's hole cards?
			for (var i = 0; i < currentHand.holeCards.length; i++) {
				if (except.player !== currentHand.holeCards[i].player) {
					var actualHoleCards = currentHand.holeCards[i].cards;

					if (actualHoleCards.length > 0) {
						if (cardService.areCardsEqual(actualHoleCards[0], card)) {
							return true;
						}

						if (actualHoleCards.length > 1) {
							if (cardService.areCardsEqual(actualHoleCards[1], card)) {
								return true;
							}
						}
					}
				}
			}

			// Is it used on the board?
			var board = currentHand.board;

			if (except.place !== 'flop') {
				var flop = board.flop;
				if (cardService.areCardsEqual(flop[0], card) ||
					cardService.areCardsEqual(flop[1], card) ||
					cardService.areCardsEqual(flop[2], card)) {
					return true;
				}
			}

			if (except.place !== 'turn') {
				if (cardService.areCardsEqual(board.turn, card)) {
					return true;
				}
			}

			if (except.place !== 'river') {
				if (cardService.areCardsEqual(board.river, card)) {
					return true;
				}
			}
			
			return false;
		}
	}]);

})(window);
