const {
  PASSWORD_REGEX,
  EDIT_UPDATES,
  ASSET_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} = require("../../src/assets/constants");

describe("Regex string password tests", () => {
  // Length is handled by express validator.
  const validPasswords = [
    "aA1#", // Min: 1 lower, 1 upper, 1 number, 1 special char
    "#aA1", // Min: diff order
    "abcdE-solid-3arth", // Mixed longer password
    "abD2$$$$$$",
    "abC!d3$",
  ];
  test.each(validPasswords)(
    "Password: %s should be accepted as valid",
    (password) => {
      expect(PASSWORD_REGEX.test(password)).toBe(true);
    }
  );

  const invalidPasswords = [
    "", // empty password
    "aa#1", // missing uppercase
    "AA#1", // missing lowercase
    "aA#", // missing number
    "aA1", // missing special character
    "#123456", // missing uppercase & lowercase char
    "#abcde", // missing number & uppercase
    "#ABCDE", // missing number & lowercase
    "aAbBcC", // missing number & special char
    "password", // only lower
    "PASSWORD", // only upper
    "password123", // common password with numbers
    "password!@#", // common password with special characters
    "passwordpasswordpasswordpassword", // too long
    "p@ssw0rd", // too short
    "p@ssw0rd!", // no uppercase letter
    "P@SSW0RD!", // no lowercase letter
    "p@ssword1", // no special character
    "P@SSWORD1", // no special character or lowercase letter
    "p@ssw0rd", // no uppercase letter
    "p@ssword1", // no uppercase letter or uppercase letter
    "P@SSW0RD", // no lowercase letter or number
    "p@ssword", // no uppercase letter or number
    "😀😁😂😃😄😅😆", // emoji-only password
    "🔑🎉👻💩🐶🐱", // emoji-only password with non-alphanumeric characters
    "pa$$word!", // contains a dollar sign
    "p@ssw0rd#", // contains a hash symbol
    "p@ssw0rd*", // contains an asterisk
    "p@ssw0rd&", // contains an ampersand
    "p@ssw0rd%", // contains a percent sign
    "p@ssw0rd=", // contains an equals sign
    "p@ssw0rd+", // contains a plus sign
    "p@ssw0rd~", // contains a tilde
    "p@ssw0rd|", // contains a vertical bar
    "p@ssw0rd/", // contains a forward slash
    "p@ssw0rd\\", // contains a backslash
  ];

  test.each(invalidPasswords)(
    "Password: %s should be rejected as invalid",
    (password) => {
      expect(PASSWORD_REGEX.test(password)).toBe(false);
    }
  );
});

describe("EDIT_UPDATES object", () => {
  test("UPDATE constant should equal 'update'", () => {
    expect(EDIT_UPDATES.UPDATE).toEqual("update");
  });

  test("CLOSE constant should equal 'close'", () => {
    expect(EDIT_UPDATES.CLOSE).toEqual("close");
  });

  test("DELETE constant should equal 'delete'", () => {
    expect(EDIT_UPDATES.DELETE).toEqual("delete");
  });
});

describe("ASSET_STATUS object", () => {
  test("ASSET_STATUS.OPEN should equal 'open'", () => {
    expect(ASSET_STATUS.OPEN).toEqual("open");
  });

  test("ASSET_STATUS.CLOSED should equal 'closed'", () => {
    expect(ASSET_STATUS.CLOSED).toEqual("closed");
  });
});

describe("SUCCESS_MESSAGES", () => {
  test("has a DEFAULT success message", () => {
    expect(SUCCESS_MESSAGES.DEFAULT).toBe("You have updated this ticket");
  });

  test("has a CLOSED success message", () => {
    expect(SUCCESS_MESSAGES.CLOSED).toBe("You have closed this ticket");
  });

  test("has a DELETED success message", () => {
    expect(SUCCESS_MESSAGES.DELETED).toBe(
      "You have permanently deleted a ticket"
    );
  });
});

describe("ERROR_MESSAGES", () => {
  test("DEFAULT error message should be defined and have correct value", () => {
    expect(ERROR_MESSAGES.DEFAULT).toBeDefined();
    expect(ERROR_MESSAGES.DEFAULT).toBe("Incorrect username or password.");
  });

  describe("USERNAME", () => {
    test("DEFAULT error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.USERNAME.DEFAULT).toBeDefined();
      expect(ERROR_MESSAGES.USERNAME.DEFAULT).toBe("Invalid username");
    });

    test("MIN_LENGTH error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.USERNAME.MIN_LENGTH).toBeDefined();
      expect(ERROR_MESSAGES.USERNAME.MIN_LENGTH).toBe(
        "Username must be more than 3 characters in length"
      );
    });

    test("MAX_LENGTH error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.USERNAME.MAX_LENGTH).toBeDefined();
      expect(ERROR_MESSAGES.USERNAME.MAX_LENGTH).toBe(
        "Username must be less than 20 characters in length"
      );
    });
  });

  describe("PASSWORD", () => {
    test("DEFAULT error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.PASSWORD.DEFAULT).toBeDefined();
      expect(ERROR_MESSAGES.PASSWORD.DEFAULT).toBe("Invalid password");
    });

    test("MIN_LENGTH error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.PASSWORD.MIN_LENGTH).toBeDefined();
      expect(ERROR_MESSAGES.PASSWORD.MIN_LENGTH).toBe(
        "Password must be more than 5 characters in length"
      );
    });

    test("MAX_LENGTH error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.PASSWORD.MAX_LENGTH).toBeDefined();
      expect(ERROR_MESSAGES.PASSWORD.MAX_LENGTH).toBe(
        "Password must be less than 20 characters in length"
      );
    });

    test("NO_CHARS error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.PASSWORD.NO_CHARS).toBeDefined();
      expect(ERROR_MESSAGES.PASSWORD.NO_CHARS).toBe(
        "Password must contain a special character, number and upper & lower case letter"
      );
    });
  });

  describe("ADD_ISSUE", () => {
    test("NAME error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.ADD_ISSUE.NAME).toBeDefined();
      expect(ERROR_MESSAGES.ADD_ISSUE.NAME).toBe(
        "Please enter a valid item name"
      );
    });

    test("CODE error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.ADD_ISSUE.CODE).toBeDefined();
      expect(ERROR_MESSAGES.ADD_ISSUE.CODE).toBe(
        "The asset code must be 6 characters in length"
      );
    });

    test("NOTE error message should be defined and have correct value", () => {
      expect(ERROR_MESSAGES.ADD_ISSUE.NOTE).toBeDefined();
      expect(ERROR_MESSAGES.ADD_ISSUE.NOTE).toBe(
        "A note must be more than 3 and 200 characters"
      );
    });
  });

  test("NO_PERMISSION error message should be defined and have correct value", () => {
    expect(ERROR_MESSAGES.NO_PERMISSION).toBeDefined();
    expect(ERROR_MESSAGES.NO_PERMISSION).toBe(
      "You must be an admin to do this"
    );
  });
});
