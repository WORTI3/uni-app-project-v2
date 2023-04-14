const app = require("../src/app");
const http = require("http");
const server = require("../src/server");

// Mock app module
jest.mock('../src/app', () => {
  return {
    set: jest.fn()
  };
});

// Mock http module
jest.mock('http', () => {
  return {
    createServer: jest.fn(() => {
      return {
        listen: jest.fn(),
        on: jest.fn()
      };
    })
  };
});

describe("server startup", () => {
  it("should set the app port to 4000", () => {
    expect(app.set).toHaveBeenCalledWith("port", 4000);
  });

  it("should create a new http server", () => {
    expect(http.createServer).toHaveBeenCalledWith(app);
  });

  it("should listen on the specified port", () => {
    expect(server.listen).toHaveBeenCalledWith(4000);
  });

  it("should call on twice for both listeners", () => {
    expect(server.on).toBeCalledTimes(2);
  });
});
