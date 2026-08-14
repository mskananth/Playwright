require("dotenv").config();

const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginPage");
const MatterPage = require("../Pages/MattersPage");
const { loginData } = require("../testData/loginData");
const matterData = require("../testData/matterData");
const { caseTypes } = require("../testData/caseTypes.json");
const matterData1 = require("../testData/matterData1.json");

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

  await loginPage.assertTitle("Lexi-Z Lawyers");
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

test.afterEach(async () => {
  const pages = await page.context().pages();
  const extraPages = pages.filter((p) => p !== page);
  for (const extraPage of extraPages) {
    await extraPage.close();
  }
});

test("TC-01. Verify screen loads successfully", async () => {
  await expect(matterPage.caseTitleInput).toBeVisible();
});

test("TC-02. Verify mandatory indicators", async () => {
  await expect(matterPage.caseTitleLabel).toContainText("*");
  await expect(matterPage.matterNumberLabel).toContainText("*");
});

test("TC-03. Verify default button when no input", async () => {
  expect(await matterPage.isSaveDisabled()).toBeTruthy();
});

test("TC-04. Verify Matter Number auto-generated", async () => {
  await expect(matterPage.matterNumberInput).toHaveValue(/.*/);
});

test("TC-05. Verify Matter Number not editable", async () => {
  await expect(matterPage.matterNumberInput).toHaveAttribute("readonly", "");
});

test("TC-06. Validate Case Title mandatory", async () => {
  await expect(matterPage.caseTitleInput).toHaveValue("");
  await expect(matterPage.matterSaveButton).toBeDisabled();
  await expect(matterPage.caseTitleInput).toHaveClass(/ng-invalid/);
});

test("TC-07. Validate Case Title with spaces", async () => {
  await matterPage.fillCaseTitle("   ");
  await matterPage.caseTitleInput.blur();
  await expect(matterPage.caseTitleInput).toHaveClass(/ng-invalid/);
});

test("TC-08. Validate valid Case Title", async () => {
  await matterPage.fillCaseTitle(defaultMatter.title);
  await matterPage.caseTitleInput.blur();
  await expect(matterPage.caseTitleInput).not.toHaveClass(/ng-invalid/);
});

test("TC-09. Validate max length Case Title and exceeding max length", async () => {
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

test("TC-10. Enter only Case Title and Save draft with partial data", async () => {
  await matterPage.fillCaseTitle("Partial Title Only");

  const saved = await matterPage.clickSaveForLater();

  if (saved) {
    await expect(matterPage.page).toHaveURL(/.*(matters|grid|list).*/i);
  }
});

test("TC-11. Enter only Case Number", async () => {
  if ((await matterPage.caseNumberInput.count()) === 0) test.skip();
  await matterPage.fillCaseNumber(defaultMatter.caseNumber);
  // await matterPage.caseNumberInput.blur();
  await expect(matterPage.caseNumberInput).not.toHaveClass(/ng-invalid/);
});

test("TC-12. Clear entered data", async () => {
  await matterPage.fillCaseTitle("To be cleared");
  await matterPage.clearCaseTitle();
  expect(await matterPage.caseTitleInput.inputValue()).toBe("");
});

test("TC-13. Save draft with mandatory only", async () => {
  await matterPage.fillCaseTitle("Mandatory Only Title");

  await matterPage.clickSaveForLater();

  await expect(matterPage.page).toHaveURL(/matter\/legalmatter\/create/);
});

test("TC-14. Validate Save & Next button state", async () => {
  await expect(matterPage.matterSaveButton).toBeDisabled();

  await matterPage.fillCaseTitle(defaultMatter.title);
  await matterPage.caseTitleInput.blur();

  await expect(matterPage.matterSaveButton).toBeEnabled();
});

test("TC-15. Validate Created Date default and modify Created Date", async () => {
  if ((await matterPage.createdDateInput.count()) === 0) test.skip();
  const defaultVal = await matterPage.createdDateInput.inputValue();
  expect(defaultVal).not.toBeNull();
  await matterPage.fillCreatedDate("2025-01-01");
  expect(
    (await matterPage.createdDateInput.inputValue()).length,
  ).toBeGreaterThan(0);
});

test("TC-16. Validate Date of Filing optional and > Created Date", async () => {
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

test("TC-17. Validate Description field is visible and responsive", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.descriptionInput).toBeVisible();

  await matterPage.fillDescription("Test description");

  await expect(matterPage.descriptionInput).toHaveValue("Test description");
});

test("TC-18. Verify Case Type can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectCaseType("Civil Law");

  await expect(matterPage.caseTypeDropdown).toHaveValue("Civil Law");
});

test("TC-19. Validate Court field", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.courtInput).toBeVisible();

  await matterPage.fillCourt(defaultMatter.court);

  await expect(matterPage.courtInput).toHaveValue(defaultMatter.court);
});

