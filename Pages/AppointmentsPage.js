const { expect } = require("@playwright/test");
const BasePage = require("./BasePage");

class AppointmentsPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Login ──────────────────────────────────────────────────────
    this.emailInput = page
      .locator('input[placeholder*="email" i], input[type="email"]')
      .first();
    this.passwordInput = page
      .locator('input[placeholder*="password" i], input[type="password"]')
      .first();
    this.loginButton = page.getByRole("button", {
      name: /log\s*in|sign\s*in|submit/i,
    });

    // ── Login dialog ───────────────────────────────────────────────
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

    // ── Search / Filters ───────────────────────────────────────────
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

    // ── Lawyer card ────────────────────────────────────────────────
    this.lawyerCard = (name) => page.locator(`text=${name}`).first();
    this.viewProfileButton = (name) =>
      page
        .locator(`.lawyer-card, .card, [class*="lawyer"], [class*="profile"]`)
        .filter({ hasText: name })
        .getByRole("button", { name: /view|profile|book|select/i })
        .first();

    // ── Slot selection ─────────────────────────────────────────────
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

    // ── Checkout / Booking ─────────────────────────────────────────
    this.bookSlotButton = page
      .getByRole("button", { name: /book\s*slot|confirm|proceed|checkout/i })
      .first();
    this.paymentSection = page.locator(
      '[class*="payment"], [class*="checkout"]',
    );

    // ── Post-payment buttons ───────────────────────────────────────
    this.maybeLaterButton = page
      .getByRole("button", { name: /maybe\s*later|skip/i })
      .first();
    this.successButton = page
      .getByRole("button", { name: /success|ok|done|continue|close/i })
      .first();

    // ── Appointments listing ───────────────────────────────────────
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

    // ── Appointments module (La auditor sidebar) ───────────────────
    this.appointmentsMenu = page.getByRole("menuitem", {
      name: /appoint/i,
    });
    this.pageTitle = page.locator("h2.page-title, h1.page-title, .page-title");

    // ── Lawyer-side appointment detail elements ────────────────────
    this.appointmentHeading = page.locator("main h2").first();
    this.appointmentSubHeading = page
      .locator("main h3, main h4")
      .filter({ hasNot: page.locator(".modal-title-custom") })
      .first();
    this.clientNameLocator = page.locator(
      '[class*="client-name"], [class*="customer"], [class*="name"]',
    );
    this.appointmentDateTimeLocator = page.locator(
      '[class*="date"], [class*="time"], [class*="schedule"]',
    );

    // ══════════════════════════════════════════════════════════════
    //  NEW: Appointments Listing – Table & Controls
    // ══════════════════════════════════════════════════════════════

    // ── Table structure ────────────────────────────────────────────
    this.tableContainer = page.locator(
      "table, [class*='table'], [class*='listing'], [class*='appointment-list']",
    );
    this.tableHeaders = page.locator(
      "table th, [class*='table'] [class*='header'], [role='columnheader']",
    );
    this.tableRows = page.locator(
      "table tbody tr, [class*='table'] [class*='row'], [role='row']",
    );
    this.tableRowsBody = page.locator(
      "table tbody tr, [class*='table'] [class*='row']",
    );

    this.columnHeader = (name) =>
      page
        .locator(
          "table th, [class*='table'] [class*='header'], [role='columnheader']",
        )
        .filter({ hasText: new RegExp(name, "i") })
        .first();

    // ── Client column ──────────────────────────────────────────────
    this.clientAvatar = (clientName) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .locator("img, [class*='avatar'], [class*='profile-pic'], svg")
        .first();

    this.clientNameInRow = (clientName) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .getByText(clientName, { exact: false })
        .first();

    // ── Status ─────────────────────────────────────────────────────
    this.statusBadge = (status) =>
      page
        .locator(
          "[class*='badge'], [class*='status'], [class*='tag'], span, p, div",
        )
        .filter({ hasText: new RegExp(`^\\s*${status}\\s*$`, "i") })
        .first();

    this.statusInRow = (clientName, status) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .getByText(new RegExp(`^\\s*${status}\\s*$`, "i"))
        .first();

    // ── Mode ───────────────────────────────────────────────────────
    this.modeInRow = (clientName, mode) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .getByText(new RegExp(`^\\s*${mode}\\s*$`, "i"))
        .first();

    // ── Meeting link ───────────────────────────────────────────────
    this.meetingLinkInRow = (clientName) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .getByRole("link", { name: /meeting\s*link/i })
        .first();

    this.meetingLinkButton = (clientName) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .getByText(/meeting\s*link/i)
        .first();

    // ── Payment ────────────────────────────────────────────────────
    this.paymentInRow = (clientName) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .getByText(/paid|unpaid|₹/i)
        .first();

    // ── Search ─────────────────────────────────────────────────────
    this.clientSearchInput = page
      .locator(
        'input[placeholder*="search" i], input[placeholder*="client" i], input[type="search"]',
      )
      .first();

    // ── Sort controls ──────────────────────────────────────────────
    this.sortButton = (column) =>
      page
        .locator(
          "table th, [class*='table'] [class*='header'], [role='columnheader']",
        )
        .filter({ hasText: new RegExp(column, "i") })
        .locator("button, [class*='sort'], i, svg, [role='button']")
        .first();

    // ── Three-dot menu ─────────────────────────────────────────────
    this.threeDotMenu = (clientName) =>
      page
        .locator(
          "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
        )
        .filter({ hasText: clientName })
        .locator("td")
        .last()
        .getByRole("button")
        .first();

    this.menuItem = (option) =>
      page
        .getByText(new RegExp(option, "i"))
        .filter({
          hasNot: page.locator("[class*='sidebar'], nav, [role='navigation']"),
        })
        .first();

    // ── Pagination ─────────────────────────────────────────────────
    this.nextButton = page.getByRole("button", { name: /next|›|»/i }).first();
    this.prevButton = page
      .getByRole("button", { name: /prev|previous|‹|«/i })
      .first();
    this.paginationInfo = page
      .locator("[class*='pagination'], [class*='paging'], [class*='page-info']")
      .first();

    // ══════════════════════════════════════════════════════════════
    //  NEW: Appointment History
    // ══════════════════════════════════════════════════════════════

    this.historyPageTitle = page
      .locator("h2, h3, [class*='title']")
      .filter({ hasText: /appointment\s*history/i })
      .first();

    this.historyClientName = page
      .locator("[class*='client'], [class*='name'], h2, h3")
      .filter({ hasText: /karal marks/i })
      .first();

    this.historyAppointmentCard = page.locator(
      "[class*='appointment'], [class*='history'], [class*='card'], [class*='item']",
    );

    this.historyAppointmentNumber = page.locator(
      "[class*='appointment-number'], [class*='appointment-title'], [class*='heading']",
    );

    this.addNoteButton = page
      .getByRole("button", { name: /\+?\s*add\s*note/i })
      .first();

    this.backButton = page.getByRole("button", { name: /back|←|‹/i }).first();

    this.backArrow = page
      .locator(
        "a[class*='back'], [class*='back-arrow'], [aria-label*='back' i]",
      )
      .first();

    // ══════════════════════════════════════════════════════════════
    //  NEW: Note Section
    // ══════════════════════════════════════════════════════════════

    this.noteSection = page.locator(
      "[class*='note'], [class*='comment'], [class*='add-note']",
    );
    this.noteTextarea = page.getByPlaceholder(/type your note/i).first();
    this.noteTextareaAlt = page.locator("textarea").first();
    this.noteCancelButton = page
      .getByRole("button", { name: /cancel/i })
      .first();
    this.noteSaveButton = page.getByRole("button", { name: /save/i }).first();
    this.noteCharacterCounter = page
      .locator("[class*='counter'], [class*='char'], [class*='limit']")
      .first();
    this.notePlaceholder = page.getByText(/type your note here/i).first();

    // ══════════════════════════════════════════════════════════════
    //  NEW: Settlement History
    // ══════════════════════════════════════════════════════════════

    this.settlementPageTitle = page
      .locator("h2, h3, [class*='title']")
      .filter({ hasText: /settlement\s*history/i })
      .first();

    this.settlementTransactionCount = page
      .locator("[class*='title'], h2, h3")
      .filter({ hasText: /settlement\s*history/i })
      .first();

    this.settlementSummaryCard = page.locator(
      "[class*='summary'], [class*='card'], [class*='stats'], [class*='overview']",
    );

    this.totalPaidValue = page
      .locator("[class*='total'], [class*='paid'], [class*='amount']")
      .filter({ hasText: /total\s*paid/i })
      .first();

    this.refundedValue = page
      .locator("[class*='refund'], [class*='total']")
      .filter({ hasText: /refund/i })
      .first();

    this.refundInitiatedValue = page
      .locator("[class*='refund-initiated'], [class*='initiated']")
      .first();

    this.totalTransactionsValue = page
      .locator("[class*='total'], [class*='transaction']")
      .filter({ hasText: /total\s*transaction/i })
      .first();

    this.settlementTable = page.locator(
      "table, [class*='settlement'], [class*='table']",
    );

    this.settlementTableHeaders = page.locator(
      "table th, [role='columnheader']",
    );

    this.settlementTableRows = page.locator(
      "table tbody tr, [class*='settlement'] [class*='row']",
    );

    this.settlementRow = (clientName) =>
      page
        .locator(
          "table tbody tr, [class*='settlement'] [class*='row'], [role='row']",
        )
        .filter({ hasText: clientName })
        .first();

    this.settlementSearchInput = page
      .locator('input[placeholder*="search" i], input[type="search"]')
      .first();

    this.settlementSortButton = (column) =>
      page
        .locator("table th, [role='columnheader']")
        .filter({ hasText: new RegExp(column, "i") })
        .locator("button, [class*='sort'], i, svg, [role='button']")
        .first();

    this.settlementAmountInRow = (clientName) =>
      page
        .locator(
          "table tbody tr, [class*='settlement'] [class*='row'], [role='row']",
        )
        .filter({ hasText: clientName })
        .getByText(/₹|amount|1000/i)
        .first();

    this.settlementMethodInRow = (clientName) =>
      page
        .locator(
          "table tbody tr, [class*='settlement'] [class*='row'], [role='row']",
        )
        .filter({ hasText: clientName })
        .getByText(/card|upi|net\s*banking|wallet|cash/i)
        .first();

    this.settlementStatusInRow = (clientName) =>
      page
        .locator(
          "table tbody tr, [class*='settlement'] [class*='row'], [role='row']",
        )
        .filter({ hasText: clientName })
        .getByText(/paid|refunded|pending|failed/i)
        .first();

    this.settlementDateInRow = (clientName) =>
      page
        .locator(
          "table tbody tr, [class*='settlement'] [class*='row'], [role='row']",
        )
        .filter({ hasText: clientName })
        .getByText(
          /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
        )
        .first();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  EXISTING: Login
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  //  EXISTING: Search
  // ═══════════════════════════════════════════════════════════════════

  async searchLocation(city) {
    await this.locationInput.clear();
    await this.locationInput.fill(city);
    await this.page.waitForTimeout(1000);
  }

  getLawyerCard(lawyerName) {
    const escaped = lawyerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameRegex = new RegExp(`^\\s*${escaped}\\s*$`, "i");
    return this.page
      .locator(
        '[class*="lawyer"], [class*="card"], [class*="profile"], [class*="listing"], article, li, section',
      )
      .filter({ hasText: nameRegex })
      .filter({
        has: this.page.getByRole("button", {
          name: /book\s*appointment|book now/i,
        }),
      })
      .first();
  }

  async bookLawyer(lawyerName, specialization) {
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameRegex = new RegExp(`\\b${escapeRe(lawyerName)}\\b`, "i");
    const specRegex = specialization
      ? new RegExp(escapeRe(specialization), "i")
      : null;
    const maxPages = 10;

    const clickBookButton = async (btn) => {
      await expect(btn).toBeVisible({ timeout: 10000 });
      await expect(btn).toBeEnabled({ timeout: 10000 });
      await btn.click();
      // Confirm the booking screen is for the requested lawyer
      await expect(
        this.page.getByText(lawyerName, { exact: false }).first(),
      ).toBeVisible({ timeout: 10000 });
    };

    for (let i = 0; i < maxPages; i++) {
      // Candidate = each Book button; climb to the tightest ancestor whose
      // text contains the lawyer name — that element is this lawyer's card.
      // A class-substring XPath can stop at a nested sub-block (e.g. an
      // actions/footer div) whose text never includes the name, causing
      // every candidate to be skipped even when the lawyer is on screen.
      const bookButtons = this.page.getByRole("button", {
        name: /book\s*appointment|book now/i,
      });
      const btnCount = await bookButtons.count();

      let nameOnlyBtn = null;
      for (let j = 0; j < btnCount; j++) {
        const btn = bookButtons.nth(j);
        let scope = btn;
        let text = "";
        for (let depth = 0; depth < 8; depth++) {
          scope = scope.locator("xpath=..");
          text = await scope.innerText().catch(() => "");
          if (nameRegex.test(text)) break;
        }
        if (!nameRegex.test(text)) continue;
        if (!specRegex || specRegex.test(text)) {
          // Card shows BOTH lawyer name and specialization
          await clickBookButton(btn);
          return;
        }
        // Name matches but specialization truncated/hidden on card (e.g. "+1 more")
        if (!nameOnlyBtn) nameOnlyBtn = btn;
      }

      if (nameOnlyBtn) {
        await clickBookButton(nameOnlyBtn);
        // Specialization must still be confirmed on the booking screen
        if (specRegex) {
          await expect(this.page.getByText(specRegex).first()).toBeVisible({
            timeout: 10000,
          });
        }
        return;
      }

      // Lawyer not on this page → go to Next page
      const nextBtn = this.page
        .getByRole("button", { name: /next|›|»/i })
        .first();
      if (
        (await nextBtn.count()) === 0 ||
        (await nextBtn.isDisabled().catch(() => true))
      ) {
        break;
      }
      const before = await this.page.locator("body").innerText();
      await nextBtn.click();
      await this.page.waitForLoadState("networkidle").catch(() => {});
      // Only proceed once content actually changed (avoids rescanning same page)
      await this.page
        .waitForFunction(
          (prev) => document.body.innerText !== prev,
          before,
          { timeout: 15000 },
        )
        .catch(() => {});
      await this.page.waitForTimeout(1000);
    }
    throw new Error(
      `Lawyer "${lawyerName}"${specRegex ? ` with "${specialization}"` : ""} not found after ${maxPages} pages`,
    );
  }

  async selectSpecialization(label) {
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(escapeRe(label), "i");
    const input = this.specializationDropdown.first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.click();
    await input.fill(label);

    // The app either opens an ARIA listbox (role=option) or commits the
    // value directly as a removable "<label> SPECIALITY ✕" chip.
    const option = this.page.getByRole("option", { name: pattern }).first();
    const chip = this.page
      .getByText(new RegExp(`${escapeRe(label)}\\s+SPECIALITY`, "i"))
      .first();
    await expect(option.or(chip)).toBeVisible({ timeout: 5000 });

    // Only the listbox variant needs an explicit selection; the chip means
    // the filter is already committed.
    if (await option.isVisible()) {
      await option.click();
    }
  }

  async clickSearch() {
    await this.searchButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  EXISTING: Lawyer & Slot
  // ═══════════════════════════════════════════════════════════════════

  async selectLawyer(name) {
    const card = this.lawyerCard(name);
    await expect(card).toBeVisible({ timeout: 30000 });
    await card.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  async selectTimeSlot(time) {
    const slot = this.slotButton(time);
    await expect(slot).toBeVisible({ timeout: 15000 });
    await slot.click();
    await this.page.waitForTimeout(500);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  EXISTING: Payment
  // ═══════════════════════════════════════════════════════════════════

  async getRazorpayFrame() {
    const selectors = [
      'iframe[src*="razorpay"]',
      'iframe[name*="razorpay"]',
      'iframe[title*="razorpay" i]',
      'iframe[id*="razorpay"]',
      "iframe",
    ];
    for (const selector of selectors) {
      const frameLocator = this.page.frameLocator(selector).first();
      try {
        await frameLocator
          .locator("body")
          .waitFor({ state: "attached", timeout: 10000 });
        return frameLocator;
      } catch {
        continue;
      }
    }
    return this.page.frameLocator("iframe").first();
  }

  async clickBookSlot() {
    await expect(this.bookSlotButton).toBeVisible({ timeout: 15000 });
    await this.bookSlotButton.click();
    await this.page.waitForTimeout(3000);

    const razorpayFrame = await this.getRazorpayFrame();
    const paymentOptions = razorpayFrame.getByText("Payment Options");
    await expect(paymentOptions).toBeVisible({ timeout: 30000 });
  }

  async enterCardDetails(number, expiry, cvv) {
    const razorpayFrame = await this.getRazorpayFrame();

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
    await cvvInput.press("Tab");

    const addCardButton = razorpayFrame.locator(
      '[data-test-id="add-card-cta"]',
    );
    await expect(addCardButton).toBeVisible({ timeout: 10000 });
    await expect(addCardButton).toBeEnabled({ timeout: 10000 });
    await addCardButton.evaluate((btn) => btn.click());
  }

  async clickMaybeLater() {
    const razorpayFrame = await this.getRazorpayFrame();
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

  // ═══════════════════════════════════════════════════════════════════
  //  EXISTING: Consumer-side Appointments listing
  // ═══════════════════════════════════════════════════════════════════

  async navigateToAppointments() {
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

  // ═══════════════════════════════════════════════════════════════════
  //  EXISTING: La auditor Appointments module
  // ═══════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════
  //  EXISTING: Lawyer-side appointment detail verification
  // ═══════════════════════════════════════════════════════════════════

  async openAppointmentByName(clientName) {
    const row = this.appointmentRow(clientName);
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async verifyAppointmentHeading(expectedText) {
    const heading = this.appointmentHeading;
    await expect(heading).toBeVisible({ timeout: 10000 });
    if (expectedText) {
      await expect(heading).toContainText(expectedText, {
        ignoreCase: true,
      });
    }
  }

  async verifyAppointmentSubHeading(expectedText) {
    const subHeading = this.appointmentSubHeading;
    await expect(subHeading).toBeVisible({ timeout: 10000 });
    if (expectedText) {
      await expect(subHeading).toContainText(expectedText, {
        ignoreCase: true,
      });
    }
  }

  async verifyClientName(clientName) {
    const client = this.page.getByText(clientName, { exact: false }).first();
    await expect(client).toBeVisible({ timeout: 10000 });
  }

  async verifyAppointmentDateTime(dateTime) {
    const dt = this.page.getByText(dateTime, { exact: false }).first();
    await expect(dt).toBeVisible({ timeout: 10000 });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Appointments Listing – Page Verification
  // ═══════════════════════════════════════════════════════════════════

  async verifyAppointmentsPageLoaded() {
    await expect(this.page.getByText(/appointments/i).first()).toBeVisible({
      timeout: 15000,
    });
  }

  async verifyPageHeading(heading) {
    const headingEl = this.page.getByText(heading, { exact: false }).first();
    await expect(headingEl).toBeVisible({ timeout: 10000 });
  }

  async verifySubHeading(subHeading) {
    const subEl = this.page.getByText(subHeading, { exact: false }).first();
    await expect(subEl).toBeVisible({ timeout: 10000 });
  }

  async verifyTableColumns(columns) {
    for (const col of columns) {
      const header = this.columnHeader(col);
      await expect(header).toBeVisible({ timeout: 10000 });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Client Details
  // ═══════════════════════════════════════════════════════════════════

  async verifyClientAvatar(clientName) {
    const avatar = this.clientAvatar(clientName);
    await expect(avatar).toBeVisible({ timeout: 10000 });
  }

  async verifyClientNameInRow(clientName) {
    const nameEl = this.clientNameInRow(clientName);
    await expect(nameEl).toBeVisible({ timeout: 10000 });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Status
  // ═══════════════════════════════════════════════════════════════════

  async verifyStatus(clientName, status) {
    const statusEl = this.statusInRow(clientName, status);
    await expect(statusEl).toBeVisible({ timeout: 10000 });
  }

  async verifyStatusBadge(status) {
    const badge = this.statusBadge(status);
    await expect(badge).toBeVisible({ timeout: 10000 });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Mode
  // ═══════════════════════════════════════════════════════════════════

  async verifyMode(clientName, mode) {
    const modeEl = this.modeInRow(clientName, mode);
    await expect(modeEl).toBeVisible({ timeout: 10000 });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Meeting Link
  // ═══════════════════════════════════════════════════════════════════

  async clickMeetingLink(clientName) {
    const link = this.meetingLinkInRow(clientName);
    if ((await link.count()) === 0) {
      const button = this.meetingLinkButton(clientName);
      await expect(button).toBeVisible({ timeout: 10000 });
      await button.click();
    } else {
      await expect(link).toBeVisible({ timeout: 10000 });
      const [popup] = await Promise.all([
        this.page.waitForEvent("popup", { timeout: 10000 }).catch(() => null),
        link.click(),
      ]);
      if (popup) {
        await popup.waitForLoadState("domcontentloaded");
        this.meetingPopupPage = popup;
      }
    }
    await this.page.waitForTimeout(2000);
  }

  async verifyMeetingLinkActive(clientName) {
    const link = this.meetingLinkInRow(clientName);
    if ((await link.count()) > 0) {
      await expect(link).toBeVisible({ timeout: 10000 });
      const isDisabled = await link.getAttribute("aria-disabled");
      expect(isDisabled).not.toBe("true");
    }
  }

  async verifyMeetingLinkInactive(clientName) {
    const link = this.meetingLinkInRow(clientName);
    if ((await link.count()) > 0) {
      const isDisabled = await link.getAttribute("aria-disabled");
      const hasDisabledClass = await link.evaluate(
        (el) =>
          el.classList.contains("disabled") ||
          el.classList.contains("inactive") ||
          el.hasAttribute("disabled"),
      );
      expect(isDisabled === "true" || hasDisabledClass).toBeTruthy();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Payment
  // ═══════════════════════════════════════════════════════════════════

  async verifyPaymentStatus(clientName, paymentText) {
    const paymentEl = this.page
      .locator(
        "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
      )
      .filter({ hasText: clientName })
      .getByText(new RegExp(paymentText, "i"))
      .first();
    await expect(paymentEl).toBeVisible({ timeout: 10000 });
  }

  async verifyPaymentAmount(clientName, amount) {
    const amountEl = this.page
      .locator(
        "[class*='appointment'], [class*='booking'], tr, [role='row'], [role='listitem']",
      )
      .filter({ hasText: clientName })
      .getByText(new RegExp(amount, "i"))
      .first();
    await expect(amountEl).toBeVisible({ timeout: 10000 });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Search
  // ═══════════════════════════════════════════════════════════════════

  async searchClient(searchText) {
    const input = this.clientSearchInput;
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.clear();
    await input.fill(searchText);
    await this.page.waitForTimeout(1500);
    await input.press("Enter").catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  async clearClientSearch() {
    const input = this.clientSearchInput;
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.clear();
    await input.press("Enter").catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  async verifySearchResultVisible(clientName) {
    const row = this.appointmentRow(clientName);
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  async verifyNoResults() {
    const rows = this.tableRowsBody;
    const count = await rows.count();
    expect(count).toBe(0);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Sorting
  // ═══════════════════════════════════════════════════════════════════

  async clickSortColumn(column) {
    const sortBtn = this.sortButton(column);
    if ((await sortBtn.count()) > 0) {
      await sortBtn.click();
    } else {
      const header = this.columnHeader(column);
      await expect(header).toBeVisible({ timeout: 10000 });
      await header.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async getFirstRowText() {
    const firstRow = this.tableRowsBody.first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });
    return firstRow.innerText();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Three-dot Menu
  // ═══════════════════════════════════════════════════════════════════

  async clickThreeDotMenu(clientName) {
    const menuBtn = this.threeDotMenu(clientName);
    if ((await menuBtn.count()) > 0) {
      await expect(menuBtn).toBeVisible({ timeout: 10000 });
      await menuBtn.click();
    } else {
      const row = this.appointmentRow(clientName);
      await expect(row).toBeVisible({ timeout: 10000 });
      const moreBtn = row.locator("button").last();
      await moreBtn.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async clickMenuItem(option) {
    const item = this.menuItem(option);
    await expect(item).toBeVisible({ timeout: 10000 });
    await item.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Pagination
  // ═══════════════════════════════════════════════════════════════════

  async clickNextPage() {
    await expect(this.nextButton).toBeVisible({ timeout: 10000 });
    await expect(this.nextButton).toBeEnabled();
    await this.nextButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1500);
  }

  async clickPrevPage() {
    await expect(this.prevButton).toBeVisible({ timeout: 10000 });
    await expect(this.prevButton).toBeEnabled();
    await this.prevButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1500);
  }

  async verifyPrevDisabled() {
    await expect(this.prevButton).toBeVisible({ timeout: 10000 });
    const isDisabled =
      (await this.prevButton.isDisabled()) ||
      (await this.prevButton.getAttribute("aria-disabled")) === "true";
    expect(isDisabled).toBeTruthy();
  }

  async verifyNextDisabled() {
    await expect(this.nextButton).toBeVisible({ timeout: 10000 });
    const isDisabled =
      (await this.nextButton.isDisabled()) ||
      (await this.nextButton.getAttribute("aria-disabled")) === "true";
    expect(isDisabled).toBeTruthy();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Appointment History
  // ═══════════════════════════════════════════════════════════════════

  async verifyHistoryPageLoaded() {
    const title = this.page.getByText(/appointment\s*history/i).first();
    await expect(title).toBeVisible({ timeout: 15000 });
  }

  async verifyHistoryClientName(clientName) {
    const nameEl = this.page.getByText(clientName, { exact: false }).first();
    await expect(nameEl).toBeVisible({ timeout: 10000 });
  }

  async verifyHistoryAppointmentCount() {
    const cards = this.historyAppointmentCard;
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  }

  async verifyHistoryDateTime(dateText) {
    const dateEl = this.page.getByText(dateText, { exact: false }).first();
    await expect(dateEl).toBeVisible({ timeout: 10000 });
  }

  async verifyHistoryPayment(amount) {
    const amountEl = this.page.getByText(new RegExp(amount, "i")).first();
    await expect(amountEl).toBeVisible({ timeout: 10000 });
  }

  async verifyHistoryStatus(status) {
    const statusEl = this.page
      .getByText(new RegExp(`^\\s*${status}\\s*$`, "i"))
      .first();
    await expect(statusEl).toBeVisible({ timeout: 10000 });
  }

  async verifyHistoryOrdering() {
    const cards = this.historyAppointmentCard;
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  }

  async scrollHistory() {
    const container = this.page
      .locator("[class*='history'], [class*='scroll'], [class*='list']")
      .first();
    if ((await container.count()) > 0) {
      await container.evaluate((el) => el.scrollTo(0, el.scrollHeight));
      await this.page.waitForTimeout(1000);
    }
  }

  async clickAddNote() {
    await expect(this.addNoteButton).toBeVisible({ timeout: 10000 });
    await this.addNoteButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickBack() {
    if ((await this.backButton.count()) > 0) {
      await this.backButton.click();
    } else if ((await this.backArrow.count()) > 0) {
      await this.backArrow.click();
    } else {
      await this.page.goBack();
    }
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(1000);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Note CRUD
  // ═══════════════════════════════════════════════════════════════════

  async verifyNoteSectionVisible() {
    const textarea =
      (await this.noteTextarea.count()) > 0
        ? this.noteTextarea
        : this.noteTextareaAlt;
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await expect(this.noteCancelButton).toBeVisible({ timeout: 5000 });
    await expect(this.noteSaveButton).toBeVisible({ timeout: 5000 });
  }

  async verifyNotePlaceholder() {
    const placeholder = this.page.getByText(/type your note here/i).first();
    await expect(placeholder).toBeVisible({ timeout: 10000 });
  }

  async verifyCharacterCounter(expected) {
    const counter = this.page
      .getByText(new RegExp(expected.replace("/", "\\/"), "i"))
      .first();
    await expect(counter).toBeVisible({ timeout: 10000 });
  }

  async enterNote(text) {
    const textarea =
      (await this.noteTextarea.count()) > 0
        ? this.noteTextarea
        : this.noteTextareaAlt;
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await textarea.fill(text);
    await this.page.waitForTimeout(500);
  }

  async clickNoteSave() {
    await expect(this.noteSaveButton).toBeVisible({ timeout: 5000 });
    await this.noteSaveButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async clickNoteCancel() {
    await expect(this.noteCancelButton).toBeVisible({ timeout: 5000 });
    await this.noteCancelButton.click();
    await this.page.waitForTimeout(1000);
  }

  async verifyNoteSaved(noteText) {
    const noteEl = this.page.getByText(noteText, { exact: false }).first();
    await expect(noteEl).toBeVisible({ timeout: 10000 });
  }

  async verifyNoteNotPresent(noteText) {
    const noteEl = this.page.getByText(noteText, { exact: false });
    await expect(noteEl).toHaveCount(0);
  }

  async verifySpecialCharactersSaved(text) {
    const noteEl = this.page.getByText(text, { exact: false }).first();
    await expect(noteEl).toBeVisible({ timeout: 10000 });
  }

  // ═══════════════════════════════════════════════════════════════════
  //  NEW: Settlement History
  // ═══════════════════════════════════════════════════════════════════

  async verifySettlementPageLoaded() {
    const title = this.settlementPageTitle;
    await expect(title).toBeVisible({ timeout: 15000 });
  }

  async verifySettlementTransactionCount(expectedCount) {
    const countText = this.page
      .getByText(new RegExp(`${expectedCount}`, "i"))
      .first();
    await expect(countText).toBeVisible({ timeout: 10000 });
  }

  async verifyTotalPaid(expectedAmount) {
    const paidEl = this.page
      .getByText(new RegExp(expectedAmount.replace(",", "[, ]?"), "i"))
      .first();
    await expect(paidEl).toBeVisible({ timeout: 10000 });
  }

  async verifyRefunded(expectedValue) {
    const refundEl = this.page
      .getByText(new RegExp(expectedValue, "i"))
      .first();
    await expect(refundEl).toBeVisible({ timeout: 10000 });
  }

  async verifyRefundInitiated(expectedValue) {
    const refundInitEl = this.page
      .getByText(new RegExp(expectedValue, "i"))
      .first();
    await expect(refundInitEl).toBeVisible({ timeout: 10000 });
  }

  async verifyTotalTransactions(expectedCount) {
    const txnEl = this.page
      .getByText(new RegExp(`${expectedCount}`, "i"))
      .first();
    await expect(txnEl).toBeVisible({ timeout: 10000 });
  }

  async verifySettlementColumns(columns) {
    for (const col of columns) {
      const header = this.page
        .locator("table th, [role='columnheader']")
        .filter({ hasText: new RegExp(col, "i") })
        .first();
      await expect(header).toBeVisible({ timeout: 10000 });
    }
  }

  async verifySettlementClientName(clientName) {
    const row = this.settlementRow(clientName);
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  async verifySettlementAmount(amount) {
    const amountEl = this.page.getByText(new RegExp(amount, "i")).first();
    await expect(amountEl).toBeVisible({ timeout: 10000 });
  }

  async verifySettlementMethod(clientName, method) {
    const methodEl = this.page
      .locator(
        "table tbody tr, [class*='settlement'] [class*='row'], [role='row']",
      )
      .filter({ hasText: clientName })
      .getByText(new RegExp(method, "i"))
      .first();
    await expect(methodEl).toBeVisible({ timeout: 10000 });
  }

  async verifySettlementStatus(clientName, status) {
    const statusEl = this.page
      .locator(
        "table tbody tr, [class*='settlement'] [class*='row'], [role='row']",
      )
      .filter({ hasText: clientName })
      .getByText(new RegExp(`^\\s*${status}\\s*$`, "i"))
      .first();
    await expect(statusEl).toBeVisible({ timeout: 10000 });
  }

  async searchSettlement(searchText) {
    const input = this.settlementSearchInput;
    if ((await input.count()) === 0) return;
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.clear();
    await input.fill(searchText);
    await this.page.waitForTimeout(1500);
    await input.press("Enter").catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  async clearSettlementSearch() {
    const input = this.settlementSearchInput;
    if ((await input.count()) === 0) return;
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.clear();
    await input.press("Enter").catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  async verifySettlementSearchResult(clientName) {
    const row = this.settlementRow(clientName);
    await expect(row).toBeVisible({ timeout: 10000 });
  }

  async verifySettlementNoResults() {
    const rows = this.settlementTableRows;
    const count = await rows.count();
    expect(count).toBe(0);
  }

  async clickSettlementSort(column) {
    const sortBtn = this.settlementSortButton(column);
    if ((await sortBtn.count()) > 0) {
      await sortBtn.click();
    } else {
      const header = this.page
        .locator("table th, [role='columnheader']")
        .filter({ hasText: new RegExp(column, "i") })
        .first();
      await expect(header).toBeVisible({ timeout: 10000 });
      await header.click();
    }
    await this.page.waitForTimeout(1000);
  }
}

module.exports = AppointmentsPage;
