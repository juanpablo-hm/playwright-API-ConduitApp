import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto('https://conduit.bondaracademy.com/');
    await page.getByText('Sign in').click()
    await page.getByRole('textbox', { name: "Email" }).fill('jpqa@test.com')
    await page.getByRole('textbox', { name: "Password" }).fill('Piano123')
    await page.getByRole('button', { name: "Sign In" }).click()

    await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible();

    // End of authentication steps.

    await page.context().storageState({ path: authFile });
    
});