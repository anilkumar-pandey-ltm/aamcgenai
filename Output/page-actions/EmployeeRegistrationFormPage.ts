import { Page } from '@playwright/test';
import { BasePage } from '../../framework/core/basePage';

/**
 * Page Actions: EmployeeRegistrationFormPage
 * Story: POCTC-83 / US-UI-004 - Secure Admin Authentication & Employee Registration Form Access
 * YAML Source: Output/page-object/US-UI-004_employee_form_locators.yaml
 * Generated: 2026-02-24
 *
 * COVERAGE:
 *  - Department selection (native select + custom searchable dropdown)
 *  - Designation selection (native select + custom searchable dropdown)
 *  - Employee basic info fields (name, email)
 *  - Form submission (save / submit)
 *  - Validation error handling (field errors, summary, tooltips)
 *  - Dialog handling (unsaved changes, session expiry, dept change confirmation)
 *  - Data loading error recovery (retry button)
 *  - Business workflows (org assignment, form fill, submit, dialog handling)
 *
 * CONTRACT:
 *  - NO assertions / expect() / assert calls — pure interaction layer only
 *  - Every interactive method has a defensive waitForElement before action
 *  - All BasePage method calls use YAML key strings, never raw selectors
 *  - Business methods compose atomic actions — no direct BasePage calls
 */
export class EmployeeRegistrationFormPage extends BasePage {
  public readonly page: Page;

  // ─── ① Constructor ───────────────────────────────────────────────────────────

  constructor(page: Page) {
    super(page, 'US-UI-004_employee_form_locators');
    this.page = page;
  }

  // ─── ④ Navigation ────────────────────────────────────────────────────────────

  /**
   * Navigate directly to the employee registration form in the admin panel
   */
  async navigateToPage(): Promise<void> {
    await this.navigateTo(
      'http://localhost/admin/index.php?controller=AdminEmployees&action=new'
    );
  }

  // ─── ⑤ Atomic Actions — Employee Basic Info inputs ──────────────────────────

  /**
   * Enter the employee's full name
   * @param value - Full name (required, non-empty)
   * @testid employee_name_input
   */
  async enterEmployeeNameInput(value: string): Promise<void> {
    if (!value?.trim()) {
      throw new Error('Employee name cannot be empty');
    }
    await this.waitForElement('employee_name_input', { state: 'visible' });
    await this.fillElement('employee_name_input', value);
  }

  /**
   * Enter the employee's work email address
   * @param value - Work email address (required, valid email format)
   * @testid employee_email_input
   */
  async enterEmployeeEmailInput(value: string): Promise<void> {
    if (!value?.trim()) {
      throw new Error('Employee email cannot be empty');
    }
    await this.waitForElement('employee_email_input', { state: 'visible' });
    await this.fillElement('employee_email_input', value);
  }

  // ─── ⑤ Atomic Actions — Department Dropdown ─────────────────────────────────

  /**
   * Open the custom searchable department dropdown via trigger button
   * @remarks Department dropdown trigger button for custom searchable dropdown (text: "Select Department")
   */
  async clickDepartmentDropdownButton(): Promise<void> {
    await this.waitForElement('department_dropdown_button', { state: 'visible' });
    await this.clickElement('department_dropdown_button');
  }

  /**
   * Type a search query in the department search input to filter the list
   * @param value - Partial or full department name for filtering (case-insensitive)
   * @testid departmentSearchInput
   */
  async enterDepartmentSearchInput(value: string): Promise<void> {
    await this.waitForElement('department_search_input', { state: 'visible' });
    await this.fillElement('department_search_input', value);
  }

  /**
   * Select an option from the native department select element by visible label
   * @param option - Visible label of the department option to select
   * @testid departmentSelect
   */
  async selectDepartmentDropdown(option: string): Promise<void> {
    const el = await this.waitForElement('department_dropdown', { state: 'visible' });
    await el.selectOption({ label: option });
  }

  /**
   * Click the Engineering department option in the custom dropdown list
   * @remarks Department: Engineering (DEPT-001)
   */
  async clickDepartmentOptionEngineering(): Promise<void> {
    await this.waitForElement('department_option_engineering', { state: 'visible' });
    await this.clickElement('department_option_engineering');
  }

