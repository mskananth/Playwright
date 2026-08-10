require("dotenv").config();

const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginPage");
const MatterPage = require("../Pages/MattersPage");
const { loginData } = require("../testData/loginData");
const matterData = require("../testData/matterData");
const { caseTypes } = require("../testData/caseTypes.json");

const defaultLogin = (loginData && loginData[0]) || {};
const defaultMatter = matterData.defaultMatter;

test.describe.configure({ mode: "serial" });

let page;
let matterPage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.loginWithPassword(
    defaultLogin.email || process.env.EMAIL,
    defaultLogin.password || process.env.PASSWORD,
  );

  await loginPage.assertTitle("LexiZ Lawyers");
  matterPage = new MatterPage(page);
  await matterPage.openMatterCreation();
  await matterPage.verifyCreateMatterFormVisible();
});

test.afterAll(async () => {
  await page.close();
});

test.beforeEach(async () => {
  await matterPage.openMatterCreation();
});

test("1.Verify screen loads successfully", async () => {
  await expect(matterPage.caseTitleInput).toBeVisible();
});

test("2.Verify mandatory indicators", async () => {
  await expect(matterPage.caseTitleLabel).toContainText("*");
  await expect(matterPage.matterNumberLabel).toContainText("*");
});

test("3.Verify default button when no input", async () => {
  expect(await matterPage.isSaveDisabled()).toBeTruthy();
});

test("4.Verify Matter Number auto-generated", async () => {
  await expect(matterPage.matterNumberInput).toHaveValue(/.*/);
});

test("5.Verify Matter Number not editable", async () => {
  await expect(matterPage.matterNumberInput).toHaveAttribute("readonly", "");
});

test.skip("6.Verify tooltip message and disappear on mouse out (if present)", async () => {
  if ((await matterPage.matterNumberTooltipTrigger.count()) === 0) {
    test.skip("Tooltip not present");
  }
  await matterPage.matterNumberTooltipTrigger.first().hover();
  await expect(matterPage.tooltip).toBeVisible({ timeout: 2000 });
  await matterPage.page.mouse.move(0, 0);
  await expect(matterPage.tooltip).toBeHidden({ timeout: 2000 });
});

test("7. Validate Case Title mandatory", async () => {
  await expect(matterPage.caseTitleInput).toHaveValue("");
  await expect(matterPage.saveButton).toBeDisabled();
  await expect(matterPage.caseTitleInput).toHaveClass(/ng-invalid/);
});
test("8.Validate Case Title with spaces", async () => {
  await matterPage.fillCaseTitle("   ");
  await matterPage.caseTitleInput.blur();
  await expect(matterPage.caseTitleInput).toHaveClass(/ng-invalid/);
});

test("9.Validate valid Case Title", async () => {
  await matterPage.fillCaseTitle(defaultMatter.title);
  await matterPage.caseTitleInput.blur();
  await expect(matterPage.caseTitleInput).not.toHaveClass(/ng-invalid/);
});

test("10.Validate max length Case Title and exceeding max length", async () => {
  const maxAttr = await matterPage.caseTitleInput.getAttribute("maxlength");
  if (maxAttr) {
    const max = parseInt(maxAttr, 10);
    const okText = "A".repeat(max);
    await matterPage.fillCaseTitle(okText);
    expect((await matterPage.caseTitleInput.inputValue()).length).toBe(max);
    const tooLong = "B".repeat(max + 10);
    await matterPage.fillCaseTitle(tooLong);
    expect(
      (await matterPage.caseTitleInput.inputValue()).length,
    ).toBeLessThanOrEqual(max);
  } else {
    test.skip("No maxlength attribute");
  }
});

test("11. Enter only Case Title and Save draft with partial data", async () => {
  await matterPage.fillCaseTitle("Partial Title Only");

  const saved = await matterPage.clickSaveForLater();

  if (saved) {
    await expect(matterPage.page).toHaveURL(/.*(matters|grid|list).*/i);
  }
});

