const express = require("express");
const ensureLogIn = require("connect-ensure-login").ensureLoggedIn;
const db = require("../db");
const { DateTime } = require("luxon");

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
  }
);

module.exports = router;
