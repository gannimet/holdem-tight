describe('unit test for game controller', function() {
	var scope, gameService, uiService, HOLDEM_EVENTS,
		HOLDEM_BETTING_ROUNDS, $modal, $rootScope;

	var mockGameService = {
		players: [],
		currentBlinds: {
			smallBlind: 10,
			bigBlind: 20
		},
		addPlayer: function(player) {
			this.players.push(player);
		},
		startGame: function() {
			$rootScope.$broadcast(HOLDEM_EVENTS.GAME_STARTED);
		},
		advanceBettingRound: function() {
			$rootScope.$broadcast(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, HOLDEM_BETTING_ROUNDS.FLOP);
		},
		doesHandRequireMoreAction: function() {
			return false;
		},
		nextHand: function() {
			$rootScope.$broadcast(HOLDEM_EVENTS.NEXT_HAND_DEALT, 2);
		}
	};

	var mockUiService = {
		counter: 1,
		promptForNewPlayer: function(callback) {
			callback({
				name: 'Player ' + this.counter++,
				stack: 1500
			});
		}
	};

	beforeEach(module('holdemControllers'));
	beforeEach(module('holdemConstants'));
	beforeEach(module('ui.bootstrap'));

	beforeEach(module('holdemServices', function($provide) {
		$provide.value('gameService', mockGameService);
		$provide.value('uiService', mockUiService);
	}));

	beforeEach(inject(function($injector) {
		scope = $injector.get('$rootScope').$new();
		gameService = $injector.get('gameService');
		uiService = $injector.get('uiService');
		HOLDEM_EVENTS = $injector.get('HOLDEM_EVENTS');
		HOLDEM_BETTING_ROUNDS = $injector.get('HOLDEM_BETTING_ROUNDS');
		$modal = $injector.get('$modal');
		$rootScope = $injector.get('$rootScope');

		$controller = $injector.get('$controller');

		$controller('GameCtrl', {
			$scope: scope,
			gameService: gameService,
			uiService: uiService,
			HOLDEM_EVENTS: HOLDEM_EVENTS,
			$modal: $modal
		});
	}));

	describe('test pre-game assignments', function() {
		it('should hold correct blind values', function() {
			expect(scope.gameStarted).toBe(false);
			expect(scope.currentBlinds).toEqual({
				smallBlind: 10,
				bigBlind: 20
			});
		});
	});

	describe('test game functionality', function() {
		beforeEach(function() {
			scope.addPlayer();
			scope.addPlayer();
			scope.startGame();
		});

		it('should assign players to scope and start game', function() {
			expect(scope.players.length).toEqual(2);
			expect(scope.players[0]).toEqual({
				name: 'Player 1',
				stack: 1500
			});
			expect(scope.players[1]).toEqual({
				name: 'Player 2',
				stack: 1500
			});
		});

		it('should change state due to scope events', function() {
			expect(scope.gameStarted).toBe(true);

			scope.advanceBettingRound();

			expect(scope.currentBettingRound).toEqual(HOLDEM_BETTING_ROUNDS.FLOP);

			scope.nextHand();

			expect(scope.handNr).toEqual(2);
		});
	});
});
