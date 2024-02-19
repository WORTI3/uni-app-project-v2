import { Request, Response } from 'express';
import {
  ASSET_STATUS,
  EDIT_UPDATES,
  SUCCESS_MESSAGES,
} from '../../src/assets/constants';
import {
  checkAdd,
  checkAll,
  checkEditAdmin,
  checkEditUpdate,
} from '../../src/middleware/routing';
import { Session } from '../../src/types';

afterEach(() => {
  jest.clearAllMocks();
});

describe('checkAll() unit tests', () => {
  // test consts kept in each test scope
  test('should call next() when all not present', () => {
    // given
    const req = { body: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkAll(req as unknown as Request, res as unknown as Response, next);

    // then
    expect(res.redirect).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should call redirect() when all present with value all', () => {
    // given
    const req = { body: { all: 'all' } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkAll(req as unknown as Request, res as unknown as Response, next);

    // then
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/' + req.body.all);
    expect(next).toHaveBeenCalledTimes(0);
  });

  test('should call redirect() when all present with value closed', () => {
    // given
    const req = { body: { all: ASSET_STATUS.CLOSED } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkAll(req as unknown as Request, res as unknown as Response, next);

    // then
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/all/closed');
    expect(next).toHaveBeenCalledTimes(0);
  });
});

describe('checkAdd() unit tests', () => {
  // test consts kept in each test scope
  test('should call next() when add not present', () => {
    const req = { body: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkAdd(req as unknown as Request, res as unknown as Response, next);

    expect(res.redirect).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should call redirect() when add present with value add', () => {
    // given
    const req = { body: { add: 'add' } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkAdd(req as unknown as Request, res as unknown as Response, next);

    // then
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/' + req.body.add);
    expect(next).toHaveBeenCalledTimes(0);
  });
});

describe('checkEditUpdate() unit tests', () => {
  // keeping req, res & next in each test scope
  test('should call next if update is not "update"', () => {
    // given
    const req = {
      body: { update: EDIT_UPDATES.CLOSE },
      session: {} as Session,
      params: { id: '123' },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkEditUpdate(
      req as unknown as Request,
      res as unknown as Response,
      next,
    );

    // then
    expect(req.session.update).toBeUndefined();
    expect(req.session.messages).toBeUndefined();
    expect(req.session.msgTone).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should set session update and messages if update is "update"', () => {
    // given
    const req = {
      body: {
        update: EDIT_UPDATES.UPDATE,
        name: 'Test Name',
        code: 'Test Code',
        type: 'Test Type',
        note: 'Test Note',
      },
      session: {} as Session,
      params: { id: '1' },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkEditUpdate(
      req as unknown as Request,
      res as unknown as Response,
      next,
    );

    // then
    expect(req.session.update).toEqual({
      name: 'Test Name',
      code: 'Test Code',
      type: 'Test Type',
      note: 'Test Note',
      updated: true,
    });
    expect(req.session.messages).toEqual([SUCCESS_MESSAGES.DEFAULT]);
    expect(req.session.msgTone).toEqual('positive');
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/1/view');
    expect(next).toHaveBeenCalledTimes(0);
  });
});

describe('checkEditAdmin() unit tests', () => {
  // keeping req, res & next in each test scope
  test('should call next if update is not "close"', () => {
    // given
    const req = {
      body: { update: EDIT_UPDATES.DELETE },
      session: {} as Session,
      params: { id: '1' },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkEditAdmin(req as unknown as Request, res as unknown as Response, next);

    // then
    expect(req.session.update).toBeUndefined();
    expect(req.session.messages).toBeUndefined();
    expect(req.session.msgTone).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should set session closed and messages if update is "close"', () => {
    // given
    const req = {
      body: {
        update: EDIT_UPDATES.CLOSE,
        name: 'Test Name',
        code: 'Test Code',
        type: 'Test Type',
        note: 'Test Note',
      },
      session: {} as Session,
      params: { id: '1' },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    // when
    checkEditAdmin(req as unknown as Request, res as unknown as Response, next);

    // then
    expect(req.session.update).toEqual({
      name: 'Test Name',
      code: 'Test Code',
      type: 'Test Type',
      note: 'Test Note',
      status: ASSET_STATUS.CLOSED,
      closed: true,
    });
    expect(req.session.messages).toEqual([SUCCESS_MESSAGES.CLOSED]);
    expect(req.session.msgTone).toEqual('positive');
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith('/1/view');
    expect(next).toHaveBeenCalledTimes(0);
  });
});
