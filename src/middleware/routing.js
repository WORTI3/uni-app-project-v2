const { ASSET_STATUS, EDIT_UPDATES, SUCCESS_MESSAGES } = require("../assets/constants");

/**
 * Middleware function that checks if the 'all' property is present in the request body.
 * If it is, it redirects to the appropriate route based on the value of 'all'.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
function checkAll(req, res, next) {
  var all = req.body.all;
  if (all){
    if (all === ASSET_STATUS.CLOSED) {
      all = 'all/' + all;
    }
    return res.redirect('/' + all);
  }
  next();
};

/**
 * Middleware function that checks if the 'add' property exists in the request body.
 * If it does, it redirects the user to the specified URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to be called.
 * @returns None
 */
function checkAdd(req, res, next) {
  if (req.body.add){
    return res.redirect('/' + req.body.add);
  }
  next();
};

/**
 * Middleware function that checks if the request body contains an update and if it is an edit update.
 * If it is an edit update, it sets the session update object with the updated information and redirects
 * to the view page with a success message. If not, it calls the next middleware function.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to call.
 * @returns None
 */
function checkEditUpdate(req, res, next) {
  if (req.body.update && req.body.update === EDIT_UPDATES.UPDATE) {
    req.session.update = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      note: req.body.note,
      updated: true
    };

    req.session.messages = [ SUCCESS_MESSAGES.DEFAULT ];
    req.session.msgTone = "positive";
    return res.redirect('/' + req.params.id + '/view');
  }
  next();
};

/**
 * Middleware function that checks if the request body contains an update to close an asset.
 * If so, it sets the session update object to reflect the closed status and redirects to the asset view page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
function checkEditAdmin(req, res, next) { 
  if (req.body.update && req.body.update === EDIT_UPDATES.CLOSE) {
    // update here as well incase fields were updated before close
    req.session.update = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      note: req.body.note,
      status: ASSET_STATUS.CLOSED,
      closed: true
    };
    // close actions
    req.session.messages = [ SUCCESS_MESSAGES.CLOSED ];
    req.session.msgTone = "positive";
    return res.redirect('/' + req.params.id + '/view');
  }

  // delete check not needed
  next();
};

module.exports = {
  checkAll,
  checkAdd,
  checkEditUpdate,
  checkEditAdmin,
};
