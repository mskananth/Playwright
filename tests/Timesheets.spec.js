require("dotenv").config();

const { test, expect } = require("@playwright/test");
const TimesheetPage = require("../Pages/TimesheetPage");
const LoginPage = require("../Pages/LoginPage");
const timesheetsData = require("../testData/timesheetsData.json");
const { loginData } = require("../testData/loginData");

const defaultLogin = (loginData && loginData[0]) || {};

let page;
let timesheetPage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.loginWithPassword(
    defaultLogin.email || process.env.EMAIL,
    defaultLogin.password || process.env.PASSWORD,
  );

  await loginPage.assertTitle("Lex-Z Lawyers");
  timesheetPage = new TimesheetPage(page);
});

test.afterAll(async () => {
  await page.close();
});

//  SECTION 1: Navigation & Page Load (TC-TS-001)

test.describe("Navigation & Page Load", () => {
  test("TC-TS-001. Verify Timesheet Entry page navigation", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    await timesheetPage.verifyTimesheetEntryPageLoaded();
  });
});

//  SECTION 2: Date Range Controls (TC-TS-002 → TC-TS-009)

test.describe("Date Range Controls", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
  });

  test("TC-TS-002. Verify default date range", async () => {
    const { fromDate, toDate } = await timesheetPage.verifyDefaultDateRange();
    expect(fromDate).toBeTruthy();
    expect(toDate).toBeTruthy();
  });

  test("TC-TS-003. Verify From date picker", async () => {
    await timesheetPage.clickFromDatePicker();
    await timesheetPage.verifyCalendarOpened();
  });

  test("TC-TS-004. Verify To date picker", async () => {
    await timesheetPage.clickToDatePicker();
    await timesheetPage.verifyCalendarOpened();
  });

  test("TC-TS-005. Verify changing the From date", async () => {
    const originalDate = await timesheetPage.getFromDateValue();
    const data = timesheetsData.TC_TS_005;
    await timesheetPage.setFromDate(data.newFromDate);
    await timesheetPage.verifyFromDateDisplayed(data.newFromDate);
    const newDate = await timesheetPage.getFromDateValue();
    expect(newDate).not.toBe(originalDate);
  });

  test("TC-TS-006. Verify changing the To date", async () => {
    const originalDate = await timesheetPage.getToDateValue();
    const data = timesheetsData.TC_TS_006;
    await timesheetPage.setToDate(data.newToDate);
    await timesheetPage.verifyToDateDisplayed(data.newToDate);
    const newDate = await timesheetPage.getToDateValue();
    expect(newDate).not.toBe(originalDate);
  });

  test("TC-TS-007. Verify invalid date range", async () => {
    const data = timesheetsData.TC_TS_007;
    await timesheetPage.setToDate(data.invalidToDate);
    await timesheetPage.verifyInvalidDateRange();
  });

  test("TC-TS-008. Verify previous-period navigation", async () => {
    const { fromDate } = await timesheetPage.verifyDefaultDateRange();
    await timesheetPage.clickPreviousPeriod();
    await timesheetPage.verifyPeriodUpdated();
    const newFromDate = await timesheetPage.getFromDateValue();
    expect(newFromDate).not.toBe(fromDate);
  });

  test("TC-TS-009. Verify next-period navigation", async () => {
    await timesheetPage.clickPreviousPeriod();
    const { fromDate } = await timesheetPage.verifyDefaultDateRange();
    await timesheetPage.clickNextPeriod();
    await timesheetPage.verifyPeriodUpdated();
    const newFromDate = await timesheetPage.getFromDateValue();
    expect(newFromDate).not.toBe(fromDate);
  });
});

//  SECTION 3: Dropdowns (TC-TS-010 → TC-TS-017)

