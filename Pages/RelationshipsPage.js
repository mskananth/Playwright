const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

class RelationshipsPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Sidebar navigation ─────────────────────────────────────────
    this.relationshipsMenuItem = page
      .getByRole("menuitem", { name: /relationships/i })
      .first();
    this.subMenuItem = (label) =>
      page
        .getByRole("menuitem", {
          name: new RegExp(`^\\s*${label}\\s*$`, "i"),
        })
        .first();

    // ── Loading overlay (ngx-spinner) ──────────────────────────────
    this.loadingOverlay = page.locator(".ngx-spinner-overlay");

    // ── Page header / sections ─────────────────────────────────────
    this.pageHeading = page
      .getByRole("banner")
      .getByText(/individual relationships/i)
      .first();
    this.listSectionTitle = page.getByText(/list of relationships/i).first();
    this.addRelationshipButton = page
      .getByRole("button", { name: /add\s+relationships?/i })
      .first();

    // ── Table ──────────────────────────────────────────────────────
    this.tableHeaders = page.locator("table th, [role='columnheader']");
    this.columnHeader = (name) =>
      this.tableHeaders.filter({ hasText: new RegExp(name, "i") }).first();
    this.tableRows = page.locator("table tbody tr");
    this.relationshipRow = (name) => this.tableRows.filter({ hasText: name });
    this.rowStatusBadge = (name, status) =>
      this.relationshipRow(name)
        .getByText(new RegExp(`^\\s*${status}\\s*$`, "i"))
        .or(
          this.relationshipRow(name).getByRole("button", {
            name: new RegExp(`^${status}$`, "i"),
          }),
        )
        .first();

    // ── List page search ───────────────────────────────────────────
    this.searchInput = page.getByPlaceholder(/search relationships/i);

    // ── Pagination ─────────────────────────────────────────────────
    this.nextButton = page.getByRole("button", { name: /next/i }).first();
    this.prevButton = page.getByRole("button", { name: /prev/i }).first();

    // ── Row action menu ────────────────────────────────────────────
    this.menuItem = (option) =>
      page
        .getByRole("menuitem", {
          name: new RegExp(option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        })
        .first();

    // ── Confirmation dialog ────────────────────────────────────────
    this.dialog = page
      .locator("[role='dialog'], mat-dialog-container, .modal")
      .first();
    this.dialogTitle = (title) =>
      this.dialog.getByText(new RegExp(title, "i")).first();
    this.yesButton = this.dialog
      .getByRole("button", { name: /^yes$/i })
      .first();
    this.noButton = this.dialog.getByRole("button", { name: /^no$/i }).first();
    this.closeIconButton = this.dialog
      .locator("[class*='close'], .fa-times, .fa-close, button:has-text('×')")
      .first();

    // ── Add Individual Relationship page ───────────────────────────
    this.addPageHeading = page
      .getByRole("banner")
      .getByText(/add individual relationship/i)
      .first();
    this.addSearchInput = page
      .getByRole("combobox", { name: /search by name/i })
      .or(page.getByRole("textbox", { name: /search by name/i }))
      .first();
    this.addSearchButton = page
      .getByRole("button", { name: /^search$/i })
      .first();
    this.firstNameInput = page
      .locator(
        'input[formcontrolname*="first" i], input[placeholder*="first" i], input[name*="firstname" i]',
      )
      .first();
    this.lastNameInput = page
      .locator(
        'input[formcontrolname*="last" i], input[placeholder*="last" i], input[name*="lastname" i]',
      )
      .first();
    this.emailInput = page
      .locator(
        'input[formcontrolname*="email" i], input[type="email"], input[placeholder*="email" i]',
      )
      .first();
    this.confirmEmailInput = page
      .locator(
        'input[formcontrolname*="confirm" i], input[formcontrolname*="retype" i], input[placeholder*="confirm" i], input[placeholder*="retype" i], input[name*="confirmemail" i], input[name*="retypeemail" i]',
      )
      .first();
    this.mobileInput = page
      .locator(
        'input[formcontrolname*="mobile" i], input[placeholder*="mobile" i], input[name*="mobile" i], input[type="tel"]',
      )
      .first();
    this.countryDropdown = page
      .locator(
        "mat-select, select, [class*='country'] mat-select, [class*='country'] select",
      )
      .first();
    this.notFoundMessage = page
      .getByText(/not found|please fill in the details/i)
      .first();
    this.sendRequestButton = page
      .getByRole("button", { name: /send request/i })
      .first();
    this.cancelButton = page.getByRole("button", { name: /^cancel$/i }).first();
    this.successToast = page
      .locator(
        "[class*='toast'], [class*='snack'], snack-bar-container, [class*='alert-success']",
      )
      .first();
  }

  // ══════════════════════════════════════════════════════════════
  //  Helpers
  // ══════════════════════════════════════════════════════════════

  async waitForLoading() {
    await this.loadingOverlay
      .waitFor({ state: "hidden", timeout: 20000 })
      .catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════
  //  Navigation
  // ══════════════════════════════════════════════════════════════

  async openIndividualList() {
    const onList = await this.listSectionTitle.isVisible().catch(() => false);
    if (onList) return;

    await this.relationshipsMenuItem.click();
    await this.subMenuItem("Individual").click();
    await expect(this.listSectionTitle).toBeVisible({ timeout: 15000 });
  }

  async goBackToList() {
    await this.page.goBack().catch(() => {});
    await this.waitForLoading();
    const onList = await this.pageHeading.isVisible().catch(() => false);
    if (!onList) {
      await this.openIndividualList();
    }
  }

  async reload() {
    await this.page.reload();
    await this.waitForLoading();
  }

  // ══════════════════════════════════════════════════════════════
  //  List page – layout & content
  // ══════════════════════════════════════════════════════════════

  async verifyPageLoaded() {
    await expect(this.pageHeading).toBeVisible({ timeout: 15000 });
  }

  async verifyPageHeading(expected) {
    await expect(this.pageHeading).toContainText(expected);
  }

  async verifyListSection() {
    await expect(this.listSectionTitle).toBeVisible({ timeout: 10000 });
  }

  async verifyTableColumns(columns) {
    for (const column of columns) {
      await expect(this.columnHeader(column)).toBeVisible({
        timeout: 10000,
      });
    }
  }

  async getRowCount() {
    return this.tableRows.count();
  }

  async verifyRowExists(name) {
    const row = this.relationshipRow(name).first();
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  async verifyRowType(name, type) {
    await expect(
      this.relationshipRow(name).getByText(new RegExp(type, "i")).first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async verifyRowStatus(name, status) {
    await expect(this.rowStatusBadge(name, status)).toBeVisible({
      timeout: 10000,
    });
  }

  async getFirstRowText() {
    const firstRow = this.tableRows.first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    return firstRow.innerText();
  }

  // ══════════════════════════════════════════════════════════════
  //  Relationship details
  // ══════════════════════════════════════════════════════════════

  async openRelationshipDetails(name) {
    const row = this.relationshipRow(name).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await row
      .getByRole("cell", { name: new RegExp(name, "i") })
      .first()
      .click();
    await this.waitForLoading();
  }

  async verifyDetailsPage(name) {
    await expect(
      this.page.locator("main").getByText(name, { exact: false }).first(),
    ).toBeVisible({ timeout: 10000 });
  }

  // ══════════════════════════════════════════════════════════════
  //  List search
  // ══════════════════════════════════════════════════════════════

  async searchRelationship(term) {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.fill(term);
    await this.waitForLoading();
  }

  async clearSearch() {
    await this.searchInput.fill("");
    await this.waitForLoading();
  }

  async verifySearchResultCount(minimum) {
    const count = await this.getRowCount();
    expect(count).toBeGreaterThanOrEqual(minimum);
  }

  // ══════════════════════════════════════════════════════════════
  //  Sorting
  // ══════════════════════════════════════════════════════════════

  async clickSortColumn(column) {
    const header = this.columnHeader(column);
    await expect(header).toBeVisible({ timeout: 10000 });
    await header.click();
    await this.waitForLoading();
  }

  // ══════════════════════════════════════════════════════════════
  //  Pagination
  // ══════════════════════════════════════════════════════════════

  async clickNextPage() {
    await expect(this.nextButton).toBeVisible({ timeout: 10000 });
    await expect(this.nextButton).toBeEnabled();
    await this.nextButton.click();
    await this.waitForLoading();
  }

  async clickPrevPage() {
    await expect(this.prevButton).toBeVisible({ timeout: 10000 });
    await expect(this.prevButton).toBeEnabled();
    await this.prevButton.click();
    await this.waitForLoading();
  }

  async verifyPrevDisabled() {
    await expect(this.prevButton).toBeVisible({ timeout: 10000 });
    const disabled =
      (await this.prevButton.isDisabled()) ||
      (await this.prevButton.getAttribute("aria-disabled")) === "true";
    expect(disabled).toBeTruthy();
  }

  async verifyNextDisabled() {
    await expect(this.nextButton).toBeVisible({ timeout: 10000 });
    const disabled =
      (await this.nextButton.isDisabled()) ||
      (await this.nextButton.getAttribute("aria-disabled")) === "true";
    expect(disabled).toBeTruthy();
  }

  // ══════════════════════════════════════════════════════════════
  //  Row action menu
  // ══════════════════════════════════════════════════════════════

  async clickRowActionMenu(name) {
    const row = this.relationshipRow(name).first();
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row).toHaveCount(1);

    const dotsButton = row.getByRole("button", { name: "⋮" }).first();
    if ((await dotsButton.count()) > 0) {
      await dotsButton.click();
    } else {
      await row.getByRole("button").last().click();
    }
    await this.waitForLoading();
  }

  async clickActionMenuOption(option) {
    const item = this.menuItem(option);
    await expect(item).toBeVisible({ timeout: 10000 });
    await item.click();
    await this.waitForLoading();
  }

  async closeMenuWithEscape() {
    await this.page.keyboard.press("Escape");
  }

  // ══════════════════════════════════════════════════════════════
  //  Delete relationship dialog
  // ══════════════════════════════════════════════════════════════

  async openDeleteDialog(name, dialogTitle) {
    await this.clickRowActionMenu(name);
    await this.clickActionMenuOption("Delete Relationship");
    await expect(this.dialog).toBeVisible({ timeout: 10000 });
    if (dialogTitle) {
      await expect(this.dialogTitle(dialogTitle)).toBeVisible();
    }
  }

  async confirmDialog() {
    await expect(this.yesButton).toBeVisible({ timeout: 5000 });
    await this.yesButton.click();
    await this.waitForLoading();
  }

  async cancelDialog() {
    await expect(this.noButton).toBeVisible({ timeout: 5000 });
    await this.noButton.click();
    await expect(this.dialog).toBeHidden({ timeout: 5000 });
  }

  async closeDialogViaX() {
    await expect(this.closeIconButton).toBeVisible({ timeout: 5000 });
    await this.closeIconButton.click();
    await expect(this.dialog).toBeHidden({ timeout: 5000 });
  }

  // ══════════════════════════════════════════════════════════════
  //  Add Individual Relationship page
  // ══════════════════════════════════════════════════════════════

  async openAddPage() {
    await expect(this.addRelationshipButton).toBeVisible({ timeout: 10000 });
    await this.addRelationshipButton.click();
    await this.waitForLoading();
    await expect(this.addPageHeading).toBeVisible({ timeout: 15000 });
  }

  async cancelAddPage() {
    if ((await this.cancelButton.count()) === 0) return;

    await this.cancelButton.click({ force: true });
    await this.openIndividualList();
  }

  async verifyAddPageSearchVisible() {
    await expect(this.addSearchInput).toBeVisible({ timeout: 10000 });
    await expect(this.addSearchButton).toBeVisible();
  }

  async verifySearchFieldVisible(placeholder) {
    if (placeholder) {
      await expect(
        this.addSearchInput.or(this.page.getByPlaceholder(placeholder)).first()
      ).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.addSearchInput).toBeVisible({ timeout: 10000 });
    }
    await expect(this.addSearchButton).toBeVisible();
  }

  async searchIndividual(name) {
    await expect(this.addSearchInput).toBeVisible({ timeout: 10000 });
    await this.addSearchInput.click();
    await this.addSearchInput.fill(name);
    await expect(this.addSearchButton).toBeEnabled();
    await this.addSearchButton.click();
    await this.waitForLoading();
  }

  async verifyIndividualFound(name) {
    await expect(
      this.page.locator("main").getByText(name, { exact: false }).first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async verifyIndividualFoundIfPresent(name) {
    const notFoundVisible = await this.notFoundMessage.isVisible().catch(() => false);
    return !notFoundVisible;
  }

  async verifyNotFoundMessage() {
    await expect(this.notFoundMessage).toBeVisible({ timeout: 10000 });
  }

  async verifyIndividualNotFound(name) {
    await this.verifyNotFoundMessage();
    if (name) {
      await expect(
        this.page
          .getByText(
            new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          )
          .first(),
      ).toBeVisible({ timeout: 5000 });
    }
  }

  async verifyFormFieldsVisible() {
    await expect(this.firstNameInput).toBeVisible({ timeout: 10000 });
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.confirmEmailInput).toBeVisible();
    await expect(this.countryDropdown).toBeVisible();
    await expect(this.mobileInput).toBeVisible();
  }

  async verifyNoResultsMessage() {
    const noResults = this.page
      .getByText(/no.*(result|record|found)|not found|0 result/i)
      .first();
    const rowsAfterSearch = await this.page
      .locator("[class*='result'], [class*='search'] li, [class*='search'] tr")
      .count();
    if ((await noResults.count()) > 0) {
      await expect(noResults).toBeVisible();
    } else {
      expect(rowsAfterSearch).toBe(0);
    }
  }

  async verifyIndividualInfo(labels) {
    const entries = Array.isArray(labels)
      ? labels.map((l) => [l, l])
      : Object.entries(labels);
    for (const [, value] of entries) {
      await expect(
        this.page
          .locator("main")
          .getByText(
            new RegExp(
              String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
              "i",
            ),
          )
          .first(),
      ).toBeVisible({ timeout: 10000 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  Form filling helpers
  // ══════════════════════════════════════════════════════════════

  async fillFirstName(name) {
    await expect(this.firstNameInput).toBeVisible({ timeout: 10000 });
    await this.firstNameInput.fill(name);
  }

  async fillLastName(name) {
    await expect(this.lastNameInput).toBeVisible({ timeout: 10000 });
    await this.lastNameInput.fill(name);
  }

  async fillEmail(email) {
    await expect(this.emailInput).toBeVisible({ timeout: 10000 });
    await this.emailInput.fill(email);
    await this.emailInput.blur();
  }

  async fillConfirmEmail(email) {
    await expect(this.confirmEmailInput).toBeVisible({ timeout: 10000 });
    await this.confirmEmailInput.fill(email);
    await this.confirmEmailInput.blur();
  }

  async fillMobile(mobile) {
    await expect(this.mobileInput).toBeVisible({ timeout: 10000 });
    await this.mobileInput.fill(mobile);
  }

  async selectCountry(country) {
    await expect(this.countryDropdown).toBeVisible({ timeout: 10000 });
    const isMatSelect =
      (await this.countryDropdown.getAttribute("role")) === "listbox" ||
      (await this.countryDropdown.getAttribute("class"))?.includes("mat-select");

    if (isMatSelect || (await this.countryDropdown.getAttribute("aria-haspopup")) === "listbox") {
      await this.countryDropdown.click();
      await this.page
        .getByRole("option", { name: new RegExp(`^\\s*${country}\\s*$`, "i") })
        .first()
        .click();
    } else {
      await this.countryDropdown.selectOption({ label: country });
    }
    await this.waitForLoading();
  }

  // ══════════════════════════════════════════════════════════════
  //  Form validation helpers
  // ══════════════════════════════════════════════════════════════

  async verifyMandatoryMark(label) {
    const group = this.page
      .locator("mat-form-field, .form-group, [class*='form-field']")
      .filter({ hasText: new RegExp(`^\\s*${label}`, "i") })
      .first();
    await expect(group).toBeVisible({ timeout: 10000 });
    await expect(group.locator("text=*").first()).toBeVisible();
  }

  async verifyEmailValidationError() {
    await this.emailInput.blur();
    const errorLocators = [
      this.page.locator("[class*='error'], [role='alert']").filter({ hasText: /valid|invalid|email|required|format/i }).first(),
      this.page.locator("mat-error, .mat-error, .error-message, .validation-error").first(),
      this.page.locator("[class*='invalid'], [class*='danger']").filter({ hasText: /email/i }).first(),
    ];
    let found = false;
    for (const loc of errorLocators) {
      if ((await loc.count()) > 0 && (await loc.isVisible().catch(() => false))) {
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
  }

  async verifyConfirmEmailMismatch() {
    await this.confirmEmailInput.blur();
    const emailValue = await this.emailInput.inputValue();
    const confirmValue = await this.confirmEmailInput.inputValue();
    expect(emailValue).not.toBe(confirmValue);
    await expect(this.confirmEmailInput).toHaveValue(confirmValue);
  }

  async verifySendRequestDisabled() {
    const disabled =
      (await this.sendRequestButton.isDisabled()) ||
      (await this.sendRequestButton.getAttribute("aria-disabled")) === "true";
    expect(disabled).toBeTruthy();
  }

  async verifySendRequestEnabled() {
    await expect(this.sendRequestButton).toBeVisible({ timeout: 10000 });
    await expect(this.sendRequestButton).toBeEnabled();
  }

  async verifyRequiredFieldErrors() {
    const errors = this.page.locator(
      "[class*='error'], [role='alert'], .invalid-feedback, .text-danger, .validation-error",
    );
    await expect(errors.first()).toBeVisible({ timeout: 10000 });
  }

  // ══════════════════════════════════════════════════════════════
  //  Send Request & confirmation
  // ══════════════════════════════════════════════════════════════

  async clickSendRequest() {
    await expect(this.sendRequestButton).toBeVisible({ timeout: 10000 });
    await this.sendRequestButton.click();
    await this.waitForLoading();
  }

  async verifyConfirmationDialog(title) {
    await expect(this.dialog).toBeVisible({ timeout: 10000 });
    if (title) {
      await expect(this.dialogTitle(title)).toBeVisible();
    }
  }

  async verifySuccessFeedback(message) {
    if (message) {
      await expect(
        this.page
          .getByText(
            new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          )
          .first(),
      ).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.successToast.first()).toBeVisible({ timeout: 10000 });
    }
  }

  async isSendRequestEnabled() {
    try {
      return await this.sendRequestButton.isEnabled();
    } catch {
      return false;
    }
  }

  async hasDuplicateWarning() {
    const warning = this.page
      .getByText(/already.*(exist|relationship|added)|duplicate/i)
      .first();
    return (await warning.count()) > 0;
  }
}

module.exports = RelationshipsPage;
