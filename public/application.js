const socket = io();
const relevantChannel = $('h3.appointments-header').attr('data-schedule');

socket.on('connect', function () {
  console.log('Connection established.');
});

socket.on(relevantChannel, function (message) {
	console.log(message);
	updateAppointment(message, $('.rolekeeper').attr('data-role'));
});

function updateAppointment (appointment, role) {
	if($('[data-id="' + appointment.id + '"]').length != 0) {
		console.log('Already on the page.')
		if(role === 'manager') {
			$('[data-id="' + appointment.id + '"]').replaceWith(adminAppointment(appointment));
		} else {
			$('[data-id="' + appointment.id + '"]').replaceWith(bookerAppointment(appointment));
		}
	} else {
		console.log('Not on the page.')
		if(role === 'manager') {
			$('ul.appointments').append(adminAppointment(appointment));
		} else {
			$('ul.appointments').append(bookerAppointment(appointment));
		}
	}
}

function adminAppointment (appointment) {
	return $('<li data-id="' + appointment.id + '" class="appointment">' +
		'<span>' + moment.utc(appointment.startmoment).format('MMM D') + ' - ' + appointment.notes + '</span><br>' +
		'<span>Starting ' + moment.utc(appointment.startmoment).format('h:mm a') + '</span><br>' +
		'<span>Ending ' + moment.utc(appointment.endmoment).format('h:mm a') + '</span><br>' +
		'<span class="booker">Booked? ' + appointment.taken + '</span></li>')
}

function bookerAppointment (appointment) {
	var item = $('<li data-id="' + appointment.id + '" class="appointment">' +
		'<span>' + moment.utc(appointment.startmoment).format('MMM D') + ' - ' + appointment.notes + '</span><br>' +
		'<span>Starting ' + moment.utc(appointment.startmoment).format('h:mm a') + '</span><br>' +
		'<span>Ending ' + moment.utc(appointment.endmoment).format('h:mm a') + '</span><br></li>')
	if(appointment.taken) {
		item.append('<span>Not Available</span>');
	} else {
		item.append('<button type="submit" data-id="' + appointment.id + '" class="book-appointment>Book</button>');
	}
	return item;
}

$('#make-new-slot').on('click', function(e) {
	var date = $('#new-appointment-date').val();
	var starts = $('#new-appointment-start-time').val();
	var ends = $('#new-appointment-end-time').val();
	var notes = $('#new-appointment-comments').val();
	socket.send($('#make-new-slot').attr('data-for') + '-new-slot', {
		date: date,
		startmoment: moment.utc(date + 'T' + starts),
		endmoment: moment.utc(date + 'T' + ends),
		notes: notes
	});
});

$('.book-appointment').on('click', function(e) {
	var id = $(e.target).attr('data-id');
	socket.send($('h3.appointments-header').attr('data-schedule') + '-booking', {
		id: id
	})
});