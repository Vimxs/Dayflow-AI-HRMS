import { test, expect } from '@playwright/test';

test.describe('Attendance Flow', () => {
  test('unauthenticated users should be redirected to sign in', async ({ page }) => {
    await page.goto('/employee/dashboard');
    // Middleware redirects to /sign-in with callbackUrl param
    await expect(page).toHaveURL(/.*\/sign-in/);
  });
});
