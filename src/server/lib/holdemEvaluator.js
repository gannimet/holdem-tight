var Hand = require('hoyle').Hand;

module.exports = {

	evaluate: function(hands, board) {
		var hoyleHandsDecorated = [];
		var finalRanking = [];
		var alreadyRankedIndices = [];

		for (var i = 0; i < hands.length; i++) {
			hoyleHandsDecorated.push({
				playerIndex: hands[i].playerIndex,
				hoyleHand: Hand.make(hands[i].cardShortHands.concat(board))
			});
		}

		while (true) {
			var hoyleHands = undecorate(hoyleHandsDecorated);
			
			// Find out who won this thing
			var winners = Hand.pickWinners(hoyleHands);
			
			// Add winners to the ranking
			var winningIndices = getWinningPlayerIndices(winners, hoyleHandsDecorated);
			finalRanking.push(winningIndices);

			// Remove already ranked hands
			for (var j = 0; j < hoyleHandsDecorated.length; j++) {
				var decoratedHand = hoyleHandsDecorated[j];
				if (decoratedHand) {
					if (isPlayerIndexAlreadyRanked(decoratedHand.playerIndex, finalRanking)) {
						hoyleHandsDecorated[j] = null;
					}
				}
			}

			// Break if all players are ranked
			if (isAllNullValues(hoyleHandsDecorated)) {
				break;
			}
		}

		// Construct game result
		var gameResult = {
			playerRanking: finalRanking
		};

		return gameResult;
	}

};

function undecorate(decoratedHands) {
	var undecoratedHands = [];

	for (var i = 0; i < decoratedHands.length; i++) {
		if (decoratedHands[i]) {
			undecoratedHands.push(decoratedHands[i].hoyleHand);
		}
	}

	return undecoratedHands;
}

function getWinningPlayerIndices(winners, hoyleHandsDecorated) {
	var winningPlayerIndices = [];

	for (var i = 0; i < winners.length; i++) {
		for (var j = 0; j < hoyleHandsDecorated.length; j++) {
			if (hoyleHandsDecorated[j]) {
				// Check first whether we already added this player to the winners
				if (winningPlayerIndices.indexOf(hoyleHandsDecorated[j].playerIndex) < 0) {
					// Is this player a winner?
					if (winners[i] === hoyleHandsDecorated[j].hoyleHand) {
						winningPlayerIndices.push(hoyleHandsDecorated[j].playerIndex);
					}
				}
			}
		}
	}

	return winningPlayerIndices.length === 1 ? winningPlayerIndices[0] : winningPlayerIndices;
}

function isPlayerIndexAlreadyRanked(playerIndex, ranking) {
	for (var i = 0; i < ranking.length; i++) {
		var rank = ranking[i];

		if (Array.isArray(rank)) {
			if (rank.indexOf(playerIndex) !== -1) {
				// found player in tie
				return true;
			}
		} else {
			if (rank === playerIndex) {
				// found player
				return true;
			}
		}
	}

	return false;
}

function isAllNullValues(arr) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] !== null) {
			return false;
		}
	}

	return true;
}
