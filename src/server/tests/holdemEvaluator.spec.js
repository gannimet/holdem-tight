var holdemEvaluator = require('../lib/holdemEvaluator');
var should = require('should');

describe('holdemEvaluator', function() {
	var hand1, hand2, hand3, hand4, hand5, hand6, board;

	beforeEach(function() {
		hand1 = { playerIndex: 0, cardShortHands: ['2s', '6c'] };
		hand2 = { playerIndex: 1, cardShortHands: ['Td', 'Jd'] };
		hand3 = { playerIndex: 2, cardShortHands: ['Kc', '5h'] };
		hand4 = { playerIndex: 3, cardShortHands: ['2s', '9d'] };
		hand5 = { playerIndex: 4, cardShortHands: ['Ac', '4h'] };
		hand6 = { playerIndex: 5, cardShortHands: ['7h', 'Jh'] };

		board = ['8h', '2h', 'Ks', 'Ad', 'Ah'];
	});

	it('should correctly evaluate hands out of 6', function() {
		var gameResult = holdemEvaluator.evaluate([hand1, hand2, hand3, hand4, hand5, hand6], board);

		gameResult.should.have.a.property('playerRanking', [5, 4, 2, [0, 3], 1]);
		gameResult.should.have.a.property('winningHandNames', ['Flush', 'Three of a kind', 'Two pair', 'Two pair', 'One pair']);
	});
});
