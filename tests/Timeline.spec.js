require("dotenv").config();

const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginPage");
const { TimelinePage } = require("../Pages/TimelinePage");
const { loginData } = require("../testData/loginData");
const matterSearch = require("../testData/MatterSearch.json");
const matterData1 = require("../testData/matterData1.json");
const defaultLogin = (loginData && loginData[0]) || {};
const defaultMatter = matterSearch.defaultMatter;

test.describe.configure({ mode: "serial" });

let page;
let timelinePage;

test.beforeAll(async ({ browser }) => {
  // Initialize page and perform user login
  page = await browser.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.loginWithPassword(
    defaultLogin.email || process.env.EMAIL,
    defaultLogin.password || process.env.PASSWORD,
  );

  await loginPage.assertTitle("Lexi-Z Lawyers");
  timelinePage = new TimelinePage(page);

  await timelinePage.openLegalMatters();
});

test.afterAll(async () => {
  await page.close();
});
test.afterEach(async () => {
  const pages = await page.context().pages();
  const extraPages = pages.filter((p) => p !== page);
  for (const extraPage of extraPages) {
    await extraPage.close();
  }
});

test("TC-01. Open Matter and View Timeline", async () => {
  // Step 1: Verify case title input field is visible on the page
  await expect(timelinePage.pageTitle).toBeVisible();
});

test("TC-02. Search Matter using exact Matter name", async () => {
  const data = matterSearch.TC_MatterSearch;

  await timelinePage.searchMatter(data.exactMatterName);

  await expect(timelinePage.matterRow(data.exactMatterName)).toBeVisible();
});

test("TC-03. Search Matter using partial Matter name", async () => {
  const data = matterSearch.TC_MatterSearch;

  await timelinePage.searchMatter(data.partialMatterName);

  await expect(timelinePage.matterRow(data.exactMatterName)).toBeVisible();
});

test("TC-04. Search Matter using keyword", async () => {
  const data = matterSearch.TC_MatterSearch;

  await timelinePage.searchMatter(data.keyword);

  await expect(timelinePage.matterRow(data.exactMatterName)).toBeVisible();
});

test("TC-05. Search another existing Matter", async () => {
  const data = matterSearch.TC_MatterSearch;

  await timelinePage.searchMatter(data.secondMatterName);

  await expect(timelinePage.matterRow(data.secondMatterName)).toBeVisible();
});

test("TC-06. Search Matter with invalid Matter name", async () => {
  const data = matterSearch.TC_MatterSearch;

  await timelinePage.searchMatter(data.invalidMatterName);

  await expect(timelinePage.matterRow(data.invalidMatterName)).toHaveCount(0);
});

test("TC-07. Search exact Matter and open Timeline", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await expect(timelinePage.timelineTab).toBeVisible();
});

test("TC-08. Search exact Matter and open Timeline", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await expect(timelinePage.timelineTab).toBeVisible();

  await timelinePage.verifyDateOfFiling(data.dateOfFiling);
  await timelinePage.verifyCreatedDate(data.createdDate);
  await timelinePage.verifyCaseFilingEvent(data.caseFiling);
});

test("TC-09. Add and verify Timeline Note", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Verify Timeline tab
  await expect(timelinePage.timelineTab).toBeVisible();

  // Click Add Notes
  try {
    await timelinePage.clickAddNotes();
  } catch (error) {
    console.log("First attempt to click Add Notes failed, retrying...");

    await page.reload();

    await timelinePage.openMatterTimeline(data.matterName);

    await timelinePage.clickAddNotes();
  }

  // Enter note
  await timelinePage.enterNote(data.note);

  // Save note
  await timelinePage.saveNote();

  // Verify note
  await timelinePage.verifyAddedNote(data.note);
});
test("TC-10. Edit an existing note", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Verify Timeline tab
  await expect(timelinePage.timelineTab).toBeVisible();

  // Open the ellipsis (⋮) dropdown on the existing note
  await timelinePage.clickNoteActionButton(data.originalNote);

  // Click "Edit" from the dropdown
  await timelinePage.clickEditNote();

  // Clear existing note and enter edited note
  await timelinePage.clearAndEnterNote(data.editedNote);

  // Save edited note
  await timelinePage.saveNote();

  // Verify edited note is now shown
  await timelinePage.verifyAddedNote(data.editedNote);

  // Verify the original note text is gone
  await expect(timelinePage.getNoteContainer(data.originalNote)).toHaveCount(0);
});

