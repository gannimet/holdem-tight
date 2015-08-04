(function(window, undefined) {
	
	var holdemServices = angular.module('holdemServices');

	holdemServices.factory('uiService', [
			'$modal', 'cardService', '$filter',
			function($modal, cardService, $filter) {
		return {

			successMessage: function(message) {
				alertify.success(message);
			},

			errorMessage: function(message) {
				alertify.error(message);
			},

			infoMessage: function(message) {
				alertify.message(message);
			},

			promptForNewPlayer: function(callback) {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: '/partials/add-player',
					controller: 'AddPlayerCtrl',
					size: 'sm',
					backdrop: true
				});

				modalInstance.result.then(callback);
			},

			promptForHoleCards: function(playerIndex, card1, card2) {
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: '/partials/assign-hole-cards',
					controller: 'HoleCardsCtrl',
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
					controller: 'CommunityCardsCtrl',
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
			},

			getHoleCardTooltip: function(holeCards) {
				if (!holeCards || !holeCards.length) {
					return 'No hole cards assigned';
				}

				var card1 = holeCards[0];
				var card2 = holeCards[1];
				var html = '';

				if (card1) {
					html += thumbnailHtml(card1);
				}

				if (card2) {
					html += thumbnailHtml(card2);
				}

				return $(html);
			}

		};

		function thumbnailHtml(card) {
			return '<img class="tooltip-thumbnail" src="' + cardService.getCardImagePath(card.rank, card.suit) +
				'" alt="' + $filter('cardName')(card) + '" />';
		}
	}]);

})(window);
