import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nivara.onboarded', '1'));
});

const newUser = {
  name: 'E2E Citizen',
  email: `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`,
  password: 'safe-test-password-123',
};

test('a citizen can register, view their account, and log out', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('Full name').fill(newUser.name);
  await page.getByLabel('Email').fill(newUser.email);
  await page.getByLabel('Password').fill(newUser.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL('/');
  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page.getByRole('heading', { name: newUser.name })).toBeVisible();
  await expect(page.getByText(newUser.email)).toBeVisible();

  await page.getByRole('button', { name: 'Log out', exact: true }).last().click();
  await expect(page).toHaveURL('/login');
});

test('invalid credentials stay on the login page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('missing-user@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
  await expect(page).toHaveURL('/login');
});
