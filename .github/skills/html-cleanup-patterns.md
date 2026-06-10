---
name: html-cleanup-patterns
description: Patterns for cleaning HTML content before locator extraction, including SVG/decorative element removal, script stripping, layout-only div filtering, and noise reduction for accurate locator generation.
---

# HTML Cleanup Patterns for Locator Generation

## Overview
This skill defines patterns for cleaning HTML content before locator extraction. Proper cleanup ensures locator generation focuses on interactive, testable elements while removing noise and decorative content.

## SVG and Decorative Graphics Exclusion

### Elements to Remove During HTML Cleaning

**SVG Graphics** (charts, maps, decorative icons):
- `<svg>` elements with multiple `<path>` children (map boundaries, chart paths, vector graphics)
- Individual `<path>` elements within SVG (map regions, shape components)
- `<circle>`, `<rect>`, `<polygon>`, `<line>` within SVG (geometric decorations)
- SVG `<g>` groups with `class` containing: "decoration", "background", "visual"

**Decorative Images**:
- `<img>` with `alt=""` (no accessibility text)
- `<img>` with `aria-hidden="true"` (intentionally hidden from screen readers)
- `<img>` with `role="presentation"` (decorative only)
- Background images in `<div>` with inline styles (non-interactive)

**Layout/Structural Elements**:
- `<div>` with `role="presentation"` (layout containers only)
- `<div>` or `<span>` with classes: "spacer", "divider", "separator", "decoration"
- Empty `<div>` elements with no text content and no interactive children
- `<hr>` elements (horizontal rules - decorative dividers)
- `<br>` excessive consecutive breaks (layout spacing)

**Scripts and Styles**:
- `<script>` tags and contents (not testable UI)
- `<style>` tags and contents (CSS definitions)
- Inline `<script>` in event attributes (onclick, onload - keep attribute, remove content)

**Metadata and Non-Visual Content**:
- `<meta>` tags (not part of UI)
- `<link>` tags (external resources, not UI elements)
- `<noscript>` content (fallback content)
- HTML comments `<!-- ... -->`

## Interactive Element Preservation Rules

**ALWAYS KEEP these elements** (critical for testing):

**Form Controls**:
- `<input>` (all types)
- `<button>` (all variants)
- `<select>`, `<option>` (dropdowns)
- `<textarea>` (multi-line inputs)
- `<label>` (form field labels)
- `<fieldset>`, `<legend>` (form grouping)

**Navigation and Links**:
- `<a>` with `href` attribute (clickable links)
- `<nav>` elements (navigation containers)
- `<header>`, `<footer>` (page landmarks)

**Text Content**:
- `<h1>` through `<h6>` (headings)
- `<p>`, `<span>`, `<label>` with text content
- `<li>`, `<ul>`, `<ol>` (lists)
- `<table>`, `<tr>`, `<td>`, `<th>` (data tables)

**Interactive Elements**:
- Elements with `onclick`, `onsubmit`, or other event listeners
- Elements with `role="button"`, `role="link"`, `role="menu"`, etc.
- Elements with `tabindex` (keyboard accessible)
- Elements with `aria-label` or `aria-labelledby` (accessibility labels)
- Elements with `data-testid` or similar test attributes

**Semantic HTML5**:
- `<article>`, `<section>`, `<aside>` (content structure)
- `<main>`, `<figure>`, `<figcaption>` (page sections)
- `<dialog>`, `<details>`, `<summary>` (interactive widgets)

## Cleanup Implementation Pattern

```python
# Pseudo-code for clean_html_for_ai() enhancement
def clean_html_for_ai(html_content: str) -> str:
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # 1. Remove SVG graphics
    for svg in soup.find_all('svg'):
        # Keep SVG if it has interactive children (buttons, links)
        if not svg.find_all(['button', 'a', 'input']):
            svg.decompose()
    
    # 2. Remove decorative images
    for img in soup.find_all('img'):
        if img.get('alt') == '' or img.get('aria-hidden') == 'true':
            img.decompose()
    
    # 3. Remove scripts and styles
    for tag in soup.find_all(['script', 'style', 'noscript']):
        tag.decompose()
    
    # 4. Remove layout-only divs
    for div in soup.find_all('div', class_=re.compile(r'(spacer|divider|separator|decoration)')):
        div.decompose()
    
    # 5. Remove HTML comments
    for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
        comment.extract()
    
    return str(soup)
```

## Aggressive Cleanup Mode

When file size is still too large after standard cleanup, apply aggressive rules:

**Additional Removals**:
- All `<img>` tags except those with non-empty `alt` text
- All `<span>` and `<div>` with no attributes and no text
- Collapse multiple whitespace and newlines
- Remove all CSS classes except: "button", "input", "link", "form", "submit", "login", "search"
- Remove all inline styles
- Strip `id` attributes that are auto-generated (e.g., "id123456", "element_a1b2c3")

**Preserve Critical Attributes**:
- `data-testid`, `data-test`, `data-qa` (test identifiers)
- `name` (form field names)
- `type` (input types, button types)
- `href` (link destinations)
- `for` (label associations)
- `role`, `aria-*` (accessibility)
- `placeholder`, `value` (input hints/defaults)

## Validation After Cleanup

After cleaning, verify:
1. **Element count** reduced by 40-70% (decorative content removed)
2. **File size** reduced by 30-60% (scripts/styles/comments removed)
3. **All form elements preserved** (inputs, buttons, selects remain)
4. **Navigation structure intact** (nav, header, footer, main sections remain)
5. **Accessibility attributes preserved** (aria-*, role, labels remain)

## Usage in Locator Generation Pipeline

**Phase 2 (clean_html_for_ai)**:
```python
# Apply cleanup patterns from this skill file
cleaned_html = clean_html_for_ai(
    page_source_file_path='yamlGeneration/Temp_DOM/original_page_source.html',
    output_file_path='yamlGeneration/Temp_DOM/',
    cleaned_html_content='cleaned_page_source',
    aggressive=False  # Set True if file > 100KB after standard cleanup
)
```

**Benefits**:
- Locator generation focuses on testable elements only
- Reduced token consumption (30-60% smaller HTML)
- Faster processing (fewer elements to analyze)
- Higher quality locators (no noise from decorative elements)
- No SVG filtering needed in Phase 4 (already removed)
