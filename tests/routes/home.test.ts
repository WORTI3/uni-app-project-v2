import app from '../../src/app';
import request from 'supertest';
import cheerio from 'cheerio';
import { Request, Response } from 'express';
import { homeRouter } from '../../src/routes/home';

const url = '/';

describe('Home Router', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET ' + url, () => {
    it('should show the portal home page when no user present', async () => {
      const result = await request(app).get(url).expect(200);

      expect(result.header['content-type']).toContain('text/html');
      expect(result.text).toMatchSnapshot();
      expect(result.body).toStrictEqual({});
    });

    it('should render the home page when user is not authenticated', async () => {
      const result = await request(app).get(url).expect(200);

      const $ = cheerio.load(result.text);
      const heading = $('h1').text();
      expect(heading).toBe('Welcome to the Faultifier ticket portal');
      const subHeading = $('h2').text();
      expect(subHeading).toBe(
        'to view, create, delete tickets, you must have an account',
      );
      expect($('a').length).toBe(4);
    });
  });

  it('should render home template when user is not logged in', () => {
    // given / when
    homeRouter.stack[0].route.stack[0].handle(
      req as Request,
      res as Response,
      () => {},
    );

    // then
    expect(res.render).toHaveBeenCalledWith('home');
    expect(res.redirect).toHaveBeenCalledTimes(0);
  });

  it('should redirect to dashboard when user is logged in', () => {
    // given
    // Simulate a logged-in user
    req.user = { id: '123', username: 'testuser' };

    // when
    homeRouter.stack[0].route.stack[0].handle(
      req as Request,
      res as Response,
      () => {},
    );

    // then
    expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    expect(res.render).toHaveBeenCalledTimes(0);
  });
});
