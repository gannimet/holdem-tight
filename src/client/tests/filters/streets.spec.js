describe('Filter: streets', function() {
	var streetsFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		streetsFilter = $filter('streets');
	}));

	it('should return the correct street string', function() {
		expect(streetsFilter('flop', false, false)).toEqual('flop');
		expect(streetsFilter('flop', false, true)).toEqual('Flop');
		expect(streetsFilter('flop', true, false)).toEqual('flop cards');
		expect(streetsFilter('flop', true, true)).toEqual('Flop cards');

		expect(streetsFilter('turn', false, false)).toEqual('turn');
		expect(streetsFilter('turn', false, true)).toEqual('Turn');
		expect(streetsFilter('turn', true, false)).toEqual('turn card');
		expect(streetsFilter('turn', true, true)).toEqual('Turn card');

		expect(streetsFilter('river', false, false)).toEqual('river');
		expect(streetsFilter('river', false, true)).toEqual('River');
		expect(streetsFilter('river', true, false)).toEqual('river card');
		expect(streetsFilter('river', true, true)).toEqual('River card');
	});
});