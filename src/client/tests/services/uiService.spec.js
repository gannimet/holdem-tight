describe('uiService', function() {
	var uiService, $modal, $q, $rootScope, cardService;

	var mockModalInstance = {};
	var mockPlayer = { name: 'Hans', stack: 2000 };

	beforeEach(module('holdemServices'));
	beforeEach(module('ui.bootstrap'));
	beforeEach(module(function($provide) {
		$provide.value('cardNameFilter', function(card) {
			return 'card-name';
		});
	}));

	beforeEach(inject(function($injector) {
		uiService = $injector.get('uiService');
		$modal = $injector.get('$modal');
		$q = $injector.get('$q');
		$rootScope = $injector.get('$rootScope').$new();
		cardService = $injector.get('cardService');

		spyOn(alertify, 'success');
		spyOn(alertify, 'error');
		spyOn(alertify, 'message');

		var deferred = $q.defer();
		deferred.resolve(mockPlayer);
		mockModalInstance.result = deferred.promise;

		spyOn($modal, 'open').and.returnValue(mockModalInstance);
	}));

	describe('alertify messages', function() {
		beforeEach(function() {
			alertify.success.calls.reset();
			alertify.error.calls.reset();
			alertify.message.calls.reset();
		});

		it('should call success', function() {
			uiService.successMessage('success');

			expect(alertify.success).toHaveBeenCalledWith('success');
		});

		it('should call error', function() {
			uiService.errorMessage('error');

			expect(alertify.error).toHaveBeenCalledWith('error');
		});

		it('should call message', function() {
			uiService.infoMessage('info');

			expect(alertify.message).toHaveBeenCalledWith('info');
		});
	});

	describe('prompts', function() {
		beforeEach(function() {
			$modal.open.calls.reset();
		});

		it('should prompt for new player and call callback', function() {
			var mockCallbackObj = {
				callback: function() {}
			};

			spyOn(mockCallbackObj, 'callback');

			uiService.promptForNewPlayer(mockCallbackObj.callback);

			$rootScope.$apply();

			expect($modal.open).toHaveBeenCalledWith({
				animation: true,
				templateUrl: '/partials/add-player',
				controller: 'AddPlayerCtrl',
				size: 'sm',
				backdrop: true
			});
			expect(mockCallbackObj.callback).toHaveBeenCalledWith(mockPlayer);
		});

		it('should prompt for hole cards', function() {
			uiService.promptForHoleCards(2, { rank: 'ace', suit: 'clubs' }, { rank: '10', suit: 'hearts' });

			var args = $modal.open.calls.mostRecent().args[0];
			
			expect(args.controller).toEqual('HoleCardsCtrl');
			expect(args.resolve.player()).toEqual(2);
			expect(args.resolve.card1()).toEqual({ rank: 'ace', suit: 'clubs' });
			expect(args.resolve.card2()).toEqual({ rank: '10', suit: 'hearts' });
		});

		it('should prompt for community cards', function() {
			uiService.promptForCommunityCards('turn', { rank: 'ace', suit: 'clubs' });

			var args = $modal.open.calls.mostRecent().args[0];
			
			expect(args.controller).toEqual('CommunityCardsCtrl');
			expect(args.resolve.street()).toEqual('turn');
			expect(args.resolve.card1()).toEqual({ rank: 'ace', suit: 'clubs' });
			expect(args.resolve.card2()).toBeUndefined();
			expect(args.resolve.card3()).toBeUndefined();
		});
	});

	describe('hole card tooltips', function() {
		var dummyCard = '/img/10_of_clubs.svg';

		beforeEach(function() {
			spyOn(cardService, 'getCardImagePath').and.returnValue(dummyCard);
		});

		it('should construct correct html string', function() {
			var actualTooltip = uiService.getHoleCardTooltip([
				{ rank: 'ace', suit: 'clubs' }, { rank: '10', suit: 'hearts' }
			]);

			var expectedTooltip = $('<img class="tooltip-thumbnail" src="' + dummyCard + '" alt="card-name" />' +
				'<img class="tooltip-thumbnail" src="' + dummyCard + '" alt="card-name" />');

			expect(actualTooltip.length).toEqual(2);
			expect(actualTooltip[0].outerHTML).toEqual(expectedTooltip[0].outerHTML);
			expect(actualTooltip[1].outerHTML).toEqual(expectedTooltip[1].outerHTML);
		});

		it('should return placeholder string if no hole cards given', function() {
			expect(uiService.getHoleCardTooltip(undefined)).toEqual('No hole cards assigned');
			expect(uiService.getHoleCardTooltip([])).toEqual('No hole cards assigned');
		});
	});

	describe('confirm dialogs', function() {
		beforeEach(function() {
			spyOn(alertify, 'set');
			spyOn(alertify, 'confirm').and.callFake(function(message, callback) {
				if (message === 'positive') {
					callback('positive');
				} else {
					callback();
				}
			});

			alertify.set.calls.reset();
			alertify.confirm.calls.reset();
		});

		it('should set the correct button texts on alertify', function() {
			uiService.confirmDecision('message', 'okText', 'cancelText', function() {}, function() {});

			expect(alertify.set).toHaveBeenCalledWith({
				labels: {
					ok: 'okText',
					cancel: 'cancelText'
				}
			});
		});

		describe('callbacks', function() {
			var success, error;

			beforeEach(function() {
				success = jasmine.createSpy('success');
				error = jasmine.createSpy('error');

				success.calls.reset();
				error.calls.reset();
			});

			it('should call success callback', function() {
				uiService.confirmDecision('positive', 'ok', 'cancel', success, error);

				expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
			});

			it('should call error callback', function() {
				uiService.confirmDecision('negative', 'ok', 'cancel', success, error);

				expect(success).not.toHaveBeenCalled();
				expect(error).toHaveBeenCalled();
			});
		});
	});
});