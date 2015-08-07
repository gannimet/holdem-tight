describe('Filter: handNr', function() {
	var handNrFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		handNrFilter = $filter('handNr');
	}));

	it('should return the correct hand nr string', function() {
		expect(handNrFilter(2)).toEqual('Hand #2');
		expect(handNrFilter(undefined)).toBeUndefined();
		expect(handNrFilter('string')).toBeUndefined();
	});
});