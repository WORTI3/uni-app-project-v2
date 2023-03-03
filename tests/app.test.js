const request = require("supertest");
const app = require("../src/app");

describe("Nunjucks configuration", () => {
  it("should set the view engine to 'njk'", () => {
    expect(app.get("view engine")).toBe("njk");
  });
});

describe('handle 404 errors', () => {
  it('should render error template with status 404 for not found error', async () => {
    const err = new Error('Not Found');
    err.status = 404;

    const response = await request(app).get('/invalid_route');

    expect(response.status).toBe(404);
    expect(response.text).toContain('<h1>Not Found</h1>');
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
