describe('Filter: blinds', function() {
	var blindsFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		blindsFilter = $filter('blinds');
	}));

	it('should return the correct blinds string', function() {
		expect(blindsFilter({
			smallBlind: 100,
			bigBlind: 200
		})).toEqual('100/200');
	});
});