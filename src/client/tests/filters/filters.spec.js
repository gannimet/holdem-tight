describe('unit test for holdem filters', function() {
	var stackSizeFilter, handNrFilter, bettingRoundFilter, HOLDEM_BETTING_ROUNDS,
		checkOrFoldLabelFilter, betOrRaiseLabelFilter, callLabelFilter, blindsFilter,
		cardNameFilter, cardInUseFilter;

	beforeEach(module('holdemFilters'));
	beforeEach(module('holdemConstants'));
	beforeEach(module('holdemServices', function($provide) {
			$provide.value('cardService', {
				getSuitByCode: function(code) {
					if (code === 'diamonds') {
						return { abbreviation: 'D', name: 'Diamonds', code: 'diamonds', icon: '♦', color: 'red' };
					}

					if (code === 'clubs') {
						return { abbreviation: 'C', name: 'Clubs', code: 'clubs', icon: '♣', color: 'black' };
					}
				},

				getRankByCode: function(code) {
					if (code === 'ace') {
						return { abbreviation: 'A', name: 'Ace', code: 'ace' };
					}

					if (code === '9') {
						return { abbreviation: '9', name: 'Nine', code: '9' };
					}
				}
			});
		}));

	beforeEach(inject(function($injector) {
		var $filter = $injector.get('$filter');

		stackSizeFilter = $filter('stackSize');
		handNrFilter = $filter('handNr');
		bettingRoundFilter = $filter('bettingRound');
		checkOrFoldLabelFilter = $filter('checkOrFoldLabel');
		betOrRaiseLabelFilter = $filter('betOrRaiseLabel');
		callLabelFilter = $filter('callLabel');
		blindsFilter = $filter('blinds');
		cardNameFilter = $filter('cardName');
		cardInUseFilter = $filter('cardInUse');
		HOLDEM_BETTING_ROUNDS = $injector.get('HOLDEM_BETTING_ROUNDS');
	}));

	describe('unit test for stack size filter', function() {
		it('should return the correct stack size string', function() {
			expect(stackSizeFilter(2000)).toEqual('Stack size: 2000');
			expect(stackSizeFilter(undefined)).toBeUndefined();
			expect(stackSizeFilter('string')).toBeUndefined();
		});
	});

	describe('unit test for hand nr filter', function() {
		it('should return the correct hand nr string', function() {
			expect(handNrFilter(2)).toEqual('Hand #2');
			expect(handNrFilter(undefined)).toBeUndefined();
			expect(handNrFilter('string')).toBeUndefined();
		});
	});

	describe('unit test for betting round filter', function() {
		it('should return the correct betting round string', function() {
			expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.PRE_FLOP))
				.toEqual('Current betting round: PRE-FLOP');
			expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.FLOP))
				.toEqual('Current betting round: FLOP');
			expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.TURN))
				.toEqual('Current betting round: TURN');
			expect(bettingRoundFilter(HOLDEM_BETTING_ROUNDS.RIVER))
				.toEqual('Current betting round: RIVER');
			expect(bettingRoundFilter.bind(null, 'illegal')).toThrow('Illegal betting round');
		});
	});

	describe('unit test for check or fold label filter', function() {
		it('should return correct check or fold string', function() {
			var isCheckingPossible = true;
			expect(checkOrFoldLabelFilter(isCheckingPossible)).toEqual('CHECK');

			isCheckingPossible = false;
			expect(checkOrFoldLabelFilter(isCheckingPossible)).toEqual('FOLD');
		});
	});

	describe('unit test for bet or raise label filter', function() {
		it('should return the correct bet or raise label string', function() {
			var isBettingPossible = true;
			expect(betOrRaiseLabelFilter(isBettingPossible)).toEqual('BET');
			expect(betOrRaiseLabelFilter(isBettingPossible, 200)).toEqual('BET 200');

			isBettingPossible = false;
			expect(betOrRaiseLabelFilter(isBettingPossible)).toEqual('RAISE');
			expect(betOrRaiseLabelFilter(isBettingPossible, 200)).toEqual('RAISE 200');
		});
	});

	describe('unit test for call label filter', function() {
		it('should return the correct call label string', function() {
			expect(callLabelFilter()).toEqual('CALL');
			expect(callLabelFilter(200)).toEqual('CALL 200');
		});
	});

	describe('unit test for blinds filter', function() {
		it('should return the correct blinds string', function() {
			expect(blindsFilter({
				smallBlind: 100,
				bigBlind: 200
			})).toEqual('100/200');
		});
	});

	describe('unit test for card name filter', function() {
		it('should return the correct readable card name', function() {
			expect(cardNameFilter({ rank: 'ace', suit: 'diamonds' })).toEqual('Ace of Diamonds');
			expect(cardNameFilter({ rank: '9', suit: 'clubs' })).toEqual('Nine of Clubs');
			expect(cardNameFilter(null)).toBeUndefined();
		});
	});

	describe('unit test for card in use filter', function() {
		it('should return the correct message', function() {
			expect(cardInUseFilter({ rank: 'ace', suit: 'diamonds' })).toEqual('Ace of Diamonds is already in use in this hand.');
		});
	});
});
