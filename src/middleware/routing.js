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
