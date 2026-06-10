# Locator Extraction - Enhanced Base Version

## Quality Criteria

### Accuracy Requirements:
- All information must be technically accurate
- Follow best practices for the specific domain
- Validate against known standards and conventions

### Completeness Standards:
- Cover all specified requirements
- Include edge cases where relevant
- Provide comprehensive solutions

### Clarity Guidelines:
- Use clear, concise language
- Avoid unnecessary jargon
- Provide explanations for complex concepts

### Reliability Expectations:
- Prioritize stable and maintainable solutions
- Consider long-term viability
- Account for common failure scenarios

## Example Good Locators

### Preferred Locators (in order of preference):
1. **data-testid**: `[data-testid="submit-button"]`
2. **Semantic HTML**: `button[type="submit"]`
3. **ARIA labels**: `[aria-label="Submit Form"]`
4. **Stable IDs**: `#submit-btn`
5. **Role-based**: `[role="button"]`

### Good XPath Examples:
- `//button[@data-testid='submit-button']`
- `//input[@name='username']`
- `//h1[contains(text(), 'Welcome')]`

### Dynamic XPath Axes Strategies:
When standard locators fail to identify unique elements, use these XPath axes strategies:
1. **Following-sibling**: `//label[text()='Username']/following-sibling::input`
2. **Preceding-sibling**: `//input[@type='submit']/preceding-sibling::input[@type='text']`
3. **Parent/child navigation**: `//div[@class='form-group']/child::input`
4. **Ancestor axis**: `//input[@name='email']/ancestor::form[@id='login-form']`
5. **Descendant axis**: `//form[@id='registration']//input[@type='password']`
6. **Following axis**: `//label[text()='Password']/following::input[@type='password'][1]`
7. **Preceding axis**: `//button[text()='Submit']/preceding::input[@type='email'][1]`

### Avoid These Patterns:
- Generic classes: `.btn.btn-primary.btn-lg`
- Complex paths: `div > div > div > button:nth-child(3)`
- Dynamic IDs: `#item-12345-67890`
- Fragile text selectors: `//span[text()='Click here']`

### Table and List Element Strategy:
**For Tables (table, thead, tbody, tr, td, th):**
- Create locators for the table container, not individual cells
- Provide row-level locators for iteration: `//table[@id='data-table']//tr[position()>1]`
- Provide column-level locators: `//table[@id='data-table']//th[text()='Column Name']/position()`
- Use parameterized locators: `//table[@id='data-table']//tr[{row_index}]/td[{col_index}]`

**For Lists (ul, ol, li):**
- Create locators for the list container, not individual list items
- Provide item-level locators for iteration: `//ul[@class='menu']//li`
- Use parameterized locators: `//ul[@class='menu']//li[{item_index}]`
- Include text-based item locators: `//ul[@class='menu']//li[contains(text(), '{item_text}')]`

**Example Table Locators:**
```yaml
data_table:
  element_type: "table"
  element_desc: "Main data table with user information, contains columns for Name, Email, Status"
  preferred:
    locator: "[data-testid='user-table']"
    type: "css"
  table_rows:
    locator: "//table[@data-testid='user-table']//tbody//tr"
    type: "xpath"
  table_cells:
    locator: "//table[@data-testid='user-table']//tbody//tr[{row}]/td[{column}]"
    type: "xpath_parameterized"
```

### HANDLE MULTIPLE SIMILAR ELEMENTS:
When you find multiple elements with same id/class/xpath but unique aria-labels, create separate locators for each using their unique identifying attributes.

**CRITICAL EXTRACTION TASK**

You are a web automation expert. Your job is to extract **ACTIONABLE and VERIFIABLE** elements from HTML.

## ⚠️ PRECISION EXTRACTION POLICY (REVISED)

### TWO-TIER EXTRACTION STRATEGY:

#### 🔴 TIER 1: INTERACTIVE ELEMENTS (100% Extraction - NO FILTERING)
Extract **EVERY SINGLE** interactive element without exception:
- All buttons, links, inputs, selects, checkboxes, radios
- All clickable divs/spans, navigation items, form controls
- All interactive UI elements (modals, dropdowns, tabs, etc.)

