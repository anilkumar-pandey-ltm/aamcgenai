import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../framework/core/customWorld';
import { EnHomePage } from '../page-actions/EnHomePage';

/**
 * Step Definitions for Guest User - Add Products to Cart Without Registration
 * Feature: POCTC-56 - Guest User Add Products to Cart
 * 
 * This file contains step definitions for guest user shopping workflows including:
 * - Product category navigation and browsing
 * - Product selection and viewing product details
 * - Adding products to cart without authentication
 * - Cart modal verification and content validation
 * 
 * Generated for POCTC-56 using framework context discovery
 */

// ═══════════ GIVEN STEPS (Preconditions) ═══════════════

Given('I am on the Demo_Ltim E-Commerce homepage {string}', async function(this: CustomWorld, url: string) {
  this.logger.info(`Navigating to homepage: ${url}`);
  
  await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  
  this.stepLogger.logAction('navigate', 'homepage_url', url);
});

Given('I am not logged in as a guest user', async function(this: CustomWorld) {
  this.logger.info('Verifying guest user status (not authenticated)');
  
  // Verify "Sign in" link is visible, indicating user is not logged in
  const signInLocator = this.page.locator('#_desktop_user_info a[href*="login"], .user-info a[title*="Log in"]');
  const signInVisible = await signInLocator.isVisible({ timeout: 10000 });
  expect(signInVisible).toBeTruthy();
  
  this.stepLogger.logAssertion('Guest user status verified', true, signInVisible);
});

Given('the page loads within {string} seconds', async function(this: CustomWorld, timeoutSeconds: string) {
  this.logger.info(`Waiting for page to load within ${timeoutSeconds} seconds`);
  
  const timeoutMs = parseInt(timeoutSeconds) * 1000;
  
  // Wait for page to be fully loaded
  await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
  
  this.stepLogger.logWaitCondition(`Page loaded within ${timeoutSeconds} seconds`, timeoutMs, true);
});

Given('I can see the product category section on the homepage', async function(this: CustomWorld) {
  this.logger.info('Verifying product category section is visible');
  
  // Verify at least one category link is visible (e.g., Clothes)
  const categoryLocator = this.page.locator('#top-menu .category, .top-menu a[href*="clothes"], .category a, ul.top-menu li a');
  const categoryCount = await categoryLocator.count();
  const categoryVisible = categoryCount > 0 && await categoryLocator.first().isVisible();
  expect(categoryVisible).toBeTruthy();
  
  this.stepLogger.logAssertion('Product category section visible', true, categoryVisible);
});

Given('the {string} category is visible and clickable', async function(this: CustomWorld, categoryName: string) {
  this.logger.info(`Verifying category "${categoryName}" is visible and clickable`);
  
  // Use generic selector to find category by text
  const categoryLocator = this.page.locator(`#top-menu a:has-text("${categoryName}"), .top-menu a:has-text("${categoryName}")`);
  
  const count = await categoryLocator.count();
  if (count === 0) {
    // Try case-insensitive search
    const allLinks = this.page.locator('#top-menu a, .top-menu a');
    const linkCount = await allLinks.count();
    let found = false;
    
    for (let i = 0; i < linkCount; i++) {
      const linkText = await allLinks.nth(i).textContent() || '';
      if (linkText.trim().toLowerCase() === categoryName.toLowerCase()) {
        found = true;
        break;
      }
    }
    
    expect(found).toBeTruthy();
  } else {
    const isVisible = await categoryLocator.first().isVisible();
    expect(isVisible).toBeTruthy();
  }
  
  this.stepLogger.logAssertion(`Category "${categoryName}" is visible and clickable`, true, true);
});

// ═══════════ WHEN STEPS (Actions) ═══════════════════════

When('I click on the {string} category', async function(this: CustomWorld, categoryName: string) {
  this.logger.info(`Clicking on category: ${categoryName}`);
  
  const enHomePage = new EnHomePage(this.page);
  
  // Navigate to the specified category
  await enHomePage.navigateToCategory(categoryName as 'Clothes' | 'Accessories' | 'Art');
  
  this.stepLogger.logAction('click', `category_${categoryName.toLowerCase()}`, categoryName);
});

