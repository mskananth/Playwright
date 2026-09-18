require("dotenv").config();

const { test, expect } = require("@playwright/test");
const MeetingPage = require("../Pages/MeetingsPage");
const LoginModule = require("../Pages/LoginPage");
const meetingsData = require("../testData/meetingsData.json");
const { loginData } = require("../testData/loginData");

const defaultLogin = (loginData && loginData[0]) || {};
const BASE_URL = process.env.CLIENT_URL;

let page;
let meetingPage;

// ── Shared state across tests ─────────────────────────────────────
const sharedState = {
  createdEventText: null,
  eventDateSelection: null,
};

async function ensureLoggedIn(browser) {
  if (!page || page.isClosed()) {
    page = await browser.newPage();
    const loginPage = new LoginModule(page);
    await loginPage.loginWithPassword(
      defaultLogin.email || process.env.EMAIL,
      defaultLogin.password || process.env.PASSWORD,
    );
    await loginPage.assertTitle("Lex-Z Lawyers");
    meetingPage = new MeetingPage(page);
  }
  await meetingPage.goToMeeting();
}

test.beforeAll(async ({ browser }) => {
  await ensureLoggedIn(browser);
});

test.afterAll(async () => {
  if (page && !page.isClosed()) await page.close();
});

//  SECTION 1: Module Navigation & Calendar View (TC-MTG-001 → 003)

test.describe("Module Navigation & Calendar View", () => {
  test("TC-MTG-001. Verify Meetings module navigation", async () => {
    await meetingPage.verifyMeetingsPageLoaded();
  });

  test("TC-MTG-002. Verify Meetings calendar/list view", async () => {
    await meetingPage.verifyCalendarEventsVisible();
  });

  test("TC-MTG-003. Verify Create Event button opens form", async () => {
    await meetingPage.createButtonClick();
    await meetingPage.verifyCreateMeetingPageLoaded();
  });
});

//  SECTION 2: Event Type & Matter Selection (TC-MTG-004 → 006)

test.describe("Event Type & Matter Selection", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-004. Verify Event Type dropdown selection", async () => {
    const data = meetingsData.TC_MTG_004;
    await meetingPage.verifyEventTypeDropdownVisible();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.verifyEventTypeSelected(data.eventType);
  });

  test("TC-MTG-005. Verify Legal Matter shows matter fields", async () => {
    const data = meetingsData.TC_MTG_005;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.verifyMatterFieldsVisible();
  });

  test("TC-MTG-006. Verify Matter Name selection", async () => {
    const data = meetingsData.TC_MTG_006;
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.verifyMatterNameVisible();
    await meetingPage.selectMatterName(data.matterName);
  });
});

//  SECTION 3: Subject/Task & Time Zone (TC-MTG-007 → 009)

test.describe("Subject/Task & Time Zone", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName(data.matterName);
  });

  test("TC-MTG-007. Verify Subject/Task dropdown options", async () => {
    const data = meetingsData.TC_MTG_007;
    await meetingPage.verifySubjectTaskVisible();
    await meetingPage.verifySubjectTaskOptions(data.expectedOptions);
  });

  test("TC-MTG-008. Verify Subject/Task selection", async () => {
    const data = meetingsData.TC_MTG_008;
    await meetingPage.selectSubjectTask(data.subjectTask);
  });

  test("TC-MTG-009. Verify Time Zone selection", async () => {
    const data = meetingsData.TC_MTG_009;
    await meetingPage.verifyTimeZoneVisible();
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.verifyTimeZoneSelected(data.timeZone);
  });
});

//  SECTION 4: Add to Timesheet (TC-MTG-010)

test.describe("Add to Timesheet", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Matter with All Clients");
  });

  test("TC-MTG-010. Verify Add to Timesheet checkbox", async () => {
    await meetingPage.verifyAddToTimesheetVisible();
    await meetingPage.enableAddToTimesheet();
    expect(await meetingPage.isAddToTimesheetChecked()).toBeTruthy();
  });
});

//  SECTION 5: Date, Time & Repetition (TC-MTG-011 → 016)

test.describe("Date, Time & Repetition", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Matter with All Clients");
  });

  test("TC-MTG-011. Verify meeting date selection", async () => {
    const data = meetingsData.TC_MTG_011;
    await meetingPage.verifyDateFieldVisible();
    await meetingPage.selectDate(data.dateSelection);
  });

  test("TC-MTG-012. Verify meeting time selection", async () => {
    const data = meetingsData.TC_MTG_012;
    await meetingPage.verifyTimeFieldsVisible();
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
  });

  test("TC-MTG-013. Verify Repetition dropdown options", async () => {
    await meetingPage.verifyRepetitionVisible();
  });

  test("TC-MTG-014. Verify repetition selection", async () => {
    const data = meetingsData.TC_MTG_014;
    await meetingPage.selectRepetition(data.repetition);
  });

  test("TC-MTG-015. Verify All Day toggle hides time fields", async () => {
    await meetingPage.verifyAllDayVisible();
    await meetingPage.enableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeTruthy();
    await meetingPage.verifyTimeFieldsHidden();
  });

  test("TC-MTG-016. Verify All Day unchecked shows time fields", async () => {
    await meetingPage.disableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeFalsy();
    await meetingPage.verifyTimeFieldsVisible();
  });
});

//  SECTION 6: Notification (TC-MTG-017 → 020)

