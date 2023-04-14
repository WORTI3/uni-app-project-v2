const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");
const db = require("../db");
const { ERROR_MESSAGES, PASSWORD_REGEX } = require('../assets/constants');
const { check } = require('express-validator');
const { checkValidationResult } = require('../middleware/auth');
const router = express.Router();

/**
 * Configures a new LocalStrategy for Passport.js authentication using a username and password.
 * Credit to https://www.passportjs.org/tutorials/password/verify/ for local passport setup.
 * 
 * @param {function} verify - The verification function to use for authentication.
 * @returns None
 */
passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    db.get("SELECT * FROM users WHERE username = ?", [username],
      function (err, row) {
        if (err) {
          return cb(err);
        }
        if (!row) {
          /**
           * Returns an error message indicating that the username is invalid.
           * @returns {object} An object containing an error message.
           */
          return cb(null, false, {
            message: ERROR_MESSAGES.USERNAME.DEFAULT,
          });
        }

        crypto.pbkdf2(password, row.salt, 310000, 32, "sha256",
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
              // Returns a callback with an error message object.
              return cb(null, false, {
                message: ERROR_MESSAGES.DEFAULT,
              });
            }
            return cb(null, row);
          }
        );
      }
    );
  })
);

/**
 * Serializes the user object to be stored in the session.
 * @param {Object} user - The user object to be serialized.
 * @param {Function} cb - The callback function to be called after serialization.
 * @returns None
 */
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, role: user.role });
  });
});

/**
 * Passport deserialization function that deserializes the user object.
 * @param {Object} user - The user object to deserialize.
 * @param {Function} cb - The callback function to call once deserialization is complete.
 * @returns None
 */
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

/**
 * GET request handler for the login page.
 * @param {Object} req - The request object (unused).
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function (unused).
 * @returns None
 */
router.get("/login", function (req, res, next) {
  res.render("login");
});

/**
 * Handles a POST request to log in a user with a password.
 * @param {string} "/login/password" - the endpoint for the login request
 * @param {function} passport.authenticate - the authentication middleware function
 * @param {object} options - the options object for passport.authenticate
 * @param {string} options.successReturnToOrRedirect - the URL to redirect to upon successful login
 * @param {string} options.failureRedirect - the URL to redirect to upon failed login
 * @param {boolean} options.failureMessage - whether or not to display a failure message
 * @returns None
 */
router.post(
  "/login/password",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  })
);

/**
 * Handles a POST request to log out the current user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns None
 */
router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/**
 * GET request handler for the '/signup' route. Renders the 'signup' view.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
router.get("/signup", function (req, res, next) {
  res.render("signup");
});

/**
 * Handles a POST request to sign up a new user. Validates the username and password
 * using the check function from the express-validator library. If the validation passes,
 * the user's password is hashed and salted using the pbkdf2 function from the crypto library.
 * The user's information is then inserted into the database and the user is logged in.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns None
 */
router.post(
  "/signup",
  check('username', ERROR_MESSAGES.USERNAME.DEFAULT)
    .isLength({ min: 3 })
    .withMessage(ERROR_MESSAGES.USERNAME.MIN_LENGTH)
    .bail()
    .isLength({ max: 20 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MAX_LENGTH),
  check('password', ERROR_MESSAGES.PASSWORD.DEFAULT)
    .isLength({ min: 5 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MIN_LENGTH)
    .bail()
    .isLength({ max: 20 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MAX_LENGTH)
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage(ERROR_MESSAGES.PASSWORD.NO_CHARS),
  checkValidationResult, function (req, res, next) {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, "sha256",
    function (err, hashedPassword) {
      if (err) {
        return next(err); // return with db error
      }
      db.run("INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)", [req.body.username, hashedPassword, salt],
        function (err) {
          if (err) {
            return next(err);
          }
          var user = {
            id: this.lastID,
            username: req.body.username,
          };
          req.login(user, function (err) {
            if (err) {
              return next(err);
            }
            res.redirect("/");
          });
        }
      );
    }
  );
});

module.exports = router;
