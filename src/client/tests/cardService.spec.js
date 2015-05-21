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
	});

	describe('getting rank and suit by code', function() {
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

	describe('determining cards as equal', function() {
		it('should determine cards as equal', function() {
			expect(cardService.areCardsEqual(
				{ suit: 'clubs', rank: '8' },
				{ suit: 'clubs', rank: '8' }
			)).toBe(true);
			expect(cardService.areCardsEqual(
				{ suit: 'hearts', rank: 'ace' },
				{ suit: 'hearts', rank: 'ace' }
			)).toBe(true);
		});

		it('should determine cards as NOT equal', function() {
			expect(cardService.areCardsEqual(
				{ suit: 'clubs', rank: '8' },
				{ suit: 'hearts', rank: '8' }
			)).toBe(false);
			expect(cardService.areCardsEqual(
				{ suit: 'hearts', rank: 'queen' },
				{ suit: 'hearts', rank: 'ace' }
			)).toBe(false);
		});
	});
});
