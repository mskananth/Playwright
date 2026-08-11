const { expect } = require("@playwright/test");

class MatterPage {
  constructor(page) {
    this.page = page;
    this.mattersMenu = page.locator('a[aria-label="Matters"]');
    this.legalMattersLink = page.locator('a:has-text("Legal Matters")');
    this.createMatterButton = page.getByRole("button", {
      name: "Create Matter",
    });
    this.caseTitleInput = page.locator("#title");
    this.caseTitleLabel = page.locator('label:has-text("Case Title")');
    this.caseNumberInput = page.locator("#caseNumbr");
    this.matterNumberInput = page.locator("#matterNumber");
    this.matterNumberLabel = page.locator('label:has-text("Matter Number")');
    this.matterNumberTooltipTrigger = page
      .locator('label:has-text("Matter Number")')
      .locator("xpath=..")
      .locator("i, .info, [title]");
    this.tooltip = page.locator('.mat-tooltip, .tooltip, [role="tooltip"]');
    this.createdDateInput = page.locator(
      'input[formcontrolname="created_date"], input[placeholder*="Created Date"]',
    );
    this.additionalDetails = page.getByText("Additional Details", {
      exact: true,
    });
    this.dateOfFilingInput = page.locator(
      'input[formcontrolname="date_of_filling"]',
    );

    this.descriptionInput = page.locator(
      'textarea[name="description"], textarea[formcontrolname="description"]',
    );
    this.descriptionCounter = page.locator(
      ".char-counter, .counter, .description-counter",
    );

    this.caseTypeSelect = page.locator(
      'select[formcontrolname="case_type"], select[name="case_type"], select[placeholder*="Case Type"], select[aria-label*="Case Type"]',
    );
    this.courtInput = page.locator('input[formcontrolname="court_name"]');

    this.judgesInput = page.locator('input[formcontrolname="judges"]');

    this.priorityText = page.getByText("Priority", { exact: true });
    this.priorityButtons = page.locator(
      '[role="tab"]:has-text("High"), [role="tab"]:has-text("Medium"), [role="tab"]:has-text("Low"), button:has-text("High"), button:has-text("Medium"), button:has-text("Low")',
    );
    this.priorityButtonsHigh = page.getByRole("tab", {
      name: "High",
      exact: true,
    });
    this.priorityButtonsMedium = page.getByRole("tab", {
      name: "Medium",
      exact: true,
    });
    this.priorityButtonsLow = page.getByRole("tab", {
      name: "Low",
      exact: true,
    });

    this.statusButtons = page.locator(
      '[role="tab"]:has-text("Active"), [role="tab"]:has-text("Pending"), [role="tab"]:has-text("Closed"), button:has-text("Active"), button:has-text("Pending"), button:has-text("Closed")',
    );

    this.prioritySelect = page.locator(
      'select[formcontrolname="priority"], select[name="priority"], select[placeholder*="Priority"], select[aria-label*="Priority"]',
    );
    this.statusSelect = page.locator(
      'select[formcontrolname="status"], select[name="status"], select[placeholder*="Status"], select[aria-label*="Status"]',
    );
    this.tagInput = page.locator(
      'input[formcontrolname="tags"], input[name="tags"], input[placeholder*="Tag"], input[aria-label*="Tag"]',
    );
    this.tagChips = page.locator(".tag-chip, .tag-pill, .tag-item, .mat-chip");

    this.opponentNameInput = page.locator(
      'input[formcontrolname="opponent_advocate_name"], input[placeholder*="Advocate Name"], input[placeholder*="Name"], input[name*="advocate"][name*="name"]',
    );
    this.opponentEmailInput = page.locator(
      'input[formcontrolname="opponent_advocate_email"], input[placeholder*="Advocate Email"], input[placeholder*="Email"], input[name*="email"]',
    );
    this.opponentPhoneInput = page.locator(
      'input[formcontrolname="opponent_advocate_phone"], input[placeholder*="Phone"], input[placeholder*="Mobile"], input[name*="phone"]',
    );
    this.MattersaveButton = page.getByRole("button", {
      name: /Save & Next|Save &amp; Next/,
    });
    this.saveForLaterButton = page.locator(
      'button:has-text("Save for Later"), button:has-text("Save for later"), input[value="Save for Later"], button:has-text("Save as Draft")',
    );
    this.cancelMatterButton = page.getByRole("button", {
      name: /Cancel|Close|Dismiss/,
    });
    this.optionalHint = page.locator(
      'text=Optional, label:has-text("Optional")',
    );
    this.sessionTimeoutBanner = page.locator(
      "text=Session Timeout, text=Your session will expire, .session-timeout, .timeout-alert",
    );
    this.listOfMattersTitle = page.locator("h2.page-title", {
      hasText: "List of Matters",
    });

    this.statusText = this.page.locator("p.prioritytxt.fontbold.pad", {
      hasText: "Status",
    });

    this.statusButtons = this.page.locator(
      '[role="tab"]:has-text("Active"), [role="tab"]:has-text("Pending"), [role="tab"]:has-text("Closed"), button:has-text("Active"), button:has-text("Pending"), button:has-text("Closed")',
    );

    this.tagsText = page.getByText("Tags", {
      exact: true,
    });

    this.tagInput = page.getByPlaceholder("Type to add Matter Tag(s)");

    this.addTagButton = page.getByRole("button", {
      name: "ADD",
      exact: true,
    });
    this.opponentAdvocateHeading = page.getByText("Opponent Advocate(s)", {
      exact: true,
    });

    this.plusButton = page.locator("i.fa.fa-plus-circle.plus");

    this.opponentAdvocateText = page.getByText("Opponent Advocate(s)", {
      exact: true,
    });

    this.addOpponentAdvocateButton = page.getByRole("button", {
      name: "+",
    });

    this.opponentAdvocateSection = page.locator("add-adivicate, add-advocate");

    this.opponentAdvocateNameInput =
      this.opponentAdvocateSection.getByPlaceholder("Name", { exact: true });

    this.opponentAdvocateEmailInput =
      this.opponentAdvocateSection.getByPlaceholder("Email", { exact: true });

    this.opponentAdvocatePhoneInput =
      this.opponentAdvocateSection.getByPlaceholder("Phone", { exact: true });

    this.cancelButton = this.opponentAdvocateSection.getByRole("button", {
      name: "Cancel",
    });

    this.saveButton = this.opponentAdvocateSection.getByRole("button", {
      name: "Save",
    });
  }

