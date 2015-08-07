describe('Filter: cardInUse', function() {
	var cardInUseFilter;

	beforeEach(module('holdemFilters'));
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

		cardInUseFilter = $filter('cardInUse');
	}));

	it('should return the correct message', function() {
		expect(cardInUseFilter({ rank: 'ace', suit: 'diamonds' })).toEqual('Ace of Diamonds is already in use in this hand.');
	});
});