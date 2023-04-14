/**
 * A collection of error messages for various scenarios.
 * @constant {Object} ERROR_MESSAGES
 * @property {string} DEFAULT - The default error message for incorrect username or password.
 * @property {Object} USERNAME - An object containing error messages related to username validation.
 * @property {string} USERNAME.DEFAULT - The default error message for an invalid username.
 * @property {string} USERNAME.MIN_LENGTH - The error message for a username that is too short.
 * @property {string} USERNAME.MAX_LENGTH - The error message for a username that is too long.
 * @property {Object} PASSWORD - An object containing error messages related to password validation.
 * @property {string} PASSWORD.DEFAULT - The default error message for an invalid
 */
const ERROR_MESSAGES = {
  DEFAULT: "Incorrect username or password.",
  USERNAME: { 
    DEFAULT: "Invalid username",
    MIN_LENGTH: "Username must be more than 3 characters in length",
    MAX_LENGTH: "Username must be less than 20 characters in length"
  },
  PASSWORD: { 
    DEFAULT: "Invalid password",
    MIN_LENGTH: "Password must be more than 5 characters in length",
    MAX_LENGTH: "Password must be less than 20 characters in length",
    NO_CHARS: "Password must contain a special character, number and upper case letter",
  },
  ADD_ISSUE: {
    NAME: "Please enter a valid item name",
    CODE: "The asset code must be 6 characters in length",
    NOTE: "A note must be more than 3 and 200 characters"
  },
  NO_PERMISSION: "You must be an admin to do this",
};

/**
 * A dictionary of success messages for different actions performed on a ticket.
 * @constant
 * @type {Object}
 * @property {string} DEFAULT - The default success message for updating a ticket.
 * @property {string} CLOSED - The success message for closing a ticket.
 * @property {string} DELETED - The success message for permanently deleting a ticket.
 */
const SUCCESS_MESSAGES = {
  DEFAULT: "You have updated this ticket",
  CLOSED: "You have closed this ticket",
  DELETED: "You have permanently deleted a ticket"
};

/**
 * An object containing constants for the status of an asset.
 * @property {string} OPEN - The status of an open asset.
 * @property {string} CLOSED - The status of a closed asset.
 */
const ASSET_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
};

/**
 * An object containing constants for different types of edit updates.
 * @property {string} UPDATE - Indicates that an update has been made.
 * @property {string} CLOSE - Indicates that an item has been closed.
 * @property {string} DELETE - Indicates that an item has been deleted.
 */
const EDIT_UPDATES = {
  UPDATE: "update",
  CLOSE: "close",
  DELETE: "delete",
};

/**
 * A regular expression that matches a password that contains at least one uppercase letter,
 * one lowercase letter, one number, and one special character.
 * @type {string}
 */
const PASSWORD_REGEX = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])';

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ASSET_STATUS,
  EDIT_UPDATES,
  PASSWORD_REGEX,
};
