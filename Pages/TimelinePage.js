const { expect } = require("@playwright/test");
const path = require("path");

class TimelinePage {
  constructor(page) {
    this.page = page;

    // =========================
    // Matter Navigation
    // =========================

    this.mattersMenu = page.getByRole("menuitem", {
      name: "Matters",
      exact: true,
    });

    this.legalMattersLink = page.getByRole("menuitem", {
      name: "Legal Matters",
      exact: true,
    });

    this.pageTitle = page.getByTitle("Legal Matters");

    this.searchInput = page.getByPlaceholder("Search for Matter...");

    this.matterRow = (matterName) =>
      page.getByRole("row", {
        name: matterName,
        exact: false,
      });

    this.matterRowMenuButton = (matterName) =>
      this.matterRow(matterName).getByRole("button");

    this.viewTimelineMenuItem = page.getByRole("menuitem", {
      name: "View Timeline",
      exact: true,
    });

    // =========================
    // Timeline Tabs
    // =========================

    this.timelineTab = page.getByRole("tab", {
      name: "Timeline",
      exact: true,
    });

    this.documentsTab = page.getByRole("tab", {
      name: "Document(s)",
      exact: true,
    });

    this.clientsTab = page.getByRole("tab", {
      name: "Client(s)",
      exact: true,
    });

    // =========================
    // Documents
    // =========================

    this.documentSearchInput = page.getByPlaceholder("Search Document");

    this.uploadNewButton = page.getByRole("button", {
      name: "+ Upload New",
    });

    this.browseFilesButton = page.getByRole("button", {
      name: "Browse Files",
      exact: true,
    });

    this.fileInput = page.locator('input[type="file"]');

    this.uploadButton = page.getByRole("button", {
      name: "Upload",
      exact: true,
    });

    this.yesButton = page.getByRole("button", {
      name: "Yes",
      exact: true,
    });

    this.submitButton = page.getByRole("button", {
      name: "Submit",
      exact: true,
    });

    this.cancelButton = page.getByRole("button", {
      name: "Cancel",
      exact: true,
    });

    this.documentActionMenu = page
      .locator('img[mattooltip="Click To Add Notes"]')
      .first();

    this.threeDotMenu = page.locator("i.fa-solid.fa-ellipsis-vertical").first();

    // =========================
    // Clients
    // =========================

    this.clientSearchInput = page.locator(
      'input[placeholder="Type to Select"], input[formcontrolname*="client"], input[placeholder*="Client"]',
    );

    this.clientSearchButton = page.getByRole("button", {
      name: "Search",
      exact: true,
    });

    this.clientSaveButton = page.getByRole("button", {
      name: "Save",
      exact: true,
    });

    this.clientCancelButton = page.getByRole("button", {
      name: "Cancel",
      exact: true,
    });

    this.addedClientsSection = page.getByText("Added Client(s)", {
      exact: true,
    });

    this.addedClientsHeading = page.locator(
      'text="Added Client(s)", h4:has-text("Added Client"), .added-clients-header',
    );

    // =========================
    // Matter Summary
    // =========================

    this.summarySection = page.locator(
      '.matter-summary, .summary-section, [class*="summary"]',
    );

    this.editButton = page.getByRole("button", {
      name: "Edit",
      exact: true,
    });

    this.matterSummaryCaseTitle = page
      .locator('.matter-summary, .summary-section, [class*="summary"]')
      .getByText("Case Title");

    this.matterSummaryCaseNumber = page
      .locator('.matter-summary, .summary-section, [class*="summary"]')
      .getByText("Case Number");

    this.matterSummaryMatterNumber = page
      .locator('.matter-summary, .summary-section, [class*="summary"]')
      .getByText("Matter Number");

    // =========================
    // Timeline Events
    // =========================

    this.dateOfFiling = (dateText) =>
      page
        .getByRole("listitem")
        .filter({ hasText: "Date of Filling" })
        .getByText(dateText, { exact: true });

    this.createdDate = (dateText) =>
      page
        .getByRole("listitem")
        .filter({ hasText: "Created Date" })
        .getByText(dateText, { exact: true });

    this.meetingEvent = (eventText) =>
      page.locator("p.pnumber.pleagalsubitem").getByText(eventText, {
        exact: true,
      });

    this.caseFilingEvent = (eventText) =>
      page.locator("p.pnumber.pleagalsubitem", {
        hasText: eventText,
      });

    // =========================
    // Notes
    // =========================

    this.addNotesButton = page
      .locator('img[mattooltip="Click To Add Notes"]')
      .first();

    this.notesTextarea = page.locator('textarea[formcontrolname="notes"]');

    this.notesTextbox = page
      .locator('textarea[formcontrolname="notes"]')
      .first();

    this.notesTextboxFallback = page.locator("textarea").first();

    this.notesTextboxByPlaceholder = page.getByPlaceholder(
      "Enter notes here...",
    );

    this.notesTextboxByRole = page.getByRole("textbox", {
      name: "Notes",
    });

    this.notesSaveButton = page.getByRole("button", {
      name: "Save",
      exact: true,
    });

    this.cancelNoteButton = page.getByRole("button", {
      name: "Cancel",
      exact: true,
    });

    this.notesTextbox = page.locator('textarea[formcontrolname="notes"]');
  }