#### 🟡 TIER 2: TEXT ELEMENTS (SELECTIVE Extraction - APPLY FILTERS)
Extract text elements **ONLY IF** they meet at least one of these criteria:
1. **Unique Business Data**: Product names, prices, IDs, order numbers
2. **Dynamic Content**: Counters, dates, status indicators that change
3. **Validation Targets**: Error messages, success notifications, tooltips
4. **Primary Landmarks**: Page title (h1), main section headers (h2)
5. **Testing Markers**: Elements with data-testid, aria-labels for testing

**DO NOT extract**:
- Generic descriptions, marketing copy, legal text
- Long paragraphs without testing value
- Repeated/decorative text spans
- h4-h6 used purely for styling

### EXPECTED ELEMENT COUNTS:
```
✅ Interactive: 35-90 locators (ALL buttons, links, inputs, etc.)
✅ Text: 15-50 locators (SELECTIVE - business data + validation)
✅ Containers: 3-15 locators (tables, lists with iteration patterns)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TOTAL: 50-120 locators per chunk (balanced extraction)
```

## MANDATORY REQUIREMENTS

```yaml
mandatory_requirements:
  extraction_policy:
    rule: "EXTRACT EVERYTHING"
    restrictions:
      - "No filtering"
      - "No prioritizing"
      - "No 'key elements only'"
  
  count_target:
    minimum_elements: 20
    element_types:
      - "buttons"
      - "links"
      - "inputs"
      - "nav items"
      - "etc."
  
  quality_threshold:
    tolerance: "ZERO"
    minimum_acceptable: 15
    warning: "If you see fewer than 15 elements, you're doing it wrong"
  
  element_types_to_extract:
    - "button"
    - "input"
    - "link"
    - "select"
    - "dropdown"
    - "checkbox"
    - "radio"
    - "div"
    - "span"
    - "nav"
    - "ul"
    - "li"
    - "a"
    - "img"
  
  description_requirements:
    element_desc:
      detail_level: "comprehensive"
      purpose: "Allow easy identification of the element just by reading it"
```

## WHAT TO EXTRACT (EVERYTHING):

### 🔴 MANDATORY INTERACTIVE ELEMENTS (100% extraction required):
- **Every button** - submit, click, CTA, cancel, add, remove, delete, edit, save, close, modal buttons
- **Every link** - navigation, product, social media, footer, breadcrumb, anchor links
- **Every input** - text, email, password, search, number, date, tel, url, hidden, file upload
- **Every form control** - select/dropdown, checkbox, radio button, textarea, range slider, toggle switch
- **Every clickable element** - divs with onclick, spans with onclick, cards, tiles, accordions, tabs
- **Every navigation item** - menu items, submenu items, hamburger menu, mobile nav, sidebar nav
- **Every interactive UI element** - modals, dropdowns, tooltips, popovers, carousels, sliders
- **Every action icon** - edit icon, delete icon, info icon, help icon, close icon, expand/collapse icon

### 🟡 TEXT/CONTENT ELEMENTS (SELECTIVE EXTRACTION with precision filters):

⚠️ **CRITICAL FILTERING RULES FOR TEXT ELEMENTS**:
Extract text elements ONLY if they meet **at least ONE** of these criteria:

#### ✅ EXTRACT Text Elements That Are:
1. **Actionable/Interactive Content**:
   - Text inside clickable elements (buttons, links, tabs, menu items)
   - Error messages, validation messages, form feedback
   - Status indicators (badges, labels showing state changes)
   - Labels directly associated with form inputs

2. **Unique Identifiers/Business Data**:
   - Product names, product titles (h1-h3 inside product cards)
   - Prices, costs, monetary values
   - Unique IDs, order numbers, reference numbers
   - Page titles (main h1), primary section headers (h2)

3. **Dynamic/Variable Content**:
   - Counter values, quantities, item counts
   - Dates, timestamps that change
   - User-specific content (username, profile info)
   - Real-time status updates

4. **Validation/Testing Markers**:
   - Elements with data-testid, data-qa attributes
   - Elements with specific ARIA labels for accessibility testing
   - Unique text that serves as page/state verification

#### ❌ DO NOT EXTRACT Generic Text:
- Generic descriptive paragraphs (long text blocks)
- Common instructional text ("Enter your details", "Click here")
- Generic headings without business context (h4-h6 that are just styling)
- Decorative text spans without functional purpose
- Marketing copy, legal disclaimers, terms & conditions (unless for verification)
- Duplicate/repeated text across multiple elements
- Text inside hidden elements (display:none, visibility:hidden)
- Pure styling elements (empty spans, divs with only whitespace)