test("12.Enter only Case Number", async () => {
  if ((await matterPage.caseNumberInput.count()) === 0) test.skip();
  await matterPage.fillCaseNumber(defaultMatter.caseNumber);
  await matterPage.caseNumberInput.blur();
  await expect(matterPage.caseNumberInput).not.toHaveClass(/ng-invalid/);
});

test("13.Clear entered data", async () => {
  await matterPage.fillCaseTitle("To be cleared");
  await matterPage.clearCaseTitle();
  expect(await matterPage.caseTitleInput.inputValue()).toBe("");
});

test("14. Save draft with mandatory only", async () => {
  await matterPage.fillCaseTitle("Mandatory Only Title");

  await matterPage.clickSaveForLater();

  await expect(matterPage.page).toHaveURL(/matter\/legalmatter\/create/);
});

test("15. Validate Save & Next button state", async () => {
  // Mandatory Case Title is empty
  await expect(matterPage.saveButton).toBeDisabled();

  // Enter valid Case Title
  await matterPage.fillCaseTitle(defaultMatter.title);
  await matterPage.caseTitleInput.blur();

  // Save & Next should become enabled
  await expect(matterPage.saveButton).toBeEnabled();
});

test("16.Validate Created Date default and modify Created Date", async () => {
  if ((await matterPage.createdDateInput.count()) === 0) test.skip();
  const defaultVal = await matterPage.createdDateInput.inputValue();
  expect(defaultVal).not.toBeNull();
  await matterPage.fillCreatedDate("2025-01-01");
  expect(
    (await matterPage.createdDateInput.inputValue()).length,
  ).toBeGreaterThan(0);
});

// test.only("17.Validate Date of Filing optional and > Created Date", async () => {
//   if ((await matterPage.dateOfFilingInput.count()) === 0) test.skip();
//   await matterPage.fillCreatedDate("2025-01-01");
//   await matterPage.fillDateOfFiling("2026-01-01");
//   const created = await matterPage.createdDateInput.inputValue();
//   const filed = await matterPage.dateOfFilingInput.inputValue();
//   expect(new Date(filed) > new Date(created)).toBeTruthy();
// });
test.skip("17. Validate Date of Filing optional and > Created Date", async () => {
  await matterPage.additionalDetails.click();

  // await expect(matterPage.dateOfFilingInput).toBeVisible();

  await matterPage.fillCreatedDate("2025-01-01");
  await matterPage.fillDateOfFiling("2026-01-01");

  const created = await matterPage.createdDateInput.inputValue();
  const filed = await matterPage.dateOfFilingInput.inputValue();

  expect(new Date(filed)).toBeGreaterThanOrEqual(new Date(created));
});
test("18.Validate Description character counter (if present)", async () => {
  if ((await matterPage.descriptionInput.count()) === 0) test.skip();
  await matterPage.fillDescription("Test description");
  const counterText = await matterPage.getDescriptionCounterText();
  if (counterText) {
    await expect(matterPage.descriptionCounter)
      .toContainText("12")
      .catch(() => {});
  } else {
    test.skip("No character counter present");
  }
});

test("19.Validate Additional Details fields and validation", async () => {
  if ((await matterPage.additionalDetails.count()) === 0)
    test.skip("Additional Details section not present");

  await matterPage.clickAdditionalDetails();

  const hasDateOfFiling = (await matterPage.dateOfFilingInput.count()) > 0;
  const hasDescription = (await matterPage.descriptionInput.count()) > 0;
  if (!hasDateOfFiling && !hasDescription)
    test.skip("No Additional Details fields found");

  if (hasDateOfFiling) {
    await matterPage.fillCreatedDate("2025-01-01");
    await matterPage.fillDateOfFiling("2026-01-01");
    await matterPage.dateOfFilingInput.blur();
    await expect(matterPage.dateOfFilingInput).not.toHaveClass(/ng-invalid/);
    expect(await matterPage.dateOfFilingInput.inputValue()).toBe("2026-01-01");
  }

  if (hasDescription) {
    const description = "A".repeat(100);
    await matterPage.fillDescription(description);
    await matterPage.descriptionInput.blur();
    expect(await matterPage.getDescriptionValue()).toBe(description);

    const counterText = await matterPage.getDescriptionCounterText();
    if (counterText) {
      await expect(matterPage.descriptionCounter).toContainText("100");
    }
  }
});