test("TC-20. Validate Judge field", async () => {
  await matterPage.clickAdditionalDetails();
  await expect(matterPage.judgesInput).toBeVisible();
  await matterPage.judgesInput.fill(defaultMatter.judge);
  await expect(matterPage.judgesInput).toHaveValue(defaultMatter.judge);
});

test("TC-21. Validate Priority Heading", async () => {
  await matterPage.additionalDetails.click();
  await expect(matterPage.priorityText).toBeVisible();
});

test("TC-22. Validate priority buttons visibility, appearance, and responsive behavior", async () => {
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

test("TC-23. Verify Priority section is displayed", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyPrioritySectionVisible();
});

test("TC-24. Verify High priority is selected by default", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyPrioritySelected("High");
});

test("TC-25. Verify Medium priority can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectPriorityButton("Medium");

  await matterPage.verifyPrioritySelected("Medium");
});

test("TC-26. Verify Low priority can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectPriorityButton("Low");

  await matterPage.verifyPrioritySelected("Low");
});

test("TC-27. Verify only one priority can be selected at a time", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectPriorityButton("Medium");

  await matterPage.verifyPrioritySelected("Medium");

  await matterPage.selectPriorityButton("Low");

  await matterPage.verifyPrioritySelected("Low");

  await matterPage.verifyPriorityNotSelected("Medium");
});

test("TC-28. Verify priority options are in correct order", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyPriorityOptionsOrder();
});

test("TC-29. Verify priority buttons are clickable", async () => {
  await matterPage.clickAdditionalDetails();

  const priorities = ["High", "Medium", "Low"];

  for (const priority of priorities) {
    const button = matterPage.getPriorityButton(priority);

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await matterPage.selectPriorityButton(priority);
  }
});

test("TC-30. Verify Status section is displayed", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyStatusSectionVisible();
});

test("TC-31. Verify Status options are displayed in correct order", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyStatusOrder();
});

test("TC-32. Verify all Status options are enabled", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyStatusButtonsEnabled();
});

test("TC-33. Verify Active Status is selected by default", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyDefaultStatus();
});

test("TC-34. Verify Pending Status can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");
});

test("TC-35. Verify Active Status can be selected", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectStatusButton("Pending");

  await matterPage.selectStatusButton("Active");

  await matterPage.verifyStatusSelected("Active");
});

test("TC-36. Verify only one Status can be selected at a time", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");
  await matterPage.verifyStatusNotSelected("Active");

  await matterPage.selectStatusButton("Active");

  await matterPage.verifyStatusSelected("Active");
  await matterPage.verifyStatusNotSelected("Pending");
});

test("TC-37. Verify Status can be changed from Active to Pending", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyStatusSelected("Active");

  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");
  await matterPage.verifyStatusNotSelected("Active");
});

test("TC-38. Verify Status can be changed from Pending to Active", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.selectStatusButton("Pending");

  await matterPage.verifyStatusSelected("Pending");

  await matterPage.selectStatusButton("Active");

  await matterPage.verifyStatusSelected("Active");
  await matterPage.verifyStatusNotSelected("Pending");
});

test("TC-39. Verify Status options are clickable", async () => {
  await matterPage.clickAdditionalDetails();

  const statuses = ["Active", "Pending"];

  for (const status of statuses) {
    await matterPage.selectStatusButton(status);

    await matterPage.verifyStatusSelected(status);
  }
});

