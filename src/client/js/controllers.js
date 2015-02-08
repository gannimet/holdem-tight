(function(window, undefined) {
		
	var holdemControllers = angular.module('holdemControllers', []);

	holdemControllers.controller('GameCtrl',
			['$scope', 'gameService', 'uiService',
			function($scope, gameService, uiService) {
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
	}]);

})(window);
