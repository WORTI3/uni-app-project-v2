import { Request, Response } from 'express';
import { ERROR_MESSAGES } from '../../src/assets/constants';
import { checkValidationResult, isAdmin } from '../../src/middleware/auth';
import { Session, User } from '../../src/types';
import { validationResult } from 'express-validator';

type Id = {
  id?: unknown | number;
};

type AuthenticatedRequest = Request & {
  isAuthenticated: jest.Mock;
  session: unknown | Session;
  params: Id;
  user: User;
};

jest.mock('express-validator');

describe('isAdmin() unit tests', () => {
  const req = {
    isAuthenticated: jest.fn(),
    session: { messages: [] },
    params: { id: 1 },
    user: {},
  } as unknown as AuthenticatedRequest;
  const res = { redirect: jest.fn() } as unknown as Response;
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if the user is authenticated and has role 1', () => {
    // given
    req.isAuthenticated.mockReturnValue(true);
    req.user.role = 1;

    // when
    isAdmin(req, res, next);

    // then
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
    expect((req.session as Session).messages).toEqual([]);
  });

  it('should redirect to the edit page with an error message if the user is not authenticated', () => {
    req.isAuthenticated.mockReturnValue(false);
    isAdmin(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/');
    expect((req.session as Session).messages).toEqual([ERROR_MESSAGES.NO_PERMISSION]);
  });

  it('should redirect to the edit page with an error message if the user is authenticated but does not have role 1', () => {
    req.isAuthenticated.mockReturnValue(true);
    req.user.role = undefined;
    isAdmin(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/');
    expect((req.session as Session).messages).toEqual([ERROR_MESSAGES.NO_PERMISSION]);
  });
});

jest.mock('express-validator');

describe('checkValidationResult() unit tests', () => {
  const req = {
    session: {},
    body: {},
    originalUrl: '/example',
  } as unknown as Request;
  const res = {
    redirect: jest.fn(),
  } as unknown as Response;
  const next = jest.fn();
  const error = { msg: ERROR_MESSAGES.DEFAULT };

  beforeEach(() => {
    // mock error result
    (validationResult as unknown as jest.Mock).mockReturnValue({
      array: jest.fn(() => [error]),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call next when no validation errors present', () => {
    // mock no errors
    (validationResult as unknown as jest.Mock).mockReturnValue({
      array: jest.fn(() => []),
    });
    checkValidationResult(req, res, next);
    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should redirect when validation errors exist', () => {
    const error = { msg: ERROR_MESSAGES.DEFAULT };
    (validationResult as unknown as jest.Mock).mockReturnValue({
      array: jest.fn(() => [error]),
    });
    checkValidationResult(req, res, next);
    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.redirect).toHaveBeenCalledWith('/example');
    expect((req.session as Session).messages).toEqual([ERROR_MESSAGES.DEFAULT]);
  });

  it('should add asset into session if url ends in /edit', () => {
    req.originalUrl = '/example/edit';
    const asset = {
      name: 'testuser',
      code: 'testitem',
      type: '12345',
      note: 'testnote',
    };
    req.body = asset;

    checkValidationResult(req, res, next);

    expect((req.session as Session).asset).toEqual(asset);
    expect(res.redirect).toHaveBeenCalledWith('/example/edit');
  });
});
