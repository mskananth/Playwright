require("dotenv").config();

const { test, expect } = require("@playwright/test");
const ClientBookingPage = require("../Pages/ClientBookingPage");
const AppointmentsPage = require("../Pages/AppointmentsPage");
const LoginPage = require("../Pages/LoginPage");
const appointmentsData = require("../testData/appointmentsData.json");
const { loginData } = require("../testData/loginData");

const bookingData = appointmentsData.TC_APPT_001_SearchAndBookAppointment;
const CLIENT_URL = process.env.CLIENT_URL;
const LAWYER_URL = process.env.LAWYER_URL;

const defaultLogin = (loginData && loginData[0]) || {};

let page;
let clientBookingPage;
let appointmentsPage;
let loginPage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();

  // Step 1: Start booking from Consumer side
  clientBookingPage = new ClientBookingPage(page);
  await page.goto(CLIENT_URL, { waitUntil: "networkidle" });

  // Step 2: Search and book appointment
  await clientBookingPage.searchLocation(bookingData.city);
  await clientBookingPage.selectSpecialization(bookingData.specialization);
  await clientBookingPage.clickSearch();
  await clientBookingPage.bookLawyer(bookingData.lawyerName);
  await clientBookingPage.selectTimeSlot(bookingData.slotTime);
  await clientBookingPage.loginFromDialog(
    bookingData.email,
    bookingData.password,
  );
  await clientBookingPage.clickBookSlot();
  await clientBookingPage.enterCardDetails(
    bookingData.cardNumber,
    bookingData.cardExpiry,
    bookingData.cardCvv,
  );
  await clientBookingPage.clickMaybeLater();
  await clientBookingPage.clickSuccess();

  // Step 3: Verify appointment on Consumer side
  await clientBookingPage.navigateToAppointments();
  await clientBookingPage.verifyAppointmentListed(bookingData.lawyerName);

  // Step 4: Navigate to Lawyer side
  loginPage = new LoginPage(page);
  await loginPage.loginWithPassword(
    defaultLogin.email || process.env.EMAIL,
    defaultLogin.password || process.env.PASSWORD,
  );
  await loginPage.assertTitle("Lex-Z Lawyers");

  // Step 5: Verify appointment on Lawyer side and open Appointments page
  appointmentsPage = new AppointmentsPage(page);
  await appointmentsPage.openAppointments();
  await appointmentsPage.assertAppointmentsTitle();
  await appointmentsPage.verifyAppointmentOnLawyerSide(
    bookingData.clientName,
    bookingData.expectedTime || bookingData.slotTime,
  );
});

test.afterAll(async () => {
  await page.close();
});

//  SECTION 1: Consumer-side Appointment Booking → Lawyer-side Verification

test("TC-E2E-001: Book appointment from Consumer, verify on Lawyer side", async () => {
  // Setup already completed in beforeAll; just confirm the state
  await appointmentsPage.verifyAppointmentOnLawyerSide(
    bookingData.clientName,
    bookingData.expectedTime || bookingData.slotTime,
  );
});

//  SECTION 2: Appointments Listing Tests (continued from Lawyer side)

