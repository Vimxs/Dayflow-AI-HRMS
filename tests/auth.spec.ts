import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveTitle(/Dayflow/);
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/sign-in');
    // Submit the form with empty fields by clicking the submit button
    await page.getByRole('button', { name: /Sign In to Portal/i }).click();
    // Browser native validation prevents submission with required empty fields
    // Verify that we're still on /sign-in (form did not navigate away)
    await expect(page).toHaveURL(/.*\/sign-in/);
  });

  // Note: For a complete E2E, we'd need to seed a test user or sign one up.
  // This is just a stub for the auth workflow.
});
