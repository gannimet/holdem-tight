describe('unit test for playerPanel directive', function() {
	var $compile, $scope, element, secondElement, gameService,
		$timeout, HOLDEM_ACTIONS, HOLDEM_BETTING_ROUNDS;

	beforeEach(module('holdemDirectives'));
	beforeEach(module('holdemServices'));
	beforeEach(module('holdemConstants'));
	beforeEach(module('holdemFilters'));
	beforeEach(module('ui.bootstrap'));
	beforeEach(module('templates'));

	beforeEach(inject(function($injector) {
		$scope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		gameService = $injector.get('gameService');
		$timeout = $injector.get('$timeout');
		HOLDEM_ACTIONS = $injector.get('HOLDEM_ACTIONS');
		HOLDEM_BETTING_ROUNDS = $injector.get('HOLDEM_BETTING_ROUNDS');

		element = angular.element('<data-player-panel seat-nr="1"></data-player-panel>');
		secondElement = angular.element('<data-player-panel seat-nr="2"></data-player-panel>');

		$compile(element)($scope);
		angular.element(document.body).append(element);
		
		$compile(secondElement)($scope);
		angular.element(document.body).append(secondElement);
		
		$timeout.flush();
	}));

	describe('test behavior before game start', function() {
		beforeEach(function() {
			gameService.addPlayer({ name: 'Dankwart', stack: 2000 });
			gameService.addPlayer({ name: 'Soraya', stack: 2000 });
			$timeout.flush();
		});

		it('should have assigned Dankwart to our panel', function() {
			var scope = element.isolateScope();

			expect(scope.seatNr).toEqual(1);
			expect(scope.player).toEqual({ name: 'Dankwart', stack: 2000 });
		});

		it('should display panel information', function() {
			// Should display name, stack and delete button
			expect(element.find('.player-name')).toHaveText('Dankwart');
			expect(element.find('.player-chip-stack')).toHaveText(/.*2000.*/);
			expect(element.find('.player-delete-button')).toExist();

			// but nothing else
			expect(element.find('.dealer-button')).not.toExist();
			expect(element.find('.small-blind-button')).not.toExist();
			expect(element.find('.big-blind-button')).not.toExist();
			expect(element.find('.assign-cards-badge')).not.toExist();
			expect(element.find('.current action')).not.toExist();
			expect(element.find('.action-controls')).not.toExist();
		});

		it('should delete player on button click', function() {
			element.find('.player-delete-button').click();
			$timeout.flush();

			// Now we should have been replaced by the second player
			var scope = element.isolateScope();

			expect(scope.seatNr).toEqual(1);
			expect(scope.player).toEqual({ name: 'Soraya', stack: 2000 });

			expect(element.find('.player-name')).toHaveText('Soraya');
			expect(element.find('.player-chip-stack')).toHaveText(/.*2000.*/);
		});
	});

	describe('test behavior after game start', function() {
		var mockConfigObj = {};

		beforeEach(function() {
			spyOn($.fn, 'tooltipster').and.callFake(function(config) {
				if (angular.isFunction(config.functionBefore)) {
					mockConfigObj.functionBefore = config.functionBefore;
					console.log('1');
					spyOn(mockConfigObj, 'functionBefore').and.callFake(function() {
						console.log('called');
					});
				}
			});

			gameService.addPlayer({ name: 'Dankwart', stack: 2000 });
			gameService.addPlayer({ name: 'Soraya', stack: 2000 });
			gameService.startGame();
			$timeout.flush();
			$scope.$apply();
		});

		it('should have called mockConfigObj', function(done) {
			$timeout(function() {
				console.log('2');
				expect(mockConfigObj.functionBefore).toHaveBeenCalled();
				console.log('3');
				done();
			});
		});

		it('should display panel information', function() {
			expect(element.find('.player-name')).toHaveText('Dankwart');
			expect(element.find('.player-chip-stack')).toExist();
			
			expect(element.find('.dealer-button')).toExist();
			expect(element.find('.small-blind-button')).toExist();
			expect(element.find('.big-blind-button')).not.toExist();

			expect(element.find('.assign-cards-badge')).toExist();
			expect(element.find('.current-action')).toExist();
			expect(element.find('.action-controls')).toExist();

			expect(element.find('.check-fold-button')).not.toBeDisabled();
			expect(element.find('.call-button')).not.toBeDisabled();
			expect(element.find('.raise-button')).not.toBeDisabled();
			expect(element.find('.raise-amount-txt')).not.toBeDisabled();
			expect(element.find('.raise-amount-txt')).toBeFocused();
		});

		describe('test behavior after call', function() {
			beforeEach(function() {
				element.find('.call-button').click();
				$timeout.flush();
			});

			it('should perform call on button click', function() {
				var scope = element.isolateScope();

				expect(scope.playerInfo.mostRecentAction).toEqual({
					action: HOLDEM_ACTIONS.CALL,
					player: 0,
					amount: 10,
					bettingRound: HOLDEM_BETTING_ROUNDS.PRE_FLOP
				});

				expect(element.find('.assign-cards-badge')).toExist();
				expect(element.find('.current-action')).toExist();
				expect(element.find('.action-controls')).toExist();

				expect(element.find('.check-fold-button')).toBeDisabled();
				expect(element.find('.call-button')).toBeDisabled();
				expect(element.find('.raise-button')).toBeDisabled();
				expect(element.find('.raise-amount-txt')).toBeDisabled();
			});

			it('should have given focus to next player panel', function() {
				expect(secondElement.find('.check-fold-button')).not.toBeDisabled();
				expect(secondElement.find('.call-button')).not.toBeDisabled();
				expect(secondElement.find('.raise-button')).not.toBeDisabled();
				expect(secondElement.find('.raise-amount-txt')).not.toBeDisabled();
				expect(secondElement.find('.raise-amount-txt')).toBeFocused();
			});
		});
	});
});
