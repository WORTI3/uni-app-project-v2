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

// jest.mock('../../../src/middleware/routing', () => ({
//   checkAll: jest.fn(),
//   checkAdd: jest.fn(),
//   checkEditUpdate: jest.fn(),
// }));

// jest.mock('../../../src/middleware/asset', () => ({
//   fetchAssets: jest.fn(),
//   // fetchAssetById: jest.fn(),
//   // updateAssetById: jest.fn(),
//   // updateLocalAsset: jest.fn(),
//   // checkEditAdmin: jest.fn(),
// }));

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

// describe('POST / route', () => {
//   it('should call ensureLoggedIn, checkAll, and checkAdd middleware', async () => {
//     // Mock middleware functions to simply call next()
//     (isAdmin as jest.Mock).mockImplementation((_req, _res, next) => next());

//     // Send POST request to the route
//     await request(app.use('/', indexRouter)).post('/').expect(200); // Assuming it returns 200 OK
//   });
// });

// describe('GET /all/closed', () => {
//   it('should return 200 status, match snapshot and load content correctly', async () => {
//     const assets = [
//       { id: 1, name: 'Asset 1' },
//       { id: 2, name: 'Asset 2' },
//       { id: 3, name: 'Asset 3', closed: 1 },
//     ];

//     ensureLoggedIn.mockImplementation((_req, res, next) => next());
//     isAdmin.mockImplementation((req, res, next) => next());
//     fetchAssets.mockImplementation((req, res, next) => {
//       res.locals.assets = assets;
//       res.locals.closedCount = 1;
//       next();
//     });

//     const result = await request(app).get('/all/closed').expect(200);
//     expect(result.get('Content-Type')).toContain('text/html');
//     expect(result.text).toMatchSnapshot();
//     const $ = cheerio.load(result.text);
//     const heading = $('h1').text();
//     expect(heading).toBe('Closed Tickets (1)');
//     expect($('a').length).toBe(4);
//   });
// });

// describe('GET /all', () => {
// it('should return 200 status, match snapshot and load content correctly', async () => {
//   // given / when
//   const result = await request(app.use('/', indexRouter))
//     .get('/settings')
//     .expect(200);

//   // then
//   expect(result.get('Content-Type')).toContain('text/html');
//   expect(result.text).toMatchSnapshot();
//   const $ = cheerio.load(result.text);
//   const heading = $('h1').text();
//   expect(heading).toBe('Your open tickets (2)');
//   expect($('a').length).toBe(4);
// });
// it('should return 200 status, match snapshot and load content correctly', async () => {
//   const assets = [
//     { id: 1, name: 'Asset 1' },
//     { id: 2, name: 'Asset 2' },
//     { id: 3, name: 'Asset 3', closed: 1 },
//   ];

//   // (fetchAssets as jest.Mock).mockImplementation((req, res, next) => {
//   //   res.locals.assets = assets;
//   //   res.locals.openCount = 2;
//   //   next();
//   // });
//   app.use(async (_req, res, next) => {
//     res.locals.assets = assets;
//     res.locals.openCount = 2;
//     next();
//   });

//   const result = await request(app.use('/', indexRouter))
//     .get('/all')
//     .expect(200);
//   expect(result.get('Content-Type')).toContain('text/html');
//   expect(result.text).toMatchSnapshot();
//   const $ = cheerio.load(result.text);
//   const heading = $('h1').text();
//   expect(heading).toBe('Your open tickets (2)');
//   expect($('a').length).toBe(4);
// });
// });

// describe('GET /add', () => {
//   it('should return 200 status code match snapshot', async () => {
//     const result = await request(app).get('/add').expect(200);
//     expect(result.get('Content-Type')).toContain('text/html');
//     expect(result.text).toMatchSnapshot();
//   });

//   it('should render add content', async () => {
//     const result = await request(app).get('/add').expect(200);

//     const $ = cheerio.load(result.text);
//     const heading = $('h1').text();
//     expect(heading).toBe('Raise a new ticket');
//     expect($('a').length).toBe(4);
//   });
// });

// describe('GET /settings', () => {
//   it('should return 200 status code match snapshot', async () => {
//     const result = await request(app).get('/settings').expect(200);
//     expect(result.get('Content-Type')).toContain('text/html');
//     expect(result.text).toMatchSnapshot();
//   });

//   it('should render add content', async () => {
//     const result = await request(app).get('/settings').expect(200);

//     const $ = cheerio.load(result.text);
//     expect($('p').length).toBe(4);
//     expect($('a').length).toBe(6);
//   });
// });

// describe('GET /1/edit', () => {
//   const id = 1;
//   const url = '/' + id + '/edit';
//   fetchAssetById.mockImplementation((req, res, next) => {
//     res.locals.asset = { id: 1, name: 'test asset' };
//     next();
//   });
//   updateLocalAsset.mockImplementation((req, res, next) => next());
//   it('should return 200 status code match snapshot', async () => {
//     const result = await request(app).get(url).expect(200);
//     expect(result.get('Content-Type')).toContain('text/html');
//     expect(result.text).toMatchSnapshot();
//   });

//   it('should render edit content with correct ID', async () => {
//     const result = await request(app).get(url).expect(200);

//     const $ = cheerio.load(result.text);
//     const heading = $('h1').text();
//     expect(heading).toBe('Editing asset: #' + id);
//     expect($('a').length).toBe(4);
//   });
// });

// describe('GET /1/view', () => {
//   const id = 1;
//   const url = '/' + id + '/view';
//   updateAssetById.mockImplementation((req, res, next) => next());
//   fetchAssetById.mockImplementation((req, res, next) => {
//     res.locals.asset = { id: 1, name: 'test asset' };
//     next();
//   });
//   it('should return 200 status code match snapshot', async () => {
//     const result = await request(app).get(url).expect(200);
//     expect(result.get('Content-Type')).toContain('text/html');
//     expect(result.text).toMatchSnapshot();
//   });

//   it('should render view content with correct ID', async () => {
//     const result = await request(app).get(url).expect(200);

//     const $ = cheerio.load(result.text);
//     const heading = $('h1').text();
//     expect(heading).toBe('Viewing asset: #' + id);
//     expect($('a').length).toBe(4);
//   });
// });
