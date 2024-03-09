import request from 'supertest';
import {
  checkValidationResult,
  isAdmin,
  ensureAuth,
} from '../../../src/middleware/auth';
import express, { Request } from 'express';
import db from '../../../src/db';
import { indexRouter } from '../../../src/routes';
import session from 'express-session';
import { ASSET_STATUS } from '../../../src/assets/constants';

jest.mock('../../../src/db', () => ({
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn(),
}));

jest.mock('../../../src/middleware/auth', () => ({
  isAdmin: jest.fn(),
  ensureAuth: jest.fn(),
  checkValidationResult: jest.fn(),
}));

const app = express();

describe('POST routes', () => {
  // test setup
  let mockReq: Partial<Request> = {};
  beforeEach(async () => {
    (ensureAuth as jest.Mock).mockImplementation((_req, _res, next) => next());
    (isAdmin as jest.Mock).mockImplementation((_req, _res, next) => next());
    mockReq = {
      user: { id: 1, role: 1, username: 'username' },
      body: {
        name: 'assetName',
        code: '123456',
        type: 'type',
        note: 'note',
        closed: false,
      },
      session: { messages: [], msgTone: '', errorFields: [] },
    } as unknown as Request;

    app.use(async (req, _res, next) => {
      // Assigning seperately for safety and to mimic previous middlewares
      req.user = mockReq.user;
      req.body = mockReq.body;
      req.session = mockReq.session as session.Session;
      next();
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should POST `/add` and isAdmin and validation middlewares allow the req object through', async () => {
    // given
    // Mock checkValidationResult middleware to directly call next()
    (checkValidationResult as jest.Mock).mockImplementation(
      (_req, _res, next) => next(),
    );

    // when
    // Mock database insertion function
    const mockDbRun = jest
      .spyOn(db, 'run')
      .mockImplementationOnce((_query, _params, callback) => {
        return callback(null, null);
      });

    // Send POST request to the route
    await request(app.use('/', indexRouter)).post('/add').expect(302);

    // then
    expect(ensureAuth).toHaveBeenCalled();
    expect(isAdmin).not.toHaveBeenCalled();
    expect(checkValidationResult).toHaveBeenCalled();
    expect(mockDbRun).toHaveBeenCalledWith(
      'INSERT INTO assets (owner_id, owner_name, created, updated, name, code, type, status, note, closed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        1,
        'username',
        expect.any(String),
        expect.any(String),
        'assetName',
        '123456',
        'type',
        'open',
        'note',
        null,
      ],
      expect.any(Function),
    );
  });

  it('should POST `/delete` and isAdmin middleware allow the req object through', async () => {
    // given / when
    // Mock database insertion function
    const mockDbRun = jest
      .spyOn(db, 'run')
      .mockImplementationOnce((_query, _params, callback) => {
        return callback(null, null);
      });

    // Send POST request to the route
    await request(app.use('/', indexRouter)).post('/1/delete').expect(302);

    // then
    expect(isAdmin).toHaveBeenCalled();
    expect(checkValidationResult).not.toHaveBeenCalled();
    expect(mockDbRun).toHaveBeenCalledWith(
      'DELETE FROM assets WHERE id = ? AND owner_id = ?',
      ['1', 1],
      expect.any(Function),
    );
  });

  it('should POST `/dashboard` when reg.body.all present', async () => {
    // given
    app.use(async (req, _res, next) => {
      req.body.all = ASSET_STATUS.OPEN;
      next();
    });

    // when
    // Send POST request to the route
    const result = await request(app.use('/', indexRouter))
      .post('/')
      .expect(302);

    // then
    expect(result.redirect).toBeTruthy();
    expect(ensureAuth).toHaveBeenCalled();
    expect(isAdmin).not.toHaveBeenCalled();
    expect(checkValidationResult).toHaveBeenCalledTimes(0);
  });

  it('should POST `/dashboard` when reg.body.add present', async () => {
    // given
    app.use(async (req, _res, next) => {
      req.body.add = 'add';
      next();
    });

    // when
    // Send POST request to the route
    const result = await request(app.use('/', indexRouter))
      .post('/')
      .expect(302);

    // then
    expect(result.redirect).toBeTruthy();
    expect(ensureAuth).toHaveBeenCalled();
    expect(isAdmin).not.toHaveBeenCalled();
    expect(checkValidationResult).toHaveBeenCalledTimes(0);
  });

  it.skip('should POST `/:id(\\d+)/view` as `/1/view`', async () => {
    // given

    // when
    // Mock database all function
    await request(app.use('/', indexRouter)).post('/1/view').expect(302);
  });
});
