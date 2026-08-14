const { expect } = require("@playwright/test");
const path = require("path");

class DocumentUploadPage {
  constructor(page) {
    this.page = page;

    this.browseFilesButton = page.getByRole("button", {
      name: "Browse Files",
    });

    this.fileInput = page.locator('input[type="file"]');
    this.uploadDropzone = page.locator(
      "text=Choose the files you want to upload",
    );
  }

  resolveProjectFile(relativePath) {
    return path.resolve(__dirname, "..", relativePath);
  }

  async uploadFromProjectDirectory(relativePath) {
    const filePath = this.resolveProjectFile(relativePath);

    await expect(this.fileInput).toBeVisible({ timeout: 20000 });
    await this.fileInput.setInputFiles(filePath);
    await this.page.waitForTimeout(1500);
  }

  async uploadMultipleFromProjectDirectory(relativePaths) {
    const filePaths = relativePaths.map((item) =>
      this.resolveProjectFile(item),
    );

    await expect(this.fileInput).toBeVisible({ timeout: 20000 });
    await this.fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(1500);
  }

  async verifyUploadedFile(fileName) {
    await expect(
      this.page.getByText(fileName, { exact: true }).first(),
    ).toBeVisible({ timeout: 25000 });
  }
}

module.exports = DocumentUploadPage;