  async openLegalMatters() {
    await this.mattersMenu.click();
    await this.legalMattersLink.click();
    await this.page.waitForLoadState("networkidle");
  }

  async openCreateMatterDialog() {
    await this.createMatterButton.click();
    await this.page.waitForSelector("form", { timeout: 5000 });
  }

  async openMatterCreation() {
    await this.openLegalMatters();
    await this.openCreateMatterDialog();
  }

  async fillCaseTitle(title) {
    await this.caseTitleInput.fill(title);
  }

  async clearCaseTitle() {
    await this.caseTitleInput.clear();
  }

  async fillCaseNumber(caseNumber) {
    if ((await this.caseNumberInput.count()) > 0) {
      await this.caseNumberInput.fill(caseNumber);
    }
  }

  async fillCreatedDate(date) {
    if ((await this.createdDateInput.count()) > 0) {
      await this.createdDateInput.fill(date);
    }
  }
  async clickAdditionalDetails() {
    await this.additionalDetails.click();
  }

  async fillDateOfFiling(date) {
    // this.clickAdditionalDetails();
    if ((await this.dateOfFilingInput.count()) > 0) {
      await this.dateOfFilingInput.fill(date);
    }
  }

  async fillDescription(description) {
    if ((await this.descriptionInput.count()) > 0) {
      await this.descriptionInput.fill(description);
    }
  }

  async getDescriptionValue() {
    return this.descriptionInput.inputValue();
  }

  async getDescriptionCounterText() {
    if ((await this.descriptionCounter.count()) > 0) {
      return this.descriptionCounter.first().textContent();
    }
    return null;
  }

  async fillCaseType(value) {
    if ((await this.caseTypeSelect.count()) > 0) {
      await this.caseTypeSelect
        .selectOption({ label: value })
        .catch(async () => {
          await this.caseTypeSelect.fill(value);
        });
    }
  }

  async fillCourt(value) {
    if ((await this.courtInput.count()) > 0) {
      await this.courtInput.fill(value);
    }
  }

  async fillJudge(value) {
    if ((await this.judgeInput.count()) > 0) {
      await this.judgeInput.fill(value);
    }
  }

  async selectPriority(value) {
    if ((await this.prioritySelect.count()) > 0) {
      await this.prioritySelect
        .selectOption({ label: value })
        .catch(async () => {
          await this.prioritySelect.fill(value);
        });
    }
  }

  async selectStatus(value) {
    if ((await this.statusSelect.count()) > 0) {
      await this.statusSelect.selectOption({ label: value }).catch(async () => {
        await this.statusSelect.fill(value);
      });
    }
  }

  async getDropdownOptions(locator) {
    return locator.locator("option").allTextContents();
  }

  async addMatterTag(tag) {
    if ((await this.tagInput.count()) > 0) {
      await this.tagInput.fill(tag);
      await this.tagInput.press("Enter");
    }
  }

  async getTagCount() {
    return this.tagChips.count();
  }

  async openOpponentAdvocate() {
    if ((await this.plusButton.count()) > 0) {
      await this.plusButton.first().click();
    }
  }

