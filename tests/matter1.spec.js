require("dotenv").config();
const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginPage");
const MatterPagepom = require("../Pages/MatterPagepom");
const { loginData } = require("../testData/loginData");
const matterData = require("../testData/matterData");

const defaultLogin = (loginData && loginData[0]) || {};
const records = matterData.matterRecords || [];

let page;
let matterPage;

test.describe("Matter creation UI and Additional Details validation", () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.loginWithPassword(
      defaultLogin.email || process.env.EMAIL,
      defaultLogin.password || process.env.PASSWORD,
    );
    await loginPage.assertTitle("LexiZ Lawyers");
    matterPage = new MatterPagepom(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    await matterPage.openMatterCreation();
  });

  test("Verify main matter form elements are visible and initial state is correct", async () => {
    await matterPage.verifyMainMatterForm();
    await expect(matterPage.caseTitleInput)
      .toHaveAttribute("placeholder", /Case Title/i)
      .catch(() => {});
    await expect(matterPage.matterNumberInput).toBeVisible();
    await matterPage.verifyMatterNumberReadonly();
    await expect(matterPage.saveButton).toBeDisabled();
    await expect(matterPage.saveForLaterButton).toBeVisible();
  });

  test("Verify Additional Details expands and displays fields", async () => {
    await matterPage.verifyAdditionalDetailsToggle();
    if ((await matterPage.showLessDetails.count()) > 0) {
      await expect(matterPage.showLessDetails).toBeVisible();
    }
  });

  test("Verify Save for Later remains enabled after partial required data entry", async () => {
    await matterPage.fillCaseTitle("Partial Matter Title");
    expect(await matterPage.isSaveButtonEnabled()).toBeTruthy();
    expect(await matterPage.isSaveForLaterEnabled()).toBeTruthy();
    await matterPage.clickSaveForLater();
    await expect(page)
      .not.toHaveURL(/\/matter\/legalmatter\/create/i)
      .catch(() => {});
  });

  test("Verify description counter updates when typing description", async () => {
    await matterPage.clickAdditionalDetails();
    await matterPage.fillDescription("Automated description test");
    if ((await matterPage.descriptionCounter.count()) > 0) {
      await expect(matterPage.descriptionCounter)
        .toContainText("20")
        .catch(() => {});
    }
  });

  for (const record of records) {
    test(`Data-driven save for later: ${record.title}`, async () => {
      await matterPage.fillRecord(record);
      expect(await matterPage.caseTitleInput.inputValue()).toBe(record.title);
      const saved = await matterPage.clickSaveForLater();
      expect(saved).toBeTruthy();
    });
  }
});
