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
  // Initialize page and perform user login
  page = await browser.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.loginWithPassword(
    defaultLogin.email || process.env.EMAIL,
    defaultLogin.password || process.env.PASSWORD,
  );

  // Verify successful login by checking page title
  await loginPage.assertTitle("Lexi-Z Lawyers");
  matterPage = new MatterPage(page);

  // Navigate to matter creation page and verify form visibility
  await matterPage.openMatterCreation();
  // await matterPage.verifyCreateMatterFormVisible();
});

test.afterAll(async () => {
  // Close browser page after test suite execution
  await page.close();
});

test.beforeEach(async () => {
  // Reset navigation state to matter creation before each test
  await matterPage.openMatterCreation();
});

test.afterEach(async () => {
  // Clean up any extra popups/pages opened during test execution
  const pages = await page.context().pages();
  const extraPages = pages.filter((p) => p !== page);
  for (const extraPage of extraPages) {
    await extraPage.close();
  }
});

test("TC-01. Verify screen loads successfully", async () => {
  // Step 1: Verify case title input field is visible on the page
  await expect(matterPage.caseTitleInput).toBeVisible();
});

test("TC-02. Verify mandatory indicators", async () => {
  // Step 1: Verify case title field label contains mandatory asterisk indicator
  await expect(matterPage.caseTitleLabel).toContainText("*");
  // Step 2: Verify matter number field label contains mandatory asterisk indicator
  await expect(matterPage.matterNumberLabel).toContainText("*");
});

test("TC-03. Verify default button when no input", async () => {
  // Step 1: Verify Save button is disabled by default when form fields are empty
  expect(await matterPage.isSaveDisabled()).toBeTruthy();
});

test("TC-04. Verify Matter Number auto-generated", async () => {
  // Step 1: Verify matter number field contains an auto-generated value
  await expect(matterPage.matterNumberInput).toHaveValue(/.*/);
});

test("TC-05. Verify Matter Number not editable", async () => {
  // Step 1: Verify matter number input has readonly attribute
  await expect(matterPage.matterNumberInput).toHaveAttribute("readonly", "");
});

test("TC-06. Validate Case Title mandatory", async () => {
  // Step 1: Ensure case title input is empty
  await expect(matterPage.caseTitleInput).toHaveValue("");
  // Step 2: Verify save button remains disabled
  await expect(matterPage.matterSaveButton).toBeDisabled();
  // Step 3: Verify case title input field shows validation error styling
  await expect(matterPage.caseTitleInput).toHaveClass(/ng-invalid/);
});

test("TC-07. Validate Case Title with spaces", async () => {
  // Step 1: Enter only spaces into the case title input field
  await matterPage.fillCaseTitle("   ");
  // Step 2: Remove focus from case title input
  await matterPage.caseTitleInput.blur();
  // Step 3: Verify field remains invalid when filled with whitespace
  await expect(matterPage.caseTitleInput).toHaveClass(/ng-invalid/);
});

test("TC-08. Validate valid Case Title", async () => {
  // Step 1: Fill valid case title into the input
  await matterPage.fillCaseTitle(defaultMatter.title);
  // Step 2: Remove focus from case title input
  await matterPage.caseTitleInput.blur();
  // Step 3: Verify validation error style is removed
  await expect(matterPage.caseTitleInput).not.toHaveClass(/ng-invalid/);
});

