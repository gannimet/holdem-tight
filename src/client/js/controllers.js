(function(window, undefined) {
		
	var holdemControllers = angular.module('holdemControllers', []);

	holdemControllers.controller('GameCtrl',
			['$scope', 'gameService', 'uiService', 'HOLDEM_EVENTS',
			function($scope, gameService, uiService, HOLDEM_EVENTS) {
		$scope.gameStarted = false;
		$scope.handNr = null;

		/*
		 * UI event handlers and utility functions
		 */
		$scope.addPlayer = function() {
			uiService.promptForInput(
				'Player name',
				'Add player',
				'Cancel',
				function(clickedOK, playerName) {
					if (clickedOK) {
						gameService.addPlayer({
							name: playerName,
							stack: 1500
						});

						$scope.players = gameService.players;
					}
				}
			);
		};

		$scope.startGame = function() {
			gameService.startGame();
		};

		$scope.nextHand = function() {
			gameService.nextHand();
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
	}]);

})(window);
