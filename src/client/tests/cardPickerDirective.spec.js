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
		expect(element[0].querySelector('.suit-btn-group').children.length).toEqual(4);
		expect(element[0].querySelector('.rank-btn-group').children.length).toEqual(13);
	});
});
