import app from '../../src/app';
import request from 'supertest';
import cheerio from 'cheerio';

const url = '/';

describe('GET ' + url, () => {
  it('should show the portal home page when no user present', async () => {
    const result = await request(app)
      .get(url)
      .expect(200);

    expect(result.header['content-type']).toContain('text/html');
    expect(result.text).toMatchSnapshot();
    expect(result.body).toStrictEqual({});
  });

  it('should render the home page when user is not authenticated', async () => {
    const result = await request(app)
      .get(url)
      .expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h1').text();
    expect(heading).toBe('Welcome to the Faultifier ticket portal');
    const subHeading = $('h2').text();
    expect(subHeading).toBe('to view, create, delete tickets, you must have an account');
    expect($('a').length).toBe(4);
  });
});

