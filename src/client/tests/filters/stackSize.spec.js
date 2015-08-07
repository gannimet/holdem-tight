describe('Filter: stackSize', function() {
	var stackSizeFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		stackSizeFilter = $filter('stackSize');
	}));

	it('should return the correct stack size string', function() {
		expect(stackSizeFilter(2000)).toEqual('Stack size: 2000');
		expect(stackSizeFilter(undefined)).toBeUndefined();
		expect(stackSizeFilter('string')).toBeUndefined();
	});
});