  /**
   * Click the Human Resources department option in the custom dropdown list
   * @remarks Department: Human Resources (DEPT-002)
   */
  async clickDepartmentOptionHr(): Promise<void> {
    await this.waitForElement('department_option_hr', { state: 'visible' });
    await this.clickElement('department_option_hr');
  }

  /**
   * Click the Sales department option in the custom dropdown list
   * @remarks Department: Sales (DEPT-003)
   */
  async clickDepartmentOptionSales(): Promise<void> {
    await this.waitForElement('department_option_sales', { state: 'visible' });
    await this.clickElement('department_option_sales');
  }

  /**
   * Click the Marketing department option in the custom dropdown list
   * @remarks Department: Marketing (DEPT-004)
   */
  async clickDepartmentOptionMarketing(): Promise<void> {
    await this.waitForElement('department_option_marketing', { state: 'visible' });
    await this.clickElement('department_option_marketing');
  }

  /**
   * Click the Finance department option in the custom dropdown list
   * @remarks Department: Finance (DEPT-005)
   */
  async clickDepartmentOptionFinance(): Promise<void> {
    await this.waitForElement('department_option_finance', { state: 'visible' });
    await this.clickElement('department_option_finance');
  }

  // ─── ⑤ Atomic Actions — Designation Dropdown ────────────────────────────────

  /**
   * Open the custom searchable designation dropdown via trigger button
   * @remarks Designation dropdown trigger button (text: "Select Designation")
   * @dependencies designation list is filtered by selected department — select dept first
   */
  async clickDesignationDropdownButton(): Promise<void> {
    await this.waitForElement('designation_dropdown_button', { state: 'visible' });
    await this.clickElement('designation_dropdown_button');
  }

  /**
   * Type a search query in the designation search input to filter the list
   * @param value - Partial or full designation name for filtering (case-insensitive)
   * @testid designationSearchInput
   */
  async enterDesignationSearchInput(value: string): Promise<void> {
    await this.waitForElement('designation_search_input', { state: 'visible' });
    await this.fillElement('designation_search_input', value);
  }

  /**
   * Select an option from the native designation select element by visible label
   * @param option - Visible label of the designation option to select
   * @testid designationSelect
   */
  async selectDesignationDropdown(option: string): Promise<void> {
    const el = await this.waitForElement('designation_dropdown', { state: 'visible' });
    await el.selectOption({ label: option });
  }

  /**
   * Click the Senior Developer designation option in the custom dropdown list
   * @remarks Designation: Senior Developer (DESIG-101) — available under Engineering
   */
  async clickDesignationOptionSeniorDeveloper(): Promise<void> {
    await this.waitForElement('designation_option_senior_developer', { state: 'visible' });
    await this.clickElement('designation_option_senior_developer');
  }

  /**
   * Click the HR Manager designation option in the custom dropdown list
   * @remarks Designation: HR Manager (DESIG-102) — available under Human Resources
   */
  async clickDesignationOptionHrManager(): Promise<void> {
    await this.waitForElement('designation_option_hr_manager', { state: 'visible' });
    await this.clickElement('designation_option_hr_manager');
  }

  /**
   * Click the Sales Executive designation option in the custom dropdown list
   * @remarks Designation: Sales Executive (DESIG-103) — available under Sales
   */
  async clickDesignationOptionSalesExecutive(): Promise<void> {
    await this.waitForElement('designation_option_sales_executive', { state: 'visible' });
    await this.clickElement('designation_option_sales_executive');
  }

  // ─── ⑤ Atomic Actions — Form Submission ─────────────────────────────────────

  /**
   * Click the Save button to submit the employee creation form
   * @remarks Triggers validation — all required fields must be completed first
   */
  async clickSaveButton(): Promise<void> {
    await this.waitForElement('save_button', { state: 'visible' });
    await this.clickElement('save_button');
  }

  /**
   * Click the Submit button to finalise employee creation and persist to database
   */
  async clickSubmitButton(): Promise<void> {
    await this.waitForElement('submit_button', { state: 'visible' });
    await this.clickElement('submit_button');
  }

  // ─── ⑤ Atomic Actions — Error Recovery ──────────────────────────────────────

