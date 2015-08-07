describe('Filter: bettingRound', function() {
	var bettingRoundFilter, HOLDEM_BETTING_ROUNDS;

	beforeEach(module('holdemFilters'));
	beforeEach(module('holdemConstants'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		bettingRoundFilter = $filter('bettingRound');
		HOLDEM_BETTING_ROUNDS = $injector.get('HOLDEM_BETTING_ROUNDS');
	}));

	it('should return the correct betting round string', function() {
		expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.PRE_FLOP))
			.toEqual('Current betting round: PRE-FLOP');
		expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.FLOP))
			.toEqual('Current betting round: FLOP');
		expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.TURN))
			.toEqual('Current betting round: TURN');
		expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.RIVER))
			.toEqual('Current betting round: RIVER');
		expect(bettingRoundFilter.bind(null, 'illegal')).toThrow('Illegal betting round');
	});
});