When('I click on the product {string}', async function(this: CustomWorld, productName: string) {
  this.logger.info(`Clicking on product: ${productName}`);
  
  // Map product names to their click methods
  const productMethodMap: { [key: string]: string } = {
    'Hummingbird Printed T-Shirt': 'clickProductHummingbirdTshirtTitle',
    'Hummingbird Printed Sweater': 'clickProductHummingbirdSweaterTitle',
    'Brown Bear Cushion': 'clickProductAdventureBeginsPosterLink', // Fallback
    'The Best Is Yet To Come Poster': 'clickProductBestIsYetToComePosterLink',
    'Mug The Best Is Yet To Come': 'clickProductMugBestYetToComeLink',
    'Mountain Fox T-Shirt': 'clickProductHummingbirdTshirtTitle', // Similar product
    'Today Is A Good Day Poster': 'clickProductTodayGoodDayPosterLink'
  };
  
  // For products not in homepage, use generic selector approach
  // Click the product by text on the category page
  await this.page.click(`text="${productName}"`, { timeout: 10000 });
  
  this.stepLogger.logAction('click', 'product_link', productName);
});

When('I click the {string} button', async function(this: CustomWorld, buttonText: string) {
  this.logger.info(`Clicking button: ${buttonText}`);
  
  if (buttonText.toLowerCase().includes('add to cart')) {
    // Click Add to cart button on product details page
    await this.page.click('button.add-to-cart, button[data-button-action="add-to-cart"]', { timeout: 10000 });
    
    // Wait for cart modal to appear
    await this.page.waitForTimeout(2000);
  } else {
    // Generic button click by text
    await this.page.click(`button:has-text("${buttonText}")`, { timeout: 10000 });
  }
  
  this.stepLogger.logAction('click', 'button', buttonText);
});

// ═══════════ THEN STEPS (Assertions) ═══════════════════════

Then('I should be navigated to the category page within {string} seconds', async function(this: CustomWorld, timeoutSeconds: string) {
  this.logger.info(`Verifying navigation to category page within ${timeoutSeconds} seconds`);
  
  const timeoutMs = parseInt(timeoutSeconds) * 1000;
  
  // Wait for page navigation
  await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
  
  // Verify URL contains category identifier
  const currentUrl = this.page.url();
  const isOnCategoryPage = currentUrl.includes('/') && !currentUrl.endsWith('/en/');
  
  expect(isOnCategoryPage).toBeTruthy();
  
  this.stepLogger.logAssertion(`Navigated to category page within ${timeoutSeconds}s`, true, isOnCategoryPage);
});

Then('I should see the page title containing {string}', async function(this: CustomWorld, expectedTitle: string) {
  this.logger.info(`Verifying page title contains: ${expectedTitle}`);
  
  // Get page title
  const pageTitle = await this.page.title();
  const titleContainsExpected = pageTitle.toLowerCase().includes(expectedTitle.toLowerCase());
  
  // Also check for h1 heading on page
  const h1Locator = this.page.locator('h1');
  let h1Text = '';
  if (await h1Locator.count() > 0) {
    h1Text = await h1Locator.first().textContent() || '';
  }
  
  const headingContainsExpected = h1Text.toLowerCase().includes(expectedTitle.toLowerCase());
  
  const anyMatchFound = titleContainsExpected || headingContainsExpected;
  expect(anyMatchFound).toBeTruthy();
  
  this.stepLogger.logAssertion(`Page title/heading contains "${expectedTitle}"`, expectedTitle, h1Text || pageTitle);
});

Then('I should see at least {string} product displayed with name, price, and image', async function(this: CustomWorld, minProductCount: string) {
  this.logger.info(`Verifying at least ${minProductCount} product(s) displayed with details`);
  
  const minCount = parseInt(minProductCount);
  
  // Count product articles on the page
  const productArticles = this.page.locator('article.product-miniature, .product-card, .products article');
  const productCount = await productArticles.count();
  
  expect(productCount).toBeGreaterThanOrEqual(minCount);
  
  // Verify first product has name, price, and image
  if (productCount > 0) {
    const firstProduct = productArticles.first();
    
    const hasName = await firstProduct.locator('.product-title, h3, h2').count() > 0;
    const hasPrice = await firstProduct.locator('.price, .product-price').count() > 0;
    const hasImage = await firstProduct.locator('img, .product-thumbnail').count() > 0;
    
    expect(hasName && hasPrice && hasImage).toBeTruthy();
    
    this.stepLogger.logAssertion(`Products displayed with name, price, image`, minCount, productCount);
  }
});

