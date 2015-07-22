describe('unit test for holdem filters', function() {
	var stackSizeFilter, handNrFilter, bettingRoundFilter, HOLDEM_BETTING_ROUNDS,
		checkOrFoldLabelFilter, betOrRaiseLabelFilter, callLabelFilter, blindsFilter;

	beforeEach(module('holdemFilters'));
	beforeEach(module('holdemConstants'));

	beforeEach(inject(function($injector) {
		stackSizeFilter = $injector.get('$filter')('stackSize');
		handNrFilter = $injector.get('$filter')('handNr');
		bettingRoundFilter = $injector.get('$filter')('bettingRound');
		checkOrFoldLabelFilter = $injector.get('$filter')('checkOrFoldLabel');
		betOrRaiseLabelFilter = $injector.get('$filter')('betOrRaiseLabel');
		callLabelFilter = $injector.get('$filter')('callLabel');
		blindsFilter = $injector.get('$filter')('blinds');
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
});
