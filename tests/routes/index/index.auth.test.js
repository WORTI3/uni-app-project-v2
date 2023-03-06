const request = require("supertest");
const cheerio = require('cheerio');
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const app = require("../../../src/app");
const { fetchAssetsForAdmin, fetchAssets, fetchAssetById, updateAssetById, updateLocalAsset } = require("../../../src/middleware/asset");

jest.mock('connect-ensure-login', () => ({
  ensureLoggedIn: jest.fn(() => (req, res, next) => next()),
}));

jest.mock('../../../src/middleware/asset', () => ({
  fetchAssetsForAdmin: jest.fn(),
  fetchAssets: jest.fn(),
  fetchAssetById: jest.fn(),
  updateAssetById: jest.fn(),
  updateLocalAsset: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /all/closed', () => {
  it('should return 200 status, match snapshot and load content correctly', async () => {
    const assets = [
      { id: 1, name: 'Asset 1' },
      { id: 2, name: 'Asset 2' },
      { id: 3, name: 'Asset 3', closed: 1 }
    ];
    const user = { id: 1, name: 'John Doe' };

    ensureLoggedIn.mockImplementation((req, res, next) => next());
    fetchAssetsForAdmin.mockImplementation((req, res, next) => next());
    fetchAssets.mockImplementation((req, res, next) => {
      res.locals.assets = assets;
      res.locals.closedCount = 1;
      next();
    });

    const result = await request(app).get('/all/closed').expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
    const $ = cheerio.load(result.text);
    const heading = $('h1').text();
    expect(heading).toBe('Closed Tickets (1)');
    expect($('a').length).toBe(3);
  });
});

describe('GET /all', () => {
  it('should return 200 status, match snapshot and load content correctly', async () => {
    const assets = [
      { id: 1, name: 'Asset 1' },
      { id: 2, name: 'Asset 2' },
      { id: 3, name: 'Asset 3', closed: 1 }
    ];
    const user = { id: 1, name: 'John Doe' };

    ensureLoggedIn.mockImplementation((req, res, next) => next());
    fetchAssetsForAdmin.mockImplementation((req, res, next) => next());
    fetchAssets.mockImplementation((req, res, next) => {
      res.locals.assets = assets;
      res.locals.openCount = 2;
      next();
    });

    const result = await request(app).get('/all').expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
    const $ = cheerio.load(result.text);
    const heading = $('h1').text();
    expect(heading).toBe('Your open tickets (2)');
    expect($('a').length).toBe(3);
  });
});

describe("GET /add", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/add").expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/add").expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h1').text();
    expect(heading).toBe('Raise a new ticket');
    expect($('a').length).toBe(3);
  });
});

describe("GET /settings", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/settings").expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/settings").expect(200);

    const $ = cheerio.load(result.text);
    expect($('p').length).toBe(4);
    expect($('a').length).toBe(5);
  });
});

describe("GET /1/edit", () => {
  const id = 1;
  const url = '/' + id + '/edit';
  fetchAssetById.mockImplementation((req, res, next) => {
    res.locals.asset = { id: 1, name: "test asset" };
    next();
  });
  updateLocalAsset.mockImplementation((req, res, next) => next());
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get(url).expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render edit content with correct ID", async () => {
    const result = await request(app).get(url).expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h1').text();
    expect(heading).toBe('Editing asset: #' + id);
    expect($('a').length).toBe(3);
  });
});

describe("GET /1/view", () => {
  const id = 1;
  const url = '/' + id + '/view';
  updateAssetById.mockImplementation((req, res, next) => next());
  fetchAssetById.mockImplementation((req, res, next) => {
    res.locals.asset = { id: 1, name: "test asset" };
    next();
  });
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get(url).expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render view content with correct ID", async () => {
    const result = await request(app).get(url).expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h1').text();
    expect(heading).toBe('Viewing asset: #' + id);
    expect($('a').length).toBe(3);
  });
});
