(function(window, undefined) {
	
	var holdemControllers = angular.module('holdemControllers');

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