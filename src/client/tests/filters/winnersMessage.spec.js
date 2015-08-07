describe('Filter: winnersMessage', function() {
	var winnersMessageFilter;

	beforeEach(module('holdemFilters'));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		winnersMessageFilter = $filter('winnersMessage');
	}));

	it('should return the correct winners message string', function() {
		expect(winnersMessageFilter(true, ['Dankwart', 'Torben'], 'Straight Flush')).toEqual('Somebody won.');
	});
});