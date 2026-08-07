const { test, expect } = require("@playwright/test");

test("My First Test", async function ({ page }) {
  expect(12).toBe(12);
});

test.skip("My Second Test", async function ({ page }) {
  expect(100).toBe(102);
});

test("My Third Test", async function ({ page }) {
  expect(3.0).toBe(3.0);
});
test("My Fourth Test", async function ({ page }) {
  expect("Anantha kumar").toContain("Ananth");
  expect(true).toBeTruthy();
});
test("My Fifth Test", async function ({ page }) {
  expect(false).toBeFalsy();
});

test("My Sixth Test", async function ({ page }) {
  expect("Anantha kumar".includes("kumar")).toBeTruthy();
});
