describe('unit test for add player controller', function() {
	var scope, $modalInstance;

	var mockModalInstanceService = {
		close: function(player) {},

		dismiss: function(reason) {}
	};

	beforeEach(module('holdemControllers'));
	beforeEach(module('ui.bootstrap'));

	beforeEach(module('holdemServices', function($provide) {
		$provide.value('modalInstance', mockModalInstanceService);
	}));

	beforeEach(inject(function($injector) {
		scope = $injector.get('$rootScope').$new();
		$modalInstance = $injector.get('modalInstance');

		$controller = $injector.get('$controller');

		$controller('AddPlayerCtrl', {
			$scope: scope,
			$modalInstance: $modalInstance
		});
	}));

	describe('test scope functions', function() {
		beforeEach(function() {
			spyOn(mockModalInstanceService, 'close');
			spyOn(mockModalInstanceService, 'dismiss');
		});

		it('should digest data on ok click', function() {
			scope.player = null;
			scope.ok();

			expect(mockModalInstanceService.close).toHaveBeenCalledWith(null);
			expect(mockModalInstanceService.close.calls.count()).toEqual(1);
			mockModalInstanceService.close.calls.reset();

			scope.player = { name: 'Hans', stack: '2000' };
			scope.ok();

			expect(mockModalInstanceService.close).toHaveBeenCalledWith({
				name: 'Hans', stack: 2000
			});
			expect(mockModalInstanceService.close.calls.count()).toEqual(1);
			mockModalInstanceService.close.calls.reset();
		});

		it('should receive cancel message on cancel click', function() {
			scope.cancel();

			expect(mockModalInstanceService.dismiss).toHaveBeenCalledWith('cancel');
			expect(mockModalInstanceService.dismiss.calls.count()).toEqual(1);
			mockModalInstanceService.dismiss.calls.reset();
		});
	});
});
