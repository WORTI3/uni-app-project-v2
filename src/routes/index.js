const express = require("express");
const ensureLogIn = require("connect-ensure-login").ensureLoggedIn;
const db = require("../db");
const { fetchAssets, fetchAssetById, updateAssetById, fetchAssetsForAdmin, trimAssetName } = require("../middleware/asset");
const { isAdmin } = require("../middleware/auth");
const { routingChecks, checkAll, checkAdd } = require("../middleware/routing");

const ensureLoggedIn = ensureLogIn();

const router = express.Router();

// Landing page get and logic
router.get(
  "/",
  function (req, res, next) {
    if (!req.user) {
      return res.render("home");
    }
    next();
  },
  fetchAssets, function(req, res, next) {
    res.render('index', { user: req.user });
  }
);

router.get('/all/closed', ensureLoggedIn, fetchAssetsForAdmin, fetchAssets, function(req, res, next) {
  res.locals.assets = res.locals.assets.filter(function(asset) { return asset.closed; });
  res.render('index', { user: req.user, showAllClosed: true });
});

router.get('/all', ensureLoggedIn, fetchAssetsForAdmin, fetchAssets, function(req, res, next) {
  res.locals.assets = res.locals.assets.filter(function(asset) { return !asset.closed; });
  res.render('index', { user: req.user, showAll: true });
});

router.get('/add', ensureLoggedIn, function(req, res, next) {
  res.render('index', { user: req.user, addNew: true });
});

router.post(
  '/', 
  ensureLoggedIn, 
  checkAll,
  checkAdd, 
  trimAssetName,
  function(req, res, next) {
    // refactor
  if (req.body.item !== '') {
    return next();
  }
  if (req.body.assetCode !== '') {
    return next();
  }
  return res.redirect('/');
}, function(req, res, next) {
  const today = new Date().toISOString();
  db.run('INSERT INTO assets (owner_id, created, updated, name, code, status, closed) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    req.user.id,
    today,
    today,
    req.body.item,
    req.body.assetCode,
    "OPEN",
    req.body.closed == true ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + 'all');
  });
});

router.get('/:id(\\d+)/edit', ensureLoggedIn, updateAssetById, fetchAssetById, function(req, res, next) {
  if (req.session.update.updated){
    return res.render('index', { user: req.user, edit: true, readOnly: true });
  }
  next();
}, function(req, res, next) {
  return res.render('index', { user: req.user });
});

router.post('/:id(\\d+)/edit', ensureLoggedIn, fetchAssetById, function(req, res, next) {
  res.render('index', { user: req.user, edit: true, asset: res.locals.asset });
});

router.post('/:id(\\d+)/delete', ensureLoggedIn, isAdmin, function(req, res, next) {
  db.run('DELETE FROM assets WHERE id = ? AND owner_id = ?', [
    req.params.id,
    req.user.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/all');
  });
});

router.get('/settings', ensureLoggedIn, function(req, res, next) {
  res.render('settings', { user: req.user });
});

module.exports = router;
