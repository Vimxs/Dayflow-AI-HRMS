import { test, expect } from '@playwright/test';

test.describe('Attendance Flow', () => {
  test('unauthenticated users should be redirected to sign in', async ({ page }) => {
    await page.goto('/employee/dashboard');
    // Ensure that it bounces back to sign-in
    await expect(page).toHaveURL(/.*\/auth\/sign-in/);
  });
});