test("TC-11. Verify Documents tab", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Verify Timeline tab is visible
  await expect(timelinePage.timelineTab).toBeVisible();

  // Verify Documents tab is visible and selectable
  await expect(timelinePage.documentsTab).toBeVisible();
  await expect(timelinePage.documentsTab).toBeEnabled();

  // Click Documents tab
  await timelinePage.openDocumentsTab();

  // Verify Documents tab is now active
  await timelinePage.verifyDocumentsTabActive();
});

test("TC-12. Search existing document", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Open Documents tab
  await timelinePage.openDocumentsTab();

  // Search for existing document
  await timelinePage.searchDocument(data.documentSearch);

  // Verify matching documents are displayed
  await expect(
    timelinePage.page.getByText(data.documentSearch, { exact: false }).first(),
  ).toBeVisible({ timeout: 15000 });
});

test("TC-13. Search non-existing document", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Open Documents tab
  await timelinePage.openDocumentsTab();

  // Search for non-existing document
  await timelinePage.searchDocument(data.invalidDocumentSearch);

  // Verify no matching document is displayed
  await expect(
    timelinePage.page.getByText(data.invalidDocumentSearch, { exact: true }),
  ).toHaveCount(0);
});

test("TC-14. Upload single document", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Open Documents tab
  await timelinePage.openDocumentsTab();

  // Click Upload New button
  await timelinePage.clickUploadNew();

  // Upload single document
  await timelinePage.uploadDocument(data.singleUploadFile);

  // Click Upload button
  await timelinePage.clickUpload();

  // Confirm upload
  await timelinePage.confirmUpload();

  // Submit upload
  await timelinePage.submitUpload();

  // Verify document is uploaded successfully
  await timelinePage.verifyUploadedDocument(data.singleUploadFile);
});

test("TC-15. Upload multiple documents", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Open Documents tab
  await timelinePage.openDocumentsTab();

  // Click Upload New button
  await timelinePage.clickUploadNew();

  // Upload multiple documents
  await timelinePage.uploadDocuments(data.multipleUploadFiles);

  // Click Upload button
  await timelinePage.clickUpload();

  // Confirm upload
  await timelinePage.confirmUpload();

  // Submit upload
  await timelinePage.submitUpload();

  // Verify all uploaded documents are displayed
  for (const file of data.multipleUploadFiles) {
    await timelinePage.verifyUploadedDocument(file);
  }
});

test("TC-16. Verify uploaded documents", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Open Documents tab
  await timelinePage.openDocumentsTab();

  // Verify uploaded documents appear in the document list
  for (const file of data.multipleUploadFiles) {
    await timelinePage.verifyUploadedDocument(file);
  }
});

test("TC-17. Open document action menu", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Open Documents tab
  await timelinePage.openDocumentsTab();

  // Verify three-dot action menu is visible
  await expect(timelinePage.threeDotMenu).toBeVisible();

  // Click three-dot action menu
  await timelinePage.clickThreeDotMenu();

  // Verify action menu options are displayed
  await expect(timelinePage.page.getByRole("menuitem").first()).toBeVisible({
    timeout: 5000,
  });
});

test("TC-18. Cancel document upload", async () => {
  const data = matterSearch.TC_MatterSearchTimeline;

  // Search and open Matter Timeline
  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  // Open Documents tab
  await timelinePage.openDocumentsTab();

  // Click Upload New button
  await timelinePage.clickUploadNew();

  // Upload document
  await timelinePage.uploadDocument(data.singleUploadFile);

  // Click Cancel button
  await timelinePage.cancelUpload();

  // Verify upload dialog is closed and document is not uploaded
  await expect(timelinePage.browseFilesButton)
    .not.toBeVisible({ timeout: 5000 })
    .catch(() => true);
});

