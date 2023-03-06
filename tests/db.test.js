const db = require("../src/db");

describe("Database tests", () => {
  test("Database should be an object", () => {
    expect(typeof db).toBe("object");
  });

  test("Users table should exist", (done) => {
    db.get(
      'SELECT name FROM sqlite_master WHERE type="table" AND name="users"',
      (err, row) => {
        expect(row.name).toBe("users");
        done();
      }
    );
  });

  test("Assets table should exist", (done) => {
    db.get(
      'SELECT name FROM sqlite_master WHERE type="table" AND name="assets"',
      (err, row) => {
        expect(row.name).toBe("assets");
        done();
      }
    );
  });

  describe("Users table columns", () => {
    test("ID column should exist", (done) => {
      db.get("SELECT * FROM users LIMIT 1", (err, row) => {
        expect(row.id).toBeDefined();
        done();
      });
    });

    test("Username column should exist", (done) => {
      db.get("SELECT * FROM users LIMIT 1", (err, row) => {
        expect(row.username).toBeDefined();
        done();
      });
    });

    test("Role column should exist", (done) => {
      db.get("SELECT * FROM users LIMIT 1", (err, row) => {
        expect(row.role).toBeDefined();
        done();
      });
    });

    test("Hashed password column should exist", (done) => {
      db.get("SELECT * FROM users LIMIT 1", (err, row) => {
        expect(row.hashed_password).toBeDefined();
        done();
      });
    });

    test("Salt column should exist", (done) => {
      db.get("SELECT * FROM users LIMIT 1", (err, row) => {
        expect(row.salt).toBeDefined();
        done();
      });
    });
  });

  describe("Assets table columns", () => {
    test("ID column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.id).toBeDefined();
        done();
      });
    });

    test("Owner ID column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.owner_id).toBeDefined();
        done();
      });
    });

    test("Owner name column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.owner_name).toBeDefined();
        done();
      });
    });

    test("Created column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.created).toBeDefined();
        done();
      });
    });

    test("Updated column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.updated).toBeDefined();
        done();
      });
    });

    test("Name column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.name).toBeDefined();
        done();
      });
    });

    test("Code column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.code).toBeDefined();
        done();
      });
    });

    test("Type column should exist", (done) => {
      db.get("SELECT * FROM assets LIMIT 1", (err, row) => {
        expect(row.type).toBeDefined();
        done();
      });
    });
  });

  // example user tests
  test('User "admin" should exist', (done) => {
    db.get('SELECT * FROM users WHERE username="admin"', (err, row) => {
      expect(row.username).toBe("admin");
      done();
    });
  });

  test('User "admin" should have role 1', (done) => {
    db.get('SELECT * FROM users WHERE username="admin"', (err, row) => {
      expect(row.role).toBe(1);
      done();
    });
  });

  test('User "user" should exist', (done) => {
    db.get('SELECT * FROM users WHERE username="user"', (err, row) => {
      expect(row.username).toBe("user");
      done();
    });
  });

  test('User "user" should have role 1', (done) => {
    db.get('SELECT * FROM users WHERE username="user"', (err, row) => {
      expect(row.role).toBe(null);
      done();
    });
  });
});