test.describe("Notification", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-017. Verify Notify Me value entry", async () => {
    const data = meetingsData.TC_MTG_017;
    await meetingPage.verifyAddNotificationVisible();
    await meetingPage.enterNotification(data.notificationValue);
  });

  test("TC-MTG-018. Verify notification unit dropdown", async () => {
    await meetingPage.verifyAddNotificationVisible();
  });

  test("TC-MTG-019. Verify Add Notification", async () => {
    const data = meetingsData.TC_MTG_019;
    await meetingPage.enterNotification(data.notificationValue);
    await meetingPage.addNotification();
  });

  test("TC-MTG-020. Verify Delete Notification", async () => {
    await meetingPage.enterNotification(15);
    await meetingPage.addNotification();
    const countBefore = await meetingPage.getNotificationCount();
    await meetingPage.deleteNotification();
    const countAfter = await meetingPage.getNotificationCount();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

//  SECTION 7: Meeting Details (TC-MTG-021 → 024)

test.describe("Meeting Details", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.scrollToMeetingDetails();
  });

  test("TC-MTG-021. Verify Meeting Link field", async () => {
    await meetingPage.verifyMeetingLinkVisible();
  });

  test("TC-MTG-022. Verify Dial-In Number entry", async () => {
    const data = meetingsData.TC_MTG_022;
    await meetingPage.verifyDialInNumberVisible();
    await meetingPage.enterDialInNumber(data.dialInNumber);
    const value = await meetingPage.getDialInNumberValue();
    expect(value).toContain("234");
  });

  test("TC-MTG-023. Verify Location entry", async () => {
    const data = meetingsData.TC_MTG_023;
    await meetingPage.verifyLocationVisible();
    await meetingPage.enterLocation(data.location);
    const value = await meetingPage.getLocationValue();
    expect(value).toBe(data.location);
  });

  test("TC-MTG-024. Verify Meeting Agenda entry", async () => {
    const data = meetingsData.TC_MTG_024;
    await meetingPage.verifyMeetingAgendaVisible();
    await meetingPage.enterMeetingAgenda(data.agenda);
    const value = await meetingPage.getMeetingAgendaValue();
    expect(value).toBe(data.agenda);
  });
});

//  SECTION 8: Attendees - Individual (TC-MTG-031)

test.describe("Attendees - Individual", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-031. Verify Add Individual from single dropdown/search and click ADD", async () => {
    const data = meetingsData.TC_MTG_031;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.addIndividual(data.individualName);
    await meetingPage.verifyConsumerAdded(data.individualName);
  });
});

//  SECTION 9: Attendees - Clients (TC-MTG-025 → 029)

test.describe("Attendees - Clients", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-025. Verify Add Client category dropdown visible", async () => {
    await meetingPage.scrollToAttendees();
    await meetingPage.verifyClientSectionVisible();
  });

  test("TC-MTG-026. Verify client child dropdown/search visible for selection", async () => {
    const data = meetingsData.TC_MTG_027;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.verifyClientSectionVisible();
  });

  test("TC-MTG-027. Verify client search - select category, select child client, and click ADD", async () => {
    const data = meetingsData.TC_MTG_027;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
  });

  test("TC-MTG-028. Verify adding a single client via two-step selection", async () => {
    const data = meetingsData.TC_MTG_028;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    const count = await meetingPage.getClientCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("TC-MTG-029. Verify adding multiple clients via two-step selection", async () => {
    const data = meetingsData.TC_MTG_029;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    for (const client of data.clients) {
      await meetingPage.addClient(client);
    }
    for (const client of data.clients) {
      await meetingPage.verifyClientAdded(client);
    }
    const count = await meetingPage.getClientCount();
    expect(count).toBeGreaterThanOrEqual(data.clients.length);
  });
});

//  SECTION 10: Attendees - Corporate (TC-MTG-030)

test.describe("Attendees - Corporate", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-030. Verify Add Corporate - select category, select corporate, and click ADD", async () => {
    const data = meetingsData.TC_MTG_030;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    for (const corporate of data.corporates) {
      await meetingPage.addCorporate(corporate);
    }
    for (const corporate of data.corporates) {
      await meetingPage.verifyCorporateAdded(corporate);
    }
    const count = await meetingPage.getCorporateCount();
    expect(count).toBeGreaterThanOrEqual(data.corporates.length);
  });
});

//  SECTION 11: Document Attachment (TC-MTG-032 → 034)

test.describe("Document Attachment", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-032. Verify Document search field visible after matter, mandatory fields and entity/client selection", async () => {
    const data = meetingsData.TC_MTG_032;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToAttendees();
    await meetingPage.verifyDocumentSectionVisible();
  });

  test("TC-MTG-033. Verify document selection from dropdown after matter, mandatory fields and entity/client selection", async () => {
    const data = meetingsData.TC_MTG_033;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToAttendees();
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
  });

  test("TC-MTG-034. Verify matter-related documents appear after matter, mandatory fields and entity/client selection", async () => {
    const data = meetingsData.TC_MTG_034;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToAttendees();
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
    const count = await meetingPage.getDocumentCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

//  SECTION 11: Multiple Attendee Types (TC-MTG-035)

test.describe("Multiple Attendee Types", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.scrollToAttendees();
  });

  test("TC-MTG-035. Verify multiple attendee types", async () => {
    const data = meetingsData.TC_MTG_035;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.addIndividual(data.individualName);
    await meetingPage.verifyConsumerAdded(data.individualName);
    await meetingPage.verifyClientAdded(data.clientName);
  });
});

//  SECTION 12: Save, Confirmation & Calendar (TC-MTG-036 → 041)

test.describe("Save, Confirmation & Calendar Verification", () => {
  test("TC-MTG-036. Verify Save Meeting with mandatory fields", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_036;
    await meetingPage.createButtonClick();

    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();

    sharedState.eventDateSelection = data.meetingData.dateSelection;
    sharedState.createdEventText = `${data.meetingData.startTime} - Matter with All Clients - ${data.meetingData.subjectTask}`;
  });

  test("TC-MTG-037. Verify save confirmation toast", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_036;
    await meetingPage.createButtonClick();

    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-038. Verify created meeting in calendar", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_038;
    await meetingPage.verifyCreatedEvent(
      data.dateSelection,
      data.matter,
      data.subjectTask,
      data.startTime,
    );
  });

  test("TC-MTG-039. Verify created meeting details on click", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const eventText = sharedState.createdEventText;
    if (eventText) {
      await meetingPage.clickCalendarEvent(eventText);
    }
  });

  test("TC-MTG-040. Verify attendee details after save", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_036;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
  });

  test("TC-MTG-041. Verify attached document after save", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_036;
    const docData = meetingsData.TC_MTG_041;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.attachDocument(docData.documentName);
    await meetingPage.verifyDocumentAdded(docData.documentName);
  });
});

//  SECTION 13: Document View & Preview (TC-MTG-042 → 043)

test.describe("Document View & Preview", () => {
  test("TC-MTG-042. Verify document View action", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_036;
    const docData = meetingsData.TC_MTG_041;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.attachDocument(docData.documentName);
    await meetingPage.verifyDocumentAdded(docData.documentName);
  });

  test("TC-MTG-043. Verify document preview", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_036;
    const docData = meetingsData.TC_MTG_041;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.attachDocument(docData.documentName);
    await meetingPage.verifyDocumentAdded(docData.documentName);
  });
});

