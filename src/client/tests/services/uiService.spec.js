describe('uiService', function() {
	var uiService;

	beforeEach(module('holdemServices'));
	beforeEach(module('ui.bootstrap'));

	beforeEach(inject(function($injector) {
		uiService = $injector.get('uiService');

		spyOn(alertify, 'success');
		spyOn(alertify, 'error');
		spyOn(alertify, 'message');
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
		// TODO
	});
});