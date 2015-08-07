describe('Filter: callLabel', function() {
	var callLabelFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		callLabelFilter = $filter('callLabel');
	}));

	it('should return the correct call label string', function() {
		expect(callLabelFilter()).toEqual('CALL');
		expect(callLabelFilter(200)).toEqual('CALL 200');
	});
});