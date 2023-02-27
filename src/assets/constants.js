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

const SUCCESS_MESSAGES = {
  DEFAULT: "You have updated this ticket",
  CLOSED: "You have closed this ticket",
  DELETED: "You have permanently deleted a ticket"
};

const ASSET_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
};

const EDIT_UPDATES = {
  UPDATE: "update",
  CLOSE: "close",
  DELETE: "delete",
};

// todo
const ASSET_TYPE = {};

const PASSWORD_REGEX = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])';

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ASSET_STATUS,
  ASSET_TYPE,
  EDIT_UPDATES,
  PASSWORD_REGEX,
};
