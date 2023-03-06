const express = require("express");
const router = express.Router();

// Landing page index router
router.get("/", function (req, res, next) {
  if (!req.user) {
    return res.render("home");
  }
  res.render("index", { user: req.user });
});

module.exports = router;
