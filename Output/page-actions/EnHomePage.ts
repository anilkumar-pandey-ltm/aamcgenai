import { Page } from '@playwright/test';
import { BasePage } from '../../framework/core/basePage';

/**
 * Page Actions: EnHomePage
 * URL: http://localhost/en/
 * YAML Source: Output/page-object/en_locators.yaml
 * Generated: 2025
 *
 * COVERAGE:
 *  - Header navigation (logo, top-nav categories + subcategories)
 *  - Language selection (desktop dropdown + mobile select)
 *  - Authentication entry points (sign in links)
 *  - Shopping cart preview and count badge
 *  - Search input and form submission
 *  - Homepage carousel (previous / next / indicator / slide link)
 *  - Popular Products / On Sale / New Products sections (product cards, quick view, colour swatches)
 *  - Wishlist modals (add-to, delete, create, login-required)
 *  - Newsletter subscription (desktop + mobile)
 *  - Footer links (Products, Our Company, Your Account, contact email, copyright)
 *
 * CONTRACT:
 *  - NO assertions / expect() / assert calls — pure interaction layer only
 *  - Every interactive method has a defensive waitForElement before action
 *  - All BasePage method calls use YAML key strings, never raw selectors
 *  - Business methods compose atomic actions — no direct BasePage calls
 */
export class EnHomePage extends BasePage {
  public readonly page: Page;

  // ─── ① Constructor ───────────────────────────────────────────────────────────

  constructor(page: Page) {
    super(page, 'en_locators');
    this.page = page;
  }

  // ─── ④ Navigation ────────────────────────────────────────────────────────────

  /**
   * Navigate directly to the homepage
   */
  async navigateToPage(): Promise<void> {
    await this.navigateTo('http://localhost/en/');
  }

  // ─── ⑤ Atomic Actions — Header Navigation ───────────────────────────────────

  /**
   * Click the Contact Us link in the header
   * @remarks Navigates to the contact page
   */
  async clickContactUsLink(): Promise<void> {
    await this.waitForElement('contact_us_link', { state: 'visible' });
    await this.clickElement('contact_us_link');
  }

  /**
   * Click the site logo to return to the homepage
   * @remarks Desktop header logo image link
   */
  async clickSiteLogo(): Promise<void> {
    await this.waitForElement('site_logo', { state: 'visible' });
    await this.clickElement('site_logo');
  }

  /**
   * Click the Clothes top-navigation category link
   * @remarks Opens the Clothes category page with Men/Women sub-categories
   */
  async clickNavClothesLink(): Promise<void> {
    await this.waitForElement('nav_clothes_link', { state: 'visible' });
    await this.clickElement('nav_clothes_link');
  }

  /**
   * Click the Men sub-category link under Clothes in the top navigation
   */
  async clickNavClothesMenLink(): Promise<void> {
    await this.waitForElement('nav_clothes_men_link', { state: 'visible' });
    await this.clickElement('nav_clothes_men_link');
  }

  /**
   * Click the Women sub-category link under Clothes in the top navigation
   */
  async clickNavClothesWomenLink(): Promise<void> {
    await this.waitForElement('nav_clothes_women_link', { state: 'visible' });
    await this.clickElement('nav_clothes_women_link');
  }

  /**
   * Click the Accessories top-navigation category link
   * @remarks Opens the Accessories category with Stationery/Home Accessories sub-categories
   */
  async clickNavAccessoriesLink(): Promise<void> {
    await this.waitForElement('nav_accessories_link', { state: 'visible' });
    await this.clickElement('nav_accessories_link');
  }

  /**
   * Click the Stationery sub-category link under Accessories in the top navigation
   */
  async clickNavAccessoriesStationeryLink(): Promise<void> {
    await this.waitForElement('nav_accessories_stationery_link', { state: 'visible' });
    await this.clickElement('nav_accessories_stationery_link');
  }

  /**
   * Click the Home Accessories sub-category link under Accessories in the top navigation
   */
  async clickNavAccessoriesHomeLink(): Promise<void> {
    await this.waitForElement('nav_accessories_home_link', { state: 'visible' });
    await this.clickElement('nav_accessories_home_link');
  }

