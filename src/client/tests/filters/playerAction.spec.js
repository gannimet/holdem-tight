describe('Filter: playerAction', function() {
	var playerActionFilter, HOLDEM_ACTIONS;

	beforeEach(module('holdemFilters'));
	beforeEach(module('holdemConstants'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		playerActionFilter = $filter('playerAction');
		HOLDEM_ACTIONS = $injector.get('HOLDEM_ACTIONS');
	}));

	it('should return the correct player action string', function() {
		var call = { player: 1, action: HOLDEM_ACTIONS.CALL, amount: 100 };
		var bet = { player: 2, action: HOLDEM_ACTIONS.BET, amount: 200 };
		var raise = { player: 3, action: HOLDEM_ACTIONS.RAISE, amount: 300 };
		var check = { player: 0, action: HOLDEM_ACTIONS.CHECK };
		var fold = { player: 1, action: HOLDEM_ACTIONS.FOLD };

		expect(playerActionFilter(call)).toEqual('call 100');
		expect(playerActionFilter(bet)).toEqual('bet 200');
		expect(playerActionFilter(raise)).toEqual('raise 300');
		expect(playerActionFilter(check)).toEqual('check');
		expect(playerActionFilter(fold)).toEqual('fold');
	});
});