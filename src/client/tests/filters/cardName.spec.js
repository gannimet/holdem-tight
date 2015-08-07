describe('Filter: cardName', function() {
	var cardNameFilter;

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

		cardNameFilter = $filter('cardName');
	}));

	it('should return the correct readable card name', function() {
		expect(cardNameFilter({ rank: 'ace', suit: 'diamonds' })).toEqual('Ace of Diamonds');
		expect(cardNameFilter({ rank: '9', suit: 'clubs' })).toEqual('Nine of Clubs');
		expect(cardNameFilter(null)).toBeUndefined();
	});
});