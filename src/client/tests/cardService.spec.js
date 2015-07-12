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

			expect(cardService.getCardImagePath(rank.code, suit.code)).toEqual('/img/3_of_hearts.svg');
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

		it('should determine null and undefined cards as NOT equal', function() {
			expect(cardService.areCardsEqual(
				null,
				{ suit: 'diamonds', rank: 'king' }
			)).toBe(false);
			expect(cardService.areCardsEqual(
				{ suit: 'clubs', rank: 'ace' },
				null
			)).toBe(false);
			expect(cardService.areCardsEqual(null, null)).toBe(false);

			expect(cardService.areCardsEqual(
				undefined,
				{ suit: 'diamonds', rank: 'king' }
			)).toBe(false);
			expect(cardService.areCardsEqual(
				{ suit: 'clubs', rank: 'ace' },
				undefined
			)).toBe(false);
			expect(cardService.areCardsEqual(undefined, null)).toBe(false);
			expect(cardService.areCardsEqual(null, undefined)).toBe(false);
			expect(cardService.areCardsEqual(undefined, undefined)).toBe(false);
		});
	});
});
