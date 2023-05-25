var express = require('express');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../middleware/adminAuth');
var adminController = require('../controllers/adminController');

// ? admin Routes //
router.get('/admin', authenticate.verifyAdmin, adminController.getAdmin);
router.get('/doctors', authenticate.verifyAdmin, adminController.getPatients);
router.get('/patients', authenticate.verifyAdmin, adminController.getDoctors);
router.get(
	'/doctor/:did',
	authenticate.verifyAdmin,
	adminController.getPatient
);
router.get(
	'/patient/:pid',
	authenticate.verifyAdmin,
	adminController.getDoctor
);
router.post(
	'/sign-in',
	passport.authenticate('local-admin'),
	adminController.signIn
);
router.patch(
	'/changedoctorstatus/:approval/:did',
	authenticate.verifyAdmin,
	adminController.changeDoctorStatus
);
router.patch(
	'/editdoctor/:did',
	authenticate.verifyAdmin,
	adminController.editDoctor
);
router.delete(
	'/deletedoctor/:did',
	authenticate.verifyAdmin,
	adminController.deleteDoctor
);

module.exports = router;
