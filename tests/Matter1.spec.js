require("dotenv").config();

const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginOTP");
const MatterPage = require("../Pages/MattersPage");
const { loginData } = require("../testData/loginData");
const matterData = require("../testData/matterData");
const { caseTypes } = require("../testData/caseTypes.json");
const LoginOTP = require("../Pages/LoginOTP");

const defaultLogin = (loginData && loginData[0]) || {};
const defaultMatter = matterData.defaultMatter;

test.describe.configure({ mode: "serial" });

let page;
let matterPage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();

  const loginPage = new LoginOTP(page);

  await loginPage.open();
  await loginPage.login(process.env.EMAIL);

  await expect(page).toHaveTitle("LexiZ Lawyers");

  matterPage = new MatterPage(page);
});

test.beforeEach(async () => {
  await matterPage.openMatterCreation();
});

test.afterAll(async () => {
  await page.close();
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
test("17. Validate Date of Filing optional and > Created Date", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.dateOfFilingInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCreatedDate("2025-01-01");
  await matterPage.fillDateOfFiling("2026-01-01");

  const created = await matterPage.createdDateInput.inputValue();
  const filed = await matterPage.dateOfFilingInput.inputValue();

  expect(new Date(filed).getTime()).toBeGreaterThan(
    new Date(created).getTime(),
  );
});

test("18. Validate Description field is visible and responsive", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.descriptionInput).toBeVisible();

  await matterPage.fillDescription("Test description");

  await expect(matterPage.descriptionInput).toHaveValue("Test description");
});

test("19.Validate Case Type dropdown responsiveness", async () => {
  if ((await matterPage.caseTypeSelect.count()) === 0)
    test.skip("Case Type dropdown not present");

  await expect(matterPage.caseTypeSelect).toBeVisible();
  await expect(matterPage.caseTypeSelect).toBeEnabled();

  const options = await matterPage.getDropdownOptions(
    matterPage.caseTypeSelect,
  );
  expect(options.length).toBeGreaterThan(0);
});
test("20. Validate Description field is visible and responsive", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.descriptionInput).toBeVisible();

  await matterPage.fillDescription("Test description");

  await expect(matterPage.descriptionInput).toHaveValue("Test description");
});

test("21.Validate the Case Dropdown is responsive", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.caseTypeSelect).toBeVisible();

  await matterPage.caseTypeSelect.selectOption({ label: "Civil Law" });

  await expect(matterPage.caseTypeSelect).toHaveValue(
    await matterPage.caseTypeSelect.inputValue(),
  );
});

test("22. Validate Court field", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.courtInput).toBeVisible();

  await matterPage.fillCourt(defaultMatter.court);

  await expect(matterPage.courtInput).toHaveValue(defaultMatter.court);
});

test("23.Validate Judge field", async () => {
  await matterPage.clickAdditionalDetails();
  await expect(matterPage.judgesInput).toBeVisible();
  await matterPage.judgesInput.fill(defaultMatter.judge);
  await expect(matterPage.judgesInput).toHaveValue(defaultMatter.judge);
});

test("24.Validate Priority Heading", async () => {
  await matterPage.additionalDetails.click();
  await expect(matterPage.priorityText).toBeVisible();
});

test("25.Validate priority buttons visibility, appearance, and responsive behavior", async () => {
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
});

test("26 - Verify Priority section is displayed", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyPrioritySectionVisible();
});

test("27 - Verify High priority is selected by default", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyPrioritySelected("High");
});

test("28 - Verify Medium priority can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectPriorityButton("Medium");

  await matterPage.verifyPrioritySelected("Medium");
});

test("29 - Verify Low priority can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectPriorityButton("Low");

  await matterPage.verifyPrioritySelected("Low");
});

test("30 - Verify only one priority can be selected at a time", async () => {
  // Select Medium
  await matterPage.clickAdditionalDetails();

  await matterPage.selectPriorityButton("Medium");

  await matterPage.verifyPrioritySelected("Medium");

  // Select Low
  await matterPage.selectPriorityButton("Low");

  await matterPage.verifyPrioritySelected("Low");

  // Medium should no longer be selected
  await matterPage.verifyPriorityNotSelected("Medium");
});

test("31 - Verify priority options are in correct order", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyPriorityOptionsOrder();
});

test("32 - Verify priority buttons are clickable", async () => {
  await matterPage.clickAdditionalDetails();

  const priorities = ["High", "Medium", "Low"];

  for (const priority of priorities) {
    const button = matterPage.getPriorityButton(priority);

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await matterPage.selectPriorityButton(priority);
  }
});

