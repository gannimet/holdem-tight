describe('unit test for community cards controller', function() {
	var scope, $modalInstance, gameService;

	beforeEach(module('holdemControllers'));
	beforeEach(module('holdemServices'));

	beforeEach(module(function($provide) {
		$provide.value('$modalInstance', {
			close: function() {},
			dismiss: function(reason) {}
		});
	}));

	beforeEach(module(function($provide) {
		$provide.value('gameService', {
			assignFlopCards: function(card1, card2, card3) {},
			assignTurnCard: function(card) {},
			assignRiverCard: function(card) {}
		});
	}));

	beforeEach(inject(function($injector) {
		scope = $injector.get('$rootScope').$new();
		$modalInstance = $injector.get('$modalInstance');
		$controller = $injector.get('$controller');
		gameService = $injector.get('gameService');
	}));

	describe('test initial scope assignment', function() {
		beforeEach(function() {
			$controller('CommunityCardsCtrl', {
				$scope: scope,
				$modalInstance: $modalInstance,
				street: 'flop',
				card1: { rank: '9', suit: 'clubs' },
				card2: { rank: 'ace', suit: 'spades' },
				card3: { rank: 'king', suit: 'diamonds' },
				gameService: gameService
			});
		});

		it('should have assigned street and cards to the scope', function() {
			expect(scope.street).toEqual('flop');
			expect(scope.card1).toEqual({ rank: '9', suit: 'clubs' });
			expect(scope.card2).toEqual({ rank: 'ace', suit: 'spades' });
			expect(scope.card3).toEqual({ rank: 'king', suit: 'diamonds' });
		});
	});

	describe('test scope functions', function() {
		beforeEach(function() {
			spyOn($modalInstance, 'close');
			spyOn($modalInstance, 'dismiss');
			spyOn(gameService, 'assignFlopCards');
			spyOn(gameService, 'assignTurnCard');
			spyOn(gameService, 'assignRiverCard');
		});

		afterEach(function() {
			$modalInstance.close.calls.reset();
			$modalInstance.dismiss.calls.reset();
			gameService.assignFlopCards.calls.reset();
			gameService.assignTurnCard.calls.reset();
			gameService.assignRiverCard.calls.reset();
		});

		describe('test assigning flop cards', function() {
			beforeEach(function() {
				$controller('CommunityCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					street: 'flop',
					card1: { rank: '9', suit: 'clubs' },
					card2: { rank: 'ace', suit: 'spades' },
					card3: { rank: 'king', suit: 'diamonds' },
					gameService: gameService
				});
			});

			it('should assign correct flop cards', function() {
				scope.ok();

				expect(gameService.assignFlopCards).toHaveBeenCalledWith(
					{ rank: '9', suit: 'clubs' },
					{ rank: 'ace', suit: 'spades' },
					{ rank: 'king', suit: 'diamonds' }
				);
				expect(gameService.assignTurnCard).not.toHaveBeenCalled();
				expect(gameService.assignRiverCard).not.toHaveBeenCalled();

				expect($modalInstance.close).toHaveBeenCalled();
				expect($modalInstance.dismiss).not.toHaveBeenCalled();
			});
		});

		describe('test assigning turn card', function() {
			beforeEach(function() {
				$controller('CommunityCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					street: 'turn',
					card1: { rank: '9', suit: 'clubs' },
					card2: undefined,
					card3: undefined,
					gameService: gameService
				});
			});

			it('should assign correct turn card', function() {
				scope.ok();

				expect(gameService.assignFlopCards).not.toHaveBeenCalled();
				expect(gameService.assignTurnCard).toHaveBeenCalledWith(
					{ rank: '9', suit: 'clubs' }
				);
				expect(gameService.assignRiverCard).not.toHaveBeenCalled();

				expect($modalInstance.close).toHaveBeenCalled();
				expect($modalInstance.dismiss).not.toHaveBeenCalled();
			});
		});

		describe('test assigning river card', function() {
			beforeEach(function() {
				$controller('CommunityCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					street: 'river',
					card1: { rank: '9', suit: 'clubs' },
					card2: undefined,
					card3: undefined,
					gameService: gameService
				});
			});

			it('should assign correct river card', function() {
				scope.ok();

				expect(gameService.assignFlopCards).not.toHaveBeenCalled();
				expect(gameService.assignTurnCard).not.toHaveBeenCalled();
				expect(gameService.assignRiverCard).toHaveBeenCalledWith(
					{ rank: '9', suit: 'clubs' }
				);

				expect($modalInstance.close).toHaveBeenCalled();
				expect($modalInstance.dismiss).not.toHaveBeenCalled();
			});
		});

		describe('test illegal street name', function() {
			beforeEach(function() {
				$controller('CommunityCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					street: 'hurz',
					card1: { rank: '9', suit: 'clubs' },
					card2: undefined,
					card3: undefined,
					gameService: gameService
				});
			});

			it('should throw and set error object on scope', function() {
				scope.ok();

				expect(gameService.assignFlopCards).not.toHaveBeenCalled();
				expect(gameService.assignTurnCard).not.toHaveBeenCalled();
				expect(gameService.assignRiverCard).not.toHaveBeenCalled();

				expect($modalInstance.close).not.toHaveBeenCalled();
				expect($modalInstance.dismiss).not.toHaveBeenCalled();

				expect(scope.error).toBeDefined();
			});
		});

		describe('test canceling', function() {
			beforeEach(function() {
				$controller('CommunityCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					street: 'river',
					card1: { rank: '9', suit: 'clubs' },
					card2: undefined,
					card3: undefined,
					gameService: gameService
				});
			});

			it('should dismiss the modal', function() {
				scope.cancel();

				expect(gameService.assignFlopCards).not.toHaveBeenCalled();
				expect(gameService.assignTurnCard).not.toHaveBeenCalled();
				expect(gameService.assignRiverCard).not.toHaveBeenCalled();

				expect($modalInstance.close).not.toHaveBeenCalled();
				expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');
			});
		});
	});
});
