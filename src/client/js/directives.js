(function(window, undefined) {

	var holdemDirectives = angular.module('holdemDirectives', []);

	holdemDirectives.directive('playerPanel', [function() {
		return {
			restrict: 'E',
			templateUrl: '/partials/player-panel',
			replace: true,
			scope: {
				seatNr: '=seatNr'
			},
			controller: [
					'$scope', '$timeout', 'gameService', 'HOLDEM_EVENTS',
					function($scope, $timeout, gameService, HOLDEM_EVENTS) {
				var playerIndex = $scope.seatNr - 1;

				$scope.isDealer = false;
				$scope.isSmallBlind = false;
				$scope.isBigBlind = false;

				/*
				 * UI Event handlers and other function for the UI
				 * for this directive
				 */
				$scope.deletePlayer = function() {
					gameService.deletePlayer(playerIndex);
				};

				$scope.isGameStarted = function() {
					return gameService.gameStarted;
				};

				/*
				 * Scope event handlers
				 */
				$scope.$on(HOLDEM_EVENTS.PLAYER_ADDED, function(event, players) {
					handlePlayerEvent(players);
				});

				$scope.$on(HOLDEM_EVENTS.PLAYER_DELETED, function(event, players) {
					handlePlayerEvent(players);
				});

				$scope.$on(HOLDEM_EVENTS.ROLES_ASSIGNED, function(event, roles) {
					$scope.isDealer     = playerIndex === roles.dealer;
					$scope.isSmallBlind = playerIndex === roles.smallBlind;
					$scope.isBigBlind   = playerIndex === roles.bigBlind;
				});

				/*
				 * Utility functions
				 */
				function handlePlayerEvent(players) {
					var player = players[playerIndex];

					assignPlayer(player);
				}

				function assignPlayer(player) {
					// this is a hack
					// if we would use $scope.$apply() we
					// would get an error because it gets
					// called in quick succession
					// see: http://stackoverflow.com/a/25149047/1722704
					$timeout(function() {
						$scope.player = player;
					});
				}
			}]
		};
	}]);

})(window);
