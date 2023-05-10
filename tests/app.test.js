const request = require('supertest');
const { test, expect } = require('@jest/globals');
const { chromium } = require('playwright');

const app = require('../index');

test('GET / should respond with status 200', async () => {
  const response = await request(app).get('/');
  expect(response.statusCode).toBe(200);
  expect(response.body.message).toEqual('Scraping microservice is working');
});

test('Web scraping is successful', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://example.com');
  const content = await page.content();
  await browser.close();
  expect(content).toContain('Example Domain');
});