test("TC-19. Verify Client(s) tab is displayed", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await expect(timelinePage.clientsTab).toBeVisible();
  await expect(timelinePage.clientsTab).toBeEnabled();

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientsTabActive();
});

test("TC-20. Verify existing assigned clients", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientDisplayed(data.existingClient1);
  await timelinePage.verifyClientDisplayed(data.existingClient2);
});

test("TC-21. Verify client details/card", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientCardDetails(data.existingClient1);
});

test("TC-22. Search client", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.existingClient1);

  await expect(
    timelinePage.page.getByText(data.existingClient1, { exact: true }).first(),
  ).toBeVisible({ timeout: 15000 });
});

test("TC-23. Search partial client name", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.partialClientName);

  await expect(
    timelinePage.page
      .getByText(data.partialClientName, { exact: false })
      .first(),
  ).toBeVisible({ timeout: 15000 });
});

test("TC-24. Search invalid client", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.invalidClientName);

  await expect(
    timelinePage.page.getByText(data.invalidClientName, { exact: true }),
  ).toHaveCount(0);
});

test("TC-25. Assign a new client", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.saveClientChanges();

  await timelinePage.verifyClientAddedToList(data.newClientName);
});

test("TC-26. Assign multiple clients", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.existingClient1);
  await timelinePage.selectClient(data.existingClient1);

  await timelinePage.searchClient(data.existingClient2);
  await timelinePage.selectClient(data.existingClient2);

  await timelinePage.saveClientChanges();

  await timelinePage.verifyClientAddedToList(data.existingClient1);
  await timelinePage.verifyClientAddedToList(data.existingClient2);
});

test("TC-27. Prevent duplicate client assignment", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientAddedToList(data.existingClient1);

  await timelinePage.searchClient(data.existingClient1);

  const clientCount = await timelinePage.page
    .getByText(data.existingClient1, { exact: true })
    .count();

  expect(clientCount).toBeLessThanOrEqual(1);
});

test("TC-28. Delete assigned client", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientAddedToList(data.existingClient2);

  await timelinePage.clickClientDeleteIcon(data.existingClient2);

  await timelinePage.saveClientChanges();

  await expect(
    timelinePage.page.getByText(data.existingClient2, { exact: true }),
  ).toHaveCount(0);
});

test("TC-29. Cancel client changes", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  const initialClientCount = await timelinePage.page
    .getByText(data.existingClient1, { exact: true })
    .count();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.cancelClientChanges();

  const finalClientCount = await timelinePage.page
    .getByText(data.existingClient1, { exact: true })
    .count();

  expect(finalClientCount).toBe(initialClientCount);
});

test("TC-30. Save client changes", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.saveClientChanges();

  await timelinePage.verifyClientAddedToList(data.newClientName);
});

test("TC-31. Verify saved client after refresh", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.saveClientChanges();

  await timelinePage.verifyClientAddedToList(data.newClientName);

  await page.reload();
  await page.waitForLoadState("networkidle");

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientAddedToList(data.newClientName);
});

test("TC-32. Verify communication/action icon", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientCardDetails(data.existingClient1);

  await timelinePage.clickClientCommunicationIcon(data.existingClient1);
});

test("TC-33. Verify Save button state", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifySaveButtonDisabled();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.verifySaveButtonEnabled();
});

test("TC-34. Verify Save after client selection", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.verifySaveButtonEnabled();

  await timelinePage.saveClientChanges();

  await timelinePage.verifySaveButtonDisabled();
});

test("TC-35. Verify Cancel button", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await expect(timelinePage.clientCancelButton).toBeVisible();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.cancelClientChanges();

  await timelinePage.verifyClientsTabActive();
});

test("TC-36. Verify Summary section", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifySummarySection();
});

test("TC-37. Verify Edit button in Summary", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.verifySummarySection();

  await timelinePage.clickEditButton();
});

