var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../middleware/doctorAuth');
var doctorController = require('../controllers/doctorController');

// ? doctor Routes //
router.get('/otp/:email', doctorController.getOtp);
router.get('/otpVerify/:email/:otp', doctorController.verifyOtp);
router.get('/doctor', authenticate.verifyDoctor, doctorController.getDoctor);
router.get(
	'/appointments',
	authenticate.verifyDoctor,
	doctorController.getAppointments
);
router.get(
	'/currentbooking',
	authenticate.verifyDoctor,
	doctorController.getCurrentBooking
);
router.get(
	'/appointment/:id',
	authenticate.verifyDoctor,
	doctorController.getSingleAppointment
);
router.get(
	'/previouspatients',
	authenticate.verifyDoctor,
	doctorController.getPreviousPatients
);
router.post('/register', doctorController.register);
router.post(
	'/sign-in',
	passport.authenticate('local-doctor'),
	doctorController.signIn
);
router.patch('/reset-password', doctorController.passwordReset);
router.patch(
	'/editdoctor',
	authenticate.verifyDoctor,
	doctorController.editDoctor
);
router.patch(
	'/edittimings',
	authenticate.verifyDoctor,
	doctorController.setWorkingHours
);

module.exports = router;
