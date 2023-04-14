const request = require("supertest");
const cheerio = require("cheerio");
const app = require("../src/app");
const pluralize = require("pluralize");

describe("Nunjucks configuration", () => {
  it("should set the view engine to 'njk'", () => {
    expect(app.get("view engine")).toBe("njk");
  });
});

describe("handle 404 errors", () => {
  it("should render error template with status 404 for not found error", async () => {
    const result = await request(app).get("/invalid_route").expect(404);
    const $ = cheerio.load(result.text);
    const heading = $("h1").text();

    expect(heading).toBe("Not Found");
  });
});

describe("unit tests for app.js routers", () => {
  // '/' for home is the same as this test
  test("GET / should return 200", async () => {
    await request(app).get("/").expect(200);
  });

  test("GET /login should return 200", async () => {
    await request(app).get("/login").expect(200);
  });

  test("GET /non-existent-route should return 404", async () => {
    await request(app).get("/non-existent-route").expect(404);
  });
});

describe('app.locals', () => {
  test('should have property pluralize that equals the required package', () => {
    expect(app.locals.pluralize).toEqual(pluralize);
  });
});