  /**
   * Click the Art top-navigation category link
   */
  async clickNavArtLink(): Promise<void> {
    await this.waitForElement('nav_art_link', { state: 'visible' });
    await this.clickElement('nav_art_link');
  }

  /**
   * Click the "All products" link below the Popular Products section
   * @remarks Navigates to the full product catalog (/2-home)
   */
  async clickAllPopularProductsLink(): Promise<void> {
    await this.waitForElement('all_popular_products_link', { state: 'visible' });
    await this.clickElement('all_popular_products_link');
  }

  /**
   * Click the "All sale products" link below the On Sale section
   * @remarks Navigates to the prices-drop page
   */
  async clickAllSaleProductsLink(): Promise<void> {
    await this.waitForElement('all_sale_products_link', { state: 'visible' });
    await this.clickElement('all_sale_products_link');
  }

  /**
   * Click the "All new products" link below the New Products section
   * @remarks Navigates to the new-products page
   */
  async clickAllNewProductsLink(): Promise<void> {
    await this.waitForElement('all_new_products_link', { state: 'visible' });
    await this.clickElement('all_new_products_link');
  }

  // ─── ⑤ Atomic Actions — Language Selection ──────────────────────────────────

  /**
   * Click the language dropdown button to open the language selector
   * @remarks Desktop header language selector toggle
   */
  async clickLanguageDropdownButton(): Promise<void> {
    await this.waitForElement('language_dropdown_button', { state: 'visible' });
    await this.clickElement('language_dropdown_button');
  }

  /**
   * Click the English language option in the language dropdown
   * @remarks text: "English"
   */
  async clickLanguageOptionEnglish(): Promise<void> {
    await this.waitForElement('language_option_english', { state: 'visible' });
    await this.clickElement('language_option_english');
  }

  /**
   * Click the Tamil language option in the language dropdown
   * @remarks text: "தமிழ்"
   */
  async clickLanguageOptionTamil(): Promise<void> {
    await this.waitForElement('language_option_tamil', { state: 'visible' });
    await this.clickElement('language_option_tamil');
  }

  /**
   * Select a language using the mobile language selector dropdown
   * @param option - Visible option text to select (e.g. "English", "Tamil")
   */
  async selectLanguageSelectorMobile(option: string): Promise<void> {
    const el = await this.waitForElement('language_selector_mobile_select', { state: 'visible' });
    await el.selectOption({ label: option });
  }

  // ─── ⑤ Atomic Actions — Authentication ──────────────────────────────────────

  /**
   * Click the Sign in link in the desktop header user-info area
   * @remarks text: "Sign in" — navigates to customer login page
   */
  async clickSignInLink(): Promise<void> {
    await this.waitForElement('sign_in_link', { state: 'visible' });
    await this.clickElement('sign_in_link');
  }

  /**
   * Click the Sign in link in the footer Your Account section
   * @remarks text: "Sign in"
   */
  async clickFooterSignInLink(): Promise<void> {
    await this.waitForElement('footer_sign_in_link', { state: 'visible' });
    await this.clickElement('footer_sign_in_link');
  }

  // ─── ⑤ Atomic Actions — Shopping Cart ──────────────────────────────────────

  /**
   * Click the cart preview header block to open the mini-cart
   * @remarks text: "Cart"
   */
  async clickCartPreview(): Promise<void> {
    await this.waitForElement('cart_preview', { state: 'visible' });
    await this.clickElement('cart_preview');
  }

  // ─── ⑤ Atomic Actions — Search ──────────────────────────────────────────────

  /**
   * Enter a search term into the header search input and submit
   * @param value - Search term to enter (required, min 2 characters)
   */
  async enterSearchInput(value: string): Promise<void> {
    if (!value?.trim() || value.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters');
    }
    await this.waitForElement('search_input', { state: 'visible' });
    await this.fillElement('search_input', value);
  }

  // ─── ⑤ Atomic Actions — Carousel ────────────────────────────────────────────

  /**
   * Click the carousel Previous button to go to the previous slide
   */
  async clickCarouselPrevButton(): Promise<void> {
    await this.waitForElement('carousel_prev_button', { state: 'visible' });
    await this.clickElement('carousel_prev_button');
  }