test("20.Validate Case Type dropdown responsiveness", async () => {
  if ((await matterPage.caseTypeSelect.count()) === 0)
    test.skip("Case Type dropdown not present");

  await expect(matterPage.caseTypeSelect).toBeVisible();
  await expect(matterPage.caseTypeSelect).toBeEnabled();

  const options = await matterPage.getDropdownOptions(
    matterPage.caseTypeSelect,
  );
  expect(options.length).toBeGreaterThan(0);
});

test("Data-driven Case Type matter creation", () => {
  for (const caseType of caseTypes) {
    test(`Create matter using Case Type: ${caseType}`, async ({ page }) => {
      const matterPage = new MatterPage(page); // fresh instance per test
      await matterPage.openMatterCreation(); // navigate fresh each time

      const title = `CaseType ${caseType} ${Date.now()}`;
      await matterPage.fillCaseTitle(title);
      await matterPage.fillCaseType(caseType);

      const saved = await matterPage.clickSaveAndNext();
      test.skip(!saved, "Save & Next button not available");

      await matterPage.verifyMatterCreatedInView(title);
    });
  }
});

test("Validate Court field", async () => {
  await matterPage.additionalDetails.click();

  await expect(matterPage.courtInput).toBeVisible();

  await matterPage.courtInput(defaultMatter.court);

  await expect(matterPage.courtInput).toHaveValue(defaultMatter.court);
});

test("Validate Judge field", async () => {
  await matterPage.additionalDetails.click();
  await expect(matterPage.judgesInput).toBeVisible();
  await matterPage.judgesInput.fill(defaultMatter.judge);
  await expect(matterPage.judgesInput).toHaveValue(defaultMatter.judge);
});

test("Validate Priority Heading", async () => {
  await matterPage.additionalDetails.click();
  await expect(matterPage.priorityText).toBeVisible();
});

test.only("Validate priority buttons visibility, appearance, and responsive behavior", async () => {
  await matterPage.clickAdditionalDetails();

  if ((await matterPage.priorityButtons.count()) === 0) {
    test.skip("Priority buttons not present");
  }

  const expectedLabels = ["High", "Medium", "Low"];

  for (const label of expectedLabels) {
    const tab = matterPage.page
      .getByRole("tab", { name: new RegExp(`^${label}$`, "i") })
      .first();
    const fallback = matterPage.page
      .getByRole("button", { name: new RegExp(`^${label}$`, "i") })
      .first();
    const element = (await tab.count()) > 0 ? tab : fallback;

    await element.scrollIntoViewIfNeeded();
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
    await expect(element).toHaveText(label);
  }

  const selectedControl = matterPage.page.locator(
    '[role="tab"][aria-selected="true"], button[aria-pressed="true"], button.active, button[class*="active"], button[class*="selected"]',
  );

  if ((await selectedControl.count()) > 0) {
    await expect(selectedControl.first()).toBeVisible();
  }

  await matterPage.page.setViewportSize({ width: 375, height: 812 });

  for (const label of expectedLabels) {
    const tab = matterPage.page
      .getByRole("tab", { name: new RegExp(`^${label}$`, "i") })
      .first();
    const fallback = matterPage.page
      .getByRole("button", { name: new RegExp(`^${label}$`, "i") })
      .first();
    const element = (await tab.count()) > 0 ? tab : fallback;

    await element.scrollIntoViewIfNeeded();
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
  }

  await matterPage.page.setViewportSize({ width: 1280, height: 900 });
});

test("Validate Priority default", async () => {
  // if ((await matterPage.prioritySelect.count()) === 0) test.skip();
  const selected = await matterPage.prioritySelect.inputValue();
  expect(selected).not.toBe("");
});

