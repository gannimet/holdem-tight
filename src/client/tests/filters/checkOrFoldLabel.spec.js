describe('Filter: checkOrFoldLabel', function() {
	var checkOrFoldLabelFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		checkOrFoldLabelFilter = $filter('checkOrFoldLabel');
	}));

	it('should return correct check or fold string', function() {
		var isCheckingPossible = true;
		expect(checkOrFoldLabelFilter(isCheckingPossible)).toEqual('CHECK');

		isCheckingPossible = false;
		expect(checkOrFoldLabelFilter(isCheckingPossible)).toEqual('FOLD');
	});
});