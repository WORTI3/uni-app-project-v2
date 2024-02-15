import { Request, Response } from 'express';
import { ASSET_STATUS } from '../../src/assets/constants';
import db from '../../src/db';
import { updateAssetById } from '../../src/middleware/asset';
import { Database } from 'sqlite3';
import { User } from '../../src/types';

type Session = {
  update: {
    name: string;
    code: string;
    type: string;
    note: string;
    status: string;
  };
};

// Mock implementation of the db module
jest.mock('../../src/db', () => {
  return {
    __esModule: true,
    default: {
      run: jest.fn() // Mocking the run method
    } as unknown as Database // Providing explicit typings for the default export
  };
});

describe('updateAssetById()', () => {
  beforeEach(() => {
    // Clear the mock implementation between tests
    jest.clearAllMocks();
  });

  const res = {} as Response;

  it('should update the asset with the correct values', () => {
    // given
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
    } as unknown as Request;
    const next = jest.fn();

    // when
    updateAssetById(req, res, next);

    // then
    const session = req.session as unknown as Session;
    const user = req.user as unknown as User;
    expect(db.run).toHaveBeenCalledWith(
      'UPDATE assets SET name = ?, code = ?, type = ?, note = ?, status = ?, closed = ?, updated = ? WHERE id = ? AND owner_id = ?',
      [
        session.update.name,
        session.update.code,
        session.update.type,
        session.update.note,
        session.update.status,
        1,
        expect.any(String),
        req.params.id,
        user.id
      ],
      expect.any(Function)
    );
  });

  it('should update the asset with the default status if status is not provided', () => {
    // given
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
    } as unknown as Request;
    const next = jest.fn();

    // when
    updateAssetById(req, res, next);

    // then
    const session = req.session as unknown as Session;
    const user = req.user as unknown as User;
    expect(db.run).toHaveBeenCalledWith(
      'UPDATE assets SET name = ?, code = ?, type = ?, note = ?, status = ?, closed = ?, updated = ? WHERE id = ? AND owner_id = ?',
      [
        session.update.name,
        session.update.code,
        session.update.type,
        session.update.note,
        ASSET_STATUS.OPEN,
        null,
        expect.any(String),
        req.params.id,
        user.id
      ],
      expect.any(Function)
    );
  });

  it('should call next with an error if the database query fails', () => {
    // given
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
    } as unknown as Request;
    const next = jest.fn();
    const error = new Error("database error");

    (db.run as jest.Mock).mockImplementationOnce((_query, _params, callback) => {
      callback(error);
    });

    // when
    updateAssetById(req, res, next);

    // then
    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1, error);
    expect(next).toHaveBeenNthCalledWith(2);
  });

  it('should call next when no update', () => {
    // given
    const req = {
      session: {},
      params: { id: 1 },
      user: { id: 1 }
    } as unknown as Request;
    const next = jest.fn();
    const error = new Error("database error");

    (db.run as jest.Mock).mockImplementationOnce((_query, _params, callback) => {
      callback(error);
    });

    // when
    updateAssetById(req, res, next);

    // then
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});

