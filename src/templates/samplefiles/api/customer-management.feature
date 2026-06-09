@API @Customers
Feature: Customer API - Management Testing
  As a test automation engineer
  I want to test customer API operations with comprehensive validation
  So that I can demonstrate YAML-driven testing, schema validation, and response validation

  Background:
    Given the Customer API is accessible

  @API_TC_001 @smoke @framework
  Scenario: API_TC_001 - Verify framework initialization
    When I initialize the Customer API client
    Then the API client should be configured
    And the test data should be accessible
    And the response validator should be ready

  @API_TC_002 @crud @create @positive @schema_validation
  Scenario: API_TC_002 - Create customer with YAML data and validate schema
    Given I have customer data "prestashop_valid_customer" from dataset
    When I create a customer via Customer API
    Then the response status should be 201
    And the response should match "customer_response" schema
    And the response should contain the created customer data
    And I should receive a valid customer ID

  @API_TC_003 @crud @read @positive @schema_validation
  Scenario: API_TC_003 - Retrieve customer and validate response
    Given I have customer data "prestashop_valid_customer" from dataset
    And I create a customer for testing
    When I send a GET request to fetch the created customer
    Then the response status should be 200
    And the response should match "customer_response" schema
    And the response should contain field "firstname" with value from test data
    And the response should contain field "email" with value from test data

  @API_TC_004 @crud @create @negative @validation_showcase
  Scenario: API_TC_004 - Create customer with invalid data (missing email)
    Given I have customer data "prestashop_invalid_customer_missing_email" from dataset
    When I create a customer via Customer API
    Then the response status should be 400
    And the response should match "customer_error_response" schema
    And the response should contain field "errors" 
    And the response should contain validation errors

  @API_TC_006 @crud @bulk @positive @performance
  Scenario: API_TC_006 - Bulk customer operations with validation
    Given I have bulk customer data "prestashop_bulk_customers" from dataset  
    When I create multiple customers from bulk data
    Then all customers should be created successfully
        And each customer in the list should match "customer_response" schema
    And the response time for each request should be less than 3000 milliseconds
    And I can retrieve all created customers

  @API_TC_007 @crud @update @positive @schema_validation
  Scenario: API_TC_007 - Update customer with template and validate
    Given I have customer data "prestashop_valid_customer" from dataset
    And I create a customer for testing
    When I send a PUT request to update customer using template "updated_customer"
    Then the response status should be 200
    And the response should match "customer_response" schema
    And the response should contain the updated customer data

  @API_TC_008 @crud @delete @positive
  Scenario: API_TC_008 - Delete customer and validate
    Given I have customer data "prestashop_valid_customer" from dataset
    And I create a customer for testing
    When I send a DELETE request to delete the customer
    Then the response status should be 200
    And the customer should not be retrievable anymore

  @API_TC_009 @list @positive @schema_validation
  Scenario: API_TC_009 - Get all customers and validate list schema
    Given the Customer API contains some test customers
    When I send a GET request to fetch all customers
    Then the response status should be 200
    And the response should match "customer_list_response" schema
    And the response should contain a list of customers
    And each customer in the list should match "customer_list_item" schema

