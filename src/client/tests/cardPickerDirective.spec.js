describe('unit test for cardpicker directive', function() {
	var $compile, $scope, element, $httpBackend;

	beforeEach(module('holdemDirectives'));
	beforeEach(module('holdemServices'));
	beforeEach(angular.mock.module('ngMockE2E'));

	beforeEach(inject(function($injector) {
		$scope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		$httpBackend = $injector.get('$httpBackend');
	}));

	it('should work', function() {
		element = angular.element('<cardpicker data-ng-model="card"></cardpicker>');
		$scope.card = {
			rank: 'ace',
			suit: 'clubs'
		};

		$compile(element)($scope);
		$scope.$digest();

		console.info(element);
	});
});
