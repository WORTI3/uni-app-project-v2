import { Router } from 'express';
import passport from 'passport';
import crypto from "crypto";
import db from "../db";
import { ERROR_MESSAGES, PASSWORD_REGEX } from '../assets/constants';
import { checkValidationResult } from '../middleware/auth';
import { check } from 'express-validator';

const router = Router();

/**
 * GET request handler for the login page.
 * @param {Object} req - The request object (unused).
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function (unused).
 * @returns None
 */
router.get("/login", function (_req, res) {
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
          let user = {
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

export default router;