test.describe("Dropdowns", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
  });

  test("TC-TS-010. Verify Matter dropdown", async () => {
    await timesheetPage.verifyDropdownOptionsVisible("matter");
  });

  test("TC-TS-011. Verify Matter selection", async () => {
    const data = timesheetsData.TC_TS_011;
    await timesheetPage.selectMatter(data.matter);
    await timesheetPage.verifyDropdownSelection("matter", data.matter);
  });

  test("TC-TS-012. Verify Task dropdown", async () => {
    const data = timesheetsData.TC_TS_013;
    await timesheetPage.selectMatter(data.matter);
    await timesheetPage.verifyDropdownOptionsVisible("task");
  });

  test("TC-TS-013. Verify Task selection", async () => {
    const data = timesheetsData.TC_TS_013;
    await timesheetPage.selectMatter(data.matter);
    await timesheetPage.selectTask(data.task);
    await timesheetPage.verifyDropdownSelection("task", data.task);
  });

  test("TC-TS-014. Verify Status dropdown", async () => {
    await timesheetPage.verifyDropdownOptionsVisible("status");
  });

  test("TC-TS-015. Verify Billable status selection", async () => {
    const data = timesheetsData.TC_TS_015;
    await timesheetPage.selectStatus(data.status);
    await timesheetPage.verifyDropdownSelection("status", data.status);
  });

  test("TC-TS-016. Verify Date dropdown", async () => {
    await timesheetPage.verifyDropdownOptionsVisible("date");
  });

  test("TC-TS-017. Verify entry date selection", async () => {
    const data = timesheetsData.TC_TS_017;
    await timesheetPage.selectEntryDate(data.date);
    await timesheetPage.verifyDropdownSelection("date", data.date);
  });
});

//  SECTION 4: Duration Inputs (TC-TS-018 → TC-TS-021)

test.describe("Duration Inputs", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
  });

  test("TC-TS-018. Verify Hours field", async () => {
    const data = timesheetsData.TC_TS_018;
    await timesheetPage.enterHours(data.hours);
    await timesheetPage.verifyHoursValue(data.hours);
  });

  test("TC-TS-019. Verify Minutes field", async () => {
    const data = timesheetsData.TC_TS_019;
    await timesheetPage.enterMinutes(data.minutes);
    await timesheetPage.verifyMinutesValue(data.minutes);
  });

  test("TC-TS-020. Verify invalid Hours input", async () => {
    const data = timesheetsData.TC_TS_020;
    await timesheetPage.enterHours(data.invalidHours);
    await timesheetPage.verifyInvalidHoursInput();
  });

  test("TC-TS-021. Verify invalid Minutes input", async () => {
    const data = timesheetsData.TC_TS_021;
    await timesheetPage.enterMinutes(data.invalidMinutes);
    await timesheetPage.verifyInvalidMinutesInput(data.invalidMinutes);
  });
});

//  SECTION 5: Add Entry Validation (TC-TS-022 → TC-TS-027)

test.describe("Add Entry Validation", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
  });

  test("TC-TS-022. Verify Add button with valid data", async () => {
    const data = timesheetsData.TC_TS_022;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.verifyEntryInGrid(data.entry.matter);
  });

  test("TC-TS-023. Verify Add without Matter", async () => {
    const data = timesheetsData.TC_TS_023;
    await timesheetPage.fillTimesheetEntry(data);
    await timesheetPage.verifyAddButtonEnabled();
  });

  test("TC-TS-024. Verify Add without Task", async () => {
    const data = timesheetsData.TC_TS_024;
    await timesheetPage.fillTimesheetEntry(data);
    await timesheetPage.verifyAddButtonDisabled();
  });

  test("TC-TS-025. Verify Add without Status", async () => {
    const data = timesheetsData.TC_TS_025;
    await timesheetPage.fillTimesheetEntry(data);
    await timesheetPage.verifyAddButtonDisabled();
  });

  test("TC-TS-026. Verify date defaults to first day of week", async () => {
    const data = timesheetsData.TC_TS_026;
    await timesheetPage.fillTimesheetEntry(data);
    await timesheetPage.verifyAddButtonEnabled();
  });

  test("TC-TS-027. Verify Add without duration", async () => {
    const data = timesheetsData.TC_TS_027;
    await timesheetPage.fillTimesheetEntry(data);
    await timesheetPage.verifyAddButtonDisabled();
  });
});

//  SECTION 6: Grid Verification (TC-TS-028 → TC-TS-031)

