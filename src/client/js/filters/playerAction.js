(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('playerAction', ['HOLDEM_ACTIONS', function(HOLDEM_ACTIONS) {
		return function(action) {
			if (action) {
				var actionName = action.action;

				if (actionName === HOLDEM_ACTIONS.CHECK || actionName === HOLDEM_ACTIONS.FOLD) {
					return action.action;
				} else {
					return action.action + ' ' + action.amount;
				}
			} else {
				return '';
			}
		};
	}]);

})(window);