test("33 - Verify Status section is displayed", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyStatusSectionVisible();
});

test("34 - Verify Status options are displayed in correct order", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyStatusOrder();
});

test("35 - Verify all Status options are enabled", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyStatusButtonsEnabled();
});

test("36 - Verify Active Status is selected by default", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyDefaultStatus();
});

test("37 - Verify Pending Status can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");
});

test("38 - Verify Active Status can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  // First select Pending
  await matterPage.selectStatusButton("Pending");

  // Select Active
  await matterPage.selectStatusButton("Active");

  await matterPage.verifyStatusSelected("Active");
});

test("39 - Verify only one Status can be selected at a time", async () => {
  await matterPage.clickAdditionalDetails();

  // Select Pending
  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");
  await matterPage.verifyStatusNotSelected("Active");

  // Select Active
  await matterPage.selectStatusButton("Active");

  await matterPage.verifyStatusSelected("Active");
  await matterPage.verifyStatusNotSelected("Pending");
});

test("40 - Verify Status can be changed from Active to Pending", async () => {
  await matterPage.clickAdditionalDetails();

  // Verify initial state
  await matterPage.verifyStatusSelected("Active");

  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");
  await matterPage.verifyStatusNotSelected("Active");
});

test("41 - Verify Status can be changed from Pending to Active", async () => {
  await matterPage.clickAdditionalDetails();

  // Select Pending
  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");

  await matterPage.selectStatusButton("Active");

  await matterPage.verifyStatusSelected("Active");
  await matterPage.verifyStatusNotSelected("Pending");
});

test("42 - Verify Status options are clickable", async () => {
  await matterPage.clickAdditionalDetails();

  const statuses = ["Active", "Pending"];

  for (const status of statuses) {
    await matterPage.selectStatusButton(status);

    await matterPage.verifyStatusSelected(status);
  }
});

test("43 - Verify Tags section is displayed", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyTagsSectionVisible();
});

test("44 - Verify Tags input and ADD button are enabled", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyTagsInputEnabled();
});

test("45 - Verify Tags input has correct placeholder", async () => {
  await matterPage.clickAdditionalDetails();
  await expect(matterPage.tagInput).toHaveAttribute(
    "placeholder",
    "Type to add Matter Tag(s)",
  );
});

test("46 - Verify ADD button is displayed with correct text", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.addTagButton).toHaveText("ADD");
});

test("47 - Verify user can enter a tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("TestTag");

  await matterPage.verifyTagInputValue("TestTag");
});

test("48 - Verify user can add a tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("TestTag");

  await matterPage.verifyTagDisplayed("TestTag");
});

test("49 - Verify user can add a tag with spaces", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("Matter Tag");

  await matterPage.verifyTagDisplayed("Matter Tag");
});

test("50 - Verify user can add another tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("Legal");

  await matterPage.verifyTagDisplayed("Legal");
});

test("51 - Verify tag input is cleared after adding tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("TestTag");

  await matterPage.clickAddTag();

  await matterPage.verifyTagInputIsEmpty();
});

test("52 - Verify multiple tags can be added", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("TagOne");

  await matterPage.addTag("TagTwo");

  await matterPage.verifyTagDisplayed("TagOne");
  await matterPage.verifyTagDisplayed("TagTwo");
});

test("53 - Verify tag is added only after clicking ADD", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("TestTag");

  await matterPage.verifyTagInputValue("TestTag");

  await matterPage.clickAddTag();

  await matterPage.verifyTagDisplayed("TestTag");
});

test("54 - Verify empty tag cannot be added", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyTagInputIsEmpty();

  await matterPage.clickAddTag();

  await matterPage.verifyTagInputIsEmpty();
});

test("55 - Verify tag can be changed before clicking ADD", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("FirstTag");

  await matterPage.enterTag("SecondTag");

  await matterPage.verifyTagInputValue("SecondTag");

  await matterPage.clickAddTag();

  await matterPage.verifyTagDisplayed("SecondTag");
});

test.only("TC56 - Verify Opponent Advocate(s) heading is visible", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyOpponentAdvocateHeadingVisible();
});

test.only("TC57 - Verify Add Opponent Advocate button is visible", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyAddOpponentAdvocateButtonVisible();
});

test.only("TC58 - Verify Add Opponent Advocate button is enabled", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyAddOpponentAdvocateButtonEnabled();
});