  async fillOpponentAdvocate({ name, email, phone }) {
    if ((await this.opponentNameInput.count()) > 0 && name !== undefined) {
      await this.opponentNameInput.fill(name);
    }
    if ((await this.opponentEmailInput.count()) > 0 && email !== undefined) {
      await this.opponentEmailInput.fill(email);
    }
    if ((await this.opponentPhoneInput.count()) > 0 && phone !== undefined) {
      await this.opponentPhoneInput.fill(phone);
    }
  }

  async isSaveEnabled() {
    if ((await this.saveButton.count()) === 0) return false;
    return this.saveButton.isEnabled();
  }

  async isSaveDisabled() {
    return !(await this.isSaveEnabled());
  }

  async clickCancel() {
    if ((await this.cancelButton.count()) > 0) {
      await this.cancelButton.first().click();
    }
  }

  async clickSaveForLater() {
    const button = this.saveForLaterButton.first();

    if ((await button.count()) === 0) {
      return false;
    }

    await button.click();
    return true;
  }

  async clickSaveAndNext() {
    const button = this.MattersaveButton.first();

    if ((await button.count()) === 0) {
      return false;
    }

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await Promise.all([
      button.click(),
      this.page.waitForLoadState("networkidle"),
    ]);
    return true;
  }

  matterRowByTitle(title) {
    return this.page.getByText(title, { exact: true });
  }

