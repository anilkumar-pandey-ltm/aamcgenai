# API Automation Framework Enhancement

## Overview
This enhancement adds comprehensive API testing capabilities to the existing UI automation framework, with AI-powered test generation from Postman collections.

## Architecture

### 1. API Core Components
- **apiClient.ts**: Universal HTTP client with retry, auth, and logging
- **responseValidator.ts**: Dynamic schema validation and assertion engine
- **testDataManager.ts**: Unified test data management for UI and API tests
- **aiTestGenerator.ts**: AI-powered test case generation from Postman collections

### 2. AI Integration Components
- **postmanParser.ts**: Parses Postman collection JSON
- **testCaseAnalyzer.ts**: AI analysis of API endpoints to generate test scenarios
- **scenarioGenerator.ts**: Converts AI analysis to executable test files
- **dataGenerationEngine.ts**: AI-powered test data generation

### 3. Execution Strategies
- **Direct API Tests**: Fast unit-style tests using Jest/Vitest
- **BDD API Tests**: Cucumber scenarios for business-readable API workflows
- **Hybrid Tests**: Combined UI + API validation flows

### 4. Reporting & Analytics
- **Unified reporting** for UI and API test results
- **API performance metrics** and trend analysis
- **Test coverage mapping** across API endpoints