  /**
   * Click the carousel Next button to advance to the next slide
   */
  async clickCarouselNextButton(): Promise<void> {
    await this.waitForElement('carousel_next_button', { state: 'visible' });
    await this.clickElement('carousel_next_button');
  }

  /**
   * Click the first carousel indicator dot to jump to slide 1
   */
  async clickCarouselIndicator1(): Promise<void> {
    await this.waitForElement('carousel_indicator_1', { state: 'visible' });
    await this.clickElement('carousel_indicator_1');
  }

  /**
   * Click the active carousel slide 1 image link
   */
  async clickCarouselSlide1Link(): Promise<void> {
    await this.waitForElement('carousel_slide_1_link', { state: 'visible' });
    await this.clickElement('carousel_slide_1_link');
  }

  // ─── ⑤ Atomic Actions — Products ────────────────────────────────────────────

  /**
   * Click the Hummingbird printed t-shirt product thumbnail link
   * @remarks Navigates to the product detail page
   */
  async clickProductHummingbirdTshirtLink(): Promise<void> {
    await this.waitForElement('product_hummingbird_tshirt_link', { state: 'visible' });
    await this.clickElement('product_hummingbird_tshirt_link');
  }

  /**
   * Click the Hummingbird printed t-shirt product title link
   * @remarks text: "Hummingbird printed t-shirt"
   */
  async clickProductHummingbirdTshirtTitle(): Promise<void> {
    await this.waitForElement('product_hummingbird_tshirt_title', { state: 'visible' });
    await this.clickElement('product_hummingbird_tshirt_title');
  }

  /**
   * Click the Quick view link for the Hummingbird printed t-shirt
   * @remarks text: "Quick view" — opens quick-view modal
   */
  async clickProductHummingbirdTshirtQuickView(): Promise<void> {
    await this.waitForElement('product_hummingbird_tshirt_quick_view', { state: 'visible' });
    await this.clickElement('product_hummingbird_tshirt_quick_view');
  }

  /**
   * Click the Hummingbird printed sweater product thumbnail link
   */
  async clickProductHummingbirdSweaterLink(): Promise<void> {
    await this.waitForElement('product_hummingbird_sweater_link', { state: 'visible' });
    await this.clickElement('product_hummingbird_sweater_link');
  }

  /**
   * Click the Hummingbird printed sweater product title link
   * @remarks text: "Hummingbird printed sweater"
   */
  async clickProductHummingbirdSweaterTitle(): Promise<void> {
    await this.waitForElement('product_hummingbird_sweater_title', { state: 'visible' });
    await this.clickElement('product_hummingbird_sweater_title');
  }

  /**
   * Click the "The best is yet to come" framed poster product thumbnail link
   */
  async clickProductBestIsYetToComePosterLink(): Promise<void> {
    await this.waitForElement('product_best_is_yet_to_come_poster_link', { state: 'visible' });
    await this.clickElement('product_best_is_yet_to_come_poster_link');
  }

  /**
   * Click the "The adventure begins" framed poster product thumbnail link
   */
  async clickProductAdventureBeginsPosterLink(): Promise<void> {
    await this.waitForElement('product_adventure_begins_poster_link', { state: 'visible' });
    await this.clickElement('product_adventure_begins_poster_link');
  }

  /**
   * Click the "Today is a good day" framed poster product thumbnail link
   */
  async clickProductTodayGoodDayPosterLink(): Promise<void> {
    await this.waitForElement('product_today_good_day_poster_link', { state: 'visible' });
    await this.clickElement('product_today_good_day_poster_link');
  }

  /**
   * Click the Mug "The best is yet to come" product thumbnail link
   */
  async clickProductMugBestYetToComeLink(): Promise<void> {
    await this.waitForElement('product_mug_best_yet_to_come_link', { state: 'visible' });
    await this.clickElement('product_mug_best_yet_to_come_link');
  }

  /**
   * Click the Mug "The adventure begins" product thumbnail link
   */
  async clickProductMugAdventureBeginsLink(): Promise<void> {
    await this.waitForElement('product_mug_adventure_begins_link', { state: 'visible' });
    await this.clickElement('product_mug_adventure_begins_link');
  }

