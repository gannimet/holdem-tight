(function(window, undefined) {
	
	var holdemDirectives = angular.module('holdemDirectives');

	holdemDirectives.directive('cardpicker',
			['$timeout', 'cardService',
			function($timeout, cardService) {
		return {
			restrict: 'E',
			templateUrl: '/html/cardpicker.html',
			replace: true,
			require: 'ngModel',
			scope: {},
			link: function(scope, element, attrs, ngModel) {
				$timeout(function() {
					// $timeout is necessary because elements inside
					// ng-repeat haven't been created during execution
					// of link function

					function madeSelection() {
						var suit = scope.selectedCard.suit;
						var rank = scope.selectedCard.rank;

						if (suit && rank) {
							element.find('.card-thumbnail').attr('src', cardService.getCardImagePath(rank, suit));
							ngModel.$setViewValue(scope.selectedCard);
						}
					}

					function switchButtonAppearance(radioButtonElement) {
						$(radioButtonElement).parent().siblings().removeClass('btn-info').addClass('btn-default');
						$(radioButtonElement).parent().removeClass('btn-default').addClass('btn-info');
					}

					element.find('.suit-radio-button').change(function() {
						var suitCode = $(this).val();
						scope.selectedCard.suit = suitCode;
						madeSelection();

						switchButtonAppearance(this);
					});

					element.find('.rank-radio-button').change(function() {
						var rankCode = $(this).val();
						scope.selectedCard.rank = rankCode;
						madeSelection();

						switchButtonAppearance(this);
					});

					// If a model value is already given,
					// initialize the UI with it
					var oldValue = ngModel.$viewValue;

					if (oldValue) {
						element.find('.suit-radio-button[value=' + oldValue.suit + ']')
							.prop('checked', true)
							.trigger('click')
							.trigger('change');
						element.find('.rank-radio-button[value=' + oldValue.rank + ']')
							.prop('checked', true)
							.trigger('click')
							.trigger('change');
					}
				});
			},
			controller: ['$scope', function($scope) {
				$scope.suits = cardService.allSuits;

				$scope.ranks = cardService.allRanks;

				$scope.getCardImagePath = cardService.getCardImagePath;

				$scope.selectedCard = {};
			}]
		};
	}]);

})(window);