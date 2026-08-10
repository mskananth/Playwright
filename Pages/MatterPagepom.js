const { expect } = require("@playwright/test");

class MatterPagepom {
  constructor(page) {
    this.page = page;
    this.mattersMenu = page.locator(
      'a[aria-label="Matters"], a:has-text("Matters")',
    );
    this.legalMattersLink = page.locator('a:has-text("Legal Matters")');
    this.createMatterButton = page.getByRole("button", {
      name: /Create Matter/i,
    });

    this.caseTitleInput = page.locator(
      '#title, input[placeholder*="Case Title"]',
    );
    this.caseNumberInput = page.locator(
      '#caseNumbr, input[placeholder*="Case Number"]',
    );
    this.matterNumberInput = page.locator(
      '#matterNumber, input[placeholder*="Matter Number"]',
    );
    this.matterNumberLabel = page.locator('label:has-text("Matter Number")');
    this.createdDateInput = page.locator(
      'input[formcontrolname="created_date"], input[placeholder*="Created Date"], input[aria-label*="Created Date"]',
    );
    this.additionalDetails = page.getByText("Additional Details", {
      exact: true,
    });
    this.showLessDetails = page.getByText("Show Less Details", { exact: true });

    this.dateOfFilingInput = page.locator(
      'input[formcontrolname="date_of_filing"], input[placeholder*="Date of Filing"], input[aria-label*="Date of Filing"]',
    );
    this.descriptionInput = page.locator(
      'textarea[name="description"], textarea[formcontrolname="description"], textarea[placeholder*="Description"]',
    );
    this.descriptionCounter = page.locator(
      ".char-counter, .counter, .description-counter",
    );

    this.caseTypeSelect = page.locator(
      'select[formcontrolname="case_type"], select[name="case_type"], select[placeholder*="Case Type"], select[aria-label*="Case Type"]',
    );
    this.caseTypeInput = page.locator(
      'input[placeholder*="Case Type"], input[aria-label*="Case Type"]',
    );
    this.caseTypeDropdownOption = (option) =>
      page.locator(`text="${option}"`).first();

    this.courtInput = page.locator(
      'input[formcontrolname="court"], input[name="court"], input[placeholder*="Court"], input[aria-label*="Court"]',
    );
    this.judgeInput = page.locator(
      'input[formcontrolname="judge"], input[name="judge"], input[placeholder*="Judge"], input[aria-label*="Judge"]',
    );
    this.priorityButtons = page.locator(
      'button:has-text("High"), button:has-text("Medium"), button:has-text("Low")',
    );
    this.statusButtons = page.locator(
      'button:has-text("Active"), button:has-text("Pending"), button:has-text("Closed")',
    );
    this.tagInput = page.locator(
      'input[formcontrolname="tags"], input[name="tags"], input[placeholder*="Tag"], input[aria-label*="Tag"]',
    );
    this.tagAddButton = page.getByRole("button", { name: /Add/i }).first();
    this.tagChips = page.locator(".tag-chip, .tag-pill, .tag-item, .mat-chip");

    this.addOpponentAdvocateButton = page.locator(
      'button:has-text("Opponent Advocate +"), button:has-text("Add Opponent Advocate"), button:has-text("Add Advocate"), button:has-text("+")',
    );
    this.opponentNameInput = page.locator(
      'input[formcontrolname="opponent_advocate_name"], input[placeholder*="Advocate Name"], input[placeholder*="Name"], input[name*="advocate"][name*="name"]',
    );
    this.opponentEmailInput = page.locator(
      'input[formcontrolname="opponent_advocate_email"], input[placeholder*="Advocate Email"], input[placeholder*="Email"], input[name*="email"]',
    );
    this.opponentPhoneInput = page.locator(
      'input[formcontrolname="opponent_advocate_phone"], input[placeholder*="Phone"], input[placeholder*="Mobile"], input[name*="phone"]',
    );

    this.saveButton = page.getByRole("button", {
      name: /Save & Next|Save &amp; Next/i,
    });
    this.saveForLaterButton = page.locator(
      'button:has-text("Save for Later"), button:has-text("Save for later"), input[value="Save for Later"], button:has-text("Save as Draft")',
    );
    this.cancelButton = page.getByRole("button", {
      name: /Cancel|Close|Dismiss/i,
    });
  }

  async openMatterCreation() {
    await this.mattersMenu.click();
    await this.legalMattersLink.click();
    await expect(this.createMatterButton).toBeVisible();
    await this.createMatterButton.click();
    await expect(this.caseTitleInput).toBeVisible({ timeout: 10000 });
  }