  /**
   * Click the Retry Loading Data button after organisational data load failure
   * @remarks button text: "Retry Loading Data"
   */
  async clickRetryLoadingButton(): Promise<void> {
    await this.waitForElement('retry_loading_button', { state: 'visible' });
    await this.clickElement('retry_loading_button');
  }

  // ─── ⑤ Atomic Actions — Dialog Buttons ──────────────────────────────────────

  /**
   * Click the Leave button in the unsaved-changes / navigation-away dialog
   * @remarks Discards all unsaved form data and navigates away (text: "Leave")
   */
  async clickDialogLeaveButton(): Promise<void> {
    await this.waitForElement('dialog_leave_button', { state: 'visible' });
    await this.clickElement('dialog_leave_button');
  }

  /**
   * Click the Stay button in the unsaved-changes dialog to remain on the form
   * @remarks Preserves all current form selections (text: "Stay")
   */
  async clickDialogStayButton(): Promise<void> {
    await this.waitForElement('dialog_stay_button', { state: 'visible' });
    await this.clickElement('dialog_stay_button');
  }

  /**
   * Click the Save and Leave button in the unsaved-changes dialog
   * @remarks Saves current form data then navigates away (text: "Save and Leave")
   */
  async clickDialogSaveAndLeaveButton(): Promise<void> {
    await this.waitForElement('dialog_save_and_leave_button', { state: 'visible' });
    await this.clickElement('dialog_save_and_leave_button');
  }

  // ─── ⑤ Atomic Actions — Navigation Link ─────────────────────────────────────

  /**
   * Click the scroll-to-field link in the validation summary to jump to the missing field
   * @remarks Clickable link in validation summary that auto-scrolls to the department field
   */
  async clickScrollToFieldLink(): Promise<void> {
    await this.waitForElement('scroll_to_field_link', { state: 'visible' });
    await this.clickElement('scroll_to_field_link');
  }

  // ─── ⑦ State / Getter Methods ────────────────────────────────────────────────

  /**
   * Get the currently selected department name shown in the display span
   * @returns Selected department label or empty string if none selected
   */
  async getDepartmentSelectedDisplayText(): Promise<string> {
    const text = await this.getElementText('department_selected_display');
    return text?.trim() || '';
  }

  /**
   * Get the currently selected designation name shown in the display span
   * @returns Selected designation label or empty string if none selected
   */
  async getDesignationSelectedDisplayText(): Promise<string> {
    const text = await this.getElementText('designation_selected_display');
    return text?.trim() || '';
  }

  /**
   * Get the inline validation error text for the department field
   * @returns Error text such as "Department selection is required" or empty string
   */
  async getDepartmentValidationErrorText(): Promise<string> {
    const text = await this.getElementText('department_validation_error');
    return text?.trim() || '';
  }

  /**
   * Get the inline validation error text for the designation field
   * @returns Error text such as "Designation selection is required" or empty string
   */
  async getDesignationValidationErrorText(): Promise<string> {
    const text = await this.getElementText('designation_validation_error');
    return text?.trim() || '';
  }

  /**
   * Get the main validation summary message at top of form
   * @returns Summary text such as "Complete all required organizational assignments" or empty string
   */
  async getValidationSummaryMessageText(): Promise<string> {
    const text = await this.getElementText('validation_summary_message');
    return text?.trim() || '';
  }

  /**
   * Get the data loading error message displayed when org data fetch fails
   * @returns Error text such as "Unable to load departments. Please try again." or empty string
   */
  async getDataLoadingErrorMessageText(): Promise<string> {
    const text = await this.getElementText('data_loading_error_message');
    return text?.trim() || '';
  }

  /**
   * Get the session expiry modal message text
   * @returns Session expiry text such as "Session expired. Please log in." or empty string
   */
  async getSessionExpiryMessageText(): Promise<string> {
    const text = await this.getElementText('session_expiry_message');
    return text?.trim() || '';
  }

  /**
   * Get the unsaved changes dialog warning message text
   * @returns Warning text such as "You have unsaved changes. Leave page?" or empty string
   */
  async getUnsavedChangesMessageText(): Promise<string> {
    const text = await this.getElementText('unsaved_changes_message');
    return text?.trim() || '';
  }

  /**
   * Get the department change confirmation dialog message text
   * @returns Warning about designation needing update or empty string
   */
  async getDepartmentChangeMessageText(): Promise<string> {
    const text = await this.getElementText('department_change_message');
    return text?.trim() || '';
  }

