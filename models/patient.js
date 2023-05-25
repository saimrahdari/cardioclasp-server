var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var Patient = new Schema({
	age: {
		type: Number,
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
	history: [String],
	name: { type: String, default: '' },
	contact: { type: String, default: '' },
	reports: {
		type: [
			{
				report: {
					type: [String],
				},
			},
		],
	},
});

Patient.plugin(passportLocalMongoose, {
	usernameField: 'email',
});

module.exports = mongoose.model('Patient', Patient);