#### ❌ DO NOT EXTRACT Decorative Visual Elements:
- **Individual SVG paths** - `<path>`, `<circle>`, `<rect>`, `<polygon>` in decorative graphics
- **Map visualization paths** - Geographic boundaries, country shapes in world maps
- **Chart/graph components** - Data visualization paths, grid lines, axis lines
- **Decorative SVG groups** - Non-interactive `<g>` elements in illustrations
- **Icon component paths** - Individual paths within icon SVGs (extract button/link wrapping the icon instead)
- **Background graphics** - Decorative shapes, patterns, ornamental elements

#### 📊 TEXT ELEMENT EXTRACTION LIMITS:
```
For a typical web page, extract ONLY:
  - Headings: 3-10 locators (page title + key section headers)
  - Labels: 5-15 locators (form labels + status badges only)
  - Text Spans: 10-30 locators (product names, prices, counts, IDs)
  - Images: 5-20 locators (logos, product images with functional purpose)
  - Paragraphs: 0-5 locators (ONLY if used for validation/testing)
  
Total TEXT elements: Maximum 30-50 locators (not 100+)
```

#### 🎯 TEXT EXTRACTION DECISION TREE:
```
Is it a heading/span/paragraph?
  └─> Is it inside a clickable element? 
      └─> YES → EXTRACT (it's actionable content)
      └─> NO → Continue...
  
  └─> Does it display unique business data? (price, ID, name)
      └─> YES → EXTRACT (it's verifiable data)
      └─> NO → Continue...
  
  └─> Does it change dynamically? (counter, status, date)
      └─> YES → EXTRACT (it's dynamic content)
      └─> NO → Continue...
  
  └─> Is it a page title or primary section header?
      └─> YES → EXTRACT (it's a landmark)
      └─> NO → SKIP (it's generic text)
```

### 🟢 MANDATORY CONTAINER ELEMENTS (Extract with iteration patterns):
- **Tables** - Extract table container + iteration patterns (NOT individual cells)
- **Lists** - Extract ul/ol container + iteration patterns (NOT individual li items)
- **Product grids** - Extract grid container + iteration pattern for product cards
- **Article/Card containers** - Extract section container + iteration pattern for cards

### 🟣 MANDATORY STATE/VALIDATION ELEMENTS:
- **Error messages** - validation errors, form errors, toast notifications
- **Success messages** - confirmation messages, success toasts
- **Loading indicators** - spinners, progress bars, skeleton screens
- **Tooltips/Help text** - hover tooltips, inline help, info icons
- **Badges/Tags** - status badges, category tags, count badges

### 🚫 CRITICAL EXCLUSIONS - SVG & DECORATIVE GRAPHICS:

**❌ DO NOT EXTRACT Decorative SVG Elements:**
- **SVG Paths** - Individual `<path>` elements in graphics, maps, charts, illustrations
- **SVG Shapes** - `<circle>`, `<rect>`, `<polygon>`, `<line>` used for decoration
- **Map Visualization Paths** - Geographic region boundaries, country shapes in world maps
- **Chart/Graph Components** - Data visualization paths, grid lines, axis markers
- **Decorative Illustrations** - Icon components, logo paths, background graphics

**✅ EXTRACT Interactive SVG Elements ONLY IF:**
- The SVG element is **clickable** (has onclick, href, or role="button")
- The SVG is wrapped in an **interactive element** (button, link, clickable div)
- The SVG serves as an **action icon** (close button, menu icon, edit icon)
- The SVG has a **unique functional purpose** (not part of a decorative group)

**Example - SVG Filtering:**
```html
<!-- ❌ DO NOT EXTRACT - Decorative map paths -->
<g id="map_region">
  <path id="Path_2649" d="M123..." fill="#d1d8df"></path>  ← SKIP (decorative)
  <path id="Path_2650" d="M456..." fill="#d1d8df"></path>  ← SKIP (decorative)
  <path id="Path_2651" d="M789..." fill="#d1d8df"></path>  ← SKIP (decorative)
</g>

<!-- ✅ EXTRACT - Interactive SVG container -->
<a href="#region" class="map-region-link">
  <g id="asia_region">...</g>  ← EXTRACT (entire clickable group)
</a>

<!-- ✅ EXTRACT - Action icon button -->
<button class="close-btn">
  <svg><path d="M..."></path></svg>  ← EXTRACT (button, not path)
</button>
```

