const { ASSET_STATUS } = require("../../src/assets/constants");
import { Request, Response } from "express";
import db from "../../src/db";
import { fetchAssets, fetchAssetById, updateLocalAsset } from "../../src/middleware/asset";

const isAuthenticated = jest.fn().mockReturnValue(true);

let dbAllMockCallback: jest.Mock;

jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    all: jest.fn((query, params, callback) => {
      dbAllMockCallback(query, params, callback); // Call the mock callback
    })
  }
}));

beforeEach(() => {
  dbAllMockCallback = jest.fn(); // Reset the mock callback before each test
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("fetchAssets()", () => {
  test("should call next(err) if there is an error while fetching assets from the database", () => {
    // given
    const req = {
      isAuthenticated,
      user: { id: 1 },
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();
    dbAllMockCallback.mockImplementationOnce((_query, _params, callback) => {
      callback(new Error("database error"));
    });

    // when
    fetchAssets(req, res, next);

    // then
    expect(next).toHaveBeenCalledWith(new Error("database error"));
  });

  test("should set correct res.locals.assets for admin user", () => {
    // given / admin request
    const req = {
      isAuthenticated,
      user: { id: 1, role: 1 },
    } as unknown as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn();
    const rowsFixture = [
      {
        id: 1,
        owner_id: 1,
        created: "2022-01-01T00:00:00.000Z",
        updated: "2022-01-02T00:00:00.000Z",
        name: "Asset 1",
        code: "A1",
        type: "Type 1",
        status: ASSET_STATUS.OPEN,
        note: "Note 1",
        closed: null,
      },
      {
        id: 2,
        owner_id: 2, // different owner to first row
        created: "2022-01-03T00:00:00.000Z",
        updated: "2022-01-04T00:00:00.000Z",
        name: "Asset 2",
        code: "A2",
        type: "Type 2",
        status: ASSET_STATUS.OPEN,
        note: "Note 2",
        closed: null,
      },
    ];
    dbAllMockCallback.mockImplementationOnce((_query, _params, callback) => {
      callback(null, rowsFixture);
    });

    // when
    fetchAssets(req, res, next);

    // then
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
        status: ASSET_STATUS.OPEN,
        note: "Note 2",
        closed: false,
        url: "/2",
      },
    ]);
  });

  test("should set correct res.locals.assets when user is not an admin", () => {
    // given
    const req = {
      isAuthenticated,
      user: { id: 2, role: null },
    } as unknown as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn();

    const rowsFixture = [
      {
        id: 2,
        owner_id: 2, // different owner to first row
        created: "2022-01-03T00:00:00.000Z",
        updated: "2022-01-04T00:00:00.000Z",
        name: "Asset 2",
        code: "A2",
        type: "Type 2",
        status: ASSET_STATUS.OPEN,
        note: "Note 2",
        closed: null,
      }
    ];

    // when
    dbAllMockCallback.mockImplementationOnce((_query, _params, callback) => {
      callback(null, rowsFixture);
    });
    fetchAssets(req, res, next);

    // then
    expect(res.locals.assets).toEqual([
      {
        id: 2,
        created: "January 03, 2022",
        updated: "January 04, 2022",
        name: "Asset 2",
        code: "A2",
        type: "Type 2",
        status: ASSET_STATUS.OPEN,
        note: "Note 2",
        closed: false,
        url: "/2",
      }
    ]);
  });

  test("should set openCount and closedCount on res.locals", () => {
    const req = {
      isAuthenticated,
      user: { id: 1 },
    } as unknown as Request;
    const res = {
      locals: {},
    } as Response;
    const next = jest.fn();
    const rowsFixture = [
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
    
    // when
    dbAllMockCallback.mockImplementationOnce((_query, _params, callback) => {
      callback(null, rowsFixture);
    });
    fetchAssets(req, res, next);

    expect(res.locals.openCount).toEqual(1);
    expect(res.locals.closedCount).toEqual(2);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("fetchAssetById()", () => {
  it("should return the asset with the given ID", () => {
    // given
    const req = {
      params: { id: 1 },
      session: { asset: undefined },
    } as unknown as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn();
    const rowsFixture = [
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

    // when
    dbAllMockCallback.mockImplementationOnce((_query, _params, callback) => {
      callback(null, rowsFixture);
    });
    fetchAssetById(req, res, next);

    // then
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
    // given
    const req = {
      params: { id: 1 },
    } as unknown as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn();
    const error = new Error("database error");
    
    // when
    dbAllMockCallback.mockImplementationOnce((_query, _params, callback) => {
      callback(error);
    });

    fetchAssetById(req, res, next);

    // then
    expect(db.all).toHaveBeenCalledWith(
      "SELECT * FROM assets WHERE id = ?",
      [1],
      expect.any(Function)
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("updateLocalAsset()", () => {
  test("should call next() if req.session.asset is undefined", () => {
    // given
    const req = { session: {} } as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn();

    // when
    updateLocalAsset(req, res, next);

    // then
    expect(res.locals.asset).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should set locals.asset correctly when session.asset present", () => {
    // given
    const asset = { name: "asset 1", code: "NHS001" };
    const req = { session: { asset: asset } } as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn();

    // when
    updateLocalAsset(req, res, next);

    // then
    expect(req.session.asset).toBeUndefined();
    expect(res.locals.asset).toEqual(asset);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should override values if present in locals.asset", () => {
    // given
    const localAsset = { name: "asset 1", code: "NHS001", note: "Test note" };
    const asset = { name: "asset 2", code: "NHS002" };
    const req = { session: { asset: asset } } as Request;
    const res = { locals: { asset: localAsset } } as unknown as Response;
    const next = jest.fn();

    // when
    updateLocalAsset(req, res, next);

    // then
    expect(req.session.asset).toBeUndefined();
    expect(res.locals.asset).toEqual(asset);
    expect(next).toBeCalledTimes(1);
  });
});
