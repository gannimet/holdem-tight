describe('unit test for cardpicker directive', function() {
	var $compile, $scope, element, $timeout;

	beforeEach(module('holdemDirectives'));
	beforeEach(module('holdemServices'));
	beforeEach(module('templates'));

	beforeEach(inject(function($injector) {
		$scope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		$timeout = $injector.get('$timeout');

		element = angular.element('<data-cardpicker data-ng-model="card"></data-cardpicker>');
		$scope.card = {
			rank: 'ace',
			suit: 'clubs'
		};

		$compile(element)($scope);
		angular.element(document.body).append(element);
		$scope.$digest();
		$timeout.flush();
	}));

	function select(radioButtonElement) {
		radioButtonElement.click();
	}

	describe('test radio buttons', function() {
		it('should generate the right number of radio buttons', function() {
			expect(element.find('.suit-btn-group').children()).toHaveLength(4);
			expect(element.find('.rank-btn-group').children()).toHaveLength(13);
		});

		describe('test checking radio buttons', function() {
			it('should check the correct radio buttons', function() {
				expect(element.find('.suit-btn-group input[value=clubs]')).toHaveProp('checked', true);
				expect(element.find('.rank-btn-group input[value=ace]')).toHaveProp('checked', true);
				expect(element.find('.suit-btn-group input[value!=clubs]')).toHaveProp('checked', false);
				expect(element.find('.rank-btn-group input[value!=ace]')).toHaveProp('checked', false);
			});
		});

		describe('test label classes', function() {
			describe('test initial class assignment', function() {
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

			describe('test class assignment after selection changes', function() {
				it('should assign the correct class to selected radion buttons', function() {
					select(element.find('.suit-btn-group input[value=spades]'));
					select(element.find('.rank-btn-group input[value=queen]'));

					expect(element.find('.suit-btn-group input[value=spades]').parent()).toHaveClass('btn-info');
					expect(element.find('.suit-btn-group input[value=spades]').parent()).not.toHaveClass('btn-default');
					expect(element.find('.rank-btn-group input[value=queen]').parent()).toHaveClass('btn-info');
					expect(element.find('.rank-btn-group input[value=queen]').parent()).not.toHaveClass('btn-default');
				});

				it('should assign the correct class to non-selected radio buttons', function() {
					select(element.find('.suit-btn-group input[value=spades]'));
					select(element.find('.rank-btn-group input[value=queen]'));

					expect(element.find('.suit-btn-group input[value=spades]').parent().siblings()).toHaveClass('btn-default');
					expect(element.find('.suit-btn-group input[value=spades]').parent().siblings()).not.toHaveClass('btn-info');
					expect(element.find('.rank-btn-group input[value=queen]').parent().siblings()).toHaveClass('btn-default');
					expect(element.find('.rank-btn-group input[value=queen]').parent().siblings()).not.toHaveClass('btn-info');
				});
			});
		});
	});

	describe('test card image', function() {
		it('should assign the correct image path', function() {
			expect(element.find('.card-thumbnail')).toHaveAttr('src', '/img/ace_of_clubs.svg');
		});

		it('should assign correct image after selection changes', function() {
			select(element.find('.suit-btn-group input[value=spades]'));
			select(element.find('.rank-btn-group input[value=queen]'));
			
			expect(element.find('.card-thumbnail')).toHaveAttr('src', '/img/queen_of_spades.svg');
		});
	});

	describe('test display colors of suits', function() {
		it('should display suits in correct colors', function() {
			// Red suits
			expect(element.find('.suit-btn-group input[value=hearts]').siblings('.card-icon')).toHaveClass('red');
			expect(element.find('.suit-btn-group input[value=hearts]').siblings('.card-icon')).not.toHaveClass('black');
			expect(element.find('.suit-btn-group input[value=diamonds]').siblings('.card-icon')).toHaveClass('red');
			expect(element.find('.suit-btn-group input[value=diamonds]').siblings('.card-icon')).not.toHaveClass('black');

			// Black suits
			expect(element.find('.suit-btn-group input[value=spades]').siblings('.card-icon')).toHaveClass('black');
			expect(element.find('.suit-btn-group input[value=spades]').siblings('.card-icon')).not.toHaveClass('red');
			expect(element.find('.suit-btn-group input[value=clubs]').siblings('.card-icon')).toHaveClass('black');
			expect(element.find('.suit-btn-group input[value=clubs]').siblings('.card-icon')).not.toHaveClass('red');
		});
	});

	describe('test radio button label texts', function() {
		it('should display the correct text on suit labels', function() {
			expect(element.find('.suit-btn-group input[value=clubs]').siblings('.card-icon')).toHaveText('♣');
			expect(element.find('.suit-btn-group input[value=clubs]').siblings('.suit-name')).toHaveText('Clubs');

			expect(element.find('.suit-btn-group input[value=diamonds]').siblings('.card-icon')).toHaveText('♦');
			expect(element.find('.suit-btn-group input[value=diamonds]').siblings('.suit-name')).toHaveText('Diamonds');

			expect(element.find('.suit-btn-group input[value=hearts]').siblings('.card-icon')).toHaveText('♥');
			expect(element.find('.suit-btn-group input[value=hearts]').siblings('.suit-name')).toHaveText('Hearts');

			expect(element.find('.suit-btn-group input[value=spades]').siblings('.card-icon')).toHaveText('♠');
			expect(element.find('.suit-btn-group input[value=spades]').siblings('.suit-name')).toHaveText('Spades');
		});

		it('should display the correct text on rank labels', function() {
			expect(element.find('.rank-btn-group input[value=ace]').siblings('.rank-name')).toHaveText('A');
			expect(element.find('.rank-btn-group input[value=2]').siblings('.rank-name')).toHaveText('2');
			expect(element.find('.rank-btn-group input[value=king]').siblings('.rank-name')).toHaveText('K');
			expect(element.find('.rank-btn-group input[value=10]').siblings('.rank-name')).toHaveText('T');
		});
	});

	describe('test scope', function() {
		it('should assign the correct values to scope variables', function() {
			var scope = element.isolateScope();
			
			expect(scope.suits).toBeDefined();
			expect(scope.ranks).toBeDefined();
			expect(scope.getCardImagePath).toBeDefined();

			expect(scope.selectedCard).toEqual({
				rank: 'ace',
				suit: 'clubs'
			});

			// Change selection
			select(element.find('.suit-btn-group input[value=spades]'));
			select(element.find('.rank-btn-group input[value=queen]'));

			expect(scope.selectedCard).toEqual({
				rank: 'queen',
				suit: 'spades'
			});
		});
	});
});