test("TC-09. Validate max length Case Title and exceeding max length", async () => {
  // Step 1: Retrieve maxlength attribute from case title field
  const maxAttr = await matterPage.caseTitleInput.getAttribute("maxlength");
  if (maxAttr) {
    const max = parseInt(maxAttr, 10);
    // Step 2: Enter text equal to max allowed length and verify text length
    const okText = "A".repeat(max);
    await matterPage.fillCaseTitle(okText);
    expect((await matterPage.caseTitleInput.inputValue()).length).toBe(max);

    // Step 3: Attempt entering text exceeding max length and verify input truncation
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
  // Step 1: Fill partial title into case title input
  await matterPage.fillCaseTitle("Partial Title Only");

  // Step 2: Click 'Save for Later' button
  const saved = await matterPage.clickSaveForLater();

  // Step 3: Verify redirect to matters list/grid page after saving draft
  if (saved) {
    await expect(matterPage.page).toHaveURL(/.*(matters|grid|list).*/i);
  }
});

test("TC-11. Enter only Case Number", async () => {
  if ((await matterPage.caseNumberInput.count()) === 0) test.skip();
  // Step 1: Enter valid case number
  await matterPage.fillCaseNumber(defaultMatter.caseNumber);
  // Step 2: Verify case number field is valid
  await expect(matterPage.caseNumberInput).not.toHaveClass(/ng-invalid/);
});

test("TC-12. Clear entered data", async () => {
  // Step 1: Enter temporary title text
  await matterPage.fillCaseTitle("To be cleared");
  // Step 2: Clear entered case title text
  await matterPage.clearCaseTitle();
  // Step 3: Verify case title input is empty
  expect(await matterPage.caseTitleInput.inputValue()).toBe("");
});

test("TC-13. Save draft with mandatory only", async () => {
  // Step 1: Fill mandatory case title field
  await matterPage.fillCaseTitle("Mandatory Only Title");

  // Step 2: Click 'Save for Later' button
  await matterPage.clickSaveForLater();

  // Step 3: Verify current creation page URL state
  await expect(matterPage.page).toHaveURL(/matter\/legalmatter\/create/);
});

test("TC-14. Validate Save & Next button state", async () => {
  // Step 1: Verify save button is initially disabled
  await expect(matterPage.matterSaveButton).toBeDisabled();

  // Step 2: Fill valid case title and remove focus
  await matterPage.fillCaseTitle(defaultMatter.title);
  await matterPage.caseTitleInput.blur();

  // Step 3: Verify save button becomes enabled
  await expect(matterPage.matterSaveButton).toBeEnabled();
});

test("TC-15. Validate Created Date default and modify Created Date", async () => {
  if ((await matterPage.createdDateInput.count()) === 0) test.skip();
  // Step 1: Verify default value of created date field
  const defaultVal = await matterPage.createdDateInput.inputValue();
  expect(defaultVal).not.toBeNull();

  // Step 2: Enter new created date value
  await matterPage.fillCreatedDate("2025-01-01");

  // Step 3: Verify created date input updated properly
  expect(
    (await matterPage.createdDateInput.inputValue()).length,
  ).toBeGreaterThan(0);
});

test("TC-16. Validate Date of Filing optional and > Created Date", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify Date of Filing and Created Date inputs are visible
  await expect(matterPage.dateOfFilingInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 3: Enter Created Date and Date of Filing values
  await matterPage.fillCreatedDate("2025-01-01");
  await matterPage.fillDateOfFiling("2026-01-01");

  // Step 4: Verify Date of Filing date value is greater than Created Date value
  const created = await matterPage.createdDateInput.inputValue();
  const filed = await matterPage.dateOfFilingInput.inputValue();

  expect(new Date(filed).getTime()).toBeGreaterThan(
    new Date(created).getTime(),
  );
});

test("TC-17. Validate Description field is visible and responsive", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify description input is visible
  await expect(matterPage.descriptionInput).toBeVisible();

  // Step 3: Enter text into description input field
  await matterPage.fillDescription("Test description");

  // Step 4: Verify description input contains the entered text
  await expect(matterPage.descriptionInput).toHaveValue("Test description");
});

test("TC-18. Verify Case Type can be selected", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Select 'Civil Law' from Case Type dropdown
  await matterPage.selectCaseType("Civil Law");

  // Step 3: Verify selected Case Type value
  await expect(matterPage.caseTypeDropdown).toHaveValue("Civil Law");
});

test("TC-19. Validate Court field", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify court input field is visible
  await expect(matterPage.courtInput).toBeVisible();

  // Step 3: Enter court name into input field
  await matterPage.fillCourt(defaultMatter.court);

  // Step 4: Verify court input contains the entered value
  await expect(matterPage.courtInput).toHaveValue(defaultMatter.court);
});

test("TC-20. Validate Judge field", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify judges input field is visible
  await expect(matterPage.judgesInput).toBeVisible();

  // Step 3: Fill judge name into judges input
  await matterPage.judgesInput.fill(defaultMatter.judge);

  // Step 4: Verify judges input field contains entered value
  await expect(matterPage.judgesInput).toHaveValue(defaultMatter.judge);
});

test("TC-21. Validate Priority Heading", async () => {
  // Step 1: Click additional details section
  await matterPage.additionalDetails.click();

  // Step 2: Verify Priority section heading text is visible
  await expect(matterPage.priorityText).toBeVisible();
});

test("TC-22. Validate priority buttons visibility, appearance, and responsive behavior", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  if ((await matterPage.priorityButtons.count()) === 0) {
    test.skip("Priority buttons not present");
  }

  const expectedLabels = ["High", "Medium", "Low"];

  // Step 2: Iterate and verify visibility, enablement, and labels for High, Medium, Low buttons
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

  // Step 3: Verify selected priority control element state
  const selectedControl = matterPage.page.locator(
    '[role="tab"][aria-selected="true"], button[aria-pressed="true"], button.active, button[class*="active"], button[class*="selected"]',
  );

  if ((await selectedControl.count()) > 0) {
    await expect(selectedControl.first()).toBeVisible();
  }
});

test("TC-23. Verify Priority section is displayed", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify Priority section elements are displayed
  await matterPage.verifyPrioritySectionVisible();
});

test("TC-24. Verify High priority is selected by default", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify 'High' priority option is selected by default
  await matterPage.verifyPrioritySelected("High");
});

test("TC-25. Verify Medium priority can be selected", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Select 'Medium' priority option
  await matterPage.selectPriorityButton("Medium");

  // Step 3: Verify 'Medium' priority option is selected
  await matterPage.verifyPrioritySelected("Medium");
});

test("TC-26. Verify Low priority can be selected", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Select 'Low' priority option
  await matterPage.selectPriorityButton("Low");

  // Step 3: Verify 'Low' priority option is selected
  await matterPage.verifyPrioritySelected("Low");
});

test("TC-27. Verify only one priority can be selected at a time", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Select 'Medium' priority and verify selection
  await matterPage.selectPriorityButton("Medium");
  await matterPage.verifyPrioritySelected("Medium");

  // Step 3: Select 'Low' priority option
  await matterPage.selectPriorityButton("Low");

  // Step 4: Verify 'Low' priority is selected and 'Medium' priority is deselected
  await matterPage.verifyPrioritySelected("Low");
  await matterPage.verifyPriorityNotSelected("Medium");
});

