var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var Doctor = require('../models/doctor');

passport.serializeUser(Doctor.serializeUser());
passport.deserializeUser(Doctor.deserializeUser());
passport.use(
	'local-doctor',
	new LocalStrategy(
		{
			usernameField: 'email',
		},
		Doctor.authenticate()
	)
);

exports.getToken = function (user) {
	return jwt.sign(user, process.env.SECRET);
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

passport.use(
	'jwt-doctor',
	new JwtStrategy(opts, async (jwt_payload, done) => {
		try {
			const user = await Doctor.findOne({ _id: jwt_payload._id });
			if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		} catch (error) {
			return error, false;
		}
	})
);

exports.verifyDoctor = passport.authenticate('jwt-doctor', { session: false });
