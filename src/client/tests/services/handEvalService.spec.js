describe('handEvalService', function() {
	var handEvalService, $httpBackend, $http, $rootScope;

	// Dummy data
	var hands = [
		{ playerIndex: 0, cardShortHands: ['2c', '5d'] },
		{ playerIndex: 1, cardShortHands: ['6c', '8h'] }
	];
	var board = ['Ts', 'Jc', 'Qh', 'Kd', 'As'];

	beforeEach(module('holdemServices'));

	beforeEach(inject(function($injector) {
		handEvalService = $injector.get('handEvalService');
		$httpBackend = $injector.get('$httpBackend');
		$http = $injector.get('$http');
		$rootScope = $injector.get('$rootScope').$new();
	}));

	describe('success branch', function() {
		beforeEach(function() {
			$httpBackend.whenPOST('/api/evaluate', {
				hands: hands,
				board: board
			}).respond(200, 'data');
		});

		it('should resolve the promise correctly', function() {
			var result;
			handEvalService.evaluateShowdown(hands, board).then(function(data) {
				result = data;
			});

			$httpBackend.flush();

			expect(result).toEqual('data');
		});
	});

	describe('error branch', function() {
		beforeEach(function() {
			$httpBackend.whenPOST('/api/evaluate', {
				hands: hands,
				board: board
			}).respond(500, 'error');
		});

		it('should reject the promise correctly', function() {
			var result;
			handEvalService.evaluateShowdown(hands, board).then(null, function(reason) {
				result = reason;
			});

			$httpBackend.flush();

			expect(result).toEqual('error');
		});
	});
});