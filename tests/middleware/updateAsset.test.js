const { updateAssetById } = require("../../src/middleware/asset");
const { ASSET_STATUS } = require("../../src/assets/constants");
const db = require('../../src/db');
// Mock implementation of the db module
jest.mock('../../src/db', () => {
  return {
    run: jest.fn()
  };
});

describe('updateAssetById() unit tests', () => {
  beforeEach(() => {
    // Clear the mock implementation between tests
    jest.clearAllMocks();
    // db.run.mockReset();
  });
  it('should update the asset with the correct values', () => {
    const req = {
      session: {
        update: {
          name: 'new name',
          code: 'new code',
          type: 'new type',
          note: 'new note',
          status: ASSET_STATUS.CLOSED,
          closed: true
        }
      },
      params: { id: 1 },
      user: { id: 1 }
    };
    const res = {};
    const next = jest.fn();

    updateAssetById(req, res, next);

    expect(db.run).toHaveBeenCalledWith(
      'UPDATE assets SET name = ?, code = ?, type = ?, note = ?, status = ?, closed = ?, updated = ? WHERE id = ? AND owner_id = ?',
      [
        req.session.update.name,
        req.session.update.code,
        req.session.update.type,
        req.session.update.note,
        req.session.update.status,
        1,
        expect.any(String),
        req.params.id,
        req.user.id
      ],
      expect.any(Function)
    );
  });

  it('should update the asset with the default status if status is not provided', () => {
    const req = {
      session: {
        update: {
          name: 'new name',
          code: 'new code',
          type: 'new type',
          note: 'new note'
        }
      },
      params: { id: 1 },
      user: { id: 1 }
    };
    const res = {};
    const next = jest.fn();

    updateAssetById(req, res, next);

    expect(db.run).toHaveBeenCalledWith(
      'UPDATE assets SET name = ?, code = ?, type = ?, note = ?, status = ?, closed = ?, updated = ? WHERE id = ? AND owner_id = ?',
      [
        req.session.update.name,
        req.session.update.code,
        req.session.update.type,
        req.session.update.note,
        ASSET_STATUS.OPEN,
        null,
        expect.any(String),
        req.params.id,
        req.user.id
      ],
      expect.any(Function)
    );
  });

  it('should call next with an error if the database query fails', () => {
    const req = {
      session: {
        update: {
          name: 'new name',
          code: 'new code',
          type: 'new type',
          note: 'new note'
        }
      },
      params: { id: 1 },
      user: { id: 1 }
    };
    const res = {};
    const next = jest.fn();
    const error = new Error("database error");

    db.run.mockImplementationOnce((query, params, callback) => {
      callback(error);
    });

    updateAssetById(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});

