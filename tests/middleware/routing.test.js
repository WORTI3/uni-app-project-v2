const {
  checkAll,
  checkAdd,
  checkEditUpdate,
  checkEditAdmin,
  checkEditClosed,
  checkEditUpdated,
} = require("../../src/middleware/routing");
const {
  ASSET_STATUS,
  EDIT_UPDATES,
  SUCCESS_MESSAGES,
} = require("../../src/assets/constants");

describe("checkAll() unit tests", () => {
  // test consts kept in each test scope
  test("should call next() when all not present", () => {
    const req = { body: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAll(req, res, next);

    expect(res.redirect).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  test("should call redirect() when all present with value all", () => {
    const req = { body: { all: "all" } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAll(req, res, next);

    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith("/" + req.body.all);
    expect(next).toBeCalledTimes(0);
  });

  test("should call redirect() when all present with value closed", () => {
    const req = { body: { all: ASSET_STATUS.CLOSED } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAll(req, res, next);

    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith("/all/closed");
    expect(next).toBeCalledTimes(0);
  });
});

describe("checkAdd() unit tests", () => {
  // test consts kept in each test scope
  test("should call next() when add not present", () => {
    const req = { body: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAdd(req, res, next);

    expect(res.redirect).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  test("should call redirect() when add present with value add", () => {
    const req = { body: { add: "add" } };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAdd(req, res, next);

    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toBeCalledWith("/" + req.body.add);
    expect(next).toBeCalledTimes(0);
  });
});

describe("checkEditUpdate() unit tests", () => {
  // keeping req, res & next in each test scope
  test('should call next if update is not "update"', () => {
    const req = {
      body: { update: EDIT_UPDATES.CLOSE },
      session: {},
      params: { id: "123" },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkEditUpdate(req, res, next);

    expect(req.session.update).toBeUndefined();
    expect(req.session.messages).toBeUndefined();
    expect(req.session.msgTone).toBeUndefined();
    expect(res.redirect).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  test('should set session update and messages if update is "update"', () => {
    const req = {
      body: {
        update: EDIT_UPDATES.UPDATE,
        name: "Test Name",
        code: "Test Code",
        type: "Test Type",
        note: "Test Note",
      },
      session: {},
      params: { id: "1" },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkEditUpdate(req, res, next);

    expect(req.session.update).toEqual({
      name: "Test Name",
      code: "Test Code",
      type: "Test Type",
      note: "Test Note",
      updated: true,
    });
    expect(req.session.messages).toEqual([SUCCESS_MESSAGES.DEFAULT]);
    expect(req.session.msgTone).toEqual("positive");
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/1/view");
    expect(next).toBeCalledTimes(0);
  });
});

describe("checkEditAdmin() unit tests", () => {
  // keeping req, res & next in each test scope
  test('should call next if update is not "close"', () => {
    const req = {
      body: { update: EDIT_UPDATES.DELETE },
      session: {},
      params: { id: "1" },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkEditAdmin(req, res, next);

    expect(req.session.update).toBeUndefined();
    expect(req.session.messages).toBeUndefined();
    expect(req.session.msgTone).toBeUndefined();
    expect(res.redirect).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  test('should set session closed and messages if update is "close"', () => {
    const req = {
      body: {
        update: EDIT_UPDATES.CLOSE,
        name: "Test Name",
        code: "Test Code",
        type: "Test Type",
        note: "Test Note",
      },
      session: {},
      params: { id: "1" },
    };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkEditAdmin(req, res, next);

    expect(req.session.update).toEqual({
      name: "Test Name",
      code: "Test Code",
      type: "Test Type",
      note: "Test Note",
      status: ASSET_STATUS.CLOSED,
      closed: true,
    });
    expect(req.session.messages).toEqual([SUCCESS_MESSAGES.CLOSED]);
    expect(req.session.msgTone).toEqual("positive");
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/1/view");
    expect(next).toBeCalledTimes(0);
  });
});

describe("checkEditClosed() unit tests", () => {
  var req;
  var res;
  const next = jest.fn();

  beforeEach(() => {
    req = {
      session: {
        update: {},
      },
      user: {},
    };
    res = { render: jest.fn() };
  });

  test("should render index page with edit and readOnly properties when req.session.update.closed is true", () => {
    req.session.update.closed = true;
    checkEditClosed(req, res, next);
    expect(res.render).toBeCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith("index", {
      user: req.user,
      edit: true,
      readOnly: true,
    });
    expect(next).toBeCalledTimes(0);
  });

  test("should call next middleware when req.session.update.closed is false", () => {
    req.session.update.closed = false;
    checkEditClosed(req, res, next);
    expect(res.render).toBeCalledTimes(0);
    expect(next).toHaveBeenCalled();
  });
});

describe("checkEditUpdated() unit tests", () => {
  test("should render index when req.session.update.updated is true", () => {
    const req = { session: { update: { updated: true } }, user: {} };
    const res = { render: jest.fn() };
    const next = jest.fn();

    checkEditUpdated(req, res, next);

    expect(res.render).toBeCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith("index", {
      user: {},
      readOnly: true,
    });
    expect(next).toBeCalledTimes(0);
  });

  test("should call next when req.session.update.updated is false", () => {
    const req = { session: { update: { updated: false } } };
    const res = { render: jest.fn() };
    const next = jest.fn();

    checkEditUpdated(req, res, next);

    expect(res.render).toBeCalledTimes(0);
    expect(next).toHaveBeenCalled();
  });
});