**SVG Exclusion Rules:**
1. Skip individual `<path>`, `<circle>`, `<rect>`, `<polygon>` elements
2. Skip `<g>` groups that are purely decorative (no interaction)
3. Extract parent interactive elements (buttons/links wrapping SVG)
4. Extract top-level interactive SVG containers only (not child paths)
5. Use descriptive names like `world_map_container`, `asia_region_group` for interactive SVG groups

## DO NOT:
- ❌ Skip elements thinking they're "less important"
- ❌ Focus only on "primary" or "main" elements
- ❌ Group similar elements together (extract each individually)
- ❌ Limit to "most relevant" elements
- ❌ Filter based on your judgment
- ❌ Skip buttons inside product cards or containers
- ❌ Skip text spans with prices, calories, or descriptions
- ❌ Skip images without proper locators
- ❌ Assume "the user only needs the main button"
- ❌ Extract only the container and skip child elements
- ❌ Think "15-20 locators is enough" (actual number depends on page complexity)
- ❌ Skip elements because they look similar to others
- ❌ **Extract individual SVG paths from decorative graphics, maps, charts, or illustrations**

## ✅ MANDATORY RULES FOR 100% EXTRACTION:

### Rule 1: PARENT + ALL CHILDREN
```
For every container (div, article, section with products/cards):
  ✅ Extract container locator
  ✅ Extract ALL buttons inside
  ✅ Extract ALL links inside
  ✅ Extract ALL text spans inside
  ✅ Extract ALL images inside
  ✅ Extract ALL headings inside
```

### Rule 2: COUNT-BASED VERIFICATION
```
If HTML contains:
  - 10 buttons → YAML must have 10 button locators
  - 5 product cards with 2 buttons each → YAML must have 10 button locators
  - 8 text spans with prices → YAML must have 8 price span locators
  - 15 navigation links → YAML must have 15 link locators
```

### Rule 3: ELEMENT TYPE MINIMUM THRESHOLDS (REVISED with precision)
```
For a typical web page, expect:
  
INTERACTIVE ELEMENTS (Always extract ALL):
  - Buttons: 10-30 locators (extract EVERY button)
  - Links: 15-50 locators (extract EVERY link)
  - Inputs: 5-20 locators (extract EVERY input if forms present)
  - Selects/Dropdowns: 2-10 locators (extract ALL)
  - Checkboxes/Radios: 3-15 locators (extract ALL)
  
TEXT ELEMENTS (Selective extraction with filters):
  - Headings: 3-10 locators (main page title + key section headers only)
  - Labels: 5-15 locators (form labels + status badges only)  
  - Text Spans: 10-30 locators (prices, IDs, product names, counts only)
  - Images: 5-20 locators (functional images only - logos, product images)
  - Paragraphs: 0-5 locators (ONLY if used for validation)

CONTAINERS (Extract with iteration patterns):
  - Tables: 1-5 locators (container + iteration patterns)
  - Lists: 2-10 locators (container + iteration patterns)
  
TOTAL RECOMMENDED: 50-120 locators per chunk for content-rich pages
  - Interactive: 35-90 locators (HIGH priority)
  - Text: 15-50 locators (SELECTIVE priority)
  - Containers: 3-15 locators (PATTERN-based)
```

### Rule 4: DIFFERENTIATE SIMILAR ELEMENTS
When multiple elements have same ID/class but different context:
```html
<!-- Product 1 -->
<button id="start-order-button" data-product="12345">Start Order</button>

<!-- Product 2 -->
<button id="start-order-button" data-product="67890">Start Order</button>
```

**REQUIRED: Create 2 separate locators:**
```yaml
product_12345_start_order_button:
  preferred:
    locator: "//div[@data-id='12345']//button[@id='start-order-button']"
    
product_67890_start_order_button:
  preferred:
    locator: "//div[@data-id='67890']//button[@id='start-order-button']"
```

