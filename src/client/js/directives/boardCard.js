(function(window, undefined) {
	
	var holdemDirectives = angular.module('holdemDirectives');

	holdemDirectives.directive('boardCard', [
			'cardService',
			function(cardService) {
		return {
			restrict: 'E',
			templateUrl: '/html/board-card.html',
			replace: true,
			scope: {
				card: '=ngModel'
			},
			controller: ['$scope', function($scope) {
				var defaultImagePath = '/img/assign_card.png';

				$scope.getDisplayImagePath = function() {
					if (!$scope.card) {
						return defaultImagePath;
					} else {
						return cardService.getCardImagePath($scope.card.rank, $scope.card.suit);
					}
				};
			}]
		};
	}]);

})(window);