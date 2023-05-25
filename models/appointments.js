var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Appointment = new Schema({
	doctor: { type: mongoose.Schema.ObjectId, ref: 'Doctor' },
	patient: { type: mongoose.Schema.ObjectId, ref: 'Patient' },
	year: { type: Number },
	month: { type: Number },
	day: {
		type: Number,
	},
	hour: {
		type: Number,
	},
	weekday: {
		type: String,
	},
	description: { type: String },
});

module.exports = mongoose.model('Appointment', Appointment);
