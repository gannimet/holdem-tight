var Hand = require('hoyle').Hand;

module.exports = {

	evaluate: function(hands, board) {
		var hoyleHandsDecorated = [];

		for (var i = 0; i < hands.length; i++) {
			hoyleHandsDecorated.push({
				playerIndex: hands[i].playerIndex,
				hoyleHand: Hand.make(hands[i].cardShortHands.concat(board))
			});
		}

		var hoyleHands = undecorate(hoyleHandsDecorated);

		// Find out who won this thing
		var winners = Hand.pickWinners(hoyleHands);

		// Construct game result
		var gameResult = {
			tie: winners.length !== 1,
			winningHandName: winners[0].name,
			winningPlayerIndices: getWinningPlayers(winners, hoyleHandsDecorated)
		};

		return gameResult;
	}

};

function undecorate(decoratedHands) {
	var undecoratedHands = [];

	for (var i = 0; i < decoratedHands.length; i++) {
		undecoratedHands.push(decoratedHands.hoyleHand);
	}

	return undecoratedHands;
}

function getWinningPlayers(winners, hoyleHandsDecorated) {
	var winningPlayers = [];

	for (var i = 0; i < winners.length; i++) {
		for (var j = 0; j < hoyleHandsDecorated.length; j++) {
			// Check first whether we already added this player to the winners
			if (winningPlayers.indexOf(hoyleHandsDecorated[j].playerIndex) < 0) {
				// Is this player a winner?
				if (winners[i] === hoyleHandsDecorated[j].hoyleHand) {
					winningPlayers.push(hoyleHandsDecorated[j].playerIndex);
				}
			}
		}
	}

	return winningPlayers;
}