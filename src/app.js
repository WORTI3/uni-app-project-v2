// dependencies
const express = require("express");
const nunjucks = require("nunjucks");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csrf = require("csurf");
const passport = require("passport");

const app = express();
// db
const SQLiteStore = require("connect-sqlite3")(session);
// app routers
const homeRouter = require("./routes/home");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");

// nunjucks configuration
nunjucks.configure(["./src/views", "./src/_layouts"], {
  autoescape: true,
  express: app,
});
// view engine setup
app.set("view engine", "njk");
/**
 * A middleware function that adds the pluralize library to the app's local variables.
 * This allows the pluralize library to be used in any view rendered by the app.
 */
app.locals.pluralize = require("pluralize");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static assets (main.css)
app.use(express.static(path.join("./", "public")));

// init session
app.use(
  session({
    secret: "nobody knows",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./src/database" }),
  })
);
// Adds CSRF protection to the application.
app.use(csrf());

/**
 * Middleware function that authenticates a user's session using Passport.
 * @param {string} "session" - the name of the Passport strategy to use for authentication.
 */
app.use(passport.authenticate("session"));

/**
 * Sets messages and tone to locals from the current session.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use(function (req, res, next) {
  const msgs = req.session.messages || [];
  const tone = req.session.msgTone || null;
  res.locals.messages = msgs;
  res.locals.msgTone = tone;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  req.session.msgTone = null;
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
app.use(function (req, res, next) {
  if (process.env.NODE_ENV === "test") {
    res.locals.csrfToken = "123456";
    return next();
  }
  res.locals.csrfToken = req.csrfToken();
  next();
});
// app routes
app.use("/", homeRouter);
app.use("/", indexRouter);
app.use("/", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
