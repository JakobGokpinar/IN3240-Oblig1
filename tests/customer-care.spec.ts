import { test, expect, type Page } from '@playwright/test';

// Task 1.5

test.describe('Customer Care Form', () => {

  test('should submit customer care form successfully', async ({ page }) => {

    // Navigate to the homepage
    await page.goto('https://parabank.parasoft.com/parabank/index.htm');

    // Click the mail icon to open the Customer Care page
    await page.goto('https://parabank.parasoft.com/parabank/contact.htm');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@test.com');
    await page.fill('input[name="phone"]', '12345678');
    await page.fill('textarea[name="message"]', 'This is a test message.');

    await page.click('input[value="Send to Customer Care"]');

    // Verify confirmation message
    await expect(page.locator('#rightPanel')).toContainText('Thank you Test User');
    await expect(page.locator('#rightPanel')).toContainText('A Customer Care Representative will be contacting you.');
  });

});
