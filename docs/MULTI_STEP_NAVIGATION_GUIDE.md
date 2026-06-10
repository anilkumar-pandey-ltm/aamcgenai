# Multi-Step Navigation Guide for Authenticated Pages

## Overview

The locator generator now supports **unlimited multi-step navigation** after login. You can navigate through as many intermediate pages as needed before capturing the final target page.

## How It Works

### Core Logic

```
1. Browser opens to base domain
2. System pauses and waits
3. YOU navigate manually (any number of steps)
4. YOU press Enter when ready
5. System captures current page (wherever you are)
```

**Key Point**: The system captures **whatever page the browser is currently on** when you press Enter, regardless of:
- How many pages you navigated through
- Whether you used direct URLs or UI clicks
- The complexity of the navigation path

## Two Navigation Modes

### 🎯 Flexible Mode (Default - Recommended)

**When to use**: Multi-step navigation, UI-driven workflows, complex navigation paths

**Command:**
```python
python -c "from src.services.locator_extractor import get_page_source; get_page_source('https://app.example.com/#/target', 'Output/yamlGeneration/Temp_DOM/original_page_source.html', wait_for_manual_login=True)"
```

**Behavior:**
- ✅ Navigate through ANY pages
- ✅ Use UI clicks, menus, search, filters
- ✅ No URL validation
- ✅ Captures whatever page you're on

**Console Output:**
```
============================================================
⏸️  MANUAL LOGIN REQUIRED
============================================================
📍 Target URL: https://app.example.com/#/target
✨ URL Validation: DISABLED (flexible mode)
   You can navigate to any page via UI clicks

📋 INSTRUCTIONS:
   1. Browser is now open - please log in manually
   2. After login, navigate through any intermediate pages
   3. Reach your target page: https://app.example.com/#/target
      (Or navigate via UI - clicks, menus, links)
   4. Wait for the page to fully load
   5. Press Enter in this terminal when ready to capture page source
============================================================
```

### 🔒 Strict Mode (URL Validation)

**When to use**: Direct URL navigation, simple workflows, need error prevention

**Command:**
```python
python -c "from src.services.locator_extractor import get_page_source; get_page_source('https://app.example.com/#/target', 'Output/yamlGeneration/Temp_DOM/original_page_source.html', wait_for_manual_login=True, validate_url=True)"
```

**Behavior:**
- ⚠️ Validates current URL matches target URL
- ⚠️ Throws error if URLs don't match
- ✅ Prevents capturing wrong pages
- ✅ Good for simple direct navigation

**Console Output:**
```
============================================================
⏸️  MANUAL LOGIN REQUIRED
============================================================
📍 Target URL: https://app.example.com/#/target
⚠️  URL Validation: ENABLED (strict mode)
   You MUST navigate to the exact target URL
============================================================
```

## Real-World Examples

### Example 1: Simple Navigation
```
Login Page → Dashboard (target) → Press Enter
```

**Command:**
```python
get_page_source('https://app.com/#/dashboard', 
               wait_for_manual_login=True)
```

---

### Example 2: Menu Navigation (Your Underwriter Workbench Case)
```
Login → Dashboard → Click "Underwriting" → Click "Workbench" → Press Enter
```

**Command:**
```python
get_page_source('https://ltimindtree-uatx.unqork.io/#/display/underwriter-workbench',
               'Output/yamlGeneration/Temp_DOM/original_page_source.html',
               wait_for_manual_login=True)
```

**Steps You Take:**
1. Browser opens to `https://ltimindtree-uatx.unqork.io`
2. Login page appears → You enter credentials
3. Dashboard loads → You click "Underwriting" menu
4. Underwriting page loads → You click "Workbench" link
5. Underwriter Workbench loads → **You press Enter in terminal**
6. System captures Underwriter Workbench page source ✅

---

### Example 3: Deep Navigation with Multiple Steps
```
Login → Home → Settings → User Management → 
Advanced Settings → Permissions → Role Management → Press Enter
```

**Command:**
```python
get_page_source('https://app.com/#/settings/users/advanced/permissions/roles',
               wait_for_manual_login=True)
```

---