  // Notes - Locators

  getNotesTextbox() {
    return this.notesTextbox;
  }

  async clickEditNote() {
    const editMenu = this.page.getByRole("button", {
      name: "Edit",
      exact: true,
    });

    await expect(editMenu).toBeVisible();
    await editMenu.click();
  }

  async clearAndEnterNote(newNote) {
    const noteInput = this.page.locator("textarea").first();

    await expect(noteInput).toBeVisible();

    await noteInput.fill(newNote);
  }

  getAddedNote(noteText) {
    return this.page
      .getByText(noteText, {
        exact: true,
      })
      .first();
  }

  // async enterNotes(notes) {
  //   await this.notesTextarea.fill(notes);
  // }

  async verifyNotes(notes) {
    await expect(this.notesTextarea).toHaveValue(notes);
  }

  async clearNotes() {
    await this.notesTextarea.fill("");
  }

  // Matter Navigation

  async openLegalMatters() {
    await expect(this.mattersMenu).toBeVisible();

    await this.mattersMenu.click();

    const spinner = this.page.locator(".ngx-spinner-overlay");

    await expect(spinner).toBeHidden({
      timeout: 15000,
    });

    await expect(this.legalMattersLink).toBeVisible({
      timeout: 10000,
    });

    await this.legalMattersLink.click();

    await expect(this.pageTitle).toBeVisible();
  }

  async searchMatter(matterName) {
    await expect(this.searchInput).toBeVisible();

    await this.searchInput.fill(matterName);
    await this.searchInput.press("Enter");
  }

  async openMatterMenu(matterName) {
    const row = this.matterRow(matterName);

    await expect(row).toBeVisible();

    const menuButton = this.matterRowMenuButton(matterName);

    await expect(menuButton).toBeVisible();

    await menuButton.click();
  }

  async openMatterTimeline(matterName) {
    await this.openMatterMenu(matterName);

    await expect(this.viewTimelineMenuItem).toBeVisible();

    await this.viewTimelineMenuItem.click();

    await expect(this.timelineTab).toBeVisible();
  }

  async searchAndOpenMatterTimeline(matterName) {
    await this.searchMatter(matterName);
    await this.openMatterTimeline(matterName);
  }

  async goToLegalMatters() {
    if (await this.legalMattersLink.isVisible()) {
      await this.legalMattersLink.click();
    } else {
      await this.openLegalMatters();
    }

    await expect(this.pageTitle).toBeVisible();
  }

  // Timeline Tabs

  async openTimelineTab() {
    await this.timelineTab.click();

    await expect(this.timelineTab).toBeVisible();
  }

  async openDocumentsTab() {
    await expect(this.documentsTab).toBeVisible();
    await this.documentsTab.click();
    await expect(this.documentsTab).toBeVisible();
  }

  // Documents - Search

  async searchDocument(searchText) {
    await expect(this.documentSearchInput).toBeVisible();
    await this.documentSearchInput.fill(searchText);
    await this.documentSearchInput.press("Enter");
  }

  async clearDocumentSearch() {
    await expect(this.documentSearchInput).toBeVisible();
    await this.documentSearchInput.fill("");
    await this.documentSearchInput.press("Enter");
  }

  // Documents - Upload

