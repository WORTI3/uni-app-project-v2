const { ASSET_STATUS } = require("../assets/constants");

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

module.exports = { checkAll, checkAdd };