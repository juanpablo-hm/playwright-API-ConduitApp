import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json';


test('Mock and Intercept API Call', async ({ page }) => {
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({
      json: tags
    });
  });

  await page.route('*/**/api/articles*', async (route) => {
    const response = await route.fetch()
    const responseJSON = await response.json()
    responseJSON.articles[0].title = 'This is a Mock title for the article'
    responseJSON.articles[0].description = 'This is a Mock description for the article'
    await route.fulfill({
      json: responseJSON
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');

  await expect(page.locator('.navbar-brand')).toHaveText(/conduit/);
  await expect(page.locator('.sidebar .tag-pill')).toContainText([
    'Automation',
    'Playwright'
  ]);

  await expect(page.locator('.preview-link h1').first()).toContainText('This is a Mock title for the article')
  await expect(page.locator('.preview-link p').first()).toContainText('This is a Mock description for the article')

});

test('Delete Article', async ({ page, request }) => {
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

  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {
        "title": "Test Cool Article 30",
        "description": "Test Postman Description",
        "body": "Test psotman cool body",
        "tagList": [
          "cool"
        ]
      }
    }, headers: {
      Authorization: `Token ${token}`
    }
  })
  expect(newArticleResponse.status()).toEqual(201)

  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name: "Email"}).fill('jpqa@test.com')
  await page.getByRole('textbox', {name: "Password"}).fill('Piano123')
  await page.getByRole('button', {name: "Sign In"}).click()

  await expect(page.locator('.preview-link h1').first()).toContainText('Test Cool Article 30')
  await page.getByText('Test Cool Article 30').click()
  await page.getByRole('button', { name: "Delete Article" }).first().click()
  await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0')
  await expect(page.locator('.preview-link h1').first()).not.toContainText('Test Cool Article 30')

})
 