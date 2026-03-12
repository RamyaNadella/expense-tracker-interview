import { expect, type Page } from '@playwright/test';

export class ImportWizard {
  constructor(private readonly page: Page) {}

  async uploadCsv(fileName: string, csvContent: string) {
    await this.page.locator('input[type="file"]').setInputFiles({
      name: fileName,
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });
  }

  async continueFromMapping() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async expectUploadError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  async expectOnMappingStep() {
    await expect(this.page.getByText('Map CSV Columns')).toBeVisible();
  }

  async expectOnPreviewStep() {
    await expect(this.page.getByText('Preview Import')).toBeVisible();
  }

  async expectMalformedInputNotSilent() {
    await expect(this.page.getByRole('button', { name: 'Continue' })).toBeDisabled();
  }
}
