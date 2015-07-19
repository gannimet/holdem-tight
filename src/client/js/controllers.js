(function(window, undefined) {
		
	var holdemControllers = angular.module('holdemControllers', []);

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
		});

		$scope.$on(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, function(event, bettingRound) {
			$scope.currentBettingRound = bettingRound;
		});

		$scope.$on(HOLDEM_EVENTS.FLOP_CARDS_ASSIGNED, function(event, cards) {
			for (var i = 0; i < 3; i++) {
				$scope.communityCards[i] = cards[i];
			}
		});

		$scope.$on(HOLDEM_EVENTS.TURN_CARD_ASSIGNED, function(card) {
			$scope.communityCards[3] = card;
		});

		$scope.$on(HOLDEM_EVENTS.RIVER_CARD_ASSIGNED, function(card) {
			$scope.communityCards[4] = card;
		});
	}]);

	holdemControllers.controller('AddPlayerController',
			['$scope', '$modalInstance',
			function($scope, $modalInstance) {
		$scope.ok = function() {
			if ($scope.player)  {
				$scope.player.stack = parseInt($scope.player.stack);
			}

			$modalInstance.close($scope.player);
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}]);

	holdemControllers.controller('HoleCardsController',
			['$scope', '$modalInstance', 'player', 'card1', 'card2', 'gameService',
			function($scope, $modalInstance, player, card1, card2, gameService) {
		$scope.player = gameService.players[player];
		$scope.card1 = card1;
		$scope.card2 = card2;

		$scope.ok = function() {
			try {
				gameService.assignHoleCardsToPlayer(player, $scope.card1, $scope.card2);
				$modalInstance.close();
			} catch (error) {
				$scope.error = error;
			}
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}]);

	holdemControllers.controller('FlopCardsController',
			['$scope', '$modalInstance', 'card1', 'card2', 'card3', 'gameService',
			function($scope, $modalInstance, card1, card2, card3, gameService) {
		$scope.card1 = card1;
		$scope.card2 = card2;
		$scope.card3 = card3;

		$scope.ok = function() {
			try {
				gameService.assignFlopCards($scope.card1, $scope.card2, $scope.card3);
				$modalInstance.close();
			} catch (error) {
				$scope.error = error;
			}
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}]);

})(window);
