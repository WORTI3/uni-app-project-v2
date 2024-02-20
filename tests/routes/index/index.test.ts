import request from 'supertest';
import app from '../../../src/app';

const getUrls = [
  // '/all',
  '/all/closed',
  // '/add',
  // '/settings',
  // '/1/edit',
  // '/1/view',
];

const postUrls = ['/', '/settings', '/1/edit', '/1/view', '/1/delete'];

describe('index 302 redirect routes', () => {
  test.each(getUrls)('should return 302 for GET %s', async (url) => {
    await request(app).get(url).expect(302);
  });
});

describe('index 403 forbidden routes when not logged in', () => {
  test.each(postUrls)('should return 403 for POST %s', async (url) => {
    await request(app).post(url).expect(403);
  });
});
