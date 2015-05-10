(function(window, undefined) {
		
	var holdemControllers = angular.module('holdemControllers', []);

	holdemControllers.controller('GameCtrl',
			['$scope', 'gameService', 'uiService', 'HOLDEM_EVENTS', '$modal',
			function($scope, gameService, uiService, HOLDEM_EVENTS, $modal) {
		$scope.gameStarted = false;
		$scope.handNr = null;

		/*
		 * UI event handlers and utility functions
		 */
		$scope.addPlayer = function() {
			uiService.promptForNewPlayer(
				function(player) {
					gameService.addPlayer(player);
					$scope.players = gameService.players;
				}
			);
		};

		$scope.startGame = function() {
			gameService.startGame();
		};

		$scope.nextHand = function() {
			gameService.nextHand();
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

})(window);
