const ERROR_MESSAGES = {
  DEFAULT: "Incorrect username or password.",
  INVALID_USERNAME: "Invalid username",
  INVALID_PASSWORD: "Invalid password",
  NO_PERMISSION: "You must be an admin to do this",
};

const SUCCESS_MESSAGES = {
  DEFAULT: "You have updated this asset",
};

const ASSET_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
};

const EDIT_UPDATES = {
  UPDATE: "update",
  CLOSE: "closed",
  DELETE: "delete",
};

// todo
const ASSET_TYPE = {};

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ASSET_STATUS,
  ASSET_TYPE,
  EDIT_UPDATES,
};
