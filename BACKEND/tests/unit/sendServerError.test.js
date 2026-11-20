const sendServerError = require("../../src/utils/sendServerError");

describe("sendServerError", () => {
  let response;
  let consoleError;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  test("logs the error and returns the established 500 response", () => {
    const error = new Error("database down");

    sendServerError(response, error, "Request failed");

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: "Request failed",
      glosa: "database down",
    });
  });

  test("uses the error string when no message is available", () => {
    sendServerError(response, { toString: () => "unknown error" }, "Request failed");

    expect(response.json).toHaveBeenCalledWith({
      error: "Request failed",
      glosa: "unknown error",
    });
  });
});
