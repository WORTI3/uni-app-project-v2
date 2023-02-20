const ERROR_MESSAGES = require('../assets/constants');

function checkPasswordStrength(req, res, next) {
  if (req.body.password.length < 4) {
    // pass back username to pre-populate?
    req.session.messages = [ ERROR_MESSAGES.INVALID_PASSWORD ];
    return res.redirect("/signup");
  }
  next();
}

module.exports = { checkPasswordStrength };