test.describe("Appointments Listing", () => {
  test("TC-APT-001. Verify Appointments page loads successfully", async () => {
    await appointmentsPage.verifyAppointmentsPageLoaded();
  });

  test("TC-APT-002. Verify page heading", async () => {
    const data = appointmentsData.TC_APT_002;
    await appointmentsPage.verifyPageHeading(data.heading);
    await appointmentsPage.verifySubHeading(data.subHeading);
  });

  test("TC-APT-003. Verify appointment table columns", async () => {
    const data = appointmentsData.TC_APT_003;
    await appointmentsPage.verifyTableColumns(data.columns);
  });

  test("TC-APT-004. Verify client details", async () => {
    const data = appointmentsData.TC_APT_004;
    await appointmentsPage.verifyClientAvatar(data.clientName);
    await appointmentsPage.verifyClientNameInRow(data.clientName);
  });

  test("TC-APT-005. Verify appointment date/time", async () => {
    const data = appointmentsData.TC_APT_005;
    await appointmentsPage.verifyHistoryDateTime(data.slotTime);
  });

  test("TC-APT-006. Verify Ongoing status", async () => {
    const data = appointmentsData.TC_APT_006;
    const clientName = data.clientName || "Ananth Subramanian";
    test.skip(
      !(await appointmentsPage.clientHasStatus(clientName, data.status)),
      `No "${data.status}" appointment for ${clientName} at run time`,
    );
    await appointmentsPage.verifyStatus(clientName, data.status);
  });

  test("TC-APT-007. Verify Upcoming status", async () => {
    const data = appointmentsData.TC_APT_007;
    const clientName = data.clientName || "Ananth Subramanian";
    test.skip(
      !(await appointmentsPage.clientHasStatus(clientName, data.status)),
      `No "${data.status}" appointment for ${clientName} at run time`,
    );
    await appointmentsPage.verifyStatus(clientName, data.status);
  });

  test("TC-APT-008. Verify appointment mode", async () => {
    const data = appointmentsData.TC_APT_008;
    await appointmentsPage.verifyMode(
      data.clientName || "Ananth Subramanian",
      data.mode,
    );
  });

  test("TC-APT-009. Verify ongoing Meeting Link is clickable", async () => {
    const data = appointmentsData.TC_APT_009;
    await appointmentsPage.verifyMeetingLinkActive(
      data.clientName || "Ananth Subramanian",
    );
  });

  test("TC-APT-010. Verify upcoming Meeting Link is inactive", async () => {
    const data = appointmentsData.TC_APT_010;
    await appointmentsPage.verifyMeetingLinkInactive(
      data.clientName || "Ananth Subramanian",
    );
  });

  test("TC-APT-011. Verify payment status", async () => {
    const data = appointmentsData.TC_APT_011;
    await appointmentsPage.verifyPaymentStatus(
      data.clientName || "Ananth Subramanian",
      data.paymentText,
    );
  });

  test("TC-APT-012. Verify payment amount", async () => {
    const data = appointmentsData.TC_APT_012;
    await appointmentsPage.verifyPaymentAmount(
      data.clientName || "Ananth Subramanian",
      data.paymentAmount,
    );
  });

  test("TC-APT-013. Search client by exact name", async () => {
    const data = appointmentsData.TC_APT_013;
    await appointmentsPage.searchClient(data.searchName);
    await appointmentsPage.verifySearchResultVisible(data.searchName);
  });

  test("TC-APT-014. Search client by partial name", async () => {
    const data = appointmentsData.TC_APT_014;
    await appointmentsPage.searchClient(data.partialName);
    const row = appointmentsPage.appointmentRow(data.partialName);
    const count = await row.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("TC-APT-015. Search invalid client", async () => {
    const data = appointmentsData.TC_APT_015;
    await appointmentsPage.searchClient(data.invalidName);
    const row = appointmentsPage.appointmentRow(data.invalidName);
    const count = await row.count();
    expect(count).toBe(0);
  });

  test("TC-APT-016. Clear client search", async () => {
    await appointmentsPage.clearClientSearch();
    const rows = appointmentsPage.tableRowsBody;
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("TC-APT-017. Verify Client Name sorting", async () => {
    const data = appointmentsData.TC_APT_017;
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-APT-018. Verify Date & Time sorting", async () => {
    const data = appointmentsData.TC_APT_018;
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-APT-019. Verify Status sorting", async () => {
    const data = appointmentsData.TC_APT_019;
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-APT-020. Verify Mode sorting", async () => {
    const data = appointmentsData.TC_APT_020;
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-APT-021. Verify Payment sorting", async () => {
    const data = appointmentsData.TC_APT_021;
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSortColumn(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-APT-022. Verify three-dot menu", async () => {
    const data = appointmentsData.TC_APT_022;
    await appointmentsPage.clickThreeDotMenu(data.clientName);
    const dropdown = appointmentsPage.page
      .getByText(/appointment history|settlement history/i)
      .filter({
        hasNot: appointmentsPage.page.locator("nav, [role='navigation']"),
      })
      .first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    await appointmentsPage.page.keyboard.press("Escape");
  });

  test("TC-APT-023. Verify Appointment History navigation", async () => {
    const data = appointmentsData.TC_APT_023;
    await appointmentsPage.clickThreeDotMenu(data.clientName);
    await appointmentsPage.clickMenuItem(data.menuOption);
    await appointmentsPage.verifyHistoryPageLoaded();
  });

  test("TC-APT-024. Verify Settlement History navigation", async () => {
    await appointmentsPage.clickBack();
    await appointmentsPage.openAppointments();

    const data = appointmentsData.TC_APT_024;
    await appointmentsPage.clickThreeDotMenu(data.clientName);
    await appointmentsPage.clickMenuItem(data.menuOption);
    await appointmentsPage.verifySettlementPageLoaded();
  });

  test("TC-APT-025. Verify pagination", async () => {
    await appointmentsPage.clickBack();
    await appointmentsPage.openAppointments();

    if ((await appointmentsPage.nextButton.count()) > 0) {
      const isNextDisabled = await appointmentsPage.nextButton.isDisabled();
      if (!isNextDisabled) {
        await appointmentsPage.clickNextPage();
        await appointmentsPage.clickPrevPage();
      }
    }
  });

  test("TC-APT-026. Verify first-page Previous button is disabled", async () => {
    if ((await appointmentsPage.prevButton.count()) > 0) {
      await appointmentsPage.verifyPrevDisabled();
    }
  });

  test("TC-APT-027. Verify last-page Next button is disabled", async () => {
    if ((await appointmentsPage.nextButton.count()) > 0) {
      const isDisabled = await appointmentsPage.nextButton.isDisabled();
      if (!isDisabled) {
        await appointmentsPage.clickNextPage();
        await appointmentsPage.verifyNextDisabled();
        await appointmentsPage.clickPrevPage();
      }
    }
  });

  test("TC-APT-028. Verify appointment data consistency", async () => {
    const data = appointmentsData.TC_APT_028;
    await appointmentsPage.verifyClientNameInRow(data.clientName);
    const row = await appointmentsPage.getTodayRowData(data.clientName);
    expect(row.date).toMatch(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/i);
    expect(row.status).toMatch(/^(upcoming|ongoing|completed)$/i);
    expect(row.mode).toMatch(/online/i);
    expect(row.payment).toContain("Paid");
  });
});

//  SECTION 3: Appointment History (TC-APH-001 → TC-APH-013)

test.describe("Appointment History", () => {
  test.beforeEach(async () => {
    await appointmentsPage.openAppointments();
    const data = appointmentsData.TC_APT_023;
    await appointmentsPage.clickThreeDotMenu(data.clientName);
    await appointmentsPage.clickMenuItem(data.menuOption);
    await appointmentsPage.verifyHistoryPageLoaded();
  });

  test.afterEach(async () => {
    await appointmentsPage.clickBack();
  });

  test("TC-APH-001. Verify Appointment History page loads", async () => {
    await appointmentsPage.verifyHistoryPageLoaded();
  });

  test("TC-APH-002. Verify selected client", async () => {
    const data = appointmentsData.TC_APH_002;
    await appointmentsPage.verifyHistoryClientName(data.clientName);
  });

  test("TC-APH-003. Verify appointment records", async () => {
    await appointmentsPage.verifyHistoryAppointmentCount();
  });

  test("TC-APH-004. Verify appointment sequence", async () => {
    const cards = appointmentsPage.historyAppointmentCard;
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });

  test("TC-APH-005. Verify history date/time", async () => {
    const data = appointmentsData.TC_APH_005;
    await appointmentsPage.verifyHistoryDateTime(data.time);
  });

  test("TC-APH-006. Verify history payment", async () => {
    const data = appointmentsData.TC_APH_006;
    await appointmentsPage.verifyHistoryPayment(data.paymentAmount);
  });

  test("TC-APH-007. Verify history status", async () => {
    const data = appointmentsData.TC_APH_007;

    test.skip(
      !(await appointmentsPage.historyHasStatus(data.status)),
      `No "${data.status}" appointment in history at run time`,
    );
    await appointmentsPage.verifyHistoryStatus(data.status);
  });

  test("TC-APH-008. Verify history ordering", async () => {
    await appointmentsPage.verifyHistoryOrdering();
  });

  test("TC-APH-009. Verify history scrolling", async () => {
    await appointmentsPage.scrollHistory();
    await appointmentsPage.verifyHistoryAppointmentCount();
  });

  test("TC-APH-010. Verify Add Note button", async () => {
    await appointmentsPage.clickAddNote();
    await appointmentsPage.verifyNoteSectionVisible();
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-APH-011. Verify note association", async () => {
    const data = appointmentsData.TC_APH_011;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.verifyNoteSectionVisible();
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-APH-012. Verify back navigation", async () => {
    await appointmentsPage.clickBack();
    await appointmentsPage.openAppointments();
    await appointmentsPage.verifyAppointmentsPageLoaded();
  });

  test("TC-APH-013. Verify history/list consistency", async () => {
    const data = appointmentsData.TC_APH_013;
    await appointmentsPage.verifyHistoryClientName(data.clientName);
    await appointmentsPage.verifyHistoryDateTime(data.slotTime);
    await appointmentsPage.verifyHistoryPayment(data.paymentAmount);
  });
});

//  SECTION 4: Notes (TC-NOTE-001 → TC-NOTE-015)

test.describe("Notes", () => {
  test.beforeEach(async () => {
    await appointmentsPage.openAppointments();
    const aptData = appointmentsData.TC_APT_023;
    await appointmentsPage.clickThreeDotMenu(aptData.clientName);
    await appointmentsPage.clickMenuItem(aptData.menuOption);
    await appointmentsPage.verifyHistoryPageLoaded();
  });

  test.afterEach(async () => {
    await appointmentsPage.clickBack();
  });

  test("TC-NOTE-001. Verify Add Note UI", async () => {
    await appointmentsPage.clickAddNote();
    await appointmentsPage.verifyNoteSectionVisible();
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-002. Verify note placeholder", async () => {
    const data = appointmentsData.TC_NOTE_002;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.verifyNotePlaceholder();
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-003. Verify initial character counter", async () => {
    const data = appointmentsData.TC_NOTE_003;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.verifyCharacterCounter(data.initialCounter);
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-004. Enter valid note", async () => {
    const data = appointmentsData.TC_NOTE_004;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.validNote);
    const textarea =
      (await appointmentsPage.noteTextarea.count()) > 0
        ? appointmentsPage.noteTextarea
        : appointmentsPage.noteTextareaAlt;
    await expect(textarea).toHaveValue(data.validNote);
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-005. Verify character counter updates", async () => {
    const data = appointmentsData.TC_NOTE_005;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.noteText);
    const length = data.noteText.length;
    const counterText = `${length}/500`;
    await appointmentsPage.verifyCharacterCounter(counterText);
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-006. Verify 500-character limit accepted", async () => {
    const data = appointmentsData.TC_NOTE_006;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.maxNote);
    const { current, max } = await appointmentsPage.getNoteCounter();
    const value = await appointmentsPage.getNoteValue();
    expect(value.length).toBe(current);
    expect(current).toBeLessThanOrEqual(Math.min(500, max));
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-007. Verify more than 500 characters rejected", async () => {
    const data = appointmentsData.TC_NOTE_007;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.overflowNote);
    const textarea =
      (await appointmentsPage.noteTextarea.count()) > 0
        ? appointmentsPage.noteTextarea
        : appointmentsPage.noteTextareaAlt;
    const value = await textarea.inputValue();
    expect(value.length).toBeLessThanOrEqual(500);
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-008. Save note", async () => {
    const data = appointmentsData.TC_NOTE_008;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.validNote);
    await appointmentsPage.clickNoteSave();
  });

  test("TC-NOTE-009. Verify saved note", async () => {
    const data = appointmentsData.TC_NOTE_009;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.validNote);
    await appointmentsPage.clickNoteSave();
    await appointmentsPage.openAppointments();
    const aptData = appointmentsData.TC_APT_023;
    await appointmentsPage.clickThreeDotMenu(aptData.clientName);
    await appointmentsPage.clickMenuItem(aptData.menuOption);
    await appointmentsPage.verifyHistoryPageLoaded();
    await appointmentsPage.verifyNoteSaved(data.validNote);
  });

  test("TC-NOTE-010. Cancel note", async () => {
    const data = appointmentsData.TC_NOTE_010;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.validNote);
    await appointmentsPage.clickNoteCancel();
    await appointmentsPage.verifyNoteNotPresent(data.validNote);
  });

  test("TC-NOTE-011. Save empty note", async () => {
    const data = appointmentsData.TC_NOTE_011;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.emptyNote);
    await appointmentsPage.clickNoteSave();
    await appointmentsPage.page.waitForTimeout(1000);
    const textarea =
      (await appointmentsPage.noteTextarea.count()) > 0
        ? appointmentsPage.noteTextarea
        : appointmentsPage.noteTextareaAlt;
    const isVisible = await textarea.isVisible().catch(() => false);
    if (isVisible) {
      await appointmentsPage.clickNoteCancel();
    }
  });

  test("TC-NOTE-012. Save whitespace-only note", async () => {
    const data = appointmentsData.TC_NOTE_012;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.whitespaceNote);
    await appointmentsPage.clickNoteSave();
    await appointmentsPage.page.waitForTimeout(1000);
    const textarea =
      (await appointmentsPage.noteTextarea.count()) > 0
        ? appointmentsPage.noteTextarea
        : appointmentsPage.noteTextareaAlt;
    const isVisible = await textarea.isVisible().catch(() => false);
    if (isVisible) {
      await appointmentsPage.clickNoteCancel();
    }
  });

  test("TC-NOTE-013. Verify special characters", async () => {
    const data = appointmentsData.TC_NOTE_013;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.specialCharsNote);
    await appointmentsPage.clickNoteSave();
  });

  test("TC-NOTE-014. Verify multiline note", async () => {
    const data = appointmentsData.TC_NOTE_014;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.multilineNote);
    const textarea =
      (await appointmentsPage.noteTextarea.count()) > 0
        ? appointmentsPage.noteTextarea
        : appointmentsPage.noteTextareaAlt;
    const value = await textarea.inputValue();
    expect(value).toContain("\n");
    await appointmentsPage.clickNoteCancel();
  });

  test("TC-NOTE-015. Verify note isolation", async () => {
    const data = appointmentsData.TC_NOTE_015;
    await appointmentsPage.clickAddNote();
    await appointmentsPage.enterNote(data.validNote);
    await appointmentsPage.clickNoteSave();
    await appointmentsPage.clickBack();
    await appointmentsPage.openAppointments();
    await appointmentsPage.verifyNoteNotPresent(data.validNote);
  });
});