  async clickUploadNew() {
    await expect(this.uploadNewButton).toBeVisible();
    await this.uploadNewButton.click();
  }

  async uploadDocument(filePath) {
    const resolvedPath = path.resolve(process.cwd(), filePath);

    await expect(this.browseFilesButton).toBeVisible({ timeout: 20000 });
    await this.fileInput.setInputFiles(resolvedPath);
  }

  async uploadDocuments(filePaths = []) {
    const resolvedPaths = filePaths.map((file) =>
      path.resolve(process.cwd(), file),
    );

    await expect(this.browseFilesButton).toBeVisible({ timeout: 20000 });
    await this.fileInput.setInputFiles(resolvedPaths);
  }

  async clickUpload() {
    await expect(this.uploadButton).toBeVisible();
    await this.uploadButton.click();
  }

  async confirmUpload() {
    await expect(this.yesButton).toBeVisible();
    await this.yesButton.click();
  }

  async submitUpload() {
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.click();
  }

  async cancelUpload() {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
  }

  // Documents - Verify

  async verifyUploadedDocument(filePath) {
    const fileName = filePath.split(/[\\/]/).pop();
    await expect(
      this.page.getByText(fileName, { exact: true }).first(),
    ).toBeVisible({ timeout: 30000 });
  }

  async verifyDocumentNotDisplayed(filePath) {
    const fileName = filePath.split(/[\\/]/).pop();
    await expect(this.page.getByText(fileName, { exact: true })).toHaveCount(0);
  }

  async verifyDocumentsTabActive() {
    await expect(this.documentsTab).toBeVisible();
    await expect(this.documentsTab).toHaveAttribute("aria-selected", "true");
  }

  // Documents - Action Menu

  async clickThreeDotMenu() {
    await expect(this.threeDotMenu).toBeVisible();
    await this.threeDotMenu.click();
  }

  // Clients - Navigation

  async openClientsTab() {
    await expect(this.clientsTab).toBeVisible();
    await this.clientsTab.click();
    await expect(this.clientsTab).toBeVisible();
  }

  async verifyClientsTabActive() {
    await expect(this.clientsTab).toBeVisible();
    await expect(this.clientsTab).toHaveAttribute("aria-selected", "true");
  }

  // Clients - Search

  async searchClient(clientName) {
    const input = this.clientSearchInput.first();
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.fill("");
    await input.fill(clientName);
    await this.page.waitForTimeout(500);
  }

  async clickClientSearch() {
    await expect(this.clientSearchButton).toBeVisible();
    await this.clientSearchButton.click();
  }

  async selectClient(clientName) {
    const clientOption = this.page
      .locator("mat-option")
      .filter({ hasText: clientName })
      .first();

    await expect(clientOption).toBeVisible({ timeout: 30000 });
    await expect(clientOption).toBeEnabled({ timeout: 30000 });
    await clientOption.click();
    await expect(clientOption).toBeHidden({ timeout: 10000 });
  }

  async verifyClientDisplayed(clientName) {
    await expect(
      this.page.getByText(clientName, { exact: true }).first(),
    ).toBeVisible({ timeout: 15000 });
  }

  async verifyClientNotDisplayed(clientName) {
    await expect(this.page.getByText(clientName, { exact: true })).toHaveCount(
      0,
    );
  }

  // Clients - Added Clients

  async verifyClientAddedToList(clientName) {
    await expect(
      this.page.getByText(clientName, { exact: true }).first(),
    ).toBeVisible({ timeout: 15000 });
  }

  async getClientCard(clientName) {
    return this.page
      .locator(".client-card, .client-item, .added-client, mat-card, .card")
      .filter({ hasText: clientName })
      .first();
  }

  async verifyClientCardDetails(clientName) {
    const card = await this.getClientCard(clientName);
    await expect(card).toBeVisible();

    await expect(card.getByText(clientName, { exact: true })).toBeVisible();

    const actionIcon = card
      .locator(
        'i.fa-phone, i.fa-envelope, i.fa-comment, i[class*="communication"], i[class*="action"]',
      )
      .first();

    if ((await actionIcon.count()) > 0) {
      await expect(actionIcon).toBeVisible();
    }

    const deleteIcon = card
      .locator('i.fa-trash, i.fa-times, i[class*="delete"], i[class*="remove"]')
      .first();

    if ((await deleteIcon.count()) > 0) {
      await expect(deleteIcon).toBeVisible();
    }
  }

