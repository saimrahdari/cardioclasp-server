var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');
var session = require('express-session');
require('dotenv').config();

var errorMiddleware = require('./middleware/errorMiddleware');
var ErrorHandler = require('./utils/error');
var connection = require('./utils/connection');

var Admin = require('./routes/adminRoutes');
var Doctor = require('./routes/doctorRoutes');
var Patient = require('./routes/patientRoutes');

app.listen(process.env.PORT, () => {
	console.log(`Running on port ${process.env.PORT} 👍.`);
});
connection.connectDB();

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
	})
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/admin', Admin);
app.use('/patient', Patient);
app.use('/doctor', Doctor);
app.use('/', (req, res) => {
	res.send('<h1>Api is working 🔶.</h1>');
});

app.all('*', (req, res, next) => {
	next(new ErrorHandler('Bad Request', 404));
});
app.use(errorMiddleware);

module.exports = app;
