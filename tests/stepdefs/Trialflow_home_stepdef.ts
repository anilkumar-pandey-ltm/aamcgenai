import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../framework/core/customWorld';
import { HomePage } from '../../page-actions/HomePage';

/**
 * Step Definitions for Trial Plan Listing Page
 * Feature: Demo_Test_Case_Help_Start_Now.feature
 * 
 * This file contains step definitions for managing and searching trial plans
 * Generated using MCP-powered context discovery
 */

// Background Steps

Given('I am logged into the system', async function(this: CustomWorld) {
  this.logger.info('User authentication - assuming already logged in');
  // Note: Authentication is assumed to be handled by the test setup
  // If explicit login is needed, implement login page actions
  this.stepLogger.logAction('verify_authentication', 'system_login');
});

Given('I have access to the Trial Plan Management section', async function(this: CustomWorld) {
  const homePage = new HomePage(this.page);
  
  // Navigate to trial plans page
  this.logger.info('Navigating to Trial Plan Management section');
  await homePage.clickTrialplansnavlink();
  
  // Verify we're on the correct page
  const pageTitle = await homePage.getPagetitleText();
  this.logger.info(`Current page title: ${pageTitle}`);
  
  // Verify trial plans table is visible
  const isTableVisible = await homePage.isTrialplanstableVisible();
  expect(isTableVisible).toBeTruthy();
  
  this.stepLogger.logAction('navigate', 'trial_plans_section');
  this.stepLogger.logAssertion('Trial plans table is visible', true, isTableVisible);
});

// Scenario Steps

When('I enter {string} in the search field', async function(this: CustomWorld, planId: string) {
  const homePage = new HomePage(this.page);
  
  this.logger.info(`Entering search term: ${planId}`);
  
  // Enter the plan ID in the search input
  await homePage.enterSearchplansinput(planId);
  
  // Wait for search results to update
  await this.page.waitForTimeout(1000);
  
  this.stepLogger.logAction('fill', 'search_plans_input', planId);
});

Then('the list should show only plans matching {string}', async function(this: CustomWorld, planId: string) {
  const homePage = new HomePage(this.page);
  
  this.logger.info(`Verifying search results for: ${planId}`);
  
  // Verify trial plans table is still visible
  const isTableVisible = await homePage.isTrialplanstableVisible();
  expect(isTableVisible).toBeTruthy();
  
  // Get the showing entries text to verify filtering
  const entriesText = await homePage.getShowingentriestextText();
  this.logger.info(`Entries text: ${entriesText}`);
  
  // Verify the search results contain the plan ID
  // Note: In a real implementation, you might need to add methods to HomePage
  // to validate specific table rows or cell contents
  const pageContent = await this.page.content();
  expect(pageContent).toContain(planId);
  
  this.stepLogger.logAssertion('Search results contain plan ID', planId, 'visible in results');
});

Then('I should see {int} matching result', async function(this: CustomWorld, resultCount: number) {
  const homePage = new HomePage(this.page);
  
  this.logger.info(`Verifying result count: ${resultCount}`);
  
  // Get the showing entries text
  const entriesText = await homePage.getShowingentriestextText();
  this.logger.info(`Entries displayed: ${entriesText}`);
  
  // Parse the entries text to verify count
  // Typical format: "Showing 1 of 1 entries"
  const match = entriesText.match(/Showing\s+(\d+)/i);
  
  if (match) {
    const actualCount = parseInt(match[1]);
    expect(actualCount).toBe(resultCount);
    this.stepLogger.logAssertion('Result count matches', resultCount, actualCount);
  } else {
    // Fallback: Count table rows with data
    const tableRows = await this.page.locator('[data-testid="table-row"], tbody tr').count();
    expect(tableRows).toBe(resultCount);
    this.stepLogger.logAssertion('Table row count matches', resultCount, tableRows);
  }
});
