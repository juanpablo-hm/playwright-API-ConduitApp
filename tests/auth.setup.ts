import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page, request }) => {
    const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": {
                "email": "jpqa@test.com",
                "password": "Piano123"
            }
        }
    })
    expect(loginResponse.status()).toEqual(200)
    const responseJSON = await loginResponse.json()
    const token = responseJSON.user.token

    process.env['ACCESS_TOKEN'] = token

    if (fs.existsSync(authFile)) {

        const storageStateFile = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
        storageStateFile.origins[0].localStorage[0].value = token
        fs.writeFileSync(authFile, JSON.stringify(storageStateFile, null, 2))

    } else {
        await page.goto('https://conduit.bondaracademy.com/');
        await page.getByText('Sign in').click()
        await page.getByRole('textbox', { name: "Email" }).fill('jpqa@test.com')
        await page.getByRole('textbox', { name: "Password" }).fill('Piano123')
        await page.getByRole('button', { name: "Sign In" }).click()

        await expect(page.getByRole('link', { name: 'New Article' })).toBeVisible();

        await page.context().storageState({ path: authFile });

    }

});