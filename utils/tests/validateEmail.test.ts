import { validateEmail } from "..";

describe("validateEmail()", () => {
  it("returns true for common valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("john.doe@company.net")).toBe(true);
    expect(validateEmail("jane_doe@startup.io")).toBe(true);
    expect(validateEmail("team@organization.org")).toBe(true);
  });

  it("returns true for valid modern domain types", () => {
    expect(validateEmail("contact@university.ca")).toBe(true);
    expect(validateEmail("info@nonprofit.global")).toBe(true);
    expect(validateEmail("support@developer.tech")).toBe(true);
    expect(validateEmail("help@company.solutions")).toBe(true);
  });

  it("returns false for incomplete or invalid addresses", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("plainaddress")).toBe(false);
    expect(validateEmail("missingatsymbol.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@domain.")).toBe(false);
    expect(validateEmail("user@domain..com")).toBe(false);
  });

  it("trims whitespace and still validates correctly", () => {
    expect(validateEmail("   user@example.com   ")).toBe(true);
    expect(validateEmail("   invalid@domain ")).toBe(true);
  });

  it("returns false for clearly malformed emails", () => {
    expect(validateEmail("user@@example.com")).toBe(false);
    expect(validateEmail("user@ example.com")).toBe(false);
    expect(validateEmail("user@.example.com")).toBe(false);
  });
});
