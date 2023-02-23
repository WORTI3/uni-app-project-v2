const { DateTime } = require("luxon");
const db = require('../db');

function fetchAssets(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 1) {
    return next();
  }
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
          type: row.type,
          status: row.status,
          note: row.note,
          closed: row.closed == 1 ? true : false,
          url: "/" + row.id,
        };
      });
      res.locals.assets = assets;
      res.locals.openCount = assets.filter(function (asset) {
        return !asset.closed;
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
          type: row.type,
          status: row.status,
          note: row.note,
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

function updateAssetById(req, res, next) {
  db.run('UPDATE assets SET name = ?, code = ?, type = ?, updated = ? WHERE id = ? AND owner_id = ?', [
    req.session.update.name,
    req.session.update.code,
    req.session.update.type,
    new Date().toISOString(),
    req.params.id,
    req.user.id
  ],
    function (err) {
      if (err) { return next(err); }
      next();
    }
  );
}

function fetchAssetsForAdmin(req, res, next) {
  if (!req.isAuthenticated() && req.user.role !== 1) {
    return next();
  }
  db.all("SELECT * FROM assets",
    function (err, rows) {
      if (err) {
        return next(err);
      }

      var assets = rows.map(function (row) {
        console.log("row: " + JSON.stringify(row));
        return {
          id: row.id,
          created: DateTime.fromISO(row.created).toFormat("MMMM dd, yyyy"),
          updated: DateTime.fromISO(row.updated).toFormat("MMMM dd, yyyy"),
          name: row.name,
          code: row.code,
          type: row.type,
          status: row.status,
          note: row.note,
          closed: row.closed == 1 ? true : false,
          url: "/" + row.id,
        };
      });
      res.locals.assets = assets;
      res.locals.openCount = assets.filter(function (asset) {
        return !asset.closed;
      }).length;
      res.locals.closedCount = assets.length - res.locals.openCount;
      next();
    }
  );
}

function trimAssetName(req, res, next) {
  console.log(JSON.stringify(req.body));
  req.body.item = req.body.item.trim();
  next();
};

module.exports = { fetchAssets, fetchAssetById, updateAssetById, fetchAssetsForAdmin, trimAssetName };
