(function(window, undefined) {
	
	var holdemFilters = angular.module('holdemFilters');

	holdemFilters.filter('streets', [function() {
		return function(street, appendCards, uppercase) {
			if (street) {
				if (street === 'flop') {
					if (appendCards) {
						return uppercase ? 'Flop cards' : 'flop cards';
					} else {
						return uppercase ? 'Flop' : 'flop';
					}
				}

				if (street === 'turn') {
					if (appendCards) {
						return uppercase ? 'Turn card' : 'turn card';
					} else {
						return uppercase ? 'Turn' : 'turn';
					}
				}

				if (street === 'river') {
					if (appendCards) {
						return uppercase ? 'River card' : 'river card';
					} else {
						return uppercase ? 'River' : 'river';
					}
				}
			}
		};
	}]);

})(window);