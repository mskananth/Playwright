const { test, expect } = require("@playwright/test");
const LoginPage = require("../Pages/LoginPage");
const MatterPage = require("../Pages/MattersPage");
const DocumentUploadPage = require("../Pages/DocumentUploadPage");
const { loginData } = require("../testData/loginData");
const matterData1 = require("../testData/matterData1.json");

const defaultLogin = (loginData && loginData[0]) || {};
const uploadCaseData = matterData1.TC77_CreateLegalMatterSaveForLaterComplete;

test.describe("Document upload via project folder", () => {
  let page;
  let matterPage;
  let documentUploadPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.loginWithPassword(
      defaultLogin.email || process.env.EMAIL,
      defaultLogin.password || process.env.PASSWORD,
    );

    matterPage = new MatterPage(page);
    await matterPage.openMatterCreation();

    documentUploadPage = new DocumentUploadPage(page);
    await matterPage.fillCaseTitle(uploadCaseData.caseTitle);
    await matterPage.clickSaveAndNext();

    await matterPage.enterClientName(uploadCaseData.client.name);
    await matterPage.clickClientSearch();
    await matterPage.openClientDropdown();
    await matterPage.selectClient(uploadCaseData.client.name);
    await matterPage.clickSaveAndNext();

    await expect(
      page.getByRole("button", { name: "Browse Files" }),
    ).toBeVisible();
  });

  test("uploads one file from project directory", async () => {
    const relativeFile = uploadCaseData.document.filePath;

    await documentUploadPage.uploadFromProjectDirectory(relativeFile);
    await documentUploadPage.verifyUploadedFile(
      uploadCaseData.document.fileName,
    );
  });

  test("uploads multiple files from project directory", async () => {
    const relativeFiles = uploadCaseData.document.multiUploadFiles;

    await documentUploadPage.uploadMultipleFromProjectDirectory(relativeFiles);
    await documentUploadPage.verifyUploadedFile(
      relativeFiles[0].split("/").pop(),
    );
  });

  test.afterEach(async () => {
    await page.close();
  });
});
