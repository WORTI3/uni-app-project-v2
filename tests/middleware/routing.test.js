const { checkAll, checkAdd } = require("../../src/middleware/routing");
const { ASSET_STATUS } = require("../../src/assets/constants");

describe('checkAll() unit tests', () => {
  // test consts kept in each test scope
  test('should call next() when all not present', () => {
    const req = { body: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAll(req, res, next);

    expect(res.redirect).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  test('should call redirect() when all present with value all', () => {
    const req = { body: { all: 'all' } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAll(req, res, next);

    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith('/' + req.body.all);
    expect(next).toBeCalledTimes(0);
  });

  test('should call redirect() when all present with value closed', () => {
    const req = { body: { all: ASSET_STATUS.CLOSED } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAll(req, res, next);

    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith('/all/closed');
    expect(next).toBeCalledTimes(0);
  });
});

describe('checkAdd() unit tests', () => {
  // test consts kept in each test scope
  test('should call next() when add not present', () => {
    const req = { body: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAdd(req, res, next);

    expect(res.redirect).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  test('should call redirect() when add present with value add', () => {
    const req = { body: { add: 'add' } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAdd(req, res, next);

    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith('/' + req.body.add);
    expect(next).toBeCalledTimes(0);
  });
});
