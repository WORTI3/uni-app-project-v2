import express, { Express } from 'express';
import { initPassport, isAuthenticated } from '../../src/middleware/passport';

describe('Passport Middleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    initPassport(app);
  });

  describe('Authentication Middleware', () => {
    it('should call next() if user is authenticated', () => {
      const req: any = { user: { id: 1 } };
      const next = jest.fn();
      isAuthenticated(req, {} as any, next);
      expect(next).toHaveBeenCalled();
    });

    it('should redirect to "/" if user is not authenticated', () => {
      const req: any = {};
      const res: any = { redirect: jest.fn() };
      isAuthenticated(req, res, {} as any);
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  // todo: happy paths
});
