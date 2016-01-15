const socket = io();

socket.on('connect', function () {
  console.log('Connection established.');
});

socket.on('returning', function (message) {
	console.log(message);
});

$('.new-schedule').on('click', function(e) {
	e.preventDefault();

	var name = $('.new-schedule-name').val();
	console.log('Sending ' + name);
	socket.send('new schedule', {
		name: name
	});
});