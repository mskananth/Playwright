const { test, expect } = require("@playwright/test");

test("Browser Context Playwright test", async ({ browser }) => {
  const context = browser.newContext();
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");
});

test.only("Page Playwright test", async ({ page }) => {
  await page.goto("https://google.com");
  console.log(await page.title());
  expect(await page).toHaveTitle("Google");
});
