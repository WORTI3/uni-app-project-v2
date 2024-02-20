import express, { Express, NextFunction, Request, Response } from 'express';
import {
  configureLocalStrategy,
  initPassport,
  isAuthenticated,
} from '../../src/middleware/passport';
import { ERROR_MESSAGES } from '../../src/assets/constants';
import db from '../../src/db';
import passport from 'passport';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LocalStrategy = require('passport-local').Strategy;

jest.mock('../../src/db', () => ({
  get: jest.fn(),
}));

describe('Passport Local Strategy Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure local strategy for Passport authentication', () => {
    // given
    const useSpy = jest.spyOn(passport, 'use');
    const expectedStrategy = {
      _passReqToCallback: undefined,
      _passwordField: 'password',
      _usernameField: 'username',
      _verify: expect.any(Function),
      authenticate: expect.any(Function),
      name: 'local',
    };

    // when
    configureLocalStrategy();

    // then
    expect(useSpy.mock.calls[0][0]).toEqual(expectedStrategy);
  });

  it('should authenticate user with valid credentials', async () => {
    // given
    const verifyFn = jest.fn((_username, _password, cb) => {
      cb(null, { id: 1 });
    });
    const strategy = new LocalStrategy({ usernameField: 'username' }, verifyFn);

    // when
    await strategy._verify('valid', 'password', () => {});

    // then
    expect(verifyFn).toHaveBeenCalled();
  });

  it('should not authenticate user with invalid username', async () => {
    // given
    const verifyFn = jest.fn((_username, _password, cb) => {
      cb(null, false);
    });
    const strategy = new LocalStrategy({ usernameField: 'username' }, verifyFn);

    // when
    await strategy._verify('invalid', 'password', () => {});

    // then
    expect(verifyFn).toHaveBeenCalled();
  });

  it('should not authenticate user with invalid password', async () => {
    // given
    const verifyFn = jest.fn((_username, _password, cb) => {
      cb(null, false);
    });
    const strategy = new LocalStrategy({ usernameField: 'username' }, verifyFn);

    // when
    await strategy._verify('valid', 'invalid', () => {});

    // then
    expect(verifyFn).toHaveBeenCalled();
  });

  it('should return an error message if the username is invalid', async () => {
    // given
    const verifyFn = jest.fn((_username, _password, cb) => {
      cb(null, false, {
        message: ERROR_MESSAGES.USERNAME.DEFAULT,
      });
    });
    const strategy = new LocalStrategy({ usernameField: 'username' }, verifyFn);

    // when
    const done = jest.fn();
    await strategy._verify('invalid', 'password', done);

    // then
    expect(done).toHaveBeenCalledWith(null, false, {
      message: ERROR_MESSAGES.USERNAME.DEFAULT,
    });
  });

  it('should return an error message if the password is invalid', async () => {
    // given
    const verifyFn = jest.fn((_username, _password, cb) => {
      cb(null, false, {
        message: ERROR_MESSAGES.DEFAULT,
      });
    });
    const strategy = new LocalStrategy({ usernameField: 'username' }, verifyFn);

    // when
    const done = jest.fn();
    await strategy._verify('valid', 'invalid', done);

    // then
    expect(done).toHaveBeenCalledWith(null, false, {
      message: ERROR_MESSAGES.DEFAULT,
    });
  });
});