### Rule 5: TEXT ELEMENTS - PRECISION OVER QUANTITY (NEW)
```
Text elements serve verification purposes, NOT exhaustive documentation.

✅ EXTRACT when text is:
  - Unique identifier (product name, order ID, user email)
  - Dynamic value (price, count, status, date)
  - Validation target (error message, success message)
  - Primary landmark (page title h1, main section h2)
  - Actionable content (button text, link text, tab text)

❌ SKIP when text is:
  - Generic description/copy
  - Marketing content
  - Legal disclaimers
  - Instructional paragraphs
  - Repeated across multiple elements
  - Hidden or purely decorative
  
Example - Product Card:
  ✅ Extract: Product name (h3), Price span, "Add to Cart" button
  ❌ Skip: Product description paragraph, Ingredients list, Nutritional info paragraph
```

## SEARCH STRATEGY:

### 🎯 EXHAUSTIVE ELEMENT DISCOVERY PROCESS:

#### Step 1: SCAN FOR ALL INTERACTIVE PATTERNS
Search the ENTIRE HTML for these patterns (use BeautifulSoup/DOM inspection mentally):
- `onclick=` attribute - ANY element with click handlers
- `href=` attribute - ALL anchor links
- `type="button|submit|reset"` - ALL button types
- `type="text|email|password|search|tel|url|number|date"` - ALL input types
- `role="button|link|checkbox|radio|tab|menuitem"` - ALL ARIA roles
- `data-*` attributes - ALL data attributes (especially data-testid, data-action, data-id)
- `class` containing: "button|btn|link|input|select|dropdown|toggle|switch|clickable|interactive"
- `aria-label`, `aria-labelledby`, `aria-describedby` - ALL ARIA labels
- `tabindex` - Elements made focusable for keyboard navigation

#### Step 2: SCAN FOR TEXT/CONTENT ELEMENTS (WITH PRECISION FILTERS)
Apply these filters to avoid extracting excessive generic text:

**✅ EXTRACT ONLY**:
- **Page titles & primary headers**: Main `<h1>` (page title), key `<h2>` (section headers)
- **Form labels**: `<label>` elements directly associated with inputs
- **Status/Badge labels**: `<span class="badge">`, `<span class="label">`, status indicators
- **Unique identifiers**: Product names in `<h3>` inside product cards, order IDs, user info
- **Dynamic values**: `<span>` with prices, counts, dates, timestamps, ratings
- **Validation messages**: Error messages, success messages, tooltips with feedback
- **Functional images**: `<img>` with unique alt text serving as clickable elements or data

**❌ DO NOT EXTRACT**:
- Generic `<p>` paragraphs with descriptions/marketing copy
- `<h4>`, `<h5>`, `<h6>` used purely for styling
- Repeated text spans across multiple identical elements
- Legal text, disclaimers, terms & conditions
- Decorative spans without functional purpose
- Hidden elements (`display: none`, `visibility: hidden`)
- Long text blocks without testing value

**FILTERING LOGIC**:
```python
# Pseudo-code for text element filtering
if element.tag in ['span', 'p', 'h4', 'h5', 'h6']:
    if has_unique_business_data(element):  # price, ID, name
        EXTRACT()
    elif is_dynamic_content(element):  # changes with state
        EXTRACT()
    elif is_validation_message(element):  # error/success
        EXTRACT()
    elif has_testid_or_aria(element):  # explicitly marked for testing
        EXTRACT()
    else:
        SKIP()  # Generic descriptive text
        
if element.tag in ['h1', 'h2']:
    if is_page_title_or_section_header(element):
        EXTRACT()  # Landmarks only
        
if element.tag == 'label':
    if associated_with_form_input(element):
        EXTRACT()  # Form labels only
```

#### Step 3: DRILL INTO EVERY CONTAINER (SELECTIVE CHILD EXTRACTION)
For EVERY container element (div, article, section, card, tile):
```
1. Extract the CONTAINER locator first
2. THEN extract child elements with precision:
   
   ✅ ALWAYS extract (100% required):
      - Every button inside the container
      - Every link inside the container  
      - Every input inside the container
      - Every select/dropdown inside the container
      - Every checkbox/radio inside the container
   
   ✅ SELECTIVELY extract (apply filters):
      - Product/item name (h3/h4 in card) - YES
      - Price/cost span - YES
      - Primary image (product image) - YES
      - Status badge/label - YES
      - Long description paragraph - NO (skip generic text)
      - Marketing copy - NO
      - Decorative text - NO
```

