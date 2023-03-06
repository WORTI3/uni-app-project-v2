const sqlite3 = require('sqlite3');
const mkdirp = require('mkdirp');
const crypto = require('crypto');

const DATABASE_DIR = './src/database';
const DATABASE_PATH = DATABASE_DIR + '/assets.db';

mkdirp.sync(DATABASE_DIR);

const db = new sqlite3.Database(DATABASE_PATH);

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

var salt = crypto.randomBytes(16);
db.run('INSERT OR IGNORE INTO users (username, role, hashed_password, salt) VALUES (?, ?, ?, ?)', [
  'admin',
  1,
  crypto.pbkdf2Sync('admin', salt, 310000, 32, 'sha256'),
  salt
]);

db.run('INSERT OR IGNORE INTO users (username, role, hashed_password, salt) VALUES (?, ?, ?, ?)', [
  'user',
  null,
  crypto.pbkdf2Sync('user', salt, 310000, 32, 'sha256'),
  salt
]);

module.exports = db;