  /**
   * Click the Mug "Today is a good day" product thumbnail link
   */
  async clickProductMugTodayGoodDayLink(): Promise<void> {
    await this.waitForElement('product_mug_today_good_day_link', { state: 'visible' });
    await this.clickElement('product_mug_today_good_day_link');
  }

  /**
   * Click the White colour variant swatch on the Hummingbird printed t-shirt card
   * @remarks aria-label: "White"
   */
  async clickProductTshirtColorWhite(): Promise<void> {
    await this.waitForElement('product_tshirt_color_white', { state: 'visible' });
    await this.clickElement('product_tshirt_color_white');
  }

  /**
   * Click the Black colour variant swatch on the Hummingbird printed t-shirt card
   * @remarks aria-label: "Black"
   */
  async clickProductTshirtColorBlack(): Promise<void> {
    await this.waitForElement('product_tshirt_color_black', { state: 'visible' });
    await this.clickElement('product_tshirt_color_black');
  }

  // ─── ⑤ Atomic Actions — Wishlist ────────────────────────────────────────────

  /**
   * Click the wishlist "Add" button on the Hummingbird printed t-shirt product card
   * @remarks Opens the wishlist selection / sign-in modal
   */
  async clickProductHummingbirdTshirtWishlist(): Promise<void> {
    await this.waitForElement('product_hummingbird_tshirt_wishlist', { state: 'visible' });
    await this.clickElement('product_hummingbird_tshirt_wishlist');
  }

  /**
   * Click the close (×) button on the wishlist "My wishlists" modal
   */
  async clickWishlistModalCloseButton(): Promise<void> {
    await this.waitForElement('wishlist_modal_close_button', { state: 'visible' });
    await this.clickElement('wishlist_modal_close_button');
  }

  /**
   * Click the "Create new list" link in the wishlist add-to modal
   * @remarks text: "Create new list"
   */
  async clickWishlistCreateNewListLink(): Promise<void> {
    await this.waitForElement('wishlist_create_new_list_link', { state: 'visible' });
    await this.clickElement('wishlist_create_new_list_link');
  }

  /**
   * Click the Cancel button in the wishlist delete confirmation modal
   */
  async clickWishlistDeleteModalCancelButton(): Promise<void> {
    await this.waitForElement('wishlist_delete_modal_cancel_button', { state: 'visible' });
    await this.clickElement('wishlist_delete_modal_cancel_button');
  }

  /**
   * Click the Delete/confirm button in the wishlist delete confirmation modal
   * @remarks wait_strategy: enabled — wait for button to become active before clicking
   */
  async clickWishlistDeleteModalDeleteButton(): Promise<void> {
    await this.waitForElement('wishlist_delete_modal_delete_button', { state: 'enabled' });
    await this.clickElement('wishlist_delete_modal_delete_button');
  }

  /**
   * Enter a name in the create-new-wishlist modal name input
   * @param value - Wishlist name (required, non-empty)
   */
  async enterWishlistCreateNameInput(value: string): Promise<void> {
    if (!value?.trim()) {
      throw new Error('Wishlist name cannot be empty');
    }
    await this.waitForElement('wishlist_create_name_input', { state: 'visible' });
    await this.fillElement('wishlist_create_name_input', value);
  }

  /**
   * Click the Cancel button in the create-new-wishlist modal
   * @remarks text: "Cancel"
   */
  async clickWishlistCreateCancelButton(): Promise<void> {
    await this.waitForElement('wishlist_create_cancel_button', { state: 'visible' });
    await this.clickElement('wishlist_create_cancel_button');
  }

  /**
   * Click the Create wishlist submit button in the create-new-wishlist modal
   * @remarks text: "Create wishlist" — wait_strategy: enabled
   */
  async clickWishlistCreateSubmitButton(): Promise<void> {
    await this.waitForElement('wishlist_create_submit_button', { state: 'enabled' });
    await this.clickElement('wishlist_create_submit_button');
  }