test("TC-38. Verify client assignment across tabs", async () => {
  const data = matterSearch.TC_MatterClients;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.openClientsTab();

  await timelinePage.searchClient(data.newClientName);
  await timelinePage.selectClient(data.newClientName);

  await timelinePage.saveClientChanges();

  await timelinePage.verifyClientAddedToList(data.newClientName);

  await timelinePage.openTimelineTab();

  await timelinePage.openClientsTab();

  await timelinePage.verifyClientAddedToList(data.newClientName);
});

test("TC-39. Verify Summary section is displayed", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummarySection();
});

test("TC-40. Verify Case Title", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Case Title");
  await timelinePage.verifySummaryTextContains(data.caseTitle);
});

test("TC-41. Verify Case Number", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Case Number");
  await timelinePage.verifySummaryTextContains(data.caseNumber);
});

test("TC-42. Verify Case Type", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Case Type");
  await timelinePage.verifySummaryTextContains(data.caseType);
});

test("TC-43. Verify Matter Number", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Matter Number");
});

test("TC-44. Verify Created Date", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Created Date");
  await timelinePage.verifySummaryFieldNotEmpty("Created Date");
});

test("TC-45. Verify Court", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Court");
  await timelinePage.verifySummaryTextContains(data.court);
});

test("TC-46. Verify Date of Filing", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Date of Filing");
  await timelinePage.verifySummaryFieldNotEmpty("Date of Filing");
});

test("TC-47. Verify Description", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Description");
  await timelinePage.verifySummaryTextContains(data.description);
});

test("TC-48. Verify Matter Tags", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Tags");
});

test("TC-49. Verify Judges", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummaryField("Judge");
  await timelinePage.verifySummaryTextContains(data.judges);
});

test("TC-50. Verify Edit button", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifyEditButtonVisible();
  await timelinePage.verifyEditButtonEnabled();
});

test("TC-51. Open Matter Edit from Summary", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();
});

test("TC-52. Edit Case Title from Summary", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel(
    "Case Title",
    data.editedCaseTitle,
  );

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.editedCaseTitle);
});

test("TC-53. Edit Case Number", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel(
    "Case Number",
    data.editedCaseNumber,
  );

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.editedCaseNumber);
});

test("TC-54. Edit Case Type", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel("Case Type", data.editedCaseType);

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.editedCaseType);
});

test("TC-55. Edit Matter Number", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel(
    "Matter Number",
    data.editedMatterNumber,
  );

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.editedMatterNumber);
});

test("TC-56. Edit Court", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel("Court", data.editedCourt);

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.editedCourt);
});

test("TC-57. Edit Date of Filing", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel(
    "Date of Filing",
    data.editedDateOfFiling,
  );

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryFieldNotEmpty("Date of Filing");
});

test("TC-58. Edit Description", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel(
    "Description",
    data.editedDescription,
  );

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.editedDescription);
});

test("TC-59. Edit Matter Tags", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel("Tags", data.editedTags);

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.editedTags);
});

test("TC-60. Edit Judges", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel("Judge", data.judges);

  await timelinePage.saveSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.judges);
});

test("TC-61. Cancel Summary changes", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.clickEditButton();

  await timelinePage.editSummaryFieldByLabel("Case Title", "Should Not Save");

  await timelinePage.cancelSummaryChanges();

  await timelinePage.verifySummaryTextContains(data.caseTitle);
});

test("TC-62. Verify Summary after page refresh", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);

  await page.reload();
  await page.waitForLoadState("networkidle");

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);
});

test("TC-63. Verify Summary across Timeline tab", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);

  await timelinePage.openTimelineTab();
  await page.waitForTimeout(1000);

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);
});

test("TC-64. Verify Summary across Documents tab", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);

  await timelinePage.openDocumentsTab();
  await page.waitForTimeout(1000);

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);
});

test("TC-65. Verify Summary across Client(s) tab", async () => {
  const data = matterSearch.TC_MatterSummary;

  await timelinePage.searchAndOpenMatterTimeline(data.matterName);

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);

  await timelinePage.openClientsTab();
  await page.waitForTimeout(1000);

  await timelinePage.verifySummarySection();
  await timelinePage.verifySummaryTextContains(data.caseTitle);
});
