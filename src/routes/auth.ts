import { NextFunction, Request, Response, Router } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import { ErrorField, Session } from '../types';
import { CustomVerifyOptions } from '../middleware/passport';
import { checkValidationResult } from '../middleware/auth';
import { check } from 'express-validator';
import { ERROR_MESSAGES, PASSWORD_REGEX } from '../assets/constants';
import db from '../db';

export const authRouter = Router();

/**
 * GET request handler for the login page.
 * @param {Object} req - The request object (unused).
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function (unused).
 * @returns None
 */
authRouter.get('/login', function (req, res) {
  (req.session as Session).errorFields = undefined;
  res.render('login');
});

/**
 * Handles a POST request to log in a user with a password.
 * @name authRouter
 * @type {Router}
 */
authRouter.post(
  '/login/password',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'local',
      (err: Error, user: Express.User, info: CustomVerifyOptions) => {
        if (err) {
          console.error('Failed to authenticate on request ', err);
          return next(err);
        }

        if (!user) {
          // If authentication failed, add error message to session
          const fieldErrors: ErrorField[] =
            (req.session as Session).errorFields ?? [];
          fieldErrors.forEach((errorField, index) => {
            if (errorField.field === 'username') {
              fieldErrors[index].value = req.body.username;
              fieldErrors[index].error = `${info.message}`;
            }
            if (errorField.field === 'password') {
              fieldErrors[index].value = req.body.password;
              fieldErrors[index].error = 'duplicate_error';
            }
          });
          return res.redirect('/login');
        }

        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          (req.session as Session).errorFields = [];
          return res.redirect('/');
        });
      },
    )(req, res, next);
  },
);

/**
 * Handles a POST request to log out the current user.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns None
 */
authRouter.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.error('Failed to logout on request ', err);
      return next(err);
    }
    res.redirect('/');
  });
});

/**
 * GET request handler for the '/signup' route. Renders the 'signup' view.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
authRouter.get('/signup', function (req, res, _next) {
  (req.session as Session).errorFields = undefined;
  res.render('signup');
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
authRouter.post(
  '/signup',
  // validate username
  check('username', ERROR_MESSAGES.USERNAME.DEFAULT)
    .isLength({ min: 3 })
    .withMessage(ERROR_MESSAGES.USERNAME.MIN_LENGTH)
    .bail()
    .isLength({ max: 20 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MAX_LENGTH),
  // validate password
  check('password', ERROR_MESSAGES.PASSWORD.DEFAULT)
    .isLength({ min: 5 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MIN_LENGTH)
    .bail()
    .isLength({ max: 20 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MAX_LENGTH)
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage(ERROR_MESSAGES.PASSWORD.NO_CHARS),
  checkValidationResult,
  (req: Request, res: Response, next: NextFunction) => {
    const salt = crypto.randomBytes(16);
    const { username, password } = req.body;
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      'sha256',
      function (err, hashedPassword) {
        if (err) {
          console.error('Database error thrown when signup attempt ', err);
          return next(err); // return with db error
        }
        // Insert user into database
        db.run(
          'INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)',
          [username, hashedPassword, salt],
          function (err) {
            if (err) {
              return next(err); // return with db error
            }
            const user = {
              id: this.lastID,
              username: username,
            };
            // log user in
            req.login(user, function (err: Error) {
              if (err) {
                console.error('Failed to log in user', err.message);
                return next(err); // return with login error
              }
              res.redirect('/');
            });
          },
        );
      },
    );
  },
);