//  SECTION 14: Data Persistence & Cancel (TC-MTG-044 → 045)

test.describe("Data Persistence & Cancel", () => {
  test("TC-MTG-044. Verify meeting data persistence", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_036;
    await meetingPage.createButtonClick();

    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.scrollToMeetingDetails();
    await meetingPage.enterLocation("Persistence Test Location");

    const locationValue = await meetingPage.getLocationValue();
    expect(locationValue).toBe("Persistence Test Location");

    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
  });

  test("TC-MTG-045. Verify Cancel action closes form without saving", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();

    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.scrollToMeetingDetails();
    await meetingPage.enterLocation("Cancel Test - Should Not Save");

    await meetingPage.clickCancel();
    await meetingPage.verifyMeetingsPageLoaded();
  });
});

//  SECTION 15: Positive End-to-End Flows (PF-MTG-001 → 015)

test.describe("Positive End-to-End Flows", () => {
  test("PF-MTG-001. Legal Matter → Matter with All Clients", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_001;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
  });

  test("PF-MTG-002. Subject/Task → Time Zone → Date and Time", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_002;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Matter with All Clients");
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
  });

  test("PF-MTG-003. Enable Add to Timesheet → Save Event", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Matter with All Clients");
    await meetingPage.enableAddToTimesheet();
    expect(await meetingPage.isAddToTimesheetChecked()).toBeTruthy();
  });

  test("PF-MTG-004. Set Notify Me → Select unit → Add Notification", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_004;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Matter with All Clients");
    await meetingPage.enterNotification(data.notificationValue);
    await meetingPage.addNotification();
  });

  test("PF-MTG-005. All Day toggle hides/reshows time fields", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Matter with All Clients");
    await meetingPage.enableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeTruthy();
    await meetingPage.disableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeFalsy();
    await meetingPage.verifyTimeFieldsVisible();
  });

  test("PF-MTG-006. Add Daran Superuser as client", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_006;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
  });

  test("PF-MTG-007. Add Apollo Healthcare + Neela + Benjamin", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    const data = meetingsData.PF_MTG_007;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    for (const client of data.clients) {
      await meetingPage.addClient(client);
    }
    for (const client of data.clients) {
      await meetingPage.verifyClientAdded(client);
    }
  });

  test("PF-MTG-008. Add Karal Marks as Individual", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_008;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.addIndividual(data.individualName);
    await meetingPage.verifyConsumerAdded(data.individualName);
  });

  test("PF-MTG-009. Search → Select CSV → ATTACH document", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_009;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
  });

  test("PF-MTG-010. Complete flow → Save Event", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_010;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity("Daran Cough Exports");
    await meetingPage.addClient("Daran Superuser");
    await meetingPage.selectEntity("Apollo Healthcare");
    await meetingPage.addClient("Neela");
    await meetingPage.addClient("Benjamin");
    await meetingPage.addIndividual(data.individualName);
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("PF-MTG-011. Save → Verify calendar appearance", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_011;
    await meetingPage.verifyCreatedEvent(
      data.dateSelection,
      data.matter,
      data.subjectTask,
      data.startTime,
    );
  });

  test("PF-MTG-012. Open created meeting → Verify details", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_012;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.clickCalendarEvent(eventText);
    await expect(
      meetingPage.page.getByRole("heading", {
        name: data.meetingData.subjectTask,
      }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("PF-MTG-013. Open attached document → View preview", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_009;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
  });

  test("PF-MTG-014. Create meeting with Clients + Individual + Document", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_014;
    await meetingPage.createButtonClick();

    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();

    await meetingPage.addIndividual(data.individualName);
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.attachDocument(data.documentName);

    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("PF-MTG-015. Create another meeting with different Subject/Task and time", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_015;
    await meetingPage.createButtonClick();

    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);

    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });
});

//  SECTION 21: Edit Meeting - Date & Time (TC-MTG-EDIT-001 → 008)

test.describe("Edit Meeting - Date & Time", () => {
  test("TC-MTG-EDIT-001. Verify Edit option for a created meeting", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_001;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    // Check if we're on edit page, if not try navigating via URL
    const currentUrl = meetingPage.page.url();
    if (!currentUrl.includes("edit")) {
      // Maybe clicking the event opened a detail view, try to find edit from there
      const editIcon = meetingPage.page
        .locator("[class*='edit'], [title*='Edit'], [aria-label*='Edit']")
        .first();
      if ((await editIcon.count()) > 0 && (await editIcon.isVisible())) {
        await editIcon.click();
        await meetingPage.page.waitForTimeout(2000);
      }
    }

    await meetingPage.verifyEditPageLoaded();
  });

  test("TC-MTG-EDIT-002. Verify existing meeting details on edit", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_002;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.verifyEditPageLoaded();

    await meetingPage.verifySubjectTaskVisible();
    await meetingPage.verifyTimeZoneVisible();
    await meetingPage.verifyDateFieldVisible();
    await meetingPage.verifyTimeFieldsVisible();
    await meetingPage.verifyClientSectionVisible();
  });

  test("TC-MTG-EDIT-003. Edit meeting date", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_003;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.selectDate(data.newDateSelection);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-004. Edit meeting start time", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_004;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.selectStartTime(data.newStartTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-005. Edit meeting end time", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_005;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.selectEndTime(data.newEndTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-006. Edit both date and time", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_006;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.selectDate(data.newDateSelection);
    await meetingPage.selectStartTime(data.newStartTime);
    await meetingPage.selectEndTime(data.newEndTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-007. Verify modified date and time in calendar", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_007;
    await meetingPage.verifyCreatedEvent(
      data.dateSelection,
      data.matter,
      data.subjectTask,
      data.startTime,
    );
  });

  test("TC-MTG-EDIT-008. Verify old date/time is cleared after edit", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_008;
    await meetingPage.verifyEventNotOnDate(
      data.oldDateSelection,
      data.matter,
      data.subjectTask,
      data.startTime,
    );
  });
});

//  SECTION 22: Edit Meeting - Client Modification (TC-MTG-EDIT-009 → 013)

