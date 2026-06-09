@CNV-11616 @DisclosureExpiration @EmailNotification @BatchJob
Feature: Disclosure Expiration Email Notification for Disclosers
  As a Convey Discloser who has submitted a disclosure for a policy with Disclosure Expiration Notifications enabled
  I want to receive an automated email notification when my disclosure expires
  So that I can take timely action to resubmit my disclosure and maintain compliance

  Background:
    Given the Convey system is configured with disclosure expiration notification capability
    And the batch job is scheduled to run at "6:00 AM ET" daily
    And email templates are configured for disclosure expiration notifications

  # ============================================================================
  # SCENARIO 1: Disclosure Expiration Notification - Public Link Submission
  # ============================================================================
  @Positive @PublicLink @HighPriority
  Scenario: Discloser receives expiration notification for disclosure submitted via public link
    Given I am an active Convey discloser named "John Smith"
    And I previously submitted a disclosure via "public link" for policy "Financial Conflict of Interest 2026"
    And I provided my profile email as "john.smith@university.edu" during submission
    And the policy has "Disclosure Expiration Notification" flag set to "enabled"
    And my disclosure was submitted on "2026-01-15"
    And the policy expiration period is set to "365 days"
    When the batch job runs on "2026-05-28" at "6:00 AM ET"
    And my disclosure expiration date of "2026-05-28" is reached
    Then the system should identify my disclosure as "expired"
    And the system should send an email notification to "john.smith@university.edu"
    And the email subject should be "Request to redisclose for expired disclosure"
    And the email body should contain "Your disclosure for Financial Conflict of Interest 2026 has expired"
    And the email body should contain a "Start Redisclosure" link for "Financial Conflict of Interest 2026"
    And the email should be sent from the configured sender email address
    And the system should log the notification attempt as "successful"

  # ============================================================================
  # SCENARIO 2: Disclosure Expiration Notification - Generic Link Submission
  # ============================================================================
  @Positive @GenericLink @HighPriority
  Scenario: Discloser receives expiration notification for disclosure submitted via generic link
    Given I am an active Convey discloser named "Sarah Johnson"
    And I previously submitted a disclosure via "generic link" for policy "Research Disclosure Policy"
    And I provided my profile email as "sarah.johnson@research.org" during submission
    And the policy has "Disclosure Expiration Notification" flag set to "enabled"
    And my disclosure was submitted on "2025-11-28"
    And the policy expiration period is set to "180 days"
    When the batch job runs on "2026-05-28" at "6:00 AM ET"
    And my disclosure expiration date of "2026-05-27" has been reached
    Then the system should identify my disclosure as "expired"
    And the system should send an email notification to "sarah.johnson@research.org"
    And the email subject should be "Request to redisclose for expired disclosure"
    And the email body should contain the policy name "Research Disclosure Policy"
    And the email body should include a redisclosure link specific to "Research Disclosure Policy"
    And the notification should be logged with timestamp and recipient email

  # ============================================================================
  # SCENARIO 3: Disclosure Expiration Notification - List Invitation Link
  # ============================================================================
  @Positive @ListInvitation @HighPriority @CriticalPath
  Scenario: Discloser receives expiration notification for disclosure submitted via list invitation link
    Given I am an active Convey discloser named "Michael Chen"
    And I was invited to submit a disclosure via "list invitation link" for policy "Clinical Trial Disclosure"
    And my invitation email address is "m.chen@hospital.org"
    And I submitted my disclosure using the invitation link
    And the policy has "Disclosure Expiration Notification" flag set to "enabled"
    And my disclosure was submitted on "2025-05-28"
    And the policy expiration period is set to "365 days"
    When the batch job runs on "2026-05-28" at "6:00 AM ET"
    And my disclosure expiration date of "2026-05-28" is reached
    Then the system should identify my disclosure as "expired"
    And the system should send an email notification to my invitation email "m.chen@hospital.org"
    And NOT to any other email address in my profile
    And the email subject should be "Request to redisclose for expired disclosure"
    And the email body should contain "Your disclosure for Clinical Trial Disclosure has expired"
    And the email should contain a functional redisclosure link
    And the system should log the notification with "list invitation" submission type

  # ============================================================================
  # SCENARIO 4: Multiple Disclosures Expiring on Same Day
  # ============================================================================
  @Positive @MultiplePolicies @DataIntensity
  Scenario: Discloser receives separate notifications for multiple expiring disclosures
    Given I am an active Convey discloser named "Emily Davis"
    And I have the following expired disclosures on "2026-05-28":
      | Policy Name                  | Submission Type  | Email Address           | Submission Date | Expiration Date |
      | Pharmaceutical Interests     | public link      | emily.davis@pharma.com  | 2025-05-28      | 2026-05-28      |
      | Clinical Research Disclosure | list invitation  | e.davis@clinic.org      | 2025-11-28      | 2026-05-27      |
      | Grant Funding Disclosure     | generic link     | emily.davis@pharma.com  | 2025-05-28      | 2026-05-28      |
    And all three policies have "Disclosure Expiration Notification" flag "enabled"
    When the batch job runs on "2026-05-28" at "6:00 AM ET"
    Then the system should send "3" separate email notifications
    And "2" emails should be sent to "emily.davis@pharma.com"
    And "1" email should be sent to "e.davis@clinic.org"
    And each email should reference the correct policy name
    And each email should contain the correct redisclosure link for its respective policy
    And all notifications should be logged individually

  # ============================================================================
  # SCENARIO 5: No Notification When Flag is Disabled
  # ============================================================================
  @Negative @FlagDisabled @BoundaryCondition
  Scenario: Discloser does NOT receive notification when expiration notification flag is disabled
    Given I am an active Convey discloser named "Robert Wilson"
    And I previously submitted a disclosure via "list invitation" for policy "Optional Disclosure Policy"
    And my invitation email address is "robert.wilson@company.com"
    And the policy has "Disclosure Expiration Notification" flag set to "disabled"
    And my disclosure was submitted on "2025-05-28"
    And my disclosure expiration date is "2026-05-28"
    When the batch job runs on "2026-05-28" at "6:00 AM ET"
    And the system identifies expired disclosures
    Then the system should NOT send an email notification to "robert.wilson@company.com"
    And my disclosure should still be marked as "expired" in the system
    And no notification log entry should be created for this disclosure

  # ============================================================================
  # SCENARIO 6: Batch Job Execution Timing Validation
  # ============================================================================
  @Positive @BatchJobTiming @SystemConfiguration
  Scenario: Batch job executes at scheduled time and processes all eligible disclosures
    Given the batch job is configured to run at "6:00 AM ET"
    And there are "15" disclosures expiring on "2026-05-28"
    And "12" of these disclosures have policies with expiration notification "enabled"
    And "3" of these disclosures have policies with expiration notification "disabled"
    When the system clock reaches "2026-05-28 06:00:00 ET"
    Then the batch job should start execution automatically
    And the batch job should process all "15" expiring disclosures
    And the batch job should send email notifications for "12" disclosures
    And the batch job should skip email notifications for "3" disclosures
    And the batch job should complete within "5 minutes"
    And the batch job execution should be logged with start time, end time, and processed count

  # ============================================================================
  # SCENARIO 7: Email Content Validation - Policy Name Dynamic Substitution
  # ============================================================================
  @Positive @EmailContent @DynamicContent
  Scenario Outline: Email contains correctly substituted policy name and redisclosure link
    Given I am an active Convey discloser
    And I submitted a disclosure for policy "<PolicyName>"
    And the policy has expiration notifications "enabled"
    And my disclosure has expired today
    When the batch job sends me the expiration notification email
    Then the email body should contain the text "Your disclosure for <PolicyName> has expired"
    And the email should contain a link labeled "Start Redisclosure for <PolicyName>"
    And clicking the link should navigate to the disclosure submission page for "<PolicyName>"

    Examples:
      | PolicyName                                    |
      | Financial Conflict of Interest 2026           |
      | Research Grant Disclosure                     |
      | Clinical Trial Investigator COI               |
      | Pharmaceutical Industry Relationships         |
      | NIH Biosketch Financial Disclosure            |

  # ============================================================================
  # SCENARIO 8: Email Routing Based on Submission Type
  # ============================================================================
  @Positive @EmailRouting @BusinessLogic @CriticalPath
  Scenario Outline: Email is sent to correct address based on disclosure submission type
    Given I am an active Convey discloser
    And I submitted a disclosure via "<SubmissionType>"
    And I provided "<ProfileEmail>" as my profile email during submission
    And I was invited via email address "<InvitationEmail>" for list invitations
    And the disclosure has expired today
    And the policy has expiration notifications enabled
    When the batch job processes my expired disclosure
    Then the notification email should be sent to "<ExpectedRecipient>"
    And the email should NOT be sent to "<NotExpectedRecipient>"

    Examples:
      | SubmissionType  | ProfileEmail           | InvitationEmail        | ExpectedRecipient      | NotExpectedRecipient   |
      | public link     | user@domain.com        | N/A                    | user@domain.com        | N/A                    |
      | generic link    | user@company.org       | N/A                    | user@company.org       | N/A                    |
      | list invitation | user@alternate.edu     | invite@primary.edu     | invite@primary.edu     | user@alternate.edu     |

  # ============================================================================
  # SCENARIO 9: Email Delivery Failure Handling
  # ============================================================================
  @Negative @EmailFailure @ErrorHandling
  Scenario: System logs failure when email cannot be delivered
    Given I am an active Convey discloser named "Invalid User"
    And I submitted a disclosure via "public link" for policy "Test Policy"
    And my profile email is "invalid@nonexistentdomain12345.com"
    And the policy has expiration notifications enabled
    And my disclosure expired today
    When the batch job attempts to send me an expiration notification
    And the email delivery fails due to "invalid recipient address"
    Then the system should log the failure with error details
    And the log should include my discloser ID, policy name, and email address
    And the log should record the failure reason as "invalid recipient address"
    And the system should continue processing other notifications
    And an alert should be created for system administrators to review failed deliveries

  # ============================================================================
  # SCENARIO 10: Disclosure Not Yet Expired - No Notification
  # ============================================================================
  @Negative @FutureExpiration @BoundaryCondition
  Scenario: Discloser does NOT receive notification when disclosure has not yet expired
    Given I am an active Convey discloser named "Future Expiry"
    And I submitted a disclosure for policy "Future Expiry Policy" on "2026-01-01"
    And the policy expiration period is "365 days"
    And the policy has expiration notifications "enabled"
    And my disclosure expiration date is "2027-01-01"
    When the batch job runs on "2026-05-28" at "6:00 AM ET"
    Then the system should NOT identify my disclosure as expired
    And the system should NOT send an email notification to me
    And my disclosure should remain in "active" status

  # ============================================================================
  # SCENARIO 11: Archived Discloser - No Notification
  # ============================================================================
  @Negative @ArchivedDiscloser @EdgeCase
  Scenario: Archived discloser does not receive expiration notification
    Given I am a Convey discloser named "Archived User"
    And I submitted a disclosure for policy "Research Policy" on "2025-05-28"
    And the policy has expiration notifications "enabled"
    And my disclosure expiration date is "2026-05-28"
    And my discloser record was "archived" on "2026-03-15"
    When the batch job runs on "2026-05-28" at "6:00 AM ET"
    Then the system should NOT send an email notification to me
    And the system should log that the disclosure expired but discloser is archived
    And no email delivery should be attempted

  # ============================================================================
  # SCENARIO 12: Email Template Configuration Validation
  # ============================================================================
  @Positive @EmailTemplate @SystemConfiguration
  Scenario: Email notification uses correct template configuration
    Given the system is configured with a disclosure expiration email template
    And the template has the subject "Request to redisclose for expired disclosure"
    And the template body contains placeholders for "POLICY_NAME" and "REDISCLOSURE_LINK"
    And I am a discloser with an expired disclosure for policy "Compliance Policy 2026"
    And the policy has expiration notifications enabled
    When the batch job sends me the expiration notification
    Then the email subject should exactly match "Request to redisclose for expired disclosure"
    And the "<%POLICY_NAME%>" placeholder should be replaced with "Compliance Policy 2026"
    And the redisclosure link should be a valid clickable URL
    And the email should be formatted in HTML or plain text as per system configuration

  # ============================================================================
  # SCENARIO 13: Batch Job Idempotency - No Duplicate Notifications
  # ============================================================================
  @Negative @Idempotency @DataIntegrity
  Scenario: Batch job does not send duplicate notifications for same expired disclosure
    Given I am a discloser with a disclosure that expired on "2026-05-28"
    And the policy has expiration notifications enabled
    And the batch job successfully sent me a notification on "2026-05-28" at "6:00 AM ET"
    When the batch job runs again on "2026-05-28" at "6:00 PM ET" due to manual trigger
    Then the system should detect that notification was already sent for this expiration
    And the system should NOT send a duplicate email notification
    And the system should log "notification already sent" for this disclosure

  # ============================================================================
  # SCENARIO 14: Timezone Handling for Batch Job Execution
  # ============================================================================
  @Positive @Timezone @SystemConfiguration
  Scenario: Batch job executes at correct Eastern Time regardless of server timezone
    Given the batch job is configured to run at "6:00 AM ET"
    And the server is located in a different timezone than Eastern Time
    And today's date is "2026-05-28"
    When the Eastern Time clock reaches "06:00:00 ET"
    Then the batch job should execute immediately
    And the execution should not be delayed or advanced due to server timezone
    And all disclosures with expiration date "2026-05-28" should be processed
    And the execution log should record the time as "6:00 AM ET"

  # ============================================================================
  # SCENARIO 15: Redisclosure Link Functionality Validation
  # ============================================================================
  @Positive @LinkValidation @UserExperience
  Scenario: Redisclosure link in email directs discloser to correct disclosure submission page
    Given I am a discloser who received an expiration notification email
    And the email is for policy "Annual Financial Disclosure 2026"
    And the email contains a "Start Redisclosure" link
    When I click on the redisclosure link in the email
    Then I should be navigated to the Convey disclosure submission page
    And the page should be pre-populated with policy "Annual Financial Disclosure 2026"
    And I should be able to start a new disclosure submission for the same policy
    And my previous disclosure data should be available for reference or reuse

  # ============================================================================
  # SCENARIO 16: Bulk Expiration Processing Performance
  # ============================================================================
  @Performance @BulkProcessing @NonFunctional
  Scenario: Batch job efficiently processes large volume of expired disclosures
    Given there are "1000" disclosures expiring on "2026-05-28"
    And all policies have expiration notifications "enabled"
    And the batch job is configured to run at "6:00 AM ET"
    When the batch job executes on "2026-05-28"
    Then the batch job should process all "1000" disclosures
    And all "1000" email notifications should be queued for delivery
    And the processing should complete within "10 minutes"
    And the system should maintain performance without errors or timeouts
    And the execution log should record successful processing of all disclosures

  # ============================================================================
  # SCENARIO 17: Notification for Disclosures Expiring at Different Time Intervals
  # ============================================================================
  @Positive @VariableExpiration @EdgeCase
  Scenario Outline: Disclosures with different expiration periods receive notifications on correct date
    Given I am a discloser who submitted a disclosure on "<SubmissionDate>"
    And the policy has an expiration period of "<ExpirationPeriod>" days
    And the policy has expiration notifications "enabled"
    When the batch job runs on "<BatchJobDate>"
    Then I should receive an expiration notification email on "<ExpectedNotificationDate>"

    Examples:
      | SubmissionDate | ExpirationPeriod | BatchJobDate | ExpectedNotificationDate |
      | 2025-05-28     | 365              | 2026-05-28   | 2026-05-28               |
      | 2025-11-28     | 180              | 2026-05-27   | 2026-05-27               |
      | 2026-02-28     | 90               | 2026-05-29   | 2026-05-29               |
      | 2025-01-01     | 730              | 2026-12-31   | 2026-12-31               |

  # ============================================================================
  # SCENARIO 18: Email Sender Configuration
  # ============================================================================
  @Positive @SenderConfiguration @SystemConfiguration
  Scenario: Email notification is sent from configured sender address
    Given the system is configured with sender email "noreply@convey.aamc.org"
    And the sender display name is "Convey Disclosure System"
    And I am a discloser with an expired disclosure
    And the policy has expiration notifications enabled
    When the batch job sends me an expiration notification
    Then the email "From" field should display "Convey Disclosure System <noreply@convey.aamc.org>"
    And the reply-to address should be configured as per system settings
    And the email should include appropriate email headers for deliverability

  # ============================================================================
  # SCENARIO 19: Notification Audit Trail
  # ============================================================================
  @Positive @AuditTrail @Compliance
  Scenario: System maintains complete audit trail of all expiration notifications
    Given I am a discloser with an expired disclosure for policy "Audit Test Policy"
    And the policy has expiration notifications enabled
    When the batch job processes my expired disclosure on "2026-05-28"
    And sends me an expiration notification email
    Then the system should create an audit log entry with the following details:
      | Field                   | Value                           |
      | Discloser ID            | [My Discloser ID]               |
      | Policy Name             | Audit Test Policy               |
      | Disclosure ID           | [My Disclosure ID]              |
      | Expiration Date         | 2026-05-28                      |
      | Notification Sent Date  | 2026-05-28 06:00 AM ET          |
      | Recipient Email         | [My Email Address]              |
      | Email Status            | Sent/Failed                     |
      | Submission Type         | [public/generic/list]           |
      | Notification Type       | Disclosure Expiration           |
    And the audit log should be retrievable for compliance reporting
    And the audit log should be tamper-proof and timestamped

  # ============================================================================
  # SCENARIO 20: Policy with No Expiration Period Set - No Notification
  # ============================================================================
  @Negative @NoExpirationPeriod @EdgeCase
  Scenario: Discloser does not receive notification when policy has no expiration period configured
    Given I am a discloser who submitted a disclosure for policy "Perpetual Policy"
    And the policy "Perpetual Policy" has no expiration period configured
    And the policy has expiration notifications "enabled"
    And I submitted the disclosure on "2025-01-01"
    When the batch job runs on "2026-05-28"
    Then the system should determine that the disclosure never expires
    And the system should NOT send an expiration notification to me
    And the disclosure should remain in "active" status indefinitely
