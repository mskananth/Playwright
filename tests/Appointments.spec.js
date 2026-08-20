require("dotenv").config();

const { test, expect } = require("@playwright/test");
const AppointmentsPage = require("../Pages/AppointmentsPage");
const LoginPage = require("../Pages/LoginPage");
const appointmentsData = require("../testData/appointmentsData.json");
const { loginData } = require("../testData/loginData");

const data = appointmentsData.TC_APPT_001_SearchAndBookAppointment;
const BASE_URL = "https://staging.consumer.lexiz.ai/consumer";

test.describe("Appointments Booking Flow", () => {
  test(
    "TC-APPT-001: Search lawyer, book appointment with card payment, verify in listing",
    { timeout: 120000 },
    async ({ page }) => {
      const appointmentsPage = new AppointmentsPage(page);

      // Step 1: Navigate
      await page.goto(BASE_URL, { waitUntil: "networkidle" });

      // Step 2: Search for lawyer
      await appointmentsPage.searchLocation(data.city);
      await appointmentsPage.selectSpecialization(data.specialization);
      await appointmentsPage.clickSearch();

      // Step 3: Select lawyer, book appointment
      await appointmentsPage.bookLawyer(data.lawyerName);

      // Step 4: Select slot
      await appointmentsPage.selectTimeSlot(data.slotTime);

      // Step 5: Login
      await appointmentsPage.loginFromDialog(data.email, data.password);

      // Step 6: Go to checkout
      await appointmentsPage.clickBookSlot();

      // Step 7: Enter card details and submit
      await appointmentsPage.enterCardDetails(
        data.cardNumber,
        data.cardExpiry,
        data.cardCvv,
      );

      // Step 8: Dismiss "save card" prompt, opens Razorpay popup
      await appointmentsPage.clickMaybeLater();

      // Step 9: Confirm payment success in the popup
      await appointmentsPage.clickSuccess();

      // Step 10: Back to listing
      await page.waitForTimeout(5000);
      await appointmentsPage.navigateToAppointments();

      // Step 11: Verify appointment listed
      await appointmentsPage.verifyAppointmentListed(data.lawyerName);

      // Step 12: Login to La auditor (lawyer dashboard)
      const defaultLogin = (loginData && loginData[0]) || {};
      const loginPage = new LoginPage(page);
      await loginPage.loginWithPassword(
        defaultLogin.email || process.env.EMAIL,
        defaultLogin.password || process.env.PASSWORD,
      );

      // Step 13: Verify dashboard loaded
      await loginPage.assertTitle("Lexi-Z Lawyers");

      // Step 14: Navigate to Appointments module
      await appointmentsPage.openAppointments();

      // Step 15: Verify Appointments page title
      const pageTitle = await appointmentsPage.getPageTitle();
      expect(pageTitle.toLowerCase()).toContain("appointment");
    },
  );
});
