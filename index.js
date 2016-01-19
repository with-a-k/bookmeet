const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const moment = require('moment');

const path = require('path');
const bodyParser = require('body-parser');
const jsSHA = require('jsSHA');
const pry = require('pryjs');
var hasher = new jsSHA('SHA-512', 'TEXT');

app.use( bodyParser.urlencoded({ extended: true }) );
app.use(express.static('public'));
app.set('view engine', 'jade');

app.locals.title = "Bookmeet";

app.locals.allSchedules = {};

app.get('/', function (req, res) {
  res.render('index');
});

app.post('/schedules', function (req, res) {
	if (!req.body.name) { return response.sendStatus(400); }

  hasher.update(req.body.name + String(Math.random()) + '-admin');
	var manageId = hasher.getHash('HEX').slice(0,8);
	hasher.update(req.body.name + String(Math.random()) + '-bookers');
	var bookerId = hasher.getHash('HEX').slice(0,10);

  app.locals.allSchedules[manageId] = {
		name: req.body.name,
		manageId: manageId,
		bookerId: bookerId,
		appointments: []
	}
	console.log('Redirecting to ' + manageId);
  res.redirect('/manage/' + manageId);
});

app.get('/manage/:id', function (req, res) {
	res.render('manage', {schedule: app.locals.allSchedules[req.params.id]});
});

app.get('/book/:id', function (req, res) {
	res.render('book', {schedule: app.locals.allSchedules[req.params.id.slice(0,8)]});
});

io.on('connection', function (socket) {
  socket.on('message', function (channel, message) {
  	console.log('Received message on ' + channel);
  	if(channel.includes('new-slot', 9)) {
  		var schedule = channel.slice(0,8);
  		var datetime = moment.utc(message['datetime']);
  		console.log('Creating new slot for ' + channel.slice(0,8) + ' on ' + message['datetime']);
  		var appointment = {
  			taken: false,
  			date: datetime
  		};
  		app.locals.allSchedules[schedule]['appointments'].push(appointment);
  		console.log(app.locals.allSchedules[schedule]['appointments']);
  		io.sockets.emit(schedule, appointment);
  	}
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('Your server is up and running on Port 3000. Good job!');
});