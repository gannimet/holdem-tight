(function(window, undefined) {
	
	var holdemDirectives = angular.module('holdemDirectives');

	holdemDirectives.directive('playerPanel',
			['HOLDEM_EVENTS', 'gameService', 'HOLDEM_ACTIONS', 'uiService', '$timeout',
			function(HOLDEM_EVENTS, gameService, HOLDEM_ACTIONS, uiService, $timeout) {
		return {
			restrict: 'E',
			templateUrl: '/html/player-panel.html',
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

				// Activate tooltips as soon as hole card badge is available
				scope.$on(HOLDEM_EVENTS.GAME_STARTED, function(event) {
					$timeout(function() {
						var holeCardBadge = element.find('.assign-cards-badge');

						holeCardBadge.tooltipster({
							content: $('No hole cards assigned'),
							contentAsHtml: true,
							theme: 'tooltipster-light',
							functionBefore: function(origin, continueTooltipster) {
								continueTooltipster();

								origin.tooltipster('content', scope.getHoleCardTooltip());
							}
						});
					});
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
					var holeCards = gameService.getHoleCardsOfPlayerInCurrentHand(playerIndex);
					uiService.promptForHoleCards(
						playerIndex,
						holeCards ? holeCards[0] : undefined,
						holeCards ? holeCards[1] : undefined
					);
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

				$scope.getHoleCardTooltip = function() {
					return uiService.getHoleCardTooltip(
						gameService.getHoleCardsOfPlayerInCurrentHand(playerIndex)
					);
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

})(window);