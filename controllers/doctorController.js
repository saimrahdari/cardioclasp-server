var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var router = express.Router();
router.use(bodyParser.json());

var asyncHandler = require('../middleware/asyncHandler');
var ErrorHandler = require('../utils/error');
var authenticate = require('../middleware/doctorAuth');

var Doctor = require('../models/doctor');
var Otp = require('../models/otp');
var Appointment = require('../models/appointments');

exports.register = async (req, res, next) => {
	var exists = [];
	exists = await Doctor.find({ email: req.body.email });
	if (exists.length !== 0) {
		next(new ErrorHandler('Email already associated with an account', 409));
	} else {
		try {
			const doctor = await Doctor.register(
				new Doctor({
					email: req.body.email,
					name: req.body.full_name,
					gender: req.body.gender,
					location: req.body.location,
					experience: req.body.experience,
					certificate: req.body.certificate,
				}),
				req.body.password
			);
			if (doctor) {
				try {
					await doctor.save();
					passport.authenticate('local-doctor')(req, res, () => {
						res.status(201).json({
							success: true,
							status: 'Registration Successful!',
						});
					});
				} catch (error) {
					return next(error);
				}
			}
		} catch (error) {
			return next(error);
		}
	}
};

exports.signIn = asyncHandler(async (req, res) => {
	let token = authenticate.getToken({ _id: req.user._id });
	res.status(200).json({
		success: true,
		token: token,
		doctor: req.user._id,
	});
});

exports.getDoctor = asyncHandler(async (req, res) => {
	res.json({ doctor: req.user });
});

exports.getOtp = asyncHandler(async (req, res, next) => {
	var exists = [];
	exists = await Doctor.find({ email: req.params.email });

	if (exists.length === 0) {
		next(new ErrorHandler('Email does not exist', 404));
	} else {
		var existing = await Otp.find({ email: req.params.email });
		if (existing.length > 0) {
			await Otp.deleteOne({ email: req.params.email });
		}
		var a = Math.floor(1000 + Math.random() * 9000).toString();
		var code = a.substring(-2);
		await Otp.create({ token: code, email: req.params.email });
		let transport = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
		const mailOptions = {
			from: process.env.EMAIL,
			to: req.params.email,
			subject: 'OTP Verification',
			text: `Your four-digit verification code is: ${code}`,
		};

		transport.sendMail(mailOptions, function (err, info) {
			if (err) {
				next(new ErrorHandler('Internal Server Error', 500));
			} else {
				res.status(200).json();
			}
		});
	}
});

exports.verifyOtp = asyncHandler(async (req, res, next) => {
	let otp = req.params.otp;
	let email = req.params.email;
	let doc = await Otp.findOne({ email: email });
	if (otp === doc.token) {
		await Otp.deleteOne({ email: email });
		res.status(200).json();
	} else {
		res.status(404).json({ message: 'Invalid or Expired token' });
	}
});

exports.passwordReset = asyncHandler(async (req, res, next) => {
	let doctor = await Doctor.findOne({ email: req.body.email });
	let newDoctor = await doctor.setPassword(req.body.password);
	newDoctor.save();
	res.status(204).json();
});

exports.editDoctor = asyncHandler(async (req, res) => {
	let update = {
		email: req.body.email,
		name: req.body.full_name,
		gender: req.body.gender,
		location: req.body.location,
		experience: req.body.experience,
	};
	let doc = await Doctor.findByIdAndUpdate(req.user._id, update);
	res.status(204).json({});
});

exports.setWorkingHours = asyncHandler(async (req, res) => {
	let update = {
		timings: req.body.timings,
	};
	let doc = await Doctor.findByIdAndUpdate(req.user._id, update);
	res.status(204).json({});
});

exports.getAppointments = asyncHandler(async (req, res) => {
	let appointments = await Appointment.find({ doctor: req.user._id });
	res.status(200).json({ appointments });
});

exports.getSingleAppointment = asyncHandler(async (req, res) => {
	let appointment = await Appointment.findById(req.params.id)
		.populate('doctor')
		.populate('patient');
	res.status(200).json({ appointment });
});

exports.getCurrentBooking = asyncHandler(async (req, res) => {
	const date = Date.now();
	let d = new Date(date);
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	let appointment = await Appointment.find({
		doctor: req.user._id,
		month,
		day,
		year,
	});
	if (appointment.length === 0) {
		return res
			.status(404)
			.json({ message: 'No appointments scheduled for today' });
	}
	res.status(200).json({ appointment });
});

exports.getPreviousPatients = asyncHandler(async (req, res) => {
	var d = new Date(Date.now());
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	var previous_appointments = [];
	let appointment = await Appointment.find({
		doctor: req.user._id,
	})
		.populate('patient')
		.populate('doctor');
	if (appointment.length === 0) {
		return res.status(404).json({ message: 'No Previous Patients Found' });
	}
	for (let i = 0; i < appointment.length; i++) {
		if (appointment[i].year < year) {
			previous_appointments.push(appointment[i]);
		} else if (appointment[i].year === year) {
			if (appointment[i].month < month) {
				previous_appointments.push(appointment[i]);
			} else if (appointment[i].month === month) {
				if (appointment[i].day < day) {
					previous_appointments.push(appointment[i]);
				}
			}
		}
	}
	if (previous_appointments.length === 0) {
		return res.status(404).json({ message: 'No Previous Patients Found.' });
	}
	res.status(200).json({ patients: previous_appointments });
});
