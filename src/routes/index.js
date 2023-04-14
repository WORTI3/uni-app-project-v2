const express = require("express");
const {
  ASSET_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../assets/constants");
/**
 * A middleware function that ensures that a user is logged in before allowing access to a route.
 * @param {Object} require - The require object from Node.js.
 * @returns The ensureLoggedIn middleware function.
 */
const ensureLogIn = require("connect-ensure-login").ensureLoggedIn;
const db = require("../db"); // imports the database module and assigns it to the variable db.
const {
  fetchAssets,
  fetchAssetById,
  updateAssetById,
  updateLocalAsset,
} = require("../middleware/asset");
const { isAdmin, checkValidationResult } = require("../middleware/auth");
const {
  checkEditUpdate,
  checkAll,
  checkAdd,
  checkEditAdmin,
} = require("../middleware/routing");
const { check } = require("express-validator");

/**
 * Calls the `ensureLogIn` function to ensure that the user is logged in.
 * @returns None
 */
const ensureLoggedIn = ensureLogIn();

/**
 * Creates a new instance of an Express router.
 * @returns {Router} - An instance of an Express router.
 */
const router = express.Router();

/**
 * GET request handler for the "/all/closed" route. 
 * Ensures that the user is logged in and has admin privileges before fetching all assets
 * and filtering out the closed ones. Renders the "index" view with the filtered assets and 
 * a flag to indicate that all closed assets should be shown.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
router.get(
  "/all/closed",
  ensureLoggedIn,
  isAdmin, // checking admin here in case a user navigates via URL
  fetchAssets,
  function (req, res, next) {
    res.locals.assets = res.locals.assets.filter(function (asset) {
      return asset.closed;
    });
    res.render("index", { user: req.user, showAllClosed: true });
  }
);

/**
 * GET request handler for the "/all" route. Ensures that the user is logged in and fetches assets.
 * Filters out any closed assets and renders the "index" view with the user object and showAll flag.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
router.get("/all", ensureLoggedIn, fetchAssets, function (req, res, next) {
  res.locals.assets = res.locals.assets.filter(function (asset) {
    return !asset.closed;
  });
  res.render("index", { user: req.user, showAll: true });
});

/**
 * GET request handler for the '/add' route. Renders the 'index' view with the 'addNew' flag set to true.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
router.get("/add", ensureLoggedIn, updateLocalAsset, function (req, res, next) {
  res.render("index", { user: req.user, addNew: true });
});

/**
 * Adds a new asset to the database with the given information.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - A redirect to the "/all" page.
 * @throws {Error} - If there is an error inserting the asset into the database.
 */
router.post(
  "/add",
  ensureLoggedIn,
  check("name", ERROR_MESSAGES.ADD_ISSUE.NAME).isLength({ min: 1 }),
  check("code", ERROR_MESSAGES.ADD_ISSUE.CODE).isLength({ min: 6, max: 6 }),
  check("note", ERROR_MESSAGES.ADD_ISSUE.NOTE).isLength({ min: 3, max: 200 }),
  checkValidationResult,
  /**
   * Inserts a new asset into the database with the given information.
   */
  function (req, res, next) {
    const today = new Date().toISOString();
    db.run(
      "INSERT INTO assets (owner_id, owner_name, created, updated, name, code, type, status, note, closed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        req.user.id,
        req.user.username,
        today,
        today,
        req.body.name,
        req.body.code,
        req.body.type,
        ASSET_STATUS.OPEN,
        req.body.note ?? null,
        req.body.closed == true ? 1 : null,
      ],
      function (err) {
        if (err) {
          return next(err);
        }
      }
    );
    return res.redirect("/all");
  }
);

/**
 * POST request handler for the root route.
 * Ensures that the user is logged in and passes the request through the checkAll, checkAdd middleware.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns None
 */
router.post("/", ensureLoggedIn, checkAll, checkAdd);

/**
 * GET request handler for editing an asset with the given ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - Renders the index page with the user object and edit flag.
 * @throws {Error} - If the user is not logged in or the asset cannot be found.
 */
router.get(
  "/:id(\\d+)/edit",
  ensureLoggedIn,
  fetchAssetById,
  updateLocalAsset,
  function (req, res, next) {
    /**
     * Renders the "index" view with the user and edit parameters.
     * @param {Object} req - The request object.
     * @param {Object} req.user - The user object.
     * @returns The rendered "index" view with the user and edit parameters.
     */
    return res.render("index", { user: req.user, edit: true });
  }
);

/**
 * GET request handler for viewing a specific asset by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns Renders the index page with the user object and readOnly flag set to true.
 * @throws {Error} If the user is not logged in or if there is an error updating or fetching the asset.
 */
router.get(
  "/:id(\\d+)/view",
  ensureLoggedIn,
  updateAssetById,
  fetchAssetById,
  function (req, res, next) {
    return res.render("index", { user: req.user, readOnly: true });
  }
);

/**
 * POST request handler for viewing an asset with the given ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
router.post(
  "/:id(\\d+)/view",
  ensureLoggedIn,
  fetchAssetById,
  function (req, res, next) {
    res.render("index", { user: req.user, readOnly: true });
  }
);

/**
 * Deletes an asset with the given ID and owner ID from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The response object with a redirect to the closed assets page.
 * @throws {Error} - If there is an error deleting the asset from the database.
 */
router.post(
  "/:id(\\d+)/delete",
  ensureLoggedIn,
  isAdmin,
  /**
   * Deletes an asset from the database with the given ID and owner ID.
   */
  function (req, res, next) {
    db.run(
      "DELETE FROM assets WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
      function (err) {
        if (err) {
          return next(err);
        }
        req.session.messages = [SUCCESS_MESSAGES.DELETED];
        req.session.msgTone = "positive";
        // Redirects the user to the "/all/closed" page with success message.
        return res.redirect("/all/closed");
      }
    );
  }
);

/**
 * POST request handler for editing an asset with the given ID.
 * 
 * We could validate the type field but not needed for v1.0.0
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
router.post(
  "/:id(\\d+)/edit",
  ensureLoggedIn,
  check("name", ERROR_MESSAGES.ADD_ISSUE.NAME).isLength({ min: 1 }),
  check("code", ERROR_MESSAGES.ADD_ISSUE.CODE).isLength({ min: 6, max: 6 }),
  check("note", ERROR_MESSAGES.ADD_ISSUE.NOTE).isLength({ min: 3, max: 200 }),
  checkValidationResult,
  checkEditUpdate,
  isAdmin,
  checkEditAdmin,
  /**
   * Deletes an asset from the database for the authenticated user.
   */
  function (req, res, next) {
    db.run(
      "DELETE FROM assets WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
      function (err) {
        if (err) {
          return next(err);
        }
        req.session.messages = [SUCCESS_MESSAGES.DELETED];
        req.session.msgTone = "positive";
        // Redirects the user to the "/all" page with success message.
        return res.redirect("/all");
      }
    );
  }
);

/**
 * GET request handler for the '/settings' route. Renders the 'settings' view with the
 * authenticated user's information.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
router.get("/settings", ensureLoggedIn, function (req, res, next) {
  res.render("settings", { user: req.user });
});

module.exports = router;
