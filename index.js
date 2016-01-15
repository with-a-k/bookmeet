const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const path = require('path');
const jsSHA = require('jsSHA');
var hasher = new jsSHA('SHA-512', 'TEXT');

app.use(express.static('public'));

var allSchedules = {};

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/manage/:id', function (req, res) {

});

app.get('/book/:id', function (req, res) {

});

io.on('connection', function (socket) {
  socket.on('message', function (channel, message) {
  	console.log('Received ' + message['name']);
  	if(channel === 'new schedule') {
  		console.log('Creating new schedule...')
  		hasher.update(message['name'] + '-admin');
			var manageId = hasher.getHash('HEX').slice(0,8);
			hasher.update(message['name'] + '-bookers');
			var bookerId = hasher.getHash('HEX').slice(0,10);
			allSchedules[manageId] = {
				name: message['name'],
				manageId: manageId,
				bookerId: bookerId,
				appointments: []
			}
			io.sockets.emit('returning', allSchedules[manageId]);
  	}
  });
});

http.listen(process.env.PORT || 3000, function(){
  console.log('Your server is up and running on Port 3000. Good job!');
});