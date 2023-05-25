var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../middleware/patientAuth');
var patientController = require('../controllers/patientController');
var paymentController = require('../controllers/paymentController');

// ? patient Routes //
router.get('/otp/:email', patientController.getOtp);
router.get('/otpVerify/:email/:otp', patientController.verifyOtp);
router.get(
	'/patient',
	authenticate.verifyPatient,
	patientController.getPatient
);
router.get(
	'/getworkinghour/:did/:date',
	authenticate.verifyPatient,
	patientController.getWorkingHour
);
router.get(
	'/appointments',
	authenticate.verifyPatient,
	patientController.getAppointments
);
router.get(
	'/appointment/:id',
	authenticate.verifyPatient,
	patientController.getSingleAppointment
);
router.get(
	'/currentbooking',
	authenticate.verifyPatient,
	patientController.getCurrentBooking
);
router.get(
	'/previousbookings',
	authenticate.verifyPatient,
	patientController.getPreviousBookings
);
router.get(
	'/viewmedicalrecords',
	authenticate.verifyPatient,
	patientController.getMedicalRecords
);
router.get(
	'/patient',
	authenticate.verifyPatient,
	patientController.getPatient
);
router.post('/register', patientController.register);
router.post(
	'/sign-in',
	passport.authenticate('local'),
	patientController.signIn
);
router.post(
	'/book/:date/:pid/:did',
	authenticate.verifyPatient,
	patientController.bookAppointment
);
router.patch('/reset-password', patientController.passwordReset);
router.patch(
	'/edit-patient',
	authenticate.verifyPatient,
	patientController.editPatient
);
router.patch(
	'/add-reports',
	authenticate.verifyPatient,
	patientController.uploadMedicalReports
);
router.post(
	'/create-payment',
	authenticate.verifyPatient,
	paymentController.createPayment
);
router.post(
	'/add-payment',
	authenticate.verifyPatient,
	paymentController.addPayment
);

module.exports = router;