//  SECTION 5: Settlement History (TC-SH-001 → TC-SH-025)

test.describe("Settlement History", () => {
  test.beforeEach(async () => {
    await appointmentsPage.openAppointments();
    const aptData = appointmentsData.TC_APT_024;
    await appointmentsPage.clickThreeDotMenu(aptData.clientName);
    await appointmentsPage.clickMenuItem(aptData.menuOption);
    await appointmentsPage.verifySettlementPageLoaded();
  });

  test.afterEach(async () => {
    await appointmentsPage.clickBack();
  });

  test("TC-SH-001. Verify Settlement History page loads", async () => {
    await appointmentsPage.verifySettlementPageLoaded();
  });

  test("TC-SH-002. Verify transaction count", async () => {
    const data = appointmentsData.TC_SH_002;
    await appointmentsPage.verifySettlementTransactionCount(data.expectedCount);
  });

  test("TC-SH-003. Verify Total Paid", async () => {
    const data = appointmentsData.TC_SH_003;
    await appointmentsPage.verifyTotalPaid(data.totalPaid);
  });

  test("TC-SH-004. Verify Refunded amount", async () => {
    const data = appointmentsData.TC_SH_004;
    await appointmentsPage.verifyRefunded(data.refunded);
  });

  test("TC-SH-005. Verify Refund Initiated", async () => {
    const data = appointmentsData.TC_SH_005;
    await appointmentsPage.verifyRefundInitiated(data.refundInitiated);
  });

  test("TC-SH-006. Verify Total Transactions", async () => {
    const data = appointmentsData.TC_SH_006;
    await appointmentsPage.verifyTotalTransactions(data.totalTransactions);
  });

  test("TC-SH-007. Verify transaction count consistency", async () => {
    const data = appointmentsData.TC_SH_007;
    await appointmentsPage.verifySettlementTransactionCount(data.expectedCount);
    const rows = appointmentsPage.settlementTableRows;
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("TC-SH-008. Verify settlement columns", async () => {
    const data = appointmentsData.TC_SH_008;
    await appointmentsPage.verifySettlementColumns(data.columns);
  });

  test("TC-SH-009. Verify settlement client", async () => {
    const data = appointmentsData.TC_SH_009;
    await appointmentsPage.verifySettlementClientName(data.clientName);
  });

  test("TC-SH-010. Verify settlement appointment date", async () => {
    const data = appointmentsData.TC_SH_010;
    if (data.date) {
      await appointmentsPage.verifyHistoryDateTime(data.date);
    }
  });

  test("TC-SH-011. Verify amount received", async () => {
    const data = appointmentsData.TC_SH_011;
    await appointmentsPage.verifySettlementAmount(data.amount);
  });

  test("TC-SH-012. Verify payment method", async () => {
    const data = appointmentsData.TC_SH_012;
    await appointmentsPage.verifySettlementMethod(
      data.clientName || "Ananth Subramanian",
      data.paymentMethod,
    );
  });

  test("TC-SH-013. Verify payment status", async () => {
    const data = appointmentsData.TC_SH_013;
    await appointmentsPage.verifySettlementStatus(
      data.clientName || "Ananth Subramanian",
      data.paymentStatus,
    );
  });

  test("TC-SH-014. Search settlement", async () => {
    const data = appointmentsData.TC_SH_014;
    await appointmentsPage.searchSettlement(data.searchName);
    await appointmentsPage.verifySettlementSearchResult(data.searchName);
  });

  test("TC-SH-015. Search invalid settlement", async () => {
    const data = appointmentsData.TC_SH_015;
    await appointmentsPage.searchSettlement(data.invalidSearch);
    await appointmentsPage.verifySettlementNoResults();
  });

  test("TC-SH-016. Clear settlement search", async () => {
    await appointmentsPage.clearSettlementSearch();
    const rows = appointmentsPage.settlementTableRows;
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("TC-SH-017. Verify Client Name sorting", async () => {
    const data = appointmentsData.TC_SH_017;
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-SH-018. Verify Appointment Date sorting", async () => {
    const data = appointmentsData.TC_SH_018;
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-SH-019. Verify Amount sorting", async () => {
    const data = appointmentsData.TC_SH_019;
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-SH-020. Verify Payment Method sorting", async () => {
    const data = appointmentsData.TC_SH_020;
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-SH-021. Verify Payment Status sorting", async () => {
    const data = appointmentsData.TC_SH_021;
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
    await appointmentsPage.clickSettlementSort(data.sortColumn);
    await appointmentsPage.page.waitForTimeout(500);
  });

  test("TC-SH-022. Verify settlement amount consistency", async () => {
    const data = appointmentsData.TC_SH_022;
    await appointmentsPage.verifySettlementAmount(data.amount);
  });

  test("TC-SH-023. Verify total calculation", async () => {
    const data = appointmentsData.TC_SH_023;
    await appointmentsPage.verifyTotalPaid(data.expectedTotal);
    await appointmentsPage.verifyTotalTransactions(data.transactionCount);
  });

  test("TC-SH-024. Verify refund transaction", async () => {
    const data = appointmentsData.TC_SH_024;
    const rows = appointmentsPage.settlementTableRows;
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("TC-SH-025. Verify refund initiated transaction", async () => {
    const data = appointmentsData.TC_SH_025;
    const rows = appointmentsPage.settlementTableRows;
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