### Example 4: Dynamic Navigation (Search/Filter)
```
Login → Dashboard → Search "Order #12345" → 
Order Details Page → Press Enter
```

**Command:**
```python
get_page_source('https://app.com/#/orders/12345',
               wait_for_manual_login=True)
```

**Why Flexible Mode**: The final URL might be dynamically generated, so flexible mode lets you search and capture the result.

---

### Example 5: Complex Workflow with Forms
```
Login → Dashboard → New Application → 
Fill Form Page 1 → Next → Fill Form Page 2 → 
Next → Review Page (target) → Press Enter
```

**Command:**
```python
get_page_source('https://app.com/#/application/review',
               wait_for_manual_login=True)
```

## Mode Comparison

| Scenario | Recommended Mode | Why |
|----------|------------------|-----|
| Menu navigation (Underwriting → Workbench) | 🎯 Flexible | Navigate via UI clicks |
| Search then view details | 🎯 Flexible | Dynamic URLs |
| Multi-step wizard/forms | 🎯 Flexible | Step-through process |
| Tabs/Accordions navigation | 🎯 Flexible | UI-driven |
| Direct URL after login | 🔒 Strict | Simple, want validation |
| Bookmark direct link | 🔒 Strict | Known exact URL |

## Technical Details

### What Happens Behind the Scenes

**Phase 1: Browser Opens**
```python
base_url = '/'.join(url.split('/')[:3])  # Extract https://domain.com
driver.get(base_url)  # Opens to base domain (triggers login redirect)
```

**Phase 2: Wait for User**
```python
input("Press Enter after navigation...")  # Blocks indefinitely
```

**Phase 3: Capture Current Page**
```python
current_url = driver.current_url  # Gets whatever URL you're on
html_content = driver.page_source  # Captures that page's HTML
```

**Phase 4: Optional Validation (Strict Mode Only)**
```python
if validate_url:
    if normalized_target not in normalized_current:
        raise ValueError("URL mismatch!")
```

### URL Normalization (Strict Mode)

The validation normalizes URLs to handle:
- Trailing slashes: `page/` vs `page`
- URL fragments: `page#section` vs `page`
- Query parameters: `page?id=1` vs `page`

Example:
```python
Target:  https://app.com/#/dashboard
Current: https://app.com/#/dashboard/overview
Result:  ✅ Match (target contained in current)

Target:  https://app.com/#/dashboard
Current: https://app.com/#/settings
Result:  ❌ Mismatch (validation error)
```

## Troubleshooting

### Problem: Captured wrong page

**Cause**: Pressed Enter before navigating to target page

**Solution**: Use strict mode for validation:
```python
get_page_source(url, wait_for_manual_login=True, validate_url=True)
```

### Problem: URL validation fails but I'm on the right page

**Cause**: URL differs slightly (query params, fragments)

**Solution**: Use flexible mode (captures any page):
```python
get_page_source(url, wait_for_manual_login=True, validate_url=False)
```

### Problem: Page not fully loaded when captured

**Cause**: Pressed Enter too early

**Solution**: 
1. Wait for all spinners/loaders to disappear
2. Check console for "AJAX complete" or "Network idle"
3. Verify all content is visible
4. Then press Enter

## Best Practices

### ✅ DO:
- Wait for page to fully load before pressing Enter
- Navigate naturally through the UI (as a real user would)
- Use flexible mode for complex navigation
- Use strict mode when you want error prevention
- Verify you're on the correct page before pressing Enter

### ❌ DON'T:
- Press Enter while page is still loading
- Navigate to the wrong page and capture it
- Close the browser manually (let the script handle it)
- Mix up terminal windows (press Enter in wrong terminal)

## Summary

The locator generator's manual login mode provides **complete navigation flexibility**:

✅ **Supports unlimited multi-step navigation**  
✅ **UI-driven navigation** (clicks, menus, search)  
✅ **Dynamic routes** (generated URLs, query params)  
✅ **Complex workflows** (wizards, forms, tabs)  
✅ **Any authentication** (SSO, SAML, OAuth, 2FA)  
✅ **Two modes** (flexible for UI, strict for validation)  

**The system simply waits for you to navigate to the right page, then captures it - it's that simple!**
