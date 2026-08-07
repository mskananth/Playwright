const { expect } = require("@playwright/test");

class OTPPage {
  constructor(page) {
    this.page = page;

    this.otpBoxes = page.locator(".lx-otp-box");
    this.verifyButton = page.getByRole("button", {
      name: "Verify OTP",
    });
  }

  async enterOTP(otp) {
    await this.otpBoxes.first().waitFor({ state: "visible" });

    await this.otpBoxes.first().click();

    await this.page.keyboard.type(otp, { delay: 100 });
  }

  async clickVerify() {
    await this.verifyButton.click();
  }
}

module.exports = OTPPage;