test("TC-28. Verify priority options are in correct order", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify priority buttons sequence order (High -> Medium -> Low)
  await matterPage.verifyPriorityOptionsOrder();
});

test("TC-29. Verify priority buttons are clickable", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  const priorities = ["High", "Medium", "Low"];

  // Step 2: Iterate through all priority buttons, checking visibility, state, and clickability
  for (const priority of priorities) {
    const button = matterPage.getPriorityButton(priority);

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await matterPage.selectPriorityButton(priority);
  }
});

test("TC-30. Verify Status section is displayed", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify status section elements are visible
  await matterPage.verifyStatusSectionVisible();
});

test("TC-31. Verify Status options are displayed in correct order", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify status buttons order in the section
  await matterPage.verifyStatusOrder();
});

test("TC-32. Verify all Status options are enabled", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify all status options buttons are enabled for interaction
  await matterPage.verifyStatusButtonsEnabled();
});

test("TC-33. Verify Active Status is selected by default", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify default status option is set to 'Active'
  await matterPage.verifyDefaultStatus();
});

test("TC-34. Verify Pending Status can be selected", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Select 'Pending' status button
  await matterPage.selectStatusButton("Pending");

  // Step 3: Verify 'Pending' status is selected
  await matterPage.verifyStatusSelected("Pending");
});

test("TC-35. Verify Active Status can be selected", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Switch to 'Pending' status
  await matterPage.selectStatusButton("Pending");

  // Step 3: Switch back to 'Active' status
  await matterPage.selectStatusButton("Active");

  // Step 4: Verify 'Active' status is currently selected
  await matterPage.verifyStatusSelected("Active");
});

test("TC-36. Verify only one Status can be selected at a time", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Select 'Pending' status and verify 'Active' is not selected
  await matterPage.selectStatusButton("Pending");
  await matterPage.verifyStatusSelected("Pending");
  await matterPage.verifyStatusNotSelected("Active");

  // Step 3: Select 'Active' status and verify 'Pending' is not selected
  await matterPage.selectStatusButton("Active");
  await matterPage.verifyStatusSelected("Active");
  await matterPage.verifyStatusNotSelected("Pending");
});

test("TC-37. Verify Status can be changed from Active to Pending", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify initial selection is 'Active'
  await matterPage.verifyStatusSelected("Active");

  // Step 3: Change status to 'Pending'
  await matterPage.selectStatusButton("Pending");

  // Step 4: Verify status updated to 'Pending' and 'Active' is deselected
  await matterPage.verifyStatusSelected("Pending");
  await matterPage.verifyStatusNotSelected("Active");
});

test("TC-38. Verify Status can be changed from Pending to Active", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Change status to 'Pending' and verify selection
  await matterPage.selectStatusButton("Pending");
  await matterPage.verifyStatusSelected("Pending");

  // Step 3: Switch status back to 'Active'
  await matterPage.selectStatusButton("Active");

  // Step 4: Verify status updated to 'Active' and 'Pending' is deselected
  await matterPage.verifyStatusSelected("Active");
  await matterPage.verifyStatusNotSelected("Pending");
});

test("TC-39. Verify Status options are clickable", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  const statuses = ["Active", "Pending"];

  // Step 2: Click each status button sequentially and verify selection status
  for (const status of statuses) {
    await matterPage.selectStatusButton(status);
    await matterPage.verifyStatusSelected(status);
  }
});

test("TC-40. Verify Tags section is displayed", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify Tags section elements are displayed
  await matterPage.verifyTagsSectionVisible();
});

test("TC-41. Verify Tags input and ADD button are enabled", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify tag input field and 'ADD' button are enabled
  await matterPage.verifyTagsInputEnabled();
});

test("TC-42. Verify Tags input has correct placeholder", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify tag input placeholder attribute text
  await expect(matterPage.tagInput).toHaveAttribute(
    "placeholder",
    "Type to add Matter Tag(s)",
  );
});

test("TC-43. Verify ADD button is displayed with correct text", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify button label displays 'ADD'
  await expect(matterPage.addTagButton).toHaveText("ADD");
});

test("TC-44. Verify user can enter a tag", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Enter tag text into the input field
  await matterPage.enterTag("TestTag");

  // Step 3: Verify entered tag text inside input
  await matterPage.verifyTagInputValue("TestTag");
});

test("TC-45. Verify user can add a tag", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Add a new tag using method
  await matterPage.addTag("TestTag");

  // Step 3: Verify newly added tag is rendered in the list
  await matterPage.verifyTagDisplayed("TestTag");
});

test("TC-46. Verify user can add a tag with spaces", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Add tag containing spaces
  await matterPage.addTag("Matter Tag");

  // Step 3: Verify tag with spaces is added and rendered properly
  await matterPage.verifyTagDisplayed("Matter Tag");
});

test("TC-47. Verify user can add another tag", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Add tag 'Legal'
  await matterPage.addTag("Legal");

  // Step 3: Verify added tag is displayed
  await matterPage.verifyTagDisplayed("Legal");
});

test("TC-48. Verify tag input is cleared after adding tag", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Enter tag text
  await matterPage.enterTag("TestTag");

  // Step 3: Click 'ADD' button to submit tag
  await matterPage.clickAddTag();

  // Step 4: Verify tag input field is cleared
  await matterPage.verifyTagInputIsEmpty();
});