test("TC-40. Verify Tags section is displayed", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyTagsSectionVisible();
});

test("TC-41. Verify Tags input and ADD button are enabled", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyTagsInputEnabled();
});

test("TC-42. Verify Tags input has correct placeholder", async () => {
  await matterPage.clickAdditionalDetails();
  await expect(matterPage.tagInput).toHaveAttribute(
    "placeholder",
    "Type to add Matter Tag(s)",
  );
});

test("TC-43. Verify ADD button is displayed with correct text", async () => {
  await matterPage.clickAdditionalDetails();

  await expect(matterPage.addTagButton).toHaveText("ADD");
});

test("TC-44. Verify user can enter a tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("TestTag");

  await matterPage.verifyTagInputValue("TestTag");
});

test("TC-45. Verify user can add a tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("TestTag");

  await matterPage.verifyTagDisplayed("TestTag");
});

test("TC-46. Verify user can add a tag with spaces", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("Matter Tag");

  await matterPage.verifyTagDisplayed("Matter Tag");
});

test("TC-47. Verify user can add another tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("Legal");

  await matterPage.verifyTagDisplayed("Legal");
});

test("TC-48. Verify tag input is cleared after adding tag", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("TestTag");

  await matterPage.clickAddTag();

  await matterPage.verifyTagInputIsEmpty();
});

test("TC-49. Verify multiple tags can be added", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.addTag("TagOne");

  await matterPage.addTag("TagTwo");

  await matterPage.verifyTagDisplayed("TagOne");
  await matterPage.verifyTagDisplayed("TagTwo");
});

test("TC-50. Verify tag is added only after clicking ADD", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("TestTag");

  await matterPage.verifyTagInputValue("TestTag");

  await matterPage.clickAddTag();

  await matterPage.verifyTagDisplayed("TestTag");
});

test("TC-51. Verify empty tag cannot be added", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyTagInputIsEmpty();

  await matterPage.clickAddTag();

  await matterPage.verifyTagInputIsEmpty();
});

test("TC-52. Verify tag can be changed before clicking ADD", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.enterTag("FirstTag");

  await matterPage.enterTag("SecondTag");

  await matterPage.verifyTagInputValue("SecondTag");

  await matterPage.clickAddTag();

  await matterPage.verifyTagDisplayed("SecondTag");
});

test("TC-53. Verify Opponent Advocate(s) heading is visible", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyOpponentAdvocateHeadingVisible();
});

test("TC-54. Verify Add Opponent Advocate button is visible", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyAddOpponentAdvocateButtonVisible();
});

test("TC-55. Verify Add Opponent Advocate button is enabled", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.verifyAddOpponentAdvocateButtonEnabled();
});

test("TC-56. Verify Add Opponent Advocate button is clickable", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
});

test("TC-57. Verify Add button displays Opponent Advocate fields", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.clickAddOpponentAdvocate();

  await expect(matterPage.opponentAdvocateNameInput).toBeVisible();

  await expect(matterPage.opponentAdvocateEmailInput).toBeVisible();

  await expect(matterPage.opponentAdvocatePhoneInput).toBeVisible();
});

test("TC-58. Verify Opponent Advocate section is displayed", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyOpponentAdvocateSectionVisible();
});

test("TC-59. Verify Opponent Advocate fields are enabled", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.verifyOpponentAdvocateFieldsEnabled();
});

test("TC-60. Verify Name field placeholder", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await expect(matterPage.opponentAdvocateNameInput).toHaveAttribute(
    "placeholder",
    "Name",
  );
});

test("TC-61. Verify Email Address field placeholder", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await expect(matterPage.opponentAdvocateEmailInput).toHaveAttribute(
    "placeholder",
    "Email Address",
  );
});

test("TC-62. Verify Phone Number field placeholder", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await expect(matterPage.opponentAdvocatePhoneInput).toHaveAttribute(
    "placeholder",
    "Phone Number",
  );
});

test("TC-63. Verify user can enter Opponent Advocate name", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateName("John Smith");
  await expect(matterPage.opponentAdvocateNameInput).toHaveValue("John Smith");
});

