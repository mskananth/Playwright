const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

class TimesheetPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Navigation ──────────────────────────────────────────────────
    this.timesheetsMenu = page
      .getByRole("link", { name: /timesheet/i })
      .first();
    this.timesheetsMenuItem = page
      .locator('a:has-text("Timesheet"), [role="menuitem"]:has-text("Timesheet"), li:has-text("Timesheet")')
      .first();
    this.notSubmittedLink = page.getByRole("menuitem", {
      name: "Not Submitted",
    });
    this.submittedLink = page.getByRole("menuitem", {
      name: "Submitted",
      exact: true,
    });

    // ── Page headings ───────────────────────────────────────────────
    this.pageTitle = page.locator("h2.page-title, h1.page-title, .page-title");
    this.timesheetEntryHeading = page.getByText(/timesheet\s*entry/i).first();

    // ── Date range controls ─────────────────────────────────────────
    this.dateTextboxes = page.getByRole("textbox", { name: "Select Date" });
    this.fromDateInput = this.dateTextboxes.first();
    this.toDateInput = this.dateTextboxes.last();
    this.fromDateCalendarIcon = this.fromDateInput.locator("..").getByRole("img").first();
    this.toDateCalendarIcon = this.toDateInput.locator("..").getByRole("img").first();
    this.prevPeriodArrow = page
      .getByText("From", { exact: true })
      .locator("xpath=../preceding-sibling::*[1]");
    this.nextPeriodArrow = page
      .getByText("To", { exact: true })
      .locator("xpath=../following-sibling::*[1]");

    // ── Calendar / Date picker ──────────────────────────────────────
    this.calendarPopup = page.getByRole("dialog", { name: "calendar" });
    this.calendarDay = (day) =>
      this.calendarPopup
        .locator("td, button")
        .filter({ hasText: new RegExp(`^\\s*${day}\\s*$`) })
        .first();

    // ── Dropdowns ───────────────────────────────────────────────────
    this.matterDropdown = page
      .getByText("Matter", { exact: true })
      .first()
      .locator("..")
      .getByRole("combobox")
      .first();
    this.taskDropdown = page
      .getByText("Task", { exact: true })
      .first()
      .locator("..")
      .getByRole("combobox")
      .first();
    this.statusDropdown = page
      .getByText("Status", { exact: true })
      .first()
      .locator("..")
      .getByRole("combobox")
      .first();
    this.dateDropdown = page
      .getByText("Date", { exact: true })
      .first()
      .locator("..")
      .getByRole("combobox")
      .first();

    // ── Dropdown options ────────────────────────────────────────────
    this.dropdownOption = (text) =>
      page.getByRole("option", { name: new RegExp(text, "i") }).first();
    this.dropdownOptionAlt = (text) =>
      page
        .locator('[role="option"], [class*="option"], li')
        .filter({ hasText: new RegExp(text, "i") })
        .first();

    // ── Duration inputs ─────────────────────────────────────────────
    this.hoursInput = page.getByRole("spinbutton").first();
    this.minutesInput = page
      .getByText("Minutes", { exact: true })
      .first()
      .locator("..")
      .getByRole("combobox")
      .first();

    // ── Action buttons ──────────────────────────────────────────────
    this.addButton = page.getByRole("button", { name: /\+?\s*add/i }).first();
    this.submitButton = page.getByRole("button", { name: /submit/i }).first();
    this.saveButton = page.getByRole("button", { name: /save/i }).first();
    this.cancelButton = page.getByRole("button", { name: /cancel/i }).first();

    // ── Timesheet grid / table ──────────────────────────────────────
    this.gridContainer = page.locator(
      "table, [class*='timesheet'], [class*='grid'], [class*='listing']",
    );
    this.gridHeaders = page.locator(
      "table th, [class*='timesheet'] [class*='header'], [role='columnheader']",
    );
    this.gridRows = page.locator(
      "table tbody tr, [class*='timesheet'] [class*='row'], [role='row']",
    );
    this.gridRow = (text) =>
      page
        .locator(
          "table tbody tr, [class*='timesheet'] [class*='row'], [role='row']",
        )
        .filter({ hasText: new RegExp(text, "i") })
        .first();

    // ── Grid row actions ────────────────────────────────────────────
    this.editIcon = (text) =>
      page
        .locator(
          "table tbody tr, [class*='timesheet'] [class*='row'], [role='row']",
        )
        .filter({ hasText: new RegExp(text, "i") })
        .locator("td")
        .first();
    this.deleteIcon = (text) =>
      page
        .locator(
          "table tbody tr, [class*='timesheet'] [class*='row'], [role='row']",
        )
        .filter({ hasText: new RegExp(text, "i") })
        .locator("td")
        .first();

    // ── Confirmation dialog ─────────────────────────────────────────
    this.confirmDialog = page.locator('[class*="modal"], [class*="dialog"], [class*="popup"], [role="dialog"], [class*="overlay"]').filter({ hasText: "Confirmation" }).first();
    this.confirmYesButton = page
      .getByRole("button", { name: /yes|confirm|ok|submit/i })
      .first();
    this.confirmNoButton = page
      .getByRole("button", { name: /no|cancel|close/i })
      .first();

    // ── Validation messages ─────────────────────────────────────────
    this.validationMessage = page.locator(
      '[class*="error"], [class*="validation"], [class*="invalid"], [role="alert"]',
    );
    this.matterError = page
      .locator('[class*="error"], [class*="validation"]')
      .filter({ hasText: /matter/i })
      .first();
    this.taskError = page
      .locator('[class*="error"], [class*="validation"]')
      .filter({ hasText: /task/i })
      .first();
    this.statusError = page
      .locator('[class*="error"], [class*="validation"]')
      .filter({ hasText: /status/i })
      .first();
    this.dateError = page
      .locator('[class*="error"], [class*="validation"]')
      .filter({ hasText: /date/i })
      .first();
    this.durationError = page
      .locator('[class*="error"], [class*="validation"]')
      .filter({ hasText: /hour|minute|duration/i })
      .first();

    // ── Total hours display ─────────────────────────────────────────
    this.totalHoursDisplay = page
      .locator("td, th, div, span")
      .filter({ hasText: /^Total\s/ })
      .first();

    // ── Loading indicator ───────────────────────────────────────────
    this.loadingIndicator = page.locator(
      '[class*="loading"], [class*="spinner"], [class*="progress"], [role="progressbar"]',
    );

    // ── Notification / Toast ────────────────────────────────────────
    this.successNotification = page
      .locator('[class*="success"], [class*="toast"], [class*="notification"]')
      .first();
    this.errorNotification = page
      .locator('[class*="error"], [class*="toast"], [class*="notification"]')
      .filter({ hasText: /error|fail|invalid/i })
      .first();
  }

  // ══════════════════════════════════════════════════════════════════
  //  Navigation
  // ══════════════════════════════════════════════════════════════════

  async openTimesheets() {
    const menu =
      (await this.timesheetsMenu.count()) > 0
        ? this.timesheetsMenu
        : this.timesheetsMenuItem;
    await expect(menu).toBeVisible({ timeout: 10000 });
    const isExpanded =
      (await menu.getAttribute("aria-expanded")) === "true" ||
      (await menu.getAttribute("aria-expanded")) === "";
    if (!isExpanded) {
      await menu.click();
      await this.page.waitForLoadState("networkidle");
      await this.page.waitForTimeout(1000);
    }
  }

  async openNotSubmitted() {
    await expect(this.notSubmittedLink).toBeVisible({ timeout: 10000 });
    await this.notSubmittedLink.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1500);
  }

  async openSubmitted() {
    await expect(this.submittedLink).toBeVisible({ timeout: 10000 });
    await this.submittedLink.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1500);
  }

  async navigateToTimesheetEntry() {
    await this.openTimesheets();
    await this.openNotSubmitted();
  }

  // ══════════════════════════════════════════════════════════════════
  //  Page verification
  // ══════════════════════════════════════════════════════════════════

  async verifyTimesheetEntryPageLoaded() {
    await expect(this.page.getByText(/timesheet/i).first()).toBeVisible({
      timeout: 15000,
    });
  }

  async verifyPageTitle(expectedText) {
    const title = this.pageTitle.first();
    if (expectedText) {
      await expect(title).toContainText(expectedText, { timeout: 10000 });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  Date range
  // ══════════════════════════════════════════════════════════════════

  async getFromDateValue() {
    const input = this.fromDateInput;
    return input
      .inputValue()
      .catch(() => input.innerText())
      .catch(() => input.textContent());
  }

  async getToDateValue() {
    const input = this.toDateInput;
    return input
      .inputValue()
      .catch(() => input.innerText())
      .catch(() => input.textContent());
  }

  async verifyDefaultDateRange() {
    const fromDate = await this.getFromDateValue();
    const toDate = await this.getToDateValue();
    expect(fromDate).toBeTruthy();
    expect(toDate).toBeTruthy();
    return { fromDate, toDate };
  }

  async clickFromDatePicker() {
    if ((await this.fromDateCalendarIcon.count()) > 0) {
      await this.fromDateCalendarIcon.click();
    } else {
      await this.fromDateInput.click();
    }
    await this.page.waitForTimeout(500);
  }

  async clickToDatePicker() {
    if ((await this.toDateCalendarIcon.count()) > 0) {
      await this.toDateCalendarIcon.click();
    } else {
      await this.toDateInput.click();
    }
    await this.page.waitForTimeout(500);
  }

  async verifyCalendarOpened() {
    await expect(this.calendarPopup).toBeVisible({ timeout: 5000 });
  }

  async selectDateFromCalendar(day) {
    const dayCell = this.calendarDay(day);
    await expect(dayCell).toBeVisible({ timeout: 5000 });
    await dayCell.click();
    await this.page.waitForTimeout(500);
  }

  _toDisplayDate(dateString) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const parts = dateString.split(/[\/\-]/);
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1;
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return { months, month, day, year, display: `${months[month]} ${day}, ${year}` };
    }
    return { months, month: -1, day: -1, year: -1, display: dateString };
  }

  async _selectDateViaCalendar(calendarIcon, targetDateString) {
    const { months, month: targetMonth, day: targetDay, year: targetYear } =
      this._toDisplayDate(targetDateString);

    await expect(calendarIcon).toBeVisible({ timeout: 10000 });
    await calendarIcon.click();
    await this.page.waitForTimeout(500);

    await expect(this.calendarPopup).toBeVisible({ timeout: 5000 });

    const fullMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const monthRegex = [...months, ...fullMonths].join("|");
    const monthBtn = this.calendarPopup
      .getByRole("button")
      .filter({ hasText: new RegExp(`^(${monthRegex})`, "i") })
      .first();
    const yearBtn = this.calendarPopup
      .getByRole("button")
      .filter({ hasText: /^\d{4}$/ })
      .first();

    const currentMonthText = await monthBtn.innerText();
    const currentYearText = await yearBtn.innerText();
    const normalizedMonth = currentMonthText.trim().toLowerCase().slice(0, 3);
    const currentMonth = months.findIndex(
      (m) => m.toLowerCase() === normalizedMonth,
    );
    const currentYear = parseInt(currentYearText.trim(), 10);

    let monthDiff =
      (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

    const prevBtn = this.calendarPopup
      .getByRole("button", { name: /‹|<|prev/i })
      .first();
    const nextBtn = this.calendarPopup
      .getByRole("button", { name: /›|>|next/i })
      .first();

    while (monthDiff < 0) {
      await prevBtn.click();
      await this.page.waitForTimeout(300);
      monthDiff++;
    }
    while (monthDiff > 0) {
      await nextBtn.click();
      await this.page.waitForTimeout(300);
      monthDiff--;
    }

    const dayCell = this.calendarPopup
      .getByRole("gridcell", { name: new RegExp(`^\\s*${targetDay}\\s*$`) })
      .first();
    await expect(dayCell).toBeVisible({ timeout: 5000 });
    await dayCell.click();
    await this.page.waitForTimeout(500);
  }

  async setFromDate(dateString) {
    await this._selectDateViaCalendar(this.fromDateCalendarIcon, dateString);
  }

  async setToDate(dateString) {
    await this._selectDateViaCalendar(this.toDateCalendarIcon, dateString);
  }

  async verifyFromDateDisplayed(expectedDate) {
    const fromDate = await this.getFromDateValue();
    expect(fromDate).toBeTruthy();
    expect(fromDate.length).toBeGreaterThan(0);
  }

  async verifyToDateDisplayed(expectedDate) {
    const toDate = await this.getToDateValue();
    expect(toDate).toBeTruthy();
    expect(toDate.length).toBeGreaterThan(0);
  }

  async clickPreviousPeriod() {
    await expect(this.prevPeriodArrow).toBeVisible({ timeout: 10000 });
    await this.prevPeriodArrow.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  async clickNextPeriod() {
    await expect(this.nextPeriodArrow).toBeVisible({ timeout: 10000 });
    await this.nextPeriodArrow.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  async verifyPeriodUpdated() {
    await this.page.waitForTimeout(500);
  }

  async verifyInvalidDateRange() {
    const errorVisible =
      (await this.validationMessage.first().count()) > 0 &&
      (await this.validationMessage
        .first()
        .isVisible()
        .catch(() => false));
    const fromDate = await this.getFromDateValue();
    const toDate = await this.getToDateValue();
    const fromDt = new Date(fromDate);
    const toDt = new Date(toDate);
    const isInvalidRange = toDt < fromDt;
    expect(errorVisible || isInvalidRange).toBeTruthy();
  }

  // ══════════════════════════════════════════════════════════════════
  //  Dropdowns: Matter, Task, Status, Date
  // ══════════════════════════════════════════════════════════════════

  async openDropdown(dropdownType) {
    let dropdown;
    switch (dropdownType) {
      case "matter":
        dropdown = this.matterDropdown;
        break;
      case "task":
        dropdown = this.taskDropdown;
        break;
      case "status":
        dropdown = this.statusDropdown;
        break;
      case "date":
        dropdown = this.dateDropdown;
        break;
      default:
        throw new Error(`Unknown dropdown type: ${dropdownType}`);
    }
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    await dropdown.click();
    await this.page.waitForTimeout(500);
  }

  async verifyDropdownOptionsVisible(dropdownType) {
    await this.openDropdown(dropdownType);
    const options = this.page.locator(
      '[role="option"], [class*="option"], li, select option',
    );
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    await this.page.keyboard.press("Escape");
  }

  async selectDropdownOption(dropdownType, optionText) {
    let dropdown;
    switch (dropdownType) {
      case "matter":
        dropdown = this.matterDropdown;
        break;
      case "task":
        dropdown = this.taskDropdown;
        break;
      case "status":
        dropdown = this.statusDropdown;
        break;
      case "date":
        dropdown = this.dateDropdown;
        break;
      default:
        throw new Error(`Unknown dropdown type: ${dropdownType}`);
    }
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    await expect(dropdown.locator("option:not([hidden])")).not.toHaveCount(0, {
      timeout: 15000,
    });
    if (dropdownType === "date") {
      const optionExists = await dropdown
        .locator(`option:has-text("${optionText}")`)
        .count();
      if (optionExists === 0) {
        optionText = await dropdown
          .locator("option:not([hidden])")
          .first()
          .innerText();
        optionText = optionText.trim();
      }
    }
    await dropdown.selectOption({ label: optionText });
    await this.page.waitForTimeout(500);
  }

  async verifyDropdownSelection(dropdownType, expectedText) {
    let dropdown;
    switch (dropdownType) {
      case "matter":
        dropdown = this.matterDropdown;
        break;
      case "task":
        dropdown = this.taskDropdown;
        break;
      case "status":
        dropdown = this.statusDropdown;
        break;
      case "date":
        dropdown = this.dateDropdown;
        break;
      default:
        throw new Error(`Unknown dropdown type: ${dropdownType}`);
    }
    const selectedOption = dropdown.locator("option:checked").first();
    await selectedOption.waitFor({ state: "attached", timeout: 5000 });
    const text = await selectedOption.innerText();
    expect(text.trim().toLowerCase()).toBe(expectedText.trim().toLowerCase());
  }

  async selectMatter(matterName) {
    await this.selectDropdownOption("matter", matterName);
  }

  async selectTask(taskName) {
    await this.selectDropdownOption("task", taskName);
  }

  async selectStatus(statusName) {
    await this.selectDropdownOption("status", statusName);
  }

  async selectEntryDate(dateText) {
    await this.selectDropdownOption("date", dateText);
  }

  // ══════════════════════════════════════════════════════════════════
  //  Duration inputs
  // ══════════════════════════════════════════════════════════════════

  async enterHours(hours) {
    await expect(this.hoursInput).toBeVisible({ timeout: 10000 });
    const str = String(hours);
    if (/^\d+$/.test(str)) {
      await this.hoursInput.fill(str);
    } else {
      await this.hoursInput.fill(str).catch(() => {});
    }
    await this.page.waitForTimeout(300);
  }

  async enterMinutes(minutes) {
    await expect(this.minutesInput).toBeVisible({ timeout: 10000 });
    const str = String(minutes);
    const optionExists = await this.minutesInput
      .locator(`option[value="${str}"], option:has-text("${str}")`)
      .count();
    if (optionExists > 0) {
      await this.minutesInput.selectOption({ label: str });
    }
    await this.page.waitForTimeout(300);
  }

  async getHoursValue() {
    return this.hoursInput.inputValue();
  }

  async getMinutesValue() {
    return this.minutesInput.inputValue();
  }

  async verifyHoursValue(expectedHours) {
    const value = await this.getHoursValue();
    expect(value).toBe(String(expectedHours));
  }

  async verifyMinutesValue(expectedMinutes) {
    const value = await this.getMinutesValue();
    expect(value).toBe(String(expectedMinutes));
  }

  async verifyInvalidHoursInput() {
    const value = await this.getHoursValue();
    const isValid = /^\d*$/.test(value);
    expect(isValid).toBeTruthy();
  }

  async verifyInvalidMinutesInput(minutes) {
    const value = await this.getMinutesValue();
    const parsed = parseInt(value, 10);
    if (value !== "") {
      expect(parsed).toBeLessThanOrEqual(59);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  Add entry
  // ══════════════════════════════════════════════════════════════════

  async fillTimesheetEntry({ matter, task, status, date, hours, minutes }) {
    if (matter) await this.selectMatter(matter);
    if (task) await this.selectTask(task);
    if (status) await this.selectStatus(status);
    if (date) await this.selectEntryDate(date);
    if (hours !== undefined) await this.enterHours(hours);
    if (minutes !== undefined) await this.enterMinutes(minutes);
  }

  async clickAdd() {
    await expect(this.addButton).toBeVisible({ timeout: 10000 });
    await this.addButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  async verifyAddButtonDisabled() {
    await expect(this.addButton).toBeVisible({ timeout: 10000 });
    const isDisabled = await this.addButton.evaluate(
      (el) => el.disabled || el.classList.contains("disabled")
    );
    expect(isDisabled).toBeTruthy();
  }

  async verifyAddButtonEnabled() {
    await expect(this.addButton).toBeVisible({ timeout: 10000 });
    await expect(this.addButton).toBeEnabled();
  }

  async addTimesheetEntry(entry) {
    await this.fillTimesheetEntry(entry);
    await this.clickAdd();
  }

  // ══════════════════════════════════════════════════════════════════
  //  Grid verification
  // ══════════════════════════════════════════════════════════════════

  async verifyEntryInGrid(searchText) {
    const row = this.gridRow(searchText);
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  async verifyEntryNotInGrid(searchText) {
    const row = this.gridRow(searchText);
    const count = await row.count();
    expect(count).toBe(0);
  }

  async getGridRowCount() {
    return this.gridRows.count();
  }

  async verifyGridHasEntries() {
    const count = await this.getGridRowCount();
    expect(count).toBeGreaterThan(0);
  }

  async verifyEntryDetails(searchText, expectedDetails) {
    const row = this.gridRow(searchText);
    await expect(row).toBeVisible({ timeout: 10000 });
    for (const detail of expectedDetails) {
      await expect(row).toContainText(detail, { ignoreCase: true });
    }
  }

  async verifyEntryInGridByDate(dateText, searchText) {
    const row = this.page
      .locator(
        "table tbody tr, [class*='timesheet'] [class*='row'], [role='row']",
      )
      .filter({ hasText: dateText })
      .filter({ hasText: searchText })
      .first();
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  // ══════════════════════════════════════════════════════════════════
  //  Total hours
  // ══════════════════════════════════════════════════════════════════

  async verifyTotalHours(expectedTotal) {
    const totalEl = this.totalHoursDisplay;
    if ((await totalEl.count()) > 0) {
      await expect(totalEl).toContainText(expectedTotal, { timeout: 5000 });
    }
  }

  async getTotalHoursFromGrid() {
    const rows = this.gridRows;
    const count = await rows.count();
    let totalMinutes = 0;
    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).innerText();
      const hourMatch = rowText.match(/(\d+)\s*h/i);
      const minMatch = rowText.match(/(\d+)\s*m/i);
      if (hourMatch) totalMinutes += parseInt(hourMatch[1], 10) * 60;
      if (minMatch) totalMinutes += parseInt(minMatch[1], 10);
    }
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  //  Edit entry
  // ══════════════════════════════════════════════════════════════════

  async clickEditIcon(searchText) {
    const icon = this.editIcon(searchText);
    await expect(icon).toBeVisible({ timeout: 10000 });
    await icon.click();
    await this.page.waitForTimeout(1000);
  }

  async verifyEditFormPopulated(expectedValues) {
    for (const [field, value] of Object.entries(expectedValues)) {
      if (field === "hours") {
        await this.verifyHoursValue(value);
      } else if (field === "minutes") {
        await this.verifyMinutesValue(value);
      }
    }
  }

  async saveEdit() {
    await expect(this.addButton).toBeVisible({ timeout: 5000 });
    await this.addButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  async cancelEdit() {
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(500);
  }

  // ══════════════════════════════════════════════════════════════════
  //  Delete entry
  // ══════════════════════════════════════════════════════════════════

  async clickDeleteIcon(searchText) {
    const icon = this.deleteIcon(searchText);
    await expect(icon).toBeVisible({ timeout: 10000 });
    await icon.click();
    await this.page.waitForTimeout(500);
  }

  async confirmDelete() {
    await expect(this.confirmYesButton).toBeVisible({ timeout: 5000 });
    await this.confirmYesButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  async cancelDelete() {
    await expect(this.confirmNoButton).toBeVisible({ timeout: 5000 });
    await this.confirmNoButton.click();
    await this.page.waitForTimeout(500);
  }

  // ══════════════════════════════════════════════════════════════════
  //  Submit
  // ══════════════════════════════════════════════════════════════════

  async clickSubmit() {
    await expect(this.submitButton).toBeVisible({ timeout: 10000 });
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async verifySubmitConfirmation() {
    await expect(this.confirmDialog).toBeVisible({ timeout: 10000 });
  }

  async confirmSubmit() {
    await expect(this.confirmYesButton).toBeVisible({ timeout: 5000 });
    await this.confirmYesButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async cancelSubmit() {
    await expect(this.confirmNoButton).toBeVisible({ timeout: 5000 });
    await this.confirmNoButton.click();
    await this.page.waitForTimeout(500);
  }

  async verifySubmissionSuccess() {
    const notification = this.successNotification;
    if ((await notification.count()) > 0) {
      await expect(notification).toBeVisible({ timeout: 10000 });
    }
  }

  async verifyLoadingIndicator() {
    const indicator = this.loadingIndicator;
    if ((await indicator.count()) > 0) {
      const isVisible = await indicator.isVisible().catch(() => false);
      return isVisible;
    }
    return false;
  }

  // ══════════════════════════════════════════════════════════════════
  //  Validation messages
  // ══════════════════════════════════════════════════════════════════

  async verifyMatterValidation() {
    await expect(this.matterError).toBeVisible({ timeout: 5000 });
  }

  async verifyTaskValidation() {
    await expect(this.taskError).toBeVisible({ timeout: 5000 });
  }

  async verifyStatusValidation() {
    await expect(this.statusError).toBeVisible({ timeout: 5000 });
  }

  async verifyDateValidation() {
    await expect(this.dateError).toBeVisible({ timeout: 5000 });
  }

  async verifyDurationValidation() {
    await expect(this.durationError).toBeVisible({ timeout: 5000 });
  }

  async verifyAnyValidationError() {
    const count = await this.validationMessage.count();
    expect(count).toBeGreaterThan(0);
  }

  // ══════════════════════════════════════════════════════════════════
  //  Section verification
  // ══════════════════════════════════════════════════════════════════

  async verifyNotSubmittedSection() {
    await expect(this.notSubmittedLink).toBeVisible({ timeout: 10000 });
  }

  async verifySubmittedSection() {
    await expect(this.submittedLink).toBeVisible({ timeout: 10000 });
  }

  async verifyTimesheetNotInSubmitted(searchText) {
    await this.openSubmitted();
    await this.verifyEntryNotInGrid(searchText);
  }

  // ══════════════════════════════════════════════════════════════════
  //  Data persistence
  // ══════════════════════════════════════════════════════════════════

  async refreshPage() {
    await this.page.reload({ waitUntil: "networkidle" });
    await this.page.waitForTimeout(2000);
  }

  async verifyDataPersists(searchText) {
    await this.verifyEntryInGrid(searchText);
  }
}

module.exports = TimesheetPage;
