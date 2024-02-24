import request from 'supertest';
import cheerio from 'cheerio';
import app, { errorHandler } from '../src/app';
import supertest from 'supertest';
import express from 'express';

describe('Nunjucks configuration', () => {
  it("should set the view engine to 'njk'", () => {
    expect(app.get('view engine')).toBe('njk');
  });
});

describe('handle 404 errors', () => {
  test('GET /non-existent-route should return 404', async () => {
    await request(app).get('/non-existent-route').expect(404);
  });

  it('should render error template with status 404 for not found error', async () => {
    // given / when
    const result = await request(app).get('/invalid_route').expect(404);
    const $ = cheerio.load(result.text);

    // then
    expect(result.status).toBe(404);
    expect($('h1').text()).toBeDefined();
    expect($('h2').text()).toBe('Error: Not Found');
    expect($('p')).toHaveLength(2);
    expect($('p').text()).toBe(
      'Looks like the application has thrown an errorPlease try again later',
    );
    expect(result.text).toMatchSnapshot();
  });
});

describe('unit tests for app.js routers', () => {
  // '/' for home is the same as this test
  test('GET / should return 200', async () => {
    const body = {
      groupName: 'Test Group Name',
      email: 'test@example.com',
      country: 'US',
    };
    await supertest(app).get('/').send(body).expect(200);
  });

  test('GET /login should return 200', async () => {
    await request(app).get('/login').expect(200);
  });

  test('GET /signup should return 200', async () => {
    await request(app).get('/signup').expect(200);
  });
});

describe('errorHandler test errors', () => {
  const tempApp = express();
  tempApp.use(errorHandler);
  const errorMessage = 'Test error message';
  const itif = (env?: string) => (env === 'test' ? it : it.skip);

  itif(process.env.NODE_ENV)(
    'should respond with error message and status 500',
    async () => {
      // given
      tempApp.use((_req, _res, next) => {
        next(new Error(errorMessage));
      });

      // when
      const response = await request(tempApp).get('/');

      // then
      const $ = cheerio.load(response.text);
      expect($('title').text()).toBe('Error');
      expect($('pre').text()).toContain('Error: Test error message');
      expect(response.status).toBe(500);
    },
  );

  itif(process.env.NODE_ENV)(
    'should set locals message and error in development environment',
    async () => {
      // given

      tempApp.use((_req, _res, next) => {
        next(new Error(errorMessage));
      });

      // when
      const response = await request(tempApp).get('/');

      // then
      expect(response.text).toContain(errorMessage);
      const $ = cheerio.load(response.text);
      expect($('title').text()).toBe('Error');
      expect($('pre').text()).toContain('Error: Test error message');
      expect(response.status).toBe(500);
    },
  );
});

process.env.NODE_ENV = 'production';

describe('errorHandler production errors', () => {
  const tempApp = express();
  tempApp.use(errorHandler);
  const errorMessage = 'Test error message';
  const itif = (env?: string) => (env === 'production' ? it : it.skip);

  itif(process.env.NODE_ENV)(
    'should respond with error message and status 500',
    async () => {
      // given
      tempApp.use((_req, _res, next) => {
        next(new Error(errorMessage));
      });

      // when
      const response = await request(tempApp).get('/');

      // then
      const $ = cheerio.load(response.text);
      expect($('title').text()).toBe('Error');
      expect($('pre').text()).toBe('Internal Server Error');
      expect(response.status).toBe(500);
    },
  );

  itif(process.env.NODE_ENV)(
    'should not set locals error in production environment',
    async () => {
      // given
      tempApp.use((_req, _res, next) => {
        next(new Error(errorMessage));
      });

      // when
      const response = await request(tempApp).get('/');

      // then
      expect(response.status).toBe(500); // Ensure status 500 for production
      expect(response.text).not.toContain(errorMessage); // Error message should not be exposed in production

      const $ = cheerio.load(response.text);
      expect($('title').text()).toBe('Error');
      expect($('pre').text()).not.toContain('Error: Test error message');
    },
  );
});
