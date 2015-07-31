(function(window, undefined) {
	
	var holdemConstants = angular.module('holdemConstants');

	holdemConstants.constant('HOLDEM_ACTIONS', {
		FOLD: 'fold',
		CALL: 'call',
		RAISE: 'raise',
		BET: 'bet',
		CHECK: 'check'
	});

})(window);