test.describe("Edit Meeting - Client Modification", () => {
  test("TC-MTG-EDIT-009. Add a new client to an existing meeting", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_009;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.existingClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.newClient);
    await meetingPage.verifyClientAdded(data.newClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-010. Remove an existing client", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_010;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientToRemove);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.removeClient(data.clientToRemove);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-011. Replace an existing client", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_011;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.existingClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.removeClient(data.existingClient);
    await meetingPage.addClient(data.newClient);
    await meetingPage.verifyClientAdded(data.newClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-012. Add multiple clients", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_012;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.existingClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    for (const client of data.newClients) {
      await meetingPage.addClient(client);
    }
    for (const client of data.newClients) {
      await meetingPage.verifyClientAdded(client);
    }
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-EDIT-013. Verify client details after saving", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_013;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.existingClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();

    await meetingPage.removeClient(data.existingClient);
    await meetingPage.addClient(data.newClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.verifyClientAdded(data.newClient);
  });
});

//  SECTION 23: Edit Meeting - Combined E2E (TC-MTG-EDIT-014)

test.describe("Edit Meeting - Combined End-to-End", () => {
  test("TC-MTG-EDIT-014. Edit meeting date, time, and clients", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_014;

    // Step 1: Create a new meeting with one or more clients
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.existingClient);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    // Step 2: Open the created meeting from the calendar
    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);

    // Step 3: Click the Edit icon
    await meetingPage.clickEditButton();
    await meetingPage.verifyEditPageLoaded();

    // Step 4: Change the meeting date
    await meetingPage.selectDate(data.newDateSelection);

    // Step 5: Change the start and end time
    await meetingPage.selectStartTime(data.newStartTime);
    await meetingPage.selectEndTime(data.newEndTime);

    // Step 6: Add/remove clients
    await meetingPage.removeClient(data.existingClient);
    await meetingPage.addClient(data.newClient);
    await meetingPage.verifyClientAdded(data.newClient);

    // Step 7: Click Save/Update
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    // Step 8: Reopen the meeting and verify changes
    await meetingPage.navigateToEventDate(data.newDateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.verifyClientAdded(data.newClient);
  });
});

//  SECTION 24: Delete Meeting (TC-MTG-DEL-001 → 003)

test.describe("Delete Meeting", () => {
  test("TC-MTG-DEL-001. Verify Delete option for a created meeting", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_DEL_001;

    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);

    const deleteBtn = meetingPage.page.locator(
      "button[title='Delete'], button[mattooltip='Delete']",
    );
    const fallbackBtn = meetingPage.page
      .locator("app-viewevent")
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
    expect(hasDeleteBtn).toBeTruthy();
  });

  test("TC-MTG-DEL-002. Delete a meeting and verify removal from calendar", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_DEL_002;

    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    await meetingPage.verifyCreatedEvent(
      data.meetingData.dateSelection,
      data.meetingData.matterName,
      data.meetingData.subjectTask,
      data.meetingData.startTime,
    );

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickDeleteButton();
    await meetingPage.confirmDelete();
    await meetingPage.verifyEventSavedSuccessfully();

    await meetingPage.verifyEventNotOnDate(
      data.meetingData.dateSelection,
      data.meetingData.matterName,
      data.meetingData.subjectTask,
      data.meetingData.startTime,
    );
  });

  test("TC-MTG-DEL-003. Cancel delete action keeps meeting intact", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_DEL_003;

    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.meetingData.startTime} - Matter With All Clients - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickDeleteButton();
    await meetingPage.cancelDelete();

    await meetingPage.verifyCreatedEvent(
      data.meetingData.dateSelection,
      data.meetingData.matterName,
      data.meetingData.subjectTask,
      data.meetingData.startTime,
    );
  });
});

// ══════════════════════════════════════════════════════════════════
//  CORPORATE CLIENT TEST CASES
// ══════════════════════════════════════════════════════════════════

//  SECTION 25: Corporate Module Navigation & Calendar View (TC-MTG-CORP-001 → 003)

test.describe("Corporate Module Navigation & Calendar View", () => {
  test("TC-MTG-CORP-001. Verify Meetings module navigation for corporate", async () => {
    await meetingPage.verifyMeetingsPageLoaded();
  });

  test("TC-MTG-CORP-002. Verify Meetings calendar/list view for corporate", async () => {
    await meetingPage.verifyCalendarEventsVisible();
  });

  test("TC-MTG-CORP-003. Verify Create Event button opens form for corporate", async () => {
    await meetingPage.createButtonClick();
    await meetingPage.verifyCreateMeetingPageLoaded();
  });
});

//  SECTION 26: Corporate Event Type & Matter Selection (TC-MTG-CORP-004 → 006)

test.describe("Corporate Event Type & Matter Selection", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-CORP-004. Verify Event Type dropdown selection for corporate", async () => {
    const data = meetingsData.TC_MTG_004;
    await meetingPage.verifyEventTypeDropdownVisible();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.verifyEventTypeSelected(data.eventType);
  });

  test("TC-MTG-CORP-005. Verify Legal Matter shows matter fields for corporate", async () => {
    const data = meetingsData.TC_MTG_005;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.verifyMatterFieldsVisible();
  });

  test("TC-MTG-CORP-006. Verify Matter Name selection for corporate", async () => {
    const data = meetingsData.TC_MTG_CORP_006;
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.verifyMatterNameVisible();
    await meetingPage.selectMatterName(data.matterName);
  });
});

//  SECTION 27: Corporate Subject/Task & Time Zone (TC-MTG-CORP-007 → 009)

test.describe("Corporate Subject/Task & Time Zone", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Lagal Matter With DGC");
  });

  test("TC-MTG-CORP-007. Verify Subject/Task dropdown options for corporate", async () => {
    const data = meetingsData.TC_MTG_007;
    await meetingPage.verifySubjectTaskVisible();
    await meetingPage.verifySubjectTaskOptions(data.expectedOptions);
  });

  test("TC-MTG-CORP-008. Verify Subject/Task selection for corporate", async () => {
    const data = meetingsData.TC_MTG_CORP_008;
    await meetingPage.selectSubjectTask(data.subjectTask);
  });

  test("TC-MTG-CORP-009. Verify Time Zone selection for corporate", async () => {
    const data = meetingsData.TC_MTG_009;
    await meetingPage.verifyTimeZoneVisible();
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.verifyTimeZoneSelected(data.timeZone);
  });
});

//  SECTION 28: Corporate Add to Timesheet (TC-MTG-CORP-010)

test.describe("Corporate Add to Timesheet", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Lagal Matter With DGC");
  });

  test("TC-MTG-CORP-010. Verify Add to Timesheet checkbox for corporate", async () => {
    await meetingPage.verifyAddToTimesheetVisible();
    await meetingPage.enableAddToTimesheet();
    expect(await meetingPage.isAddToTimesheetChecked()).toBeTruthy();
  });
});

