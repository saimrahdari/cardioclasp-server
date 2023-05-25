var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.json());

var asyncHandler = require('../middleware/asyncHandler');
var authenticate = require('../middleware/adminAuth');

var Doctor = require('../models/doctor');
var Patient = require('../models/patient');

exports.signIn = asyncHandler(async (req, res) => {
	let token = authenticate.getToken({ _id: req.user._id });
	res.status(200).json({
		success: true,
		token: token,
		admin: req.user._id,
	});
});

exports.getAdmin = asyncHandler(async (req, res) => {
	res.json({ admin: req.user });
});

exports.editDoctor = asyncHandler(async (req, res) => {
	let update = {
		email: req.body.email,
		name: req.body.full_name,
		gender: req.body.gender,
		location: req.body.location,
		experience: req.body.experience,
	};
	let doc = await Doctor.findByIdAndUpdate(req.params.did, update);
	res.status(204).json({});
});

exports.changeDoctorStatus = asyncHandler(async (req, res) => {
	let update = { approval: req.params.approval };
	let doctor = await Doctor.findByIdAndUpdate(req.params.did, update);
	res.status(204).json();
});

exports.getDoctors = asyncHandler(async (req, res) => {
	let doctors = await Doctor.find();
	res.status(204).json(doctors);
});

exports.getPatients = asyncHandler(async (req, res) => {
	let patients = await Patient.find();
	res.status(204).json(patients);
});

exports.getDoctor = asyncHandler(async (req, res) => {
	let doctor = await Doctor.findById(req.params.did);
	res.status(204).json(doctor);
});

exports.getPatient = asyncHandler(async (req, res) => {
	let patient = await Patient.findById(req.params.pid);
	res.status(204).json(patient);
});

exports.deleteDoctor = asyncHandler(async (req, res) => {
	await Doctor.deleteOne({ _id: req.params.did });
	res.status(200).json({ message: 'Doctor deleted successfully.' });
});
