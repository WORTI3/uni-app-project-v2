import request from 'supertest';
import cheerio from 'cheerio';
import app from '../src/app';
import supertest from 'supertest';

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