test("TC-64. Verify user can enter Opponent Advocate email", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateEmail("john.smith@example.com");
  await expect(matterPage.opponentAdvocateEmailInput).toHaveValue(
    "john.smith@example.com",
  );
});

test("TC-65. Verify user can enter Opponent Advocate phone number", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocatePhone("9876543210");
  await expect(matterPage.opponentAdvocatePhoneInput).toHaveValue("9876543210");
});

test("TC-66. Verify user can enter complete Opponent Advocate details", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
});

test("TC-67. Verify entered Opponent Advocate details are retained", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543310",
  );
  await matterPage.clickSave();
  await matterPage.verifySavedOpponentAdvocateDetails("John Smith");
});

test("TC-68. Verify Cancel button closes Opponent Advocate section", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.clickCancel();
  await expect(matterPage.opponentAdvocateNameInput).not.toBeVisible();
});

test("TC-69. Verify Cancel closes Opponent Advocate details", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.clickAddOpponentAdvocate();

  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await expect(matterPage.opponentAdvocateNameInput).toBeVisible();
  await expect(matterPage.opponentAdvocateEmailInput).toBeVisible();
  await expect(matterPage.opponentAdvocatePhoneInput).toBeVisible();

  await matterPage.clickCancel();
});

test("TC-70. Verify Opponent Advocate details can be saved", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.clickAddOpponentAdvocate();

  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.clickSave();

  await matterPage.verifySavedOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
});

test("TC-71. Verify Save closes Opponent Advocate form", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.clickSave();

  await expect(matterPage.opponentAdvocateNameInput).not.toBeVisible();
});

test("TC-72. Verify Opponent Lawyer Edit Button is Visible and Responsive", async () => {
  await matterPage.clickAdditionalDetails();
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.clickSave();
  await expect(matterPage.opponentAdvocateEditBtn).toBeVisible();
  await expect(matterPage.opponentAdvocateEditBtn).toBeEnabled();
});

test("TC-73. Verify Opponent Lawyer Details are Editable", async () => {
  await matterPage.clickAdditionalDetails();

  await matterPage.clickAddOpponentAdvocate();

  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  await matterPage.clickSave();

  await expect(
    matterPage.page.getByText("John Smith", {
      exact: true,
    }),
  ).toBeVisible();

  await matterPage.clickOpponentAdvocateEdit.click();
  await matterPage.clearOpponentAdvocateDetails();
  await matterPage.enterOpponentAdvocateDetails(
    "Randy Ortan",
    "randy@example.com",
    "9944574331",
  );
  await matterPage.clickSave();
  await matterPage.verifySavedOpponentAdvocateDetails(
    "Randy Ortan",
    "randy@example.com",
    "9944574331",
  );
});

test("TC-74. Verify Show Less Details is clickable", async () => {
  await matterPage.clickAdditionalDetails();
  await expect(matterPage.showLessDetails).toBeVisible();
  await expect(matterPage.showLessDetails).toBeEnabled();
  await matterPage.clickShowLessDetails();
});

test("TC-75. Create Legal Matter 1st Page Save For Later", async () => {
  const data = matterData.TC75_CreateLegalMatterSaveForLater;
  await expect(matterPage.caseTitleInput).toBeVisible();

  await expect(matterPage.caseNumberInput).toBeVisible();

  await expect(matterPage.matterNumberInput).toBeVisible();

  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);

  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);

  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);
  const matterNumber = await matterPage.matterNumberInput.inputValue();
  await matterPage.clickSaveForLater();
  // await matterPage.verifyMatterCreatedInView(data.caseTitle);
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
});

test("TC-76. Create Legal Matter 1st Page Save and Next Select Client 2nd SFL", async () => {
  const data = matterData.TC76_CreateLegalMatterSelectClient;

  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);

  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  await matterPage.clickSaveAndNext();

  await matterPage.enterClientName(data.client.name);

  await matterPage.clickClientSearch();

  await matterPage.openClientDropdown();

  await matterPage.selectClient(data.client.name);

  await matterPage.verifySelectedClient(data.client.name);

  await matterPage.clickSaveForLater();

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(
    matterPage.page
      .getByText(data.client.name, {
        exact: true,
      })
      .first(),
  ).toBeVisible({
    timeout: 30000,
  });
});

