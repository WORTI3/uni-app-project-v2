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
// App routers
import { initPassport } from './middleware/passport';
import { homeRouter } from './routes/home';
import { authRouter } from './routes/auth';
import { indexRouter } from './routes/index';
import { Session } from './types';

const app = express();
// Db
const SqliteStore = sqliteStoreFactory(session);
const store = new SqliteStore({
  driver: sqlite3.Database,
  path: './src/database/sessions.db', // Specify the path to the SQLite database file
  ttl: 86400, // Session Time To Live in seconds
  cleanupInterval: 300000, // Cleanup interval in milliseconds for deleting expired sessions
});

// Nunjucks configuration
nunjucks.configure(['./src/views', './src/_layouts'], {
  autoescape: true,
  express: app,
});
// View engine setup
app.set('view engine', 'njk');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
  const session = req.session as Session;

  if (!session.errorFields) {
    // when no session is present
    const inputValues = {
      username: req.body.username ?? '',
      password: '', // dont want to pass password value through here
    };
    const fields = [];
    for (const [key, value] of Object.entries(inputValues)) {
      fields.push({
        field: key,
        value: value,
      });
    }
    session.errorFields = fields;
  }

  // todo remove messages and use errorFields.error

  if (session.messages || session.errorFields) {
    console.log('error fields:', session.errorFields);

    const msgs = session?.messages ?? [];
    const tone = session.msgTone ?? null;
    res.locals.messages = msgs;
    res.locals.msgTone = tone;
    res.locals.hasMessages =
      Boolean(msgs.length) || Boolean(session.errorFields);
    res.locals.errorFields = session.errorFields;
    session.messages = [];
    // session.errorFields = [];
    session.msgTone = undefined;
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
  res.status(err.status || 500).render('error');
};

app.use(errorHandler);

export default app;
