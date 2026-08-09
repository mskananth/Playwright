const { expect } = require("@playwright/test");

class LoginModule {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[placeholder="Enter Email Address"]');
    this.passwordInput = page.locator('input[placeholder="Enter Password"]');
    this.usePasswordLink = page.getByRole("link", {
      name: "Use Password Instead",
    });
    this.useOTPLink = page
      .getByRole("link", { name: "Use OTP Instead" })
      .first();
    this.continueButton = page.getByRole("button", { name: "Send OTP" });
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async navigate() {
    await this.page.goto("https://staging.lauditor.com/login", {
      waitUntil: "networkidle",
    });
  }

  async clickUsePasswordInstead() {
    await this.usePasswordLink.click();
  }

  async clickUseOTPInstead() {
    if ((await this.useOTPLink.count()) === 0) return;
    await this.useOTPLink.click();
  }

  async login(email, password) {
    const e = (email || "").toString().trim();
    const p = (password || "").toString().trim();
    await this.emailInput.fill(e);
    await this.passwordInput.fill(p);

    // wait for the login button to be visible/enabled, else try pressing Enter
    if ((await this.loginButton.count()) > 0) {
      try {
        await this.loginButton.waitFor({ state: "visible", timeout: 5000 });
        // sometimes button is visible but disabled until blur; ensure enabled
        await this.page.waitForTimeout(300);
        await Promise.all([
          this.loginButton.click(),
          this.page.waitForLoadState("networkidle").catch(() => {}),
        ]);
      } catch (err) {
        // fallback: press Enter on password field
        await this.passwordInput.press("Enter");
        await this.page.waitForLoadState("networkidle").catch(() => {});
      }
    } else {
      // no explicit login button found; press Enter
      await this.passwordInput.press("Enter");
      await this.page.waitForLoadState("networkidle").catch(() => {});
    }
  }

  async loginWithPassword(email, password) {
    await this.navigate();
    await this.clickUsePasswordInstead();
    await this.login(email, password);
  }

  async loginWithFallback(email, password) {
    await this.navigate();
    await this.clickUsePasswordInstead();
    await this.login(email, password);

    const invalidMsg = this.page.locator(
      /invalid email|invalid password|invalid email\/password/i,
    );
    if ((await invalidMsg.count()) > 0) {
      const { getOTP } = require("../utils/emailHelper");
      const { extractOTP } = require("../utils/otpExtractor");
      const OTPPage = require("./OTPPage");

      await this.clickUseOTPInstead();
      await this.emailInput.fill(email);
      await this.continueButton.click();

      const emailContent = await getOTP();
      const otp = extractOTP(emailContent);
      const otpPage = new OTPPage(this.page);
      await otpPage.enterOTP(otp);
      await otpPage.clickVerify();
      await this.page.waitForLoadState("networkidle");
    }
  }

  async assertTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}

module.exports = LoginModule;