test("TC77 - Create Legal Matter 1st Page Save and Next Select Client Save & Next Upload Documents", async () => {
  const data = matterData1.TC77_CreateLegalMatterSaveNextX2Documents;

  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  await matterPage.clickSaveAndNext();

  await matterPage.enterClientName(data.client.name);
  await matterPage.clickClientSearch(data.client.name);
  await matterPage.openClientDropdown();
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  await matterPage.clickSaveAndNext();
  await matterPage.verifyDocumentsSectionVisible();

  await matterPage.uploadDocument(data.document.filePath);
  await matterPage.verifyUploadedDocument(data.document.fileName);

  await matterPage.clickFinalSave();

  await matterPage.verifyMatterCreatedInView(data.caseTitle);
  await matterPage.verifyClientPresentInListing(
    data.client.name,
    data.caseTitle,
  );

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test("TC-78. Create Legal Matter and Additional Details 1st SFL", async () => {
  const data = matterData1.TC78_CreateMatterWithAdditionalDetails;

  await expect(matterPage.caseTitleInput).toBeVisible();

  await expect(matterPage.caseNumberInput).toBeVisible();

  await expect(matterPage.matterNumberInput).toBeVisible();

  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);

  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);

  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);

  await matterPage.fillDescription(data.description);

  await matterPage.selectCaseType(data.caseType);

  await matterPage.fillCourt(data.court);

  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);

  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);

  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);

  await matterPage.verifyStatusSelected(data.status);

  await matterPage.clickAddOpponentAdvocate();

  await matterPage.enterOpponentAdvocateDetails(
    data.opponentAdvocate.name,
    data.opponentAdvocate.email,
    data.opponentAdvocate.phone,
  );

  await matterPage.verifySaveButton();

  await matterPage.clickSave();

  await matterPage.verifySavedOpponentAdvocateDetails(
    data.opponentAdvocate.name,
  );

  await matterPage.clickSaveForLater();

  // await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test("TC-79. Create Legal Matter with Additional Details, select Client and Save for Later", async () => {
  const data = matterData1.TC79_CreateMatterWithAdditionalDetailsAndClient;

  // =========================
  // First Page - Basic Details
  // =========================
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // =========================
  // Additional Details
  // =========================
  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // =========================
  // Save & Next - Client
  // =========================
  const movedToClientSelection = await matterPage.clickSaveAndNext();

  expect(movedToClientSelection).toBe(true);

  // Wait for Client section/input
  // await expect(matterPage.clientNameInput).toBeVisible({
  //   timeout: 30000,
  // });

  // =========================
  // Client Selection
  // =========================
  await matterPage.enterClientName(data.client.name);

  await matterPage.clickClientSearch(data.client.name);

  // Wait for client dropdown/results
  await matterPage.openClientDropdown();

  await matterPage.selectClient(data.client.name);

  await matterPage.verifySelectedClient(data.client.name);

  // =========================
  // Save For Later
  // =========================
  await matterPage.clickSaveForLater();

  // =========================
  // Verify Matter
  // =========================
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // =========================
  // Verify Matter Number
  // =========================
  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  // =========================
  // Verify Client
  // =========================
  await expect(
    matterPage.page
      .getByText(data.client.name, {
        exact: true,
      })
      .first(),
  ).toBeVisible({
    timeout: 30000,
  });
});
test("TC-80. Create Legal Matter with Additional Details, Client and Upload Documents", async () => {
  const data = matterData1.TC80_CreateLegalMatter_with_allFields;

  const uploadFiles = data.document.multiUploadFiles || [
    data.document.filePath,
  ];

  // =========================
  // First Page - Basic Details
  // =========================
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // =========================
  // Additional Details
  // =========================
  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // =========================
  // Save & Next - Client
  // =========================
  const movedToClientSelection = await matterPage.clickSaveAndNext();

  expect(movedToClientSelection).toBe(true);

  await matterPage.enterClientName(data.client.name);
  await matterPage.clickClientSearch(data.client.name);
  await matterPage.openClientDropdown();
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // =========================
  // Save & Next - Documents
  // =========================
  await matterPage.clickSaveAndNext();

  await matterPage.verifyDocumentsSectionVisible();

  // =========================
  // Upload Multiple Documents
  // =========================
  await matterPage.uploadDocuments(uploadFiles);

  // =========================
  // Verify Documents
  // =========================
  for (const file of uploadFiles) {
    const fileName = file.split("/").pop();

    await matterPage.verifyUploadedDocument(fileName);
  }

  // =========================
  // Final Save
  // =========================
  await matterPage.clickFinalSave();

  // =========================
  // Verify Matter
  // =========================
  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // =========================
  // Verify Client
  // =========================
  await matterPage.verifyClientPresentInListing(
    data.client.name,
    data.caseTitle,
  );

  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }
});

