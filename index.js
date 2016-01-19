const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const moment = require('moment');

const path = require('path');
const bodyParser = require('body-parser');
const jsSHA = require('jssha');
var hasher = new jsSHA('SHA-512', 'TEXT');
var id = 0;

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
		appointments: {}
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
  	if(channel.includes('new-slot', 9)) {
  		var schedule = channel.slice(0,8);
  		var appointment = {
  			id: id,
   			taken: false,
  			date: moment.utc(message['date']),
  			startmoment: moment.utc(message['startmoment']),
  			endmoment: moment.utc(message['endmoment']),
  			notes: message['notes']
  		};
  		app.locals.allSchedules[schedule]['appointments'][id] = appointment;
  		id++;
  		io.sockets.emit(schedule, appointment);
  	} else if(channel.includes('booking', 9)) {
  		var schedule = channel.slice(0,8);
  		app.locals.allSchedules[schedule]['appointments'][message['id']].taken = true;
  		io.sockets.emit(schedule, app.locals.allSchedules[schedule]['appointments'][message['id']]);
  	}
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('Server is up.');
});