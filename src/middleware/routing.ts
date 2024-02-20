import { RequestHandler } from 'express';
import {
  ASSET_STATUS,
  EDIT_UPDATES,
  SUCCESS_MESSAGES,
} from '../assets/constants';
import { Session } from '../types';

/**
 * Middleware function that checks if the 'all' property is present in the request body.
 * If it is, it redirects to the appropriate route based on the value of 'all'.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
export const checkAll: RequestHandler = (req, res, next) => {
  let all = req.body.all;
  if (all) {
    if (all === ASSET_STATUS.CLOSED) {
      all = 'all/' + all;
    }
    return res.redirect('/' + all);
  }
  next();
};

/**
 * Middleware function that checks if the 'add' property exists in the request body.
 * If it does, it redirects the user to the specified URL.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to be called.
 * @returns None
 */
export const checkAdd: RequestHandler = (req, res, next) => {
  if (req.body.add) {
    return res.redirect('/' + req.body.add);
  }
  next();
};

/**
 * Middleware function that checks if the request body contains an update and if it is an edit update.
 * If it is an edit update, it sets the session update object with the updated information and redirects
 * to the view page with a success message. If not, it calls the next middleware function.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to call.
 * @returns None
 */
export const checkEditUpdate: RequestHandler = (req, res, next) => {
  if (req.body.update && req.body.update === EDIT_UPDATES.UPDATE) {
    const session = req.session as Session;
    session.update = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      note: req.body.note,
      updated: true,
    };

    session.messages = [SUCCESS_MESSAGES.DEFAULT];
    session.msgTone = 'positive';
    return res.redirect('/' + req.params.id + '/view');
  }
  next();
};

/**
 * Middleware function that checks if the request body contains an update to close an asset.
 * If so, it sets the session update object to reflect the closed status and redirects to the asset view page.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns None
 */
export const checkEditAdmin: RequestHandler = (req, res, next) => {
  if (req.body.update && req.body.update === EDIT_UPDATES.CLOSE) {
    const session = req.session as Session;
    // update here as well incase fields were updated before close
    session.update = {
      name: req.body.name,
      code: req.body.code,
      type: req.body.type,
      note: req.body.note,
      status: ASSET_STATUS.CLOSED,
      closed: true,
    };
    // close actions
    session.messages = [SUCCESS_MESSAGES.CLOSED];
    session.msgTone = 'positive';
    return res.redirect('/' + req.params.id + '/view');
  }

  // delete check not needed
  next();
};
