const puppeteer = require('puppeteer');
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  global.browser = await puppeteer.launch({ headless: true });
  console.log('global.browser set:', !!global.browser);
  global.page = await global.browser.newPage();
  console.log('global.page set:', !!global.page);
});

afterAll(async () => {
  await global.browser.close();
});