test("TC-49. Verify multiple tags can be added", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Add first tag 'TagOne'
  await matterPage.addTag("TagOne");

  // Step 3: Add second tag 'TagTwo'
  await matterPage.addTag("TagTwo");

  // Step 4: Verify both tags are present in the list
  await matterPage.verifyTagDisplayed("TagOne");
  await matterPage.verifyTagDisplayed("TagTwo");
});

test("TC-50. Verify tag is added only after clicking ADD", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Enter tag text into field
  await matterPage.enterTag("TestTag");

  // Step 3: Confirm tag text is still in input field before adding
  await matterPage.verifyTagInputValue("TestTag");

  // Step 4: Click 'ADD' button
  await matterPage.clickAddTag();

  // Step 5: Verify tag is added to the tag list
  await matterPage.verifyTagDisplayed("TestTag");
});

test("TC-51. Verify empty tag cannot be added", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Ensure tag input is empty
  await matterPage.verifyTagInputIsEmpty();

  // Step 3: Click 'ADD' button with empty input
  await matterPage.clickAddTag();

  // Step 4: Verify input field remains empty and no tag is added
  await matterPage.verifyTagInputIsEmpty();
});

test("TC-52. Verify tag can be changed before clicking ADD", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Enter initial tag text
  await matterPage.enterTag("FirstTag");

  // Step 3: Overwrite input with new tag text
  await matterPage.enterTag("SecondTag");

  // Step 4: Verify tag input value updated
  await matterPage.verifyTagInputValue("SecondTag");

  // Step 5: Click 'ADD' button
  await matterPage.clickAddTag();

  // Step 6: Verify second tag is added
  await matterPage.verifyTagDisplayed("SecondTag");
});

test("TC-53. Verify Opponent Advocate(s) heading is visible", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify Opponent Advocate section header visibility
  await matterPage.verifyOpponentAdvocateHeadingVisible();
});

test("TC-54. Verify Add Opponent Advocate button is visible", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify 'Add Opponent Advocate' button is visible
  await matterPage.verifyAddOpponentAdvocateButtonVisible();
});

test("TC-55. Verify Add Opponent Advocate button is enabled", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify 'Add Opponent Advocate' button is enabled
  await matterPage.verifyAddOpponentAdvocateButtonEnabled();
});

test("TC-56. Verify Add Opponent Advocate button is clickable", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();
});

test("TC-57. Verify Add button displays Opponent Advocate fields", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Verify Name, Email, and Phone input fields are visible
  await expect(matterPage.opponentAdvocateNameInput).toBeVisible();
  await expect(matterPage.opponentAdvocateEmailInput).toBeVisible();
  await expect(matterPage.opponentAdvocatePhoneInput).toBeVisible();
});

test("TC-58. Verify Opponent Advocate section is displayed", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify Opponent Advocate section container is displayed
  await matterPage.verifyOpponentAdvocateSectionVisible();
});

test("TC-59. Verify Opponent Advocate fields are enabled", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify Opponent Advocate form input fields are enabled
  await matterPage.verifyOpponentAdvocateFieldsEnabled();
});

test("TC-60. Verify Name field placeholder", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Verify Name field placeholder text
  await expect(matterPage.opponentAdvocateNameInput).toHaveAttribute(
    "placeholder",
    "Name",
  );
});

test("TC-61. Verify Email Address field placeholder", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Verify Email field placeholder text
  await expect(matterPage.opponentAdvocateEmailInput).toHaveAttribute(
    "placeholder",
    "Email Address",
  );
});

test("TC-62. Verify Phone Number field placeholder", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Verify Phone Number field placeholder text
  await expect(matterPage.opponentAdvocatePhoneInput).toHaveAttribute(
    "placeholder",
    "Phone Number",
  );
});

test("TC-63. Verify user can enter Opponent Advocate name", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Enter advocate name into input field
  await matterPage.enterOpponentAdvocateName("John Smith");

  // Step 4: Verify advocate name input value
  await expect(matterPage.opponentAdvocateNameInput).toHaveValue("John Smith");
});

test("TC-64. Verify user can enter Opponent Advocate email", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Enter advocate email address
  await matterPage.enterOpponentAdvocateEmail("john.smith@example.com");

  // Step 4: Verify advocate email input value
  await expect(matterPage.opponentAdvocateEmailInput).toHaveValue(
    "john.smith@example.com",
  );
});

test("TC-65. Verify user can enter Opponent Advocate phone number", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Enter advocate phone number
  await matterPage.enterOpponentAdvocatePhone("9876543210");

  // Step 4: Verify advocate phone input value
  await expect(matterPage.opponentAdvocatePhoneInput).toHaveValue("9876543210");
});

test("TC-66. Verify user can enter complete Opponent Advocate details", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Click 'Add Opponent Advocate' button
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Fill full details (Name, Email, Phone) for Opponent Advocate
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
});

test("TC-67. Verify entered Opponent Advocate details are retained", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Open Opponent Advocate creation form
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Fill Opponent Advocate details
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543310",
  );

  // Step 4: Click Save button to persist details
  await matterPage.clickSave();

  // Step 5: Verify advocate details are preserved after saving
  await matterPage.verifySavedOpponentAdvocateDetails("John Smith");
});

test("TC-68. Verify Cancel button closes Opponent Advocate section", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Open Opponent Advocate form
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Click Cancel button
  await matterPage.clickCancel();

  // Step 4: Verify Opponent Advocate form inputs are no longer visible
  await expect(matterPage.opponentAdvocateNameInput).not.toBeVisible();
});

