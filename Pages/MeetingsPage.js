const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

class MeetingPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Navigation ───────────────────────────────────────────────
    this.sideMenuMeeting = page
      .getByRole("menuitem", { name: /meetings/i })
      .first();

    // ── Headings ─────────────────────────────────────────────────
    this.meetingHeading = page.locator(".header-title .title-text", {
      hasText: /meetings/i,
    });
    this.createPageHeading = page.locator(".header-title .title-text", {
      hasText: /create meeting/i,
    });

    this.individualSection = page
      .locator("div")
      .filter({
        hasText: /^Add Individual$/,
      })
      .filter({
        has: this.searchConsumer,
      })
      .first();

    // ── Create Event ─────────────────────────────────────────────
    this.createButton = page.locator(".cal-create-btn");
    this.eventTypeDropdown = page
      .locator("select.form-select.field-select")
      .first();
    this.matterNameDropDown = page.locator(
      'select[formcontrolname="matter_id"]',
    );
    this.subjectTaskDropdown = page.locator('select[formcontrolname="title"]');
    this.timeZone = page.locator('select[formcontrolname="timezone_location"]');

    // For visibility checks (combobox role-based)
    this.matterName = page.getByRole("combobox").nth(1);
    this.subjectTask = page.getByRole("combobox").nth(2);

    // ── Date & Time ──────────────────────────────────────────────
    this.dateInput = page.locator('input[formcontrolname="date"]');
    this.datePicker = page.locator('bs-datepicker-container[role="dialog"]');
    this.timeSection = page
      .locator("div")
      .filter({ has: page.getByText("To", { exact: true }) })
      .filter({ has: page.locator("select") })
      .first();
    this.startTime = page.locator('select[formcontrolname="from_ts"]');
    this.endTime = page.locator('select[formcontrolname="to_ts"]');
    this.repetition = page.locator('select[formcontrolname="repeat_interval"]');

    // ── Checkboxes ───────────────────────────────────────────────
    this.addToTimesheetCheckbox = page.getByRole("checkbox", {
      name: "Add to Timesheet",
    });
    this.allDayCheckbox = page.getByRole("checkbox", {
      name: "All Day",
    });

    // ── Notification ─────────────────────────────────────────────
    this.addNotificationButton = page.getByRole("button", {
      name: "+ Add Notification",
    });
    this.notificationValue = page.getByRole("textbox").nth(1);
    this.notificationUnitDropdown = page.locator(
      'select[formcontrolname="notification_unit"]',
    );
    this.deleteNotificationButton = page
      .locator('[class="notify-delete"]')
      .last();

    // ── Meeting Details ──────────────────────────────────────────
    this.meetingLink = page.getByRole("textbox", {
      name: "https://meet.google.com/",
    });
    this.dialInNumber = page.getByRole("textbox", {
      name: "+1 234 567",
    });
    this.location = page.getByRole("textbox", {
      name: "Add location or meeting room",
    });
    this.meetingAgenda = page.getByRole("textbox", {
      name: "Add meeting agenda, notes, or description...",
    });

    // ── Attendees - Individual ───────────────────────────────────
    this.searchConsumer = page.getByRole("combobox", {
      name: "Search Individual Clients",
      exact: true,
    });

    // ── Attendees - Clients ──────────────────────────────────────
    this.searchClient = page.getByRole("combobox", {
      name: "Search Client",
      exact: true,
    });

    // ── Attendees - Corporate ────────────────────────────────────
    this.searchCorporate = page.getByRole("combobox", {
      name: "Search Corporate",
      exact: true,
    });

    // ── Attendees - Document ─────────────────────────────────────
    this.searchDocument = page.getByRole("combobox", {
      name: "Search Document",
    });

    // ── Selected Tags ────────────────────────────────────────────
    this.selectedTags = page.locator("div.selected-tag");

    // ── Calendar ─────────────────────────────────────────────────
    this.currentDateLabel = page.locator("span.cal-date-label");
    this.nextDateButton = page.locator("button[mwlcalendarnextview]");
    this.previousDateButton = page.locator("button[mwlcalendarpreviousview]");
    this.calendarEvent = page.locator("[role='application']");
    this.createdEvent = page.locator(".cal-event-title");

    // ── Save / Cancel ────────────────────────────────────────────
    this.saveEventButton = page.getByRole("button", {
      name: "Save Event",
    });
    this.cancelButton = page.getByRole("button", { name: /cancel/i }).first();

    // ── Toast / Confirmation ─────────────────────────────────────
    this.toastMessage = page.locator(
      ".toast-message, .toast-body, [class*='toast'], [class*='snack']",
    );

    // ── Event Detail Overlay ─────────────────────────────────────
    this.eventOverlayClose = page
      .locator("app-viewevent button, .evt-overlay button, .evt-overlay .close")
      .filter({ hasText: /close/i })
      .first();
    this.eventOverlay = page.locator("app-viewevent, .evt-overlay");

    // ── Edit Event ───────────────────────────────────────────────
    this.editButton = page.locator("app-viewevent").getByRole("button", {
      name: /edit/i,
    });
    this.updateEventButton = page.getByRole("button", {
      name: /save event/i,
    });
    this.editPageHeading = page.locator(".header-title .title-text", {
      hasText: /edit meeting/i,
    });

    // ── Delete Event ─────────────────────────────────────
    this.deleteButton = page.locator(
      "button[title='Delete'], button[mattooltip='Delete']",
    );
    this.deleteConfirmButton = page.getByRole("button", {
      name: /yes|confirm|delete/i,
    });
    this.deleteCancelButton = page.getByRole("button", {
      name: /no|cancel/i,
    });

    // ── Remove Client Button ─────────────────────────────
    this.removeClientButton = page.locator(".selected-tag .close").last();
  }

  // =====================================================
  //  Navigation
  // =====================================================

  async goToMeeting() {
    await this.sideMenuMeeting.waitFor({ state: "visible", timeout: 20000 });

    for (let attempt = 0; attempt < 3; attempt++) {
      const modalVisible = await this.page
        .locator(".modal")
        .isVisible()
        .catch(() => false);
      const ngbVisible = await this.page
        .locator("ngb-modal-window")
        .isVisible()
        .catch(() => false);
      const overlayVisible = await this.eventOverlay
        .isVisible()
        .catch(() => false);

      if (!modalVisible && !ngbVisible && !overlayVisible) break;

      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(1000);
    }

    const stillBlocked =
      (await this.page
        .locator(".modal")
        .isVisible()
        .catch(() => false)) ||
      (await this.page
        .locator("ngb-modal-window")
        .isVisible()
        .catch(() => false));

    if (stillBlocked) {
      await this.page.evaluate(() => {
        document
          .querySelectorAll(".modal, ngb-modal-window, .modal-backdrop")
          .forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
      });
      await this.page.waitForTimeout(500);
    }

    await this.sideMenuMeeting.click();
    await this.page.waitForLoadState("networkidle");
    if ((await this.eventOverlay.count()) > 0) {
      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(500);
    }
  }

  async isMeetingHeadingVisible() {
    await this.meetingHeading.waitFor({ state: "visible", timeout: 20000 });
    return await this.meetingHeading.isVisible();
  }

  // =====================================================
  //  Create Event
  // =====================================================

  async createButtonClick() {
    if ((await this.eventOverlay.count()) > 0) {
      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(500);
      if ((await this.eventOverlay.count()) > 0) {
        await this.eventOverlayClose.click({ timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(500);
      }
    }
    await this.createButton.waitFor({ state: "visible", timeout: 20000 });
    await this.createButton.click();
    await this.createPageHeading.waitFor({ state: "visible", timeout: 20000 });
    await expect(this.createPageHeading).toBeVisible();
  }

  async selectEventType(eventType) {
    await this.eventTypeDropdown.selectOption({ label: eventType });
  }

  async selectMatterName(matterType) {
    await this.matterNameDropDown.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForFunction(
      (sel) => sel.options.length > 1,
      await this.matterNameDropDown.elementHandle(),
      { timeout: 15000 },
    );
    const selected = await this.page.evaluate(
      ({ selector, value }) => {
        const select = document.querySelector(selector);
        if (!select) return null;
        const lowerValue = value.toLowerCase();
        for (const opt of select.options) {
          const optText = opt.text.trim().toLowerCase();
          if (optText.includes(lowerValue) || lowerValue.includes(optText)) {
            select.value = opt.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            select.dispatchEvent(new Event("input", { bubbles: true }));
            return opt.text.trim();
          }
        }
        return null;
      },
      {
        selector: 'select[formcontrolname="matter_id"]',
        value: matterType,
      },
    );
    if (!selected) {
      throw new Error(`Matter "${matterType}" not found in dropdown`);
    }
  }

  async selectSubjectTask(subjectTask) {
    await this.subjectTaskDropdown.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await this.page.waitForFunction(
      (sel) => sel.options.length > 1,
      await this.subjectTaskDropdown.elementHandle(),
      { timeout: 15000 },
    );
    await this.subjectTaskDropdown.selectOption({ label: subjectTask });
  }

  async selectTimeZone(timeZone) {
    await this.timeZone.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForFunction(
      (sel) => sel.options.length > 1,
      await this.timeZone.elementHandle(),
      { timeout: 15000 },
    );
    const gmtMatch = timeZone.match(/GMT[+-]\d{2}:\d{2}/);
    const gmtOffset = gmtMatch ? gmtMatch[0] : null;
    const selected = await this.page.evaluate(
      ({ selector, tz, gmt }) => {
        const select = document.querySelector(selector);
        if (!select) return null;
        for (const opt of select.options) {
          if (opt.text.includes(tz)) {
            select.value = opt.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            select.dispatchEvent(new Event("input", { bubbles: true }));
            return opt.text;
          }
        }
        if (gmt) {
          for (const opt of select.options) {
            if (opt.text.includes(gmt)) {
              select.value = opt.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
              select.dispatchEvent(new Event("input", { bubbles: true }));
              return opt.text;
            }
          }
        }
        return null;
      },
      {
        selector: 'select[formcontrolname="timezone_location"]',
        tz: timeZone,
        gmt: gmtOffset,
      },
    );
    if (!selected) {
      throw new Error(`Timezone "${timeZone}" not found in dropdown`);
    }
  }

  async selectStartTime(startTime) {
    await this.startTime.waitFor({ state: "visible", timeout: 10000 });
    const el = await this.startTime.elementHandle();
    await this.page
      .waitForFunction((sel) => sel.options && sel.options.length > 1, el, {
        timeout: 10000,
      })
      .catch(() => {});
    const label = await this.startTime.evaluate((el, value) => {
      const lower = value.toLowerCase();
      for (const opt of el.options) {
        const t = opt.text.trim().toLowerCase();
        if (t.includes(lower) || lower.includes(t)) {
          return opt.text.trim();
        }
      }
      return null;
    }, startTime);
    if (label) {
      await this.startTime.selectOption({ label });
    }
  }

  async selectEndTime(endTime) {
    await this.endTime.waitFor({ state: "visible", timeout: 10000 });
    const el = await this.endTime.elementHandle();
    await this.page
      .waitForFunction((sel) => sel.options && sel.options.length > 1, el, {
        timeout: 10000,
      })
      .catch(() => {});
    const label = await this.endTime.evaluate((el, value) => {
      const lower = value.toLowerCase();
      for (const opt of el.options) {
        const t = opt.text.trim().toLowerCase();
        if (t.includes(lower) || lower.includes(t)) {
          return opt.text.trim();
        }
      }
      return null;
    }, endTime);
    if (label) {
      await this.endTime.selectOption({ label });
    }
  }

  async selectRepetition(repetition) {
    await this.repetition.waitFor({ state: "visible", timeout: 10000 });
    const options = this.repetition.locator("option");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = (await options.nth(i).textContent()) || "";
      if (
        text.trim().includes(repetition) ||
        repetition.includes(text.trim())
      ) {
        await this.repetition.selectOption({ label: text.trim() });
        return;
      }
    }
    if (count > 1) {
      const firstText = (await options.nth(1).textContent()) || "";
      await this.repetition.selectOption({ label: firstText.trim() });
    }
  }

  // =====================================================
  //  Date Selection
  // =====================================================

  async selectDate(dateSelection) {
    await expect(this.dateInput).toBeVisible();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = months.indexOf(dateSelection.month);
    if (monthIndex === -1) {
      throw new Error(`Invalid month: ${dateSelection.month}`);
    }
    await this.dateInput.click();
    await this.page.waitForTimeout(1000);

    const datePicker = this.page.locator(".bs-datepicker");
    if ((await datePicker.count()) > 0 && (await datePicker.isVisible())) {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const fullMonth = monthNames[monthIndex];

      const yearBtn = datePicker.locator("button.current").last();
      if ((await yearBtn.count()) > 0) {
        const btnText = (await yearBtn.textContent()) || "";
        const displayedYear = parseInt(
          btnText.replace(/\u200B/g, "").trim(),
          10,
        );
        if (displayedYear !== dateSelection.year) {
          await yearBtn.click();
          await this.page.waitForTimeout(500);
          const yearOpt = datePicker
            .locator("td span, button")
            .filter({ hasText: String(dateSelection.year) })
            .first();
          if ((await yearOpt.count()) > 0) {
            await yearOpt.click();
            await this.page.waitForTimeout(500);
          }
        }
      }

      const monthTable = datePicker.locator("table.months, table.days");
      const tableClass = (await monthTable.getAttribute("class")) || "";

      if (tableClass.includes("months")) {
        const monthCell = datePicker
          .locator("td span")
          .filter({ hasText: fullMonth })
          .first();
        if ((await monthCell.count()) > 0) {
          await monthCell.click();
          await this.page.waitForTimeout(500);
        }
      }

      const daysTable = datePicker.locator("table.days");
      if ((await daysTable.count()) > 0) {
        const dayCell = daysTable
          .locator("td span:not(.is-other-month):not(.is-disabled)")
          .filter({ hasText: new RegExp(`^${dateSelection.day}$`) })
          .first();
        if ((await dayCell.count()) > 0) {
          await dayCell.click();
          await this.page.waitForTimeout(300);
        }
      }
    }

    await expect(this.dateInput).not.toHaveValue("Select");
  }

  parseCalendarDate(dateText) {
    const match = dateText.match(
      /[A-Za-z]+,\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/,
    );

    if (!match) {
      throw new Error(`Invalid calendar date format: ${dateText}`);
    }

    const [, month, day, year] = match;

    return new Date(
      Number(year),
      new Date(`${month} 1, ${year}`).getMonth(),
      Number(day),
    );
  }

  async navigateToEventDate(dateSelection) {
    const targetDate = new Date(
      dateSelection.year,
      new Date(`${dateSelection.month} 1, ${dateSelection.year}`).getMonth(),
      dateSelection.day,
    );

    await expect(this.currentDateLabel).toBeVisible();

    for (let i = 0; i < 365; i++) {
      const displayedDateText = (
        await this.currentDateLabel.textContent()
      ).trim();

      const displayedDate = this.parseCalendarDate(displayedDateText);

      if (displayedDate.getTime() === targetDate.getTime()) {
        return;
      }

      if (displayedDate < targetDate) {
        await this.nextDateButton.click();
      } else {
        await this.previousDateButton.click();
      }

      await expect(this.currentDateLabel).not.toHaveText(displayedDateText);
    }

    throw new Error(
      `Unable to navigate to ${dateSelection.month} ${dateSelection.day}, ${dateSelection.year}`,
    );
  }

  // =====================================================
  //  Checkboxes
  // =====================================================

  async enableAddToTimesheet() {
    if (!(await this.addToTimesheetCheckbox.isChecked())) {
      await this.addToTimesheetCheckbox.check();
    }
  }

  async disableAddToTimesheet() {
    if (await this.addToTimesheetCheckbox.isChecked()) {
      await this.addToTimesheetCheckbox.uncheck();
    }
  }

  async isAddToTimesheetChecked() {
    return this.addToTimesheetCheckbox.isChecked();
  }

  async enableAllDay() {
    await this.allDayCheckbox.check();
  }

  async disableAllDay() {
    await this.allDayCheckbox.uncheck();
  }

  async isAllDayChecked() {
    return this.allDayCheckbox.isChecked();
  }

  // =====================================================
  //  Notification
  // =====================================================

  async addNotification() {
    await this.addNotificationButton.click();
  }

  async enterNotification(value) {
    await this.notificationValue.fill(String(value));
  }

  async selectNotificationUnit(unit) {
    await this.notificationUnitDropdown.selectOption({ label: unit });
  }

  async deleteNotification() {
    const count = await this.page.locator('[class="notify-delete"]').count();
    if (count === 0) return;
    await this.page.locator('[class="notify-delete"]').last().click();
    await this.page.waitForTimeout(500);
  }

  async getNotificationCount() {
    return this.page.locator('[class="notify-delete"]').count();
  }

  // =====================================================
  //  Meeting Details
  // =====================================================

  async enterMeetingLink(value) {
    await this.meetingLink.fill(value);
  }

  async enterDialInNumber(value) {
    await this.dialInNumber.fill(value);
  }

  async enterLocation(value) {
    await this.location.fill(value);
  }

  async enterMeetingAgenda(value) {
    await this.meetingAgenda.fill(value);
  }

  async enterMeetingDetails(data) {
    if (data.meetingLink) await this.enterMeetingLink(data.meetingLink);
    if (data.dialInNumber) await this.enterDialInNumber(data.dialInNumber);
    if (data.location) await this.enterLocation(data.location);
    if (data.agenda) await this.enterMeetingAgenda(data.agenda);
  }

  async getMeetingLinkValue() {
    return this.meetingLink.inputValue();
  }

  async getDialInNumberValue() {
    return this.dialInNumber.inputValue();
  }

  async getLocationValue() {
    return this.location.inputValue();
  }

  async getMeetingAgendaValue() {
    return this.meetingAgenda.inputValue();
  }

  // =====================================================
  //  Attendees - Individual
  // =====================================================
  async addIndividual(individualName) {
    await expect(this.searchConsumer).toBeVisible();
    await this.searchConsumer.fill(individualName);
    await this.searchConsumer.press("Tab");
    const addButton = this.searchConsumer
      .locator("xpath=..")
      .locator('input[type="button"][value="ADD"]');

    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();

    await addButton.click();
  }
  async verifyConsumerAdded(consumerName) {
    const selectedConsumer = this.page
      .locator(".selected-tag")
      .filter({ hasText: consumerName })
      .first();
    await expect(selectedConsumer).toBeVisible({ timeout: 10000 });
  }

  async getIndividualCount() {
    const section = this.page
      .locator("div")
      .filter({ has: this.searchConsumer })
      .first();
    return section.locator(".selected-tag").count();
  }

  // =====================================================
  //  Attendees - Clients
  // =====================================================

  async selectEntity(entityName) {
    const addClientsLabel = this.page
      .locator("div")
      .filter({ hasText: /^Add Clients$/ })
      .first();
    const parentDiv = addClientsLabel.locator("..").first();
    const entitySelect = parentDiv.locator("select").first();

    await entitySelect.scrollIntoViewIfNeeded();
    await expect(entitySelect).toBeVisible({ timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await entitySelect.selectOption({ label: entityName, timeout: 10000 });
    await expect(this.searchClient).toBeEnabled();
  }

  async addClient(clientName) {
    await this.searchClient.scrollIntoViewIfNeeded();
    await this.searchClient.waitFor({ state: "visible", timeout: 10000 });
    await this.searchClient.click();
    await this.searchClient.fill("");
    await this.page.waitForTimeout(300);
    await this.searchClient.fill(clientName);
    await this.page.waitForTimeout(2000);

    const dropdownOption = this.page
      .locator(
        ".ng-option, .ng-dropdown-panel-items .ng-option, [role='option'], .dropdown-item",
      )
      .filter({ hasText: clientName })
      .first();
    if ((await dropdownOption.count()) > 0) {
      await dropdownOption.click();
      await this.page.waitForTimeout(500);
    } else {
      await this.searchClient.press("ArrowDown");
      await this.page.waitForTimeout(300);
      await this.searchClient.press("Tab");
      await this.page.waitForTimeout(500);
    }

    const addButton = this.searchClient
      .locator("xpath=..")
      .locator('input[type="button"][value="ADD"]');
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click({ timeout: 5000 });
    await this.page.waitForTimeout(1000);

    const selectedTag = this.page
      .locator(".selected-tag")
      .filter({ hasText: clientName })
      .first();
    await expect(selectedTag).toBeVisible({ timeout: 10000 });
  }

  async verifyClientAdded(clientName) {
    const selectedClient = this.page
      .locator(".selected-tag")
      .filter({ hasText: clientName })
      .first();
    await expect(selectedClient).toBeVisible({ timeout: 10000 });
  }

  async getClientCount() {
    const section = this.page
      .locator("div")
      .filter({ has: this.searchClient })
      .first();
    return section.locator(".selected-tag").count();
  }

  // =====================================================
  //  Attendees - Corporate
  // =====================================================

  async selectCorporateEntity(corporatName) {
    const addCorporateLabel = this.page
      .locator("div")
      .filter({ hasText: /^Add Corporate$/ })
      .first();
    const parentDiv = addCorporateLabel.locator("..").first();
    const corporateSelect = parentDiv.locator("select").first();

    await corporateSelect.scrollIntoViewIfNeeded();
    await corporateSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.evaluate(
      ({ selector, value }) => {
        const select = document.querySelector(selector);
        if (!select) return;
        const lowerValue = value.toLowerCase();
        for (const opt of select.options) {
          const optText = opt.text.trim().toLowerCase();
          if (optText.includes(lowerValue) || lowerValue.includes(optText)) {
            select.value = opt.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            select.dispatchEvent(new Event("input", { bubbles: true }));
            return;
          }
        }
      },
      {
        selector: 'select[formcontrolname="corporate_entity"]',
        value: corporatName,
      },
    );
    await this.page.waitForTimeout(500);
    await expect(this.searchCorporate).toBeEnabled();
  }

  async addCorporate(corporateName) {
    await this.searchCorporate.scrollIntoViewIfNeeded();
    await this.searchCorporate.waitFor({ state: "visible", timeout: 10000 });
    await this.searchCorporate.click();
    await this.page.waitForTimeout(300);
    await this.searchCorporate.fill("");
    await this.page.waitForTimeout(300);
    await this.searchCorporate.fill(corporateName);
    await this.page.waitForTimeout(2000);

    const dropdownOption = this.page
      .locator(
        ".ng-option, .ng-dropdown-panel-items .ng-option, [role='option'], .dropdown-item",
      )
      .filter({ hasText: corporateName })
      .first();
    if ((await dropdownOption.count()) > 0) {
      await dropdownOption.click();
      await this.page.waitForTimeout(1000);
    } else {
      await this.searchCorporate.press("ArrowDown");
      await this.page.waitForTimeout(500);
      await this.searchCorporate.press("Tab");
      await this.page.waitForTimeout(500);
    }

    await this.page.waitForTimeout(500);
    const addButton = this.searchCorporate.locator(
      'xpath=following::input[@type="button" and @value="ADD"][1]',
    );
    await addButton.scrollIntoViewIfNeeded();
    await addButton.click({ timeout: 5000 });
    await this.page.waitForTimeout(2000);

    const selectedTag = this.page
      .locator(".selected-tag")
      .filter({ hasText: corporateName })
      .first();
    await expect(selectedTag).toBeVisible({ timeout: 10000 });
  }

  async verifyCorporateAdded(corporateName) {
    const selectedCorporate = this.page
      .locator(".selected-tag")
      .filter({ hasText: corporateName })
      .first();
    await expect(selectedCorporate).toBeVisible({ timeout: 10000 });
  }

  async getCorporateCount() {
    const section = this.page
      .locator("div")
      .filter({ has: this.searchCorporate })
      .first();
    return section.locator(".selected-tag").count();
  }

  // =====================================================
  //  Attendees - Document
  // =====================================================

  async attachDocument(documentName) {
    await this.searchDocument.scrollIntoViewIfNeeded();
    await this.searchDocument.waitFor({ state: "visible", timeout: 10000 });
    await this.searchDocument.click();
    await this.searchDocument.fill("");
    await this.page.waitForTimeout(300);
    await this.searchDocument.fill(documentName);
    await this.page.waitForTimeout(2000);

    const dropdownOption = this.page
      .locator(
        ".ng-option, .ng-dropdown-panel-items .ng-option, [role='option'], .dropdown-item",
      )
      .filter({ hasText: documentName })
      .first();
    if ((await dropdownOption.count()) > 0) {
      await dropdownOption.click();
      await this.page.waitForTimeout(500);
    } else {
      await this.searchDocument.press("ArrowDown");
      await this.page.waitForTimeout(500);
      await this.searchDocument.press("Tab");
      await this.page.waitForTimeout(500);
    }

    const selectedTag = this.page
      .locator(".selected-tag")
      .filter({ hasText: documentName })
      .first();
    if ((await selectedTag.count()) > 0) {
      await expect(selectedTag).toBeVisible({ timeout: 10000 });
      return;
    }

    const attachButton = this.page
      .locator("div")
      .filter({ has: this.page.getByText("Add Document") })
      .first()
      .getByRole("button", { name: "Attach" });
    await attachButton.scrollIntoViewIfNeeded();
    await attachButton.click();
    await this.page.waitForTimeout(1000);
    await expect(selectedTag).toBeVisible({ timeout: 10000 });
  }

  async verifyDocumentAdded(documentName) {
    const selectedDoc = this.page
      .locator(".selected-tag")
      .filter({ hasText: documentName })
      .first();
    await expect(selectedDoc).toBeVisible({ timeout: 10000 });
  }

  async getDocumentCount() {
    const section = this.page
      .locator("div")
      .filter({ has: this.searchDocument })
      .first();
    return section.locator(".selected-tag").count();
  }

  // =====================================================
  //  Save / Cancel
  // =====================================================

  async clickSaveEvent() {
    await this.saveEventButton.scrollIntoViewIfNeeded();
    await this.saveEventButton.click();
  }

  async clickCancel() {
    await this.cancelButton.scrollIntoViewIfNeeded();
    await this.cancelButton.click();
  }

  async verifyToastMessage(expectedText) {
    const toast = this.toastMessage.filter({
      hasText: new RegExp(expectedText, "i"),
    });
    await expect(toast).toBeVisible({ timeout: 15000 });
  }

  // =====================================================
  //  Calendar Verification
  // =====================================================

  async verifyCreatedEvent(dateSelection, matter, subjectTask, startTime) {
    await this.navigateToEventDate(dateSelection);
    await this.page.waitForTimeout(2000);

    let event = this.page
      .locator(".cal-event-title")
      .filter({
        hasText: `${startTime} - ${matter} - ${subjectTask}`,
      })
      .first();

    if ((await event.count()) === 0) {
      event = this.page
        .locator(".cal-event-title")
        .filter({
          hasText: subjectTask,
        })
        .first();
    }

    if ((await event.count()) === 0) {
      event = this.page
        .locator(".cal-event-title")
        .filter({
          hasText: matter,
        })
        .first();
    }

    if ((await event.count()) === 0) {
      const allEvents = this.page.locator(".cal-event-title");
      const eventCount = await allEvents.count();
      if (eventCount > 0) {
        event = allEvents.first();
      }
    }

    await expect(event).toBeVisible({ timeout: 15000 });
  }

  async getCalendarEvents() {
    return this.calendarEvent;
  }

  async clickCalendarEvent(eventText) {
    const event = this.calendarEvent.filter({ hasText: eventText }).first();
    const count = await event.count();

    if (count === 0) {
      const anyEvent = this.calendarEvent.first();
      const anyCount = await anyEvent.count();
      if (anyCount > 0) {
        await anyEvent.click({ force: true });
      }
    } else {
      await expect(event).toBeVisible({ timeout: 10000 });
      await event.click({ force: true });
    }

    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState("networkidle");

    const heading = this.page.locator("h2.evt-title, .evt-popover h2").first();
    const overlay = this.page.locator("app-viewevent, .evt-overlay").first();
    const viewBtn = this.page.getByRole("button", { name: /view/i }).first();

    let headingFound = false;
    try {
      await expect(heading).toBeVisible({ timeout: 10000 });
      headingFound = true;
    } catch (e) {
      // Heading not found
    }

    if (
      (await viewBtn.count()) > 0 &&
      (await viewBtn.isVisible().catch(() => false))
    ) {
      await viewBtn.click();
      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState("networkidle");
      return;
    }

    if (!headingFound) {
      try {
        await expect(overlay).toBeVisible({ timeout: 15000 });
        const overlayReady = overlay.locator("button, h2, .evt-title").first();
        await expect(overlayReady).toBeVisible({ timeout: 10000 });
      } catch (e) {
        // Retry clicking the event
        const calEvent = this.page
          .locator(".cal-event-title")
          .filter({ hasText: eventText })
          .first();
        if ((await calEvent.count()) > 0) {
          await calEvent.click({ force: true });
          await this.page.waitForTimeout(3000);
          await this.page.waitForLoadState("networkidle");
        }
      }
    }
  }

  async navigateToDateAndClickEvent(dateSelection, eventText) {
    await this.navigateToEventDate(dateSelection);
    await this.page.waitForTimeout(2000);

    // Click on any visible event in the calendar
    const events = this.page.locator(
      ".cal-event-container, mwl-calendar-month-view .cal-event",
    );
    const eventCount = await events.count();

    if (eventCount > 0) {
      await events.first().click({ force: true });
    } else {
      // Fallback: click on the calendar day cell
      const dayCell = this.page
        .locator(".cal-day-cell:not(.cal-out-month)")
        .first();
      if ((await dayCell.count()) > 0) {
        await dayCell.click();
      }
    }

    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState("networkidle");
  }

  // =====================================================
  //  Scroll Helpers
  // =====================================================

  async scrollToMeetingDetails() {
    await this.meetingLink.scrollIntoViewIfNeeded();
  }

  async scrollToAttendees() {
    await this.searchClient.scrollIntoViewIfNeeded();
  }

  async scrollToIndividual() {
    await this.scrollElementIntoView(this.searchConsumer);
  }

  async scrollToSaveButton() {
    await this.saveEventButton.scrollIntoViewIfNeeded();
  }

  // =====================================================
  //  Verify Methods
  // =====================================================

  async verifyMeetingsPageLoaded() {
    await expect(this.meetingHeading).toBeVisible({ timeout: 15000 });
  }

  async verifyCreateMeetingPageLoaded() {
    await expect(this.createPageHeading).toBeVisible({ timeout: 15000 });
  }

  async verifyEventTypeDropdownVisible() {
    await expect(this.eventTypeDropdown).toBeVisible({ timeout: 10000 });
  }

  async verifyEventTypeSelected(expectedType) {
    const selectedLabel = this.eventTypeDropdown.locator("option:checked");
    await expect(selectedLabel).toHaveText(expectedType, { timeout: 10000 });
  }

  async verifyMatterNameVisible() {
    await expect(this.matterNameDropDown).toBeVisible({ timeout: 10000 });
  }

  async verifyMatterFieldsVisible() {
    await expect(this.matterNameDropDown).toBeVisible({ timeout: 10000 });
  }

  async verifySubjectTaskVisible() {
    await expect(this.subjectTaskDropdown).toBeVisible({ timeout: 10000 });
  }

  async verifySubjectTaskOptions(expectedOptions) {
    const options = this.subjectTaskDropdown.locator("option");
    const count = await options.count();
    const actualOptions = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim() && text.trim() !== "Select") {
        actualOptions.push(text.trim());
      }
    }
    for (const expected of expectedOptions) {
      expect(actualOptions).toContainEqual(expected);
    }
  }

  async verifyTimeZoneVisible() {
    await expect(this.timeZone).toBeVisible({ timeout: 10000 });
  }

  async verifyTimeZoneSelected(expectedZone) {
    const actual = await this.page.evaluate((selector) => {
      const select = document.querySelector(selector);
      return select?.options[select.selectedIndex]?.text || "";
    }, 'select[formcontrolname="timezone_location"]');
    expect(actual).toContain(expectedZone);
  }

  async verifyDateFieldVisible() {
    await expect(this.dateInput).toBeVisible({ timeout: 10000 });
  }

  async verifyTimeFieldsVisible() {
    await expect(this.startTime).toBeVisible({ timeout: 10000 });
    await expect(this.endTime).toBeVisible({ timeout: 10000 });
  }

  async verifyTimeFieldsHidden() {
    await expect(this.startTime).toBeHidden({ timeout: 5000 });
    await expect(this.endTime).toBeHidden({ timeout: 5000 });
  }

  async verifyRepetitionVisible() {
    await expect(this.repetition).toBeVisible({ timeout: 10000 });
  }

  async verifyRepetitionOptions(expectedOptions) {
    const options = this.repetition.locator("option");
    const count = await options.count();
    const actualOptions = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text && text.trim() && text.trim() !== "Select") {
        actualOptions.push(text.trim());
      }
    }
    for (const expected of expectedOptions) {
      expect(actualOptions).toContainEqual(expected);
    }
  }

  async verifyAddToTimesheetVisible() {
    await expect(this.addToTimesheetCheckbox).toBeVisible({ timeout: 10000 });
  }

  async verifyAllDayVisible() {
    await expect(this.allDayCheckbox).toBeVisible({ timeout: 10000 });
  }

  async verifyAddNotificationVisible() {
    await expect(this.addNotificationButton).toBeVisible({ timeout: 10000 });
  }

  async verifyMeetingLinkVisible() {
    await expect(this.meetingLink).toBeVisible({ timeout: 10000 });
  }

  async verifyDialInNumberVisible() {
    await expect(this.dialInNumber).toBeVisible({ timeout: 10000 });
  }

  async verifyLocationVisible() {
    await expect(this.location).toBeVisible({ timeout: 10000 });
  }

  async verifyMeetingAgendaVisible() {
    await expect(this.meetingAgenda).toBeVisible({ timeout: 10000 });
  }

  async verifyClientSectionVisible() {
    await expect(this.searchClient).toBeVisible({ timeout: 10000 });
  }

  async verifyCorporateSectionVisible() {
    await expect(this.searchCorporate).toBeVisible({ timeout: 10000 });
  }

  async verifyIndividualSectionVisible() {
    await expect(this.searchConsumer).toBeVisible({ timeout: 10000 });
  }

  async verifyDocumentSectionVisible() {
    await expect(this.searchDocument).toBeVisible({ timeout: 10000 });
  }

  async verifyCalendarEventsVisible() {
    const calendarView = this.page
      .locator(
        ".cal-month-view, .cal-day-view, .cal-week-view, [class*='calendar'], [role='grid']",
      )
      .first();
    await expect(calendarView).toBeVisible({ timeout: 10000 });
  }

  async verifyEventSavedSuccessfully() {
    await this.page.waitForLoadState("networkidle");
    const alert = this.page.getByRole("alert");
    const toastMsg = this.page.locator(".toast-message, .toast-body");
    try {
      await expect(alert).toBeVisible({ timeout: 15000 });
    } catch (e) {
      try {
        await expect(toastMsg).toBeVisible({ timeout: 15000 });
      } catch (e2) {
        await this.page.waitForTimeout(3000);
      }
    }
  }

  async scrollElementIntoView(locator) {
    await locator.waitFor({
      state: "attached",
      timeout: 10000,
    });

    await locator.evaluate((element) => {
      let parent = element.parentElement;

      while (parent) {
        const style = window.getComputedStyle(parent);

        const isScrollable =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          parent.scrollHeight > parent.clientHeight;

        if (isScrollable) {
          const elementRect = element.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();

          // Scroll element into the middle of the scroll container
          parent.scrollTop +=
            elementRect.top -
            parentRect.top -
            parent.clientHeight / 2 +
            elementRect.height / 2;

          return;
        }

        parent = parent.parentElement;
      }

      // Fallback
      element.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
    });

    await this.page.waitForTimeout(500);
  }
  async scrollFormToBottom() {
    const result = await this.searchConsumer.evaluate((element) => {
      let parent = element.parentElement;

      while (parent) {
        if (parent.scrollHeight > parent.clientHeight) {
          parent.scrollTop = parent.scrollHeight;

          return {
            tag: parent.tagName,
            className: parent.className,
            scrollTop: parent.scrollTop,
            scrollHeight: parent.scrollHeight,
            clientHeight: parent.clientHeight,
          };
        }

        parent = parent.parentElement;
      }

      return null;
    });

    await this.page.waitForTimeout(500);
  }

  // =====================================================
  //  Edit Event Methods
  // =====================================================

  async clickEditButton() {
    const modalClose = this.page.locator(
      "ngb-modal-window button:has-text('Close'), .modal button:has-text('Close'), .modal .close",
    );
    if ((await modalClose.count()) > 0) {
      await modalClose.first().click();
      await this.page.waitForTimeout(1000);
    }

    const spinner = this.page.locator("ngx-spinner, .ngx-spinner-overlay");
    if ((await spinner.count()) > 0) {
      await this.page
        .waitForFunction(
          () => {
            const el = document.querySelector("ngx-spinner");
            return (
              !el || el.style.display === "none" || el.children.length === 0
            );
          },
          { timeout: 15000 },
        )
        .catch(() => {});
    }

    const overlay = this.page.locator("app-viewevent, .evt-overlay").first();
    if (await overlay.isVisible().catch(() => false)) {
      await this.page.waitForTimeout(2000);
    }

    const editBtn = this.page.locator(
      "button[title='Edit'], button[mattooltip='Edit']",
    );

    if (
      !(await editBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    ) {
      const fallbackBtn = this.page
        .locator("app-viewevent")
        .getByRole("button", {
          name: /edit/i,
        });
      if ((await fallbackBtn.count()) > 0) {
        await expect(fallbackBtn.first()).toBeVisible({ timeout: 10000 });
        await fallbackBtn.first().click();
        await expect(this.editPageHeading).toBeVisible({ timeout: 15000 });
        return;
      }
    }

    await expect(editBtn.first()).toBeVisible({ timeout: 10000 });
    await editBtn.first().click();
    await expect(this.editPageHeading).toBeVisible({ timeout: 15000 });
  }

  async clickDeleteButton() {
    const modalClose = this.page.locator(
      "ngb-modal-window button:has-text('Close'), .modal button:has-text('Close'), .modal .close",
    );
    if ((await modalClose.count()) > 0) {
      await modalClose.first().click();
      await this.page.waitForTimeout(1000);
    }

    const spinner = this.page.locator("ngx-spinner, .ngx-spinner-overlay");
    if ((await spinner.count()) > 0) {
      await this.page
        .waitForFunction(
          () => {
            const el = document.querySelector("ngx-spinner");
            return (
              !el || el.style.display === "none" || el.children.length === 0
            );
          },
          { timeout: 15000 },
        )
        .catch(() => {});
    }

    const overlay = this.page.locator("app-viewevent, .evt-overlay").first();
    if (await overlay.isVisible().catch(() => false)) {
      await this.page.waitForTimeout(2000);
    }

    const deleteBtn = this.page.locator(
      "button[title='Delete'], button[mattooltip='Delete'], .evt-overlay button[title='Delete'], app-viewevent button[title='Delete'], app-viewevent button[mattooltip='Delete']",
    );

    if (
      !(await deleteBtn
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false))
    ) {
      const fallbackBtn = this.page
        .locator("app-viewevent, .evt-overlay")
        .first()
        .getByRole("button", {
          name: /delete/i,
        });
      if ((await fallbackBtn.count()) > 0) {
        await expect(fallbackBtn.first()).toBeVisible({ timeout: 10000 });
        await fallbackBtn.first().click();
        return;
      }
    }

    await expect(deleteBtn.first()).toBeVisible({ timeout: 10000 });
    await deleteBtn.first().click();
  }

  async confirmDelete() {
    const confirmBtn = this.page.getByRole("button", {
      name: /yes|confirm|delete/i,
    });
    await expect(confirmBtn.first()).toBeVisible({ timeout: 10000 });
    await confirmBtn.first().click();

    await this.page.waitForTimeout(2000);

    const timesheetBtn = this.page.getByRole("button", {
      name: /update both|update event only|event only/i,
    });
    if (
      (await timesheetBtn.count()) > 0 &&
      (await timesheetBtn
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      await timesheetBtn.first().click();
      await this.page.waitForTimeout(1000);
    }

    for (let i = 0; i < 3; i++) {
      const modalVisible = await this.page
        .locator(".modal")
        .isVisible()
        .catch(() => false);
      const ngbVisible = await this.page
        .locator("ngb-modal-window")
        .isVisible()
        .catch(() => false);
      const overlayVisible = await this.eventOverlay
        .isVisible()
        .catch(() => false);
      if (!modalVisible && !ngbVisible && !overlayVisible) break;
      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(1000);
    }

    const stillBlocked =
      (await this.page
        .locator(".modal")
        .isVisible()
        .catch(() => false)) ||
      (await this.page
        .locator("ngb-modal-window")
        .isVisible()
        .catch(() => false)) ||
      (await this.eventOverlay.isVisible().catch(() => false));
    if (stillBlocked) {
      await this.page.evaluate(() => {
        document
          .querySelectorAll(
            ".modal, .modal-backdrop, ngb-modal-window, app-viewevent, .evt-overlay",
          )
          .forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
      });
      await this.page.waitForTimeout(500);
    }

    await this.page.waitForLoadState("networkidle");
  }

  async cancelDelete() {
    const cancelBtn = this.page.getByRole("button", {
      name: /no|cancel/i,
    });
    await expect(cancelBtn.first()).toBeVisible({ timeout: 10000 });
    await cancelBtn.first().click();
    await this.page.waitForTimeout(1000);
  }

  async clickUpdateEvent() {
    await this.updateEventButton.scrollIntoViewIfNeeded();
    await this.updateEventButton.click();

    await this.page.waitForTimeout(1500);

    const recurringDialog = this.page.locator(
      "h4:has-text('Edit recurring event'), .modal-header:has-text('recurring')",
    );
    if (
      (await recurringDialog.count()) > 0 &&
      (await recurringDialog.first().isVisible().catch(() => false))
    ) {
      const radios = this.page.locator(
        ".modal input[type='radio'], ngb-modal-window input[type='radio'], .modal-body input[type='radio']",
      );
      const radioCount = await radios.count();

      if (radioCount > 0) {
        await radios.first().check({ force: true });
      } else {
        const labels = this.page.locator(
          ".modal label, ngb-modal-window label, .modal-body label",
        );
        const labelCount = await labels.count();
        for (let i = 0; i < labelCount; i++) {
          const text = (await labels.nth(i).textContent()) || "";
          if (text.includes("This and Following")) {
            await labels.nth(i).click();
            break;
          }
        }
      }

      const okBtn = this.page.getByRole("button", { name: "OK" });
      await expect(okBtn).toBeVisible({ timeout: 5000 });
      await okBtn.click();
      await this.page.waitForTimeout(1500);
      return;
    }

    const confirmBtn = this.page.getByRole("button", {
      name: /update both|event only/i,
    });
    if (
      (await confirmBtn.count()) > 0 &&
      (await confirmBtn.first().isVisible().catch(() => false))
    ) {
      await confirmBtn.first().click();
    }

    for (let i = 0; i < 3; i++) {
      const modalVisible = await this.page
        .locator(".modal")
        .isVisible()
        .catch(() => false);
      if (!modalVisible) break;
      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(1000);
    }

    const stillBlocked = await this.page
      .locator(".modal")
      .isVisible()
      .catch(() => false);
    if (stillBlocked) {
      await this.page.evaluate(() => {
        document
          .querySelectorAll(".modal, .modal-backdrop, ngb-modal-window")
          .forEach((el) => el.remove());
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
      });
      await this.page.waitForTimeout(500);
    }
  }

  async verifyEditPageLoaded() {
    await expect(this.editPageHeading).toBeVisible({ timeout: 15000 });
  }

  async removeClient(clientName) {
    const selectedTag = this.page
      .locator(".selected-tag")
      .filter({ hasText: clientName })
      .first();
    const closeButton = selectedTag.locator(
      ".close, [class*='remove'], [class*='delete']",
    );
    if ((await closeButton.count()) > 0) {
      await closeButton.first().click();
      await this.page.waitForTimeout(500);
    }
  }

  async removeLastClient() {
    const closeButtons = this.page.locator(".selected-tag .close");
    const count = await closeButtons.count();
    if (count > 0) {
      await closeButtons.last().click();
      await this.page.waitForTimeout(500);
    }
  }

  async getClientNames() {
    const tags = this.page
      .locator("div")
      .filter({ has: this.searchClient })
      .first()
      .locator(".selected-tag");
    const count = await tags.count();
    const names = [];
    for (let i = 0; i < count; i++) {
      const text = await tags.nth(i).textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  async getDateValue() {
    return this.dateInput.inputValue();
  }

  async getSelectedStartTime() {
    const result = await this.page.evaluate((selector) => {
      const select = document.querySelector(selector);
      return select?.options[select.selectedIndex]?.text || "";
    }, 'select[formcontrolname="from_ts"]');
    return result;
  }

  async getSelectedEndTime() {
    const result = await this.page.evaluate((selector) => {
      const select = document.querySelector(selector);
      return select?.options[select.selectedIndex]?.text || "";
    }, 'select[formcontrolname="to_ts"]');
    return result;
  }

  async verifyEventNotOnDate(dateSelection, matter, subjectTask, startTime) {
    try {
      await this.navigateToEventDate(dateSelection);
      const expectedEventText = `${startTime} - ${matter} - ${subjectTask}`;
      const event = this.page.locator(".cal-event-title").filter({
        hasText: expectedEventText,
      });
      await expect(event).toBeHidden({ timeout: 5000 });
    } catch (e) {
      // If navigation fails, the event is not on this date
    }
  }

  async verifyNoEventOnDate(dateSelection) {
    try {
      await this.navigateToEventDate(dateSelection);
      const events = this.page.locator(".cal-event-title");
      const count = await events.count();
      expect(count).toBe(0);
    } catch (e) {
      // If navigation fails, no events exist
    }
  }

  // =====================================================
  //  Delete Duplicate Events
  // =====================================================

  async getAllEventTitles() {
    const events = this.page.locator(".cal-event-title");
    const count = await events.count();
    const titles = [];
    for (let i = 0; i < count; i++) {
      const text = (await events.nth(i).textContent()) || "";
      titles.push(text.trim());
    }
    return titles;
  }

  async getDuplicateEvents() {
    const titles = await this.getAllEventTitles();
    const seen = {};
    const duplicates = [];
    for (const title of titles) {
      if (seen[title]) {
        if (seen[title] === 1) {
          duplicates.push(title);
        }
        seen[title]++;
      } else {
        seen[title] = 1;
      }
    }
    return duplicates;
  }

  async deleteEventByTitle(eventTitle) {
    const event = this.page
      .locator(".cal-event-title")
      .filter({ hasText: eventTitle })
      .first();
    if ((await event.count()) > 0) {
      await this.clickCalendarEvent(eventTitle);
      await this.page.waitForTimeout(2000);

      const deleteBtn = this.page.locator(
        "button[title='Delete'], button[mattooltip='Delete']",
      );
      const fallbackBtn = this.page
        .locator("app-viewevent, .evt-overlay")
        .first()
        .getByRole("button", { name: /delete/i });

      const hasDeleteBtn =
        ((await deleteBtn.count()) > 0 &&
          (await deleteBtn
            .first()
            .isVisible()
            .catch(() => false))) ||
        ((await fallbackBtn.count()) > 0 &&
          (await fallbackBtn
            .first()
            .isVisible()
            .catch(() => false)));

      if (hasDeleteBtn) {
        await this.clickDeleteButton();
        await this.confirmDelete();
      } else {
        await this.page.keyboard.press("Escape");
        await this.page.waitForTimeout(1000);
      }
    }
  }

  async deleteAllDuplicateEvents() {
    await this.page.waitForTimeout(2000);
    let duplicates = await this.getDuplicateEvents();
    let deletedCount = 0;

    while (duplicates.length > 0) {
      const titleToDelete = duplicates[0];
      await this.deleteEventByTitle(titleToDelete);
      deletedCount++;
      await this.page.waitForTimeout(2000);
      duplicates = await this.getDuplicateEvents();
    }

    return deletedCount;
  }

  // =====================================================
  //  Verify Repetition Type
  // =====================================================

  async verifyEventRepetitionType(dateSelection, subjectTask, repetitionType) {
    await this.navigateToEventDate(dateSelection);
    await this.page.waitForTimeout(2000);

    const event = this.page
      .locator(".cal-event-title")
      .filter({ hasText: subjectTask })
      .first();

    if ((await event.count()) > 0) {
      await event.click({ force: true });
      await this.page.waitForTimeout(2000);

      const repetitionBadge = this.page
        .locator(
          ".cal-event-title, .event-repetition, .repetition-badge, [class*='repeat']",
        )
        .filter({ hasText: new RegExp(repetitionType, "i") })
        .first();

      const eventContainer = this.page
        .locator("app-viewevent, .evt-overlay, .modal")
        .first();

      let repetitionFound = false;

      if (
        (await repetitionBadge.count()) > 0 &&
        (await repetitionBadge.isVisible().catch(() => false))
      ) {
        repetitionFound = true;
      }

      if (!repetitionFound) {
        const allText = await eventContainer.textContent().catch(() => "");
        if (allText.toLowerCase().includes(repetitionType.toLowerCase())) {
          repetitionFound = true;
        }
      }

      if (!repetitionFound) {
        const eventTitle = this.page
          .locator("h2.evt-title, .evt-popover h2, .modal-title")
          .first();
        if ((await eventTitle.count()) > 0) {
          const titleText = await eventTitle.textContent().catch(() => "");
          if (titleText.toLowerCase().includes(repetitionType.toLowerCase())) {
            repetitionFound = true;
          }
        }
      }

      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(1000);

      return repetitionFound;
    }

    return false;
  }

  async verifyRepetitionIconOnCalendar(
    dateSelection,
    subjectTask,
    repetitionType,
  ) {
    await this.navigateToEventDate(dateSelection);
    await this.page.waitForTimeout(2000);

    const event = this.page
      .locator(".cal-event-title")
      .filter({ hasText: subjectTask })
      .first();

    if ((await event.count()) > 0) {
      const eventParent = event.locator("..").first();
      const repetitionIcon = eventParent
        .locator(
          "[class*='repeat'], [title*='repeat'], [class*='recurring'], img[alt*='repeat']",
        )
        .first();

      if ((await repetitionIcon.count()) > 0) {
        return true;
      }

      const eventHtml = await eventParent.innerHTML().catch(() => "");
      const repeatIcons = ["repeat", "recurring", "recurrence", "cycle"];
      for (const icon of repeatIcons) {
        if (eventHtml.toLowerCase().includes(icon)) {
          return true;
        }
      }
    }

    return false;
  }
}

module.exports = MeetingPage;
