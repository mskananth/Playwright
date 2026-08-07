const { expect } = require("@playwright/test");

class MattersPage {
  constructor(page) {
    this.page = page;
    this.mattersMenu = page.locator('a[aria-label="Matters"]');
    this.legalMattersLink = page.locator('a:has-text("Legal Matters")');
    this.createMatterButton = page.getByRole("button", {
      name: "Create Matter",
    });
    this.caseTitleInput = page.locator("#title");
    this.saveAndNextButton = page.getByRole("button", { name: "Save & Next" });
    this.listOfMattersTitle = page.locator("h2.page-title", {
      hasText: "List of Matters",
    });
    this.createdMatter = page.locator("text=MCP Legal Matter");
  }

  async openLegalMatters() {
    await this.mattersMenu.click();
    await this.legalMattersLink.click();
    await this.page.waitForLoadState("networkidle");
  }

  async createMatter(caseTitle) {
    await this.createMatterButton.click();
    await this.caseTitleInput.fill(caseTitle);
    await Promise.all([
      this.saveAndNextButton.click(),
      this.page.waitForLoadState("networkidle"),
    ]);
  }

  async verifyMatterVisible(caseTitle) {
    await expect(this.page.locator(`text=${caseTitle}`)).toBeVisible();
  }
}

module.exports = MattersPage;
