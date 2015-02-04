describe('unit test for blog controller', function() {
	beforeEach(module('blogControllers'));

	var ctrl, scope, entryServiceMock, deferred;

	beforeEach(inject(function($controller, $rootScope, $q) {
		// Create a new scope that's a child of the root scope
		scope = $rootScope.$new();

		// Mock our service
		entryServiceMock = {
			allEntries: function() {
				deferred = $q.defer();
				return deferred.promise;
			}
		};
		spyOn(entryServiceMock, 'allEntries').andCallThrough();

		ctrl = $controller('BlogCtrl', {
			$scope: scope,
			entryService: entryServiceMock
		});
	}));

	it('should assign data to scope after calling EntryService', function() {
		var testData = {
			data: {
				entries: ['just a test']
			}
		};

		deferred.resolve(testData);
		scope.$digest();

		expect(entryServiceMock.allEntries).toHaveBeenCalled();
		expect(scope.entries).toBe(testData.data.entries);
	});
});