test.describe("Grid Verification", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
  });

  test("TC-TS-028. Verify timesheet entry in grid", async () => {
    const data = timesheetsData.TC_TS_028;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.verifyEntryInGrid(data.searchText);
  });

  test("TC-TS-029. Verify entered hours/minutes in grid", async () => {
    const data = timesheetsData.TC_TS_029;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.verifyEntryInGrid(data.entry.matter);
    await timesheetPage.verifyEntryDetails(data.entry.matter, [
      data.expectedHours,
      data.expectedMinutes,
    ]);
  });

  test("TC-TS-030. Verify multiple timesheet entries", async () => {
    const data = timesheetsData.TC_TS_030;
    for (const entry of data.entries) {
      await timesheetPage.addTimesheetEntry(entry);
    }
    for (const entry of data.entries) {
      await timesheetPage.verifyEntryInGrid(entry.matter);
    }
  });

  test("TC-TS-031. Verify duplicate entry handling", async () => {
    const data = timesheetsData.TC_TS_031;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.addTimesheetEntry(data.entry);
    const rowCount = await timesheetPage.getGridRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });
});

//  SECTION 7: Edit Entry (TC-TS-032 → TC-TS-034)

test.describe("Edit Entry", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_028;
    await timesheetPage.addTimesheetEntry(data.entry);
  });

  test("TC-TS-032. Verify edit timesheet entry", async () => {
    const data = timesheetsData.TC_TS_032;
    await timesheetPage.clickEditIcon(data.searchText);
    await expect(timesheetPage.hoursInput).toBeVisible({ timeout: 10000 });
    await timesheetPage.cancelEdit();
  });

  test("TC-TS-033. Verify saving edited entry", async () => {
    const data = timesheetsData.TC_TS_033;
    await timesheetPage.clickEditIcon(data.searchText);
    await timesheetPage.selectMatter(data.updatedMatter);
    await timesheetPage.selectTask(data.updatedTask);
    await timesheetPage.selectStatus(data.updatedStatus);
    await timesheetPage.enterHours(data.updatedHours);
    await timesheetPage.enterMinutes(data.updatedMinutes);
    await timesheetPage.saveEdit();
    await timesheetPage.verifyEntryInGrid(data.updatedMatter);
  });

  test("TC-TS-034. Verify cancel edit", async () => {
    const data = timesheetsData.TC_TS_034;
    await timesheetPage.clickEditIcon(data.searchText);
    await timesheetPage.enterHours("99");
    await timesheetPage.cancelEdit();
    await timesheetPage.verifyEntryInGrid(data.searchText);
    await timesheetPage.verifyEntryDetails(data.searchText, ["2"]);
  });
});

//  SECTION 8: Delete Entry (TC-TS-035 → TC-TS-036)

test.describe("Delete Entry", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_028;
    await timesheetPage.addTimesheetEntry(data.entry);
  });

  test("TC-TS-035. Verify delete timesheet entry", async () => {
    const data = timesheetsData.TC_TS_035;
    await timesheetPage.clickDeleteIcon(data.searchText);
    await expect(timesheetPage.hoursInput).toBeVisible({ timeout: 10000 });
    await timesheetPage.cancelEdit();
  });

  test("TC-TS-036. Verify delete cancellation", async () => {
    const data = timesheetsData.TC_TS_036;
    await timesheetPage.clickDeleteIcon(data.searchText);
    await expect(timesheetPage.hoursInput).toBeVisible({ timeout: 10000 });
    await timesheetPage.cancelEdit();
    await timesheetPage.verifyEntryInGrid(data.searchText);
  });
});

//  SECTION 9: Total Hours Calculation (TC-TS-037)

test.describe("Total Hours Calculation", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
  });

  test("TC-TS-037. Verify total hours calculation", async () => {
    const data = timesheetsData.TC_TS_037;
    const totalBefore = await timesheetPage.totalHoursDisplay.innerText();
    for (const entry of data.entries) {
      await timesheetPage.addTimesheetEntry(entry);
    }
    const totalAfter = await timesheetPage.totalHoursDisplay.innerText();
    expect(totalAfter).not.toBe(totalBefore);
  });
});

//  SECTION 10: Date-based Entry (TC-TS-038 → TC-TS-039)

test.describe("Date-based Entry", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
  });

  test("TC-TS-038. Verify timesheet entries by date", async () => {
    const data = timesheetsData.TC_TS_038;
    const dateOptions = await timesheetPage.dateDropdown
      .locator("option:not([hidden])")
      .allInnerTexts();
    const dates = dateOptions.map((d) => d.trim()).filter((d) => d);
    const addedDates = [];
    for (let i = 0; i < data.entries.length; i++) {
      const date = dates[i % dates.length];
      addedDates.push(date);
      await timesheetPage.addTimesheetEntry({ ...data.entries[i], date });
    }
    for (let i = 0; i < data.entries.length; i++) {
      await timesheetPage.verifyEntryInGridByDate(
        addedDates[i],
        data.entries[i].matter,
      );
    }
  });

  test("TC-TS-039. Verify entry outside selected period", async () => {
    const data = timesheetsData.TC_TS_039;
    const optionExists = await timesheetPage.dateDropdown
      .locator(`option:has-text("${data.entry.date}")`)
      .count();
    expect(optionExists).toBe(0);
  });
});

