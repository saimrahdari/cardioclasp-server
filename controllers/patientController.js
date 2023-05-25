var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var router = express.Router();
router.use(bodyParser.json());

var asyncHandler = require('../middleware/asyncHandler');
var ErrorHandler = require('../utils/error');
var authenticate = require('../middleware/patientAuth');

var Patient = require('../models/patient');
var Otp = require('../models/otp');
var Appointment = require('../models/appointments');

exports.register = async (req, res, next) => {
	var exists = [];
	exists = await Patient.find({ email: req.body.email });
	if (exists.length !== 0) {
		next(new ErrorHandler('Email already associated with an account', 409));
	} else {
		try {
			const patient = await Patient.register(
				new Patient({
					email: req.body.email,
					name: req.body.full_name,
					gender: req.body.gender,
					age: req.body.age,
					location: req.body.location,
					contact: req.body.contact,
					history: req.body.history,
				}),
				req.body.password
			);
			if (patient) {
				try {
					await patient.save();
					passport.authenticate('local')(req, res, () => {
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
		patient: req.user._id,
	});
});

exports.getPatient = asyncHandler(async (req, res) => {
	res.json({ patient: req.user });
});

exports.getOtp = asyncHandler(async (req, res, next) => {
	var exists = [];
	exists = await Patient.find({ email: req.params.email });

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
	let patient = await Patient.findOne({ email: req.body.email });
	let newPatient = await patient.setPassword(req.body.password);
	newPatient.save();
	res.status(204).json();
});

exports.editPatient = asyncHandler(async (req, res) => {
	let update = {
		email: req.body.email,
		name: req.body.full_name,
		gender: req.body.gender,
		age: req.body.age,
		location: req.body.location,
		contact: req.body.contact,
		history: req.body.history,
	};
	let doc = await Patient.findByIdAndUpdate(req.user._id, update);
	res.status(204).json({});
});

exports.uploadMedicalReports = asyncHandler(async (req, res) => {
	await Patient.findByIdAndUpdate(
		{ _id: req.user._id },
		{
			$push: {
				reports: {
					report: req.body.report,
				},
			},
		},
		{ new: true, upset: false }
	);
	res.status(204).json({ success: true });
});

exports.getWorkingHour = asyncHandler(async (req, res) => {
	let d = new Date(req.params.date);
	let day = d.getDay();
	let date = await Doctor.find({ _id: req.params.did });
	res.status(200).json({ hour: date.timings[day - 1] });
});

exports.bookAppointment = asyncHandler(async (req, res) => {
	const date_sent = parseInt(req.params.date);
	let d = new Date(date_sent);
	var hour = d.getHours();
	var day = d.getDate();
	var weekday = d.getDay();
	var arr = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];
	var weekdayname = arr[weekday];
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	let booked = [];
	booked = await Appointment.find({
		doctor: req.params.did,
		day,
		month,
		year,
	});
	if (booked.length === 0) {
		await Appointment.create({
			doctor: req.params.did,
			patient: req.params.pid,
			day,
			hour,
			month,
			year,
			description: req.body.description,
			weekday: weekdayname,
		});
		return res.status(200).json();
	} else {
		let sameHour = await Appointment.findOne({
			doctor: req.params.did,
			hour,
		});
		if (sameHour) {
			return res.status(400).json({ message: 'Already booked' });
		} else {
			await Appointment.create({
				doctor: req.params.did,
				patient: req.params.pid,
				day,
				hour,
				month,
				year,
				description: req.body.description,
				weekday: weekdayname,
			});
			return res.status(200).json();
		}
	}
});

exports.getAppointments = asyncHandler(async (req, res) => {
	let appointments = await Appointment.find({ patient: req.user._id });
	res.status(200).json({ appointments });
});

exports.getSingleAppointment = asyncHandler(async (req, res) => {
	let appointment = await Appointment.findById(req.params.id)
		.populate('doctor')
		.populate('patient');
	res.status(200).json({ appointment });
});

exports.getMedicalRecords = asyncHandler(async (req, res) => {
	let record = await Patient.findById(req.params.id);
	res.status(200).json({ reports: record.reports });
});

exports.getCurrentBooking = asyncHandler(async (req, res) => {
	let d = new Date(Date.now());
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	let appointment = await Appointment.find({
		patient: req.user._id,
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

exports.getPreviousBookings = asyncHandler(async (req, res) => {
	var d = new Date(Date.now());
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	var previous_appointments = [];
	let appointment = await Appointment.find({
		patient: req.user._id,
	})
		.populate('patient')
		.populate('doctor');
	if (appointment.length === 0) {
		return res
			.status(404)
			.json({ message: 'No Previous Appointments Found' });
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
		return res
			.status(404)
			.json({ message: 'No Previous Appointments Found.' });
	}
	res.status(200).json({ previous_appointments });
});