//  SECTION 29: Corporate Date, Time & Repetition (TC-MTG-CORP-011 → 016)

test.describe("Corporate Date, Time & Repetition", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.selectMatterName("Lagal Matter With DGC");
  });

  test("TC-MTG-CORP-011. Verify meeting date selection for corporate", async () => {
    const data = meetingsData.TC_MTG_011;
    await meetingPage.verifyDateFieldVisible();
    await meetingPage.selectDate(data.dateSelection);
  });

  test("TC-MTG-CORP-012. Verify meeting time selection for corporate", async () => {
    const data = meetingsData.TC_MTG_012;
    await meetingPage.verifyTimeFieldsVisible();
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
  });

  test("TC-MTG-CORP-013. Verify Repetition dropdown options for corporate", async () => {
    await meetingPage.verifyRepetitionVisible();
  });

  test("TC-MTG-CORP-014. Verify repetition selection for corporate", async () => {
    const data = meetingsData.TC_MTG_014;
    await meetingPage.selectRepetition(data.repetition);
  });

  test("TC-MTG-CORP-015. Verify All Day toggle hides time fields for corporate", async () => {
    await meetingPage.verifyAllDayVisible();
    await meetingPage.enableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeTruthy();
    await meetingPage.verifyTimeFieldsHidden();
  });

  test("TC-MTG-CORP-016. Verify All Day unchecked shows time fields for corporate", async () => {
    await meetingPage.disableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeFalsy();
    await meetingPage.verifyTimeFieldsVisible();
  });
});

//  SECTION 30: Corporate Notification (TC-MTG-CORP-017 → 020)

test.describe("Corporate Notification", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-CORP-017. Verify Notify Me value entry for corporate", async () => {
    const data = meetingsData.TC_MTG_017;
    await meetingPage.verifyAddNotificationVisible();
    await meetingPage.enterNotification(data.notificationValue);
  });

  test("TC-MTG-CORP-018. Verify notification unit dropdown for corporate", async () => {
    await meetingPage.verifyAddNotificationVisible();
  });

  test("TC-MTG-CORP-019. Verify Add Notification for corporate", async () => {
    const data = meetingsData.TC_MTG_019;
    await meetingPage.enterNotification(data.notificationValue);
    await meetingPage.addNotification();
  });

  test("TC-MTG-CORP-020. Verify Delete Notification for corporate", async () => {
    await meetingPage.enterNotification(15);
    await meetingPage.addNotification();
    const countBefore = await meetingPage.getNotificationCount();
    await meetingPage.deleteNotification();
    const countAfter = await meetingPage.getNotificationCount();
    expect(countAfter).toBeLessThan(countBefore);
  });
});

//  SECTION 31: Corporate Meeting Details (TC-MTG-CORP-021 → 024)

test.describe("Corporate Meeting Details", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.scrollToMeetingDetails();
  });

  test("TC-MTG-CORP-021. Verify Meeting Link field for corporate", async () => {
    await meetingPage.verifyMeetingLinkVisible();
  });

  test("TC-MTG-CORP-022. Verify Dial-In Number entry for corporate", async () => {
    const data = meetingsData.TC_MTG_022;
    await meetingPage.verifyDialInNumberVisible();
    await meetingPage.enterDialInNumber(data.dialInNumber);
    const value = await meetingPage.getDialInNumberValue();
    expect(value).toContain("234");
  });

  test("TC-MTG-CORP-023. Verify Location entry for corporate", async () => {
    const data = meetingsData.TC_MTG_023;
    await meetingPage.verifyLocationVisible();
    await meetingPage.enterLocation(data.location);
    const value = await meetingPage.getLocationValue();
    expect(value).toBe(data.location);
  });

  test("TC-MTG-CORP-024. Verify Meeting Agenda entry for corporate", async () => {
    const data = meetingsData.TC_MTG_024;
    await meetingPage.verifyMeetingAgendaVisible();
    await meetingPage.enterMeetingAgenda(data.agenda);
    const value = await meetingPage.getMeetingAgendaValue();
    expect(value).toBe(data.agenda);
  });
});

//  SECTION 32: Attendees - Corporate (TC-MTG-CORP-025 → 030)

test.describe("Corporate Attendees", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-CORP-025. Verify Add Corporate category dropdown visible", async () => {
    await meetingPage.scrollToAttendees();
    await meetingPage.verifyCorporateSectionVisible();
  });

  test("TC-MTG-CORP-026. Verify corporate child dropdown/search visible for selection", async () => {
    const data = meetingsData.TC_MTG_CORP_006;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.verifyCorporateSectionVisible();
  });

  test("TC-MTG-CORP-027. Verify corporate search - select category, select corporate, and click ADD", async () => {
    const data = meetingsData.TC_MTG_006;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    for (const corporate of data.corporates) {
      await meetingPage.addCorporate(corporate);
    }
    for (const corporate of data.corporates) {
      await meetingPage.verifyCorporateAdded(corporate);
    }
    const count = await meetingPage.getCorporateCount();
    expect(count).toBeGreaterThanOrEqual(data.corporates.length);
  });

  test("TC-MTG-CORP-028. Verify adding a single corporate via two-step selection", async () => {
    const data = meetingsData.TC_MTG_CORP_002;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.verifyCorporateAdded(data.corporateName);
    const count = await meetingPage.getCorporateCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("TC-MTG-CORP-029. Verify adding multiple corporates via two-step selection", async () => {
    const data = meetingsData.TC_MTG_CORP_003;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    for (const corporate of data.corporates) {
      await meetingPage.addCorporate(corporate);
    }
    for (const corporate of data.corporates) {
      await meetingPage.verifyCorporateAdded(corporate);
    }
    const count = await meetingPage.getCorporateCount();
    expect(count).toBeGreaterThanOrEqual(data.corporates.length);
  });

  test("TC-MTG-CORP-030. Verify Add Corporate with matter and mandatory fields", async () => {
    const data = meetingsData.TC_MTG_006;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporates[0]);
    await meetingPage.verifyCorporateAdded(data.corporates[0]);
  });
});

//  SECTION 33: Corporate Document Attachment (TC-MTG-CORP-031 → 033)

