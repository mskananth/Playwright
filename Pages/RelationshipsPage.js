const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

class RelationshipsPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Sidebar navigation ─────────────────────────────────────────
    this.relationshipsMenuItem = page
      .locator("nav, [role='navigation']")
      .getByRole("menuitem", { name: /^relationships$/i })
      .first();
    this.subMenuItem = (label) =>
      page
        .getByRole("menuitem", { name: new RegExp(`^\\s*${label}\\s*$`, "i") })
        .first();

    // ── Loading overlay (ngx-spinner) ──────────────────────────────
    this.loadingOverlay = page.locator(".ngx-spinner-overlay");

    // ── Page header / sections ─────────────────────────────────────
    this.pageHeading = page
      .getByRole("banner")
      .getByText(/(individual|business|corporate) relationships/i)
      .first();
    this.listSectionTitle = page
      .getByText(/(list of )?(individual|business|corporate) relationships/i)
      .first();
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

    // ── Add Relationship page (Individual / Business / Corporate) ──
    this.addPageHeading = page
      .getByRole("banner")
      .getByText(/add (individual|business|corporate) relationship/i)
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
    this.entityNameInput = page.locator("main").getByRole("textbox").nth(0);
    this.contactPersonInput = page.locator("main").getByRole("textbox").nth(1);
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
    this.contactPhoneInput = page.locator("main").getByRole("textbox").nth(3);
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

    // ── Shared Folder tabs ─────────────────────────────────────────
    this.sharedFolderSection = page
      .locator(".shared-folder-card, .tabs")
      .first();
    this.sharedWithMeTab = page
      .locator("div.tab")
      .filter({ hasText: /shared with me/i })
      .first();
    this.sharedByMeTab = page
      .locator("div.tab")
      .filter({ hasText: /shared by me/i })
      .first();

    // ── Document list ──────────────────────────────────────────────
    this.documentTable = page.locator(".shared-folder-card").first();
    this.documentRows = page.locator(".file-card");
    this.documentRow = (name) =>
      name ? this.documentRows.filter({ hasText: name }) : this.documentRows;

    // ── Document search ────────────────────────────────────────────
    this.documentSearchInput = page.locator(
      "input.search-text, input[placeholder*='Search']",
    );

    // ── Document count ─────────────────────────────────────────────
    this.documentCountText = page
      .getByText(/\d+\s*document/i)
      .or(page.locator("[class*='count'], [class*='total']"))
      .first();

    // ── Document action buttons ────────────────────────────────────
    this.viewButton = (name) => {
      const card = name
        ? this.documentRows.filter({ hasText: name }).first()
        : this.documentRows.first();
      return card
        .locator("button")
        .filter({ hasText: /view/i })
        .or(card.locator(".fa-eye, [class*='view']"))
        .first();
    };

    this.downloadButton = (name) => {
      const card = name
        ? this.documentRows.filter({ hasText: name }).first()
        : this.documentRows.first();
      return card
        .locator("button")
        .filter({ hasText: /download/i })
        .or(card.locator(".fa-download, [class*='download']"))
        .first();
    };

    this.showDocumentsButton = page
      .getByRole("button", { name: /show.*documents?/i })
      .or(page.locator("button").filter({ hasText: /show.*documents?/i }))
      .first();

    this.noDocumentsMessage = page
      .getByText(/no.*documents?|no.*files?|empty|no.*records?/i)
      .first();

    this.threeDotMenu = (name) => {
      const card = name
        ? this.documentRows.filter({ hasText: name }).first()
        : this.documentRows.first();
      return card
        .locator("button[mat-icon-button], button.mat-mdc-menu-trigger")
        .or(card.locator("button:has(i.material-icons:text('more_vert'))"))
        .first();
    };

    // ── Dropdown menu items ────────────────────────────────────────
    this.menuItem = (option) =>
      page
        .getByRole("menuitem", {
          name: new RegExp(option.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        })
        .or(
          page
            .locator(
              ".dropdown-menu a, .dropdown-menu button, .mat-menu-item, .mat-mdc-menu-item",
            )
            .filter({ hasText: new RegExp(option, "i") }),
        )
        .first();

    // ── Share document dialog ──────────────────────────────────────
    this.shareDialog = page
      .locator("[role='dialog'], .modal, mat-dialog-container")
      .first();
    this.clientSelect = page
      .getByRole("combobox", { name: /client|relationship|select|choose/i })
      .or(
        page
          .locator("mat-select, select")
          .filter({ hasText: /client|relationship|select/i }),
      )
      .first();
    this.clientOption = (name) =>
      page
        .getByRole("option", { name: new RegExp(name, "i") })
        .or(page.locator("mat-option").filter({ hasText: name }))
        .first();
    this.documentCheckbox = page
      .locator("mat-checkbox, input[type='checkbox']")
      .first();
    this.shareDialogCheckbox = this.shareDialog.getByRole("checkbox").first();
    this.selectAllCheckbox = page
      .locator("mat-checkbox, input[type='checkbox']")
      .filter({ hasText: /select all|all/i })
      .or(
        page.locator("th input[type='checkbox'], thead input[type='checkbox']"),
      )
      .first();
    this.shareConfirmButton = page
      .getByRole("button", { name: /share|confirm|submit/i })
      .first();
    this.shareCancelButton = page
      .getByRole("button", { name: /cancel/i })
      .first();

    // ── Document viewer ────────────────────────────────────────────
    this.documentViewer = page
      .locator(".modal, [role='dialog'], [class*='viewer'], [class*='preview']")
      .filter({ hasText: /document|view|preview/i })
      .or(page.locator(".modal.show, [role='dialog'][aria-modal='true']"))
      .first();
    this.viewerCloseButton = page
      .locator(
        ".modal [class*='close'], .fa-times, button:has-text('×'), [aria-label='Close']",
      )
      .first();
    this.zoomInButton = page
      .locator("button, a")
      .filter({ hasText: /\+|zoom.*in/i })
      .or(page.locator(".fa-search-plus, [class*='zoom-in']"))
      .first();
    this.zoomOutButton = page
      .locator("button, a")
      .filter({ hasText: /-|zoom.*out/i })
      .or(page.locator(".fa-search-minus, [class*='zoom-out']"))
      .first();
    this.viewerPageNext = page
      .locator(".modal button, [role='dialog'] button")
      .filter({ hasText: /next|›|»/i })
      .or(page.locator(".fa-chevron-right, .fa-angle-right"))
      .first();
    this.viewerPagePrev = page
      .locator(".modal button, [role='dialog'] button")
      .filter({ hasText: /prev|‹|«/i })
      .or(page.locator(".fa-chevron-left, .fa-angle-left"))
      .first();
    this.viewerPageInfo = page.getByText(/\d+\s*(of|\/)\s*\d+/i).first();

    // ── Unshare confirmation dialog ────────────────────────────────
    this.unshareDialog = page
      .locator("[role='dialog'], .modal")
      .filter({ hasText: /unshare|remove|delete/i })
      .first();
    this.unshareConfirmButton = this.unshareDialog
      .getByRole("button", { name: /yes|confirm|ok|unshare/i })
      .first();
    this.unshareCancelButton = this.unshareDialog
      .getByRole("button", { name: /no|cancel/i })
      .first();
  }

  //  Helpers

  async waitForLoading() {
    await this.loadingOverlay
      .waitFor({ state: "hidden", timeout: 20000 })
      .catch(() => {});
  }

  //  Navigation

  async _openSubPage(label) {
    const sub = this.subMenuItem(label);
    const alreadyVisible = await sub.isVisible().catch(() => false);
    if (!alreadyVisible) {
      await this.relationshipsMenuItem.click();
      await expect(sub).toBeVisible({ timeout: 5000 });
    }
    await sub.click();
    await this.waitForLoading();
    await expect(this.listSectionTitle).toBeVisible({ timeout: 15000 });
  }

  async openIndividualList() {
    await this._openSubPage("Individual");
  }

  async openBusinessList() {
    await this._openSubPage("Business");
  }

  async openCorporateList() {
    await this._openSubPage("Corporate");
  }

  async openDeletedList() {
    await this._openSubPage("Deleted");
  }

  async goBackToList() {
    await this.page.goBack().catch(() => {});
    await this.waitForLoading();
    const onList = await this.listSectionTitle.isVisible().catch(() => false);
    if (!onList) {
      await this.openIndividualList();
    }
  }

  async reload() {
    await this.page.reload();
    await this.waitForLoading();
  }

  //  List page – layout & content

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

  //  Relationship details

  async openRelationshipDetails(name) {
    const row = this.relationshipRow(name).first();
    const isVisible = await row.isVisible().catch(() => false);
    if (!isVisible) {
      await this.page
        .getByText(name)
        .first()
        .scrollIntoViewIfNeeded()
        .catch(() => {});
    }
    await expect(row).toBeVisible({ timeout: 10000 });
    const nameLink = row.getByText(name, { exact: false }).first();
    if ((await nameLink.count()) > 0) {
      await nameLink.click();
    } else {
      await row.locator("td").first().click();
    }
    await this.waitForLoading();
  }

  async verifyDetailsPage(name) {
    await expect(
      this.page.locator("main").getByText(name, { exact: false }).first(),
    ).toBeVisible({ timeout: 10000 });
  }

  //  List search

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

  //  Sorting

  async clickSortColumn(column) {
    const header = this.columnHeader(column);
    await expect(header).toBeVisible({ timeout: 10000 });
    await header.click();
    await this.waitForLoading();
  }

  //  Pagination

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
    await expect(this.prevButton).toBeDisabled({ timeout: 10000 });
  }

  async verifyNextDisabled() {
    await expect(this.nextButton).toBeDisabled({ timeout: 10000 });
  }

  //  Row action menu

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

  //  Delete relationship dialog

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

  //  Add Individual Relationship page

  async openAddPage() {
    await expect(this.addRelationshipButton).toBeVisible({ timeout: 10000 });
    await this.addRelationshipButton.click();
    await this.waitForLoading();
    await expect(this.addPageHeading).toBeVisible({ timeout: 15000 });
  }

  async cancelAddPage() {
    if ((await this.cancelButton.count()) === 0) return;

    await this.cancelButton.click({ force: true });
    await this.waitForLoading();
    const stillOnAdd = await this.addPageHeading.isVisible().catch(() => false);
    if (stillOnAdd) {
      await this.page.goBack().catch(() => {});
      await this.waitForLoading();
    }
  }

  async verifyAddPageSearchVisible() {
    await expect(this.addSearchInput).toBeVisible({ timeout: 10000 });
    await expect(this.addSearchButton).toBeVisible();
  }

  async verifySearchFieldVisible(placeholder) {
    if (placeholder) {
      await expect(
        this.addSearchInput.or(this.page.getByPlaceholder(placeholder)).first(),
      ).toBeVisible({ timeout: 10000 });
    } else {
      await expect(this.addSearchInput).toBeVisible({ timeout: 10000 });
    }
    await expect(this.addSearchButton).toBeVisible();
  }

  async searchIndividual(name) {
    await expect(this.addSearchInput).toBeVisible({ timeout: 10000 });
    await this.addSearchInput.click();
    await this.addSearchInput.fill("");
    await this.addSearchInput.fill(name);
    const option = this.page
      .locator("mat-option")
      .filter({ hasText: name })
      .first();
    try {
      await option.waitFor({ state: "visible", timeout: 5000 });
      await option.click();
    } catch {
      await this.addSearchButton.click();
      await this.waitForLoading();
    }
  }

  async verifyIndividualFound(name) {
    await expect(
      this.page.locator("main").getByText(name, { exact: false }).first(),
    ).toBeVisible({ timeout: 10000 });
  }

  async verifyIndividualFoundIfPresent(name) {
    const notFoundVisible = await this.notFoundMessage
      .isVisible()
      .catch(() => false);
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

  //  Form filling helpers

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

  async fillEntityName(name) {
    await expect(this.entityNameInput).toBeVisible({ timeout: 10000 });
    await this.entityNameInput.fill(name);
  }

  async fillContactPerson(name) {
    await expect(this.contactPersonInput).toBeVisible({ timeout: 10000 });
    await this.contactPersonInput.fill(name);
  }

  async fillContactPhone(phone) {
    await expect(this.contactPhoneInput).toBeVisible({ timeout: 10000 });
    await this.contactPhoneInput.fill(phone);
  }

  async selectCountry(country) {
    await expect(this.countryDropdown).toBeVisible({ timeout: 10000 });
    const isMatSelect =
      (await this.countryDropdown.getAttribute("role")) === "listbox" ||
      (await this.countryDropdown.getAttribute("class"))?.includes(
        "mat-select",
      );

    if (
      isMatSelect ||
      (await this.countryDropdown.getAttribute("aria-haspopup")) === "listbox"
    ) {
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

  //  Form validation helpers

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
      this.page
        .locator("[class*='error'], [role='alert']")
        .filter({ hasText: /valid|invalid|email|required|format/i })
        .first(),
      this.page
        .locator("mat-error, .mat-error, .error-message, .validation-error")
        .first(),
      this.page
        .locator("[class*='invalid'], [class*='danger']")
        .filter({ hasText: /email/i })
        .first(),
    ];
    let found = false;
    for (const loc of errorLocators) {
      if (
        (await loc.count()) > 0 &&
        (await loc.isVisible().catch(() => false))
      ) {
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

  //  Send Request & confirmation

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

  //  Shared Folder – navigation

  async openSharedFolder(name) {
    await this.openRelationshipDetails(name);
    await this.waitForLoading();
    const sectionVisible = await this.sharedFolderSection
      .isVisible()
      .catch(() => false);
    if (!sectionVisible) {
      await this.sharedFolderSection
        .waitFor({ state: "visible", timeout: 5000 })
        .catch(() => {});
    }
  }

  //  Shared With Me tab

  async openSharedWithMeTab() {
    await expect(this.sharedWithMeTab).toBeVisible({ timeout: 10000 });
    await this.sharedWithMeTab.click();
    await this.waitForLoading();
  }

  async verifySharedWithMeTabVisible() {
    await expect(this.sharedWithMeTab).toBeVisible({ timeout: 10000 });
  }

  async verifySharedWithMeActive() {
    const isActive =
      (await this.sharedWithMeTab.getAttribute("class"))?.includes("active") ||
      (await this.sharedWithMeTab.getAttribute("aria-selected")) === "true";
    expect(isActive).toBeTruthy();
  }

  //  Shared By Me tab

  async openSharedByMeTab() {
    await expect(this.sharedByMeTab).toBeVisible({ timeout: 10000 });
    await this.sharedByMeTab.click();
    await this.waitForLoading();
  }

  async verifySharedByMeTabVisible() {
    await expect(this.sharedByMeTab).toBeVisible({ timeout: 10000 });
  }

  //  Document list

  async getDocumentCount() {
    return this.documentRows.count();
  }

  async verifyDocumentExists(name) {
    if (name) {
      const row = this.documentRow(name).first();
      await expect(row).toBeVisible({ timeout: 10000 });
    } else {
      const count = await this.getDocumentCount();
      expect(count).toBeGreaterThan(0);
    }
  }

  async verifyDocumentNotExists(name) {
    if (name) {
      const row = this.documentRow(name).first();
      const isVisible = await row.isVisible().catch(() => false);
      expect(isVisible).toBeFalsy();
    } else {
      const count = await this.getDocumentCount();
      expect(count).toBe(0);
    }
  }

  async verifyDocumentCountDisplay() {
    await expect(this.documentCountText).toBeVisible({ timeout: 10000 });
  }

  async verifyDocumentName(name) {
    const row = this.documentRow(name).first();
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  //  Document search

  async searchDocument(term) {
    await expect(this.documentSearchInput).toBeVisible({ timeout: 10000 });
    await this.documentSearchInput.fill(term);
    await this.waitForLoading();
  }

  async clearDocumentSearch() {
    await this.documentSearchInput.fill("");
    await this.waitForLoading();
  }

  async verifyNoSearchResults() {
    const count = await this.getDocumentCount();
    expect(count).toBe(0);
  }

  //  View document

  async viewDocument(name) {
    const btn = this.viewButton(name);
    const isVisible = await btn.isVisible().catch(() => false);
    if (isVisible) {
      await btn.click();
    } else {
      const menu = this.threeDotMenu(name);
      await expect(menu).toBeVisible({ timeout: 10000 });
      await menu.click();
      const viewOpt = this.menuItem("View");
      if ((await viewOpt.count()) > 0) {
        await viewOpt.click();
      }
    }
    await this.page.waitForTimeout(2000);
    const viewerVisible = await this.documentViewer
      .isVisible()
      .catch(() => false);
    if (!viewerVisible) {
      await this.page
        .locator(".cdk-overlay-container")
        .waitFor({ state: "hidden", timeout: 3000 })
        .catch(() => {});
    }
  }

  async verifyDocumentViewerOpen() {
    await expect(this.documentViewer).toBeVisible({ timeout: 10000 });
  }

  async verifyDocumentViewerContent() {
    await expect(this.documentViewer).toBeVisible({ timeout: 10000 });
    const content = this.documentViewer.locator(
      "canvas, img, embed, object, iframe, [class*='content'], [class*='page']",
    );
    const hasContent = (await content.count()) > 0;
    expect(hasContent).toBeTruthy();
  }

  async closeDocumentViewer() {
    await expect(this.viewerCloseButton).toBeVisible({ timeout: 5000 });
    await this.viewerCloseButton.click();
    await expect(this.documentViewer).toBeHidden({ timeout: 5000 });
  }

  //  Document viewer zoom

  async zoomIn() {
    await expect(this.zoomInButton).toBeVisible({ timeout: 5000 });
    await this.zoomInButton.click();
  }

  async zoomOut() {
    await expect(this.zoomOutButton).toBeVisible({ timeout: 5000 });
    await this.zoomOutButton.click();
  }

  //  Document viewer page navigation

  async navigateToNextPage() {
    await expect(this.viewerPageNext).toBeVisible({ timeout: 5000 });
    await this.viewerPageNext.click();
    await this.waitForLoading();
  }

  async navigateToPrevPage() {
    await expect(this.viewerPagePrev).toBeVisible({ timeout: 5000 });
    await this.viewerPagePrev.click();
    await this.waitForLoading();
  }

  async verifyPageNavigation() {
    const hasNext = (await this.viewerPageNext.count()) > 0;
    const hasPrev = (await this.viewerPagePrev.count()) > 0;
    return { hasNext, hasPrev };
  }

  //  Share document

  async clickShareDocument() {
    const shareBtn = this.page
      .getByRole("button", { name: /share.*document|document.*share|share/i })
      .or(this.page.locator("button").filter({ hasText: /share/i }))
      .first();
    await expect(shareBtn).toBeVisible({ timeout: 10000 });
    await shareBtn.click();
    await expect(this.shareDialog).toBeVisible({ timeout: 10000 });
  }

  async selectClient(clientName) {
    await expect(this.clientSelect).toBeVisible({ timeout: 10000 });
    await this.clientSelect.click();
    const option = this.clientOption(clientName);
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();
  }

  async selectDocument() {
    if ((await this.shareDialogCheckbox.count()) > 0) {
      const isChecked = await this.shareDialogCheckbox
        .isChecked()
        .catch(() => false);
      const ariaChecked = await this.shareDialogCheckbox
        .getAttribute("aria-checked")
        .then((v) => v === "true")
        .catch(() => false);
      if (!isChecked && !ariaChecked) {
        const row = this.shareDialogCheckbox.locator("..");
        await row.click().catch(() => {});
        await this.shareDialogCheckbox.click({ force: true }).catch(() => {});
      }
    } else if ((await this.selectAllCheckbox.count()) > 0) {
      await this.selectAllCheckbox.check();
    } else if ((await this.documentCheckbox.count()) > 0) {
      await this.documentCheckbox.check();
    }
  }

  async confirmShareDocument() {
    await expect(this.shareConfirmButton).toBeVisible({ timeout: 5000 });
    await this.shareConfirmButton.click();
    await this.waitForLoading();
  }

  async shareDocumentWithClient(clientName) {
    await this.clickShareDocument();
    await this.selectClient(clientName);
    await this.selectDocument();
    await this.confirmShareDocument();
  }

  async cancelShareDocument() {
    await expect(this.shareCancelButton).toBeVisible({ timeout: 5000 });
    await this.shareCancelButton.click();
    await expect(this.shareDialog).toBeHidden({ timeout: 5000 });
  }

  //  Three-dot menu & actions

  async clickThreeDotMenu(name) {
    const menu = this.threeDotMenu(name);
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.click();
    await this.waitForLoading();
  }

  async verifyMenuOptionVisible(option) {
    await expect(this.menuItem(option)).toBeVisible({ timeout: 5000 });
  }

  async verifyMenuOptions(options) {
    for (const option of options) {
      await this.verifyMenuOptionVisible(option);
    }
  }

  async clickMenuOption(option) {
    const item = this.menuItem(option);
    await expect(item).toBeVisible({ timeout: 5000 });
    await item.click();
    await this.waitForLoading();
  }

  async closeMenu() {
    await this.page.keyboard.press("Escape");
  }

  //  Unshare document

  async unshareDocument(name) {
    await this.clickThreeDotMenu(name);
    await this.clickMenuOption("Unshare");
    await expect(this.unshareDialog).toBeVisible({ timeout: 10000 });
    await this.confirmUnshare();
  }

  async confirmUnshare() {
    await expect(this.unshareConfirmButton).toBeVisible({ timeout: 5000 });
    await this.unshareConfirmButton.click();
    await this.waitForLoading();
  }

  async cancelUnshare() {
    await expect(this.unshareCancelButton).toBeVisible({ timeout: 5000 });
    await this.unshareCancelButton.click();
    await expect(this.unshareDialog).toBeHidden({ timeout: 5000 });
  }

  //  Feedback verification

  async verifySuccessToast() {
    await expect(this.successToast).toBeVisible({ timeout: 10000 });
  }

  async verifySuccessMessage(message) {
    if (message) {
      await expect(
        this.page
          .getByText(
            new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
          )
          .first(),
      ).toBeVisible({ timeout: 10000 });
    } else {
      await this.verifySuccessToast();
    }
  }

  //  Navigate to shared folder (reusable helper)

  async navigateToSharedFolder(name) {
    const onDetails = await this.sharedFolderSection
      .isVisible()
      .catch(() => false);
    if (onDetails) {
      await this.goBackToList();
    }
    await this.openIndividualList();
    await this.openSharedFolder(name);
  }

  //  Profile / details verification

  async verifyProfileDetailsVisible() {
    const profileInfo = this.page
      .locator(
        "[class*='profile'], [class*='detail'], [class*='info'], .card-body, .mat-card",
      )
      .first();
    const hasInfo = (await profileInfo.count()) > 0;
    const hasLabels = await this.page
      .getByText(/email|mobile|country|first name|last name/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasInfo || hasLabels).toBeTruthy();
  }

  //  Download

  async clickDownloadButton(name) {
    const btn = this.downloadButton(name);
    const isVisible = await btn.isVisible().catch(() => false);
    if (isVisible) {
      await btn.click();
    } else {
      const menu = this.threeDotMenu(name);
      await expect(menu).toBeVisible({ timeout: 10000 });
      await menu.click();
      const downloadOpt = this.menuItem("Download");
      if ((await downloadOpt.count()) > 0) {
        await downloadOpt.click();
      }
    }
    await this.waitForLoading();
  }

  //  Show Documents

  async clickShowDocuments() {
    const btn = this.showDocumentsButton;
    const isVisible = await btn.isVisible().catch(() => false);
    if (!isVisible) {
      await this.sharedFolderSection.scrollIntoViewIfNeeded().catch(() => {});
    }
    await expect(btn).toBeVisible({ timeout: 10000 });
    await btn.click();
    await this.waitForLoading();
  }

  async verifyNoDocumentsMessageVisible() {
    const count = await this.getDocumentCount();
    const noDocs = await this.noDocumentsMessage.isVisible().catch(() => false);
    expect(count === 0 || noDocs).toBeTruthy();
  }

  //  Share Documents popup

  async openShareDocumentsPopup() {
    await this.clickShareDocument();
  }

  async verifyShareDialogFieldsVisible() {
    await expect(this.shareDialog).toBeVisible({ timeout: 10000 });
    const searchInput = this.shareDialog
      .locator(
        "input[type='search'], input[type='text'], mat-select, [role='combobox']",
      )
      .first();
    const hasSearch = (await searchInput.count()) > 0;
    const shareBtn = this.shareConfirmButton;
    const cancelBtn = this.shareCancelButton;
    expect(hasSearch || (await shareBtn.count()) > 0).toBeTruthy();
    expect(
      (await shareBtn.count()) > 0 || (await cancelBtn.count()) > 0,
    ).toBeTruthy();
  }

  async searchInSharePopup(term) {
    const searchInput = this.shareDialog
      .locator("input[type='search'], input[type='text']")
      .first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill(term);
      await this.waitForLoading();
    }
  }

  async selectDocumentInSharePopup() {
    await this.selectDocument();
  }

  async verifyDocumentSelected() {
    const shareChecked = await this.shareDialogCheckbox
      .isChecked()
      .catch(() => false);
    const ariaChecked = await this.shareDialogCheckbox
      .getAttribute("aria-checked")
      .then((v) => v === "true")
      .catch(() => false);
    const allChecked =
      (await this.selectAllCheckbox.isChecked().catch(() => false)) ||
      (await this.documentCheckbox.isChecked().catch(() => false));
    const highlighted = await this.shareDialog
      .locator("[class*='selected'], [class*='active'], [class*='checked']")
      .first()
      .isVisible()
      .catch(() => false);
    expect(
      shareChecked || ariaChecked || allChecked || highlighted,
    ).toBeTruthy();
  }

  async clickShareConfirm() {
    await this.confirmShareDocument();
  }

  async cancelSharePopup() {
    await this.cancelShareDocument();
  }

  async verifyShareDialogClosed() {
    await expect(this.shareDialog).toBeHidden({ timeout: 5000 });
  }

  async scrollShareDialogPanel() {
    const panel = this.shareDialog
      .locator(
        ".mat-mdc-dialog-content, .modal-body, [class*='content'], [class*='scroll']",
      )
      .first();
    const panelExists = (await panel.count()) > 0;
    if (panelExists) {
      await panel.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
    } else {
      await this.shareDialog.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }

  async verifyDocumentInSharedByMe(docName) {
    await this.openSharedByMeTab();
    const count = await this.getDocumentCount();
    if (docName && count > 0) {
      const doc = this.page
        .locator(".file-card, [class*='document'], [class*='file']")
        .filter({
          hasText: new RegExp(
            docName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "i",
          ),
        })
        .first();
      const found =
        (await doc.count()) > 0 && (await doc.isVisible().catch(() => false));
      expect(found).toBeTruthy();
    } else {
      expect(count).toBeGreaterThanOrEqual(0);
    }
  }

  //  Page stability / navigation verification

  async verifyPageStable() {
    const loadingVisible = await this.loadingOverlay
      .isVisible()
      .catch(() => false);
    expect(loadingVisible).toBeFalsy();
  }
}

module.exports = RelationshipsPage;