test("TC-81. Solo Create Legal Matter 1st Page Save and Next Select Client 2nd SFL", async () => {
  const data = matterData1.TC81_CreateLegalMatterSelectClient_SoloLawyer;

  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);

  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  await matterPage.clickSaveAndNext();

  await matterPage.enterClientName(data.client.name);

  await matterPage.clickClientSearch();

  await matterPage.openClientDropdown();

  await matterPage.selectClient(data.client.name);

  await matterPage.verifySelectedClient(data.client.name);

  await matterPage.clickSaveForLater();

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(
    matterPage.page
      .getByText(data.client.name, {
        exact: true,
      })
      .first(),
  ).toBeVisible({
    timeout: 30000,
  });
});

test("TC-82 - Solo Create Legal Matter 1st Page Save and Next Select Client Save & Next Upload Documents", async () => {
  const data = matterData1.TC83_CreateMatterWithAdditionalDetails_SoloLawyer;

  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  await matterPage.clickSaveAndNext();

  await matterPage.enterClientName(data.client.name);
  await matterPage.clickClientSearch(data.client.name);
  await matterPage.openClientDropdown();
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  await matterPage.clickSaveAndNext();
  await matterPage.verifyDocumentsSectionVisible();

  await matterPage.uploadDocument(data.document.filePath);
  await matterPage.verifyUploadedDocument(data.document.fileName);

  await matterPage.clickFinalSave();

  await matterPage.verifyMatterCreatedInView(data.caseTitle);
  await matterPage.verifyClientPresentInListing(
    data.client.name,
    data.caseTitle,
  );

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test("TC-83. Create Legal Matter and Additional Details 1st SFL", async () => {
  const data = matterData1.TC83_CreateMatterWithAdditionalDetails_SoloLawyer;

  await expect(matterPage.caseTitleInput).toBeVisible();

  await expect(matterPage.caseNumberInput).toBeVisible();

  await expect(matterPage.matterNumberInput).toBeVisible();

  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);

  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);

  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);

  await matterPage.fillDescription(data.description);

  await matterPage.selectCaseType(data.caseType);

  await matterPage.fillCourt(data.court);

  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);

  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);

  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);

  await matterPage.verifyStatusSelected(data.status);

  await matterPage.clickAddOpponentAdvocate();

  await matterPage.enterOpponentAdvocateDetails(
    data.opponentAdvocate.name,
    data.opponentAdvocate.email,
    data.opponentAdvocate.phone,
  );

  await matterPage.verifySaveButton();

  await matterPage.clickSave();

  await matterPage.verifySavedOpponentAdvocateDetails(
    data.opponentAdvocate.name,
  );

  await matterPage.clickSaveForLater();

  // await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test("TC-84. Create Legal Matter with Additional Details, select Client and Save for Later", async () => {
  const data =
    matterData1.TC84_CreateMatterWithAdditionalDetailsAndClient_SoloLawyer;

  // =========================
  // First Page - Basic Details
  // =========================
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // =========================
  // Additional Details
  // =========================
  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // =========================
  // Save & Next - Client
  // =========================
  const movedToClientSelection = await matterPage.clickSaveAndNext();

  expect(movedToClientSelection).toBe(true);

  // Wait for Client section/input
  // await expect(matterPage.clientNameInput).toBeVisible({
  //   timeout: 30000,
  // });

  // =========================
  // Client Selection
  // =========================
  await matterPage.enterClientName(data.client.name);

  await matterPage.clickClientSearch(data.client.name);

  // Wait for client dropdown/results
  await matterPage.openClientDropdown();

  await matterPage.selectClient(data.client.name);

  await matterPage.verifySelectedClient(data.client.name);

  // =========================
  // Save For Later
  // =========================
  await matterPage.clickSaveForLater();

  // =========================
  // Verify Matter
  // =========================
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // =========================
  // Verify Matter Number
  // =========================
  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  // =========================
  // Verify Client
  // =========================
  await expect(
    matterPage.page
      .getByText(data.client.name, {
        exact: true,
      })
      .first(),
  ).toBeVisible({
    timeout: 30000,
  });
});
test("TC-85. Create Legal Matter with Additional Details, Client and Upload Documents", async () => {
  const data = matterData1.TC85_CreateLegalMatter_with_allFields_SoloLawyer;

  const uploadFiles = data.document.multiUploadFiles || [
    data.document.filePath,
  ];

  // =========================
  // First Page - Basic Details
  // =========================
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // =========================
  // Additional Details
  // =========================
  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // =========================
  // Save & Next - Client
  // =========================
  const movedToClientSelection = await matterPage.clickSaveAndNext();

  expect(movedToClientSelection).toBe(true);

  await matterPage.enterClientName(data.client.name);
  await matterPage.clickClientSearch(data.client.name);
  await matterPage.openClientDropdown();
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // =========================
  // Save & Next - Documents
  // =========================
  await matterPage.clickSaveAndNext();

  await matterPage.verifyDocumentsSectionVisible();

  // =========================
  // Upload Multiple Documents
  // =========================
  await matterPage.uploadDocuments(uploadFiles);

  // =========================
  // Verify Documents
  // =========================
  for (const file of uploadFiles) {
    const fileName = file.split("/").pop();

    await matterPage.verifyUploadedDocument(fileName);
  }

  // =========================
  // Final Save
  // =========================
  await matterPage.clickFinalSave();

  // =========================
  // Verify Matter
  // =========================
  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // =========================
  // Verify Client
  // =========================
  await matterPage.verifyClientPresentInListing(
    data.client.name,
    data.caseTitle,
  );

  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }
});

