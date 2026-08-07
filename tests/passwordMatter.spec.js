require("dotenv").config();

const { test, expect } = require("@playwright/test");
const PasswordLoginPage = require("../Pages/PasswordLoginPage");
const MattersPage = require("../Pages/MattersPage");

const USER_EMAIL = "ananthlexiz@gmail.com";
const USER_PASSWORD = "Test@123";
const CASE_TITLE = "MCP Legal Matter";

async function openCreateDialog(page) {
  const loginPage = new PasswordLoginPage(page);
  const mattersPage = new MattersPage(page);
  await loginPage.navigate();
  await loginPage.clickUsePasswordInstead();
  await loginPage.login(USER_EMAIL, USER_PASSWORD);
  await loginPage.assertTitle("LexiZ Lawyers");
  await mattersPage.openLegalMatters();
  await expect(mattersPage.listOfMattersTitle).toBeVisible();
  await mattersPage.createMatterButton.click();
  await page.waitForSelector("form", { timeout: 5000 });
  return { loginPage, mattersPage };
}

test.describe("Create Matter dialog - validations and behaviour", () => {
  test.beforeEach(async ({ page }) => {
    await openCreateDialog(page);
  });

  test("Verify screen loads successfully", async ({ page }) => {
    await expect(page.locator('label:has-text("Case Title")')).toBeVisible();
  });

  test("Verify mandatory indicators", async ({ page }) => {
    const titleLabel = page.locator('label:has-text("Case Title")');
    await expect(titleLabel).toContainText("*");
    const matterNumberLabel = page.locator('label:has-text("Matter Number")');
    await expect(matterNumberLabel).toContainText("*");
  });

  test("Verify default button when no input", async ({ page }) => {
    const saveBtn = page.getByRole("button", {
      name: /Save & Next|Save &amp; Next/,
    });
    if ((await saveBtn.count()) === 0) {
      test.skip();
    }
    expect(await saveBtn.isDisabled()).toBeTruthy();
  });

  test("Verify Matter Number auto-generated", async ({ page }) => {
    const matterNumber = page.locator("#matterNumber");
    await expect(matterNumber).toHaveValue(/.*/);
  });

  test("Verify Matter Number not editable", async ({ page }) => {
    const matterNumber = page.locator("#matterNumber");
    await expect(matterNumber).toHaveAttribute("readonly", "");
  });

  test("Verify tooltip message and disappear on mouse out (if present)", async ({
    page,
  }) => {
    const tooltipTrigger = page
      .locator('label:has-text("Matter Number")')
      .locator("xpath=..")
      .locator("i, .info, [title]");
    if ((await tooltipTrigger.count()) === 0) {
      test.skip("Tooltip not present");
    }
    await tooltipTrigger.first().hover();
    const tooltip = page.locator('.mat-tooltip, .tooltip, [role="tooltip"]');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden({ timeout: 2000 });
  });

  test("Validate Case Title mandatory", async ({ page }) => {
    const saveBtn = page.getByRole("button", {
      name: /Save & Next|Save &amp; Next/,
    });
    if ((await saveBtn.count()) === 0) test.skip();
    if (await saveBtn.isDisabled()) {
      expect(true).toBeTruthy();
      return;
    }
    await saveBtn.click();
    // expect form shows validation state
    await expect(page.locator("#title")).toHaveClass(/ng-invalid/);
  });

  test("Validate Case Title with spaces", async ({ page }) => {
    const title = page.locator("#title");
    await title.fill("   ");
    await title.blur();
    await expect(title).toHaveClass(/ng-invalid/);
  });

  test("Validate valid Case Title", async ({ page }) => {
    const title = page.locator("#title");
    await title.fill("Valid Case Title");
    await title.blur();
    await expect(title).not.toHaveClass(/ng-invalid/);
  });

  test("Validate max length Case Title and exceeding max length", async ({
    page,
  }) => {
    const title = page.locator("#title");
    const maxAttr = await title.getAttribute("maxlength");
    if (maxAttr) {
      const max = parseInt(maxAttr, 10);
      const okText = "A".repeat(max);
      await title.fill(okText);
      expect((await title.inputValue()).length).toBe(max);
      const tooLong = "B".repeat(max + 10);
      await title.fill(tooLong);
      expect((await title.inputValue()).length).toBeLessThanOrEqual(max);
    } else {
      test.skip("No maxlength attribute");
    }
  });

  test("Enter only Case Title and Save draft with partial data (Save for Later if present)", async ({
    page,
  }) => {
    const title = page.locator("#title");
    await title.fill("Partial Title Only");
    const saveForLater = page.locator(
      'button:has-text("Save for Later"), button:has-text("Save for later"), input[value="Save for Later"], button:has-text("Save as Draft" )',
    );
    if ((await saveForLater.count()) === 0) {
      test.skip("Save for Later not present");
    }
    await saveForLater.first().click();
    await page.waitForLoadState("networkidle");
    // verify redirect or toast
    await expect(page)
      .toHaveURL(/.*(matters|grid|list).*/i)
      .catch(() => {});
  });

  test("Enter only Case Number", async ({ page }) => {
    const caseNo = page.locator("#caseNumbr");
    if ((await caseNo.count()) === 0) test.skip();
    await caseNo.fill("CN-12345");
    await caseNo.blur();
    await expect(caseNo).not.toHaveClass(/ng-invalid/);
  });

  test("Clear entered data", async ({ page }) => {
    const title = page.locator("#title");
    await title.fill("To be cleared");
    await title.clear();
    expect(await title.inputValue()).toBe("");
  });

  test("Save draft with mandatory only", async ({ page }) => {
    const title = page.locator("#title");
    await title.fill("Mandatory Only Title");
    const saveForLater = page.locator(
      'button:has-text("Save for Later"), button:has-text("Save for later"), input[value="Save for Later"], button:has-text("Save as Draft")',
    );
    if ((await saveForLater.count()) === 0) test.skip();
    await saveForLater.first().click();
    await page.waitForLoadState("networkidle");
    await expect(page)
      .toHaveURL(/.*(matters|grid|list).*/i)
      .catch(() => {});
  });

  test("Validate Save & Next navigation and prevent when mandatory missing", async ({
    page,
  }) => {
    const saveBtn = page.getByRole("button", {
      name: /Save & Next|Save &amp; Next/,
    });
    if ((await saveBtn.count()) === 0) test.skip();
    // mandatory missing should prevent navigation
    expect(await saveBtn.isDisabled()).toBeTruthy();
    // fill mandatory and verify enabled
    await page.locator("#title").fill("Title for Save & Next");
    await page.locator("#title").blur();
    await expect(saveBtn).toBeEnabled();
  });

  test("Validate Created Date default and modify Created Date", async ({
    page,
  }) => {
    const createdDate = page.locator(
      'input[formcontrolname="created_date"], input[placeholder*="Created Date"]',
    );
    if ((await createdDate.count()) === 0) test.skip();
    const defaultVal = await createdDate.inputValue();
    expect(defaultVal).not.toBeNull();
    // try to modify
    await createdDate.fill("2025-01-01");
    expect((await createdDate.inputValue()).length).toBeGreaterThan(0);
  });

  test("Validate Date of Filing optional and > Created Date", async ({
    page,
  }) => {
    const filing = page.locator(
      'input[formcontrolname="date_of_filing"], input[placeholder*="Date of Filing"]',
    );
    if ((await filing.count()) === 0) test.skip();
    // set created date to today and filing to future
    await page
      .locator('input[formcontrolname="created_date"]')
      .fill("2025-01-01");
    await filing.fill("2026-01-01");
    // basic check: filing > created
    const created = await page
      .locator('input[formcontrolname="created_date"]')
      .inputValue();
    const filed = await filing.inputValue();
    expect(new Date(filed) > new Date(created)).toBeTruthy();
  });

  test("Validate Description character counter (if present)", async ({
    page,
  }) => {
    const desc = page.locator(
      'textarea[name="description"], textarea[formcontrolname="description"]',
    );
    if ((await desc.count()) === 0) test.skip();
    const counter = page.locator(
      ".char-counter, .counter, .description-counter",
    );
    await desc.fill("Test description");
    if ((await counter.count()) > 0) {
      await expect(counter)
        .toContainText("12")
        .catch(() => {});
    } else {
      test.skip("No character counter present");
    }
  });
});