describe('Passport Middleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    initPassport(app);
  });

  describe('Authentication Middleware', () => {
    it('should call next() if user is authenticated', () => {
      // given
      const req = { user: { id: 1 } } as unknown as Request;
      const next = jest.fn();

      // when
      isAuthenticated(req, {} as Response, next);

      // then
      expect(next).toHaveBeenCalled();
    });

    it('should redirect to "/" if user is not authenticated', () => {
      // given
      const req = {} as Request;
      const res = { redirect: jest.fn() } as unknown as Response;

      // when
      isAuthenticated(req, res, {} as NextFunction);

      // then
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  // Update passport happy paths
  // No validation is run here as it is processed a layer higher in express validator and middleware with password regex.
  describe('passport local strategy', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should authenticate user with valid credentials', () => {
      // given
      const verifyFn = jest.fn((_username, _password, cb) => {
        cb(null, { id: 1 });
      });
      const strategy = new LocalStrategy(verifyFn);
      passport.use(strategy);

      // when
      strategy._verify('valid', 'password', () => {});

      // then
      expect(verifyFn).toHaveBeenCalled();
    });

    it('should authenticate user with valid credentials', () => {
      // given
      const req = {} as Request;
      req.body = { username: 'invalid', password: 'password' };
      const doneFn = jest.fn();

      // when / then
      passport.authenticate(
        'local',
        (err: string | unknown, user: string, info: { message: string }) => {
          expect(err).toBeNull();
          expect(user).toBe(false);
          expect(info).toBeDefined();
          expect(info.message).toEqual(ERROR_MESSAGES.USERNAME.DEFAULT);
        },
      )(req, {} as Response, doneFn);
    });

    it('should not authenticate user with invalid username', () => {
      // given
      const req = {} as Request;
      req.body = { username: 'invalid', password: 'password' };
      const doneFn = jest.fn();

      // when / then
      passport.authenticate(
        'local',
        (err: string | unknown, user: string, info: { message: string }) => {
          expect(err).toBeNull();
          expect(user).toBe(false);
          expect(info.message).toEqual(ERROR_MESSAGES.DEFAULT);
        },
      )(req, {} as Response, doneFn);
    });

    it('should not authenticate user with invalid password', () => {
      // given
      const req = {} as Request;
      req.body = { username: 'valid', password: 'invalid' };
      const doneFn = jest.fn();

      // when / then
      passport.authenticate(
        'local',
        (err: string | unknown, user: string, info: { message: string }) => {
          expect(err).toBeNull();
          expect(user).toBe(false);
          expect(info.message).toEqual(ERROR_MESSAGES.DEFAULT);
        },
      )(req, {} as Response, doneFn);
    });

    it('should return an error message if the username is invalid', () => {
      // given / when
      const verifyFn = jest.fn((_username: string, _password: string, cb) => {
        cb(null, false, {
          message: ERROR_MESSAGES.USERNAME.DEFAULT,
        });
      });
      jest
        .spyOn(db, 'get')
        .mockImplementationOnce((_query, _params, callback) => {
          return callback(null, null);
        });
      const strategy = new LocalStrategy(verifyFn);
      passport.use(strategy);
      const req = {} as Request;
      req.body = { username: 'invalid', password: 'password' };
      const doneFn = jest.fn();

      // then
      strategy._verify(req.body.username, req.body.password, doneFn);
      expect(verifyFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledWith(null, false, {
        message: ERROR_MESSAGES.USERNAME.DEFAULT,
      });
    });
    it('should return an error message if the username is invalid', () => {
      // given / when
      const verifyFn = jest.fn((_username, _password, cb) => {
        cb(null, false, {
          message: ERROR_MESSAGES.USERNAME.DEFAULT,
        });
      });
      jest
        .spyOn(db, 'get')
        .mockImplementationOnce((_query, _params, callback) => {
          return callback(null, null);
        });
      const strategy = new LocalStrategy(verifyFn);
      passport.use(strategy);
      const req = {} as Request;
      req.body = { username: 'invalid', password: 'password' };
      const doneFn = jest.fn();

      // then
      strategy._verify(req.body.username, req.body.password, doneFn);
      expect(verifyFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledWith(null, false, {
        message: ERROR_MESSAGES.USERNAME.DEFAULT,
      });
    });

    it('should return an error message if the password is invalid', () => {
      // given / when
      const verifyFn = jest.fn((_username, _password, cb) => {
        cb(null, false, {
          message: ERROR_MESSAGES.DEFAULT,
        });
      });
      jest
        .spyOn(db, 'get')
        .mockImplementationOnce((_query, _params, callback) => {
          return callback(null, {});
        });
      const strategy = new LocalStrategy(verifyFn);
      passport.use(strategy);
      const req = {} as Request;
      req.body = { username: 'valid', password: 'invalid' };
      const doneFn = jest.fn();

      // then
      strategy._verify(req.body.username, req.body.password, doneFn);
      expect(verifyFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledWith(null, false, {
        message: ERROR_MESSAGES.DEFAULT,
      });
    });

    it('should return the user if the username and password are valid', () => {
      // given / when
      const verifyFn = jest.fn((_username, _password, cb) => {
        const row = {
          salt: 'someSalt',
          hashed_password: Buffer.from('correctPassword'),
        };
        cb(null, row);
      });
      jest
        .spyOn(db, 'get')
        .mockImplementationOnce((_query, _params, callback) => {
          return callback(null, {});
        });
      const strategy = new LocalStrategy(verifyFn);
      passport.use(strategy);
      const req = {} as Request;
      req.body = { username: 'valid', password: 'password' };
      const doneFn = jest.fn();

      // then
      strategy._verify(req.body.username, req.body.password, doneFn);
      expect(verifyFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledTimes(1);
      expect(doneFn).toHaveBeenCalledWith(null, expect.objectContaining({}));
    });
  });

  describe('passport serialisation', () => {
    const user = { id: 1, username: 'test', role: 'user' };
    let cb: jest.Mock<unknown, unknown[], unknown>;

    beforeEach(() => {
      cb = jest.fn();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should serialize user correctly serializeUser()', () => {
      // given / when
      passport.serializeUser(user, cb);
      jest.runAllTicks();

      // then
      expect(cb).toHaveBeenCalledWith(null, {
        id: 1,
        username: 'test',
        role: 'user',
      });
    });

    it('should deserialize user correctly deserializeUser()', () => {
      // given / when
      passport.deserializeUser(user, cb);
      jest.runAllTicks();

      // then
      expect(cb).toHaveBeenCalledWith(null, {
        id: 1,
        username: 'test',
        role: 'user',
      });
    });
  });
});

describe('Passport Local Strategy Configuration with errors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // todo: database errors

  it('should handle errors during authentication', async () => {
    // given
    const expectedError = new Error('Authentication error');
    const verifyFn = jest.fn((_username, _password, cb) => {
      // Simulating an error during authentication
      cb(expectedError, null);
    });
    const strategy = new LocalStrategy({ usernameField: 'username' }, verifyFn);

    // when
    const doneFn = jest.fn();
    await strategy._verify('valid', 'password', doneFn);

    // then
    expect(verifyFn).toHaveBeenCalled();
    expect(doneFn).toHaveBeenCalledWith(expectedError, null);
  });
});
