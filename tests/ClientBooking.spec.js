require("dotenv").config();

const { test, expect } = require("@playwright/test");
const AppointmentsPage = require("../Pages/ClientBookingPage");
const LoginPage = require("../Pages/LoginPage");
const appointmentsData = require("../testData/appointmentsData.json");
const { loginData } = require("../testData/loginData");

const data = appointmentsData.TC_APPT_001_SearchAndBookAppointment;
const BASE_URL = process.env.CLIENT_URL;

test.describe("Appointments Booking Flow", () => {
  test(
    "TC-APPT-001: Search lawyer, book appointment with card payment, verify in listing",
    { timeout: 120000 },
    async ({ page }) => {
      const appointmentsPage = new AppointmentsPage(page);

      await page.goto(BASE_URL, { waitUntil: "networkidle" });

      await appointmentsPage.searchLocation(data.city);
      await appointmentsPage.selectSpecialization(data.specialization);
      await appointmentsPage.clickSearch();

      await appointmentsPage.bookLawyer(data.lawyerName);

      await appointmentsPage.selectTimeSlot(data.slotTime);

      await appointmentsPage.loginFromDialog(data.email, data.password);

      await appointmentsPage.clickBookSlot();

      await appointmentsPage.enterCardDetails(
        data.cardNumber,
        data.cardExpiry,
        data.cardCvv,
      );

      await appointmentsPage.clickMaybeLater();

      await appointmentsPage.clickSuccess();

      await appointmentsPage.navigateToAppointments();

      await appointmentsPage.verifyAppointmentListed(data.lawyerName);

      const defaultLogin = (loginData && loginData[0]) || {};
      const loginPage = new LoginPage(page);
      await loginPage.loginWithPassword(
        defaultLogin.email || process.env.EMAIL,
        defaultLogin.password || process.env.PASSWORD,
      );

      await loginPage.assertTitle("Lexi-Z Lawyers");

      await appointmentsPage.openAppointments();

      await appointmentsPage.assertAppointmentsTitle();

      await appointmentsPage.verifyAppointmentOnLawyerSide(
        data.clientName,
        data.expectedTime || data.slotTime,
      );
    },
  );
});
