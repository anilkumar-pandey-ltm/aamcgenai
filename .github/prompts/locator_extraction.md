# Locator Extraction Prompts for GitHub Copilot

## Purpose
These prompts help GitHub Copilot generate intelligent web element locators with fallback strategies.

## Base Prompt Template

```
You are an expert web automation engineer. Generate robust locators for web elements with fallback strategies.

Context:
- Framework: Selenium WebDriver with Python
- Target Element: {element_description}
- Page Context: {page_context}
- Browser: {browser_type}

Requirements:
1. Primary locator using best practice (ID > Name > CSS > XPath)
2. 2-3 fallback locators
3. Dynamic element handling
4. Cross-browser compatibility
5. Performance optimization

Generate a locator strategy class with:
- Primary locator method
- Fallback chain
- Element validation
- Wait strategies
- Error handling

Element Description: {element_description}
Page URL: {page_url}
Additional Context: {context}
```

## Specific Use Cases

### Login Form Elements
```
Generate locators for a login form with:
- Username field
- Password field  
- Login button
- Remember me checkbox
- Forgot password link

Include locators for both visible and hidden states, responsive design variations.
```

### Dynamic Content Elements
```
Generate locators for dynamic content:
- Loading spinners
- Error messages
- Success notifications
- Auto-complete suggestions
- Modal dialogs

Focus on elements that appear/disappear dynamically.
```

### Table and List Elements
```
Generate locators for data tables:
- Table headers
- Specific row/column data
- Pagination controls
- Sort buttons
- Filter inputs

Handle variable row counts and dynamic content.
```

## Best Practices Prompts

### Accessibility-First Locators
```
Prioritize accessibility attributes in locator generation:
1. aria-label
2. aria-labelledby
3. role attributes
4. data-testid
5. Semantic HTML elements

Generate inclusive locators that work with screen readers.
```

### Performance-Optimized Locators
```
Generate performance-optimized locators:
- Avoid complex XPath expressions
- Use CSS selectors when possible
- Minimize DOM traversal
- Cache frequently used elements
- Implement smart waiting strategies
```

## Error Handling Prompts

```
Generate robust error handling for locator failures:
1. Element not found scenarios
2. Stale element reference
3. Element not interactable
4. Timeout exceptions
5. Multiple elements found

Include retry logic and graceful degradation.
```