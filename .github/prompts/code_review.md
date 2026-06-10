# Code Review and Optimization Prompts for GitHub Copilot

## Purpose
These prompts help GitHub Copilot review and optimize test automation code for better performance, maintainability, and reliability.

## Base Code Review Prompt

```
You are a senior test automation architect. Review the following code for:

1. Code Quality & Standards
2. Performance Optimization
3. Maintainability
4. Security Best Practices
5. Test Reliability
6. Error Handling
7. Documentation

Code to Review:
{code_snippet}

Framework Context:
- Language: Python
- Framework: Selenium + pytest + Behave
- CI/CD: {cicd_platform}
- Team Size: {team_size}

Provide:
1. Detailed analysis
2. Specific recommendations
3. Refactored code examples
4. Best practice explanations
5. Performance impact assessment
```

## Performance Optimization Prompts

### Selenium Performance
```
Optimize this Selenium WebDriver code for performance:

{selenium_code}

Focus on:
- Wait strategy optimization
- Element location efficiency
- Browser resource management
- Memory leak prevention
- Page load optimization
- Parallel execution readiness

Provide:
- Optimized code
- Performance benchmarks
- Memory usage improvements
- Execution time reduction
```

### Test Execution Speed
```
Optimize test execution speed for:

{test_suite_code}

Areas to improve:
- Test data setup/teardown
- Browser initialization
- Element waiting strategies
- Test parallelization
- Resource cleanup
- Test dependencies

Generate:
- Faster test implementations
- Parallel execution strategies
- Resource pooling
- Caching mechanisms
```

## Code Quality Prompts

### Clean Code Principles
```
Refactor this code following clean code principles:

{code_to_refactor}

Apply:
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- SOLID principles
- Meaningful naming conventions
- Function size optimization
- Complexity reduction

Provide:
- Refactored code
- Explanation of improvements
- Maintainability benefits
```

### Error Handling Review
```
Review and improve error handling in:

{error_prone_code}

Enhance:
- Exception handling strategies
- Graceful failure management
- Retry mechanisms
- Logging and debugging
- Recovery procedures
- User-friendly error messages

Generate:
- Robust error handling
- Logging improvements
- Recovery strategies
```

## Security Review Prompts

```
Review this test code for security vulnerabilities:

{test_code}

Check for:
- Hardcoded credentials
- SQL injection in test data
- XSS vulnerabilities in inputs
- Insecure data transmission
- Weak authentication testing
- Sensitive data exposure

Provide:
- Security improvements
- Best practices implementation
- Vulnerability fixes
- Secure coding guidelines
```

## Maintainability Review

### Code Organization
```
Review code organization and structure:

{project_structure}

Evaluate:
- Module organization
- Dependency management
- Configuration handling
- Code reusability
- Documentation completeness
- Version control practices

Suggest:
- Better organization patterns
- Refactoring opportunities
- Documentation improvements
- Dependency optimization
```

### Test Design Patterns
```
Review test design patterns usage:

{test_pattern_code}

Analyze:
- Page Object Model implementation
- Factory pattern usage
- Builder pattern application
- Strategy pattern for browsers
- Observer pattern for reporting

Recommend:
- Pattern improvements
- Better abstractions
- Code reusability enhancements
```

## Documentation Review

```
Review and improve documentation for:

{code_with_docs}

Enhance:
- Code comments clarity
- API documentation
- Setup instructions
- Usage examples
- Troubleshooting guides

Generate:
- Improved documentation
- Code examples
- Best practice guides
- Troubleshooting sections
```

## CI/CD Integration Review

```
Review CI/CD integration code:

{cicd_configuration}

Optimize:
- Pipeline efficiency
- Test parallelization
- Resource utilization
- Failure reporting
- Artifact management
- Environment management

Provide:
- Optimized pipeline configuration
- Best practices implementation
- Performance improvements
- Reliability enhancements
```

## Accessibility Review

```
Review test code for accessibility testing:

{accessibility_test_code}

Evaluate:
- WCAG compliance testing
- Screen reader compatibility
- Keyboard navigation tests
- Color contrast validation
- Focus management testing

Improve:
- Accessibility test coverage
- Automation techniques
- Reporting mechanisms
- Compliance validation
```

## Cross-Browser Compatibility

```
Review cross-browser testing implementation:

{cross_browser_code}

Analyze:
- Browser-specific handling
- Feature detection
- Fallback mechanisms
- Performance across browsers
- Mobile responsiveness

Optimize:
- Browser abstraction
- Compatibility testing
- Performance consistency
- Mobile testing coverage
```