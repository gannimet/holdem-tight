describe('unit test for communityCards directive', function() {
	var $compile, $scope, element, $timeout, uiService;

	beforeEach(module('holdemDirectives'));
	beforeEach(module('holdemServices'));
	beforeEach(module('holdemConstants'));
	beforeEach(module('ui.bootstrap'));
	beforeEach(module('templates'));

	beforeEach(inject(function($injector) {
		$scope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		$timeout = $injector.get('$timeout');
		uiService = $injector.get('uiService');
		
		element = angular.element('<data-community-cards data-ng-model="cards"></data-community-cards>');
		$scope.cards = [
			{ rank: 'ace', suit: 'clubs' },
			{ rank: 'queen', suit: 'hearts' },
			{ rank: '3', suit: 'clubs' },
			{ rank: '6', suit: 'spades' },
			null
		];

		$compile(element)($scope);
		angular.element(document.body).append(element);
		$scope.$digest();
		$timeout.flush();
	}));

	describe('test compiling of directive element', function() {
		it('should compile directive element into proper template', function() {
			expect(element).toExist();
			expect(element).toHaveId('community-cards');

			var boardCardElems = element.children();
			expect(boardCardElems.size()).toEqual(5);
			expect(boardCardElems).toHaveClass('card');
		});
	});

	describe('test directive controller', function() {
		var isolateScope;

		afterEach(function() {
			uiService.promptForCommunityCards.calls.reset();
			uiService.errorMessage.calls.reset();
		});

		describe('asking for community cards without problems', function() {
			beforeEach(function() {
				isolateScope = element.isolateScope();
				spyOn(uiService, 'promptForCommunityCards');
				spyOn(uiService, 'errorMessage');
			});

			it('should call ui service to ask for flop cards', function() {
				isolateScope.showFlopCards();

				expect(uiService.promptForCommunityCards).toHaveBeenCalledWith(
					'flop',
					{ rank: 'ace', suit: 'clubs' },
					{ rank: 'queen', suit: 'hearts' },
					{ rank: '3', suit: 'clubs' }
				);
				expect(uiService.errorMessage).not.toHaveBeenCalled();
			});

			it('should call ui service to ask for turn card', function() {
				isolateScope.showTurnCard();

				expect(uiService.promptForCommunityCards).toHaveBeenCalledWith(
					'turn', { rank: '6', suit: 'spades' }
				);
				expect(uiService.errorMessage).not.toHaveBeenCalled();
			});

			it('should call ui service to ask for river card', function() {
				isolateScope.showRiverCard();

				expect(uiService.promptForCommunityCards).toHaveBeenCalledWith(
					'river', null
				);
				expect(uiService.errorMessage).not.toHaveBeenCalled();
			});
		});

		describe('asking for community cards with exception', function() {
			beforeEach(function() {
				isolateScope = element.isolateScope();
				spyOn(uiService, 'promptForCommunityCards').and.callFake(function() {
					throw 'prompt error';
				});
				spyOn(uiService, 'errorMessage');
			});

			it('should call ui service to ask for flop cards', function() {
				isolateScope.showFlopCards();

				expect(uiService.promptForCommunityCards).toHaveBeenCalledWith(
					'flop',
					{ rank: 'ace', suit: 'clubs' },
					{ rank: 'queen', suit: 'hearts' },
					{ rank: '3', suit: 'clubs' }
				);
				expect(uiService.errorMessage).toHaveBeenCalledWith('prompt error');
			});

			it('should call ui service to ask for turn card', function() {
				isolateScope.showTurnCard();

				expect(uiService.promptForCommunityCards).toHaveBeenCalledWith(
					'turn', { rank: '6', suit: 'spades' }
				);
				expect(uiService.errorMessage).toHaveBeenCalledWith('prompt error');
			});

			it('should call ui service to ask for river card', function() {
				isolateScope.showRiverCard();

				expect(uiService.promptForCommunityCards).toHaveBeenCalledWith(
					'river', null
				);
				expect(uiService.errorMessage).toHaveBeenCalledWith('prompt error');
			});
		});
	});
});
