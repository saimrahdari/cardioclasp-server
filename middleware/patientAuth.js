var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var Patient = require('../models/patient');

passport.serializeUser(Patient.serializeUser());
passport.deserializeUser(Patient.deserializeUser());
passport.use(
	new LocalStrategy(
		{
			usernameField: 'email',
		},
		Patient.authenticate()
	)
);

exports.getToken = function (user) {
	return jwt.sign(user, process.env.SECRET);
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

passport.use(
	new JwtStrategy(opts, async (jwt_payload, done) => {
		try {
			const user = await Patient.findOne({ _id: jwt_payload._id });
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

exports.verifyPatient = passport.authenticate('jwt', { session: false });
