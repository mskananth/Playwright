require("dotenv").config();

const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginOTP");

test.describe("Login", () => {
  let loginPage;

  test("Valid Registered Email", async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
    await expect(loginPage.sendOtpBtn).toBeEnabled();
    await loginPage.login(process.env.EMAIL);
    await expect(page).toHaveTitle("LexiZ Lawyers");
  });
});
