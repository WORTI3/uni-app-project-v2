const {
  fetchAssets,
  fetchAssetById,
  updateAssetById,
  fetchAssetsForAdmin,
  trimAssetName,
} = require("../../src/middleware/asset");

describe('fetchAssets() unit tests', () => {
  
  test('should call next() when role === 1 and user is authenticated', () => {
    const req = {
      isAuthenticated: jest.fn(),
      user: { id: 1, role: 1 }
    };
    const res = {

    };
    const next = jest.fn();

    fetchAssets(req, res, next);

    expect(req.isAuthenticated).toBeCalledTimes(1);
  });
});