require("dotenv").config();

const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginPage");
const OTPPage = require("../Pages/OTPPage");
const { getOTP } = require("../utils/emailHelper");
const { extractOTP } = require("../utils/otpExtractor");

test.describe("Login flow", () => {
  test("Email OTP Login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const otpPage = new OTPPage(page);

    await loginPage.navigate();
    await loginPage.enterEmail();
    await loginPage.clickContinue();

    const emailContent = await getOTP();
    const otp = extractOTP(emailContent);

    await otpPage.enterOTP(otp);
    await otpPage.clickVerify();

    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle("LexiZ Lawyers");
  });
});
