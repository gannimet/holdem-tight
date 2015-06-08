describe('unit test for game controller', function() {
	var scope, gameService, uiService, HOLDEM_EVENTS, $modal;

	var mockGameService = {
		players: [],
		currentBlinds: {
			smallBlind: 10,
			bigBlind: 20
		},
		addPlayer: function(player) {
			this.players.push(player);
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
		$modal = $injector.get('$modal');

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

		it('should assign players to scope', function() {
			scope.addPlayer();
			scope.addPlayer();

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
	});
});