test.describe("Corporate Document Attachment", () => {
  test.beforeEach(async ({ browser }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
  });

  test("TC-MTG-CORP-031. Verify Document search field visible after corporate selection", async () => {
    const data = meetingsData.TC_MTG_CORP_006;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.verifyCorporateAdded(data.corporateName);
    await meetingPage.scrollToAttendees();
    await meetingPage.verifyDocumentSectionVisible();
  });

  test("TC-MTG-CORP-032. Verify document selection from dropdown after corporate", async () => {
    const data = meetingsData.TC_MTG_CORP_012;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.verifyCorporateAdded(data.corporateName);
    await meetingPage.scrollToAttendees();
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
  });

  test("TC-MTG-CORP-033. Verify matter-related documents appear after corporate", async () => {
    const data = meetingsData.TC_MTG_CORP_013;
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.verifyCorporateAdded(data.corporateName);
    await meetingPage.scrollToAttendees();
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
    const count = await meetingPage.getDocumentCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

//  SECTION 34: Corporate Save, Confirmation & Calendar (TC-MTG-CORP-034 → 039)

test.describe("Corporate Save, Confirmation & Calendar Verification", () => {
  test("TC-MTG-CORP-034. Verify Save Meeting with mandatory fields for corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_014;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    sharedState.eventDateSelection = data.meetingData.dateSelection;
    sharedState.createdEventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
  });

  test("TC-MTG-CORP-035. Verify save confirmation toast for corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_015;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-036. Verify created corporate meeting in calendar", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_016;
    await meetingPage.verifyCreatedEvent(
      data.dateSelection,
      data.matter,
      data.subjectTask,
      data.startTime,
    );
  });

  test("TC-MTG-CORP-037. Verify created corporate meeting details on click", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const eventText = sharedState.createdEventText;
    if (eventText) {
      await meetingPage.clickCalendarEvent(eventText);
    }
  });

  test("TC-MTG-CORP-038. Verify corporate attendee details after save", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_014;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.verifyCorporateAdded(data.corporateName);
  });

  test("TC-MTG-CORP-039. Verify attached document after save with corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_014;
    const docData = meetingsData.TC_MTG_CORP_018;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.attachDocument(docData.documentName);
    await meetingPage.verifyDocumentAdded(docData.documentName);
  });
});

//  SECTION 35: Corporate Document View & Preview (TC-MTG-CORP-040 → 041)

test.describe("Corporate Document View & Preview", () => {
  test("TC-MTG-CORP-040. Verify document View action with corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_014;
    const docData = meetingsData.TC_MTG_CORP_021;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.attachDocument(docData.documentName);
    await meetingPage.verifyDocumentAdded(docData.documentName);
  });

  test("TC-MTG-CORP-041. Verify document preview with corporate attendee", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_014;
    const docData = meetingsData.TC_MTG_CORP_022;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.attachDocument(docData.documentName);
    await meetingPage.verifyDocumentAdded(docData.documentName);
  });
});

//  SECTION 36: Corporate Data Persistence & Cancel (TC-MTG-CORP-042 → 043)

test.describe("Corporate Data Persistence & Cancel", () => {
  test("TC-MTG-CORP-042. Verify corporate meeting data persistence", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_CORP_019;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.scrollToMeetingDetails();
    await meetingPage.enterLocation("Corporate Persistence Test Location");
    const locationValue = await meetingPage.getLocationValue();
    expect(locationValue).toBe("Corporate Persistence Test Location");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
  });

  test("TC-MTG-CORP-043. Verify Cancel action closes corporate form without saving", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType("Legal Matter");
    await meetingPage.scrollToMeetingDetails();
    await meetingPage.enterLocation("Cancel Test - Should Not Save");
    await meetingPage.clickCancel();
    await meetingPage.verifyMeetingsPageLoaded();
  });
});

//  SECTION 37: Corporate Positive End-to-End Flows (PF-MTG-CORP-001 → 010)

test.describe("Corporate Positive End-to-End Flows", () => {
  test("PF-MTG-CORP-001. Legal Matter → Lagal Matter With DGC → Corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_001;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.verifyCorporateAdded(data.corporateName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("PF-MTG-CORP-002. Corporate with document attachment", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_002;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    await meetingPage.addCorporate(data.corporateName);
    await meetingPage.verifyCorporateAdded(data.corporateName);
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
  });

  test("PF-MTG-CORP-003. Multiple corporate attendees", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_003;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    for (const corporate of data.corporates) {
      await meetingPage.addCorporate(corporate);
    }
    for (const corporate of data.corporates) {
      await meetingPage.verifyCorporateAdded(corporate);
    }
  });

  test("PF-MTG-CORP-004. Corporate with All Day toggle", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_004;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.enableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeTruthy();
    await meetingPage.disableAllDay();
    expect(await meetingPage.isAllDayChecked()).toBeFalsy();
    await meetingPage.verifyTimeFieldsVisible();
  });

  test("PF-MTG-CORP-005. Corporate with Add to Timesheet", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_005;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.enableAddToTimesheet();
    expect(await meetingPage.isAddToTimesheetChecked()).toBeTruthy();
  });

  test("PF-MTG-CORP-006. Corporate with notification and meeting details", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_006;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToMeetingDetails();
    await meetingPage.enterLocation(data.meetingData.location);
    await meetingPage.enterMeetingAgenda(data.meetingData.agenda);
    await meetingPage.enterNotification(data.notificationValue);
    await meetingPage.addNotification();
  });

  test("PF-MTG-CORP-007. Save → Verify corporate meeting in calendar", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_007;
    await meetingPage.verifyCreatedEvent(
      data.meetingData.dateSelection,
      data.matter,
      data.meetingData.subjectTask,
      data.meetingData.startTime,
    );
  });

  test("PF-MTG-CORP-008. Open created corporate meeting → Verify details", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_008;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.clickCalendarEvent(eventText);
    await expect(
      meetingPage.page.getByRole("heading", {
        name: data.meetingData.subjectTask,
      }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("PF-MTG-CORP-009. Corporate with multiple corporates and document", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_009;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity(data.corporateEntity);
    for (const corporate of data.corporates) {
      await meetingPage.addCorporate(corporate);
    }
    for (const corporate of data.corporates) {
      await meetingPage.verifyCorporateAdded(corporate);
    }
    await meetingPage.attachDocument(data.documentName);
    await meetingPage.verifyDocumentAdded(data.documentName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("PF-MTG-CORP-010. Corporate with different Subject/Task and time", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.PF_MTG_CORP_010;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName(data.meetingData.matterName);
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });
});

//  SECTION 38: Edit Corporate Meeting - Date & Time (TC-MTG-CORP-EDIT-001 → 008)

test.describe("Edit Corporate Meeting - Date & Time", () => {
  test("TC-MTG-CORP-EDIT-001. Verify Edit option for a created corporate meeting", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_001;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    const currentUrl = meetingPage.page.url();
    if (!currentUrl.includes("edit")) {
      const editIcon = meetingPage.page
        .locator("[class*='edit'], [title*='Edit'], [aria-label*='Edit']")
        .first();
      if ((await editIcon.count()) > 0 && (await editIcon.isVisible())) {
        await editIcon.click();
        await meetingPage.page.waitForTimeout(2000);
      }
    }
    await meetingPage.verifyEditPageLoaded();
  });

  test("TC-MTG-CORP-EDIT-002. Verify existing corporate meeting details on edit", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_002;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.verifyEditPageLoaded();
    await meetingPage.verifySubjectTaskVisible();
    await meetingPage.verifyTimeZoneVisible();
    await meetingPage.verifyDateFieldVisible();
    await meetingPage.verifyTimeFieldsVisible();
    await meetingPage.verifyCorporateSectionVisible();
  });

  test("TC-MTG-CORP-EDIT-003. Edit corporate meeting date", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_003;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectDate(data.newDateSelection);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-004. Edit corporate meeting start time", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_004;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectStartTime(data.newStartTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-005. Edit corporate meeting end time", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_005;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectEndTime(data.newEndTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-006. Edit both date and time for corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_006;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectDate(data.newDateSelection);
    await meetingPage.selectStartTime(data.newStartTime);
    await meetingPage.selectEndTime(data.newEndTime);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-007. Verify modified date and time in calendar for corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_007;
    await meetingPage.verifyCreatedEvent(
      data.dateSelection,
      data.matter,
      data.subjectTask,
      data.startTime,
    );
  });

  test("TC-MTG-CORP-EDIT-008. Verify old date/time is cleared after edit for corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_008;
    await meetingPage.verifyEventNotOnDate(
      data.oldDateSelection,
      data.matter,
      data.subjectTask,
      data.startTime,
    );
  });
});