  async verifyMatterCreatedInView(title) {
    await this.openLegalMatters();
    const row = this.matterRowByTitle(title);
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  async reload() {
    await this.page.reload({ waitUntil: "networkidle" });
  }

  async goBack() {
    await this.page.goBack();
  }

  async verifyCreateMatterFormVisible() {
    await expect(this.caseTitleInput).toBeVisible();
  }

  getPriorityButton(priority) {
    return this.page.getByRole("tab", {
      name: priority,
      exact: true,
    });
  }

  async verifyPrioritySectionVisible() {
    await expect(this.priorityText).toBeVisible();

    await expect(this.getPriorityButton("High")).toBeVisible();
    await expect(this.getPriorityButton("Medium")).toBeVisible();
    await expect(this.getPriorityButton("Low")).toBeVisible();
  }

  async selectPriorityButton(priority) {
    const button = this.getPriorityButton(priority);

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await button.click();
  }

  async isPrioritySelected(priority) {
    const button = this.getPriorityButton(priority);

    const ariaSelected = await button.getAttribute("aria-selected");

    if (ariaSelected !== null) {
      return ariaSelected === "true";
    }

    const ariaPressed = await button.getAttribute("aria-pressed");

    if (ariaPressed !== null) {
      return ariaPressed === "true";
    }

    return false;
  }

  async verifyPrioritySelected(priority) {
    const button = this.getPriorityButton(priority);

    await expect(button).toBeVisible();

    const ariaSelected = await button.getAttribute("aria-selected");

    if (ariaSelected !== null) {
      await expect(button).toHaveAttribute("aria-selected", "true");
      return;
    }

    const ariaPressed = await button.getAttribute("aria-pressed");

    if (ariaPressed !== null) {
      await expect(button).toHaveAttribute("aria-pressed", "true");
      return;
    }

    throw new Error(
      `Priority "${priority}" does not have aria-selected or aria-pressed attribute`,
    );
  }

  async verifyPriorityNotSelected(priority) {
    const button = this.getPriorityButton(priority);

    const ariaSelected = await button.getAttribute("aria-selected");

    if (ariaSelected !== null) {
      await expect(button).toHaveAttribute("aria-selected", "false");
      return;
    }

    const ariaPressed = await button.getAttribute("aria-pressed");

    if (ariaPressed !== null) {
      await expect(button).toHaveAttribute("aria-pressed", "false");
      return;
    }
  }

  async getPriorityOptions() {
    return this.priorityButtons.allTextContents();
  }

  async verifyPriorityOptionsOrder() {
    const priorities = this.page.locator('[role="tab"], button').filter({
      hasText: /^(High|Medium|Low)$/,
    });

    await expect(priorities).toHaveText(["High", "Medium", "Low"]);
  }

  getStatusButton(status) {
    return this.page.locator('[role="tab"], button').filter({
      hasText: new RegExp(`^${status}$`),
    });
  }

  async verifyStatusSectionVisible() {
    await expect(this.statusText).toBeVisible();

    await expect(this.getStatusButton("Active")).toBeVisible();
    await expect(this.getStatusButton("Pending")).toBeVisible();
  }

  async verifyStatusButtonsEnabled() {
    await expect(this.getStatusButton("Active")).toBeEnabled();
    await expect(this.getStatusButton("Pending")).toBeEnabled();
  }

  async selectStatusButton(status) {
    const button = this.getStatusButton(status);

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await button.click();
  }

  async verifyStatusSelected(status) {
    const button = this.getStatusButton(status);

    await expect(button).toHaveAttribute("aria-selected", "true");
  }

  async verifyStatusNotSelected(status) {
    const button = this.getStatusButton(status);

    await expect(button).toHaveAttribute("aria-selected", "false");
  }

  async verifyDefaultStatus() {
    await this.verifyStatusSelected("Active");

    await this.verifyStatusNotSelected("Pending");
  }

  async verifyStatusOrder() {
    await expect(this.statusButtons).toHaveText(["Active", "Pending"]);
  }
  async verifyTagsSectionVisible() {
    // await expect(this.tagsText).isVisible();
    await expect(this.tagsText).toBeVisible();

    await expect(this.tagInput).toBeVisible();

    await expect(this.addTagButton).toBeVisible();
  }

  async verifyTagsInputEnabled() {
    await expect(this.tagInput).toBeEnabled();
    await expect(this.addTagButton).toBeEnabled();
  }

  async enterTag(tag) {
    await expect(this.tagInput).toBeVisible();
    await this.tagInput.fill(tag);
  }

  async clickAddTag() {
    await expect(this.addTagButton).toBeVisible();
    await expect(this.addTagButton).toBeEnabled();

    await this.addTagButton.click();
  }

  async addTag(tag) {
    await this.enterTag(tag);
    await this.clickAddTag();
  }

  async verifyTagInputValue(value) {
    await expect(this.tagInput).toHaveValue(value);
  }

  async verifyTagInputIsEmpty() {
    await expect(this.tagInput).toHaveValue("");
  }

  async verifyTagDisplayed(tag) {
    await expect(this.page.getByText(tag, { exact: true })).toBeVisible();
  }
  async addTagPlusButton() {
    await expect(this.plusButton).toBeVisible();
    await expect(this.plusButton).toBeEnabled();

    await this.plusButton.click();

    await expect(this.opponentAdvocateSection).toBeVisible();
  }

  async verifyOpponentAdvocateHeadingVisible() {
    await expect(this.opponentAdvocateHeading).toBeVisible();
  }

  async verifyAddOpponentAdvocateButtonVisible() {
    await expect(this.plusButton).toBeVisible();
  }

  async verifyAddOpponentAdvocateButtonEnabled() {
    await expect(this.plusButton).toBeEnabled();
  }

  async verifyOpponentAdvocateSectionVisible() {
    await this.plusButton.click();

    await expect(this.opponentAdvocateText).toBeVisible();

    // await expect(this.addOpponentAdvocateButton).toBeVisible();
    // await page.mouse.wheel(0, 500);

    await expect(this.opponentAdvocateNameInput).toBeVisible();

    await expect(this.opponentAdvocateEmailInput).toBeVisible();

    await expect(this.opponentAdvocatePhoneInput).toBeVisible();

    await expect(this.cancelButton).toBeVisible();

    await expect(this.saveButton).toBeVisible();
  }

  async verifyOpponentAdvocateFieldsEnabled() {
    await this.plusButton.click();

    await expect(this.opponentAdvocateNameInput).toBeEnabled();

    await expect(this.opponentAdvocateEmailInput).toBeEnabled();

    await expect(this.opponentAdvocatePhoneInput).toBeEnabled();
  }

  async verifyOpponentAdvocateButtonsEnabled() {
    await this.plusButton.click();

    await expect(this.addOpponentAdvocateButton).toBeEnabled();

    await expect(this.cancelButton).toBeEnabled();

    await expect(this.saveButton).toBeEnabled();
  }
  async enterOpponentAdvocateName(name) {
    await this.opponentAdvocateNameInput.fill(name);
  }

  async enterOpponentAdvocateEmail(email) {
    await this.opponentAdvocateEmailInput.fill(email);
  }

  async enterOpponentAdvocatePhone(phone) {
    await this.opponentAdvocatePhoneInput.fill(phone);
  }
  async enterOpponentAdvocateDetails(name, email, phone) {
    await this.enterOpponentAdvocateName(name);
    await this.enterOpponentAdvocateEmail(email);
    await this.enterOpponentAdvocatePhone(phone);
  }

  async verifyOpponentAdvocateDetails(name, email, phone) {
    await expect(this.opponentAdvocateNameInput).toHaveValue(name);

    await expect(this.opponentAdvocateEmailInput).toHaveValue(email);

    await expect(this.opponentAdvocatePhoneInput).toHaveValue(phone);
  }

  async clickAddOpponentAdvocate() {
    await expect(this.saveButton).toBeVisible();
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
  }

  async clickSave() {
    await this.saveButton.click();
  }
}

module.exports = MatterPage;
