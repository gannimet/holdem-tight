(function(window, undefined) {
	
	var holdemDirectives = angular.module('holdemDirectives');

	holdemDirectives.directive('communityCards', [
			'HOLDEM_EVENTS', 'uiService',
			function(HOLDEM_EVENTS, uiService) {
		return {
			restrict: 'E',
			templateUrl: '/html/community-cards.html',
			replace: true,
			scope: {
				cards: '=ngModel'
			},
			controller: ['$scope', function($scope) {
				$scope.showFlopCards = function() {
					try {
						uiService.promptForCommunityCards(
							'flop', $scope.cards[0], $scope.cards[1], $scope.cards[2]
						);
					} catch (error) {
						uiService.errorMessage(error);
					}
				};

				$scope.showTurnCard = function() {
					try {
						uiService.promptForCommunityCards('turn', $scope.cards[3]);
					} catch (error) {
						uiService.errorMessage(error);
					}
				};

				$scope.showRiverCard = function() {
					try {
						uiService.promptForCommunityCards('river', $scope.cards[4]);
					} catch (error) {
						uiService.errorMessage(error);
					}
				};
			}]
		};
	}]);

})(window);