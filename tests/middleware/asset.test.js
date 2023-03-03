const {
  fetchAssets,
  fetchAssetById,
  fetchAssetsForAdmin,
  updateLocalAsset,
} = require("../../src/middleware/asset");
const { ASSET_STATUS } = require("../../src/assets/constants");
const db = require('../../src/db');

const isAuthenticated = jest.fn().mockReturnValue(true);

afterEach(() => {
  jest.clearAllMocks();
});

describe("fetchAssets() unit tests", () => {
  test("should call next() when role === 1 and user is authenticated", () => {
    const req = {
      isAuthenticated,
      user: { role: 1 },
    };
    const res = {};
    const next = jest.fn();

    fetchAssets(req, res, next);

    expect(req.isAuthenticated).toBeCalledTimes(1);
    expect(next).toBeCalledTimes(1);
  });

  test("should call next(err) if there is an error while fetching assets from the database", () => {
    const req = {
      isAuthenticated,
      user: { id: 1 },
    };
    const res = {};
    const next = jest.fn();
    db.all = jest.fn((query, params, callback) => {
      callback(new Error("database error"));
    });

    fetchAssets(req, res, next);

    expect(next).toHaveBeenCalledWith(new Error("database error"));
  });

  test("should set res.locals.assets to an array of asset objects with formatted dates and url", () => {
    const req = {
      isAuthenticated,
      user: { id: 1 },
    };
    const res = {
      locals: {},
    };
    const next = jest.fn();
    const rows = [
      {
        id: 1,
        created: "2022-01-01T00:00:00.000Z",
        updated: "2022-01-02T00:00:00.000Z",
        name: "Asset 1",
        code: "A1",
        type: "Type 1",
        status: ASSET_STATUS.OPEN,
        note: "Note 1",
        closed: 0,
      },
      {
        id: 2,
        created: "2022-01-03T00:00:00.000Z",
        updated: "2022-01-04T00:00:00.000Z",
        name: "Asset 2",
        code: "A2",
        type: "Type 2",
        status: ASSET_STATUS.CLOSED,
        note: "Note 2",
        closed: 1,
      },
    ];

    db.all = jest.fn((query, params, callback) => {
      callback(null, rows);
    });
    fetchAssets(req, res, next);

    expect(res.locals.assets).toEqual([
      {
        id: 1,
        created: "January 01, 2022",
        updated: "January 02, 2022",
        name: "Asset 1",
        code: "A1",
        type: "Type 1",
        status: ASSET_STATUS.OPEN,
        note: "Note 1",
        closed: false,
        url: "/1",
      },
      {
        id: 2,
        created: "January 03, 2022",
        updated: "January 04, 2022",
        name: "Asset 2",
        code: "A2",
        type: "Type 2",
        status: ASSET_STATUS.CLOSED,
        note: "Note 2",
        closed: true,
        url: "/2",
      },
    ]);
  });

  test("should set openCount and closedCount on res.locals", () => {
    const req = {
      isAuthenticated,
      user: { id: 1 },
    };
    const res = {
      locals: {},
    };
    const next = jest.fn();
    const rows = [
      {
        id: 1,
        created: "2022-01-01T00:00:00.000Z",
        updated: "2022-01-02T00:00:00.000Z",
        name: "Asset 1",
        code: "A1",
        type: "Type 1",
        status: ASSET_STATUS.OPEN,
        note: "Note 1",
        closed: 0,
      },
      {
        id: 2,
        created: "2022-01-03T00:00:00.000Z",
        updated: "2022-01-04T00:00:00.000Z",
        name: "Asset 2",
        code: "A2",
        type: "Type 2",
        status: ASSET_STATUS.CLOSED,
        note: "Note 2",
        closed: 1,
      },
      {
        id: 3,
        created: "2022-01-03T00:00:00.000Z",
        updated: "2022-01-04T00:00:00.000Z",
        name: "Asset 3",
        code: "A3",
        type: "Type 3",
        status: ASSET_STATUS.CLOSED,
        note: "Note 3",
        closed: 1,
      },
    ];

    db.all = jest.fn((query, params, callback) => {
      callback(null, rows);
    });
    fetchAssets(req, res, next);

    expect(res.locals.openCount).toEqual(1);
    expect(res.locals.closedCount).toEqual(2);
    expect(next).toBeCalledTimes(1);
  });
});