test("TC-69. Verify Cancel closes Opponent Advocate details", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Open Opponent Advocate form
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Enter Opponent Advocate details
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  // Step 4: Confirm inputs are currently visible
  await expect(matterPage.opponentAdvocateNameInput).toBeVisible();
  await expect(matterPage.opponentAdvocateEmailInput).toBeVisible();
  await expect(matterPage.opponentAdvocatePhoneInput).toBeVisible();

  // Step 5: Click Cancel button to dismiss form
  await matterPage.clickCancel();
});

test("TC-70. Verify Opponent Advocate details can be saved", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Open Opponent Advocate form
  await matterPage.clickAddOpponentAdvocate();

  // Step 3: Enter Opponent Advocate details
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  // Step 4: Save Opponent Advocate entry
  await matterPage.clickSave();

  // Step 5: Verify saved details display correctly
  await matterPage.verifySavedOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
});

test("TC-71. Verify Save closes Opponent Advocate form", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Open Opponent Advocate form and enter details
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );

  // Step 3: Save Opponent Advocate entry
  await matterPage.clickSave();

  // Step 4: Verify input form closes after saving
  await expect(matterPage.opponentAdvocateNameInput).not.toBeVisible();
});

test("TC-72. Verify Opponent Lawyer Edit Button is Visible and Responsive", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Open form, fill advocate details, and save
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
  await matterPage.clickSave();

  // Step 3: Verify edit button for Opponent Lawyer is visible and enabled
  await expect(matterPage.opponentAdvocateEditBtn).toBeVisible();
  await expect(matterPage.opponentAdvocateEditBtn).toBeEnabled();
});

test("TC-73. Verify Opponent Lawyer Details are Editable", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Add initial Opponent Advocate details and save
  await matterPage.clickAddOpponentAdvocate();
  await matterPage.enterOpponentAdvocateDetails(
    "John Smith",
    "john.smith@example.com",
    "9876543210",
  );
  await matterPage.clickSave();

  // Step 3: Verify initial saved advocate name displays
  await expect(
    matterPage.page.getByText("John Smith", {
      exact: true,
    }),
  ).toBeVisible();

  // Step 4: Click edit button to modify advocate details
  await matterPage.clickOpponentAdvocateEdit.click();
  await matterPage.clearOpponentAdvocateDetails();
  await matterPage.enterOpponentAdvocateDetails(
    "Randy Ortan",
    "randy@example.com",
    "9944574331",
  );

  // Step 5: Save updated details and verify new advocate info displays
  await matterPage.clickSave();
  await matterPage.verifySavedOpponentAdvocateDetails(
    "Randy Ortan",
    "randy@example.com",
    "9944574331",
  );
});

test("TC-74. Verify Show Less Details is clickable", async () => {
  // Step 1: Expand additional details section
  await matterPage.clickAdditionalDetails();

  // Step 2: Verify 'Show Less Details' toggle button is visible and enabled
  await expect(matterPage.showLessDetails).toBeVisible();
  await expect(matterPage.showLessDetails).toBeEnabled();

  // Step 3: Click 'Show Less Details' toggle
  await matterPage.clickShowLessDetails();
});

test("TC-75. Create Legal Matter 1st Page Save For Later", async () => {
  const data = matterData.TC75_CreateLegalMatterSaveForLater;

  // Step 1: Verify all basic details input fields are visible
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill case title and case number fields
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Confirm input field values match test data
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Retrieve auto-generated matter number and click 'Save for Later'
  const matterNumber = await matterPage.matterNumberInput.inputValue();
  await matterPage.clickSaveForLater();

  // Step 5: Verify saved matter row appears in table listing
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
});
test("TC-76. Create Legal Matter 1st Page Save and Next Select Client 2nd SFL", async ({}) => {
  const data = matterData1.TC76_CreateLegalMatterSelectClient;

  // Step 1: Verify basic details input fields visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill case title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Validate input field values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Click 'Save and Next' button to proceed to Client step
  await matterPage.clickSaveAndNext();

  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);

  await matterPage.verifySelectedClient(data.client.name);

  await matterPage.clickSaveForLater();

  // Step 8: Verify created matter row and associated client display in list view
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(
    matterPage.page.getByText(data.client.name, { exact: true }).first(),
  ).toBeVisible({
    timeout: 30000,
  });
});