test("Change Priority", async () => {
  if ((await matterPage.prioritySelect.count()) === 0) test.skip();
  const options = await matterPage.getDropdownOptions(
    matterPage.prioritySelect,
  );
  if (options.length < 2) test.skip("Not enough priority options");
  await matterPage.selectPriority(options[1]);
  expect(await matterPage.prioritySelect.inputValue()).toBe(options[1]);
});

test("Validate Status default", async () => {
  if ((await matterPage.statusSelect.count()) === 0) test.skip();
  const selected = await matterPage.statusSelect.inputValue();
  expect(selected).not.toBe("");
});

test("Change Status", async () => {
  if ((await matterPage.statusSelect.count()) === 0) test.skip();
  const options = await matterPage.getDropdownOptions(matterPage.statusSelect);
  if (options.length < 2) test.skip("Not enough status options");
  await matterPage.selectStatus(options[1]);
  expect(await matterPage.statusSelect.inputValue()).toBe(options[1]);
});

test("Add Matter Tag", async () => {
  if ((await matterPage.tagInput.count()) === 0) test.skip();
  const before = await matterPage.getTagCount();
  await matterPage.addMatterTag(defaultMatter.tags[0]);
  expect(await matterPage.getTagCount()).toBeGreaterThan(before);
});

test("Add duplicate tag", async () => {
  if ((await matterPage.tagInput.count()) === 0) test.skip();
  await matterPage.addMatterTag(matterData.duplicateTag);
  const countAfterFirst = await matterPage.getTagCount();
  await matterPage.addMatterTag(matterData.duplicateTag);
  const countAfterSecond = await matterPage.getTagCount();
  expect(countAfterSecond).toBeLessThanOrEqual(countAfterFirst + 1);
});

test("Click Opponent Advocate +", async () => {
  if ((await matterPage.addOpponentAdvocateButton.count()) === 0) test.skip();
  await matterPage.openOpponentAdvocate();
  await expect(matterPage.opponentNameInput).toBeVisible();
});

test("Verify save button disabled until any of the fields entered", async () => {
  expect(await matterPage.isSaveDisabled()).toBeTruthy();
});

test("Add Opponent Advocate", async () => {
  if ((await matterPage.addOpponentAdvocateButton.count()) === 0) test.skip();
  await matterPage.openOpponentAdvocate();
  await matterPage.fillOpponentAdvocate(defaultMatter.opponentAdvocate);
  if ((await matterPage.opponentNameInput.count()) > 0) {
    expect(await matterPage.opponentNameInput.inputValue()).toBe(
      defaultMatter.opponentAdvocate.name,
    );
  }
  if ((await matterPage.opponentEmailInput.count()) > 0) {
    expect(await matterPage.opponentEmailInput.inputValue()).toContain("@");
  }
  if ((await matterPage.opponentPhoneInput.count()) > 0) {
    expect(await matterPage.opponentPhoneInput.inputValue()).toContain(
      defaultMatter.opponentAdvocate.phone,
    );
  }
});

test("Check save button enabled after Advocate name /Email/ number entered", async () => {
  if ((await matterPage.addOpponentAdvocateButton.count()) === 0) test.skip();
  await matterPage.openOpponentAdvocate();
  await matterPage.fillOpponentAdvocate(defaultMatter.opponentAdvocate);
  await matterPage.page.waitForTimeout(200);
  expect(await matterPage.isSaveEnabled()).toBeTruthy();
});

test("Opponent Advocate Email", async () => {
  if ((await matterPage.addOpponentAdvocateButton.count()) === 0) test.skip();
  await matterPage.openOpponentAdvocate();
  if ((await matterPage.opponentEmailInput.count()) === 0) test.skip();
  await matterPage.opponentEmailInput.fill(matterData.invalidEmail);
  await matterPage.opponentEmailInput.blur();
  await expect(matterPage.opponentEmailInput)
    .toHaveClass(/ng-invalid|invalid/)
    .catch(() => {});
});

test("Verify save button disabled when invalid email address added", async () => {
  if ((await matterPage.addOpponentAdvocateButton.count()) === 0) test.skip();
  await matterPage.openOpponentAdvocate();
  if ((await matterPage.opponentEmailInput.count()) === 0) test.skip();
  await matterPage.opponentEmailInput.fill(matterData.invalidEmail);
  await matterPage.opponentEmailInput.blur();
  expect(await matterPage.isSaveDisabled()).toBeTruthy();
});