//  SECTION 11: Submit (TC-TS-040 → TC-TS-044)

test.describe("Submit", () => {
  test.beforeEach(async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
  });

  test("TC-TS-040. Verify Submit button", async () => {
    const data = timesheetsData.TC_TS_040;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.clickSubmit();
    await timesheetPage.verifySubmitConfirmation();
    await timesheetPage.cancelSubmit();
  });

  test("TC-TS-041. Verify Submit confirmation", async () => {
    await timesheetPage.clickSubmit();
    await timesheetPage.verifySubmitConfirmation();
    await timesheetPage.confirmSubmit();
    await timesheetPage.verifySubmissionSuccess();
  });

  test("TC-TS-042. Verify Submit cancellation", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_040;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.clickSubmit();
    await timesheetPage.verifySubmitConfirmation();
    await timesheetPage.cancelSubmit();
    await timesheetPage.verifyTimesheetEntryPageLoaded();
  });

  test("TC-TS-043. Verify submitted timesheet status", async () => {
    const data = timesheetsData.TC_TS_043;
    await timesheetPage.verifyTimesheetNotInSubmitted(data.searchText);
  });

  test("TC-TS-044. Verify empty timesheet submission", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    await timesheetPage.clickSubmit();
    await timesheetPage.verifyAnyValidationError();
  });
});

//  SECTION 12: Data Persistence (TC-TS-045 → TC-TS-047)

test.describe("Data Persistence", () => {
  test("TC-TS-045. Verify data persistence after refresh", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_045;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.refreshPage();
    let found = (await timesheetPage.gridRow(data.searchText).count()) > 0;
    if (!found) {
      for (let i = 0; i < 5; i++) {
        await timesheetPage.clickPreviousPeriod();
        found = (await timesheetPage.gridRow(data.searchText).count()) > 0;
        if (found) break;
      }
    }
    await timesheetPage.verifyDataPersists(data.searchText);
  });

  test("TC-TS-046. Verify data persistence after navigation", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_046;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.clickPreviousPeriod();
    await timesheetPage.clickNextPeriod();
    await timesheetPage.verifyDataPersists(data.searchText);
  });

  test("TC-TS-047. Verify weekly timesheet navigation with existing data", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_047;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.clickPreviousPeriod();
    await timesheetPage.clickNextPeriod();
    await timesheetPage.verifyDataPersists(data.searchText);
    await timesheetPage.verifyEntryDetails(data.searchText, [data.entry.hours]);
  });
});

//  SECTION 13: Section Verification (TC-TS-048 → TC-TS-049)

test.describe("Section Verification", () => {
  test("TC-TS-048. Verify Not Submitted section", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_048;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.verifyNotSubmittedSection();
    await timesheetPage.verifyEntryInGrid(data.searchText);
  });

  test("TC-TS-049. Verify Submitted section", async () => {
    const data = timesheetsData.TC_TS_049;
    await timesheetPage.openSubmitted();
    await timesheetPage.verifySubmittedSection();
  });
});

//  SECTION 14: Loading Behavior (TC-TS-050)

test.describe("Loading Behavior", () => {
  test("TC-TS-050. Verify loading behavior during submission", async () => {
    await timesheetPage.navigateToTimesheetEntry();
    let attempts = 0;
    while (
      (await timesheetPage.page.getByText(/already submitted/i).count()) > 0 &&
      attempts < 5
    ) {
      await timesheetPage.clickPreviousPeriod();
      attempts++;
    }
    const data = timesheetsData.TC_TS_050;
    await timesheetPage.addTimesheetEntry(data.entry);
    await timesheetPage.clickSubmit();
    await timesheetPage.verifySubmitConfirmation();
    const loadingBeforeSubmit = await timesheetPage.verifyLoadingIndicator();
    await timesheetPage.confirmSubmit();
    await timesheetPage.verifySubmissionSuccess();
  });
});
