const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../assets/constants');

function checkPasswordStrength(req, res, next) {
  if (req.body.password.length < 4) {
    // pass back username to pre-populate?
    req.session.messages = [ ERROR_MESSAGES.INVALID_PASSWORD ];
    return res.redirect("/signup");
  }
  next();
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 1) {
    return next();
  }
  req.session.messages = [ ERROR_MESSAGES.NO_PERMISSION ];
  res.redirect('/' + req.params.id + '/edit');
}

module.exports = { checkPasswordStrength, isAdmin };