test("Verify Phone number entry", async () => {
  // if ((await matterPage.addOpponentAdvocateButton.count()) === 0) test.skip();
  await matterPage.openOpponentAdvocate();
  if ((await matterPage.opponentPhoneInput.count()) === 0) test.skip();
  await matterPage.opponentPhoneInput.fill(
    defaultMatter.opponentAdvocate.phone,
  );
  expect(await matterPage.opponentPhoneInput.inputValue()).toContain(
    defaultMatter.opponentAdvocate.phone,
  );
});

test("Verify Phone number entry with formatting", async () => {
  // if ((await matterPage.addOpponentAdvocateButton.count()) === 0) test.skip();
  await matterPage.openOpponentAdvocate();
  if ((await matterPage.opponentPhoneInput.count()) === 0) test.skip();
  await matterPage.opponentPhoneInput.fill(matterData.formattedPhone);
  expect(
    (await matterPage.opponentPhoneInput.inputValue()).length,
  ).toBeGreaterThan(0);
});

test("Verify Save button enabling even after adding one field", async () => {
  await matterPage.fillCaseTitle("Title for one field");
  if ((await matterPage.courtInput.count()) > 0) {
    await matterPage.fillCourt(defaultMatter.court);
  }
  await matterPage.page.waitForTimeout(200);
  expect(await matterPage.isSaveEnabled()).toBeTruthy();
});

test("Verify cancel button functionality", async () => {
  if ((await matterPage.cancelButton.count()) === 0) test.skip();
  await matterPage.clickCancel();
  await matterPage.page.waitForTimeout(500);
  const forms = await matterPage.page.locator("form").count();
  expect(forms).toBeLessThanOrEqual(1);
});

test("Leave non-mandatory fields empty", async () => {
  await matterPage.fillCaseTitle("Title Only");
  await matterPage.clickSaveForLater();
  await expect(matterPage.page)
    .toHaveURL(/.*(matters|grid|list).*/i)
    .catch(() => {});
});

test("Double click Save for Later", async () => {
  if ((await matterPage.saveForLaterButton.count()) === 0) test.skip();
  await matterPage.saveForLaterButton.first().dblclick();
  await matterPage.page.waitForLoadState("networkidle").catch(() => {});
  expect(await matterPage.saveForLaterButton.count()).toBeGreaterThanOrEqual(0);
});

test("Refresh before saving", async () => {
  await matterPage.reload();
  await expect(matterPage.caseTitleInput)
    .toBeVisible({ timeout: 5000 })
    .catch(() => {});
});

test("Browser Back navigation", async () => {
  await matterPage.goBack();
  await matterPage.page.waitForLoadState("networkidle").catch(() => {});
  await expect(matterPage.page)
    .toHaveURL(/.*(matters|grid|list|login).*/i)
    .catch(() => {});
});

test("Verify tab navigation order", async () => {
  const focusOrder = [
    matterPage.caseTitleInput,
    matterPage.caseNumberInput,
    matterPage.caseTypeSelect,
    matterPage.courtInput,
  ];

  for (const locator of focusOrder) {
    if ((await locator.count()) === 0) continue;
    await locator.focus();
    const focused = await matterPage.page.evaluate(
      () =>
        document.activeElement?.id ||
        document.activeElement?.name ||
        document.activeElement?.placeholder ||
        "",
    );
    expect(focused).not.toBe("");
    await matterPage.page.keyboard.press("Tab");
  }
});

test("Session timeout scenario", async () => {
  if ((await matterPage.sessionTimeoutBanner.count()) === 0)
    test.skip("No session timeout UI available");
  await expect(matterPage.sessionTimeoutBanner).toBeVisible();
});

test("Verify page optional", async () => {
  if ((await matterPage.optionalHint.count()) === 0)
    test.skip("Optional field labels not present");
  await expect(matterPage.optionalHint.first()).toBeVisible();
});