describe("fetchAssetById() unit tests", () => {
  it("should return the asset with the given ID", () => {
    const req = {
      params: { id: 1 },
      session: { asset: undefined },
    };
    const res = { locals: {} };
    const next = jest.fn();
    const rows = [
      {
        id: 1,
        created: "2022-01-01T00:00:00.000Z",
        updated: "2022-01-02T00:00:00.000Z",
        name: "Test Asset",
        owner_name: "John Doe",
        code: "123456",
        type: "computer",
        status: ASSET_STATUS.IN_USE,
        note: "Test note",
        closed: 0,
      },
    ];

    db.all.mockImplementation((query, params, callback) => {
      callback(null, rows);
    });

    fetchAssetById(req, res, next);

    expect(db.all).toHaveBeenCalledWith(
      "SELECT * FROM assets WHERE id = ?",
      [1],
      expect.any(Function)
    );
    expect(res.locals.asset).toEqual({
      id: 1,
      created: "January 01, 2022",
      updated: "January 02, 2022",
      name: "Test Asset",
      ownerName: "John Doe",
      code: "123456",
      type: "computer",
      status: ASSET_STATUS.IN_USE,
      note: "Test note",
      closed: false,
      url: "/1",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should call next with an error if there was an error fetching the asset from the database", () => {
    const req = {
      params: { id: 1 },
    };
    const res = { locals: {} };
    const next = jest.fn();
    const error = new Error("database error");
    db.all = jest.fn((query, params, callback) => {
      callback(error);
    });

    fetchAssetById(req, res, next);

    expect(db.all).toHaveBeenCalledWith(
      "SELECT * FROM assets WHERE id = ?",
      [1],
      expect.any(Function)
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("fetchAssetsForAdmin() unit tests", () => {
  test("should call next() when role !== 1 and user is not authenticated", () => {
    const req = {
      isAuthenticated: jest.fn().mockReturnValue(false),
      user: { role: null },
    };
    const res = {};
    const next = jest.fn();

    fetchAssetsForAdmin(req, res, next);

    expect(req.isAuthenticated).toBeCalledTimes(1);
    expect(next).toBeCalledTimes(1);
  });
});

describe("updateLocalAsset() unit tests", () => {
  test("should call next() if req.session.asset is undefined", () => {
    const req = { session: {} };
    const res = { locals: {} };
    const next = jest.fn();

    updateLocalAsset(req, res, next);

    expect(res.locals.asset).toBeUndefined();
    expect(next).toBeCalledTimes(1);
  });

  test("should set locals.asset correctly when session.asset present", () => {
    const asset = { name: "asset 1", code: "NHS001" };
    const req = { 
      session: { asset: asset }
    };
    const res = { locals: {} };
    const next = jest.fn();

    updateLocalAsset(req, res, next);

    expect(req.session.asset).toBeUndefined();
    expect(res.locals.asset).toEqual(asset);
    expect(next).toBeCalledTimes(1);
  });

  test("should override values if present in locals.asset", () => {
    const localAsset = { name: "asset 1", code: "NHS001", note: "Test note" };
    const asset = { name: "asset 2", code: "NHS002" };
    const req = { 
      session: { asset: asset }
    };
    const res = { locals: { asset: localAsset } };
    const next = jest.fn();

    updateLocalAsset(req, res, next);

    expect(req.session.asset).toBeUndefined();
    expect(res.locals.asset).toEqual(asset);
    expect(next).toBeCalledTimes(1);
  });
});