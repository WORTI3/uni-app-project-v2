const sqlite3 = require('sqlite3');
const mkdirp = require('mkdirp');
const crypto = require('crypto');

const DATABASE_DIR = './src/database'; // databases dir
const DATABASE_PATH = DATABASE_DIR + '/assets.db';

/**
 * Creates a directory at the specified path if it does not already exist.
 * @param {string} DATABASE_DIR - The path of the directory to create.
 * @returns None
 */
mkdirp.sync(DATABASE_DIR);

/**
 * Creates a new instance of a SQLite3 database using the specified path.
 * @param {string} DATABASE_PATH - The path to the SQLite3 database file.
 * @returns An instance of a SQLite3 database.
 */
const db = new sqlite3.Database(DATABASE_PATH);

/**
 * Creates two tables in the database if they do not already exist: 'users' and 'assets'.
 * The 'users' table has columns for id (primary key), username (unique), role, hashed_password, and salt.
 * The 'assets' table has columns for id (primary key), owner_id (not null), owner_name (not null), created (not null),
 * updated (not null), name (not null), code (not null), type (not null), status (not null), note, and closed.
 * @param None
 * @returns None
 */
db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    role INTEGER NULL, \
    hashed_password BLOB, \
    salt BLOB \
  )");

  db.run("CREATE TABLE IF NOT EXISTS assets ( \
    id INTEGER PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    owner_name VARCHAR(32) NOT NULL, \
    created DATE NOT NULL, \
    updated DATE NOT NULL, \
    name TEXT NOT NULL, \
    code VARCHAR(6) NOT NULL, \
    type TEXT NOT NULL, \
    status TEXT NOT NULL, \
    note TEXT, \
    closed INTEGER \
  )");
});

/**
 * Generates a random salt and inserts two users into the database with their respective
 * hashed passwords and salts to satisfy uni requirements.
 * @param {Object} db - the database object to insert the users into
 * @returns None
 */
var salt = crypto.randomBytes(16);
db.run('INSERT OR IGNORE INTO users (username, role, hashed_password, salt) VALUES (?, ?, ?, ?)', [
  'admin',
  1,
  crypto.pbkdf2Sync('admin', salt, 310000, 32, 'sha256'),
  salt
]);

db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
  'user',
  crypto.pbkdf2Sync('user', salt, 310000, 32, 'sha256'),
  salt
]);

module.exports = db;
