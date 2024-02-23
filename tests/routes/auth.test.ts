import request from 'supertest';
import cheerio from 'cheerio';
import app from '../../src/app';
import * as passport from 'passport';
import express, { Request } from 'express';
import { authRouter } from '../../src/routes/auth';
import { Session } from '../../src/types';
import session from 'express-session';

// Mock passport.authenticate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(passport as any).authenticate = jest.fn();

describe('POST /login/password', () => {
  const tempApp = express();
  tempApp.use(express.json());

  let mockReq: Partial<Request> = {};
  beforeEach(async () => {
    jest.resetAllMocks();
    mockReq = {
      body: { username: 'testuser', password: 'wrongpassword' },
      session: { messages: [], msgTone: '', errorFields: [] } as Session,
    } as unknown as Request;

    tempApp.use(async (req, _res, next) => {
      // Assigning seperately for safety and to mimic previous middlewares
      req.body = mockReq.body;
      req.session = mockReq.session as session.Session;
      next();
    });
  });

  it('should handle authentication failure and redirect user', async () => {
    // given
    // Mock passport.authenticate behavior for failure
    (passport.authenticate as jest.Mock).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/ban-types
      (strategy: string, callback: Function) => {
        callback(null, false, { message: 'Authentication failed' });
      },
    );

    // when / then
    await request(tempApp.use('/', authRouter))
      .post('/login/password')
      .send(mockReq.body)
      .expect(302) // Expecting redirect
      .expect('Location', '/login');
  });

  it('should handle authentication when error', async () => {
    // given
    // Mock passport.authenticate behavior for success
    (passport.authenticate as jest.Mock).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/ban-types
      (strategy: string, callback: Function) => {
        callback(new Error('broke'));
      },
    );

    // when / then
    await request(tempApp.use('/', authRouter))
      .post('/login/password')
      .send(mockReq.body)
      .expect(302) // Expecting redirect
      .expect('Location', '/login');
  });
});

describe('GET /signup', () => {
  it('should return 200 status code match snapshot', async () => {
    // given / when
    const result = await request(app).get('/signup').expect(200);

    // then
    expect(result.get('Content-Type')).toContain('text/html');
    // Remove CSRF token from the response text for snapshot matching
    const resultTextNoCSRF = result.text.replace(
      /<input type="hidden" name="_csrf" value=".*">/g,
      '',
    );
    expect(resultTextNoCSRF).toMatchSnapshot();
  });

  it('should render add content', async () => {
    // given / when
    const result = await request(app).get('/signup').expect(200);

    // then
    const $ = cheerio.load(result.text);
    const para = $('p').text();
    expect(para).toBe(
      'Already have an account? Sign inPassword must be at least 5 characters containing 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    );
    expect($('a').length).toBe(4);
  });
});

describe('GET /login', () => {
  it('should return 200 status code match snapshot', async () => {
    // given / when
    const result = await request(app).get('/login').expect(200);

    // then
    expect(result.get('Content-Type')).toContain('text/html');
    const resultTextNoCSRF = result.text.replace(
      /<input type="hidden" name="_csrf" value=".*">/g,
      '',
    );
    expect(resultTextNoCSRF).toMatchSnapshot();
  });

  it('should render add content', async () => {
    // given / when
    const result = await request(app).get('/login').expect(200);

    // then
    const $ = cheerio.load(result.text);
    const para = $('p').text();
    expect(para).toBe("Don't have an account? Sign Up");
    expect($('a').length).toBe(4);
  });
});
