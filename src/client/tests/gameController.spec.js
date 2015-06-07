describe('unit test for game controller', function() {
	var scope, gameService, uiService, HOLDEM_EVENTS, $modal;
	var mockGameService = {};
	var mockUiService = {};

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

	describe('test something', function() {
		it('should do something', function() {
			expect(scope.gameStarted).toBe(false);
		});
	});
});
