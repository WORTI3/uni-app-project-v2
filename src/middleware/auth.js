const { ERROR_MESSAGES } = require('../assets/constants');
const { validationResult } = require('express-validator');

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

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 1) {
    return next();
  }
  req.session.messages = [ ERROR_MESSAGES.NO_PERMISSION ];
  res.redirect('/' + req.params.id + '/edit');
}

module.exports = { checkValidationResult, isAdmin };
