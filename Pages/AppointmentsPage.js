const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

class AppointmentsPage extends BasePage {
  constructor(page) {
    super(page);

    // Login
    this.emailInput = page
      .locator('input[placeholder*="email" i], input[type="email"]')
      .first();
    this.passwordInput = page
      .locator('input[placeholder*="password" i], input[type="password"]')
      .first();
    this.loginButton = page.getByRole("button", {
      name: /log\s*in|sign\s*in|submit/i,
    });

    // Login dialog
    this.loginDialog = page.getByRole("dialog", { name: /login/i });
    this.dialogEmailInput = this.loginDialog
      .locator(
        'input[placeholder*="email" i], input[placeholder*="mobile" i], input[type="email"], input[type="tel"]',
      )
      .first();
    this.usePasswordLink = this.loginDialog
      .getByRole("link", { name: /password/i })
      .first();
    this.dialogPasswordInput = this.loginDialog
      .locator('input[type="password"], input[placeholder*="password" i]')
      .first();
    this.sendOtpButton = this.loginDialog
      .getByRole("button", { name: /otp/i })
      .first();
    this.dialogLoginButton = this.loginDialog
      .getByRole("button", { name: /log\s*in|submit|sign\s*in/i })
      .first();

    // Search / Filters
    this.locationInput = page
      .locator(
        'input[placeholder*="location" i], input[placeholder*="city" i], input[placeholder*="search" i]',
      )
      .first();
    this.specializationDropdown = page.locator('input[name="service"]');

    this.searchButton = page
      .getByRole("button", { name: /search|find|apply/i })
      .first();
    this.civilLawOption = page.getByRole("option", { name: /civil/i }).first();
    this.civilLawFilter = page.getByText("Civil Law", { exact: false }).first();

    // Lawyer card
    this.lawyerCard = (name) => page.locator(`text=${name}`).first();
    this.viewProfileButton = (name) =>
      page
        .locator(`.lawyer-card, .card, [class*="lawyer"], [class*="profile"]`)
        .filter({ hasText: name })
        .getByRole("button", { name: /view|profile|book|select/i })
        .first();

    // Slot selection
    this.slotButton = (time) => {
      const parts = time.trim().split(/[\s:]+/);
      const hour = parts[0];
      const minute = parts[1];
      const pattern = `0?${hour}:${minute}\\s*(?:AM|PM|am|pm)?`;
      return page
        .getByRole("button", { name: new RegExp(pattern, "i") })
        .first();
    };
    this.todaySlots = page.locator(
      '[class*="slot"], [class*="time"], [class*="schedule"]',
    );

    // Checkout / Booking
    this.bookSlotButton = page
      .getByRole("button", { name: /book\s*slot|confirm|proceed|checkout/i })
      .first();
    this.paymentSection = page.locator(
      '[class*="payment"], [class*="checkout"]',
    );

    // Payment (Razorpay iframe) - locators resolved at interaction time in payWithCard()

    // Post-payment buttons
    this.maybeLaterButton = page
      .getByRole("button", { name: /maybe\s*later|skip/i })
      .first();
    this.successButton = page
      .getByRole("button", { name: /success|ok|done|continue|close/i })
      .first();

    // Appointments listing
    this.appointmentsNav = page.getByRole("link", { name: /appoint/i }).first();
    this.appointmentsMenuItem = page
      .getByRole("menuitem", { name: /appoint/i })
      .first();
    this.appointmentsList = page.locator(
      '[class*="appointment"], [class*="booking"], table, .list, .card-item, [role="list"]',
    );
    this.appointmentRow = (text) =>
      page
        .locator(
          '[class*="appointment"], [class*="booking"], tr, .card-item, .list-item, [role="row"]',
        )
        .filter({ hasText: text })
        .first();

    this.lawyerCards = page.locator(".lawyer-card");

    // Appointments module (La auditor sidebar)
    this.appointmentsMenu = page.getByRole("menuitem", {
      name: /appoint/i,
    });
    this.pageTitle = page.locator("h2.page-title, h1.page-title, .page-title");
  }

  // ── Login ──────────────────────────────────────────────────────────
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async loginFromDialog(email, password) {
    const dialog = this.loginDialog;
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await this.dialogEmailInput.fill(email);
    await this.usePasswordLink.click();
    await this.page.waitForTimeout(500);
    await this.dialogPasswordInput.fill(password);
    await this.dialogLoginButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
    await expect(dialog).toBeHidden({ timeout: 15000 });
  }

  // ── Search ─────────────────────────────────────────────────────────
  async searchLocation(city) {
    await this.locationInput.clear();
    await this.locationInput.fill(city);
    await this.page.waitForTimeout(1000);
  }

  getLawyerCard(lawyerName) {
    const escaped = lawyerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameRegex = new RegExp(`^\\s*${escaped}\\s*$`, "i");
    return this.page
      .locator('[class*="lawyer"], [class*="card"], [class*="profile"], [class*="listing"], article, li, section')
      .filter({ hasText: nameRegex })
      .filter({
        has: this.page.getByRole("button", { name: /book\s*appointment|book now/i }),
      })
      .first();
  }