  /**
   * Click the close (×) button on the wishlist sign-in required modal
   */
  async clickWishlistLoginModalCloseButton(): Promise<void> {
    await this.waitForElement('wishlist_login_modal_close_button', { state: 'visible' });
    await this.clickElement('wishlist_login_modal_close_button');
  }

  /**
   * Click the Cancel button in the wishlist sign-in required modal
   * @remarks text: "Cancel"
   */
  async clickWishlistLoginModalCancelButton(): Promise<void> {
    await this.waitForElement('wishlist_login_modal_cancel_button', { state: 'visible' });
    await this.clickElement('wishlist_login_modal_cancel_button');
  }

  /**
   * Click the Sign in button link in the wishlist login-required modal
   * @remarks text: "Sign in"
   */
  async clickWishlistLoginModalSignInButton(): Promise<void> {
    await this.waitForElement('wishlist_login_modal_sign_in_button', { state: 'visible' });
    await this.clickElement('wishlist_login_modal_sign_in_button');
  }

  // ─── ⑤ Atomic Actions — Newsletter ──────────────────────────────────────────

  /**
   * Enter an email address in the newsletter subscription input
   * @param email - Valid email address (required)
   */
  async enterNewsletterEmailInput(email: string): Promise<void> {
    if (!email?.trim()) {
      throw new Error('Newsletter email address cannot be empty');
    }
    await this.waitForElement('newsletter_email_input', { state: 'visible' });
    await this.fillElement('newsletter_email_input', email);
  }

  /**
   * Click the Newsletter Subscribe button (desktop version)
   * @remarks text: "Subscribe" — wait_strategy: enabled
   */
  async clickNewsletterSubscribeButtonDesktop(): Promise<void> {
    await this.waitForElement('newsletter_subscribe_button_desktop', { state: 'enabled' });
    await this.clickElement('newsletter_subscribe_button_desktop');
  }

  /**
   * Click the Newsletter Subscribe button (mobile version)
   * @remarks text: "OK" — wait_strategy: enabled
   */
  async clickNewsletterSubscribeButtonMobile(): Promise<void> {
    await this.waitForElement('newsletter_subscribe_button_mobile', { state: 'enabled' });
    await this.clickElement('newsletter_subscribe_button_mobile');
  }

  // ─── ⑤ Atomic Actions — Footer Navigation ───────────────────────────────────

  /**
   * Click the "Prices drop" link in the footer Products section
   * @remarks text: "Prices drop"
   */
  async clickFooterPricesDropLink(): Promise<void> {
    await this.waitForElement('footer_prices_drop_link', { state: 'visible' });
    await this.clickElement('footer_prices_drop_link');
  }

  /**
   * Click the "New products" link in the footer Products section
   * @remarks text: "New products"
   */
  async clickFooterNewProductsLink(): Promise<void> {
    await this.waitForElement('footer_new_products_link', { state: 'visible' });
    await this.clickElement('footer_new_products_link');
  }

  /**
   * Click the "Best sellers" link in the footer Products section
   * @remarks text: "Best sellers"
   */
  async clickFooterBestSellersLink(): Promise<void> {
    await this.waitForElement('footer_best_sellers_link', { state: 'visible' });
    await this.clickElement('footer_best_sellers_link');
  }

  /**
   * Click the "Delivery" information link in the footer Our Company section
   * @remarks text: "Delivery"
   */
  async clickFooterDeliveryLink(): Promise<void> {
    await this.waitForElement('footer_delivery_link', { state: 'visible' });
    await this.clickElement('footer_delivery_link');
  }

  /**
   * Click the "Legal Notice" link in the footer Our Company section
   * @remarks text: "Legal Notice"
   */
  async clickFooterLegalNoticeLink(): Promise<void> {
    await this.waitForElement('footer_legal_notice_link', { state: 'visible' });
    await this.clickElement('footer_legal_notice_link');
  }

  /**
   * Click the "Terms and conditions of use" link in the footer Our Company section
   * @remarks text: "Terms and conditions of use"
   */
  async clickFooterTermsConditionsLink(): Promise<void> {
    await this.waitForElement('footer_terms_conditions_link', { state: 'visible' });
    await this.clickElement('footer_terms_conditions_link');
  }

