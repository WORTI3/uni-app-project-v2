const { ASSET_STATUS, EDIT_UPDATES, SUCCESS_MESSAGES } = require("../assets/constants");

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

function checkAdd(req, res, next) {
  if (req.body.add){
    return res.redirect('/' + req.body.add);
  }
  next();
};

function checkEditUpdated(req, res, next) {
  if (req.session.update.updated){
    return res.render('index', { user: req.user, edit: true, readOnly: true });
  }
  next();
};

function checkEditUpdate(req, res, next) {
  if (req.body.update && req.body.update === EDIT_UPDATES.UPDATE) {
    req.session.update = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      updated: true
    };

    req.session.messages = [ SUCCESS_MESSAGES.DEFAULT ];
    req.session.msgTone = "positive";
    return res.redirect('/' + req.params.id + '/edit');
  }
  next();
};

function checkEditAdmin(req, res, next) {
  if (req.body.update && req.body.update === EDIT_UPDATES.CLOSE) {
    // close actions
    req.session.closed = true;
    return res.redirect('/' + req.params.id + '/edit');
  }
  // delete check not needed
  next();
};

function checkEditClosed(req, res, next) {
  if (req.session.closed){
    return res.render('index', { user: req.user, edit: true, readOnly: true });
  }
  next();
};

module.exports = {
  checkAll,
  checkAdd,
  checkEditUpdate,
  checkEditAdmin,
  checkEditUpdated,
  checkEditClosed,
};