  async bookLawyer(lawyerName) {
    const maxPages = 10;
    for (let i = 0; i < maxPages; i++) {
      const cards = this.page
        .locator('[class*="lawyer"], [class*="card"], [class*="profile"], [class*="listing"], article, li, section')
        .filter({ hasText: /book\s*appointment|book now/i });
      const count = await cards.count();
      for (let j = 0; j < count; j++) {
        const card = cards.nth(j);
        const text = await card.innerText();
        if (new RegExp(`\\b${lawyerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) {
          const bookBtn = card
            .getByRole("button", { name: /book\s*appointment|book now/i })
            .first();
          await expect(bookBtn).toBeVisible({ timeout: 10000 });
          await bookBtn.click();
          await this.page.waitForLoadState("networkidle");
          await this.page.waitForTimeout(2000);
          return;
        }
      }
      const nextBtn = this.page.getByRole("button", { name: /next/i }).first();
      if ((await nextBtn.count()) === 0 || (await nextBtn.isDisabled())) {
        break;
      }
      await nextBtn.click();
      await this.page.waitForLoadState("networkidle");
      await this.page.waitForTimeout(2000);
    }
    throw new Error(`Lawyer "${lawyerName}" not found after ${maxPages} pages`);
  }

  async selectSpecialization(label) {
    // Try clicking a dropdown trigger first
    const trigger = this.specializationDropdown.first();
    if ((await trigger.count()) > 0) {
      await trigger.click();
      await this.page.waitForTimeout(500);
    }

    const option = this.page
      .getByRole("option", { name: new RegExp(label, "i") })
      .first();
    if ((await option.count()) > 0) {
      await option.click();
    } else {
      // Fallback: click the text directly
      await this.page.getByText(label, { exact: false }).first().click();
    }
  }

  async clickSearch() {
    await this.searchButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  // ── Lawyer ─────────────────────────────────────────────────────────
  async selectLawyer(name) {
    const card = this.lawyerCard(name);
    await expect(card).toBeVisible({ timeout: 30000 });
    await card.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  // ── Slot ───────────────────────────────────────────────────────────
  async selectTimeSlot(time) {
    const slot = this.slotButton(time);
    await expect(slot).toBeVisible({ timeout: 15000 });
    await slot.click();
    await this.page.waitForTimeout(500);
  }

  async clickBookSlot() {
    await expect(this.bookSlotButton).toBeVisible({ timeout: 15000 });
    await this.bookSlotButton.click();

    const razorpayFrame = this.page.frameLocator("iframe").first();
    const paymentOptions = razorpayFrame.getByText("Payment Options");
    await expect(paymentOptions).toBeVisible({ timeout: 30000 });
  }

  async enterCardDetails(number, expiry, cvv) {
    const razorpayFrame = this.page.frameLocator("iframe").first();

    const cardOption = razorpayFrame.getByTestId("card");
    await expect(cardOption).toBeVisible({ timeout: 15000 });
    await cardOption.click();

    const cardNumber = razorpayFrame.getByRole("textbox", {
      name: "Card Number",
    });
    await expect(cardNumber).toBeVisible({ timeout: 15000 });
    await cardNumber.fill(number);

    const expiryInput = razorpayFrame.getByRole("textbox", { name: "MM / YY" });
    await expiryInput.fill(expiry);

    const cvvInput = razorpayFrame.getByRole("textbox", { name: "CVV" });
    await cvvInput.fill(cvv);
    await cvvInput.press("Tab"); // blur triggers Razorpay's validation

    const addCardButton = razorpayFrame.locator(
      '[data-test-id="add-card-cta"]',
    );
    await expect(addCardButton).toBeVisible({ timeout: 10000 });
    await expect(addCardButton).toBeEnabled({ timeout: 10000 });
    await addCardButton.evaluate((btn) => btn.click());
  }

  async clickMaybeLater() {
    const razorpayFrame = this.page.frameLocator("iframe").first();
    const maybeLaterButton = razorpayFrame.getByRole("button", {
      name: "Maybe later",
    });
    await expect(maybeLaterButton).toBeVisible({ timeout: 30000 });

    const popupPromise = this.page.waitForEvent("popup");
    await maybeLaterButton.click();
    this.paymentPage = await popupPromise;
    await this.paymentPage.waitForLoadState("domcontentloaded");
  }

  async clickSuccess() {
    const successButton = this.paymentPage.getByRole("button", {
      name: "Success",
    });
    await expect(successButton).toBeVisible({ timeout: 15000 });
    await successButton.click();
  }

  // ── Appointments listing ───────────────────────────────────────────
  async navigateToAppointments() {
    // Try nav link first, then menu item
    if ((await this.appointmentsNav.count()) > 0) {
      await this.appointmentsNav.click();
    } else if ((await this.appointmentsMenuItem.count()) > 0) {
      await this.appointmentsMenuItem.click();
    } else {
      await this.page.goto(
        "https://staging.consumer.lexiz.ai/consumer/appointments",
      );
    }
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async verifyAppointmentListed(text) {
    const row = this.appointmentRow(text);
    await expect(row).toBeVisible({ timeout: 30000 });
    await expect(row).toContainText(text);
  }

  // ── La auditor Appointments module ──────────────────────────────────
  async openAppointments() {
    await expect(this.appointmentsMenu).toBeVisible({ timeout: 10000 });
    await this.appointmentsMenu.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async getPageTitle() {
    const title = this.pageTitle.first();
    await expect(title).toBeVisible({ timeout: 15000 });
    return title.textContent();
  }

  async assertTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}

module.exports = AppointmentsPage;
