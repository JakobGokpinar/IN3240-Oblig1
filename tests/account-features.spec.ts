import { test, expect, type Page } from '@playwright/test';

// Shared credentials, username is generated dynamically to avoid conflicts
let username: string;
const password = 'test1234';

async function registerUser(page: Page, username: string, password: string) {
  await page.goto('https://parabank.parasoft.com/parabank/register.htm');
  await page.fill('input[name="customer.firstName"]', 'Test');
  await page.fill('input[name="customer.lastName"]', 'User');
  await page.fill('input[name="customer.address.street"]', '123 Test Street');
  await page.fill('input[name="customer.address.city"]', 'TestCity');
  await page.fill('input[name="customer.address.state"]', 'TestState');
  await page.fill('input[name="customer.address.zipCode"]', '12345');
  await page.fill('input[name="customer.phoneNumber"]', '12345678');
  await page.fill('input[name="customer.ssn"]', '123-45-6789');
  await page.fill('input[name="customer.username"]', username);
  await page.fill('input[name="customer.password"]', password);
  await page.fill('input[name="repeatedPassword"]', password);
  await page.click('input[value="Register"]');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#rightPanel')).toContainText('Your account was created successfully');
}

test.describe('Account Features Suite', () => {

  test.describe.configure({ mode: 'serial' });

  // Registers a fresh user and opens a second account needed for the Transfer Funds test.
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000);
    const context = await browser.newContext();
    const page = await context.newPage();
    username = 'user' + Date.now();
    await registerUser(page, username, password);
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('https://parabank.parasoft.com/parabank/index.htm');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('input[value="Log In"]');
    await expect(page.getByRole('link', { name: 'Log Out' })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await page.getByRole('link', { name: 'Log Out' }).click();
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  // Task 2.5 — Test case 1: Update contact information
  test('should update contact info successfully', async ({ page }) => {
    await page.getByRole('link', { name: 'Update Contact Info' }).click();

    await page.fill('input[name="customer.firstName"]', 'Test');
    await page.fill('input[name="customer.lastName"]', 'User');
    await page.fill('input[name="customer.address.street"]', 'Test Street 43');
    await page.fill('input[name="customer.address.city"]', 'TestCity');
    await page.fill('input[name="customer.address.state"]', 'TestState');
    await page.fill('input[name="customer.address.zipCode"]', '02215');
    await page.fill('input[name="customer.phoneNumber"]', '01234567');

    await page.locator('input[value="Update Profile"]').click();
    await expect(page.locator('#rightPanel')).toContainText('Your updated address and phone number have been added to the system.');
  });

  test('should display account overview with account details', async ({ page }) => {
    await page.getByRole('link', { name: 'Accounts Overview' }).click();
    await page.waitForLoadState('networkidle');
  
    // Verify the accounts table is visible
    await expect(page.locator('#accountTable')).toBeVisible();
  
    // Verify at least one account row exists
    await expect(page.locator('#accountTable tbody tr').first()).toBeVisible();
  
    // Verify total balance is displayed
    await expect(page.locator('#accountTable')).toContainText('Total');
  });

  test('should complete bill payment successfully', async ({ page }) => {
    await page.getByRole('link', { name: 'Bill Pay' }).click();

    await page.waitForSelector('input[name="payee.name"]', { state: 'visible', timeout: 60000 });

    await page.fill('input[name="payee.name"]', 'Test Payee');
    await page.fill('input[name="payee.address.street"]', '123 Payee Street');
    await page.fill('input[name="payee.address.city"]', 'PayeeCity');
    await page.fill('input[name="payee.address.state"]', 'PayeeState');
    await page.fill('input[name="payee.address.zipCode"]', '12345');
    await page.fill('input[name="payee.phoneNumber"]', '12345678');
    await page.fill('input[name="payee.accountNumber"]', '12345');
    await page.fill('input[name="verifyAccount"]', '12345');
    await page.fill('input[name="amount"]', '50');

    await page.selectOption('select[name="fromAccountId"]', { index: 0 });

    await page.click('input[value="Send Payment"]');
    await expect(page.locator('#rightPanel')).toContainText('Bill Payment Complete');
  });

});