const request = require('supertest');
const cheerio = require('cheerio');

const app = require('../../src/app');

const url = '/';

describe('GET ' + url, () => {
  it('should show the portal home page when no user present', async () => {
    const result = await request(app)
      .get(url)
      .expect(200);

    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
    expect(result.body.user).toBeUndefined();
  });

  it('should render the home page when user is not authenticated', async () => {
    const result = await request(app)
      .get(url)
      .expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h1').text();
    expect(heading).toBe('Welcome to the portal');
    const subHeading = $('h3').text();
    expect(subHeading).toBe('to access the portal you must have an account');
    expect($('a').length).toBe(4);
  });
});

