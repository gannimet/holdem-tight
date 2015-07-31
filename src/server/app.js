var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Where to find views and how to render them
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Log requests
//app.use(express.logger('dev'));

// Where to find static files, mimicking file system
app.use(express.static(__dirname + '/../../static'));

// To be able to post data using JSON and read the contents
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Homepage
app.get('/', function(req, res) {
	res.render('index');
});

app.get('/partials/:partialName', function(req, res) {
	var partialName = req.params.partialName;

	res.render(partialName);
});

app.post('/api/evaluate', function(req, res) {
	var hands = req.body.hands;

	console.info('hands:', hands);

	res.status(200).json({
		winner: 'everyone\'s a winner baby'
	});
});

// Catch-all for non-matching URLs
// Enables refresh on client-side (URLs would
// otherwise be sent to the server)
app.use(function(req, res) {
	res.render('index');
});

app.listen(3000);