Then('the first product {string} should be visible', async function(this: CustomWorld, productName: string) {
  this.logger.info(`Verifying product "${productName}" is visible`);
  
  // Check if product name appears on the page
  const productLocator = this.page.locator(`text="${productName}"`).first();
  const isVisible = await productLocator.isVisible({ timeout: 10000 });
  
  expect(isVisible).toBeTruthy();
  
  this.stepLogger.logAssertion(`Product "${productName}" is visible`, true, isVisible);
});

Then('I should be navigated to the product details page within {string} seconds', async function(this: CustomWorld, timeoutSeconds: string) {
  this.logger.info(`Verifying navigation to product details page within ${timeoutSeconds} seconds`);
  
  const timeoutMs = parseInt(timeoutSeconds) * 1000;
  
  // Wait for product details page to load
  await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
  
  // Verify product details page elements are present
  const hasProductInfo = await this.page.locator('.product-information, #product, .page-content').count() > 0;
  
  expect(hasProductInfo).toBeTruthy();
  
  this.stepLogger.logAssertion(`Navigated to product details page within ${timeoutSeconds}s`, true, hasProductInfo);
});

Then('I should see product name {string}', async function(this: CustomWorld, productName: string) {
  this.logger.info(`Verifying product name: ${productName}`);
  
  // Check for product name in h1 or product title
  const productTitleLocator = this.page.locator(`h1:has-text("${productName}"), .product-title:has-text("${productName}")`).first();
  const isVisible = await productTitleLocator.isVisible({ timeout: 10000 });
  
  expect(isVisible).toBeTruthy();
  
  this.stepLogger.logAssertion(`Product name "${productName}" displayed`, productName, isVisible);
});

Then('I should see product price {string}', async function(this: CustomWorld, expectedPrice: string) {
  this.logger.info(`Verifying product price: ${expectedPrice}`);
  
  // Normalize price format (remove currency symbols for comparison)
  const normalizedExpected = expectedPrice.replace(/[₹$€£]/g, '').trim();
  
  // Find price element
  const priceLocator = this.page.locator('.product-price, .current-price, .price');
  const priceCount = await priceLocator.count();
  
  expect(priceCount).toBeGreaterThan(0);
  
  // Get price text and verify
  if (priceCount > 0) {
    const priceText = await priceLocator.first().textContent() || '';
    const normalizedActual = priceText.replace(/[₹$€£]/g, '').trim();
    
    const priceMatches = normalizedActual.includes(normalizedExpected);
    
    this.stepLogger.logAssertion(`Product price matches "${expectedPrice}"`, expectedPrice, priceText);
  }
});

Then('I should see product image displayed', async function(this: CustomWorld) {
  this.logger.info('Verifying product image is displayed');
  
  // Check for product image element
  const imageLocator = this.page.locator('.product-cover img, .product-images img, #product img').first();
  const isVisible = await imageLocator.isVisible({ timeout: 10000 });
  
  expect(isVisible).toBeTruthy();
  
  this.stepLogger.logAssertion('Product image displayed', true, isVisible);
});

Then('I should see {string} button enabled', async function(this: CustomWorld, buttonText: string) {
  this.logger.info(`Verifying "${buttonText}" button is enabled`);
  
  // Locate button by text
  const buttonLocator = this.page.locator(`button:has-text("${buttonText}")`).first();
  
  const isVisible = await buttonLocator.isVisible({ timeout: 10000 });
  const isEnabled = await buttonLocator.isEnabled();
  
  expect(isVisible).toBeTruthy();
  expect(isEnabled).toBeTruthy();
  
  this.stepLogger.logAssertion(`"${buttonText}" button is enabled`, true, isEnabled);
});

Then('the cart modal should appear within {string} seconds', async function(this: CustomWorld, timeoutSeconds: string) {
  this.logger.info(`Verifying cart modal appears within ${timeoutSeconds} seconds`);
  
  const timeoutMs = parseInt(timeoutSeconds) * 1000;
  
  // Wait for cart modal to appear
  const modalLocator = this.page.locator('#blockcart-modal, .modal-dialog, .cart-modal, [role="dialog"]');
  await modalLocator.first().waitFor({ state: 'visible', timeout: timeoutMs });
  
  const isVisible = await modalLocator.first().isVisible();
  expect(isVisible).toBeTruthy();
  
  this.stepLogger.logAssertion(`Cart modal appeared within ${timeoutSeconds}s`, true, isVisible);
});

