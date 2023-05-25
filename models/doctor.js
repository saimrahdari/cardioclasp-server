var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var Doctor = new Schema({
	experience: {
		type: String,
		default: '',
	},
	location: {
		type: String,
		default: '',
	},
	gender: {
		type: String,
		default: '',
	},
	email: {
		type: String,
		default: '',
	},
	name: { type: String },
	certificate: { type: String, default: '' },
	approval: { type: Boolean, default: false },
	timings: {
		type: [String],
		default: [
			'12:00 AM - 12:00 PM',
			'12:00 AM - 12:00 PM',
			'12:00 AM - 12:00 PM',
			'12:00 AM - 12:00 PM',
			'12:00 AM - 12:00 PM',
			'12:00 AM - 12:00 PM',
			'12:00 AM - 12:00 PM',
		],
	},
});

Doctor.plugin(passportLocalMongoose, {
	usernameField: 'email',
});

module.exports = mongoose.model('Doctor', Doctor);
