const { DateTime } = require("luxon");
const db = require('../db');

function fetchAssets(req, res, next) {
  db.all("SELECT * FROM assets WHERE owner_id = ?", [req.user.id],
    function (err, rows) {
      if (err) {
        return next(err);
      }

      var assets = rows.map(function (row) {
        return {
          id: row.id,
          created: DateTime.fromISO(row.created).toFormat("MMMM dd, yyyy"),
          updated: DateTime.fromISO(row.updated).toFormat("MMMM dd, yyyy"),
          name: row.name,
          code: row.code,
          status: row.status,
          closed: row.closed == 1 ? true : false,
          url: "/" + row.id,
        };
      });
      res.locals.assets = assets;
      res.locals.openCount = assets.filter(function (asset) {
        return !asset.completed;
      }).length;
      res.locals.closedCount = assets.length - res.locals.openCount;
      next();
    }
  );
}

function fetchAssetById(req, res, next) {
  db.all("SELECT * FROM assets WHERE id = ?", [req.params.id],
    function (err, rows) {
      if (err) {
        return next(err);
      }

      var asset = rows.map(function (row) {
        return {
          id: row.id,
          created: DateTime.fromISO(row.created).toFormat("MMMM dd, yyyy"),
          updated: DateTime.fromISO(row.updated).toFormat("MMMM dd, yyyy"),
          name: row.name,
          code: row.code,
          status: row.status,
          closed: row.closed == 1 ? true : false,
          url: "/" + row.id,
        };
      });
      console.log(JSON.stringify(asset[0]));
      res.locals.asset = asset[0];
      next();
    }
  );
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 1) {
    return next();
  }
  // todo: error message instead / hide content
  return res.redirect(403, "/error");
}

module.exports = { fetchAssets, fetchAssetById, isAdmin };
