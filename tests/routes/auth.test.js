const request = require("supertest");
const cheerio = require("cheerio");
const app = require("../../src/app");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../../src/db");
const { ERROR_MESSAGES } = require("../../src/assets/constants");

describe("GET /signup", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/signup").expect(200);
    expect(result.get("Content-Type")).toContain("text/html");
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/signup").expect(200);

    const $ = cheerio.load(result.text);
    const para = $("p").text();
    expect(para).toBe("Already have an account? Sign in");
    expect($("a").length).toBe(4);
  });
});

describe("GET /login", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/login").expect(200);
    expect(result.get("Content-Type")).toContain("text/html");
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/login").expect(200);

    const $ = cheerio.load(result.text);
    const para = $("p").text();
    expect(para).toBe("Don't have an account? Sign Up");
    expect($("a").length).toBe(4);
  });
});

// No validation is run here as it is processed a layer higher in express validator and middleware with password regex.
describe("passport local strategy", () => {
  it("should return an error message if the username is invalid", () => {
    const verifyFn = jest.fn((username, password, cb) => {
      cb(null, false, {
        message: ERROR_MESSAGES.USERNAME.DEFAULT,
      });
    });
    jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
      callback(null, null);
    });
    const strategy = new LocalStrategy(verifyFn);
    passport.use(strategy);
    const req = {};
    req.body = { username: "invalid", password: "password" };
    const doneFn = jest.fn();
    strategy._verify(req.body.username, req.body.password, doneFn);
    expect(verifyFn).toHaveBeenCalledTimes(1);
    expect(doneFn).toHaveBeenCalledTimes(1);
    expect(doneFn).toHaveBeenCalledWith(null, false, {
      message: ERROR_MESSAGES.USERNAME.DEFAULT,
    });
  });

  it("should return an error message if the password is invalid", () => {
    const verifyFn = jest.fn((username, password, cb) => {
      cb(null, false, {
        message: ERROR_MESSAGES.DEFAULT,
      });
    });
    jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
      callback(null, {});
    });
    const strategy = new LocalStrategy(verifyFn);
    passport.use(strategy);
    const req = {};
    req.body = { username: "valid", password: "invalid" };
    const doneFn = jest.fn();
    strategy._verify(req.body.username, req.body.password, doneFn);
    expect(verifyFn).toHaveBeenCalledTimes(1);
    expect(doneFn).toHaveBeenCalledTimes(1);
    expect(doneFn).toHaveBeenCalledWith(null, false, {
      message: ERROR_MESSAGES.DEFAULT,
    });
  });

  it("should return the user if the username and password are valid", () => {
    const verifyFn = jest.fn((username, password, cb) => {
      const row = {
        salt: "someSalt",
        hashed_password: Buffer.from("correctPassword"),
      };
      cb(null, row);
    });
    jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
      callback(null, {});
    });
    const strategy = new LocalStrategy(verifyFn);
    passport.use(strategy);
    const req = {};
    req.body = { username: "valid", password: "password" };
    const doneFn = jest.fn();
    strategy._verify(req.body.username, req.body.password, doneFn);
    expect(verifyFn).toHaveBeenCalledTimes(1);
    expect(doneFn).toHaveBeenCalledTimes(1);
    expect(doneFn).toHaveBeenCalledWith(null, expect.objectContaining({}));
  });
});

describe("passport serialisation", () => {
  let user = { id: 1, username: "test", role: "user" };
  let cb;

  beforeEach(() => {
    cb = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should serialize user correctly serializeUser()", () => {
    passport.serializeUser(user, cb);
    jest.runAllTicks();

    expect(cb).toHaveBeenCalledWith(null, {
      id: 1,
      username: "test",
      role: "user",
    });
  });

  it("should deserialize user correctly deserializeUser()", () => {
    passport.deserializeUser(user, cb);
    jest.runAllTicks();

    expect(cb).toHaveBeenCalledWith(null, {
      id: 1,
      username: "test",
      role: "user",
    });
  });
});
