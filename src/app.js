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
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");

// nunjucks configuration
nunjucks.configure(["./src/views", "./src/_layouts"], {
  autoescape: true,
  express: app,
});
// view engine setup
app.set("view engine", "njk");
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
app.use(csrf());
app.use(passport.authenticate("session"));
// error messages
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
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
// app routes
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