  /**
   * Get the organisational section status badge value (e.g. "valid" / "invalid")
   * @returns Badge text or empty string
   */
  async getFormValidStateBadgeText(): Promise<string> {
    const text = await this.getElementText('form_valid_state_badge');
    return text?.trim() || '';
  }

  /**
   * Get the dropdown filter count text after a search query (e.g. "3 results")
   * @returns Count indicator text or empty string
   */
  async getDropdownFilterCountText(): Promise<string> {
    const text = await this.getElementText('dropdown_filter_count');
    return text?.trim() || '';
  }

  /**
   * Check whether the designation tooltip (validation hint) is currently visible
   * @remarks tooltip text: "Designation is required"
   * @returns true if the tooltip is visible
   */
  async isDesignationTooltipVisible(): Promise<boolean> {
    return await super.isElementVisible('designation_tooltip');
  }

  /**
   * Check whether the session expiry modal dialog is visible
   * @returns true when the session has expired and the modal is displayed
   */
  async isSessionExpiryDialogVisible(): Promise<boolean> {
    return await super.isElementVisible('session_expiry_dialog');
  }

  /**
   * Check whether the unsaved-changes confirmation dialog is visible
   * @returns true when user attempts to navigate away with unsaved data
   */
  async isUnsavedChangesDialogVisible(): Promise<boolean> {
    return await super.isElementVisible('unsaved_changes_dialog');
  }

  /**
   * Check whether the department-change confirmation dialog is visible
   * @remarks Triggered when user changes department after already selecting a designation
   * @returns true when the designation-reset warning dialog is displayed
   */
  async isDepartmentChangeConfirmationDialogVisible(): Promise<boolean> {
    return await super.isElementVisible('department_change_confirmation_dialog');
  }

  /**
   * Check whether the visual confirmation checkmark is visible after a successful selection
   * @remarks icon text: "✓"
   * @returns true when a field selection has been confirmed with tick indicator
   */
  async isVisualConfirmationIndicatorVisible(): Promise<boolean> {
    return await super.isElementVisible('visual_confirmation_indicator');
  }

  /**
   * Check whether the dropdown loading spinner is currently visible
   * @remarks Visible while org data is being fetched from server
   * @returns true during data loading
   */
  async isDropdownLoadingSpinnerVisible(): Promise<boolean> {
    return await super.isElementVisible('dropdown_loading_spinner');
  }

  // ─── ⑥ Business Workflow Methods ────────────────────────────────────────────

  /**
   * Select a department using the custom searchable dropdown workflow:
   * open button → enter search query → wait for results → click matching option.
   * Falls back to native <select> if custom option element is not found.
   *
   * @param department - Department name (e.g. "Engineering", "Human Resources",
   *                     "Sales", "Marketing", "Finance")
   */
  async selectDepartmentWithSearch(department: string): Promise<void> {
    this.stepLogger.logAction('Select department with search', department);

    await this.clickDepartmentDropdownButton();
    await this.enterDepartmentSearchInput(department);

    await this.waitForDropdownDataLoaded(5000);

    const normalised = department.toLowerCase().replace(/[\s-]+/g, '_');
    const optionKey = `department_option_${normalised}`;

    const optionVisible = await super.isElementVisible(optionKey, 3000);
    if (optionVisible) {
      await this.clickElement(optionKey);
    } else {
      await this.selectDepartmentDropdown(department);
    }
  }

  /**
   * Select a designation using the custom searchable dropdown workflow.
   * Department must be selected first — the designation list is filtered by department.
   * Falls back to native <select> if custom option element is not found.
   *
   * @param designation - Designation name (e.g. "Senior Developer", "HR Manager",
   *                      "Sales Executive")
   */
  async selectDesignationWithSearch(designation: string): Promise<void> {
    this.stepLogger.logAction('Select designation with search', designation);

    await this.clickDesignationDropdownButton();
    await this.enterDesignationSearchInput(designation);

    await this.waitForDropdownDataLoaded(5000);

    const normalised = designation.toLowerCase().replace(/[\s-]+/g, '_');
    const optionKey = `designation_option_${normalised}`;

    const optionVisible = await super.isElementVisible(optionKey, 3000);
    if (optionVisible) {
      await this.clickElement(optionKey);
    } else {
      await this.selectDesignationDropdown(designation);
    }
  }

