describe('unit test for communityCards directive', function() {
	var $compile, $scope1, $scope2, element1, element2, $timeout, cardService;

	beforeEach(module('holdemDirectives'));
	beforeEach(module('holdemServices', function($provide) {
		$provide.value('cardService', {
			getCardImagePath: function() {
				return '/img/queen_of_hearts.svg';
			}
		});
	}));
	beforeEach(module('templates'));

	beforeEach(inject(function($injector) {
		$scope1 = $injector.get('$rootScope');
		$scope2 = $scope1.$new();
		$compile = $injector.get('$compile');
		$timeout = $injector.get('$timeout');
		cardService = $injector.get('cardService');
		
		// Compile an element with defined card
		element1 = angular.element('<data-board-card data-ng-model="card"></data-board-card>');
		$scope1.card = { rank: 'queen', suit: 'hearts' };

		$compile(element1)($scope1);
		angular.element(document.body).append(element1);
		$scope1.$digest();

		// Compile an element with undefined card
		element2 = angular.element('<data-board-card data-ng-model="card"></data-board-card>');
		$scope2.card = null;

		$compile(element2)($scope2);
		angular.element(document.body).append(element2);
		$scope2.$digest();

		$timeout.flush();
	}));

	describe('test compiling of directive element', function() {
		it('should compile directive element into proper template', function() {
			expect(element1).toExist();
			expect(element1).toHaveClass('card');

			expect(element2).toExist();
			expect(element2).toHaveClass('card');
		});

		it('should assign correct classes through ng-class to .card element', function() {
			expect(element1).toHaveClass('assigned');
			expect(element1).not.toHaveClass('unassigned');

			expect(element2).not.toHaveClass('assigned');
			expect(element2).toHaveClass('unassigned');
		});

		it('should assign correct image src', function() {
			expect(element1.children('.vanishing')).toHaveAttr('src', '/img/queen_of_hearts.svg');
			expect(element2.children('.vanishing')).toHaveAttr('src', '/img/assign_card.png');
		});
	});

	describe('test directive controller', function() {
		var isolateScope1, isolateScope2;

		beforeEach(function() {
			isolateScope1 = element1.isolateScope();
			isolateScope2 = element2.isolateScope();
		});

		it('should return correct image paths', function() {
			expect(isolateScope1.getDisplayImagePath()).toEqual('/img/queen_of_hearts.svg');
			expect(isolateScope2.getDisplayImagePath()).toEqual('/img/assign_card.png');
		});
	});
});
