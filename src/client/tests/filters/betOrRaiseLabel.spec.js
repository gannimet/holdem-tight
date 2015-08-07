describe('Filter: betOrRaiseLabel', function() {
	var betOrRaiseLabelFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		betOrRaiseLabelFilter = $filter('betOrRaiseLabel');
	}));

	it('should return the correct bet or raise label string', function() {
		expect(betOrRaiseLabelFilter(true)).toEqual('BET');
		expect(betOrRaiseLabelFilter(true, 200)).toEqual('BET 200');

		expect(betOrRaiseLabelFilter(false)).toEqual('RAISE');
		expect(betOrRaiseLabelFilter(false, 200)).toEqual('RAISE 200');
	});
});