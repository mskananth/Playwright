const { expect } = require("@playwright/test");

class PasswordLoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[placeholder="Enter Email Address"]');
    this.passwordInput = page.locator('input[placeholder="Enter Password"]');
    this.usePasswordLink = page.getByRole("link", {
      name: "Use Password Instead",
    });
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

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.loginButton.click(),
      this.page.waitForLoadState("networkidle"),
    ]);
  }

  async assertTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}

module.exports = PasswordLoginPage;