**Example - Product Card Container:**
```html
<div class="product-card" data-id="12345">
  <img src="product.jpg" alt="Product Image">           ← EXTRACT (functional image)
  <h3 class="product-title">Deluxe Burger</h3>          ← EXTRACT (unique identifier)
  <p class="short-desc">Premium burger</p>              ← SKIP (generic marketing)
  <span class="price">$19.99</span>                     ← EXTRACT (dynamic value)
  <span class="calories">500 cals</span>                ← EXTRACT (business data)
  <p class="long-desc">Made with...</p>                 ← SKIP (long description)
  <button id="add-to-cart">Add to Cart</button>         ← EXTRACT ⚠️ CRITICAL!
  <button id="view-details">View Details</button>       ← EXTRACT ⚠️ CRITICAL!
</div>
```
**RESULT: 6 locators** (1 container + 2 buttons + 1 title + 1 price + 1 calorie span)
**SKIPPED: 2 paragraphs** (generic text without testing value)

#### Step 4: HANDLE REPETITIVE STRUCTURES (WITH TEXT FILTERING)
**Product Cards / Item Cards:**
```html
<div class="product-card" data-id="12345">
  <img src="product.jpg" alt="Product Image">           ← EXTRACT (functional image)
  <h3 class="product-title">Product Name</h3>           ← EXTRACT (unique identifier)
  <span class="price">$19.99</span>                     ← EXTRACT (business data)
  <span class="calories">500 cals</span>                ← EXTRACT (nutritional data)
  <p class="description">Long marketing copy...</p>     ← SKIP (generic paragraph)
  <button id="add-to-cart">Add to Cart</button>         ← EXTRACT ⚠️ CRITICAL!
  <button id="view-details">View Details</button>       ← EXTRACT ⚠️ CRITICAL!
</div>
```
**REQUIRED: 6 locators** (1 container + 2 buttons + 1 title + 1 price + 1 calorie)  
**SKIPPED: 1 paragraph** (generic description)

**For multiple similar cards**: Use parent context in locator naming:
- `product_12345_add_to_cart_button`
- `product_12345_view_details_button`
- `product_12345_title_text`
- `product_12345_price_span`
- OR use parameterized XPath: `//div[@data-id='{product_id}']//button[@id='add-to-cart']`

#### Step 5: CROSS-REFERENCE VALIDATION (INTERACTIVE + SELECTIVE TEXT)
After extraction, mentally verify:

**Interactive Elements (100% extraction required):**
- [ ] Every `<button>` tag has a locator
- [ ] Every `<a href>` tag has a locator
- [ ] Every `<input>` tag has a locator
- [ ] Every `<select>` tag has a locator
- [ ] Every clickable `<div>` or `<span>` has a locator
- [ ] Every product card has locators for ALL its child buttons/links
- [ ] Every form has locators for ALL its fields
- [ ] Every navigation menu has locators for ALL its items

**Text Elements (Selective extraction with filters):**
- [ ] Page title (`<h1>`) extracted
- [ ] Primary section headers (`<h2>`) extracted (NOT all h2s)
- [ ] Form labels associated with inputs extracted
- [ ] Product names/titles in cards extracted
- [ ] Price/cost spans extracted
- [ ] Status badges/labels extracted
- [ ] Error/success messages extracted
- [ ] Generic paragraphs SKIPPED (not extracted)
- [ ] Marketing copy SKIPPED
- [ ] Decorative text SKIPPED

**Quality Checks:**
- [ ] Text locators: 15-50 (not 100+)
- [ ] Interactive locators: 35-90
- [ ] Total locators: 50-120 (balanced ratio)

## DYNAMIC XPATH AXES RULES:
**Apply when standard locators (id, name, class, data-testid) cannot uniquely identify elements:**

1. **Sibling-based Location**: Use when elements are siblings but lack unique attributes
   - `//label[text()='Email']/following-sibling::input[1]`
   - `//button[text()='Cancel']/preceding-sibling::button[text()='Submit']`

2. **Parent-Child Relationships**: Use when element is identifiable through its container
   - `//div[@class='form-section'][h3[text()='Personal Info']]//input[@name='email']`
   - `//form[@id='checkout']//button[@type='submit']`

3. **Positional Context**: Use when element position is stable relative to landmarks
   - `//nav[@class='main-menu']/following::main//button[1]`
   - `//h2[text()='Product Details']/ancestor::section//img[@alt]`

