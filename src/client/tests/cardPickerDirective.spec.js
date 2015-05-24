describe('unit test for cardpicker directive', function() {
	var $compile, $scope, element, $timeout;

	beforeEach(module('holdemDirectives'));
	beforeEach(module('holdemServices'));
	beforeEach(module('templates'));

	beforeEach(inject(function($injector) {
		$scope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		$timeout = $injector.get('$timeout');

		element = angular.element('<cardpicker data-ng-model="card"></cardpicker>');
		$scope.card = {
			rank: 'ace',
			suit: 'clubs'
		};

		$compile(element)($scope);
		angular.element(document.body).append(element);
		$scope.$digest();
		$timeout.flush();
	}));

	it('should generate the right number of radio buttons', function() {
		expect(element.find('.suit-btn-group').children().length).toEqual(4);
		expect(element.find('.rank-btn-group').children().length).toEqual(13);
	});

	it('should assign the correct class to selected radio buttons', function() {
		expect(element.find('.suit-btn-group input[value=clubs]').parent()).toHaveClass('btn-info');
		expect(element.find('.suit-btn-group input[value=clubs]').parent()).not.toHaveClass('btn-default');
		expect(element.find('.rank-btn-group input[value=ace]').parent()).toHaveClass('btn-info');
		expect(element.find('.rank-btn-group input[value=ace]').parent()).not.toHaveClass('btn-default');
	});

	it('should assign the correct class to non-selected radio buttons', function() {
		expect(element.find('.suit-btn-group input[value=clubs]').parent().siblings()).toHaveClass('btn-default');
		expect(element.find('.suit-btn-group input[value=clubs]').parent().siblings()).not.toHaveClass('btn-info');
		expect(element.find('.rank-btn-group input[value=ace]').parent().siblings()).toHaveClass('btn-default');
		expect(element.find('.rank-btn-group input[value=ace]').parent().siblings()).not.toHaveClass('btn-info');
	});
});
