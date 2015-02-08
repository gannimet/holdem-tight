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
			controller: ['$scope', '$rootScope', function($scope, $rootScope) {
				$rootScope.$on('playerAdded', function(event, players) {
					var playerIndex = $scope.seatNr - 1;
					if (players[playerIndex]) {
						console.log('I, as the owner of seat #' + $scope.seatNr +
							' feel obliged to handle player ' + players[playerIndex].name);
						$scope.player = players[playerIndex];
						$scope.$apply();
					}
				});
			}]
		};
	}]);

})(window);