4. **Text-based Anchoring**: Use stable text as reference points
   - `//td[text()='Total:']/following-sibling::td[contains(@class, 'amount')]`
   - `//span[text()='Status:']/parent::div//select`

## GENERAL OPTIMIZATION:
- Prioritize semantic understanding of element purpose
- Consider accessibility attributes (aria-*, role, etc.)
- Focus on human-readable identifiers
- Use natural language patterns in locator descriptions
- Optimize for maintainability and readability
- **USE NEW FORMAT**: Element names as keys, not list format

## LOCATOR STRATEGY:
- Prefer data-testid and data-* attributes
- Use semantic HTML elements (button, input, nav, etc.)
- Leverage ARIA labels and roles
- Consider element position relative to landmarks
- Include text-based locators for stable text elements
- **When standard locators fail**: Apply dynamic XPath axes strategies (following-sibling, preceding-sibling, ancestor, descendant)
- **For tables/lists**: Create container and iteration locators, not individual cell/item locators
- **FALLBACK COUNT**: Generate exactly 2 fallback locators per element (not just 1)

**HTML CONTENT:**
'{html_content}'

## Output Format Requirements for Locator Extraction

**CRITICAL: You MUST return ONLY valid YAML format. NO natural language, NO explanations, NO markdown.**

### YAML Output Format for Locators:

```yaml
locators:
  submit_button:
    element_type: "button"
    ai_fallback: "disabled"
    element_desc: "Primary submit button in login form with text 'Submit' or 'Login', typically positioned at bottom-right of form, may have blue/primary styling"
    preferred:
      locator: "[data-testid='submit-button']"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "button[type='submit']"
        type: "css"
        confidence: 0.85
      fallback_2:
        locator: "//button[contains(text(), 'Submit')]"
        type: "xpath"
        confidence: 0.80
      fallback_3:
        locator: "//form[@class='login-form']//button[@type='submit']"
        type: "xpath"
        confidence: 0.75
    attributes:
      id: ""
      name: ""
      text: "Submit"
      is_hidden: false

  username_input:
    element_type: "input"
    ai_fallback: "disabled"
    element_desc: "Username text input field in login form, typically has placeholder text 'Username' or 'Email', positioned above password field, may have user icon or label"
    preferred:
      locator: "[data-testid='username-input']"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "input[name='username']"
        type: "css"
        confidence: 0.85
      fallback_2:
        locator: "//label[text()='Username']/following-sibling::input"
        type: "xpath"
        confidence: 0.80
      fallback_3:
        locator: "//div[@class='form-group'][label[text()='Username']]//input"
        type: "xpath"
        confidence: 0.75
    attributes:
      id: ""
      name: "username"
      text: ""
      is_hidden: false

  product_table:
    element_type: "table"
    ai_fallback: "disabled"
    element_desc: "Product listing table with columns for Name, Price, Stock, Actions - use for iteration rather than individual cell access"
    preferred:
      locator: "[data-testid='product-table']"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "table.products-table"
        type: "css"
        confidence: 0.85
      fallback_2:
        locator: "//table[thead//th[text()='Product Name']]"
        type: "xpath"
        confidence: 0.80
      fallback_3:
        locator: "//div[@class='table-container']//table"
        type: "xpath"
        confidence: 0.75
    iteration_patterns:
      table_rows:
        locator: "//table[@data-testid='product-table']//tbody//tr"
        type: "xpath"
        description: "All data rows for iteration"
      table_cells:
        locator: "//table[@data-testid='product-table']//tbody//tr[{row_index}]/td[{col_index}]"
        type: "xpath_parameterized"
        description: "Parameterized cell access by row and column index"
      column_by_name:
        locator: "//table[@data-testid='product-table']//th[text()='{column_name}']/position()"
        type: "xpath_parameterized"
        description: "Get column index by header name"
    attributes:
      id: "product-table"
      name: ""
      text: ""
      is_hidden: false

  navigation_menu:
    element_type: "ul"
    ai_fallback: "disabled"
    element_desc: "Main navigation menu list containing links to different sections - use for iteration rather than individual link access"
    preferred:
      locator: "[data-testid='main-nav']"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "nav.main-navigation ul"
        type: "css"
        confidence: 0.85
      fallback_2:
        locator: "//nav[@class='main-navigation']//ul"
        type: "xpath"
        confidence: 0.80
      fallback_3:
        locator: "//header//ul[@role='navigation']"
        type: "xpath"
        confidence: 0.75
    iteration_patterns:
      menu_items:
        locator: "//ul[@data-testid='main-nav']//li"
        type: "xpath"
        description: "All menu items for iteration"
      menu_links:
        locator: "//ul[@data-testid='main-nav']//li//a"
        type: "xpath"
        description: "All menu links for iteration"
      item_by_text:
        locator: "//ul[@data-testid='main-nav']//li//a[contains(text(), '{menu_text}')]"
        type: "xpath_parameterized"
        description: "Menu item by text content"
    attributes:
      id: "main-nav"
      name: ""
      text: ""
      is_hidden: false
```

