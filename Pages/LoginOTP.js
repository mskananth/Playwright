const BasePage = require("../Pages/BasePage");
const { getOTP } = require("../utils/emailHelper");
const { extractOTP } = require("../utils/otpExtractor");

class LoginOTP extends BasePage {
  constructor(page) {
    super(page);

    this.logo = page.locator("img.lx-logo");
    this.emailInput = page.locator("#id_otp_identifier");
    this.sendOtpBtn = page.getByRole("button", { name: "Send OTP" });
    this.verifyOtpBtn = page.getByRole("button", { name: "Verify OTP" });

    this.otpBoxesContainer = page.locator("div.lx-otp-boxes");
    this.otpInputs = page.locator(".lx-otp-box");

    this.requiredError = page.getByText("Email or Mobile is required");
    this.invalidFormatError = page.getByText(
      "Enter a valid email or 10-digit mobile number",
    );
    this.userNotFoundError = page.getByText("User not found");
    this.otpSentMessage = page.getByText("OTP sent to your email");
    this.verifyOtpHeading = page.getByText("Verify OTP");
    this.enterOtpHint = page.getByText("Enter 6-digit OTP");

    this.registerHereLink = page.getByText("Register Here");
  }

  async open(url = process.env.BASE_URL) {
    await this.goto(url);
  }

  async enterIdentifier(value) {
    await this.emailInput.fill(value);
  }

  async clickSendOtp() {
    await this.sendOtpBtn.click();
  }

  async requestOtp(identifier) {
    await this.enterIdentifier(identifier);
    await this.clickSendOtp();
  }

  async waitForOtpBoxesHidden(timeout = 30000) {
    await this.otpBoxesContainer.waitFor({ state: "hidden", timeout });
  }

  async enterOtp(otp) {
    for (let i = 0; i < otp.length; i++) {
      await this.otpInputs.nth(i).click();
      await this.otpInputs.nth(i).pressSequentially(otp[i]);
    }
  }

  async clickVerifyOtp() {
    await this.verifyOtpBtn.click();
  }

  async login(email) {
    await this.requestOtp(email);
    await this.waitForOtpBoxesHidden();

    const emailText = await getOTP();
    const otp = extractOTP(emailText);

    if (!otp) {
      throw new Error("OTP not found in email.");
    }

    await this.enterOtp(otp);
    await this.clickVerifyOtp();
    await this.waitForNetworkIdle();

    return otp;
  }
}

module.exports = LoginOTP;
