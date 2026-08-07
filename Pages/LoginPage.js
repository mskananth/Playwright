const { expect } = require("@playwright/test");

class LoginPage {
  constructor(page) {
    this.page = page;

    // Email textbox
    this.emailTextbox = page.locator("#id_otp_identifier");

    // Continue/Login button
    this.continueButton = page.getByRole("button", { name: "Send OTP" }); //page.locator("#lx-btn");

    // OTP boxes
    this.otpTextbox = page.locator(".lx-otp-box");

    // Verify button
    this.verifyButton = page.getByRole("button", { name: "Verify OTP" });
  }

  async navigate() {
    await this.page.goto(process.env.BASE_URL);
  }

  async enterEmail(email) {
    await this.emailTextbox.fill(email);
  }

  async clickContinue() {
    await this.continueButton.click();
  }
}

module.exports = LoginPage;
