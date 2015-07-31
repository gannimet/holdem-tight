(function(window, undefined) {
	
	var holdemServices = angular.module('holdemServices');

	holdemServices.service('cardService', [function() {
		this.getCardImagePath = function(rank, suit) {
			return '/img/' + rank + '_of_' + suit + '.svg';
		};

		this.allSuits = [
			{ abbreviation: 'C', name: 'Clubs', code: 'clubs', icon: '♣', color: 'black' },
			{ abbreviation: 'D', name: 'Diamonds', code: 'diamonds', icon: '♦', color: 'red' },
			{ abbreviation: 'H', name: 'Hearts', code: 'hearts', icon: '♥', color: 'red' },
			{ abbreviation: 'S', name: 'Spades', code: 'spades', icon: '♠', color: 'black' }
		];

		this.allRanks = [
			{ abbreviation: 'A', name: 'Ace', code: 'ace' },
			{ abbreviation: '2', name: 'Deuce', code: '2' },
			{ abbreviation: '3', name: 'Trey', code: '3' },
			{ abbreviation: '4', name: 'Four', code: '4' },
			{ abbreviation: '5', name: 'Five', code: '5' },
			{ abbreviation: '6', name: 'Six', code: '6' },
			{ abbreviation: '7', name: 'Seven', code: '7' },
			{ abbreviation: '8', name: 'Eight', code: '8' },
			{ abbreviation: '9', name: 'Nine', code: '9' },
			{ abbreviation: 'T', name: 'Ten', code: '10' },
			{ abbreviation: 'J', name: 'Jack', code: 'jack' },
			{ abbreviation: 'Q', name: 'Queen', code: 'queen' },
			{ abbreviation: 'K', name: 'King', code: 'king' },
		];

		this.getSuitByCode = function(code) {
			for (var i = 0; i < this.allSuits.length; i++) {
				var suit = this.allSuits[i];

				if (suit.code === code) {
					return suit;
				}
			}
		};

		this.getRankByCode = function(code) {
			for (var i = 0; i < this.allRanks.length; i++) {
				var rank = this.allRanks[i];

				if (rank.code === code) {
					return rank;
				}
			}
		};

		this.areCardsEqual = function(card1, card2) {
			if (!card1 || !card2) {
				return false;
			}

			if (!angular.isDefined(card1.suit) || !angular.isDefined(card1.rank) ||
					!angular.isDefined(card2.suit) || !angular.isDefined(card2.rank)) {
				return false;
			}

			return card1.suit === card2.suit &&
				card1.rank === card2.rank;
		};

		this.getCardShortHand = function(card) {
			var rank = this.getRankByCode(card.rank);
			var suit = this.getSuitByCode(card.suit);

			if (rank && suit) {
				return rank.abbreviation + suit.abbreviation.toLowerCase();
			}
		};
	}]);

})(window);