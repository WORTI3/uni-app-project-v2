import { RequestHandler } from 'express';
import { DateTime } from 'luxon';
import db from '../db';
import { ASSET_STATUS } from '../assets/constants';
import { User } from '../types';

/**
 * Fetches assets from the database based on the user's role and owner_id.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
export const fetchAssets: RequestHandler = (req, res, next) => {
  if (!req.user) return next();
  const user = req.user as User;
  let query = 'SELECT * FROM assets WHERE owner_id = ?';
  let param = [user.id];
  // Admin check to change SQL query & param
  if (req.isAuthenticated() && user.role === 1) {
    query = 'SELECT * FROM assets';
    param = [];
  }

  db.all(query, param, function (err, rows) {
    if (err) {
      return next(err);
    }

    const assets = rows.map(function (row) {
      return {
        id: row.id,
        created: DateTime.fromISO(row.created).toFormat('MMMM dd, yyyy'),
        updated: DateTime.fromISO(row.updated).toFormat('MMMM dd, yyyy'),
        name: row.name,
        code: row.code,
        type: row.type,
        status: row.status,
        note: row.note,
        closed: row.closed == 1,
        url: '/' + row.id,
        owner: row.owner_name,
      };
    });
    res.locals.assets = assets;
    res.locals.openCount = assets.filter(function (asset) {
      return !asset.closed;
    }).length;
    res.locals.closedCount = assets.length - res.locals.openCount;
    next();
  });
};

/**
 * Fetches an asset from the database by its ID and formats the data into an object. Password@24
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
export const fetchAssetById: RequestHandler = (req, res, next) => {
  db.all(
    'SELECT * FROM assets WHERE id = ?',
    [req.params.id],
    function (err, rows) {
      if (err) {
        return next(err);
      }

      const asset = rows.map(function (row) {
        return {
          id: row.id,
          created: DateTime.fromISO(row.created).toFormat('MMMM dd, yyyy'),
          updated: DateTime.fromISO(row.updated).toFormat('MMMM dd, yyyy'),
          name: row.name,
          ownerName: row.owner_name,
          code: row.code,
          type: row.type,
          status: row.status,
          note: row.note,
          closed: row.closed == 1,
          url: '/' + row.id,
        };
      });

      res.locals.asset = asset[0];
      next();
    },
  );
};

/**
 * Updates an asset in the database with the given ID and owner ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 * @throws {Error} If there is an error updating the asset in the database.
 */
export const updateAssetById: RequestHandler = (req, _res, next) => {
  const session = req.session as any;
  const user = req.user as User;
  if (!session.update) return next();
  db.run(
    'UPDATE assets SET name = ?, code = ?, type = ?, note = ?, status = ?, closed = ?, updated = ? WHERE id = ? AND owner_id = ?',
    [
      session.update.name,
      session.update.code,
      session.update.type,
      session.update.note,
      session.update.status ?? ASSET_STATUS.OPEN,
      session.update.closed ? 1 : null,
      new Date().toISOString(),
      req.params.id,
      user.id,
    ],
    function (err) {
      if (err) {
        return next(err);
      }
    },
  );
  next();
};

/**
 * Updates the local asset with the values stored in the session asset.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
export const updateLocalAsset: RequestHandler = (req, res, next) => {
  const session = req.session as any;
  if (session?.asset) {
    const asset = res.locals.asset ?? {};
    asset.name = session.asset.name;
    asset.code = session.asset.code;
    asset.type = session.asset.type;
    asset.note = session.asset.note;
    session.asset = undefined;
    res.locals.asset = asset;
  }
  next();
};
