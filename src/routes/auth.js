const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");
const db = require("../db");
const { ERROR_MESSAGES, PASSWORD_REGEX } = require('../assets/constants');
const { check } = require('express-validator');
const { checkValidationResult } = require('../middleware/auth');
const router = express.Router();

/*
 * Credit to https://www.passportjs.org/tutorials/password/verify/ for local passport setup.
 */
passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    db.get("SELECT * FROM users WHERE username = ?", [username],
      function (err, row) {
        if (err) {
          return cb(err);
        }
        if (!row) {
          return cb(null, false, {
            message: ERROR_MESSAGES.USERNAME,
          });
        }

        crypto.pbkdf2(password, row.salt, 310000, 32, "sha256",
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
              return cb(null, false, {
                message: ERROR_MESSAGES.DEFAULT,
              });
            }
            return cb(null, row);
          }
        );
      }
    );
  })
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, role: user.role });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  })
);

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post(
  "/signup",
  check('username', ERROR_MESSAGES.USERNAME.DEFAULT)
    .isLength({ min: 3 })
    .withMessage(ERROR_MESSAGES.USERNAME.MIN_LENGTH)
    .bail()
    .isLength({ max: 20 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MAX_LENGTH),
  check('password', ERROR_MESSAGES.PASSWORD.DEFAULT)
    .isLength({ min: 5 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MIN_LENGTH)
    .bail()
    .isLength({ max: 20 })
    .withMessage(ERROR_MESSAGES.PASSWORD.MAX_LENGTH)
    .bail()
    .matches(PASSWORD_REGEX)
    .withMessage(ERROR_MESSAGES.PASSWORD.NO_CHARS),
  checkValidationResult, function (req, res, next) {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, "sha256",
    function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      db.run("INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)", [req.body.username, hashedPassword, salt],
        function (err) {
          if (err) {
            return next(err);
          }
          var user = {
            id: this.lastID,
            username: req.body.username,
          };
          req.login(user, function (err) {
            if (err) {
              return next(err);
            }
            res.redirect("/");
          });
        }
      );
    }
  );
});

module.exports = router;
