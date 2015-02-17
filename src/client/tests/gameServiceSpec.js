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

	it('should perform a complete poker game', function() {
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
			name: 'Siegbert',
			stack: 1500
		});

		expect(gameService.players.length).toBe(5);

		// Test notifications on game start
		spyOn($rootScope, '$broadcast').and.callThrough();

		gameService.startGame();

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
		expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.ACTION_PERFORMED, {
			player: 2,
			action: HOLDEM_ACTIONS.RAISE,
			amount: gameService.getCurrentHand().blinds.bigBlind,
			bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
		});
		expect($rootScope.$broadcast).toHaveBeenCalledWith(HOLDEM_EVENTS.TURN_ASSIGNED, 3);

		expect($rootScope.$broadcast.calls.count()).toBe(7);
		$rootScope.$broadcast.calls.reset();

		expect(gameService.isCurrentBettingRoundFinished()).toBe(false);
	});
});
