(function(window, undefined) {
	
	var holdemControllers = angular.module('holdemControllers');

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

})(window);