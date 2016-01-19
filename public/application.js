const socket = io();
// const relevantChannel = ;

socket.on('connect', function () {
  console.log('Connection established.');
});

socket.on('returning', function (message) {
	console.log(message);
});

$('#make-new-slot').on('click', function(e) {
	var datetime = $('#new-appointment-date').val() + 'T' + $('#new-appointment-time').val();
	console.log('Sending ' + datetime);
	socket.send($('#make-new-slot').attr('data-for') + '-new-slot', {
		datetime: datetime
	});
});