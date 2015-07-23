(function(window, undefined) {
	
	var holdemServices = angular.module('holdemServices');

	holdemServices.factory('uiService', ['$modal', function($modal) {
		return {

			successMessage: function(message) {
				alertify.success(message);
			},

			errorMessage: function(message) {
				alertify.error(message);
			},

			infoMessage: function(message) {
				alertify.info(message);
			},

			promptForNewPlayer: function(callback) {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: '/partials/add-player',
					controller: 'AddPlayerController',
					size: 'sm',
					backdrop: true
				});

				modalInstance.result.then(callback);
			},

			promptForHoleCards: function(playerIndex, card1, card2) {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: '/partials/assign-hole-cards',
					controller: 'HoleCardsController',
					size: 'md',
					backdrop: true,
					resolve: {
						player: function() {
							return playerIndex;
						},
						card1: function() {
							return card1;
						},
						card2: function() {
							return card2;
						}
					}
				});
			},

			promptForCommunityCards: function(street, card1, card2, card3) {
				$modal.open({
					animation: true,
					templateUrl: '/partials/assign-community-cards',
					controller: 'CommunityCardsController',
					size: 'md',
					backdrop: true,
					resolve: {
						street: function() {
							return street;
						},
						card1: function() {
							return card1;
						},
						card2: function() {
							return card2;
						},
						card3: function() {
							return card3;
						}
					}
				});
			},

			confirmDecision: function(message, okText, cancelText, positiveCallback, negativeCallback) {
				alertify.set({
					labels: {
						ok: okText,
						cancel: cancelText
					}
				});
				alertify.confirm(message, function(e) {
					if (e) {
						if (positiveCallback) {
							positiveCallback();
						}
					} else {
						if (negativeCallback) {
							negativeCallback();
						}
					}
				});
			}

		};
	}]);

})(window);