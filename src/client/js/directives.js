(function(window, undefined) {

	var holdemDirectives = angular.module('holdemDirectives', []);

	holdemDirectives.directive('playerPanel', [function() {
		return {
			restrict: 'E',
			templateUrl: '/partials/player-panel',
			replace: false,
			scope: {
				seatNr: '=seatNr'
			},
			controller: [
					'$scope', '$rootScope', '$timeout', 'gameService',
					function($scope, $rootScope, $timeout, gameService) {
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
				$rootScope.$on('playerAdded', function(event, players) {
					handlePlayerEvent(players);
				});

				$rootScope.$on('playerDeleted', function(event, players) {
					handlePlayerEvent(players);
				});

				$rootScope.$on('rolesAssigned', function(event, roles) {
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