  /**
   * Click the "About us" link in the footer Our Company section
   * @remarks text: "About us"
   */
  async clickFooterAboutUsLink(): Promise<void> {
    await this.waitForElement('footer_about_us_link', { state: 'visible' });
    await this.clickElement('footer_about_us_link');
  }

  /**
   * Click the "Secure payment" link in the footer Our Company section
   * @remarks text: "Secure payment"
   */
  async clickFooterSecurePaymentLink(): Promise<void> {
    await this.waitForElement('footer_secure_payment_link', { state: 'visible' });
    await this.clickElement('footer_secure_payment_link');
  }

  /**
   * Click the "Contact us" link in the footer Our Company section
   * @remarks text: "Contact us"
   */
  async clickFooterContactUsLink(): Promise<void> {
    await this.waitForElement('footer_contact_us_link', { state: 'visible' });
    await this.clickElement('footer_contact_us_link');
  }

  /**
   * Click the "Sitemap" link in the footer Our Company section
   * @remarks text: "Sitemap"
   */
  async clickFooterSitemapLink(): Promise<void> {
    await this.waitForElement('footer_sitemap_link', { state: 'visible' });
    await this.clickElement('footer_sitemap_link');
  }

  /**
   * Click the "Stores" link in the footer Our Company section
   * @remarks text: "Stores"
   */
  async clickFooterStoresLink(): Promise<void> {
    await this.waitForElement('footer_stores_link', { state: 'visible' });
    await this.clickElement('footer_stores_link');
  }

  /**
   * Click the "Your account" heading link in the footer
   * @remarks Navigates to /en/my-account
   */
  async clickFooterYourAccountHeadingLink(): Promise<void> {
    await this.waitForElement('footer_your_account_heading_link', { state: 'visible' });
    await this.clickElement('footer_your_account_heading_link');
  }

  /**
   * Click the "Order tracking" link in the footer Your Account section
   * @remarks text: "Order tracking"
   */
  async clickFooterOrderTrackingLink(): Promise<void> {
    await this.waitForElement('footer_order_tracking_link', { state: 'visible' });
    await this.clickElement('footer_order_tracking_link');
  }

  /**
   * Click the "Create account" link in the footer Your Account section
   * @remarks text: "Create account"
   */
  async clickFooterCreateAccountLink(): Promise<void> {
    await this.waitForElement('footer_create_account_link', { state: 'visible' });
    await this.clickElement('footer_create_account_link');
  }

  /**
   * Click the "My alerts" link in the footer Your Account section
   * @remarks text: "My alerts"
   */
  async clickFooterMyAlertsLink(): Promise<void> {
    await this.waitForElement('footer_my_alerts_link', { state: 'visible' });
    await this.clickElement('footer_my_alerts_link');
  }

  /**
   * Click the store email address link in the footer contact block
   * @remarks text: "lokendra.sharma@ltimindtree.com"
   */
  async clickFooterStoreEmailLink(): Promise<void> {
    await this.waitForElement('footer_store_email_link', { state: 'visible' });
    await this.clickElement('footer_store_email_link');
  }

  /**
   * Click the PrestaShop copyright link at the very bottom of the page
   */
  async clickFooterCopyrightLink(): Promise<void> {
    await this.waitForElement('footer_copyright_link', { state: 'visible' });
    await this.clickElement('footer_copyright_link');
  }

  // ─── ⑦ State / Getter Methods ────────────────────────────────────────────────

  /**
   * Get the cart product count badge text
   * @returns e.g. "(0)" or "(3)"
   */
  async getCartProductsCountText(): Promise<string> {
    const text = await this.getElementText('cart_products_count');
    return text?.trim() || '';
  }

  /**
   * Get the Popular Products section heading text
   * @returns "Popular Products"
   */
  async getPopularProductsHeadingText(): Promise<string> {
    const text = await this.getElementText('popular_products_heading');
    return text?.trim() || '';
  }

  /**
   * Get the Hummingbird printed t-shirt product title text
   * @returns "Hummingbird printed t-shirt"
   */
  async getProductHummingbirdTshirtTitleText(): Promise<string> {
    const text = await this.getElementText('product_hummingbird_tshirt_title');
    return text?.trim() || '';
  }