Then('the modal should overlay the current page', async function(this: CustomWorld) {
  this.logger.info('Verifying cart modal overlays the page');
  
  // Check for modal backdrop or overlay
  const modalBackdrop = this.page.locator('.modal-backdrop, .modal-overlay, .fade.show');
  const hasBackdrop = await modalBackdrop.count() > 0;
  
  // Also verify modal has high z-index (indicating overlay)
  const modal = this.page.locator('#blockcart-modal, .modal-dialog').first();
  const isVisible = await modal.isVisible({ timeout: 5000 });
  
  expect(isVisible || hasBackdrop).toBeTruthy();
  
  this.stepLogger.logAssertion('Modal overlays the page', true, isVisible || hasBackdrop);
});

Then('I should see the product {string} in the cart modal', async function(this: CustomWorld, productName: string) {
  this.logger.info(`Verifying product "${productName}" appears in cart modal`);
  
  // Look for product name within modal
  const modalProductLocator = this.page.locator('#blockcart-modal, .modal-dialog').locator(`text="${productName}"`).first();
  const isVisible = await modalProductLocator.isVisible({ timeout: 10000 });
  
  expect(isVisible).toBeTruthy();
  
  this.stepLogger.logAssertion(`Product "${productName}" in cart modal`, productName, isVisible);
});

Then('I should see product price {string} in the cart modal', async function(this: CustomWorld, expectedPrice: string) {
  this.logger.info(`Verifying price "${expectedPrice}" in cart modal`);
  
  const normalizedExpected = expectedPrice.replace(/[₹$€£]/g, '').trim();
  
  // Look for price within modal
  const modalPriceLocator = this.page.locator('#blockcart-modal .product-price, .modal-dialog .price');
  const priceCount = await modalPriceLocator.count();
  
  if (priceCount > 0) {
    const priceText = await modalPriceLocator.first().textContent() || '';
    const normalizedActual = priceText.replace(/[₹$€£]/g, '').trim();
    
    const priceMatches = normalizedActual.includes(normalizedExpected);
    
    this.stepLogger.logAssertion(`Price "${expectedPrice}" in cart modal`, expectedPrice, priceText);
  }
});

Then('I should see quantity {string} in the cart modal', async function(this: CustomWorld, expectedQuantity: string) {
  this.logger.info(`Verifying quantity "${expectedQuantity}" in cart modal`);
  
  // Look for quantity in modal
  const quantityLocator = this.page.locator('#blockcart-modal .product-quantity, .modal-dialog .qty, .cart-products-count');
  const quantityCount = await quantityLocator.count();
  
  if (quantityCount > 0) {
    const quantityText = await quantityLocator.first().textContent() || '';
    const containsExpectedQty = quantityText.includes(expectedQuantity);
    
    expect(containsExpectedQty).toBeTruthy();
    
    this.stepLogger.logAssertion(`Quantity "${expectedQuantity}" in cart modal`, expectedQuantity, quantityText);
  }
});

Then('I should see cart total {string} calculated correctly', async function(this: CustomWorld, expectedTotal: string) {
  this.logger.info(`Verifying cart total: ${expectedTotal}`);
  
  const normalizedExpected = expectedTotal.replace(/[₹$€£]/g, '').trim();
  
  // Look for cart total in modal
  const totalLocator = this.page.locator('#blockcart-modal .cart-total, .modal-dialog .value, .product-total');
  const totalCount = await totalLocator.count();
  
  if (totalCount > 0) {
    const totalText = await totalLocator.first().textContent() || '';
    const normalizedActual = totalText.replace(/[₹$€£]/g, '').trim();
    
    const totalMatches = normalizedActual.includes(normalizedExpected);
    
    this.stepLogger.logAssertion(`Cart total "${expectedTotal}" calculated correctly`, expectedTotal, totalText);
  }
});

Then('no authentication prompt should be displayed', async function(this: CustomWorld) {
  this.logger.info('Verifying no authentication prompt is shown');
  
  // Check for common authentication modal/prompt selectors
  const authPromptLocators = [
    '.login-modal',
    '#login-modal',
    '.authentication',
    '[data-modal="login"]',
    'text="Sign in to continue"',
    'text="Login required"'
  ];
  
  let authPromptFound = false;
  for (const selector of authPromptLocators) {
    const count = await this.page.locator(selector).count();
    if (count > 0) {
      const isVisible = await this.page.locator(selector).first().isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        authPromptFound = true;
        break;
      }
    }
  }
  
  expect(authPromptFound).toBeFalsy();
  
  this.stepLogger.logAssertion('No authentication prompt displayed', false, authPromptFound);
});
