const request = require("supertest");
const cheerio = require('cheerio');
const app = require("../../src/app");

describe("GET /signup", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/signup").expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/signup").expect(200);

    const $ = cheerio.load(result.text);
    const para = $('p').text();
    expect(para).toBe("Already have an account? Sign in");
    expect($('a').length).toBe(4);
  });
});

describe("GET /login", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/login").expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/login").expect(200);

    const $ = cheerio.load(result.text);
    const para = $('p').text();
    expect(para).toBe("Don't have an account? Sign Up");
    expect($('a').length).toBe(4);
  });
});