const { ERROR_MESSAGES } = require('../assets/constants');
const { validationResult } = require('express-validator');

/**
 * Middleware function that checks the validation result of a request and redirects to the original URL with error messages if there are any validation errors.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns redirect() if errors exist.
 */
function checkValidationResult(req, res, next) {
  const result = validationResult(req).array();
  if (result.length > 0) {
    const messages = result.map(error => error.msg);
    req.session.messages = messages;

    var url = req.originalUrl;
    if (url.endsWith('/edit') || url.endsWith('/add')) {
      req.session.asset = {
        name: req.body.name,
        code: req.body.code,
        type: req.body.type,
        note: req.body.note
      };
    }
    return res.redirect(url);
  }
  next();
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
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 1) {
    return next();
  }
  req.session.messages = [ ERROR_MESSAGES.NO_PERMISSION ];
  return res.redirect('/');
};

module.exports = { checkValidationResult, isAdmin };
