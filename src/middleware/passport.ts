import * as passportStrategy from "passport-local";
import passport from "passport";
import crypto from "crypto";
import { Express, Request, Response, NextFunction, Application } from "express";
import db from "../db";
import { ERROR_MESSAGES } from "../assets/constants";
import { IUser } from "../types";

interface UserRow {
  id: number;
  username: string;
  hashed_password: NodeJS.ArrayBufferView;
  salt: string;
}

/**
 * The `configureLocalStrategy()` function is responsible for configuring the local strategy for Passport.js
 * authentication. It creates a new instance of the `passport-local` strategy and sets up the strategy's options.
 * 
 * @function
 * @name configureLocalStrategy
 * @kind function
 * @returns {void}
 */
export function configureLocalStrategy() {
  passport.use(new passportStrategy.Strategy( { usernameField: "username" }, async (username, password, callback) => {
    try {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err: any, row: UserRow) => {
        if (err) {
          return callback(err);
        }
        if (!row) {
          return callback(null, false, {
            message: ERROR_MESSAGES.USERNAME.DEFAULT,
          });
        }

        crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", (err, hashedPassword) => {
          if (err) {
            return callback(err);
          }
          if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
            return callback(null, false, {
              message: ERROR_MESSAGES.DEFAULT,
            });
          }
          return callback(null, row);
        });
      });
    } catch (error) {
      callback(error);
    }
  }));
}

/**
 * The `configureSerialisation()` function is responsible for configuring the serialisation and deserialisation of user
 * objects for Passport.js authentication.
 * 
 * @function
 * @name configureSerialisation
 * @kind function
 * @returns {void}
 */
function configureSerialisation() {
  passport.serializeUser((user, callback) => {
    callback(null, user);
  });

  passport.deserializeUser((user: IUser, callback) => {
    return callback(null, user);
  });
}

/**
 * Configures a new LocalStrategy for Passport.js authentication using a username and password.
 * Credit to https://www.passportjs.org/tutorials/password/verify/ for local passport setup.
 * 
 * @param {Express} app - The express app instance
 * @returns None
 */
export function initPassport(app: Express | Application) {
  app.use(passport.initialize());
  app.use((req, res, next) => {
    passport.authenticate('session')(req, res, next);
  });

  configureLocalStrategy();
  configureSerialisation();
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction): Response | void {
  if(req.user)
    return next();
  else
    res.redirect("/"); 
}
