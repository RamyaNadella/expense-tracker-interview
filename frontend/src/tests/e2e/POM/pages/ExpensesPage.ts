import { expect, type Page } from '@playwright/test';
import { BasePage } from '../core/BasePage';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { ExpenseListPanel } from '../components/ExpenseListPanel';

export class ExpensesPage extends BasePage {
  readonly formModal: ExpenseFormModal;
  readonly listPanel: ExpenseListPanel;

  constructor(page: Page) {
    super(page);
    this.formModal = new ExpenseFormModal(page);
    this.listPanel = new ExpenseListPanel(page);
  }

  async goto() {
    await super.goto('/expenses');
    await expect(this.page.getByRole('heading', { name: 'Expenses' })).toBeVisible();
  }

  async openCreateModal() {
    await this.page.getByRole('button', { name: 'Add Expense' }).click();
    await expect(this.page.getByRole('heading', { name: 'Add Expense' })).toBeVisible();
  }

  async search(text: string) {
    await this.page.getByPlaceholder('Search expenses...').fill(text);
  }
}
