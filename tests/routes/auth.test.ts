import request from "supertest";
import cheerio from "cheerio";
import app from "../../src/app";

describe("GET /signup", () => {
  it("should return 200 status code match snapshot", async () => {
    // given / when
    const result = await request(app).get("/signup").expect(200);
    
    // then
    expect(result.get("Content-Type")).toContain("text/html");
    // Remove CSRF token from the response text for snapshot matching
    const resultTextNoCSRF = result.text.replace(/<input type="hidden" name="_csrf" value=".*">/g, '');
    expect(resultTextNoCSRF).toMatchSnapshot();
  });

  it("should render add content", async () => {
    // given / when
    const result = await request(app).get("/signup").expect(200);

    // then
    const $ = cheerio.load(result.text);
    const para = $("p").text();
    expect(para).toBe("Already have an account? Sign inPassword must be at least 5 characters containing 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character");
    expect($("a").length).toBe(4);
  });
});

describe("GET /login", () => {
  it("should return 200 status code match snapshot", async () => {
    // given / when
    const result = await request(app).get("/login").expect(200);

    // then
    expect(result.get("Content-Type")).toContain("text/html");
    const resultTextNoCSRF = result.text.replace(/<input type="hidden" name="_csrf" value=".*">/g, '');
    expect(resultTextNoCSRF).toMatchSnapshot();
  });

  it("should render add content", async () => {
    // given / when
    const result = await request(app).get("/login").expect(200);

    // then
    const $ = cheerio.load(result.text);
    const para = $("p").text();
    expect(para).toBe("Don't have an account? Sign Up");
    expect($("a").length).toBe(4);
  });
});
