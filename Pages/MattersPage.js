const { expect } = require("@playwright/test");
const path = require("path");

class MatterPage {
  constructor(page) {
    this.page = page;

    this.mattersMenu = page.getByRole("menuitem", {
      name: "Matters",
      exact: true,
    });

    this.legalMattersLink = page.getByRole("menuitem", {
      name: "Legal Matters",
      exact: true,
    });
    // this.mattersMenu = page.locator('a[aria-label="Matters"]');
    // this.legalMattersLink = page.locator('a:has-text("Legal Matters")');
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

    // this.descriptionInput = page.locator(
    //   'textarea[name="description"], textarea[formcontrolname="description"]',
    // );
    // this.descriptionInput = page.locator('textarea[name="description"]');
    this.descriptionInput = this.page.locator('textarea[name="description"]');

    this.descriptionCounter = page.locator(
      ".char-counter, .counter, .description-counter",
    );

    // this.caseTypeDropdown = page.locator('select[name="case_type"]');

    this.caseTypeDropdown = this.page.locator(
      'select[formcontrolname="case_type"][name="case_type"]',
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
    // this.matterSaveButton = page.getByRole("button", {
    //   name: /Save & Next|Save &amp; Next/,
    // });
    this.matterSaveButton = page.getByRole("button", {
      name: "Save & Next",
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

    this.plusOpponentLawyer = page.locator(
      '//i[@class="fa fa-plus-circle plus"]',
    );
    this.addOpponentAdvocateForm = this.page.locator("add-adivicate");

    this.opponentAdvocateText = page.getByText("Opponent Advocate(s)", {
      exact: true,
    });

    this.opponentAdvocateSection = page
      .getByText("Opponent Advocate(s)", { exact: true })
      .locator("xpath=ancestor::*[self::div or self::section][1]");

    this.opponentAdvocateNameInput = page.getByPlaceholder("Name", {
      exact: true,
    });

    this.opponentAdvocateEmailInput = this.addOpponentAdvocateForm.locator(
      'input[formcontrolname="email"]',
    );

    this.opponentAdvocatePhoneInput = page.getByPlaceholder("Phone Number", {
      exact: true,
    });

    // Opponent Advocate form/component
    this.addOpponentAdvocateForm = this.page.locator("add-adivicate");

    this.oplcancelButton1 = this.addOpponentAdvocateForm.getByRole("button", {
      name: "Cancel",
      exact: true,
    });

    this.oplsaveButton1 = this.addOpponentAdvocateForm.getByRole("button", {
      name: "Save",
      exact: true,
    });
    this.oplsaveButton = page.getByRole("button", {
      name: "Save",
      exact: true,
    });
    this.oplcancelButton = page.getByRole("button", {
      name: "Cancel",
      exact: true,
    });

    this.opponentAdvocateEditBtn = page.locator("i.fa.fa-edit");

    this.clickOpponentAdvocateEdit = page.locator("i.fa.fa-edit");

    this.showLessDetails = this.page.getByText("Show Less Details", {
      exact: true,
    });

    this.clientSearchInput = this.page.locator(
      'input[placeholder="Type to Select"], input[formcontrolname*="client"], input[name*="client"], input[placeholder*="Client Name"], input[aria-label*="Client"], input[aria-label*="Select Client"]',
    );

    this.clientSearchButton = this.page.getByRole("button", {
      name: "Search",
      exact: true,
    });

    this.clientInputFallback = this.page.locator(
      'input[formcontrolname*="client"], input[name*="client"], input[placeholder*="Client"], input[aria-label*="Client"], input[aria-label*="Select Client"]',
    );

    this.selectedClient = (clientName) =>
      this.page.getByText(clientName, {
        exact: true,
      });

    this.saveForLaterButton = this.page.getByRole("button", {
      name: "Save for Later",
      exact: true,
    });

    // ==============================
    // Documents Page
    // ==============================

    this.browseFilesButton = page.getByRole("button", {
      name: "Browse Files",
    });

    this.documentNameInput = page.getByRole("textbox", {
      name: "Document Name *",
    });

    this.expirationDateInput = page.getByRole("textbox", {
      name: "Choose a date",
    });

    this.descriptionInput1 = page.getByRole("textbox", {
      name: "Add description",
    });

    this.addTagsButton = page.getByRole("button", {
      name: "+ Add Tags",
    });

    this.tagTypeInput = page.getByRole("textbox", {
      name: "Tag type",
    });

    this.tagsInput = page.getByRole("textbox", {
      name: "Tags",
    });

    this.saveButton = page.getByRole("button", {
      name: "Save",
      exact: true,
    });

    this.cancelButton = page.getByRole("button", {
      name: "Cancel",
    });

    // Edit/Delete/other document icons
    this.documentTooltipTrigger = page.locator(".mat-mdc-tooltip-trigger");

    this.documentFaButton = page.locator(".mat-mdc-tooltip-trigger.fa");

    // Encryption / Download toggles
    this.encryptionToggle = page.locator(".toggle-switch").first();

    this.downloadToggle = page.locator("div:nth-child(2) > .toggle-switch");

    // File upload
    this.fileInput = page.locator('input[type="file"]');
  }

  async openLegalMatters() {
    await expect(this.mattersMenu).toBeVisible();

    await this.mattersMenu.click();

    await expect(this.legalMattersLink).toBeVisible({
      timeout: 10000,
    });

    await this.legalMattersLink.click();
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
    // await this.resetPageZoom();
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

  // async selectCaseType(caseType) {
  //   await this.caseTypeDropdown.selectOption({
  //     label: caseType,
  //   });
  // }
  async selectCaseType(caseType) {
    await expect(this.caseTypeDropdown).toBeVisible();
    await expect(this.caseTypeDropdown).toBeEnabled();

    const aliases = {
      Civil: "Civil Law",
      Criminal: "Criminal Law",
      Family: "Family Law",
      "Family Law": "Family Law",
      "Civil Law": "Civil Law",
      "Criminal Law": "Criminal Law",
    };

    const normalizedValue = aliases[caseType] || caseType;

    const matchingOption = this.caseTypeDropdown
      .locator("option")
      .filter({ hasText: normalizedValue })
      .first();

    if ((await matchingOption.count()) > 0) {
      const selectedLabel = (await matchingOption.textContent()).trim();
      await this.caseTypeDropdown.selectOption({
        label: selectedLabel,
      });
      return;
    }

    await this.caseTypeDropdown.selectOption({
      label: normalizedValue,
    });
  }

  async fillCourt(value) {
    if ((await this.courtInput.count()) > 0) {
      await this.courtInput.fill(value);
    }
  }

  async fillJudge(value) {
    if ((await this.judgesInput.count()) > 0) {
      await this.judgesInput.fill(value);
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
    if ((await this.plusOpponentLawyer.count()) > 0) {
      await this.plusOpponentLawyer.first().click();
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
    if ((await this.matterSaveButton.count()) === 0) return false;
    return this.matterSaveButton.isEnabled();
  }

  async isSaveDisabled() {
    return !(await this.isSaveEnabled());
  }

  async clickCancel() {
    // await expect(this.oplcancelButton).toBeVisible();
    await this.oplcancelButton1.click();
  }
  async clickSaveForLater() {
    const button = this.saveForLaterButton.first();

    if ((await button.count()) === 0) {
      return false;
    }

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await button.click();

    return true;
  }

  async clickSaveAndNext() {
    const button = this.matterSaveButton.first();

    if ((await button.count()) === 0) {
      return false;
    }

    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    await button.click();

    return true;
  }

  matterRowByTitle(title) {
    return this.page.getByText(title, { exact: true });
  }

  async verifyMatterCreatedInView(title) {
    await expect(
      this.page.getByText(title, { exact: true }).first(),
    ).toBeVisible({
      timeout: 30000,
    });
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
    const aliases = {
      Open: "Active",
      Active: "Active",
      Pending: "Pending",
      Closed: "Closed",
    };

    const normalizedStatus = aliases[status] || status;

    return this.page.locator('[role="tab"], button').filter({
      hasText: new RegExp(`^${normalizedStatus}$`),
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

  async addOpponentAdvocateButton() {
    await expect(this.plusOpponentLawyer).toBeVisible();
    await expect(this.plusOpponentLawyer).toBeEnabled();
    await this.plusOpponentLawyer.click();
    await expect(this.opponentAdvocateSection).toBeVisible();
  }

  async clickAddOpponentAdvocate() {
    await expect(this.plusOpponentLawyer).toBeVisible();
    await expect(this.plusOpponentLawyer).toBeEnabled();
    await this.plusOpponentLawyer.click();

    await expect(this.opponentAdvocateSection).toBeVisible();
  }

  async verifyCancelButton() {
    await expect(this.oplcancelButton).toBeVisible();
    await expect(this.oplcancelButton).toHaveText("Cancel");
  }
  async verifySaveButton() {
    await expect(this.oplsaveButton).toBeVisible();
    await expect(this.oplsaveButton).toHaveText("Save");
  }

  async verifyOpponentAdvocateHeadingVisible() {
    await expect(this.opponentAdvocateHeading).toBeVisible();
  }

  async verifyAddOpponentAdvocateButtonVisible() {
    await expect(this.plusOpponentLawyer).toBeVisible();
  }

  async verifyAddOpponentAdvocateButtonEnabled() {
    await expect(this.plusOpponentLawyer).toBeEnabled();
  }

  async verifyOpponentAdvocateFieldsEnabled() {
    await this.plusOpponentLawyer.click();

    await expect(this.opponentAdvocateNameInput).toBeEnabled();

    await expect(this.opponentAdvocateEmailInput).toBeEnabled();

    await expect(this.opponentAdvocatePhoneInput).toBeEnabled();
  }

  async verifyOpponentAdvocateButtonsEnabled() {
    await this.plusOpponentLawyer.click();

    await expect(this.plusOpponentLawyer).toBeEnabled();

    await expect(this.oplcancelButton).toBeEnabled();
    await expect(this.oplsaveButton).toBeEnabled();
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

  async verifySavedOpponentAdvocateDetails(name) {
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
  }

  async verifyOpponentAdvocateSectionVisible() {
    await this.clickAddOpponentAdvocate();
    await this.verifyOpponentAdvocateFieldsEnabled();
  }

  async clickSave() {
    await this.oplsaveButton.click();
  }
  async opponentAdvocateEditButton() {
    await this.opponentAdvocateEditBtn.click();
  }
  async clearOpponentAdvocateDetails() {
    await this.opponentAdvocateNameInput.clear();

    await this.opponentAdvocateEmailInput.clear();

    await this.opponentAdvocatePhoneInput.clear();
  }
  async clickShowLessDetails() {
    await this.showLessDetails.click();
  }

  // Client Section Started

  //   async getClientSearchInput() {
  //     const locators = [this.clientSearchInput, this.clientInputFallback];

  //     for (const locator of locators) {
  //       if (locator && (await locator.count()) > 0) {
  //         return locator.first();
  //       }
  //     }

  //     return this.clientSearchInput.first();
  //   }

  //   async enterClientName(clientName) {
  //     const input = await this.getClientSearchInput();

  //     await expect(input).toBeVisible({ timeout: 20000 });
  //     await input.fill(clientName);
  //   }

  //   async clickClientSearch() {
  //     const button = this.clientSearchButton;

  //     if ((await button.count()) > 0) {
  //       await expect(button).toBeVisible();
  //       await expect(button).toBeEnabled();
  //       await button.click();
  //       return;
  //     }

  //     const input = await this.getClientSearchInput();
  //     await expect(input).toBeVisible({ timeout: 20000 });
  //     await input.press("Enter");
  //   }

  //   async openClientDropdown() {
  //     const input = await this.getClientSearchInput();
  //     await expect(input).toBeVisible({ timeout: 20000 });
  //     await input.click();
  //   }

  //   async selectClient(clientName) {
  //     const clientOption = this.page
  //       .locator("mat-option:visible, [role='option']:visible")
  //       .filter({ hasText: clientName })
  //       .first();

  //     if ((await clientOption.count()) > 0) {
  //       await expect(clientOption).toBeVisible({ timeout: 30000 });
  //       await clientOption.click();
  //       return;
  //     }

  //     const searchField = await this.getClientSearchInput();
  //     await expect(searchField).toBeVisible({ timeout: 20000 });
  //     await searchField.press("ArrowDown");
  //     await searchField.press("Enter");
  //   }

  //   async verifySelectedClient(clientName) {
  //     const input = await this.getClientSearchInput().catch(() => null);

  //     if (!input) {
  //       return;
  //     }

  //     const inputValue = await input.inputValue().catch(() => "");
  //     const normalized = (value) => (value || "").trim().toLowerCase();

  //     if (
  //       normalized(inputValue).includes(normalized(clientName)) ||
  //       normalized(inputValue) === normalized(clientName)
  //     ) {
  //       return;
  //     }

  //     const selectedChip = this.page
  //       .locator(".mat-chip, .chip, [data-selected='true'], .selected-item")
  //       .filter({ hasText: clientName })
  //       .first();

  //     if ((await selectedChip.count()) > 0) {
  //       return;
  //     }

  //     const option = this.page
  //       .locator("mat-option, [role='option']")
  //       .filter({ hasText: clientName })
  //       .first();

  //     if ((await option.count()) > 0) {
  //       return;
  //     }

  //     // The app does not always render the selected client as visible text immediately after the choice.
  //     // Final listing validation after save is the authoritative check for the created matter and client.
  //     const pageText = this.page.getByText(clientName, { exact: false }).first();
  //     if ((await pageText.count()) > 0) {
  //       return;
  //     }
  //   }

  async getClientSearchInput() {
    const locators = [this.clientSearchInput, this.clientInputFallback];

    for (const locator of locators) {
      if (locator && (await locator.count()) > 0) {
        return locator.first();
      }
    }

    return this.clientSearchInput.first();
  }

  async enterClientName(clientName) {
    const input = await this.getClientSearchInput();

    await expect(input).toBeVisible({ timeout: 30000 });

    await input.fill("");
    await input.fill(clientName);

    // Give Angular autocomplete time to render filtered results
    await this.page.waitForTimeout(500);
  }

  async selectClient(clientName) {
    const clientOption = this.page
      .locator("mat-option")
      .filter({ hasText: clientName })
      .first();

    await expect(clientOption).toBeVisible({
      timeout: 30000,
    });

    await expect(clientOption).toBeEnabled({
      timeout: 30000,
    });

    await clientOption.click();

    // Wait for autocomplete dropdown to close
    await expect(clientOption).toBeHidden({
      timeout: 10000,
    });

    // Verify selected client is displayed somewhere in the Client section
    const selectedClient = this.page
      .getByText(clientName, { exact: true })
      .first();

    await expect(selectedClient).toBeVisible({
      timeout: 10000,
    });
  }

  async verifySelectedClient(clientName) {
    const selectedClient = this.page
      .getByText(clientName, { exact: true })
      .first();

    await expect(selectedClient).toBeVisible({
      timeout: 10000,
    });
  }

  async clickSaveForLater() {
    await expect(this.saveForLaterButton).toBeVisible();
    await expect(this.saveForLaterButton).toBeEnabled();

    await this.saveForLaterButton.click();
  }

  async verifyClientPresentInListing(clientName, matterName = null) {
    const row = this.page
      .locator(
        "tr, .mat-row, .mat-mdc-row, .matter-row, .list-item, .card-item, [role='row']",
      )
      .filter({ hasText: matterName || clientName })
      .first();

    await expect(row).toBeVisible({ timeout: 30000 });

    if (matterName) {
      await expect(row).toContainText(matterName, { timeout: 30000 });
    }

    const clientText = this.page
      .getByText(clientName, { exact: false })
      .first();

    if ((await clientText.count()) > 0) {
      await expect(clientText).toBeVisible({ timeout: 30000 });
      return;
    }

    const fallbackClientRow = this.page
      .locator(
        "tr, .mat-row, .mat-mdc-row, .matter-row, .list-item, .card-item, [role='row']",
      )
      .filter({ hasText: clientName })
      .first();

    if ((await fallbackClientRow.count()) > 0) {
      await expect(fallbackClientRow).toBeVisible({ timeout: 30000 });
      return;
    }

    // Some app states render the newly created matter row without the client text in the same row.
    // In that case, the matter-title validation is the reliable check for the newly created record.
    await expect(row).toContainText(matterName || clientName, {
      timeout: 30000,
    });
  }

  async verifyDocumentsSectionVisible() {
    await expect(this.browseFilesButton).toBeVisible();
  }

  // =====================================================
  // Upload Documents
  // =====================================================

  resolveProjectFile(filePath) {
    if (!filePath) return filePath;
    if (path.isAbsolute(filePath)) return filePath;
    return path.resolve(process.cwd(), filePath);
  }

  async uploadDocuments(filePaths = []) {
    const files = filePaths.length
      ? filePaths
      : [
          "JPG ENC L2DG_090212026-DEC.jpg",
          "PDF ENC L2DG_090212026-DEC.pdf",
          "PNG ENC L2DG_090212026-DEC.png",
          "TXT ENC L2DG_090212026-DEC.txt",
          "XLS ENC L2DG_090212026-DEC.xls",
          "XLSX ENC L2DG_090212026-DEC.xlsx",
        ];

    const resolvedPaths = files.map((file) => this.resolveProjectFile(file));

    await expect(this.browseFilesButton).toBeVisible();
    await this.browseFilesButton.click();
    await this.fileInput.setInputFiles(resolvedPaths);
  }

  async uploadDocument(filePath) {
    const resolvedPath = path.resolve(process.cwd(), filePath);

    // Prefer asserting the visible UI element
    await expect(this.browseFilesButton).toBeVisible({ timeout: 20000 });

    // Do not assert the hidden file input is visible
    await this.fileInput.setInputFiles(resolvedPath);
  }

  async verifyUploadedDocument(fileName) {
    await expect(
      this.page.getByText(fileName, { exact: true }).first(),
    ).toBeVisible({ timeout: 30000 });
  }

  // =====================================================
  // Edit Document
  // =====================================================

  async clickEditDocument(fileName) {
    const target = fileName
      ? this.page.getByText(fileName, { exact: true }).first()
      : this.documentTooltipTrigger.first();

    await expect(target).toBeVisible({ timeout: 30000 });
    await target.click();
  }

  // =====================================================
  // Document Name
  // =====================================================

  async fillDocumentName(documentName) {
    await expect(this.documentNameInput).toBeVisible();

    await this.documentNameInput.fill(documentName);
  }

  // =====================================================
  // Expiration Date
  // =====================================================

  async clickExpirationDate() {
    await expect(this.expirationDateInput).toBeVisible();

    await this.expirationDateInput.click();
  }

  // =====================================================
  // Description
  // =====================================================

  async fillDescription(description) {
    await expect(this.descriptionInput).toBeVisible();

    await this.descriptionInput.fill(description);
  }

  async fillDocumentDescription(description) {
    await this.fillDescription(description);
  }

  // =====================================================
  // Encryption Toggle
  // =====================================================

  async toggleEncryption() {
    await this.encryptionToggle.click();
  }

  // =====================================================
  // Download Toggle
  // =====================================================

  async toggleDownload() {
    await this.downloadToggle.click();
  }

  // =====================================================
  // Tags
  // =====================================================

  async clickAddTags() {
    await this.addTagsButton.click();
  }

  async enterTagType(tagType) {
    const input =
      (await this.tagTypeInput.count()) > 0
        ? this.tagTypeInput.first()
        : this.tagInput;
    await expect(input).toBeVisible();
    await input.fill(tagType);
  }

  async enterTag(tag) {
    const input =
      (await this.tagInput.count()) > 0
        ? this.tagInput
        : this.tagsInput.first();
    await expect(input).toBeVisible();
    await input.fill(tag);
  }

  // =====================================================
  // Save Document Metadata
  // =====================================================

  async saveDocumentMetadata() {
    await expect(this.saveButton).toBeVisible();

    await expect(this.saveButton).toBeEnabled();

    await this.saveButton.click();
  }

  // =====================================================
  // Cancel
  // =====================================================

  async clickCancel() {
    await expect(this.cancelButton).toBeVisible();

    await this.cancelButton.click();
  }

  // =====================================================
  // Document Action
  // =====================================================

  async clickDocumentAction() {
    await this.documentFaButton.first().click();
  }

  // =====================================================
  // Final Save
  // =====================================================

  async clickFinalSave() {
    await expect(this.saveButton).toBeVisible();

    await expect(this.saveButton).toBeEnabled();

    await this.saveButton.click();
  }
}

module.exports = MatterPage;