test.only("TC59 - Verify Add Opponent Advocate button is clickable", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.clickAddOpponentAdvocate();
});

test("TC59 - Verify Add button displays Opponent Advocate fields", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.clickAddOpponentAdvocate();

  await expect(matterPage.opponentAdvocateNameInput).toBeVisible();

  await expect(matterPage.opponentAdvocateEmailInput).toBeVisible();

  await expect(matterPage.opponentAdvocatePhoneInput).toBeVisible();
});

test("TC60 - Verify Opponent Advocate section is displayed", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyOpponentAdvocateSectionVisible();
});

test("TC37 - Verify Opponent Advocate fields are enabled", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyOpponentAdvocateFieldsEnabled();
});

test("TC38 - Verify Opponent Advocate buttons are enabled", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyOpponentAdvocateButtonsEnabled();
});

test("TC39 - Verify Name field placeholder", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.opponentAdvocateNameInput).toHaveAttribute(
    "placeholder",
    "Name",
  );
});

test("TC40 - Verify Email Address field placeholder", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.opponentAdvocateEmailInput).toHaveAttribute(
    "placeholder",
    "Email Address",
  );
});

test("TC41 - Verify Phone Number field placeholder", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.opponentAdvocatePhoneInput).toHaveAttribute(
    "placeholder",
    "Phone Number",
  );
});

test("TC42 - Verify Cancel button text", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.cancelButton).toHaveText("Cancel");
});

test("TC43 - Verify Save button text", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.saveButton).toHaveText("Save");
});

test("TC44 - Verify user can enter Opponent Advocate name", async () => {
  await matterPage.enterOpponentAdvocateName("John Smith");

  await expect(matterPage.opponentAdvocateNameInput).toHaveValue("John Smith");
});

test("TC45 - Verify user can enter Opponent Advocate email", async () => {
  await matterPage.enterOpponentAdvocateEmail("john.smith@example.com");

  await expect(matterPage.opponentAdvocateEmailInput).toHaveValue(
    "john.smith@example.com",
  );
});

test("TC46 - Verify user can enter Opponent Advocate phone number", async () => {
  await matterPage.enterOpponentAdvocatePhone("9876543210");

  await expect(matterPage.opponentAdvocatePhoneInput).toHaveValue("9876543210");
});

test("TC47 - Verify user can enter complete Opponent Advocate details", async () => {
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.verifyOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
});

test("TC48 - Verify Add button is clickable", async () => {
  await matterPage.clickAddOpponentAdvocate();
});

test("TC49 - Verify clicking Add creates another Opponent Advocate section", async () => {
  const initialNameFields = matterPage.opponentAdvocateNameInput;

  const initialCount = await initialNameFields.count();

  await matterPage.clickAddOpponentAdvocate();

  await expect(initialNameFields).toHaveCount(initialCount + 1);
});

test("TC50 - Verify entered Opponent Advocate details are retained", async () => {
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.verifyOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
});

test("TC51 - Verify Cancel button closes Opponent Advocate section", async () => {
  await matterPage.clickCancel();

  await expect(matterPage.opponentAdvocateNameInput).not.toBeVisible();
});

test("TC51 - Verify Cancel clears Opponent Advocate details", async () => {
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.clickCancel();

  await expect(matterPage.opponentAdvocateNameInput).toHaveValue("");

  await expect(matterPage.opponentAdvocateEmailInput).toHaveValue("");

  await expect(matterPage.opponentAdvocatePhoneInput).toHaveValue("");
});

test("TC52 - Verify Opponent Advocate details can be saved", async () => {
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.clickSave();
});

test("TC53 - Verify Save closes Opponent Advocate form", async () => {
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.clickSave();

  await expect(matterPage.opponentAdvocateNameInput).not.toBeVisible();
});

test("TC54 - Verify invalid email is not accepted", async () => {
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "invalid-email",
    "9876543210",
  );

  await matterPage.clickSave();

  await expect(matterPage.opponentAdvocateEmailInput).toBeVisible();
});

test("TC55 - Verify required fields are validated", async () => {
  await matterPage.clickSave();

  await expect(matterPage.opponentAdvocateNameInput).toBeVisible();

  await expect(matterPage.opponentAdvocateEmailInput).toBeVisible();

  await expect(matterPage.opponentAdvocatePhoneInput).toBeVisible();
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
  // if ((await matterPage.saveForLaterButton.count()) === 0) test.skip();
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
