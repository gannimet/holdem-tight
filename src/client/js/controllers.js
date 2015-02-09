(function(window, undefined) {
		
	var holdemControllers = angular.module('holdemControllers', []);

	holdemControllers.controller('GameCtrl',
			['$scope', '$rootScope', 'gameService', 'uiService',
			function($scope, $rootScope, gameService, uiService) {
		$scope.gameStarted = false;

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

		/*
		 * Broadcast event handler
		 */
		$rootScope.$on('gameStarted', function(event) {
			$scope.gameStarted = true;
		});
	}]);

})(window);