  async clickClientDeleteIcon(clientName) {
    const card = await this.getClientCard(clientName);

    const deleteIcon = card
      .locator('i.fa-trash, i.fa-times, i[class*="delete"], i[class*="remove"]')
      .first();

    await expect(deleteIcon).toBeVisible();
    await deleteIcon.click();
  }

  async clickClientCommunicationIcon(clientName) {
    const card = await this.getClientCard(clientName);

    const actionIcon = card
      .locator(
        'i.fa-phone, i.fa-envelope, i.fa-comment, i[class*="communication"], i[class*="action"]',
      )
      .first();

    await expect(actionIcon).toBeVisible();
    await actionIcon.click();
  }

  // Clients - Actions

  async saveClientChanges() {
    await expect(this.clientSaveButton).toBeVisible();
    await expect(this.clientSaveButton).toBeEnabled();
    await this.clientSaveButton.click();
  }

  async cancelClientChanges() {
    await expect(this.clientCancelButton).toBeVisible();
    await this.clientCancelButton.click();
  }

  async verifySaveButtonDisabled() {
    await expect(this.clientSaveButton).toBeDisabled();
  }

  async verifySaveButtonEnabled() {
    await expect(this.clientSaveButton).toBeEnabled();
  }

  // Matter Summary

  async verifySummarySection() {
    await expect(this.summarySection).toBeVisible();
  }

  async verifySummaryField(fieldText) {
    await expect(
      this.page.getByText(fieldText, { exact: true }).first(),
    ).toBeVisible();
  }

  async clickEditButton() {
    await expect(this.editButton).toBeVisible();
    await this.editButton.click();
  }

  // Notes - Add

  async clickAddNotes() {
    await expect(this.addNotesButton).toBeVisible();
    await this.addNotesButton.click();
  }

  async enterNote(noteText) {
    await expect(this.notesTextarea).toBeVisible();
    await expect(this.notesTextarea).toBeEditable();

    await this.notesTextarea.fill(noteText);

    await expect(this.notesTextarea).toHaveValue(noteText);
  }

  async deleteNote(noteText) {
    const textbox = this.getNotesTextbox();

    await expect(textbox).toBeVisible();

    await textbox.fill("");
  }

  async saveNote() {
    const saveButton = this.page.getByRole("button", {
      name: "Save",
      exact: true,
    });

    await expect(saveButton).toBeVisible();
    await saveButton.click();
  }

  async verifyAddedNote(noteText) {
    await expect(
      this.page.getByText(noteText, {
        exact: true,
      }),
    ).toBeVisible();
  }

  // TimelinePage.js

  async verifyCaseFilingEvent(eventText) {
    await expect(this.caseFilingEvent(eventText)).toBeVisible();
  }

  async verifyDateOfFiling(dateText) {
    await expect(this.dateOfFiling(dateText)).toBeVisible();
  }

  async verifyCreatedDate(dateText) {
    await expect(this.createdDate(dateText)).toBeVisible();
  }

  async verifyEditTimestamp(noteText) {
    await this.verifyAddedNote(noteText);
  }

  // Notes - Edit

  getNoteContainer(noteText) {
    return this.page
      .getByRole("listitem")
      .filter({ hasText: noteText })
      .first();
  }

  getNoteActionButton(noteText) {
    const noteContainer = this.getNoteContainer(noteText);

    return noteContainer
      .locator("button")
      .filter({
        has: noteContainer.locator("i.fa-solid.fa-ellipsis-vertical"),
      })
      .first();
  }

  async clickNoteActionButton(noteText) {
    const actionBtn = this.getNoteActionButton(noteText);

    await expect(actionBtn).toBeVisible();
    await actionBtn.click();
  }

  async clearAndEnterNote(newNote) {
    const textbox = this.notesTextarea.first();
    await expect(textbox).toBeVisible();
    await expect(textbox).toBeEditable();
    await textbox.fill("");
    await textbox.fill(newNote);
    await expect(textbox).toHaveValue(newNote);
  }

  async editNote(oldNote, newNote) {
    await this.clickNoteActionButton(oldNote);
    await this.clearAndEnterNote(newNote);
    await this.saveNote();
  }
}

module.exports = { TimelinePage };
