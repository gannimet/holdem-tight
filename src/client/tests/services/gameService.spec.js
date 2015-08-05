describe('unit test for holdem game service', function() {
	var gameService, handEvalService, $rootScope, HOLDEM_EVENTS, HOLDEM_BETTING_ROUNDS, HOLDEM_ACTIONS, $q, $timeout;

	// Load dependencies
	beforeEach(module('holdemServices'));
	beforeEach(module('holdemConstants'));

	// Load the service under test
	beforeEach(inject(function($injector) {
		gameService = $injector.get('gameService');
		handEvalService = $injector.get('handEvalService');
		$rootScope = $injector.get('$rootScope');
		$q = $injector.get('$q');
		$timeout = $injector.get('$timeout');
		HOLDEM_EVENTS = $injector.get('HOLDEM_EVENTS');
		HOLDEM_BETTING_ROUNDS = $injector.get('HOLDEM_BETTING_ROUNDS');
		HOLDEM_ACTIONS = $injector.get('HOLDEM_ACTIONS');
	}));

	describe('game mechanics', function() {
		it('should perform a complete 5 handed poker game', function() {
			// Add players
			expect(gameService.players.length).toBe(0);
			gameService.addPlayer({
				name: 'Bernd',
				stack: 1500
			});
			expect(gameService.players.length).toBe(1);
			gameService.addPlayer({
				name: 'Hans',
				stack: 4000
			});
			expect(gameService.players.length).toBe(2);
			gameService.addPlayer({
				name: 'Raimund',
				stack: 1500
			});
			expect(gameService.players.length).toBe(3);

			// Remove players
			gameService.deletePlayer(1);
			expect(gameService.players.length).toBe(2);
			expect(gameService.players[0].name).toEqual('Bernd');
			expect(gameService.players[0].stack).toEqual(1500);
			expect(gameService.players[1].name).toEqual('Raimund');
			expect(gameService.players[1].stack).toEqual(1500);

			// And add some players again so we have a proper game
			gameService.addPlayer({
				name: 'Siegbert',
				stack: 1500
			});
			gameService.addPlayer({
				name: 'Dankwart',
				stack: 1500
			});
			gameService.addPlayer({
				name: 'Wilfried',
				stack: 1500
			});

			expect(gameService.players.length).toBe(5);

			// Test notifications
			spyOn($rootScope, '$broadcast').and.callThrough();

			expect(gameService.startGame.bind(gameService)).not.toThrow();

			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.GAME_STARTED);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.NEXT_HAND_DEALT, 1);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ROLES_ASSIGNED, {
				dealer: 0,
				smallBlind: 1,
				bigBlind: 2
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 1,
				action: HOLDEM_ACTIONS.BET,
				amount: gameService.getCurrentHand().blinds.smallBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 2);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 2,
				action: HOLDEM_ACTIONS.RAISE,
				amount: gameService.getCurrentHand().blinds.bigBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 3);

			expect(gameService.players[1].stack).toEqual(1490);
			expect(gameService.players[2].stack).toEqual(1480);
			expect(gameService.getCurrentHand().pot.amount).toEqual(30);

			expect($rootScope.$broadcast.calls.count()).toBe(8);
			$rootScope.$broadcast.calls.reset();

			expect(gameService.whoseTurnItIs).toEqual(3);
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.gameStarted).toBe(true);
			expect(gameService.allHands.length).toEqual(1);
			expect(gameService.finishedPlayers.length).toBe(0);

			for (var i = 0; i < gameService.players.length; i++) {
				expect(gameService.isPlayerFinished(i)).toBe(false);
			}

			expect(gameService.advanceBettingRound).toThrow();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);

			/*
			 * Players start acting
			 */

			// Let player act out of turn
			expect(gameService.recordAction.bind(gameService, {
				player: 4, // it's 3's turn!
				action: HOLDEM_ACTIONS.FOLD
			})).toThrow();
			// No notification should have been sent by that,
			// and it should still be the same player's turn
			expect($rootScope.$broadcast.calls.count()).toEqual(0);
			expect(gameService.whoseTurnItIs).toEqual(3);

			// Now perform a legal action
			var legalAction = {
				player: 3,
				action: HOLDEM_ACTIONS.FOLD
			};
			expect(gameService.recordAction.bind(gameService, legalAction)).not.toThrow();
			// This time the notifications should have been sent
			// and the turn been advanced
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, legalAction);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 4);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(4);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.players[3].stack).toEqual(1500);
			expect(gameService.getCurrentHand().pot.amount).toEqual(30);
			expect(gameService.getCurrentHand().pot.commitments[3]).toEqual(0);

			// Player 4 calls
			var player4Call = {
				player: 4,
				action: HOLDEM_ACTIONS.CALL,
				amount: 20
			};
			expect(gameService.recordAction.bind(gameService, player4Call)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player4Call);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(0);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.players[4].stack).toEqual(1480);
			expect(gameService.getCurrentHand().pot.amount).toEqual(50);
			expect(gameService.getCurrentHand().pot.commitments[4]).toEqual(20);

			// Illegal bet from player 0
			var illegalBet = {
				player: 0,
				action: HOLDEM_ACTIONS.BET,
				amount: 40
			};
			expect(gameService.recordAction.bind(gameService, illegalBet)).toThrow();
			expect($rootScope.$broadcast.calls.count()).toEqual(0);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.getLastAction()).toEqual(player4Call);
			expect(gameService.players[0].stack).toEqual(1500);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(0);

			var player0Raise = {
				player: 0,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 40
			};
			expect(gameService.recordAction.bind(gameService, player0Raise)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Raise);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(1);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.players[0].stack).toEqual(1460);
			expect(gameService.getCurrentHand().pot.amount).toEqual(90);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(40);

			var player1Call = {
				player: 1,
				action: HOLDEM_ACTIONS.CALL,
				amount: 30
			};
			expect(gameService.recordAction.bind(gameService, player1Call)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Call);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 2);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(2);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.players[1].stack).toEqual(1460);
			expect(gameService.getCurrentHand().pot.amount).toEqual(120);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(40);

			var player2Fold = {
				player: 2,
				action: HOLDEM_ACTIONS.FOLD
			};
			expect(gameService.recordAction.bind(gameService, player2Fold)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player2Fold);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 4);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(4);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.players[2].stack).toEqual(1480);
			expect(gameService.getCurrentHand().pot.amount).toEqual(120);
			expect(gameService.getCurrentHand().pot.commitments[2]).toEqual(20);

			var player4Fold = {
				player: 4,
				action: HOLDEM_ACTIONS.FOLD
			};
			expect(gameService.recordAction.bind(gameService, player4Fold)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player4Fold);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toBeUndefined();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect(gameService.players[4].stack).toEqual(1480);
			expect(gameService.getCurrentHand().pot.amount).toEqual(120);
			expect(gameService.getCurrentHand().pot.commitments[4]).toEqual(20);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			// PRE-FLOP action is finished, we cann advance the betting round
			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(
				HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.FLOP
			);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(1);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.getCurrentHand().foldedPlayers).toContain(2);
			expect(gameService.getCurrentHand().foldedPlayers).toContain(3);
			expect(gameService.getCurrentHand().foldedPlayers).toContain(4);
			expect(gameService.getCurrentHand().foldedPlayers.length).toEqual(3);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			// Now intiate a reraise battle between the two players left
			// ... but first test a check
			var player1Check = {
				player: 1,
				action: HOLDEM_ACTIONS.CHECK
			};
			expect(gameService.recordAction.bind(gameService, player1Check)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Check);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(0);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[1].stack).toEqual(1460);
			expect(gameService.getCurrentHand().pot.amount).toEqual(120);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(40);

			var player0Bet = {
				player: 0,
				action: HOLDEM_ACTIONS.BET,
				amount: 300
			};
			expect(gameService.recordAction.bind(gameService, player0Bet)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Bet);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(1);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[0].stack).toEqual(1160);
			expect(gameService.getCurrentHand().pot.amount).toEqual(420);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(340);

			var player1Raise = {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 600
			};
			expect(gameService.recordAction.bind(gameService, player1Raise)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Raise);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(0);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[1].stack).toEqual(860);
			expect(gameService.getCurrentHand().pot.amount).toEqual(1020);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(640);

			// let player 0 make too small a raise
			player0Raise = {
				player: 0,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 599
			};
			expect(gameService.recordAction.bind(gameService, player0Raise)).toThrow();
			expect($rootScope.$broadcast.calls.count()).toEqual(0);
			expect(gameService.whoseTurnItIs).toEqual(0);
			expect(gameService.players[0].stack).toEqual(1160);
			expect(gameService.getCurrentHand().pot.amount).toEqual(1020);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(340);

			// this time it should be enough
			player0Raise = {
				player: 0,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 600
			};
			expect(gameService.recordAction.bind(gameService, player0Raise)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Raise);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(1);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[0].stack).toEqual(560);
			expect(gameService.getCurrentHand().pot.amount).toEqual(1620);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(940);

			player1Raise = {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 860
			};
			expect(gameService.recordAction.bind(gameService, player1Raise)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Raise);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(0);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[1].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(2480);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(1500);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			var player0Call = {
				player: 0,
				action: HOLDEM_ACTIONS.CALL,
				amount: 560
			};
			expect(gameService.recordAction.bind(gameService, player0Call)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Call);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toBeUndefined();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[0].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(3040);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(1500);

			expect(gameService.doesHandRequireMoreAction()).toBe(false);

			// Make an illegal raise after betting round is finished
			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 1000
			})).toThrow();
			expect($rootScope.$broadcast.calls.count()).toEqual(0);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[1].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(3040);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(1500);
			expect(gameService.doesHandRequireShowdown()).toBe(true);

			var sidePots = gameService.convertToSidePots(gameService.getCurrentHand().pot);
			expect(sidePots.length).toEqual(1);
			expect(sidePots[0]).toEqual({
				amount: 3040,
				eligiblePlayers: [0, 1]
			});

			// Pay out the pot
			expect(gameService.resolveCurrentHandByShowdown.bind(gameService, [1, 0])).not.toThrow();
			// Test new stack sizes
			expect(gameService.players[0].stack).toEqual(0);
			expect(gameService.players[1].stack).toEqual(3040);
			expect(gameService.players[2].stack).toEqual(1480);
			expect(gameService.players[3].stack).toEqual(1500);
			expect(gameService.players[4].stack).toEqual(1480);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_WON_MONEY, {
				player: 1,
				amount: 3040
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_FINISHED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();

			expect(gameService.finishedPlayers).toEqual([0]);

			// NEXT HAND
			gameService.nextHand();

			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.NEXT_HAND_DEALT, 2);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ROLES_ASSIGNED, {
				dealer: 1,
				smallBlind: 2,
				bigBlind: 3
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 2,
				action: HOLDEM_ACTIONS.BET,
				amount: gameService.getCurrentHand().blinds.smallBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 3);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 3,
				action: HOLDEM_ACTIONS.RAISE,
				amount: gameService.getCurrentHand().blinds.bigBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 4);
			expect(gameService.whoseTurnItIs).toEqual(4);
			expect(gameService.getCurrentHand().pot.amount).toEqual(30);
			expect($rootScope.$broadcast.calls.count()).toEqual(7);
			$rootScope.$broadcast.calls.reset();

			// action starts
			player4Fold = {
				player: 4,
				action: HOLDEM_ACTIONS.FOLD
			};
			expect(gameService.recordAction.bind(gameService, player4Fold)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player4Fold);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(1);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[4].stack).toEqual(1480);
			expect(gameService.getCurrentHand().pot.amount).toEqual(30);
			expect(gameService.getCurrentHand().pot.commitments[4]).toEqual(0);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			player1Raise = {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 100
			};
			expect(gameService.recordAction.bind(gameService, player1Raise)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Raise);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 2);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(2);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[1].stack).toEqual(2940);
			expect(gameService.getCurrentHand().pot.amount).toEqual(130);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(100);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			player2Fold = {
				player: 2,
				action: HOLDEM_ACTIONS.FOLD
			};
			expect(gameService.recordAction.bind(gameService, player2Fold)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player2Fold);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 3);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(3);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[2].stack).toEqual(1470);
			expect(gameService.getCurrentHand().pot.amount).toEqual(130);
			expect(gameService.getCurrentHand().pot.commitments[2]).toEqual(10);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			player3Fold = {
				player: 3,
				action: HOLDEM_ACTIONS.FOLD
			};
			expect(gameService.recordAction.bind(gameService, player3Fold)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player3Fold);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toBeUndefined();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[3].stack).toEqual(1480);
			expect(gameService.getCurrentHand().pot.amount).toEqual(130);
			expect(gameService.getCurrentHand().pot.commitments[3]).toEqual(20);
			expect(gameService.doesHandRequireMoreAction()).toBe(false);

			sidePots = gameService.convertToSidePots(gameService.getCurrentHand().pot);
			expect(sidePots.length).toBe(1);
			expect(sidePots[0]).toEqual({
				amount: 130,
				eligiblePlayers: [1]
			});
			expect(gameService.doesHandRequireShowdown()).toBe(false);

			expect(gameService.resolveCurrentHandWithoutShowdown.bind(gameService)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_WON_MONEY, {
				player: 1,
				amount: 130
			});
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();

			expect(gameService.players[1].stack).toEqual(3070);
			expect(gameService.players[2].stack).toEqual(1470);
			expect(gameService.players[3].stack).toEqual(1480);
			expect(gameService.players[4].stack).toEqual(1480);
			expect(gameService.finishedPlayers).toEqual([0]);

			// LAST HAND
			gameService.nextHand();

			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.NEXT_HAND_DEALT, 3);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ROLES_ASSIGNED, {
				dealer: 2,
				smallBlind: 3,
				bigBlind: 4
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 3,
				action: HOLDEM_ACTIONS.BET,
				amount: gameService.getCurrentHand().blinds.smallBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 4);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 4,
				action: HOLDEM_ACTIONS.RAISE,
				amount: gameService.getCurrentHand().blinds.bigBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect(gameService.whoseTurnItIs).toEqual(1);
			expect(gameService.getCurrentHand().pot.amount).toEqual(30);
			expect($rootScope.$broadcast.calls.count()).toEqual(7);
			$rootScope.$broadcast.calls.reset();

			// player one puts everyone all in
			player1Raise = {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 1480
			};
			expect(gameService.recordAction.bind(gameService, player1Raise)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Raise);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 2);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(2);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[1].stack).toEqual(1590);
			expect(gameService.getCurrentHand().pot.amount).toEqual(1510);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(1480);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			// player 2 calls with 10 less chips
			var player2Call = {
				player: 2,
				action: HOLDEM_ACTIONS.CALL,
				amount: 1470
			};
			expect(gameService.recordAction.bind(gameService, player2Call)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player2Call);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 3);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(3);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[2].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(2980);
			expect(gameService.getCurrentHand().pot.commitments[2]).toEqual(1470);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			// 3 and 4 call as well
			var player3Call = {
				player: 3,
				action: HOLDEM_ACTIONS.CALL,
				amount: 1470
			};
			expect(gameService.recordAction.bind(gameService, player3Call)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player3Call);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 4);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toEqual(4);
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[3].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(4450);
			expect(gameService.getCurrentHand().pot.commitments[3]).toEqual(1480);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			player4Call = {
				player: 4,
				action: HOLDEM_ACTIONS.CALL,
				amount: 1460
			};
			expect(gameService.recordAction.bind(gameService, player4Call)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player4Call);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.whoseTurnItIs).toBeUndefined();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[4].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(5910);
			expect(gameService.getCurrentHand().pot.commitments[4]).toEqual(1480);
			expect(gameService.doesHandRequireMoreAction()).toBe(false);

			expect(gameService.doesHandRequireShowdown()).toBe(true);
			sidePots = gameService.convertToSidePots(gameService.getCurrentHand().pot);
			expect(sidePots.length).toEqual(2);
			expect(gameService.resolveCurrentHandByShowdown.bind(gameService, [1])).not.toThrow();

			// Test new stack sizes
			expect(gameService.players[0].stack).toEqual(0);
			expect(gameService.players[1].stack).toEqual(7500);
			expect(gameService.players[2].stack).toEqual(0);
			expect(gameService.players[3].stack).toEqual(0);
			expect(gameService.players[4].stack).toEqual(0);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_WON_MONEY, {
				player: 1,
				amount: 5880
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_WON_MONEY, {
				player: 1,
				amount: 30
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_FINISHED, 2);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_FINISHED, 3);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_FINISHED, 4);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_WON_TOURNAMENT, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(6);
			$rootScope.$broadcast.calls.reset();

			expect(gameService.gameFinished).toBe(true);
			expect(gameService.nextHand).toThrow();
		});

		it('should perform a complete heads up game', function() {
			gameService.addPlayer({
				name: 'Player1',
				stack: 1000
			});
			gameService.addPlayer({
				name: 'Player2',
				stack: 1000
			});

			// Test notifications
			spyOn($rootScope, '$broadcast').and.callThrough();

			expect(gameService.startGame.bind(gameService)).not.toThrow();

			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.GAME_STARTED);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.NEXT_HAND_DEALT, 1);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ROLES_ASSIGNED, {
				dealer: 0,
				smallBlind: 0,
				bigBlind: 1
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 0,
				action: HOLDEM_ACTIONS.BET,
				amount: gameService.getCurrentHand().blinds.smallBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: gameService.getCurrentHand().blinds.bigBlind,
				bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toBe(8);
			$rootScope.$broadcast.calls.reset();

			expect(gameService.players[0].stack).toEqual(990);
			expect(gameService.players[1].stack).toEqual(980);
			expect(gameService.getCurrentHand().pot.amount).toEqual(30);
			expect(gameService.whoseTurnItIs).toEqual(0);

			// Limped pot pre-flop
			var player0Call = {
				player: 0,
				action: HOLDEM_ACTIONS.CALL,
				amount: 10
			};
			expect(gameService.recordAction.bind(gameService, player0Call)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Call);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[0].stack).toEqual(980);
			expect(gameService.getCurrentHand().pot.amount).toEqual(40);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(20);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			var player1Check = {
				player: 1,
				action: HOLDEM_ACTIONS.CHECK
			};
			expect(gameService.recordAction.bind(gameService, player1Check)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Check);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.PRE_FLOP);
			expect(gameService.players[1].stack).toEqual(980);
			expect(gameService.getCurrentHand().pot.amount).toEqual(40);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(20);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.FLOP);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();

			// FLOP betting round
			var player1Bet = {
				player: 1,
				action: HOLDEM_ACTIONS.BET,
				amount: 30
			};
			expect(gameService.recordAction.bind(gameService, player1Bet)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Bet);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[1].stack).toEqual(950);
			expect(gameService.getCurrentHand().pot.amount).toEqual(70);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(50);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			player0Call = {
				player: 0,
				action: HOLDEM_ACTIONS.CALL,
				amount: 30
			};
			expect(gameService.recordAction.bind(gameService, player0Call)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Call);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);
			expect(gameService.players[0].stack).toEqual(950);
			expect(gameService.getCurrentHand().pot.amount).toEqual(100);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(50);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.TURN);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();

			// TURN betting round
			player1Check = {
				player: 1,
				action: HOLDEM_ACTIONS.CHECK
			};
			expect(gameService.recordAction.bind(gameService, player1Check)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Check);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.TURN);
			expect(gameService.players[1].stack).toEqual(950);
			expect(gameService.getCurrentHand().pot.amount).toEqual(100);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(50);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			var player0Check = {
				player: 0,
				action: HOLDEM_ACTIONS.CHECK
			};
			expect(gameService.recordAction.bind(gameService, player0Check)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Check);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.TURN);
			expect(gameService.players[0].stack).toEqual(950);
			expect(gameService.getCurrentHand().pot.amount).toEqual(100);
			expect(gameService.getCurrentHand().pot.commitments[0]).toEqual(50);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.RIVER);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();

			// RIVER betting round

			player1Bet = {
				player: 1,
				action: HOLDEM_ACTIONS.BET,
				amount: 950
			};
			expect(gameService.recordAction.bind(gameService, player1Bet)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player1Bet);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 0);
			expect($rootScope.$broadcast.calls.count()).toEqual(2);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.RIVER);
			expect(gameService.players[1].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(1050);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(1000);
			expect(gameService.doesHandRequireMoreAction()).toBe(true);

			player0Call = {
				player: 0,
				action: HOLDEM_ACTIONS.CALL,
				amount: 950
			};
			expect(gameService.recordAction.bind(gameService, player0Call)).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, player0Call);
			expect($rootScope.$broadcast.calls.count()).toEqual(1);
			$rootScope.$broadcast.calls.reset();
			expect(gameService.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.RIVER);
			expect(gameService.players[0].stack).toEqual(0);
			expect(gameService.getCurrentHand().pot.amount).toEqual(2000);
			expect(gameService.getCurrentHand().pot.commitments[1]).toEqual(1000);
			expect(gameService.doesHandRequireMoreAction()).toBe(false);

			expect(gameService.doesHandRequireShowdown()).toBe(true);

			expect(gameService.resolveCurrentHandByShowdown.bind(gameService, [1])).not.toThrow();

			// Test new stack sizes
			expect(gameService.players[0].stack).toEqual(0);
			expect(gameService.players[1].stack).toEqual(2000);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_WON_MONEY, {
				player: 1,
				amount: 2000
			});
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_FINISHED, 0);
			expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.PLAYER_WON_TOURNAMENT, 1);
			expect($rootScope.$broadcast.calls.count()).toEqual(3);
			$rootScope.$broadcast.calls.reset();

			expect(gameService.gameFinished).toBe(true);
			expect(gameService.nextHand).toThrow();
		});

		it('should keep track of correct main pot and side pots', function() {
			gameService.addPlayer({
				name: 'Gilberto',
				stack: 1000
			});
			gameService.addPlayer({
				name: 'Dankwart',
				stack: 600
			});
			gameService.addPlayer({
				name: 'Danuta',
				stack: 400
			});
			gameService.addPlayer({
				name: 'Gertrude',
				stack: 200
			});
			gameService.startGame();

			expect(gameService.whoseTurnItIs).toEqual(3);
			expect(gameService.recordAction.bind(gameService, {
				player: 3,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 200
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.recordAction.bind(gameService, {
				player: 0,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 600
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.CALL,
				amount: 590
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.CALL,
				amount: 380
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);

			// Analyse side pots
			var sidePots = gameService.convertToSidePots(gameService.getCurrentHand().pot);

			expect(sidePots.length).toEqual(3);
			expect(sidePots[0]).toEqual({
				amount: 800,
				eligiblePlayers: [0, 1, 2, 3]
			});
			expect(sidePots[1]).toEqual({
				amount: 600,
				eligiblePlayers: [0, 1, 2]
			});
			expect(sidePots[2]).toEqual({
				amount: 400,
				eligiblePlayers: [0, 1]
			});
		});

		it('should calculate right amounts to call and min raise', function() {
			gameService.addPlayer({
				name: 'Dankwart',
				stack: 2000
			});
			gameService.addPlayer({
				name: 'Reinhold',
				stack: 1500
			});
			gameService.addPlayer({
				name: 'Humberto',
				stack: 1000
			});
			gameService.startGame();

			expect(gameService.whoseTurnItIs).toEqual(0);

			expect(gameService.getAmountToCallForPlayer(0)).toEqual(20);
			expect(gameService.getAmountToMinRaiseForPlayer(0)).toEqual(40);
			expect(gameService.getAmountToCallForPlayer(1)).toEqual(10);
			expect(gameService.getAmountToMinRaiseForPlayer(1)).toEqual(30);
			expect(gameService.getAmountToCallForPlayer(2)).toBe(false);
			expect(gameService.getAmountToMinRaiseForPlayer(2)).toBe(false);

			gameService.recordAction({
				player: 0,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 200
			});

			expect(gameService.whoseTurnItIs).toEqual(1);

			expect(gameService.getAmountToCallForPlayer(0)).toBe(false);
			expect(gameService.getAmountToMinRaiseForPlayer(0)).toBe(false);
			expect(gameService.getAmountToCallForPlayer(1)).toEqual(190);
			expect(gameService.getAmountToMinRaiseForPlayer(1)).toEqual(370);
			expect(gameService.getAmountToCallForPlayer(2)).toEqual(180);
			expect(gameService.getAmountToMinRaiseForPlayer(2)).toEqual(360);

			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 1491
			})).toThrow();

			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 1490
			})).not.toThrow();

			expect(gameService.getAmountToCallForPlayer(0)).toEqual(1300);
			expect(gameService.getAmountToMinRaiseForPlayer(0)).toEqual(1800);
			expect(gameService.getAmountToCallForPlayer(1)).toBe(false);
			expect(gameService.getAmountToMinRaiseForPlayer(1)).toBe(false);
			expect(gameService.getAmountToCallForPlayer(2)).toEqual(980);
			expect(gameService.getAmountToMinRaiseForPlayer(2)).toBe(false);
		});

		it('should know when betting round is finished when all players call', function() {
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.addPlayer();

			gameService.startGame();

			expect(gameService.whoseTurnItIs).toEqual(3);

			expect(gameService.recordAction.bind(gameService, {
				player: 3,
				action: HOLDEM_ACTIONS.CALL,
				amount: 20
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 0,
				action: HOLDEM_ACTIONS.CALL,
				amount: 20
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.CALL,
				amount: 10
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
		});

		it('should not produce an error after betting round advances', function() {
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.startGame();

			gameService.recordAction({
				player: 0,
				action: HOLDEM_ACTIONS.CALL,
				amount: 10
			});
			gameService.recordAction({
				player: 1,
				action: HOLDEM_ACTIONS.CHECK
			});

			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();

			expect(gameService.getAmountToCallForPlayer(0)).toBe(false);
			expect(gameService.getAmountToCallForPlayer(1)).toBe(false);
		});

		it('should know when betting round is finished when (some) players fold', function() {
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.addPlayer();

			gameService.startGame();

			expect(gameService.whoseTurnItIs).toEqual(3);

			expect(gameService.recordAction.bind(gameService, {
				player: 3,
				action: HOLDEM_ACTIONS.FOLD
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 4,
				action: HOLDEM_ACTIONS.CALL,
				amount: 20
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 5,
				action: HOLDEM_ACTIONS.CALL,
				amount: 20
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 0,
				action: HOLDEM_ACTIONS.FOLD
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.CALL,
				amount: 10
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);

			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();

			expect(gameService.whoseTurnItIs).toEqual(1);

			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 4,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 5,
				action: HOLDEM_ACTIONS.BET,
				amount: 100
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 1,
				action: HOLDEM_ACTIONS.FOLD
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.CALL,
				amount: 100
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 4,
				action: HOLDEM_ACTIONS.CALL,
				amount: 100
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);

			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();

			expect(gameService.whoseTurnItIs).toEqual(2);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 4,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 5,
				action: HOLDEM_ACTIONS.CHECK
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);

			expect(gameService.advanceBettingRound.bind(gameService)).not.toThrow();

			expect(gameService.whoseTurnItIs).toEqual(2);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.BET,
				amount: 200
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 4,
				action: HOLDEM_ACTIONS.FOLD
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 5,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 400
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 400
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 5,
				action: HOLDEM_ACTIONS.RAISE,
				amount: 400
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(false);

			expect(gameService.recordAction.bind(gameService, {
				player: 2,
				action: HOLDEM_ACTIONS.CALL,
				amount: 200
			})).not.toThrow();
			expect(gameService.isCurrentBettingRoundFinished()).toBe(true);
			
			expect(gameService.doesHandRequireMoreAction()).toBe(false);
		});
	});

	describe('assigning cards', function() {
		describe('assignment of hole cards', function() {
			it('should assign cards to a player and retrieve them back', function() {
				var card1 = { suit: 'clubs', rank: '9' };
				var card2 = { suit: 'spades', rank: 'ace' };
				var card3 = { suit: 'hearts', rank: 'queen' };

				// Assignment before game start should not be allowed
				expect(gameService.assignHoleCardsToPlayer.bind(gameService, 1, card1, card2)).toThrow();

				gameService.addPlayer();
				gameService.addPlayer();

				gameService.startGame();

				expect(gameService.getHoleCardsOfPlayerInCurrentHand(0)).toBeUndefined();
				expect(gameService.getHoleCardsOfPlayerInCurrentHand(1)).toBeUndefined();
				expect(gameService.assignHoleCardsToPlayer.bind(gameService, 1, card1, card2)).not.toThrow();
				expect(gameService.getHoleCardsOfPlayerInCurrentHand(0)).toBeUndefined();
				expect(gameService.getHoleCardsOfPlayerInCurrentHand(1)).toEqual([
					{ suit: 'clubs', rank: '9' },
					{ suit: 'spades', rank: 'ace' }
				]);

				expect(gameService.assignHoleCardsToPlayer.bind(gameService, 1, card1, card3)).not.toThrow();
				expect(gameService.getHoleCardsOfPlayerInCurrentHand(1)).toEqual([
					{ suit: 'clubs', rank: '9' },
					{ suit: 'hearts', rank: 'queen' }
				]);

				expect(gameService.assignHoleCardsToPlayer.bind(gameService, 1, card1, card1)).toThrow();
			});
		});

		describe('assignment of community cards', function() {
			it('should throw before game start', function() {
				var card1 = { suit: 'clubs', rank: '9' };
				var card2 = { suit: 'spades', rank: 'ace' };
				var card3 = { suit: 'hearts', rank: 'queen' };

				expect(gameService.assignFlopCards.bind(gameService, card1, card2, card3)).toThrow();
			});

			it('should assign and retrieve flop cards', function() {
				var card1 = { suit: 'clubs', rank: '9' };
				var card2 = { suit: 'spades', rank: 'ace' };
				var card3 = { suit: 'hearts', rank: 'queen' };

				gameService.addPlayer();
				gameService.addPlayer();

				gameService.startGame();

				expect(gameService.assignFlopCards.bind(gameService, card1, card2, card3)).not.toThrow();
				expect(gameService.getCurrentHand().board.flop).toEqual([card1, card2, card3]);

				expect(gameService.getFlopCardsInCurrentHand.bind(gameService)).not.toThrow();
				expect(gameService.getFlopCardsInCurrentHand()).toEqual([card1, card2, card3]);
			});

			it('should assign and retrieve turn card', function() {
				var card = { suit: 'clubs', rank: '9' };

				gameService.addPlayer();
				gameService.addPlayer();

				gameService.startGame();

				expect(gameService.assignTurnCard.bind(gameService, card)).not.toThrow();
				expect(gameService.getCurrentHand().board.turn).toEqual(card);

				expect(gameService.getTurnCardInCurrentHand.bind(gameService)).not.toThrow();
				expect(gameService.getTurnCardInCurrentHand()).toEqual(card);
			});

			it('should assign and retrieve river card', function() {
				var card = { suit: 'clubs', rank: '9' };

				gameService.addPlayer();
				gameService.addPlayer();

				gameService.startGame();

				expect(gameService.assignRiverCard.bind(gameService, card)).not.toThrow();
				expect(gameService.getCurrentHand().board.river).toEqual(card);

				expect(gameService.getRiverCardInCurrentHand.bind(gameService)).not.toThrow();
				expect(gameService.getRiverCardInCurrentHand()).toEqual(card);
			});
		});
	});

	describe('assigning duplicate cards', function() {
		beforeEach(function() {
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.startGame();
		});

		it('should not be possible to assign the same card twice in the same hand in different places', function() {
			gameService.assignRiverCard({ rank: 'king', suit: 'clubs' });
			
			expect(gameService.assignHoleCardsToPlayer.bind(
				gameService,
				1, { rank: 'king', suit: 'clubs' }, { rank: 'jack', suit: 'hearts' }
			)).toThrow();

			gameService.assignFlopCards(
				{ rank: '10', suit: 'diamonds' },
				{ rank: '8', suit: 'hearts' },
				{ rank: '4', suit: 'spades' }
			);

			expect(gameService.assignTurnCard.bind(
				gameService, { rank: '8', suit: 'hearts' }
			)).toThrow();

			gameService.assignHoleCardsToPlayer(
				0, { rank: '2', suit: 'hearts' }, { rank: '3', suit: 'hearts' }
			);
			expect(gameService.assignHoleCardsToPlayer.bind(
				gameService, 1, { rank: '2', suit: 'hearts' }, { rank: '6', suit: 'hearts' }
			)).toThrow();
		});

		it('should be possible to assign the same card when it is merely overriding itself', function() {
			gameService.assignFlopCards(
				{ rank: '2', suit: 'hearts' },
				{ rank: '9', suit: 'clubs' },
				{ rank: '3', suit: 'hearts' }
			);
			gameService.assignTurnCard({ rank: 'ace', suit: 'hearts' });
			gameService.assignRiverCard({ rank: 'queen', suit: 'hearts' });
			gameService.assignHoleCardsToPlayer(
				0,
				{ rank: '6', suit: 'diamonds' },
				{ rank: 'jack', suit: 'diamonds' }
			);
			
			expect(gameService.assignFlopCards.bind(
				gameService,
				{ rank: '2', suit: 'hearts' },
				{ rank: 'king', suit: 'spades' },
				{ rank: '4', suit: 'hearts' }
			)).not.toThrow();
			expect(gameService.assignTurnCard.bind(gameService, { rank: 'ace', suit: 'hearts' }))
				.not.toThrow();
			expect(gameService.assignRiverCard.bind(gameService, { rank: 'queen', suit: 'hearts' }))
				.not.toThrow();

			expect(gameService.assignHoleCardsToPlayer.bind(
				gameService,
				0,
				{ rank: '6', suit: 'diamonds' },
				{ rank: 'jack', suit: 'clubs' }
			)).not.toThrow();
		});
	});

	describe('every board card assigned', function() {
		beforeEach(function() {
			gameService.addPlayer();
			gameService.addPlayer();
			gameService.startGame();
		});

		it('should return true if board is complete', function() {
			gameService.assignFlopCards(
				{ rank: '8', suit: 'diamonds' }, { rank: '6', suit: 'hearts' }, { rank: '9', suit: 'spades' }
			);
			gameService.assignTurnCard({ rank: '10', suit: 'clubs' });
			gameService.assignRiverCard({ rank: '7', suit: 'spades' });

			expect(gameService.isEveryBoardCardAssignedInCurrentHand()).toBe(true);
		});

		it('should return false if flop is incomplete', function() {
			gameService.assignFlopCards(
				{ rank: '8', suit: 'diamonds' }, null, { rank: '9', suit: 'spades' }
			);
			gameService.assignTurnCard({ rank: '10', suit: 'clubs' });
			gameService.assignRiverCard({ rank: '7', suit: 'spades' });

			expect(gameService.isEveryBoardCardAssignedInCurrentHand()).toBe(false);
		});

		it('should return false if turn is missing', function() {
			gameService.assignFlopCards(
				{ rank: '8', suit: 'diamonds' }, { rank: '6', suit: 'hearts' }, { rank: '9', suit: 'spades' }
			);
			gameService.assignRiverCard({ rank: '7', suit: 'spades' });

			expect(gameService.isEveryBoardCardAssignedInCurrentHand()).toBe(false);
		});

		it('should return false if river is missing', function() {
			gameService.assignFlopCards(
				{ rank: '8', suit: 'diamonds' }, { rank: '6', suit: 'hearts' }, { rank: '9', suit: 'spades' }
			);
			gameService.assignTurnCard({ rank: '10', suit: 'clubs' });

			expect(gameService.isEveryBoardCardAssignedInCurrentHand()).toBe(false);
		});
	});

	describe('evaluating showdowns', function() {
		describe('with showdown ready hand', function() {
			var testRanking = [3, [1, 2], 0];
			var testHandNames = ["Straight", "One pair", "One pair"];

			beforeEach(function() {
				gameService.addPlayer();
				gameService.addPlayer();
				gameService.addPlayer();
				gameService.addPlayer();
				gameService.startGame();

				// Assign all necessary cards
				gameService.assignHoleCardsToPlayer(0, { rank: '10', suit: 'hearts' }, { rank: '8', suit: 'clubs' });
				gameService.assignHoleCardsToPlayer(1, { rank: 'queen', suit: 'spades' }, { rank: 'jack', suit: 'spades' });
				gameService.assignHoleCardsToPlayer(2, { rank: 'ace', suit: 'hearts' }, { rank: '3', suit: 'spades' });
				gameService.assignHoleCardsToPlayer(3, { rank: 'king', suit: 'diamonds' }, { rank: '6', suit: 'diamonds' });
				gameService.assignFlopCards(
					{ rank: 'jack', suit: 'diamonds' }, { rank: '4', suit: 'clubs' }, { rank: '9', suit: 'spades' }
				);
				gameService.assignTurnCard({ rank: 'ace', suit: 'diamonds' });
				gameService.assignRiverCard({ rank: '3', suit: 'hearts' });

				// Act of the way through the hand
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CALL,
					amount: 20,
					player: 3
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CALL,
					amount: 20,
					player: 0
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CALL,
					amount: 10,
					player: 1
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 2
				});
				gameService.advanceBettingRound();
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 1
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 2
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 3
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 0
				});
				gameService.advanceBettingRound();
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 1
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 2
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 3
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 0
				});
				gameService.advanceBettingRound();
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 1
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 2
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 3
				});
				gameService.recordAction({
					action: HOLDEM_ACTIONS.CHECK,
					player: 0
				});

				spyOn(handEvalService, 'evaluateShowdown').and.callFake(function(hands, board) {
					var deferred = $q.defer();

					deferred.resolve({
						playerRanking: testRanking,
						winningHandNames: testHandNames
					});

					return deferred.promise;
				});

				spyOn($rootScope, '$broadcast');
				spyOn(gameService, 'resolveCurrentHandByShowdown');
			});

			it('should correctly call hand evaluation service', function() {
				expect(gameService.evaluateShowdown.bind(gameService)).not.toThrow();
				expect(handEvalService.evaluateShowdown).toHaveBeenCalledWith(
					[
						{
							playerIndex: 0,
							cardShortHands: ['Th', '8c']
						}, {
							playerIndex: 1,
							cardShortHands: ['Qs', 'Js']
						}, {
							playerIndex: 2,
							cardShortHands: ['Ah', '3s']
						}, {
							playerIndex: 3,
							cardShortHands: ['Kd', '6d']
						}
					], ['Jd', '4c', '9s', 'Ad', '3h']
				);
			});

			it('should have called resolve method internally', function() {
				gameService.evaluateShowdown();

				$rootScope.$apply();

				expect(gameService.resolveCurrentHandByShowdown).toHaveBeenCalledWith(testRanking);
			});

			it('should have set showdown info on current hand', function() {
				var expectedShowdownInfo = [
					"One pair", "One pair", "One pair", "Straight"
				];

				gameService.evaluateShowdown();

				$rootScope.$apply();

				var actualShowdownInfo = gameService.getCurrentHand().showdown;
				expect(actualShowdownInfo).toBeDefined();
				expect(actualShowdownInfo).toEqual(expectedShowdownInfo);

				expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.SHOWDOWN_EVALUATED, expectedShowdownInfo);
			});
		});

		describe('with hand not ready for showdown', function() {
			beforeEach(function() {
				gameService.addPlayer();
				gameService.addPlayer();
				gameService.startGame();
			});

			it('should throw if there is still action required', function() {
				expect(gameService.evaluateShowdown.bind(gameService)).toThrow();
			});

			describe('missing cards', function() {
				beforeEach(function() {
					gameService.recordAction({
						player: 0,
						action: HOLDEM_ACTIONS.CALL,
						amount: 10
					});
					gameService.recordAction({
						player: 1,
						action: HOLDEM_ACTIONS.CHECK
					});
					gameService.advanceBettingRound();
					gameService.recordAction({
						player: 1,
						action: HOLDEM_ACTIONS.CHECK
					});
					gameService.recordAction({
						player: 0,
						action: HOLDEM_ACTIONS.CHECK
					});
					gameService.advanceBettingRound();
					gameService.recordAction({
						player: 1,
						action: HOLDEM_ACTIONS.CHECK
					});
					gameService.recordAction({
						player: 0,
						action: HOLDEM_ACTIONS.CHECK
					});
					gameService.advanceBettingRound();
					gameService.recordAction({
						player: 1,
						action: HOLDEM_ACTIONS.CHECK
					});
					gameService.recordAction({
						player: 0,
						action: HOLDEM_ACTIONS.CHECK
					});
				});

				it('should throw if action is complete but board cards are missing', function() {
					gameService.assignHoleCardsToPlayer(0, { rank: 'king', suit: 'diamonds' }, { rank: 'queen', suit: 'clubs' });
					gameService.assignHoleCardsToPlayer(1, { rank: 'jack', suit: 'clubs' }, { rank: '3', suit: 'hearts' });
					gameService.assignFlopCards(
						{ rank: '8', suit: 'diamonds' }, { rank: '6', suit: 'hearts' }, { rank: '9', suit: 'spades' }
					);

					expect(gameService.evaluateShowdown.bind(gameService)).toThrow();
				});

				it('should throw if action is complete but hole cards are missing', function() {
					gameService.assignFlopCards(
						{ rank: '8', suit: 'diamonds' }, { rank: '6', suit: 'hearts' }, { rank: '9', suit: 'spades' }
					);
					gameService.assignTurnCard({ rank: '10', suit: 'clubs' });
					gameService.assignRiverCard({ rank: '7', suit: 'spades' });

					expect(gameService.evaluateShowdown.bind(gameService)).toThrow();
				});
			});
		});
	});
});
