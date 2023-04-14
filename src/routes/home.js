const express = require("express");
/**
 * Creates a new instance of an Express router.
 * @returns {Router} - An instance of an Express router.
 */
const router = express.Router();

/**
 * Handles GET requests to the root route.
 * If the user is not logged in, renders the home page.
 * If the user is logged in, renders the index page with the user object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
router.get("/", function (req, res, next) {
  if (!req.user) {
    return res.render("home");
  }
  res.render("index", { user: req.user });
});

module.exports = router;
