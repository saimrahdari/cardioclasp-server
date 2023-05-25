var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.json());
var stripe = require('stripe')(process.env.SECRET_KEY);

var asyncHandler = require('../middleware/asyncHandler');
var Payment = require('../models/payments');

exports.createPayment = asyncHandler(async (req, res, next) => {
	const paymentIntent = await stripe.paymentIntents.create({
		amount: req.body.amount,
		currency: 'pkr',
		automatic_payment_methods: {
			enabled: true,
		},
	});
	res.json({
		clientSecret: paymentIntent.client_secret,
	});
});

exports.addPayment = asyncHandler(async (req, res, next) => {
	await Payment.create({ payer: req.user._id, amount: req.body.amount });
	res.json({ success: true });
});