  /**
   * Get the Hummingbird printed sweater product title text
   * @returns "Hummingbird printed sweater"
   */
  async getProductHummingbirdSweaterTitleText(): Promise<string> {
    const text = await this.getElementText('product_hummingbird_sweater_title');
    return text?.trim() || '';
  }

  /**
   * Get the On Sale section heading text
   * @returns "On sale"
   */
  async getOnSaleHeadingText(): Promise<string> {
    const text = await this.getElementText('on_sale_heading');
    return text?.trim() || '';
  }

  /**
   * Get the New Products section heading text
   * @returns "New products"
   */
  async getNewProductsHeadingText(): Promise<string> {
    const text = await this.getElementText('new_products_heading');
    return text?.trim() || '';
  }

  /**
   * Get the newsletter block label/heading text
   * @returns "Get our latest news and special sales"
   */
  async getNewsletterLabelText(): Promise<string> {
    const text = await this.getElementText('newsletter_label');
    return text?.trim() || '';
  }

  /**
   * Get the footer Products section heading text
   * @returns "Products"
   */
  async getFooterProductsHeadingText(): Promise<string> {
    const text = await this.getElementText('footer_products_heading');
    return text?.trim() || '';
  }

  /**
   * Get the wishlist create name label text
   * @returns "Wishlist name"
   */
  async getWishlistCreateNameLabelText(): Promise<string> {
    const text = await this.getElementText('wishlist_create_name_label');
    return text?.trim() || '';
  }

  /**
   * Get the footer copyright text
   * @returns "© 2026 - Ecommerce software by PrestaShop™"
   */
  async getFooterCopyrightLinkText(): Promise<string> {
    const text = await this.getElementText('footer_copyright_link');
    return text?.trim() || '';
  }

  /**
   * Get the store contact email text shown in the footer
   * @returns "lokendra.sharma@ltimindtree.com"
   */
  async getFooterStoreEmailLinkText(): Promise<string> {
    const text = await this.getElementText('footer_store_email_link');
    return text?.trim() || '';
  }

  /**
   * Check whether the wishlist add-to modal is currently visible
   * @returns true when the wishlist chooser modal is open
   */
  async isWishlistModalVisible(): Promise<boolean> {
    return await super.isElementVisible('wishlist_modal_close_button');
  }

  /**
   * Check whether the wishlist create-new-list modal is visible
   * @returns true when the create wishlist form dialog is open
   */
  async isWishlistCreateModalVisible(): Promise<boolean> {
    return await super.isElementVisible('wishlist_create_name_input');
  }

  /**
   * Check whether the wishlist login-required modal is visible
   * @returns true when the sign-in prompt modal is open
   */
  async isWishlistLoginModalVisible(): Promise<boolean> {
    return await super.isElementVisible('wishlist_login_modal_close_button');
  }

  /**
   * Check whether the wishlist delete confirmation modal is visible
   * @returns true when the delete confirmation dialog is open
   */
  async isWishlistDeleteModalVisible(): Promise<boolean> {
    return await super.isElementVisible('wishlist_delete_modal_cancel_button');
  }

  /**
   * Check whether the carousel is visible on the page
   * @returns true when the carousel prev/next buttons are visible
   */
  async isCarouselVisible(): Promise<boolean> {
    return await super.isElementVisible('carousel_prev_button');
  }

  /**
   * Check whether the search input is visible
   * @returns true when the header search widget is loaded
   */
  async isSearchInputVisible(): Promise<boolean> {
    return await super.isElementVisible('search_input');
  }

  // ─── ⑥ Business Workflow Methods ────────────────────────────────────────────

  /**
   * Switch the store language using the desktop dropdown.
   * Opens the dropdown then clicks the matching language option.
   *
   * @param language - "English" | "Tamil"
   * @throws Error if an unrecognised language is provided
   */
  async switchLanguage(language: 'English' | 'Tamil'): Promise<void> {
    await this.clickLanguageDropdownButton();

    switch (language) {
      case 'English':
        await this.clickLanguageOptionEnglish();
        break;
      case 'Tamil':
        await this.clickLanguageOptionTamil();
        break;
      default:
        throw new Error(`Unknown language option: "${language}"`);
    }
  }