test("TC-77 - Create Legal Matter 1st Page Save and Next Select Client Save & Next Upload Documents", async () => {
  const data = matterData1.TC77_CreateLegalMatterSaveNextX2Documents;

  // Step 1: Verify basic form field visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic matter details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Verify basic details field values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Get generated matter number and proceed to Client step
  const matterNumber = await matterPage.matterNumberInput.inputValue();
  await matterPage.clickSaveAndNext();

  // Step 5: Search, select, and verify client selection
  // Step 5: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 6: Proceed to Documents section
  await matterPage.clickSaveAndNext();
  // await matterPage.verifyDocumentsSectionVisible();

  // Step 7: Upload document file and verify upload success
  await matterPage.uploadDocument(data.document.filePath);
  await matterPage.verifyUploadedDocument(data.document.fileName);

  // Step 8: Click Final Save button
  await matterPage.clickFinalSave();

  // Step 9: Verify created matter and client in view listing
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

test.only("TC-78. Create Legal Matter and Additional Details 1st SFL", async () => {
  const data = matterData1.TC78_CreateMatterWithAdditionalDetails;

  // Step 1: Verify basic input fields visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Verify basic inputs
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Save matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Open additional details and fill optional form fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Add tag and verify display
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  // Step 7: Select priority option and verify
  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  // Step 8: Select status option and verify
  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 9: Add Opponent Advocate details and save
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

  // Step 10: Click 'Save for Later' button
  await matterPage.clickSaveForLater();

  // Step 11: Verify matter row displays in listing view
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test("TC-79. Create Legal Matter with Additional Details, select Client and Save for Later", async () => {
  const data = matterData1.TC79_CreateMatterWithAdditionalDetailsAndClient;

  // Step 1: Verify first page basic details input fields visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill case title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Confirm case title and case number input values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Save matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Expand additional details section and enter fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Set tag, priority, and status options
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Click 'Save & Next' to move to Client section
  const movedToClientSelection = await matterPage.clickSaveAndNext();
  expect(movedToClientSelection).toBe(true);

  // Step 8: Search, select, and verify client
  // Step 8: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 9: Save for Later
  await matterPage.clickSaveForLater();

  // Step 10: Verify created matter row title
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // Step 11: Verify matter number text in listing
  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  // Step 12: Verify client name in listing view
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

  // Step 1: Verify first page basic details fields visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Assert basic details field values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Get generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Expand and fill additional details fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tags, priority, and status
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Proceed to Client selection section
  const movedToClientSelection = await matterPage.clickSaveAndNext();
  expect(movedToClientSelection).toBe(true);

  // Step 8: Search and select client
  // Step 8: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 9: Proceed to Documents section and verify visibility
  await matterPage.clickSaveAndNext();
  // await matterPage.verifyDocumentsSectionVisible();

  // Step 10: Upload multiple documents
  await matterPage.uploadDocuments(uploadFiles);

  // Step 11: Verify uploaded documents listed
  for (const file of uploadFiles) {
    const fileName = file.split("/").pop();
    await matterPage.verifyUploadedDocument(fileName);
  }

  // Step 12: Perform final save
  await matterPage.clickFinalSave();

  // Step 13: Verify created matter appears in listing page
  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // Step 14: Verify client name and matter number in listing page
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

  // Step 1: Check basic input visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Validate basic inputs
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Click 'Save & Next' to move to Client step
  await matterPage.clickSaveAndNext();

  // Step 5: Search and select client
  // Step 5: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 6: Save for Later
  await matterPage.clickSaveForLater();

  // Step 7: Verify matter row and client display in listing table
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

  // Step 1: Verify initial step inputs visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Enter title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Validate values entered
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Store generated matter number and proceed
  const matterNumber = await matterPage.matterNumberInput.inputValue();
  await matterPage.clickSaveAndNext();

  // Step 5: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 6: Proceed to Documents section
  await matterPage.clickSaveAndNext();
  // await matterPage.verifyDocumentsSectionVisible();

  // Step 7: Upload document and verify uploaded file
  await matterPage.uploadDocument(data.document.filePath);
  await matterPage.verifyUploadedDocument(data.document.fileName);

  // Step 8: Perform final save
  await matterPage.clickFinalSave();

  // Step 9: Verify created matter and client presence in listing view
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

  // Step 1: Verify basic form elements visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill case title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Confirm field values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Get generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Open additional details and fill optional form fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tag, priority, and status
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Add Opponent Advocate details and save
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

  // Step 8: Click 'Save for Later' button
  await matterPage.clickSaveForLater();

  // Step 9: Verify created matter row in listing
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test("TC-84. Create Legal Matter with Additional Details, select Client and Save for Later", async () => {
  const data =
    matterData1.TC84_CreateMatterWithAdditionalDetailsAndClient_SoloLawyer;

  // Step 1: Verify first page basic details field visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Assert basic details field values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Store generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Fill additional details fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tag, priority, and status
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Click 'Save & Next' to move to Client step
  const movedToClientSelection = await matterPage.clickSaveAndNext();
  expect(movedToClientSelection).toBe(true);

  // Step 8: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 9: Save for Later
  await matterPage.clickSaveForLater();

  // Step 10: Verify created matter row title displays
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // Step 11: Verify matter number text in listing
  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  // Step 12: Verify client name in listing view
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

  // Step 1: Verify first page basic details input visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Assert entered values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Get generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Fill additional details fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tag, priority, and status
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Proceed to Client selection step
  const movedToClientSelection = await matterPage.clickSaveAndNext();
  expect(movedToClientSelection).toBe(true);

  // Step 8: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 9: Proceed to Documents section
  await matterPage.clickSaveAndNext();
  // await matterPage.verifyDocumentsSectionVisible();

  // Step 10: Upload multiple documents
  await matterPage.uploadDocuments(uploadFiles);

  // Step 11: Verify uploaded documents listed
  for (const file of uploadFiles) {
    const fileName = file.split("/").pop();
    await matterPage.verifyUploadedDocument(fileName);
  }

  // Step 12: Click Final Save button
  await matterPage.clickFinalSave();

  // Step 13: Verify created matter row title
  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // Step 14: Verify client presence and matter number in listing view
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

test("TC-86. Solo Create Legal Matter 1st Page Save and Next Select Client 2nd SFL", async () => {
  const data = matterData1.TC86_CreateLegalMatterSelectClient_Corporate;

  // Step 1: Check basic input field visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Verify field values match input
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Click 'Save & Next' button
  await matterPage.clickSaveAndNext();

  // Step 5: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 6: Save for Later
  await matterPage.clickSaveForLater();

  // Step 7: Verify matter row and selected client in table listing
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

test("TC-87 - Solo Create Legal Matter 1st Page Save and Next Select Client Save & Next Upload Documents", async () => {
  const data = matterData1.TC87_CreateLegalMatterSaveNextX2Documents_Corporate;

  // Step 1: Verify basic details input visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill case title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Validate values entered
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Store generated matter number and proceed
  const matterNumber = await matterPage.matterNumberInput.inputValue();
  await matterPage.clickSaveAndNext();

  // Step 5: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 6: Proceed to Documents section
  await matterPage.clickSaveAndNext();
  // await matterPage.verifyDocumentsSectionVisible();

  // Step 7: Upload document file and verify upload status
  await matterPage.uploadDocument(data.document.filePath);
  await matterPage.verifyUploadedDocument(data.document.fileName);

  // Step 8: Click Final Save button
  await matterPage.clickFinalSave();

  // Step 9: Verify created matter row and client presence in listing table
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

test("TC-88. Create Legal Matter and Additional Details 1st SFL", async () => {
  const data = matterData1.TC88_CreateMatterWithAdditionalDetails_Corporate;

  // Step 1: Check basic input field visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill title and case number
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Verify inputs contain entered values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Get generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Expand additional details section and fill optional form fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tag, priority, and status options
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Add Opponent Advocate details and save
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

  // Step 8: Click 'Save for Later' button
  await matterPage.clickSaveForLater();

  // Step 9: Verify created matter row appears in table view
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible();
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );
});

test("TC-89. Create Legal Matter with Additional Details, select Client and Save for Later", async () => {
  const data =
    matterData1.TC89_CreateMatterWithAdditionalDetailsAndClient_Corporate;

  // Step 1: Verify first page basic details fields visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Assert basic details values
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Store generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Expand additional details and fill optional fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tag, priority, and status
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Click 'Save & Next' to navigate to Client step
  const movedToClientSelection = await matterPage.clickSaveAndNext();
  expect(movedToClientSelection).toBe(true);

  // Step 8: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 9: Save for Later
  await matterPage.clickSaveForLater();

  // Step 10: Verify created matter row title
  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // Step 11: Verify matter number text in listing table
  if (matterNumber) {
    await expect(
      matterPage.page.getByText(matterNumber, {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  // Step 12: Verify client name in listing view
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

test("TC-90. Create Legal Matter with Additional Details, Client and Upload Documents", async () => {
  const data = matterData1.TC90_CreateLegalMatter_with_allFields_Corporate;

  const uploadFiles = data.document.multiUploadFiles || [
    data.document.filePath,
  ];

  // Step 1: Verify first page basic details fields visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Assert field values entered
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Store generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Fill additional details fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tag, priority, and status
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Click 'Save & Next' to move to Client step
  const movedToClientSelection = await matterPage.clickSaveAndNext();
  expect(movedToClientSelection).toBe(true);

  // Step 8: Search and select client
  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // Step 9: Proceed to Documents section
  await matterPage.clickSaveAndNext();
  // await matterPage.verifyDocumentsSectionVisible();

  // Step 10: Upload multiple document files
  await matterPage.uploadDocuments(uploadFiles);

  // Step 11: Verify uploaded document files listed
  for (const file of uploadFiles) {
    const fileName = file.split("/").pop();
    await matterPage.verifyUploadedDocument(fileName);
  }

  // Step 12: Click Final Save button
  await matterPage.clickFinalSave();

  // Step 13: Verify created matter row title displays
  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // Step 14: Verify client presence and matter number in listing table
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

test("TC-91. Create Legal Matter with Additional Details, Multiple Clients and Upload Documents", async () => {
  const data =
    matterData1.TC91_CreateLegalMatter_with_allFields_Multiple_Client;

  const uploadFiles = data.document.multiUploadFiles || [
    data.document.filePath,
  ];

  // Step 1: Verify first page basic details fields visibility
  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // Step 2: Fill basic details
  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // Step 3: Assert field values entered
  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // Step 4: Store generated matter number
  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // Step 5: Fill additional details fields
  await matterPage.clickAdditionalDetails();
  await matterPage.fillDateOfFiling(data.dateOfFiling);
  await matterPage.fillDescription(data.description);
  await matterPage.selectCaseType(data.caseType);
  await matterPage.fillCourt(data.court);
  await matterPage.fillJudge(data.judge);

  // Step 6: Configure tag, priority, and status
  await matterPage.addTag(data.tag);
  await matterPage.verifyTagDisplayed(data.tag);

  await matterPage.selectPriorityButton(data.priority);
  await matterPage.verifyPrioritySelected(data.priority);

  await matterPage.selectStatusButton(data.status);
  await matterPage.verifyStatusSelected(data.status);

  // Step 7: Click 'Save & Next' to move to Client step
  const movedToClientSelection = await matterPage.clickSaveAndNext();
  expect(movedToClientSelection).toBe(true);

  // Step 8: Search and select multiple clients
  for (const client of data.clients) {
    await matterPage.enterClientName(client.name);
    await matterPage.selectClient(client.name);
    await matterPage.verifySelectedClient(client.name);
  }

  // Step 9: Verify all selected clients are displayed
  for (const client of data.clients) {
    await matterPage.verifyClientAddedToList(client.name);
  }

  // Step 10: Proceed to Documents section
  await matterPage.clickSaveAndNext();

  // Step 11: Upload multiple document files
  await matterPage.uploadDocuments(uploadFiles);

  // Step 12: Verify uploaded document files listed
  for (const file of uploadFiles) {
    const fileName = file.split("/").pop();
    await matterPage.verifyUploadedDocument(fileName);
  }

  // Step 13: Click Final Save button
  await matterPage.clickFinalSave();

  // Step 14: Verify created matter row title displays
  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toBeVisible({
    timeout: 30000,
  });

  await expect(matterPage.matterRowByTitle(data.caseTitle)).toHaveText(
    data.caseTitle,
  );

  // Step 15: Verify all clients presence and matter number in listing table
  for (const client of data.clients) {
    await matterPage.verifyClientPresentInListing(client.name, data.caseTitle);
  }

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

test.only("TC-92 - Create Legal Matter 1st Page Save and Next Select Client Save & Next Upload Documents Edit Document", async () => {
  const data = matterData1.TC92_CreateLegalMatterSaveNextX2Documents;

  // STEP 1 - Verify basic Matter fields

  await expect(matterPage.caseTitleInput).toBeVisible();
  await expect(matterPage.caseNumberInput).toBeVisible();
  await expect(matterPage.matterNumberInput).toBeVisible();
  await expect(matterPage.createdDateInput).toBeVisible();

  // STEP 2 - Enter Matter details

  await matterPage.fillCaseTitle(data.caseTitle);
  await matterPage.fillCaseNumber(data.caseNumber);

  // STEP 3 - Verify Matter details

  await expect(matterPage.caseTitleInput).toHaveValue(data.caseTitle);
  await expect(matterPage.caseNumberInput).toHaveValue(data.caseNumber);

  // STEP 4 - Store generated Matter Number

  const matterNumber = await matterPage.matterNumberInput.inputValue();

  // STEP 5 - Save & Next -> Client

  await matterPage.clickSaveAndNext();

  // STEP 6 - Search and select Client

  await matterPage.enterClientName(data.client.name);
  await matterPage.selectClient(data.client.name);
  await matterPage.verifySelectedClient(data.client.name);

  // STEP 7 - Save & Next -> Documents

  await matterPage.clickSaveAndNext();

  // STEP 8 - Upload Document

  await matterPage.uploadDocument(data.document.filePath);
  await matterPage.verifyUploadedDocument(data.document.fileName);

  // STEP 9 - Click Edit Metadata

  await matterPage.clickDocumentEdit(data.document.fileName);

  // STEP 10 - Edit Document Name

  await matterPage.fillDocumentName(data.document.updatedDocumentName);
  await expect(matterPage.documentNameInput).toHaveValue(
    data.document.updatedDocumentName,
  );

  // STEP 11 - Edit Description

  await matterPage.editDocumentDescription(data.document.updatedDescription);
  await expect(matterPage.documentDescriptionInput).toHaveValue(
    data.document.updatedDescription,
  );

  // STEP 12 - Expiration Date

  // Clear existing date first
  await matterPage.documentExpirationDateInput.clear();
  await matterPage.editDocumentExpirationDate(data.document.expirationDate);

  // Verify the date was set correctly - handle the format that the application actually displays
  await matterPage.verifyDocumentExpirationDate(data.document.expirationDate);

  // STEP 13 - Enable / Disable Encryption

  if (data.document.encryption === true) {
    await matterPage.enableDocumentEncryption();
    await expect(matterPage.documentEncryptionToggle).toHaveClass(
      /toggle-switch active/,
    );
  } else {
    await matterPage.disableDocumentEncryption();
    await expect(matterPage.documentEncryptionToggle).not.toHaveClass(/active/);
  }

  // STEP 14 - Enable / Disable Download

  if (data.document.download === true) {
    await matterPage.enableDocumentDownload();
    await expect(matterPage.documentDownloadToggle).toHaveClass(
      /toggle-switch active/,
    );
  } else {
    await matterPage.disableDocumentDownload();
    await expect(matterPage.documentDownloadToggle).not.toHaveClass(/active/);
  }

  // STEP 15 - Add Tags

  for (let i = 0; i < data.document.tags.length; i++) {
    await matterPage.addDocumentTag(data.document.tags[i], i);
  }

  // STEP 16 - Save Document Changes

  await matterPage.saveDocumentChanges();

  // STEP 17 - Verify Updated Document

  await expect(
    matterPage.page.getByText(data.document.updatedDocumentName, {
      exact: true,
    }),
  ).toBeVisible({
    timeout: 30000,
  });

  // STEP 18 - Final Save Matter

  await matterPage.clickFinalSave();

  // STEP 19 - Verify Matter Created

  await matterPage.verifyMatterCreatedInView(data.caseTitle);

  // STEP 20 - Verify Client in Listing

  await matterPage.verifyClientPresentInListing(
    data.client.name,
    data.caseTitle,
  );

  // STEP 21 - Verify Matter Row

  const matterRow = matterPage.matterRowByTitle(data.caseTitle);
  await expect(matterRow).toBeVisible({
    timeout: 30000,
  });
  await expect(matterRow).toContainText(data.caseTitle);
});
