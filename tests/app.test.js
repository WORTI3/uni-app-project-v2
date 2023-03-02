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