### Format Guidelines:
- Use semantic element names as keys (e.g., submit_button, username_input, product_table, navigation_menu)
- Always include element_type, preferred locator, and fallbacks
- Confidence scores should reflect locator stability (0.0 to 1.0)
- Include relevant attributes (id, name, text, is_hidden)
- Generate up to 3 fallback locators per element
- **For tables/lists**: Include iteration_patterns section with parameterized locators
- **Use dynamic XPath axes**: When standard attributes fail, employ sibling/ancestor/descendant strategies
- Prioritize data-testid attributes when available
- Use CSS selectors for preferred locators when possible
- Include XPath as fallback for complex selections or when using axes strategies
- ai_fallback text should be always "disabled"
- The element_desc should be comprehensive and include multiple identifying characteristics: element type, purpose/function, visual text content, contextual location (e.g., "within header navigation", "in login form"), unique attributes, and any distinguishing features that would help AI identify it from HTML source code.

### Locator Priority Order:
1. data-testid attributes (highest priority)
2. Semantic HTML attributes (name, id)
3. ARIA labels and roles
4. Stable CSS classes
5. **Dynamic XPath with axes** (following-sibling, ancestor, descendant)
6. **Container-based location** (for tables/lists)
7. Text-based XPath as last resort

**Remember: Output ONLY the YAML structure, nothing else.**

### Element Description Best Practices for AI Healing:

When writing element_desc for optimal AI healing performance, include:

1. **Element Type & Purpose**: What the element is and what it does
2. **Visual Text Content**: Exact text, placeholder text, or aria-labels
3. **Contextual Location**: Where it appears on the page (sidebar, main content)
4. **Visual Characteristics**: Color, size, styling hints that distinguish it
5. **Functional Context**: Part of a form, navigation menu, product listing, etc.
6. **Relationship to Other Elements**: Near which other elements, parent containers

**Example Good Descriptions:**
- "Primary navigation link for 'Products' category in main header menu, typically styled as uppercase text"
- "Add to cart button with shopping cart icon, positioned below product price in product detail section"
- "Search input field with magnifying glass icon and 'Search products...' placeholder in top navigation bar"
- "Email address input field in registration form, positioned between name field and password field, may have envelope icon"
- "Product data table with sortable columns for Name, Price, Stock - contains multiple rows for iteration"
- "Main navigation menu with Home, Products, About, Contact links - extract as container for menu item iteration"

## STRATEGIC LOCATOR SELECTION RULES:

### When to Use Dynamic XPath Axes:
- **Multiple similar elements**: When page has multiple buttons/inputs without unique identifiers
- **Form relationships**: When label-input relationships exist but lack proper `for`/`id` attributes  
- **Contextual location**: When element identity depends on nearby text or containers
- **Table navigation**: When accessing cells relative to headers or other cells
- **Dynamic content**: When element position is stable relative to landmarks but content changes

### Table/List Handling Strategy:
- **Never create individual cell/item locators** for large tables or lists
- **Always provide container locator** and iteration patterns
- **Include parameterized locators** for dynamic row/column access
- **Provide column identification** by header text when possible
- **Consider pagination** - make locators work across paginated data

### Fallback Strategy Priority:
1. **Primary**: data-testid or semantic attributes
2. **Secondary**: Stable CSS classes or IDs
3. **Tertiary**: Dynamic XPath with axes relationships
4. **Emergency**: Text-based XPath (least stable)


**CRITICAL: Return ONLY valid YAML. NO natural language, NO explanations, NO markdown formatting.**
