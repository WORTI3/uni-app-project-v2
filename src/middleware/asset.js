const { DateTime } = require("luxon");
const { ASSET_STATUS } = require("../assets/constants");
const db = require('../db');

/**
 * Fetches assets from the database based on the user's role and owner_id.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
function fetchAssets(req, res, next) {
  var query = "SELECT * FROM assets WHERE owner_id = ?";
  var param = [req.user.id];
  // Admin check to change SQL query & param
  if (req.isAuthenticated() && req.user.role === 1) {
    query = "SELECT * FROM assets";
    param = [];
  }

  db.all(query, param, function (err, rows) {
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
  });
}

/**
 * Fetches an asset from the database by its ID and formats the data into an object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
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
          ownerName: row.owner_name,
          code: row.code,
          type: row.type,
          status: row.status,
          note: row.note,
          closed: row.closed == 1 ? true : false,
          url: "/" + row.id,
        };
      });

      res.locals.asset = asset[0];
      next();
    }
  );
}

/**
 * Updates an asset in the database with the given ID and owner ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 * @throws {Error} If there is an error updating the asset in the database.
 */
function updateAssetById(req, res, next) {
  if (!req.session.update) return next();
  db.run('UPDATE assets SET name = ?, code = ?, type = ?, note = ?, status = ?, closed = ?, updated = ? WHERE id = ? AND owner_id = ?', [
    req.session.update.name,
    req.session.update.code,
    req.session.update.type,
    req.session.update.note,
    req.session.update.status ?? ASSET_STATUS.OPEN,
    req.session.update.closed ? 1 : null,
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

/**
 * Updates the local asset with the values stored in the session asset.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
function updateLocalAsset(req, res, next) {
  if (req.session.asset) {
    var asset = res.locals.asset ?? {};
    asset.name = req.session.asset.name;
    asset.code = req.session.asset.code;
    asset.type = req.session.asset.type;
    asset.note = req.session.asset.note;
    req.session.asset = undefined;
    res.locals.asset = asset;
  }
  next();
}

module.exports = {
  fetchAssets,
  fetchAssetById,
  updateAssetById,
  updateLocalAsset,
};