  /**
   * Search for a product by entering the search term and pressing Enter.
   *
   * @param term - Product search term (min 2 characters)
   */
  async searchForProduct(term: string): Promise<void> {
    await this.enterSearchInput(term);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Navigate to a top-level category from the main navigation.
   *
   * @param category - "Clothes" | "Accessories" | "Art"
   * @throws Error if an unrecognised category is provided
   */
  async navigateToCategory(category: 'Clothes' | 'Accessories' | 'Art'): Promise<void> {
    switch (category) {
      case 'Clothes':
        await this.clickNavClothesLink();
        break;
      case 'Accessories':
        await this.clickNavAccessoriesLink();
        break;
      case 'Art':
        await this.clickNavArtLink();
        break;
      default:
        throw new Error(`Unknown category: "${category}"`);
    }
  }

  /**
   * Add the Hummingbird t-shirt to a named wishlist.
   * If the user is not signed in this will trigger the login-required modal.
   *
   * @param wishlistName - Name of the wishlist to create (optional)
   * @param isLoggedIn   - Pass false if the customer is a guest (default false)
   */
  async addHummingbirdTshirtToWishlist(
    wishlistName?: string,
    isLoggedIn = false
  ): Promise<void> {
    await this.clickProductHummingbirdTshirtWishlist();

    if (!isLoggedIn) {
      // Guest user — sign-in modal will appear; dismiss it
      const loginModalVisible = await super.isElementVisible(
        'wishlist_login_modal_close_button',
        3000
      );
      if (loginModalVisible) {
        await this.clickWishlistLoginModalCancelButton();
      }
      return;
    }

    // Authenticated user — wishlist chooser modal appears
    await this.waitForElement('wishlist_modal_close_button', { state: 'visible' });

    if (wishlistName) {
      // Create a new wishlist with the given name
      await this.clickWishlistCreateNewListLink();
      await this.waitForElement('wishlist_create_name_input', { state: 'visible' });
      await this.enterWishlistCreateNameInput(wishlistName);
      await this.clickWishlistCreateSubmitButton();
    } else {
      // Close without selecting — caller handles selection externally
      await this.clickWishlistModalCloseButton();
    }
  }

  /**
   * Subscribe to the newsletter using the desktop subscription form.
   *
   * @param email - Valid email address
   */
  async subscribeToNewsletter(email: string): Promise<void> {
    await this.enterNewsletterEmailInput(email);
    await this.clickNewsletterSubscribeButtonDesktop();
  }

  /**
   * Navigate to the Clothes > Men sub-category via the top navigation menu.
   */
  async navigateToClothesMen(): Promise<void> {
    await this.clickNavClothesLink();
    await this.clickNavClothesMenLink();
  }

  /**
   * Navigate to the Clothes > Women sub-category via the top navigation menu.
   */
  async navigateToClothesWomen(): Promise<void> {
    await this.clickNavClothesLink();
    await this.clickNavClothesWomenLink();
  }

  /**
   * Navigate to the Accessories > Stationery sub-category.
   */
  async navigateToAccessoriesStationery(): Promise<void> {
    await this.clickNavAccessoriesLink();
    await this.clickNavAccessoriesStationeryLink();
  }

  /**
   * Navigate to the Accessories > Home Accessories sub-category.
   */
  async navigateToAccessoriesHome(): Promise<void> {
    await this.clickNavAccessoriesLink();
    await this.clickNavAccessoriesHomeLink();
  }

  /**
   * Handle the wishlist delete confirmation modal.
   *
   * @param confirm - true = click Delete button; false = click Cancel
   */
  async handleWishlistDeleteModal(confirm: boolean): Promise<void> {
    await this.waitForElement('wishlist_delete_modal_cancel_button', { state: 'visible' });

    if (confirm) {
      await this.clickWishlistDeleteModalDeleteButton();
    } else {
      await this.clickWishlistDeleteModalCancelButton();
    }
  }
}