  /**
   * Assign complete organisational details:
   * 1. Select department (via searchable dropdown)
   * 2. Wait for designation list to reload
   * 3. Select designation (via searchable dropdown)
   *
   * @param department  - Department name (e.g. "Engineering")
   * @param designation - Designation name (e.g. "Senior Developer")
   */
  async assignOrganizationalDetails(
    department: string,
    designation: string
  ): Promise<void> {
    this.stepLogger.logAction(
      'Assign organizational details',
      `Department: ${department} | Designation: ${designation}`
    );

    await this.selectDepartmentWithSearch(department);
    await this.waitForDesignationListToLoad();
    await this.selectDesignationWithSearch(designation);
  }

  /**
   * Fill all basic employee information fields on the registration form.
   *
   * @param name  - Employee full name
   * @param email - Employee work email address
   */
  async fillEmployeeBasicInfo(name: string, email: string): Promise<void> {
    this.stepLogger.logAction('Fill employee basic info', `${name} | ${email}`);
    await this.enterEmployeeNameInput(name);
    await this.enterEmployeeEmailInput(email);
  }

  /**
   * Complete end-to-end employee creation form submission:
   * fill basic info → assign org details → click Save.
   *
   * @param name        - Employee full name
   * @param email       - Employee work email address
   * @param department  - Department name
   * @param designation - Designation name
   */
  async submitEmployeeCreationForm(
    name: string,
    email: string,
    department: string,
    designation: string
  ): Promise<void> {
    this.stepLogger.logAction(
      'Submit employee creation form',
      `${name} | ${email} | ${department} | ${designation}`
    );

    await this.fillEmployeeBasicInfo(name, email);
    await this.assignOrganizationalDetails(department, designation);
    await this.clickSaveButton();
  }

  /**
   * Handle the unsaved-changes navigation-away dialog.
   *
   * @param action - "leave" | "stay" | "save-and-leave"
   * @throws Error if an unrecognised action value is provided
   */
  async handleUnsavedChangesDialog(
    action: 'leave' | 'stay' | 'save-and-leave'
  ): Promise<void> {
    await this.waitForElement('unsaved_changes_dialog', { state: 'visible' });

    switch (action) {
      case 'leave':
        await this.clickDialogLeaveButton();
        break;
      case 'stay':
        await this.clickDialogStayButton();
        break;
      case 'save-and-leave':
        await this.clickDialogSaveAndLeaveButton();
        break;
      default:
        throw new Error(`Unknown unsaved-changes dialog action: "${action}"`);
    }
  }

  /**
   * Handle the department-change confirmation dialog that appears
   * when changing department after a designation was already selected.
   *
   * @param confirm - true = proceed (designation resets); false = cancel
   */
  async handleDepartmentChangeDialog(confirm: boolean): Promise<void> {
    await this.waitForElement('department_change_confirmation_dialog', {
      state: 'visible',
    });

    if (confirm) {
      await this.clickDialogLeaveButton();
    } else {
      await this.clickDialogStayButton();
    }
  }

  /**
   * Detect data loading error and click Retry if the error message is visible.
   *
   * @returns true if an error was found and retry was clicked; false otherwise
   */
  async retryDataLoadingOnError(): Promise<boolean> {
    const hasError = await super.isElementVisible('data_loading_error_message', 3000);
    if (hasError) {
      await this.clickRetryLoadingButton();
      return true;
    }
    return false;
  }

  /**
   * Wait for the dropdown loading spinner to disappear, confirming
   * that organisational data has finished loading from the server.
   *
   * @param timeout - Maximum wait in milliseconds (default: 10000)
   */
  async waitForDropdownDataLoaded(timeout = 10000): Promise<void> {
    const isLoading = await super.isElementVisible('dropdown_loading_spinner', 2000);
    if (isLoading) {
      await this.waitForElement('dropdown_loading_spinner', {
        state: 'hidden',
        timeout,
      });
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  /**
   * Wait for the designation filtered list to refresh after a department change.
   * Waits for any loading spinner to disappear before proceeding.
   */
  private async waitForDesignationListToLoad(): Promise<void> {
    await this.waitForDropdownDataLoaded(8000);
  }
}
