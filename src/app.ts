// Dependencies
import express, { ErrorRequestHandler } from 'express';
import nunjucks from 'nunjucks';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csrf from 'csurf';
import sqlite3 from 'sqlite3';
import sqliteStoreFactory from 'express-session-sqlite';

const app = express();
// Db
const SqliteStore = sqliteStoreFactory(session);
const store = new SqliteStore({
  driver: sqlite3.Database,
  path: 'sessions.db', // Specify the path to your SQLite database file
  ttl:  86400, // Session Time To Live in seconds
  // dir: './src/database',
  cleanupInterval:  300000, // Cleanup interval in milliseconds for deleting expired sessions
});
// 'sessions.db', dir: './src/database'
// App routers
import homeRouter from './routes/home';
import { initPassport } from './middleware/passport';
import indexRouter from './routes/index';
import authRouter from './routes/auth';

// Nunjucks configuration
nunjucks.configure(['./src/views', './src/_layouts'], {
	autoescape: true,
	express: app,
});
// View engine setup
app.set('view engine', 'njk');
/**
 * A middleware function that adds the pluralize library to the app's local variables.
 * This allows the pluralize library to be used in any view rendered by the app.
 */
app.locals.pluralize = require('pluralize');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Static assets (main.css)
app.use(express.static(path.join('./', 'public')));

// Adds CSRF protection to the application.
app.use(csrf({ cookie: true }));

// Init session
app.use(
	session({
		secret: 'nobody knows',
		resave: false,
		saveUninitialized: false,
		store,
	}),
);
// passport middleware
initPassport(app);

/**
 * Sets messages and tone to locals from the current session.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use((req, res, next) => {
	const session = req.session as any;

	if(!session.errorFields){ // when no session is present
		const inputValues = {
			username: req.body.username ?? '',
			password: '', // dont want to pass password value through here
		}
		const fields = []
		for (const [key, value] of Object.entries(inputValues)) {
			fields.push({
				field: key,
				value: value,
			})
		};
		session.errorFields = fields
	}

	// todo remove messages and use errorFields.error
	
	if (session.messages || session.errorFields) {
		console.log("error fields:", session.errorFields);
		
		const msgs = session?.messages ?? [];
		const tone = session.msgTone ?? null;
		res.locals.messages = msgs;
		res.locals.msgTone = tone;
		res.locals.hasMessages = Boolean(msgs.length) || Boolean(session.errorFields.length);
		res.locals.errorFields = session.errorFields;
		session.messages = [];
		// session.errorFields = [];
		session.msgTone = null;
	}
	next();
});

/**
 * Middleware function that adds a CSRF token to the response locals object.
 * If the environment is set to "test", a hardcoded token is used instead.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
app.use((req, res, next) => {
	if (process.env.NODE_ENV === 'test') {
		res.locals.csrfToken = '123456';
		next();
	}

	res.locals.csrfToken = req.csrfToken();
	next();
});
// App routes
app.use('/', homeRouter);
app.use('/', indexRouter);
app.use('/', authRouter);

// Catch 404 and forward to error handler
app.use((_req, _res, next) => {
	next(createError(404));
});

// Error handler
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
}
app.use(errorHandler);

export default app;
