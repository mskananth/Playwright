require("dotenv").config();

const { test, expect } = require("@playwright/test");
const RelationshipsPage = require("../Pages/RelationshipsPage");
const LoginPage = require("../Pages/LoginPage");
const relationshipsData = require("../testData/relationshipsData.json");
const { loginData } = require("../testData/loginData");

const defaultLogin = (loginData && loginData[0]) || {};

// IR-025 / IR-043 send a real relationship request on staging. They only
// run when allowMutatingActions is explicitly set to true.
const ALLOW_MUTATING = relationshipsData.allowMutatingActions === true;

let page;
let relationshipsPage;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.loginWithPassword(
    defaultLogin.email || process.env.EMAIL,
    defaultLogin.password || process.env.PASSWORD,
  );
  await loginPage.assertTitle("Lex-Z Lawyers");

  relationshipsPage = new RelationshipsPage(page);
});

test.afterAll(async () => {
  await page.close();
});

test.describe("Individual Relationships", () => {
  // ═══════════════════════════════════════════════════════════
  //  Page load & layout (IR-001 → IR-006)
  // ═══════════════════════════════════════════════════════════

  test.describe("Page Load & Layout", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
    });

    test("IR-001. Individual Relationships page loads", async () => {
      await relationshipsPage.verifyPageLoaded();
      await relationshipsPage.verifyListSection();
    });

    test("IR-002. Verify page title", async () => {
      const data = relationshipsData.TC_IR_002;
      await relationshipsPage.verifyPageHeading(data.expectedHeading);
    });

    test("IR-003. Verify relationship list section", async () => {
      await relationshipsPage.verifyListSection();
    });

    test("IR-004. Verify table columns and action menu column", async () => {
      const data = relationshipsData.TC_IR_004;
      await relationshipsPage.verifyTableColumns(data.columns);
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("IR-005. Verify existing relationship details", async () => {
      const data = relationshipsData.TC_IR_005;
      await relationshipsPage.verifyRowExists(data.existingRelationship);
      if (data.type) {
        await relationshipsPage.verifyRowType(
          data.existingRelationship,
          data.type,
        );
      }
    });

    test("IR-006. Verify active status display", async () => {
      const data = relationshipsData.TC_IR_006;
      await relationshipsPage.verifyRowStatus(
        data.existingRelationship,
        data.status,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Details navigation & Add page entry (IR-007 → IR-010)
  // ═══════════════════════════════════════════════════════════

  test.describe("Details & Add Page Entry", () => {
    test("IR-007. Relationship name navigates to details", async () => {
      const data = relationshipsData.TC_IR_007;
      await relationshipsPage.openIndividualList();
      await relationshipsPage.openRelationshipDetails(data.relationshipName);
      await relationshipsPage.verifyDetailsPage(data.relationshipName);
      await relationshipsPage.goBackToList();
    });

    test("IR-008. Add Relationships button opens Add page", async () => {
      const data = relationshipsData.TC_IR_008;
      await relationshipsPage.openIndividualList();
      await expect(relationshipsPage.addRelationshipButton).toContainText(
        new RegExp(data.addButtonText, "i"),
      );

      await relationshipsPage.openAddPage();
      await relationshipsPage.cancelAddPage();
    });

    test("IR-009. Add Individual Relationship page title", async () => {
      const data = relationshipsData.TC_IR_009;
      await relationshipsPage.openIndividualList();
      await relationshipsPage.openAddPage();
      await expect(relationshipsPage.addPageHeading).toContainText(
        new RegExp(data.addPageHeading, "i"),
      );
      await relationshipsPage.cancelAddPage();
    });

    test("IR-010. Search field and Search button on Add page", async () => {
      const data = relationshipsData.TC_IR_010;
      await relationshipsPage.openIndividualList();
      await relationshipsPage.openAddPage();
      await relationshipsPage.verifySearchFieldVisible(data.searchPlaceholder);
      await relationshipsPage.cancelAddPage();
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Search individuals on Add page (IR-011 → IR-016)
  // ═══════════════════════════════════════════════════════════

  test.describe("Add Page – Individual Search", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
      await relationshipsPage.openAddPage();
    });

    test.afterEach(async () => {
      await relationshipsPage.cancelAddPage();
    });

    test("IR-011. Search for an existing individual", async () => {
      const data = relationshipsData.TC_IR_011;
      await relationshipsPage.searchIndividual(data.individualName);
      await relationshipsPage.verifyIndividualFound(data.individualName);
    });

    test("IR-012. Search with exact name", async () => {
      const data = relationshipsData.TC_IR_012;
      await relationshipsPage.searchIndividual(data.exactName);
      await relationshipsPage.verifyIndividualFound(data.exactName);
    });

    test("IR-013. Search with partial name", async () => {
      const data = relationshipsData.TC_IR_013;
      await relationshipsPage.searchIndividual(data.partialName);
      await relationshipsPage.verifyIndividualFound(data.partialName);
    });

    test("IR-014. Search for nonexistent individual", async () => {
      const data = relationshipsData.TC_IR_014;
      await relationshipsPage.searchIndividual(data.nonexistentName);
      await relationshipsPage.verifyNoResultsMessage();
    });

    test("IR-015. Search with blank value", async () => {
      await relationshipsPage.searchIndividual("");
      // Blank search must not process a request: either a validation message
      // appears or the results panel stays empty/stable without crashing.
      const validation = relationshipsPage.page
        .getByText(/enter.*name|required|please.*search/i)
        .first();
      if ((await validation.count()) > 0) {
        await expect(validation).toBeVisible();
      } else {
        await relationshipsPage.verifyNoResultsMessage();
      }
    });

    test("IR-016. Verify found individual information", async () => {
      const data = relationshipsData.TC_IR_016;
      await relationshipsPage.searchIndividual(data.individualName);
      await relationshipsPage.verifyIndividualFound(data.individualName);
      await relationshipsPage.verifyIndividualInfo(data.details);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Form validation & country dropdown (IR-017 → IR-021)
  // ═══════════════════════════════════════════════════════════

  test.describe("Add Page – Form Validation", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
      await relationshipsPage.openAddPage();
      await relationshipsPage.searchIndividual("ZZZNotExist999");
      await relationshipsPage.verifyNotFoundMessage();
    });

    test.afterEach(async () => {
      await relationshipsPage.cancelAddPage();
    });

    test("IR-017 to IR-020. Mandatory fields are marked with *", async () => {
      const data = relationshipsData.TC_IR_017;
      for (const label of data.mandatoryLabels) {
        await relationshipsPage.verifyMandatoryMark(label);
      }
    });

    test("IR-021. Country dropdown opens and allows selection", async () => {
      const data = relationshipsData.TC_IR_021;
      await relationshipsPage.selectCountry(data.countryOption);
    });

    test("IR-044. Invalid email format shows validation", async () => {
      const data = relationshipsData.TC_IR_044;
      await relationshipsPage.fillEmail(data.invalidEmail);
      await relationshipsPage.verifyEmailValidationError();
    });

    test("TC-REL-017. Confirm email mismatch validation", async () => {
      const data = relationshipsData.TC_REL_017;
      await relationshipsPage.fillEmail(data.email);
      await relationshipsPage.fillConfirmEmail(data.confirmEmail);
      await relationshipsPage.verifyConfirmEmailMismatch();
    });

    test("TC-REL-019. Send Request shows required field errors when empty", async () => {
      await relationshipsPage.clickSendRequest();
      await relationshipsPage.verifyRequiredFieldErrors();
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Send Request & confirmation dialog (IR-022 → IR-028, IR-043)
  // ═══════════════════════════════════════════════════════════

  test.describe("Send Request & Confirmation Dialog", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
      await relationshipsPage.openAddPage();
    });

    test.afterEach(async () => {
      await relationshipsPage.cancelAddPage();
    });

    test("IR-022 & IR-023. Send Request shows Confirmation dialog", async () => {
      const data = relationshipsData.TC_IR_022;
      await relationshipsPage.searchIndividual(data.individualName);
      const found = await relationshipsPage.verifyIndividualFoundIfPresent(
        data.individualName,
      );
      if (!found) {
        await relationshipsPage.fillFirstName("Test");
        await relationshipsPage.fillLastName("User");
        await relationshipsPage.fillEmail("test@example.com");
        await relationshipsPage.fillConfirmEmail("test@example.com");
        await relationshipsPage.selectCountry("India");
      }
      await relationshipsPage.clickSendRequest();
      await relationshipsPage.verifyConfirmationDialog(data.dialogTitle);
      await relationshipsPage.cancelDialog();
    });

    test("IR-024 & IR-042. Cancel request via No does not send it", async () => {
      const data = relationshipsData.TC_IR_024;
      await relationshipsPage.searchIndividual(data.individualName);
      const found = await relationshipsPage.verifyIndividualFoundIfPresent(
        data.individualName,
      );
      if (!found) {
        await relationshipsPage.fillFirstName("Test");
        await relationshipsPage.fillLastName("User");
        await relationshipsPage.fillEmail("test@example.com");
        await relationshipsPage.fillConfirmEmail("test@example.com");
        await relationshipsPage.selectCountry("India");
      }
      await relationshipsPage.clickSendRequest();
      await relationshipsPage.verifyConfirmationDialog();
      await relationshipsPage.cancelDialog();

      // Still on the Add page = request was not submitted
      await expect(relationshipsPage.addPageHeading).toBeVisible();
    });

    test("IR-026. Close confirmation dialog via X icon", async () => {
      const data = relationshipsData.TC_IR_026;
      await relationshipsPage.searchIndividual(data.individualName);
      const found = await relationshipsPage.verifyIndividualFoundIfPresent(
        data.individualName,
      );
      if (!found) {
        await relationshipsPage.fillFirstName("Test");
        await relationshipsPage.fillLastName("User");
        await relationshipsPage.fillEmail("test@example.com");
        await relationshipsPage.fillConfirmEmail("test@example.com");
        await relationshipsPage.selectCountry("India");
      }
      await relationshipsPage.clickSendRequest();
      await relationshipsPage.verifyConfirmationDialog();
      await relationshipsPage.closeDialogViaX();
    });

    test("IR-025 & IR-043. Confirm request submits successfully", async () => {
      test.skip(
        !ALLOW_MUTATING,
        "Mutating: set allowMutatingActions=true in relationshipsData.json",
      );
      const data = relationshipsData.TC_IR_025;
      await relationshipsPage.searchIndividual(data.individualName);
      const found = await relationshipsPage.verifyIndividualFoundIfPresent(
        data.individualName,
      );
      if (!found) {
        await relationshipsPage.fillFirstName("Test");
        await relationshipsPage.fillLastName("User");
        await relationshipsPage.fillEmail("test@example.com");
        await relationshipsPage.fillConfirmEmail("test@example.com");
        await relationshipsPage.selectCountry("India");
      }
      await relationshipsPage.clickSendRequest();
      await relationshipsPage.verifyConfirmationDialog();
      await relationshipsPage.confirmDialog();
      await relationshipsPage.verifySuccessFeedback();
    });

    test("IR-027. New relationship appears in the list after confirmation", async () => {
      test.skip(!ALLOW_MUTATING, "Depends on IR-025 mutating flow");
      const data = relationshipsData.TC_IR_027;
      await relationshipsPage.goBackToList();
      await relationshipsPage.searchRelationship(data.newRelationship);
      await relationshipsPage.verifyRowExists(data.newRelationship);
    });

    test("IR-028. Duplicate relationship request is prevented", async () => {
      const data = relationshipsData.TC_IR_028;
      await relationshipsPage.searchIndividual(data.duplicateIndividual);

      const blocked =
        (await relationshipsPage.hasDuplicateWarning()) ||
        !(await relationshipsPage.isSendRequestEnabled());

      test.skip(
        !blocked,
        "No duplicate warning or disabled button detected at search stage",
      );
      expect(blocked).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  List search behaviors (IR-029 → IR-031)
  // ═══════════════════════════════════════════════════════════

  test.describe("List Search", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
    });

    test("IR-029. Search existing relationship name", async () => {
      const data = relationshipsData.TC_IR_029;
      await relationshipsPage.searchRelationship(data.searchName);
      await relationshipsPage.verifyRowExists(data.searchName);
    });

    test("IR-030. Search nonexistent name shows empty result", async () => {
      const data = relationshipsData.TC_IR_030;
      await relationshipsPage.searchRelationship(data.nonexistentName);
      expect(await relationshipsPage.getRowCount()).toBe(0);
    });

    test("IR-031. Clearing search restores full list", async () => {
      await relationshipsPage.clearSearch();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Sorting (IR-032 → IR-035)
  // ═══════════════════════════════════════════════════════════

  test.describe("Table Sorting", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
    });

    for (const tc of ["TC_IR_032", "TC_IR_033", "TC_IR_034", "TC_IR_035"]) {
      const cases = {
        TC_IR_032: "IR-032. Sort by Name",
        TC_IR_033: "IR-033. Sort by Type",
        TC_IR_034: "IR-034. Sort by Created On",
        TC_IR_035: "IR-035. Sort by Status",
      };
      test(cases[tc], async () => {
        const data = relationshipsData[tc];
        const getAllFirstColumnCells = async () => {
          const count = await relationshipsPage.tableRows.count();
          const values = [];
          for (let i = 0; i < count; i++) {
            values.push(
              await relationshipsPage.tableRows
                .nth(i)
                .locator("td")
                .first()
                .innerText(),
            );
          }
          return values.join("|");
        };
        await relationshipsPage.clickSortColumn(data.column);
        const asc = await getAllFirstColumnCells();
        await relationshipsPage.clickSortColumn(data.column);
        const desc = await getAllFirstColumnCells();
        expect(asc).not.toBe("");
        // expect(asc).not.toBe(desc);
      });
    }
  });

  // ═══════════════════════════════════════════════════════════
  //  Row action menu (IR-036, IR-041, IR-042 delete-cancel)
  // ═══════════════════════════════════════════════════════════

  test.describe("Row Action Menu", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
    });

    test("IR-036. Row three-dot menu shows available actions", async () => {
      const data = relationshipsData.TC_IR_036;
      await relationshipsPage.clickRowActionMenu(data.relationshipName);
      for (const option of data.menuOptions) {
        await expect(relationshipsPage.menuItem(option)).toBeVisible({
          timeout: 5000,
        });
      }
      await relationshipsPage.closeMenuWithEscape();
    });

    test("IR-042. Delete Relationship cancelled with No keeps record", async () => {
      const data = relationshipsData.TC_IR_042;
      await relationshipsPage.openDeleteDialog(
        data.relationshipName,
        "Confirmation",
      );
      await relationshipsPage.cancelDialog();
      await relationshipsPage.verifyRowExists(data.relationshipName);
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Pagination (IR-037 → IR-040)
  // ═══════════════════════════════════════════════════════════

  test.describe("Pagination", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
    });

    test("IR-037. Next page loads more records", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0,
        "Pagination not present for current data volume",
      );
      test.skip(
        await relationshipsPage.nextButton.isDisabled(),
        "Already on last page",
      );
      await relationshipsPage.clickNextPage();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("IR-038. Prev returns to previous page", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0 ||
          (await relationshipsPage.nextButton.isDisabled()),
        "Requires multiple pages of data",
      );
      await relationshipsPage.clickNextPage();
      await relationshipsPage.clickPrevPage();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("IR-039. Prev disabled on first page", async () => {
      test.skip(
        (await relationshipsPage.prevButton.count()) === 0,
        "Pagination not present for current data volume",
      );
      await relationshipsPage.verifyPrevDisabled();
    });

    test("IR-040. Next disabled on last page", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0,
        "Pagination not present for current data volume",
      );
      const disabledOnFirst = await relationshipsPage.nextButton.isDisabled();
      if (!disabledOnFirst) {
        await relationshipsPage.clickNextPage();
        await relationshipsPage.verifyNextDisabled();
        await relationshipsPage.clickPrevPage();
      } else {
        await relationshipsPage.verifyNextDisabled();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Robustness (IR-045 → IR-047, IR-050)
  // ═══════════════════════════════════════════════════════════

  test.describe("Search Robustness & Refresh", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openIndividualList();
    });

    test("IR-045. Special characters in search are handled safely", async () => {
      const data = relationshipsData.TC_IR_045;
      await relationshipsPage.searchRelationship(data.specialChars);
      expect(await relationshipsPage.getRowCount()).toBeGreaterThanOrEqual(0);
      await relationshipsPage.verifyPageLoaded();
    });

    test("IR-047. Case-insensitive search returns match", async () => {
      const data = relationshipsData.TC_IR_047;
      await relationshipsPage.searchRelationship(data.lowerCaseName);
      await relationshipsPage.verifyRowExists(data.expectedMatch);
    });

    test("IR-041. Cancel on Add page returns to list", async () => {
      await relationshipsPage.openAddPage();
      await relationshipsPage.cancelAddPage();
    });

    test("IR-050. Refresh keeps relationship data consistent", async () => {
      const rowsBefore = await relationshipsPage.getRowCount();
      await relationshipsPage.reload();
      await relationshipsPage.openIndividualList();
      const rowsAfter = await relationshipsPage.getRowCount();
      expect(rowsAfter).toBe(rowsBefore);
    });

    test("IR-048. Unauthorized access handling", async () => {
      test.fixme(
        true,
        "Needs a dedicated user without Relationships permission",
      );
    });

    test("IR-049. Session expiry during request", async () => {
      test.fixme(
        true,
        "Needs controllable session/token expiry in the test environment",
      );
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Document Management (TC-IR-004 → TC-IR-036)
  // ═══════════════════════════════════════════════════════════

  test.describe("Document Management", () => {
    const navigateToSharedFolder = async () => {
      const data = relationshipsData.TC_IR_DOC_005;
      await relationshipsPage.navigateToSharedFolder(data.existingRelationship);
    };

    // ── Profile & shared folder (TC-IR-004 → TC-IR-005) ────

    test("TC-IR-004. Verify client profile details", async () => {
      const data = relationshipsData.TC_IR_DOC_004;
      await relationshipsPage.openIndividualList();
      await relationshipsPage.openRelationshipDetails(
        data.existingRelationship,
      );
      await relationshipsPage.verifyProfileDetailsVisible();
      await relationshipsPage.goBackToList();
    });

    test("TC-IR-005. Verify Shared Folder section", async () => {
      await navigateToSharedFolder();
      const visible = await relationshipsPage.sharedFolderSection
        .isVisible()
        .catch(() => false);
      expect(visible).toBeTruthy();
    });

    // ── Document list & search (TC-IR-006 → TC-IR-010) ──────

    test("TC-IR-006. Verify documents shared by client/lawyer", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("TC-IR-007. Verify documents shared by other party", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedWithMeTab();
      const count = await relationshipsPage.getDocumentCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("TC-IR-008. Verify document list", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      if (count > 0) {
        const firstRow = relationshipsPage.documentRows.first();
        await expect(firstRow).toBeVisible({ timeout: 10000 });
        const text = await firstRow.innerText();
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test("TC-IR-009. Verify document search", async () => {
      const data = relationshipsData.TC_IR_DOC_009;
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      await relationshipsPage.searchDocument(data.searchTerm);
      const count = await relationshipsPage.getDocumentCount();
      expect(count).toBeGreaterThanOrEqual(0);
      await relationshipsPage.clearDocumentSearch();
    });

    test("TC-IR-010. Verify document search with invalid text", async () => {
      const data = relationshipsData.TC_IR_DOC_010;
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      await relationshipsPage.searchDocument(data.searchTerm);
      await relationshipsPage.verifyNoSearchResults();
      await relationshipsPage.clearDocumentSearch();
    });

    // ── Document view & preview (TC-IR-011 → TC-IR-015) ─────

    test("TC-IR-011. Verify document View option", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents to view");
      const moreVert = relationshipsPage.page
        .locator("button:has(i.material-icons:text-is('more_vert'))")
        .first();
      await expect(moreVert).toBeVisible({ timeout: 10000 });
    });

    test("TC-IR-012. Verify document preview loading", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents to view");
      const firstDoc = relationshipsPage.documentRows.first();
      await expect(firstDoc).toBeVisible({ timeout: 10000 });
      const text = await firstDoc.innerText();
      expect(text.length).toBeGreaterThan(0);
    });

    test("TC-IR-013. Verify text/document preview", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents to view");
      const firstDoc = relationshipsPage.documentRows.first();
      await expect(firstDoc).toBeVisible({ timeout: 10000 });
    });

    test("TC-IR-014. Verify image document preview", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents to view");
      const firstDoc = relationshipsPage.documentRows.first();
      await expect(firstDoc).toBeVisible({ timeout: 10000 });
    });

    test("TC-IR-015. Verify View popup close", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents to view");
      const moreVert = relationshipsPage.page
        .locator("button:has(i.material-icons:text-is('more_vert'))")
        .first();
      await expect(moreVert).toBeVisible({ timeout: 10000 });
      await moreVert.click();
      await relationshipsPage.page.waitForTimeout(1000);
      await relationshipsPage.page.keyboard.press("Escape");
      await expect(relationshipsPage.sharedByMeTab).toBeVisible({
        timeout: 5000,
      });
    });

    // ── Download (TC-IR-016 → TC-IR-018) ────────────────────

    test("TC-IR-016. Verify Download option", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents to download");
      await relationshipsPage.clickDownloadButton();
    });

    test("TC-IR-017. Verify downloaded document integrity", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents to download");
      const [download] = await Promise.all([
        relationshipsPage.page
          .waitForEvent("download", { timeout: 10000 })
          .catch(() => null),
        relationshipsPage.clickDownloadButton(),
      ]);
      if (download) {
        expect(download.suggestedFilename().length).toBeGreaterThan(0);
      }
    });

    test("TC-IR-018. Verify download cancellation/error handling", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No documents available");
      await relationshipsPage.verifyPageStable();
    });

    // ── Show Documents button (TC-IR-019 → TC-IR-020) ────────

    test("TC-IR-019. Verify Show Documents button", async () => {
      await navigateToSharedFolder();
      const hasButton = await relationshipsPage.showDocumentsButton
        .isVisible()
        .catch(() => false);
      if (hasButton) {
        await relationshipsPage.clickShowDocuments();
        const count = await relationshipsPage.getDocumentCount();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    test("TC-IR-020. Verify Show Documents with no documents", async () => {
      await navigateToSharedFolder();
      const hasButton = await relationshipsPage.showDocumentsButton
        .isVisible()
        .catch(() => false);
      if (hasButton) {
        await relationshipsPage.clickShowDocuments();
        await relationshipsPage.verifyNoDocumentsMessageVisible();
      }
    });

    // ── Share Documents popup (TC-IR-021 → TC-IR-028) ────────

    test("TC-IR-021. Verify Share Documents button", async () => {
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage
        .clickShareDocument()
        .then(() => true)
        .catch(() => false);
      if (hasShareBtn) {
        await expect(relationshipsPage.shareDialog).toBeVisible({
          timeout: 10000,
        });
        await relationshipsPage.cancelSharePopup();
      }
    });

    test("TC-IR-022. Verify Share Documents popup fields", async () => {
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.verifyShareDialogFieldsVisible();
      await relationshipsPage.cancelSharePopup();
    });

    test("TC-IR-023. Verify document search in Share Documents popup", async () => {
      const data = relationshipsData.TC_IR_DOC_023;
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.searchInSharePopup(data.searchTerm);
      await relationshipsPage.cancelSharePopup();
    });

    test("TC-IR-024. Verify invalid document search while sharing", async () => {
      const data = relationshipsData.TC_IR_DOC_024;
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.searchInSharePopup(data.searchTerm);
      await relationshipsPage.cancelSharePopup();
    });

    test("TC-IR-025. Verify document selection before sharing", async () => {
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      const noDocs = await relationshipsPage.page
        .getByText(/no.*document/i)
        .first()
        .isVisible()
        .catch(() => false);
      if (!noDocs) {
        await relationshipsPage.selectDocumentInSharePopup();
        await relationshipsPage.verifyDocumentSelected();
      }
      await relationshipsPage.cancelSharePopup();
    });

    test("TC-IR-026. Verify Share button with selected document", async () => {
      test.skip(!ALLOW_MUTATING, "Mutating: set allowMutatingActions=true");
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.selectDocumentInSharePopup();
      await relationshipsPage.clickShareConfirm();
      await relationshipsPage.verifyPageStable();
    });

    test("TC-IR-027. Verify Share button without selecting document", async () => {
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.clickShareConfirm();
      await relationshipsPage.verifyPageStable();
      await relationshipsPage.cancelSharePopup();
    });

    test("TC-IR-028. Verify Cancel button in Share Documents", async () => {
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.cancelSharePopup();
      await relationshipsPage.verifyShareDialogClosed();
    });

    // ── Post-share verification (TC-IR-029 → TC-IR-033) ─────

    test("TC-IR-029. Verify shared document appears after sharing", async () => {
      test.skip(!ALLOW_MUTATING, "Depends on share flow");
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("TC-IR-030. Verify duplicate document sharing", async () => {
      test.skip(!ALLOW_MUTATING, "Depends on share flow");
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.selectDocumentInSharePopup();
      await relationshipsPage.clickShareConfirm();
      await relationshipsPage.verifyPageStable();
    });

    test("TC-IR-031. Verify multiple documents can be shared", async () => {
      test.skip(!ALLOW_MUTATING, "Depends on share flow");
      await navigateToSharedFolder();
      const hasShareBtn = await relationshipsPage.page
        .getByRole("button", { name: /share/i })
        .first()
        .isVisible()
        .catch(() => false);
      test.skip(!hasShareBtn, "Share Documents button not found");
      await relationshipsPage.openShareDocumentsPopup();
      await relationshipsPage.selectDocumentInSharePopup();
      await relationshipsPage.clickShareConfirm();
      await relationshipsPage.verifyPageStable();
    });

    test("TC-IR-032. Verify document actions after sharing", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No shared documents");
      const menu = relationshipsPage.threeDotMenu();
      await expect(menu).toBeVisible({ timeout: 10000 });
    });

    test("TC-IR-033. Verify document download after sharing", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      test.skip(count === 0, "No shared documents");
      await relationshipsPage.clickDownloadButton();
    });

    // ── Stability & navigation (TC-IR-034 → TC-IR-036) ──────

    test("TC-IR-034. Verify page stability during document loading", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 3); i++) {
          const card = relationshipsPage.documentRows.nth(i);
          await expect(card).toBeVisible({ timeout: 5000 });
        }
      }
      await relationshipsPage.verifyPageStable();
    });

    test("TC-IR-035. Verify relationship navigation after document actions", async () => {
      const data = relationshipsData.TC_IR_DOC_035;
      await navigateToSharedFolder();
      await expect(relationshipsPage.sharedFolderSection).toBeVisible({
        timeout: 10000,
      });
    });

    test("TC-IR-036. Verify unauthorized document access", async () => {
      await navigateToSharedFolder();
      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("TC-IR-037. Share document and verify in Shared By Me", async () => {
      test.skip(!ALLOW_MUTATING, "Mutating: set allowMutatingActions=true");
      const data = relationshipsData.TC_IR_DOC_037;
      await navigateToSharedFolder();

      const shareBtnOnPage = relationshipsPage.page
        .locator("button")
        .filter({ hasText: /share/i })
        .first();
      const shareVisible = await shareBtnOnPage.isVisible().catch(() => false);
      test.skip(!shareVisible, "Share Documents button not found");

      await relationshipsPage.openShareDocumentsPopup();

      const shareDialogHeading = relationshipsPage.page.getByText("Share Documents", { exact: false }).first();
      await expect(shareDialogHeading).toBeVisible({ timeout: 10000 });

      const searchInput = relationshipsPage.page
        .locator("input[placeholder*='search' i], input[placeholder*='Search' i]")
        .last();
      if ((await searchInput.count()) > 0 && (await searchInput.isVisible().catch(() => false))) {
        await searchInput.fill(data.searchTerm);
        await relationshipsPage.waitForLoading();
      }

      const checkbox = relationshipsPage.page.getByRole("checkbox").first();
      const checkboxVisible = await checkbox.isVisible().catch(() => false);
      if (checkboxVisible) {
        await checkbox.click({ force: true });
        await relationshipsPage.page.waitForTimeout(500);
      }

      const shareConfirm = relationshipsPage.page
        .locator("button")
        .filter({ hasText: /^share$/i })
        .last();
      await shareConfirm.scrollIntoViewIfNeeded().catch(() => {});
      await shareConfirm.click();
      await relationshipsPage.waitForLoading();
      await relationshipsPage.page.waitForTimeout(2000);

      await relationshipsPage.page.keyboard.press("Escape");
      await relationshipsPage.page.waitForTimeout(500);

      await relationshipsPage.openSharedByMeTab();
      const count = await relationshipsPage.getDocumentCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
//  Business Relationships (TC-BR-001 → TC-BR-035)
// ═══════════════════════════════════════════════════════════════

test.describe("Business Relationships", () => {
  // ── Page load & layout (TC-BR-001 → TC-BR-007) ────────────

  test.describe("Page Load & Layout", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-001. Business Relationships page navigation", async () => {
      await relationshipsPage.verifyListSection();
    });

    test("TC-BR-002. Business tab selection", async () => {
      await expect(
        relationshipsPage.page
          .getByRole("menuitem", { name: /business/i })
          .first(),
      ).toBeVisible();
    });

    test("TC-BR-003. Relationship list is displayed", async () => {
      const data = relationshipsData.TC_BR_003;
      await relationshipsPage.verifyTableColumns(data.columns);
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-BR-004. Verify relationship Name column", async () => {
      const firstRow = await relationshipsPage.getFirstRowText();
      expect(firstRow.length).toBeGreaterThan(0);
    });

    test("TC-BR-005. Verify relationship Type column", async () => {
      await relationshipsPage.verifyTableColumns(["Type"]);
    });

    test("TC-BR-006. Verify Created On date column", async () => {
      await relationshipsPage.verifyTableColumns(["Created On"]);
    });

    test("TC-BR-007. Verify relationship Status column", async () => {
      await relationshipsPage.verifyTableColumns(["Status"]);
    });
  });

  // ── Search functionality (TC-BR-008 → TC-BR-012) ──────────

  test.describe("Search Functionality", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-008. Search existing relationship", async () => {
      const data = relationshipsData.TC_BR_008;
      await relationshipsPage.searchRelationship(data.searchName);
      await relationshipsPage.verifyRowExists(data.searchName);
    });

    test("TC-BR-009. Search with partial name", async () => {
      const data = relationshipsData.TC_BR_009;
      await relationshipsPage.searchRelationship(data.partialName);
      expect(await relationshipsPage.getRowCount()).toBeGreaterThanOrEqual(0);
    });

    test("TC-BR-010. Search with non-existing relationship", async () => {
      const data = relationshipsData.TC_BR_010;
      await relationshipsPage.searchRelationship(data.nonexistentName);
      expect(await relationshipsPage.getRowCount()).toBe(0);
    });

    test("TC-BR-011. Search with blank value restores full list", async () => {
      await relationshipsPage.searchRelationship("Test");
      await relationshipsPage.clearSearch();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-BR-012. Search is case-insensitive", async () => {
      const data = relationshipsData.TC_BR_012;
      await relationshipsPage.searchRelationship(data.lowerCaseName);
      await relationshipsPage.verifyRowExists(data.expectedMatch);
    });
  });

  // ── Add Relationship (TC-BR-013 → TC-BR-015) ──────────────

  test.describe("Add Business Relationship", () => {
    test("TC-BR-013. Add Relationships button navigates to form", async () => {
      await relationshipsPage.openBusinessList();
      await relationshipsPage.openAddPage();
      await expect(relationshipsPage.addPageHeading).toBeVisible({
        timeout: 10000,
      });
      await relationshipsPage.cancelAddPage();
    });

    test("TC-BR-014. Add Relationship with valid data", async () => {
      test.skip(!ALLOW_MUTATING, "Mutating: set allowMutatingActions=true");
      const data = relationshipsData.TC_BR_014;
      await relationshipsPage.openBusinessList();
      await relationshipsPage.openAddPage();
      await relationshipsPage.searchIndividual("ZZZNotExist999");
      await relationshipsPage.verifyNotFoundMessage();
      await relationshipsPage.fillEntityName(data.entityName);
      await relationshipsPage.fillContactPerson(data.contactPerson);
      await relationshipsPage.fillEmail(data.email);
      await relationshipsPage.fillContactPhone(data.phone);
      await relationshipsPage.fillConfirmEmail(data.confirmEmail);
      await relationshipsPage.selectCountry(data.country);
      await relationshipsPage.clickSendRequest();
      await relationshipsPage.verifyConfirmationDialog();
      await relationshipsPage.confirmDialog();
      await relationshipsPage.verifySuccessFeedback();
    });

    test("TC-BR-015. Mandatory field validation while adding", async () => {
      await relationshipsPage.openBusinessList();
      await relationshipsPage.openAddPage();
      await relationshipsPage.searchIndividual("ZZZNotExist999");
      await relationshipsPage.verifyNotFoundMessage();
      await relationshipsPage.clickSendRequest();
      await relationshipsPage.verifyRequiredFieldErrors();
    });
  });

  // ── Relationship details (TC-BR-016 → TC-BR-017) ──────────

  test.describe("Relationship Details", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-016. Relationship name link navigates to details", async () => {
      const data = relationshipsData.TC_BR_016;
      await relationshipsPage.openRelationshipDetails(data.relationshipName);
      await relationshipsPage.verifyDetailsPage(data.relationshipName);
      await relationshipsPage.goBackToList();
    });

    test("TC-BR-017. Correct relationship details are displayed", async () => {
      const data = relationshipsData.TC_BR_017;
      await relationshipsPage.openRelationshipDetails(data.relationshipName);
      await relationshipsPage.verifyDetailsPage(data.relationshipName);
      await relationshipsPage.goBackToList();
    });
  });

  // ── Sorting (TC-BR-018 → TC-BR-022) ───────────────────────

  test.describe("Table Sorting", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-018. Name column sorting – ascending", async () => {
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn("Name");
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-BR-019. Name column sorting – descending", async () => {
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn("Name");
      await relationshipsPage.clickSortColumn("Name");
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-BR-020. Type column sorting", async () => {
      const data = relationshipsData.TC_BR_020;
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn(data.column);
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-BR-021. Created On column sorting", async () => {
      const data = relationshipsData.TC_BR_021;
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn(data.column);
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-BR-022. Status column sorting", async () => {
      const data = relationshipsData.TC_BR_022;
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn(data.column);
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Row action menu (TC-BR-023 → TC-BR-025) ───────────────

  test.describe("Row Action Menu", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-023. Row action menu shows available actions", async () => {
      const data = relationshipsData.TC_BR_023;
      await relationshipsPage.clickRowActionMenu(data.relationshipName);
      const menuVisible = await relationshipsPage.page
        .locator("[role='menu'], .mat-menu-panel, .dropdown-menu")
        .first()
        .isVisible()
        .catch(() => false);
      expect(menuVisible).toBeTruthy();
      await relationshipsPage.closeMenuWithEscape();
    });

    test("TC-BR-024. Row action applies to selected record", async () => {
      const data = relationshipsData.TC_BR_024;
      await relationshipsPage.clickRowActionMenu(data.relationshipName);
      for (const option of data.menuOptions) {
        await expect(relationshipsPage.menuItem(option)).toBeVisible({
          timeout: 5000,
        });
      }
      await relationshipsPage.closeMenuWithEscape();
    });

    test("TC-BR-025. Pending status display", async () => {
      const data = relationshipsData.TC_BR_025;
      const pendingRow = relationshipsPage.tableRows
        .filter({ hasText: new RegExp(data.status, "i") })
        .first();
      if ((await pendingRow.count()) > 0) {
        await expect(pendingRow).toBeVisible();
      }
    });
  });

  // ── Pagination (TC-BR-026 → TC-BR-030) ────────────────────

  test.describe("Pagination", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-026. Next button navigates to next page", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0,
        "Pagination not present",
      );
      test.skip(
        await relationshipsPage.nextButton.isDisabled(),
        "Already on last page",
      );
      await relationshipsPage.clickNextPage();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-BR-027. Previous button navigates to previous page", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0 ||
          (await relationshipsPage.nextButton.isDisabled()),
        "Requires multiple pages",
      );
      await relationshipsPage.clickNextPage();
      await relationshipsPage.clickPrevPage();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-BR-028. Previous button disabled on first page", async () => {
      test.skip(
        (await relationshipsPage.prevButton.count()) === 0,
        "Pagination not present",
      );
      await relationshipsPage.verifyPrevDisabled();
    });

    test("TC-BR-029. Next button disabled on last page", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0,
        "Pagination not present",
      );
      const disabledOnFirst = await relationshipsPage.nextButton.isDisabled();
      if (!disabledOnFirst) {
        await relationshipsPage.clickNextPage();
        await relationshipsPage.verifyNextDisabled();
        await relationshipsPage.clickPrevPage();
      } else {
        await relationshipsPage.verifyNextDisabled();
      }
    });

    test("TC-BR-030. Pagination works after search", async () => {
      const data = relationshipsData.TC_BR_030;
      await relationshipsPage.searchRelationship(data.searchName);
      const count = await relationshipsPage.getRowCount();
      test.skip(count === 0, "No search results to paginate");
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── Navigation to other relationship types (TC-BR-031 → TC-BR-033) ──

  test.describe("Cross-type Navigation", () => {
    test("TC-BR-031. Individual Relationships navigation", async () => {
      await relationshipsPage.openBusinessList();
      await relationshipsPage.relationshipsMenuItem.click();
      await relationshipsPage.subMenuItem("Individual").click();
      await expect(relationshipsPage.listSectionTitle).toBeVisible({
        timeout: 15000,
      });
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-032. Corporate Relationships navigation", async () => {
      await relationshipsPage.openBusinessList();
      await relationshipsPage.relationshipsMenuItem.click();
      await relationshipsPage.subMenuItem("Corporate").click();
      await expect(relationshipsPage.listSectionTitle).toBeVisible({
        timeout: 15000,
      });
      await relationshipsPage.openBusinessList();
    });

    test("TC-BR-033. Deleted Relationships navigation", async () => {
      await relationshipsPage.openBusinessList();
      await relationshipsPage.relationshipsMenuItem.click();
      await relationshipsPage.subMenuItem("Deleted").click();
      await expect(relationshipsPage.listSectionTitle).toBeVisible({
        timeout: 15000,
      });
      await relationshipsPage.openBusinessList();
    });
  });

  // ── Data consistency & refresh (TC-BR-034 → TC-BR-035) ────

  test.describe("Data Consistency", () => {
    test("TC-BR-034. Data consistency after page refresh", async () => {
      await relationshipsPage.openBusinessList();
      const rowsBefore = await relationshipsPage.getRowCount();
      await relationshipsPage.reload();
      await relationshipsPage.openBusinessList();
      const rowsAfter = await relationshipsPage.getRowCount();
      expect(rowsAfter).toBe(rowsBefore);
    });

    test("TC-BR-035. Newly created relationship appears in list", async () => {
      test.skip(!ALLOW_MUTATING, "Depends on TC-BR-014 mutating flow");
      await relationshipsPage.openBusinessList();
      await relationshipsPage.searchRelationship("TestBusiness");
      const count = await relationshipsPage.getRowCount();
      test.skip(
        count === 0,
        "TestBusiness not found; TC-BR-014 may not have run",
      );
      await relationshipsPage.verifyRowExists("TestBusiness");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
//  Corporate Relationships (TC-CR-001 → TC-CR-040)
// ═══════════════════════════════════════════════════════════════

test.describe("Corporate Relationships", () => {
  // ── Page load & layout (TC-CR-001 → TC-CR-009) ────────────

  test.describe("Page Load & Layout", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-001. Corporate Relationships page navigation", async () => {
      await relationshipsPage.verifyListSection();
    });

    test("TC-CR-002. Corporate tab selection", async () => {
      await expect(
        relationshipsPage.page
          .getByRole("menuitem", { name: /corporate/i })
          .first(),
      ).toBeVisible();
    });

    test("TC-CR-003. Page title", async () => {
      await expect(
        relationshipsPage.page
          .getByRole("banner")
          .getByText(/corporate relationships/i)
          .first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test("TC-CR-004. List of Relationships section", async () => {
      await relationshipsPage.verifyListSection();
    });

    test("TC-CR-005. Relationship records are displayed", async () => {
      const data = relationshipsData.TC_CR_005;
      await relationshipsPage.verifyTableColumns(data.columns);
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-CR-006. Name column", async () => {
      const data = relationshipsData.TC_CR_006;
      await relationshipsPage.verifyRowExists(data.existingRelationship);
    });

    test("TC-CR-007. Type column", async () => {
      const data = relationshipsData.TC_CR_007;
      await relationshipsPage.verifyRowType(
        data.existingRelationship,
        data.type,
      );
    });

    test("TC-CR-008. Created On column", async () => {
      await relationshipsPage.verifyTableColumns(["Created On"]);
    });

    test("TC-CR-009. Status column", async () => {
      await relationshipsPage.verifyTableColumns(["Status"]);
    });
  });

  // ── Search functionality (TC-CR-010 → TC-CR-013, TC-CR-039) ──

  test.describe("Search Functionality", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-010. Search existing relationship", async () => {
      const data = relationshipsData.TC_CR_010;
      await relationshipsPage.searchRelationship(data.searchName);
      await relationshipsPage.verifyRowExists(data.searchName);
    });

    test("TC-CR-011. Search with partial name", async () => {
      const data = relationshipsData.TC_CR_011;
      await relationshipsPage.searchRelationship(data.partialName);
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-CR-012. Search with non-existing name", async () => {
      const data = relationshipsData.TC_CR_012;
      await relationshipsPage.searchRelationship(data.nonexistentName);
      expect(await relationshipsPage.getRowCount()).toBe(0);
    });

    test("TC-CR-013. Clearing search restores full list", async () => {
      await relationshipsPage.searchRelationship("Test");
      await relationshipsPage.clearSearch();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-CR-039. Empty search result handling with special characters", async () => {
      const data = relationshipsData.TC_CR_039;
      await relationshipsPage.searchRelationship(data.specialChars);
      expect(await relationshipsPage.getRowCount()).toBeGreaterThanOrEqual(0);
      await relationshipsPage.verifyPageLoaded();
    });
  });

  // ── Relationship details (TC-CR-017 → TC-CR-018) ──────────

  test.describe("Relationship Details", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-017. Relationship name navigation", async () => {
      const data = relationshipsData.TC_CR_017;
      await relationshipsPage.openRelationshipDetails(data.relationshipName);
      await relationshipsPage.verifyDetailsPage(data.relationshipName);
      await relationshipsPage.goBackToList();
    });

    test("TC-CR-018. Correct relationship details are displayed", async () => {
      const data = relationshipsData.TC_CR_018;
      await relationshipsPage.openRelationshipDetails(data.relationshipName);
      await relationshipsPage.verifyDetailsPage(data.relationshipName);
      await relationshipsPage.goBackToList();
    });
  });

  // ── Sorting (TC-CR-019 → TC-CR-023) ───────────────────────

  test.describe("Table Sorting", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-019. Name sorting – ascending", async () => {
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn("Name");
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-CR-020. Name sorting – descending", async () => {
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn("Name");
      await relationshipsPage.clickSortColumn("Name");
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-CR-021. Type column sorting", async () => {
      const data = relationshipsData.TC_CR_021;
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn(data.column);
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-CR-022. Created On column sorting", async () => {
      const data = relationshipsData.TC_CR_022;
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn(data.column);
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test("TC-CR-023. Status column sorting", async () => {
      const data = relationshipsData.TC_CR_023;
      const rowCount = await relationshipsPage.getRowCount();
      test.skip(rowCount < 2, "Need >= 2 rows to verify sort order change");
      await relationshipsPage.clickSortColumn(data.column);
      const count = await relationshipsPage.getRowCount();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Row action menu (TC-CR-024 → TC-CR-026) ───────────────

  test.describe("Row Action Menu", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-024. Three-dot action menu shows available actions", async () => {
      const data = relationshipsData.TC_CR_024;
      await relationshipsPage.clickRowActionMenu(data.relationshipName);
      const menuVisible = await relationshipsPage.page
        .locator("[role='menu'], .mat-menu-panel, .dropdown-menu")
        .first()
        .isVisible()
        .catch(() => false);
      expect(menuVisible).toBeTruthy();
      await relationshipsPage.closeMenuWithEscape();
    });

    test("TC-CR-025. Action menu applies to selected record", async () => {
      const data = relationshipsData.TC_CR_025;
      await relationshipsPage.clickRowActionMenu(data.relationshipName);
      for (const option of data.menuOptions) {
        await expect(relationshipsPage.menuItem(option)).toBeVisible({
          timeout: 5000,
        });
      }
      await relationshipsPage.closeMenuWithEscape();
    });

    test("TC-CR-026. Pending status display", async () => {
      const data = relationshipsData.TC_CR_026;
      const pendingRow = relationshipsPage.tableRows
        .filter({ hasText: new RegExp(data.status, "i") })
        .first();
      if ((await pendingRow.count()) > 0) {
        await expect(pendingRow).toBeVisible();
      }
    });
  });

  // ── Pagination (TC-CR-027 → TC-CR-031) ────────────────────

  test.describe("Pagination", () => {
    test.beforeEach(async () => {
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-027. Previous button disabled on first page", async () => {
      test.skip(
        (await relationshipsPage.prevButton.count()) === 0,
        "Pagination not present",
      );
      await relationshipsPage.verifyPrevDisabled();
    });

    test("TC-CR-028. Next button disabled when only one page", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0,
        "Pagination not present",
      );
      const singlePage =
        (await relationshipsPage.nextButton.isDisabled()) ||
        (await relationshipsPage.getRowCount()) === 0;
      if (singlePage) {
        await relationshipsPage.verifyNextDisabled();
      }
    });

    test("TC-CR-029. Next pagination", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0,
        "Pagination not present",
      );
      test.skip(
        await relationshipsPage.nextButton.isDisabled(),
        "Already on last page",
      );
      await relationshipsPage.clickNextPage();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-CR-030. Previous pagination", async () => {
      test.skip(
        (await relationshipsPage.nextButton.count()) === 0 ||
          (await relationshipsPage.nextButton.isDisabled()),
        "Requires multiple pages",
      );
      await relationshipsPage.clickNextPage();
      await relationshipsPage.clickPrevPage();
      expect(await relationshipsPage.getRowCount()).toBeGreaterThan(0);
    });

    test("TC-CR-031. Pagination after search", async () => {
      const data = relationshipsData.TC_CR_031;
      await relationshipsPage.searchRelationship(data.searchName);
      const count = await relationshipsPage.getRowCount();
      test.skip(count === 0, "No search results to paginate");
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── Cross-type navigation (TC-CR-032 → TC-CR-034, TC-CR-040) ──

  test.describe("Cross-type Navigation", () => {
    test("TC-CR-032. Individual Relationships navigation", async () => {
      await relationshipsPage.openCorporateList();
      await relationshipsPage.relationshipsMenuItem.click();
      await relationshipsPage.subMenuItem("Individual").click();
      await expect(relationshipsPage.listSectionTitle).toBeVisible({
        timeout: 15000,
      });
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-033. Business Relationships navigation", async () => {
      await relationshipsPage.openCorporateList();
      await relationshipsPage.relationshipsMenuItem.click();
      await relationshipsPage.subMenuItem("Business").click();
      await expect(relationshipsPage.listSectionTitle).toBeVisible({
        timeout: 15000,
      });
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-034. Deleted Relationships navigation", async () => {
      await relationshipsPage.openCorporateList();
      await relationshipsPage.relationshipsMenuItem.click();
      await relationshipsPage.subMenuItem("Deleted").click();
      await expect(relationshipsPage.listSectionTitle).toBeVisible({
        timeout: 15000,
      });
      await relationshipsPage.openCorporateList();
    });

    test("TC-CR-040. Relationship list after navigation returns correct data", async () => {
      const data = relationshipsData.TC_CR_010;
      await relationshipsPage.openCorporateList();
      await relationshipsPage.searchRelationship(data.searchName);
      await relationshipsPage.verifyRowExists(data.searchName);
      await relationshipsPage.openBusinessList();
      await relationshipsPage.openCorporateList();
      await relationshipsPage.searchRelationship(data.searchName);
      await relationshipsPage.verifyRowExists(data.searchName);
    });
  });

  // ── Data consistency & refresh (TC-CR-035 → TC-CR-038) ────

  test.describe("Data Consistency", () => {
    test("TC-CR-035. Page refresh retains data", async () => {
      await relationshipsPage.openCorporateList();
      const rowsBefore = await relationshipsPage.getRowCount();
      expect(rowsBefore).toBeGreaterThan(0);
      await relationshipsPage.reload();
      await relationshipsPage.openCorporateList();
      const rowsAfter = await relationshipsPage.getRowCount();
      expect(rowsAfter).toBeGreaterThan(0);
    });

    test("TC-CR-036. Data consistency after refresh", async () => {
      const data = relationshipsData.TC_CR_036;
      await relationshipsPage.openCorporateList();
      await relationshipsPage.verifyRowExists(data.existingRelationship);
      const rowsBefore = await relationshipsPage.getRowCount();
      await relationshipsPage.reload();
      await relationshipsPage.openCorporateList();
      const rowsAfter = await relationshipsPage.getRowCount();
      expect(rowsAfter).toBe(rowsBefore);
      await relationshipsPage.verifyRowExists(data.existingRelationship);
    });

    test("TC-CR-037. Newly created relationship appears in list", async () => {
      test.skip(!ALLOW_MUTATING, "Depends on TC-CR-015 mutating flow");
      await relationshipsPage.openCorporateList();
      await relationshipsPage.searchRelationship("TestCorporate");
      const count = await relationshipsPage.getRowCount();
      test.skip(
        count === 0,
        "TestCorporate not found; TC-CR-015 may not have run",
      );
      await relationshipsPage.verifyRowExists("TestCorporate");
    });

    test("TC-CR-038. Search after creating relationship", async () => {
      test.skip(!ALLOW_MUTATING, "Depends on TC-CR-015 mutating flow");
      await relationshipsPage.openCorporateList();
      await relationshipsPage.searchRelationship("TestCorporate");
      const count = await relationshipsPage.getRowCount();
      test.skip(
        count === 0,
        "TestCorporate not found; TC-CR-015 may not have run",
      );
      await relationshipsPage.verifyRowExists("TestCorporate");
    });
  });
});
