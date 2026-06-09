@API @Product
Feature: Product API - Management Testing
  As a test automation engineer
  I want to test product API operations with comprehensive validation
  So that I can demonstrate YAML-driven testing, schema validation, and response validation

  Background:
    Given the Product API is accessible

  @API_TC_001 @smoke @framework
  Scenario: API_TC_001 - Verify framework initialization
    When I initialize the Product API client
    Then the API client should be configured
    And the test data should be accessible
    And the response validator should be ready

  @API_TC_002 @crud @create @positive @schema_validation
  Scenario: API_TC_002 - Create product with YAML data and validate schema
    Given I have product data "ecommerce_valid_product" from dataset
    When I create a product via Product API
    Then the response status should be 201
    And the response should match "product_response" schema
    And the response should contain the created product data
    And I should receive a valid product ID

  @API_TC_003 @crud @read @positive @schema_validation
  Scenario: API_TC_003 - Retrieve product and validate response
    Given I have product data "ecommerce_valid_product" from dataset
    And I create a product for testing
    When I send a GET request to fetch the created product
    Then the response status should be 200
    And the response should match "product_response" schema
    And the response should contain field "name" with value from test data
    And the response should contain field "price" with value from test data

  @API_TC_004 @crud @create @negative @validation_showcase
  Scenario: API_TC_004 - Create product with invalid data (missing required fields)
    Given I have product data "ecommerce_invalid_product_missing_name" from dataset
    When I create a product via Product API
    Then the response status should be 400
    And the response should match "product_error_response" schema
    And the response should contain field "errors"
    And the response should contain validation errors

  @API_TC_005 @crud @update @positive @schema_validation
  Scenario: API_TC_005 - Update product with template and validate
    Given I have product data "ecommerce_valid_product" from dataset
    And I create a product for testing
    When I send a PUT request to update product using template "updated_product"
    Then the response status should be 200
    And the response should match "product_response" schema
    And the response should contain the updated product data

  @API_TC_006 @crud @delete @positive
  Scenario: API_TC_006 - Delete product and validate
    Given I have product data "ecommerce_valid_product" from dataset
    And I create a product for testing
    When I send a DELETE request to delete the product
    Then the response status should be 200
    And the product should not be retrievable anymore

  @API_TC_007 @list @positive @schema_validation
  Scenario: API_TC_007 - Get all products and validate list schema
    Given the Product API contains some test products
    When I send a GET request to fetch all products
    Then the response status should be 200
    And the response should match "product_list_response" schema
    And the response should contain a list of products
    And each product in the list should match "product_list_item" schema

  @API_TC_008 @crud @bulk @positive @performance
  Scenario: API_TC_008 - Bulk product operations with validation
    Given I have bulk product data "ecommerce_bulk_products" from dataset
    When I create multiple products from bulk data
    Then all products should be created successfully
    And each product in the list should match "product_response" schema
    And the response time for each request should be less than 2000 milliseconds
    And I can retrieve all created products

  @API_TC_009 @integration @positive ⚠️_NEEDS_VALIDATION
  Scenario: API_TC_009 - Product category integration test
    Given I have product data "ecommerce_valid_product_with_category" from dataset
    And I have category data "ecommerce_valid_category" from dataset
    When I create a category via Category API
    And I create a product linked to the category
    Then the response status should be 201
    And the product should contain the correct category reference
    And I can retrieve the product by category

  @API_TC_010 @performance @load_testing 🔄_FUTURE_ENHANCEMENT
  Scenario: API_TC_010 - Product API load testing
    Given I have bulk product data "ecommerce_load_test_products" from dataset
    When I create 100 products concurrently
    Then all products should be created successfully
    And the average response time should be less than 500 milliseconds
    And no errors should occur during concurrent operations
