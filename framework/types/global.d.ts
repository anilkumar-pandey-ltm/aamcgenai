import { Page, BrowserContext, Browser } from '@playwright/test';

declare global {
  var page: Page;
  var context: BrowserContext;
  var browser: Browser;
  var browserStackSessionId: string;
}

export interface Config {
  baseUrl: string;
  timeout: number;
  retries: number;
  parallel: boolean;
  headless: boolean;
  browser: string;
  environment: string;
  [key: string]: any;
}

export {};