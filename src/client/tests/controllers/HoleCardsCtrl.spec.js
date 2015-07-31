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
			assignHoleCardsToPlayer: function(playerIndex, card1, card2) {
				if (playerIndex !== 0) {
					throw 'illegal index';
				}
			},
			players: [
				{ name: 'Dankwart', stack: 2000 }
			]
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
			$controller('HoleCardsCtrl', {
				$scope: scope,
				$modalInstance: $modalInstance,
				player: 0,
				card1: { rank: '9', suit: 'clubs' },
				card2: { rank: 'ace', suit: 'spades' },
				gameService: gameService
			});
		});

		it('should have assigned street and cards to the scope', function() {
			expect(scope.player).toEqual({ name: 'Dankwart', stack: 2000 });
			expect(scope.card1).toEqual({ rank: '9', suit: 'clubs' });
			expect(scope.card2).toEqual({ rank: 'ace', suit: 'spades' });
		});
	});

	describe('test scope functions', function() {
		beforeEach(function() {
			spyOn($modalInstance, 'close');
			spyOn($modalInstance, 'dismiss');
			spyOn(gameService, 'assignHoleCardsToPlayer').and.callThrough();
		});

		afterEach(function() {
			$modalInstance.close.calls.reset();
			$modalInstance.dismiss.calls.reset();
			gameService.assignHoleCardsToPlayer.calls.reset();
		});

		describe('test assigning hole cards', function() {
			beforeEach(function() {
				$controller('HoleCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					player: 0,
					card1: { rank: '9', suit: 'clubs' },
					card2: { rank: 'ace', suit: 'spades' },
					gameService: gameService
				});
			});

			it('should assign correct hole cards', function() {
				scope.ok();

				expect(gameService.assignHoleCardsToPlayer).toHaveBeenCalledWith(
					0,
					{ rank: '9', suit: 'clubs' },
					{ rank: 'ace', suit: 'spades' }
				);

				expect($modalInstance.close).toHaveBeenCalled();
				expect($modalInstance.dismiss).not.toHaveBeenCalled();
				expect(scope.error).toBeUndefined();
			});
		});

		describe('test canceling', function() {
			beforeEach(function() {
				$controller('HoleCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					player: 0,
					card1: { rank: '9', suit: 'clubs' },
					card2: { rank: 'ace', suit: 'spades' },
					gameService: gameService
				});
			});

			it('should dismiss the modal', function() {
				scope.cancel();

				expect(gameService.assignHoleCardsToPlayer).not.toHaveBeenCalled();

				expect($modalInstance.close).not.toHaveBeenCalled();
				expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');
			});
		});

		describe('test illegal hole card assignment', function() {
			beforeEach(function() {
				$controller('HoleCardsCtrl', {
					$scope: scope,
					$modalInstance: $modalInstance,
					player: 1,								// Out of bounds index
					card1: { rank: '9', suit: 'clubs' },
					card2: { rank: 'ace', suit: 'spades' },
					gameService: gameService
				});
			});

			it('should throw and set error object on scope', function() {
				scope.ok();

				expect($modalInstance.close).not.toHaveBeenCalled();
				expect($modalInstance.dismiss).not.toHaveBeenCalled();

				expect(scope.error).toBeDefined();
			});
		});
	});
});
