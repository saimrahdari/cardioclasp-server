var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Payment = new Schema({
	amount: {
		type: Number,
	},
	payer: {
		type: mongoose.Schema.ObjectId,
		ref: 'Patient',
	},
});

module.exports = mongoose.model('Payment', Payment);
