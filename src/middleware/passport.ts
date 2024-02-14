import * as passportStrategy from "passport-local";
import passport from "passport";
import crypto from "crypto";
import { Express, Request, Response, NextFunction } from "express";
import db from "../db";
import { ERROR_MESSAGES } from "../assets/constants";
import { IUser } from "../types";

/**
 * Configures a new LocalStrategy for Passport.js authentication using a username and password.
 * Credit to https://www.passportjs.org/tutorials/password/verify/ for local passport setup.
 * 
 * @param {Express} app - The express app instance
 * @returns None
 */
export function initPassport(app: Express) {
  app.use(passport.initialize());
  /**
   * Middleware function that authenticates a user's session using Passport.
   * @param {string} "session" - the name of the Passport strategy to use for authentication.
   */
  app.use(passport.authenticate('session'));

  passport.use(new passportStrategy.Strategy( { usernameField: "username" }, async (username, password, callback) => {
    try {
      db.get("SELECT * FROM users WHERE username = ?", [username],
        function (err, row) {
          if (err) {
            return callback(err);
          }
          if (!row) {
            /**
             * Returns an error message indicating that the username is invalid.
             * @returns {object} An object containing an error message.
             */
            return callback(null, false, {
              message: ERROR_MESSAGES.USERNAME.DEFAULT,
            });
          }

          crypto.pbkdf2(password, row.salt, 310000, 32, "sha256",
            function (err, hashedPassword) {
              if (err) {
                return callback(err);
              }
              if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                // Returns a callback with an error message object.
                return callback(null, false, {
                  message: ERROR_MESSAGES.DEFAULT,
                });
              }
              return callback(null, row);
            }
          );
        }
      );
    } catch (error) {
      callback(error);
    }
  }));

  passport.serializeUser((user, callback) => {
    callback(null, user);
    console.log(user); // remove
    // callback(null, { id: user.id, username: user.username, role: user.role });
  });

  passport.deserializeUser((user: IUser, callback) => {
    return callback(null, user);
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction): Response | void {
  if(req.user)
    return next();
  else
    res.redirect("/"); 
}
