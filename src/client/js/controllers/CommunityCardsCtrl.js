(function(window, undefined) {
	
	var holdemControllers = angular.module('holdemControllers');

	holdemControllers.controller('CommunityCardsController',
			['$scope', '$modalInstance', 'street', 'card1', 'card2', 'card3', 'gameService',
			function($scope, $modalInstance, street, card1, card2, card3, gameService) {
		$scope.street = street;
		$scope.card1 = card1;
		$scope.card2 = card2;
		$scope.card3 = card3;

		$scope.ok = function() {
			try {
				switch ($scope.street) {
					case 'flop':
						gameService.assignFlopCards($scope.card1, $scope.card2, $scope.card3);
						break;
					case 'turn':
						gameService.assignTurnCard($scope.card1);
						break;
					case 'river':
						gameService.assignRiverCard($scope.card1);
						break;
					default:
						throw 'Illegal street';
				}

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