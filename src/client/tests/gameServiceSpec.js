describe('unit test for holdem game service', function() {
	var gameService, $rootScope, HOLDEM_EVENTS, HOLDEM_BETTING_ROUNDS, HOLDEM_ACTIONS;

	// Load dependencies
	beforeEach(module('holdemServices'));
	beforeEach(module('holdemConstants'));

	// Load the service under test
	beforeEach(inject(function(_$rootScope_, _gameService_, _HOLDEM_EVENTS_, _HOLDEM_BETTING_ROUNDS_, _HOLDEM_ACTIONS_) {
		gameService = _gameService_;
		$rootScope = _$rootScope_;
		HOLDEM_EVENTS = _HOLDEM_EVENTS_;
		HOLDEM_BETTING_ROUNDS = _HOLDEM_BETTING_ROUNDS_;
		HOLDEM_ACTIONS = _HOLDEM_ACTIONS_;
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
			expect(gameService.getCurrentHand().pot).toEqual(30);

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
			expect(gameService.getCurrentHand().pot).toEqual(30);

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
			expect(gameService.getCurrentHand().pot).toEqual(50);

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
			expect(gameService.getCurrentHand().pot).toEqual(90);

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
			expect(gameService.getCurrentHand().pot).toEqual(120);

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
			expect(gameService.getCurrentHand().pot).toEqual(120);

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
			expect(gameService.getCurrentHand().pot).toEqual(120);

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
			expect(gameService.getCurrentHand().pot).toEqual(120);

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
			expect(gameService.getCurrentHand().pot).toEqual(420);

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
			expect(gameService.getCurrentHand().pot).toEqual(1020);

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
			expect(gameService.getCurrentHand().pot).toEqual(1020);

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
			expect(gameService.getCurrentHand().pot).toEqual(1620);

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
			expect(gameService.getCurrentHand().pot).toEqual(2480);

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
			expect(gameService.getCurrentHand().pot).toEqual(3040);
		});

		xit('should perform a complete heads up game', function() {

		});

		xit('should keep track of correct main pot and side pots', function() {

		});
	});
});
