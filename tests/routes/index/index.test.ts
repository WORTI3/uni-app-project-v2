import request from 'supertest';
import app from '../../../src/app';

const getUrls = [
  '/all',
  '/all/closed',
  '/add',
  '/settings',
  '/1/edit',
  '/1/view',
];

describe('index 302 redirect routes', () => {
  test.each(getUrls)('should return 302 for GET %s', async (url) => {
    await request(app).get(url).expect(302);
  });
});
