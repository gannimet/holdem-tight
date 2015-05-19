(function(window, undefined) {

	var holdemDirectives = angular.module('holdemDirectives', []);

	holdemDirectives.directive('playerPanel',
			['HOLDEM_EVENTS', 'gameService', 'HOLDEM_ACTIONS', 'uiService', '$timeout',
			function(HOLDEM_EVENTS, gameService, HOLDEM_ACTIONS, uiService, $timeout) {
		return {
			restrict: 'E',
			templateUrl: '/partials/player-panel',
			replace: true,
			scope: {
				seatNr: '=seatNr'
			},
			link: function(scope, element, attrs) {
				var playerIndex = scope.seatNr - 1;
				scope.$on(HOLDEM_EVENTS.TURN_ASSIGNED, function(event, whoseTurnItIs) {
					// Is it our player's turn?
					if (whoseTurnItIs === playerIndex) {
						element.addClass('has-turn');
						// have to use $timeout here, because
						// ng-if prevents finding the element
						$timeout(function() {
							element.find('.action-controls input, .action-controls button').prop('disabled', false);
							element.find('input.raise-amount-txt').focus();
						});
					} else {
						element.removeClass('has-turn');
						$timeout(function() {
							element.find('.action-controls input, .action-controls button').prop('disabled', true);
						});
					}
				});
			},
			controller: [
					'$scope', '$timeout',
					function($scope, $timeout) {
				var playerIndex = $scope.seatNr - 1;

				$scope.playerInfo = {
					isDealer: false,
					isSmallBlind: false,
					isBigBlind: false
				};

				/*
				 * UI Event handlers and other functions for the UI
				 * for this directive
				 */
				$scope.showHoleCards = function() {
					uiService.promptForHoleCards(playerIndex);
				};

				$scope.deletePlayer = function() {
					gameService.deletePlayer(playerIndex);
				};

				$scope.isGameStarted = function() {
					return gameService.gameStarted;
				};

				$scope.isCheckingAnOption = function() {
					return gameService.isCheckingAnOptionForPlayer(playerIndex);
				};

				$scope.isBettingAnOption = function() {
					return gameService.isBettingAnOptionForPlayer(playerIndex);
				};

				$scope.getAmountToCall = function() {
					return gameService.getAmountToCallForPlayer(playerIndex);
				};

				$scope.checkFold = function() {
					if ($scope.isCheckingAnOption()) {
						// let's try a check
						try {
							gameService.recordAction({
								player: playerIndex,
								action: HOLDEM_ACTIONS.CHECK
							});
						} catch (e) {
							uiService.errorMessage(e);
						}
					} else {
						// we have to fold then
						try {
							gameService.recordAction({
								player: playerIndex,
								action: HOLDEM_ACTIONS.FOLD
							});
						} catch (e) {
							uiService.errorMessage(e);
						}
					}
				};

				$scope.call = function() {
					var amountToCall = gameService.getAmountToCallForPlayer(playerIndex);

					if (!amountToCall) {
						uiService.errorMessage('A call is not a viable option.');
						return;
					}

					try {
						gameService.recordAction({
							player: playerIndex,
							action: HOLDEM_ACTIONS.CALL,
							amount: amountToCall
						});
					} catch (e) {
						uiService.errorMessage(e);
					}
				};

				$scope.betRaise = function() {
					betRaiseAmount = parseInt($scope.betRaise.amount);
					if (isNaN(betRaiseAmount)) {
						uiService.errorMessage('Bet/raise amount is not numeric.');
					}

					if ($scope.isBettingAnOption()) {
						// try to bet
						try {
							gameService.recordAction({
								player: playerIndex,
								action: HOLDEM_ACTIONS.BET,
								amount: betRaiseAmount
							});
							delete $scope.betRaise;
						} catch (e) {
							uiService.errorMessage(e);
						}
					} else {
						// we have to raise then
						try {
							gameService.recordAction({
								player: playerIndex,
								action: HOLDEM_ACTIONS.RAISE,
								amount: betRaiseAmount
							});
							delete $scope.betRaise;
						} catch (e) {
							uiService.errorMessage(e);
						}
					}
				};

				/*
				 * Scope event handlers
				 */
				$scope.$on(HOLDEM_EVENTS.PLAYER_ADDED, function(event, players) {
					handlePlayerEvent(players);
				});

				$scope.$on(HOLDEM_EVENTS.PLAYER_DELETED, function(event, players) {
					handlePlayerEvent(players);
				});

				$scope.$on(HOLDEM_EVENTS.ROLES_ASSIGNED, function(event, roles) {
					$scope.playerInfo.isDealer     = playerIndex === roles.dealer;
					$scope.playerInfo.isSmallBlind = playerIndex === roles.smallBlind;
					$scope.playerInfo.isBigBlind   = playerIndex === roles.bigBlind;
				});

				$scope.$on(HOLDEM_EVENTS.ACTION_PERFORMED, function(event, action) {
					// Did our player perform the action?
					if (action.player === playerIndex) {
						$scope.playerInfo.mostRecentAction = action;
					}

					if (gameService.isCurrentBettingRoundFinished()) {
						disableAllControls();
					}
				});

				$scope.$on(HOLDEM_EVENTS.NEXT_HAND_DEALT, function(event, handNr) {
					$scope.playerInfo.mostRecentAction = undefined;
				});

				$scope.$on(HOLDEM_EVENTS.BETTING_ROUND_ADVANCED, function(event, bettingRound) {
					enableAllControls();
					$scope.playerInfo.mostRecentAction = null;
				});

				/*
				 * Utility functions
				 */
				function handlePlayerEvent(players) {
					var player = players[playerIndex];

					assignPlayer(player);
				}

				function assignPlayer(player) {
					// this is a hack
					// if we would use $scope.$apply() we
					// would get an error because it gets
					// called in quick succession
					// see: http://stackoverflow.com/a/25149047/1722704
					$timeout(function() {
						$scope.player = player;
					});
				}

				function disableAllControls() {
					$scope.disabled = true;
				}

				function enableAllControls() {
					$scope.disabled = false;
				}
			}]
		};
	}]);

	holdemDirectives.directive('cardpicker',
			['$timeout', 'cardImageService',
			function($timeout, cardImageService) {
		return {
			restrict: 'E',
			templateUrl: '/partials/cardpicker',
			replace: true,
			require: 'ngModel',
			scope: {},
			link: function(scope, element, attrs, ngModel) {
				scope.madeSelection = function() {
					var suit = scope.selectedCard.suit;
					var rank = scope.selectedCard.rank;

					if (suit && rank) {
						element.find('.card-thumbnail').attr('src', cardImageService.getCardImagePath(rank, suit));
						ngModel.$setViewValue(scope.selectedCard);
					}
				};

				$timeout(function() {
					// $timeout is necessary because elements inside
					// ng-repeat haven't been created during execution
					// of link function

					function opticalSugar(radioButtonElement) {
						$(radioButtonElement).parent().siblings().removeClass('btn-info').addClass('btn-default');
						$(radioButtonElement).parent().removeClass('btn-default').addClass('btn-info');
					}

					element.find('.suit-radio-button').change(function() {
						var suit = $(this).val();
						scope.selectedCard.suit = suit;
						scope.madeSelection();

						opticalSugar(this);
					});

					element.find('.rank-radio-button').change(function() {
						var rank = $(this).val();
						scope.selectedCard.rank = rank;
						scope.madeSelection();

						opticalSugar(this);
					});
				});
			},
			controller: ['$scope', function($scope) {
				$scope.suits = [
					{ abbreviation: 'C', name: 'Clubs', code: 'clubs', icon: '♣', color: 'black' },
					{ abbreviation: 'D', name: 'Diamonds', code: 'diamonds', icon: '♦', color: 'red' },
					{ abbreviation: 'H', name: 'Hearts', code: 'hearts', icon: '♥', color: 'red' },
					{ abbreviation: 'S', name: 'Spades', code: 'spades', icon: '♠', color: 'black' }
				];

				$scope.ranks = [
					{ abbreviation: 'A', name: 'Ace', code: 'ace' },
					{ abbreviation: '2', name: 'Deuce', code: '2' },
					{ abbreviation: '3', name: 'Trey', code: '3' },
					{ abbreviation: '4', name: 'Four', code: '4' },
					{ abbreviation: '5', name: 'Five', code: '5' },
					{ abbreviation: '6', name: 'Six', code: '6' },
					{ abbreviation: '7', name: 'Seven', code: '7' },
					{ abbreviation: '8', name: 'Eight', code: '8' },
					{ abbreviation: '9', name: 'Nine', code: '9' },
					{ abbreviation: 'T', name: 'Ten', code: '10' },
					{ abbreviation: 'J', name: 'Jack', code: 'jack' },
					{ abbreviation: 'Q', name: 'Queen', code: 'queen' },
					{ abbreviation: 'K', name: 'King', code: 'king' },
				];

				$scope.getCardImagePath = cardImageService.getCardImagePath;

				$scope.selectedCard = {};
			}]
		};
	}]);

})(window);
