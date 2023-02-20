const express = require("express");
const ensureLogIn = require("connect-ensure-login").ensureLoggedIn;
const db = require("../db");
const { fetchAssets, fetchAssetById, isAdmin } = require("../functions/asset")

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

router.get('/all', ensureLoggedIn, fetchAssets, function(req, res, next) {
  res.locals.assets = res.locals.assets.filter(function(asset) { return !asset.closed; });
  res.render('index', { user: req.user, showAll: true });
});

router.get('/add', ensureLoggedIn, function(req, res, next) {
  res.render('index', { user: req.user, addNew: true });
});

// TODO: Refactor
router.post('/', ensureLoggedIn, function(req, res, next) {
  console.log(JSON.stringify(req.body));
  if (req.body.all){
    return res.redirect('/' + req.body.all);
  }
  if (req.body.add){
    return res.redirect('/' + req.body.add);
  }
  req.body.item = req.body.item.trim();
  next();
}, function(req, res, next) {
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

router.get(':id(\\d+)/edit', ensureLoggedIn, function(req, res, next) {
  console.log(JSON.stringify(req.body));
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

module.exports = router;
