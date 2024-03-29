import { validationResult } from 'express-validator';
import { type RequestHandler } from 'express';
import { Session, User } from '../types';

interface baseInputValues {
  username: string;
  password: string;
  name?: string;
  code?: string;
  type?: 'Hardware fault' | 'Software fault' | 'Other';
  note?: string;
}

/**
 * Middleware function that checks the validation result of a request and redirects to the original URL with error messages if there are any validation errors.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns redirect() if errors exist.
 */
export const checkValidationResult: RequestHandler = (req, res, next) => {
  const result = validationResult(req).array();
  const fieldErrors = [];

  // Extract the input values from the request body
  const inputValues: baseInputValues = {
    username: req.body.username,
    password: req.body.password,
  };
  // Conditionally add additional input values based on the URL
  const url = req.originalUrl;
  const session = req.session as Session;
  if (url.endsWith('/edit') || url.endsWith('/add')) {
    inputValues.name = req.body.name;
    inputValues.code = req.body.code;
    inputValues.type = req.body.type;
    inputValues.note = req.body.note;
    session.asset = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      note: req.body.note,
    };
  }

  for (const [key, value] of Object.entries(inputValues)) {
    fieldErrors.push({
      field: key,
      value: value,
      error: result.find((e) => e.param === key)?.msg || null,
    });
  }
  // We still map the session errors here for passport functionality
  session.messages = result.map((error) => error.msg);

  if (session.messages.length === 0) {
    session.errorFields = [];
    session.asset = {};
    return next();
  }

  session.errorFields = fieldErrors;
  return res.redirect(url);
};

/**
 * Middleware function that checks if the user is authenticated and has admin privileges.
 * If the user is authenticated and has admin privileges, the next middleware function is called.
 * If not, an error message is added to the session and the user is redirected to the home page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to call.
 * @returns next() or redirect to route page.
 */
export const isAdmin: RequestHandler = (req, res, next) => {
  const user = req.user as User;
  if (!req.isAuthenticated() || user?.role !== 1) {
    return res.redirect('/');
  }
  next();
};

export const ensureAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated() && !req.user) {
    return res.redirect('/');
  }
  next();
};
