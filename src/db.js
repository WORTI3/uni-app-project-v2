const sqlite3 = require('sqlite3');
const mkdirp = require('mkdirp');

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
    created DATE NOT NULL, \
    updated DATE NOT NULL, \
    name TEXT NOT NULL, \
    code TEXT NOT NULL, \
    type TEXT NOT NULL, \
    status TEXT NOT NULL, \
    note TEXT, \
    closed INTEGER \
  )");
});

module.exports = db;
