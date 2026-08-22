import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await expect(page).toHaveTitle(/Sign In | Dayflow/);
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.getByRole('button', { name: 'Sign in to your account' }).click();
    await expect(page.locator('text=String must contain at least 1 character(s)')).toBeVisible();
  });

  // Note: For a complete E2E, we'd need to seed a test user or sign one up.
  // This is just a stub for the auth workflow.
});