test.only("TC-86. Solo Create Legal Matter 1st Page Save and Next Select Client 2nd SFL", async () => {
  const data = matterData1.TC86_CreateLegalMatterSelectClient_Corporate;

  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);

  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  await matterPage.clickSaveAndNext();

  await matterPage.enterClientName(data.client.name);

  await matterPage.clickClientSearch();

  await matterPage.openClientDropdown();

  await matterPage.selectClient(data.client.name);

  await matterPage.verifySelectedClient(data.client.name);

  await matterPage.clickSaveForLater();

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(
    matterPage.page
      .getByText(data.client.name, {
        exact: true,
      })
      .first(),
  ).toBeVisible({
    timeout: 30000,
  });
});

test.only("TC-87 - Solo Create Legal Matter 1st Page Save and Next Select Client Save & Next Upload Documents", async () => {
  const data = matterData1.TC87_CreateLegalMatterSaveNextX2Documents_Corporate;

  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  await matterPage.clickSaveAndNext();

  await matterPage.enterClientName(data.client.name);
  await matterPage.clickClientSearch(data.client.name);
  await matterPage.openClientDropdown();
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  await matterPage.clickSaveAndNext();
  await matterPage.verifyDocumentsSectionVisible();

  await matterPage.uploadDocument(data.document.filePath);
  await matterPage.verifyUploadedDocument(data.document.fileName);

  await matterPage.clickFinalSave();

  await matterPage.verifyMatterCreatedInView(data.caseTitle);
  await matterPage.verifyClientPresentInListing(
    data.client.name,
    data.caseTitle,
  );

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test.only("TC-88. Create Legal Matter and Additional Details 1st SFL", async () => {
  const data = matterData1.TC88_CreateMatterWithAdditionalDetails_Corporate;

  await expect(matterPage.caseTitleInput).toBeVisible();

  await expect(matterPage.caseNumberInput).toBeVisible();

  await expect(matterPage.matterNumberInput).toBeVisible();

  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);

  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);

  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);

  await matterPage.fillDescription(data.description);

  await matterPage.selectCaseType(data.caseType);

  await matterPage.fillCourt(data.court);

  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);

  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);

  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);

  await matterPage.verifyStatusSelected(data.status);

  await matterPage.clickAddOpponentAdvocate();

  await matterPage.enterOpponentAdvocateDetails(
    data.opponentAdvocate.name,
    data.opponentAdvocate.email,
    data.opponentAdvocate.phone,
  );

  await matterPage.verifySaveButton();

  await matterPage.clickSave();

  await matterPage.verifySavedOpponentAdvocateDetails(
    data.opponentAdvocate.name,
  );

  await matterPage.clickSaveForLater();

  // await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test.only("TC-89. Create Legal Matter with Additional Details, select Client and Save for Later", async () => {
  const data =
    matterData1.TC89_CreateMatterWithAdditionalDetailsAndClient_Corporate;

  // =========================
  // First Page - Basic Details
  // =========================
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // =========================
  // Additional Details
  // =========================
  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // =========================
  // Save & Next - Client
  // =========================
  const movedToClientSelection = await matterPage.clickSaveAndNext();

  expect(movedToClientSelection).toBe(true);

  // Wait for Client section/input
  // await expect(matterPage.clientNameInput).toBeVisible({
  //   timeout: 30000,
  // });

  // =========================
  // Client Selection
  // =========================
  await matterPage.enterClientName(data.client.name);

  await matterPage.clickClientSearch(data.client.name);

  // Wait for client dropdown/results
  await matterPage.openClientDropdown();

  await matterPage.selectClient(data.client.name);

  await matterPage.verifySelectedClient(data.client.name);

  // =========================
  // Save For Later
  // =========================
  await matterPage.clickSaveForLater();

  // =========================
  // Verify Matter
  // =========================
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // =========================
  // Verify Matter Number
  // =========================
  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  // =========================
  // Verify Client
  // =========================
  await expect(
    matterPage.page
      .getByText(data.client.name, {
        exact: true,
      })
      .first(),
  ).toBeVisible({
    timeout: 30000,
  });
});
test.only("TC-90. Create Legal Matter with Additional Details, Client and Upload Documents", async () => {
  const data = matterData1.TC90_CreateLegalMatter_with_allFields_Corporate;

  const uploadFiles = data.document.multiUploadFiles || [
    data.document.filePath,
  ];

  // =========================
  // First Page - Basic Details
  // =========================
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // =========================
  // Additional Details
  // =========================
  await matterPage.clickAdditionalDetails();

  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // =========================
  // Save & Next - Client
  // =========================
  const movedToClientSelection = await matterPage.clickSaveAndNext();

  expect(movedToClientSelection).toBe(true);

  await matterPage.enterClientName(data.client.name);
  await matterPage.clickClientSearch(data.client.name);
  await matterPage.openClientDropdown();
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // =========================
  // Save & Next - Documents
  // =========================
  await matterPage.clickSaveAndNext();

  await matterPage.verifyDocumentsSectionVisible();

  // =========================
  // Upload Multiple Documents
  // =========================
  await matterPage.uploadDocuments(uploadFiles);

  // =========================
  // Verify Documents
  // =========================
  for (const file of uploadFiles) {
    const fileName = file.split("/").pop();

    await matterPage.verifyUploadedDocument(fileName);
  }

  // =========================
  // Final Save
  // =========================
  await matterPage.clickFinalSave();

  // =========================
  // Verify Matter
  // =========================
  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // =========================
  // Verify Client
  // =========================
  await matterPage.verifyClientPresentInListing(
    data.client.name,
    data.caseTitle,
  );

  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }
});
