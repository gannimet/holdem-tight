var should = require('should');
var supertest = require('supertest');
var app = require('../app.js');
var api = supertest('http://localhost:3000');

describe('/evaluate', function() {
	it('returns a game result for a valid result', function(done) {
		api
			.post('/api/evaluate')
			.send({
				hands: [
					{ playerIndex: 0, cardShortHands: ['Ts', 'Qc'] },
					{ playerIndex: 1, cardShortHands: ['2s', 'Ad'] },
					{ playerIndex: 2, cardShortHands: ['2h', 'Ac'] },
					{ playerIndex: 3, cardShortHands: ['9c', '8s'] }
				],
				board: ['Ah', 'Kc', '6s', '7d', 'Th']
			})
			.set('Content-Type', 'application/json')
			.expect(200)
			.expect('Content-Type', /json/)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}

				res.body.should.have.a.property('playerRanking');
				res.body.should.have.a.property('winningHandNames');

				done();
			});
	});
});

describe('root resource', function() {
	it('returns the index template', function(done) {
		api
			.get('/')
			.expect(200)
			.expect('Content-Type', /html/)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}

				done();
			});
	});
});

describe('/partials/:partialName', function() {
	it('returns the requested partial', function(done) {
		api
			.get('/partials/cardpicker')
			.expect(200)
			.expect('Content-Type', /html/)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}

				done();
			});
	});

	xit('produces 404 on non-existent partial', function(done) {
		api
			.get('/partials/cardpicker')
			.expect(404)
			.end(function(err, res) {
				if (err) {
					return done(err);
				}

				done();
			});
	});
});