//  SECTION 39: Edit Corporate Meeting - Client Modification (TC-MTG-CORP-EDIT-009 → 013)

test.describe("Edit Corporate Meeting - Client Modification", () => {
  test("TC-MTG-CORP-EDIT-009. Add a new corporate to an existing meeting", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_009;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.addCorporate("Jemi");
    await meetingPage.verifyCorporateAdded("Jemi");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-010. Remove an existing corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_010;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.removeClient("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-011. Replace an existing corporate", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_011;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.removeClient("dhinesh");
    await meetingPage.addCorporate("Jemi");
    await meetingPage.verifyCorporateAdded("Jemi");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-012. Add multiple corporates", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_012;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.addCorporate("Jemi");
    await meetingPage.addCorporate("Test Corporate User");
    await meetingPage.verifyCorporateAdded("Jemi");
    await meetingPage.verifyCorporateAdded("Test Corporate User");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
  });

  test("TC-MTG-CORP-EDIT-013. Verify corporate details after saving", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_013;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.removeClient("dhinesh");
    await meetingPage.addCorporate("Jemi");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.verifyCorporateAdded("Jemi");
  });
});

//  SECTION 40: Edit Corporate Meeting - Combined E2E (TC-MTG-CORP-EDIT-014)

test.describe("Edit Corporate Meeting - Combined End-to-End", () => {
  test("TC-MTG-CORP-EDIT-014. Edit corporate meeting date, time, and corporates", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_014;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.verifyEditPageLoaded();
    await meetingPage.selectDate(data.newDateSelection);
    await meetingPage.selectStartTime(data.newStartTime);
    await meetingPage.selectEndTime(data.newEndTime);
    await meetingPage.removeClient("dhinesh");
    await meetingPage.addCorporate("Jemi");
    await meetingPage.verifyCorporateAdded("Jemi");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    await meetingPage.navigateToEventDate(data.newDateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.verifyCorporateAdded("Jemi");
  });
});

//  SECTION 41: Delete Corporate Meeting (TC-MTG-CORP-DEL-001 → 003)

test.describe("Delete Corporate Meeting", () => {
  test("TC-MTG-CORP-DEL-001. Verify Delete option for a created corporate meeting", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_DEL_001;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    const deleteBtn = meetingPage.page.locator(
      "button[title='Delete'], button[mattooltip='Delete']",
    );
    const fallbackBtn = meetingPage.page
      .locator("app-viewevent")
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
    expect(hasDeleteBtn).toBeTruthy();
  });

  test("TC-MTG-CORP-DEL-002. Delete a corporate meeting and verify removal from calendar", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_DEL_002;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    await meetingPage.verifyCreatedEvent(
      data.meetingData.dateSelection,
      data.meetingData.matterName,
      data.meetingData.subjectTask,
      data.meetingData.startTime,
    );
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickDeleteButton();
    await meetingPage.confirmDelete();
    await meetingPage.verifyEventSavedSuccessfully();
    await meetingPage.verifyEventNotOnDate(
      data.meetingData.dateSelection,
      data.meetingData.matterName,
      data.meetingData.subjectTask,
      data.meetingData.startTime,
    );
  });

  test("TC-MTG-CORP-DEL-003. Cancel delete action keeps corporate meeting intact", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_DEL_003;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.meetingData.eventType);
    await meetingPage.selectMatterName("Lagal Matter With DGC");
    await meetingPage.selectSubjectTask(data.meetingData.subjectTask);
    await meetingPage.selectTimeZone(data.meetingData.timeZone);
    await meetingPage.selectDate(data.meetingData.dateSelection);
    await meetingPage.selectStartTime(data.meetingData.startTime);
    await meetingPage.selectEndTime(data.meetingData.endTime);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectCorporateEntity("Soundarya StagCorporate Firm");
    await meetingPage.addCorporate("dhinesh");
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();
    const eventText = `${data.meetingData.startTime} - Lagal Matter With DGC - ${data.meetingData.subjectTask}`;
    await meetingPage.navigateToEventDate(data.meetingData.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickDeleteButton();
    await meetingPage.cancelDelete();
    await meetingPage.verifyCreatedEvent(
      data.meetingData.dateSelection,
      data.meetingData.matterName,
      data.meetingData.subjectTask,
      data.meetingData.startTime,
    );
  });
});

