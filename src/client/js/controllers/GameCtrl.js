(function(window, undefined) {

	var holdemControllers = angular.module('holdemControllers');

	holdemControllers.controller('GameCtrl',
			['$scope', 'gameService', 'uiService', 'HOLDEM_EVENTS', '$modal',
			function($scope, gameService, uiService, HOLDEM_EVENTS, $modal) {
		$scope.gameStarted = false;
		$scope.handNr = null;
		$scope.currentBlinds = gameService.currentBlinds;
		$scope.communityCards = [null, null, null, null, null];

		/*
		 * UI event handlers and utility functions
		 */
		$scope.addPlayer = function() {
			uiService.promptForNewPlayer(function(player) {
				gameService.addPlayer(player);
				$scope.players = gameService.players;
			});
		};

		$scope.startGame = function() {
			if (gameService.players.length < 2) {
				uiService.errorMessage('At least two players need to be added to the game.');
				return;
			}

			gameService.startGame();
		};

		$scope.nextHand = function() {
			if (gameService.doesHandRequireMoreAction()) {
				uiService.confirmDecision(
					'This hand requires more action. Do you really want to advance to the next hand?',
					'Advance to next hand',
					'Cancel',
					function() {
						gameService.nextHand();
						// Necessary so that player panels get updated
						$scope.$apply();
					}
				);
			} else {
				gameService.nextHand();
			}
		};

		$scope.advanceBettingRound = function() {
			gameService.advanceBettingRound();
		};

		/*
		 * Broadcast event handlers
		 */
		$scope.$on(HOLDEM_EVENTS.GAME_STARTED, function(event) {
			$scope.gameStarted = true;
		});

		$scope.$on(HOLDEM_EVENTS.NEXT_HAND_DEALT, function(event, handNr) {
			$scope.handNr = handNr;
			$scope.communityCards = [null, null, null, null, null];
		});

		$scope.$on(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, function(event, bettingRound) {
			$scope.currentBettingRound = bettingRound;
		});

		$scope.$on(HOLDEM_EVENTS.FLOP_CARDS_ASSIGNED, function(event, cards) {
			for (var i = 0; i < 3; i++) {
				$scope.communityCards[i] = cards[i];
			}
		});

		$scope.$on(HOLDEM_EVENTS.TURN_CARD_ASSIGNED, function(event, card) {
			$scope.communityCards[3] = card;
		});

		$scope.$on(HOLDEM_EVENTS.RIVER_CARD_ASSIGNED, function(event, card) {
			$scope.communityCards[4] = card;
		});
	}]);

})(window);