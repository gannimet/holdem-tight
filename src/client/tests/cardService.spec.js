describe('unit test for card service', function() {
	var cardService;

	// Load dependencies
	beforeEach(module('holdemServices'));

	// Load the service under test
	beforeEach(inject(function($injector) {
		cardService = $injector.get('cardService');
	}));

	describe('image paths', function() {
		it('should get correct image paths with valid inputs', function() {
			var rank = {
				code: '3'
			};
			var suit = {
				code: 'hearts'
			};

			expect(cardService.getCardImagePath(rank, suit)).toEqual('/img/3_of_hearts.svg');
		});

		it('should get correct suit by code', function() {
			var suit = cardService.getSuitByCode('diamonds');

			expect(suit).toBeDefined();
			expect(suit).toEqual({ abbreviation: 'D', name: 'Diamonds', code: 'diamonds', icon: '♦', color: 'red' });

			expect(cardService.getSuitByCode('invalidsuit')).toBeUndefined();
		});

		it('should get correct rank by code', function() {
			var rank = cardService.getRankByCode('queen');

			expect(rank).toBeDefined();
			expect(rank).toEqual({ abbreviation: 'Q', name: 'Queen', code: 'queen' });

			expect(cardService.getRankByCode('invalidrank')).toBeUndefined();
		});
	});
});
