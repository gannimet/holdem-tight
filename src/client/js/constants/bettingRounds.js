(function(window, undefined) {
	
	var holdemConstants = angular.module('holdemConstants');

	holdemConstants.constant('HOLDEM_BETTING_ROUNDS', {
		PRE_FLOP: 'pre_flop',
		FLOP: 'flop',
		TURN: 'turn',
		RIVER: 'river'
	});

})(window);