//  SECTION 42: Delete Duplicate Events (TC-MTG-DEL-DUP-001)

test.describe("Delete Duplicate Events", () => {
  test("TC-MTG-DEL-DUP-001. Delete all duplicate events from the view meetings page", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    await meetingPage.goToMeeting();
    await meetingPage.verifyMeetingsPageLoaded();
    await meetingPage.page.waitForTimeout(3000);

    const deletedCount = await meetingPage.deleteAllDuplicateEvents();
    console.log(`Deleted ${deletedCount} duplicate event(s)`);

    await meetingPage.goToMeeting();
    await meetingPage.page.waitForTimeout(2000);

    const remainingDuplicates = await meetingPage.getDuplicateEvents();
    console.log(
      `Remaining duplicates after cleanup: ${remainingDuplicates.length}`,
    );
    expect(remainingDuplicates.length).toBe(0);
  });
});

//  SECTION 43: Subject/Task & Repetition Combinations (TC-MTG-REP-001 → 025)

test.describe("Subject/Task & Repetition Combinations - Case filling", () => {
  test("TC-MTG-REP-001. Case filling + Daily repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_001;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-002. Case filling + Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_002;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-003. Case filling + Bi-Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_003;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-004. Case filling + Monthly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_004;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-005. Case filling + Yearly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_005;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Subject/Task & Repetition Combinations - Creating legal briefs", () => {
  test("TC-MTG-REP-006. Creating legal briefs + Daily repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_006;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-007. Creating legal briefs + Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_007;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-008. Creating legal briefs + Bi-Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_008;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-009. Creating legal briefs + Monthly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_009;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-010. Creating legal briefs + Yearly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_010;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Subject/Task & Repetition Combinations - Consultation", () => {
  test("TC-MTG-REP-011. Consultation + Daily repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_011;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-012. Consultation + Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_012;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-013. Consultation + Bi-Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_013;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-014. Consultation + Monthly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_014;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-015. Consultation + Yearly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_015;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Subject/Task & Repetition Combinations - Meeting with client", () => {
  test("TC-MTG-REP-016. Meeting with client + Daily repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_016;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-017. Meeting with client + Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_017;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-018. Meeting with client + Bi-Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_018;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-019. Meeting with client + Monthly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_019;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-020. Meeting with client + Yearly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_020;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Subject/Task & Repetition Combinations - Hearing", () => {
  test("TC-MTG-REP-021. Hearing + Daily repetition", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_021;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-022. Hearing + Weekly repetition", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_022;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-023. Hearing + Bi-Weekly repetition", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_023;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-024. Hearing + Monthly repetition", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_024;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-REP-025. Hearing + Yearly repetition", async ({ browser }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_REP_025;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.repetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.repetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

//  SECTION 44: Edit Meeting Repetition Change (TC-MTG-EDIT-REP-001 → 020)

test.describe("Edit Meeting - Repetition Change Daily to Others", () => {
  test("TC-MTG-EDIT-REP-001. Change repetition from Daily to Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_001;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-002. Change repetition from Daily to Bi-Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_002;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-003. Change repetition from Daily to Monthly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_003;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-004. Change repetition from Daily to Yearly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_004;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Edit Meeting - Repetition Change Weekly to Others", () => {
  test("TC-MTG-EDIT-REP-005. Change repetition from Weekly to Daily", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_005;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-006. Change repetition from Weekly to Bi-Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_006;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-007. Change repetition from Weekly to Monthly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_007;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-008. Change repetition from Weekly to Yearly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_008;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Edit Meeting - Repetition Change Bi-Weekly to Others", () => {
  test("TC-MTG-EDIT-REP-009. Change repetition from Bi-Weekly to Daily", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_009;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-010. Change repetition from Bi-Weekly to Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_010;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-011. Change repetition from Bi-Weekly to Monthly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_011;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-012. Change repetition from Bi-Weekly to Yearly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_012;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Edit Meeting - Repetition Change Monthly to Others", () => {
  test("TC-MTG-EDIT-REP-013. Change repetition from Monthly to Daily", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_013;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-014. Change repetition from Monthly to Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_014;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-015. Change repetition from Monthly to Bi-Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_015;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-016. Change repetition from Monthly to Yearly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_016;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});

test.describe("Edit Meeting - Repetition Change Yearly to Others", () => {
  test("TC-MTG-EDIT-REP-017. Change repetition from Yearly to Daily", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_017;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-018. Change repetition from Yearly to Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_018;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-019. Change repetition from Yearly to Bi-Weekly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_019;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });

  test("TC-MTG-EDIT-REP-020. Change repetition from Yearly to Monthly", async ({
    browser,
  }) => {
    await ensureLoggedIn(browser);
    const data = meetingsData.TC_MTG_EDIT_REP_020;
    await meetingPage.createButtonClick();
    await meetingPage.selectEventType(data.eventType);
    await meetingPage.selectMatterName(data.matterName);
    await meetingPage.selectSubjectTask(data.subjectTask);
    await meetingPage.selectTimeZone(data.timeZone);
    await meetingPage.selectDate(data.dateSelection);
    await meetingPage.selectStartTime(data.startTime);
    await meetingPage.selectEndTime(data.endTime);
    await meetingPage.selectRepetition(data.initialRepetition);
    await meetingPage.scrollToAttendees();
    await meetingPage.selectEntity(data.entityName);
    await meetingPage.addClient(data.clientName);
    await meetingPage.verifyClientAdded(data.clientName);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickSaveEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const eventText = `${data.startTime} - ${data.matterName} - ${data.subjectTask}`;
    await meetingPage.navigateToEventDate(data.dateSelection);
    await meetingPage.page.waitForTimeout(1000);
    await meetingPage.clickCalendarEvent(eventText);
    await meetingPage.clickEditButton();
    await meetingPage.selectRepetition(data.newRepetition);
    await meetingPage.scrollToSaveButton();
    await meetingPage.clickUpdateEvent();
    await meetingPage.verifyEventSavedSuccessfully();

    const repetitionVerified = await meetingPage.verifyEventRepetitionType(
      data.dateSelection,
      data.subjectTask,
      data.newRepetition,
    );
    expect(repetitionVerified).toBeTruthy();
  });
});