  async verifyMainMatterForm() {
    await expect(this.caseTitleInput).toBeVisible();
    await expect(this.matterNumberInput).toBeVisible();
    await expect(this.createdDateInput).toBeVisible();
    await expect(this.saveForLaterButton).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  async verifyAdditionalDetailsToggle() {
    await expect(this.additionalDetails).toBeVisible();
    await this.additionalDetails.click();
    await expect(this.dateOfFilingInput).toBeVisible();
    await expect(this.descriptionInput).toBeVisible();
    await expect(this.caseTypeSelect.or(this.caseTypeInput)).toBeVisible();
  }

  async verifyMatterNumberReadonly() {
    await expect(this.matterNumberInput).toHaveAttribute("readonly", "");
  }

  async fillCaseTitle(title) {
    await this.caseTitleInput.fill(title);
  }

  async fillCaseNumber(value) {
    if ((await this.caseNumberInput.count()) > 0) {
      await this.caseNumberInput.fill(value);
    }
  }

  async fillCreatedDate(value) {
    if ((await this.createdDateInput.count()) > 0) {
      await this.createdDateInput.fill(value);
    }
  }

  async fillDateOfFiling(value) {
    if ((await this.dateOfFilingInput.count()) > 0) {
      await this.dateOfFilingInput.fill(value);
    }
  }

  async fillDescription(value) {
    if ((await this.descriptionInput.count()) > 0) {
      await this.descriptionInput.fill(value);
    }
  }

  async chooseCaseType(value) {
    if ((await this.caseTypeSelect.count()) > 0) {
      await this.caseTypeSelect
        .selectOption({ label: value })
        .catch(async () => {
          await this.caseTypeSelect.fill(value);
        });
      return;
    }
    if ((await this.caseTypeInput.count()) > 0) {
      await this.caseTypeInput.fill(value);
      await this.caseTypeInput.press("Enter");
      await this.caseTypeDropdownOption(value)
        .click()
        .catch(() => {});
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
    if ((await this.priorityButtons.count()) > 0) {
      await this.page.locator(`button:has-text("${value}")`).first().click();
    }
  }

  async selectStatus(value) {
    if ((await this.statusButtons.count()) > 0) {
      await this.page.locator(`button:has-text("${value}")`).first().click();
    }
  }

  async addTag(value) {
    if ((await this.tagInput.count()) > 0) {
      await this.tagInput.fill(value);
      if ((await this.tagAddButton.count()) > 0) {
        await this.tagAddButton.click();
      } else {
        await this.tagInput.press("Enter");
      }
    }
  }

  async openOpponentAdvocate() {
    if ((await this.addOpponentAdvocateButton.count()) > 0) {
      await this.addOpponentAdvocateButton.first().click();
    }
  }

  async fillOpponentAdvocate(data) {
    await this.openOpponentAdvocate();
    if (data?.name && (await this.opponentNameInput.count()) > 0) {
      await this.opponentNameInput.fill(data.name);
    }
    if (data?.email && (await this.opponentEmailInput.count()) > 0) {
      await this.opponentEmailInput.fill(data.email);
    }
    if (data?.phone && (await this.opponentPhoneInput.count()) > 0) {
      await this.opponentPhoneInput.fill(data.phone);
    }
  }

  async isSaveForLaterVisible() {
    return (await this.saveForLaterButton.count()) > 0;
  }

  async isSaveForLaterEnabled() {
    if (!(await this.isSaveForLaterVisible())) return false;
    return this.saveForLaterButton.first().isEnabled();
  }

  async isSaveButtonEnabled() {
    if ((await this.saveButton.count()) === 0) return false;
    return this.saveButton.first().isEnabled();
  }

  async clickSaveForLater() {
    if (!(await this.isSaveForLaterVisible())) return false;
    await Promise.all([
      this.saveForLaterButton.first().click(),
      this.page.waitForLoadState("networkidle").catch(() => {}),
    ]);
    return true;
  }

  async fillRecord(record) {
    if (!record) return;
    await this.fillCaseTitle(record.title || "Data Driven Matter");
    await this.fillCaseNumber(record.caseNumber || "AUTO-123");
    if (record.caseType) await this.chooseCaseType(record.caseType);
    if (record.court) await this.fillCourt(record.court);
    if (record.judge) await this.fillJudge(record.judge);
    if (record.priority) await this.selectPriority(record.priority);
    if (record.status) await this.selectStatus(record.status);
    if (record.dateOfFiling) {
      await this.clickAdditionalDetails();
      await this.fillDateOfFiling(record.dateOfFiling);
    }
    if (record.description) {
      await this.clickAdditionalDetails();
      await this.fillDescription(record.description);
    }
    if (record.tags?.length) {
      for (const tag of record.tags) {
        await this.addTag(tag);
      }
    }
    if (record.opponentAdvocate) {
      await this.fillOpponentAdvocate(record.opponentAdvocate);
    }
  }
}

module.exports = MatterPagepom;
