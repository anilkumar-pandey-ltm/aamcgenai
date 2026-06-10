---
name: traceability-excel-export
description: Patterns for generating comprehensive Excel traceability matrix workbooks per user story with 7 subsheets covering AC coverage, business rules mapping, test categories, quality metrics, and priority analysis.
---

# Traceability Matrix Excel Export - Skills & Patterns

## 🎯 Purpose
Generate comprehensive Excel traceability matrix workbooks for each user story with multi-sheet detailed coverage analysis. This enables stakeholders to review test coverage, business rules mapping, and quality metrics in a business-friendly format.

---

## 📊 Excel Workbook Structure (7 Subsheets per Story)

Each story generates an Excel workbook: `{STORY_ID}_Traceability_Matrix.xlsx`

**Example**: `POCTC-54_Traceability_Matrix.xlsx`

---

### Sheet 1: `Story_Summary`

**Purpose**: High-level story metadata and quality metrics dashboard

**Columns**:

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| Metric | Text | Metric name | Total Scenarios |
| Value | Text/Number | Metric value | 12 |

**Required Rows** (in order):

```
Metric                  | Value
------------------------|------------------
Story ID                | POCTC-54
Story Title             | Ollama Sign-In Functionality
Story Status            | In Progress / Done
Story Priority          | High
Generator Agent         | web-BDD_Testscenarios-gen
Application             | Ollama / Demo E-Commerce
Base URL                | http://localhost/en/
Generated Date          | 2026-02-26
Total Scenarios         | 12
Scenario Outline Count  | 11
Simple Scenario Count   | 1
Scenario Outline %      | 91.7%
Total Example Rows      | 64
Avg Examples/Outline    | 5.8
AC Count                | 6
AC Coverage %           | 100%
BR Count                | 12
BR Coverage %           | 100%
Test Categories Covered | 12
Quality Score           | 100/100
```

**Formatting**:
- Header row: Bold, dark blue background (#1F4E79), white text
- Alternate row colors: White (#FFFFFF) and light blue (#D9E1F2)
- Freeze header row
- Auto-filter enabled
- Column widths: Metric (30 chars), Value (20 chars)

---

### Sheet 2: `Acceptance_Criteria`

**Purpose**: Detailed AC inventory with scenario mapping and coverage tracking

**Columns**:

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| AC ID | Text | Acceptance criteria identifier | AC-1 |
| AC Description | Text | Full acceptance criteria text | Sign-in page displays email, password fields and sign-in button |
| Sub-Criteria ID | Text | Sub-criterion identifier | AC-1.1 |
| Sub-Criteria Description | Text | Detailed sub-criterion | Email input field visible |
| Mapped Scenarios | Text | Comma-separated scenario numbers | Scenario [1] |
| Scenario Count | Number | Number of scenarios covering this AC | 1 |
| Coverage % | Number | Individual AC coverage percentage | 100% |
| Priority | Text | AC priority (Critical/High/Medium/Low) | Critical |
| Tags | Text | Scenario tags mapped to this AC | @positive @smoke @ac-1 |

**Example Data** (from POCTC-54):

```
AC ID | AC Description                                      | Sub-Criteria ID | Sub-Criteria Description        | Mapped Scenarios  | Scenario Count | Coverage % | Priority | Tags
------|-----------------------------------------------------|-----------------|--------------------------------|-------------------|----------------|------------|----------|------------------
AC-1  | Sign-in page displays email, password fields and... | AC-1.1          | Email input field visible      | Scenario [1]      | 1              | 100%       | Critical | @positive @smoke
AC-1  | Sign-in page displays email, password fields and... | AC-1.2          | Password input field visible   | Scenario [1]      | 1              | 100%       | Critical | @positive @smoke
AC-1  | Sign-in page displays email, password fields and... | AC-1.3          | Sign-in button visible/enabled | Scenario [1]      | 1              | 100%       | Critical | @positive @smoke
AC-2  | Valid credentials redirect to dashboard             | AC-2.1          | Redirect occurs on valid login | Scenarios [2, 11] | 2              | 100%       | Critical | @positive @smoke
```

**Summary Row** (at bottom):
```
Total ACs: 6 | Total Sub-Criteria: 18 | Overall AC Coverage: 100%
```

**Formatting**:
- Header: Bold, dark blue (#1F4E79), white text
- Freeze header row
- Auto-filter
- Conditional formatting: Coverage % < 100% → Red background
- Column widths: AC Description (50), Sub-Criteria Description (50), Mapped Scenarios (30)

---

### Sheet 3: `Test_Scenarios`

**Purpose**: Comprehensive scenario inventory with metadata

**Columns**:

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| Scenario Number | Number | Sequential scenario ID | 1 |
| Scenario Type | Text | Scenario / Scenario Outline | Scenario Outline |
| Scenario Name | Text | Full scenario title | Successful sign-in with valid credentials... |
| Tags | Text | Scenario tags | @positive @smoke @data-driven |
| AC Coverage | Text | ACs covered by this scenario | AC-2 |
| BR Coverage | Text | BRs covered by this scenario | BR-004, BR-011 |
| Test Technique | Text | Test design technique applied | Equivalence Partitioning (EP) |
| Test Category | Text | Category classification | Happy Path, Authentication |
| Example Count | Number | Number of example rows (0 for simple) | 5 |
| Step Count | Number | Number of Given/When/Then steps | 12 |
| Automation Candidate | Text | Yes / No / Partial | Yes |
| Automation Complexity | Text | Low / Medium / High | Low |
| Priority | Text | Execution priority | P0 - Critical |
| Notes | Text | Additional notes | Core happy path scenario |

**Example Data**:

```
Scenario # | Type             | Scenario Name                                      | Tags                      | AC Coverage | BR Coverage  | Test Technique | Test Category      | Example Count | Step Count | Automation
-----------|------------------|----------------------------------------------------|---------------------------|-------------|--------------|----------------|--------------------|---------------|------------|-------------
1          | Scenario         | Verify sign-in page displays all required UI...    | @positive @smoke @ac-1    | AC-1, AC-5  | BR-007, BR-010| Simple         | Happy Path, UI     | 0             | 8          | Yes
2          | Scenario Outline | Successful sign-in with valid credentials...      | @positive @smoke          | AC-2        | BR-004, BR-011| EP - Valid     | Happy Path, Auth   | 5             | 12         | Yes
3          | Scenario Outline | Sign-in with invalid credentials shows error...   | @negative @validation     | AC-3, AC-6  | BR-005, BR-006| EP - Invalid   | Negative, Error    | 6             | 14         | Yes
```

**Summary Row**:
```
Total: 12 | Scenario Outline: 11 (91.7%) | Simple: 1 (8.3%) | Avg Examples: 5.8 | Automation Ready: 100%
```

**Formatting**:
- Header: Bold, dark green (#375623), white text
- Alternate row colors
- Auto-filter
- Conditional formatting: 
  - Automation Candidate = "Yes" → Light green (#C6EFCE)
  - Automation Candidate = "No" → Light red (#FFC7CE)

---

### Sheet 4: `AC_Coverage_Matrix`

**Purpose**: Requirements Traceability Matrix (RTM) showing Scenario vs AC mapping

**Format**: Matrix/Pivot-style table

**Rows**: Scenarios (1-12)  
**Columns**: Acceptance Criteria (AC-1 to AC-n)  
**Cell Values**: 
- ✅ (or "X") = Scenario covers this AC
- Empty = No coverage

**Example Matrix**:

```
Scenario Name                           | AC-1 | AC-2 | AC-3 | AC-4 | AC-5 | AC-6 | Total AC Coverage
-----------------------------------------|------|------|------|------|------|------|------------------
1. Verify sign-in page displays...      | ✅   |      |      |      | ✅   |      | 2/6 (33%)
2. Successful sign-in with valid...     |      | ✅   |      |      |      |      | 1/6 (17%)
3. Sign-in with invalid credentials...  |      |      | ✅   |      |      | ✅   | 2/6 (33%)
4. Sign-in with empty fields...         |      |      |      | ✅   |      | ✅   | 2/6 (33%)
...
-----------------------------------------|------|------|------|------|------|------|------------------
Total Scenarios per AC                  | 1    | 2    | 3    | 3    | 2    | 4    |
AC Coverage %                           | 100% | 100% | 100% | 100% | 100% | 100% | Overall: 100%
```

**Alternative Detailed Format**:

| Scenario Number | Scenario Name | AC-1 | AC-2 | AC-3 | AC-4 | AC-5 | AC-6 | Coverage % |
|-----------------|---------------|------|------|------|------|------|------|------------|
| 1 | Verify sign-in page UI | X | | | | X | | 33% |
| 2 | Valid credentials login | | X | | | | | 17% |
| 3 | Invalid credentials error | | | X | | | X | 33% |

**Formatting**:
- First row: AC IDs
- First column: Scenario names
- Header: Bold, navy blue (#002060), white text
- Checkmarks: Green (#00B050)
- Empty cells: Light gray (#F2F2F2)
- Summary row/column: Bold, yellow background (#FFFF00)
- Freeze first row and first column

---

### Sheet 5: `Business_Rules`

**Purpose**: Business rules inventory with coverage tracking

**Columns**:

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| BR ID | Text | Business rule identifier | BR-001 |
| BR Category | Text | Rule category | Validation |
| BR Description | Text | Complete business rule text | Email field is required (cannot be empty) |
| Priority | Text | Critical/High/Medium/Low | Critical |
| Mapped Scenarios | Text | Scenarios implementing this rule | Scenarios [4] |
| Scenario Count | Number | Number of scenarios validating BR | 1 |
| Coverage % | Number | BR coverage percentage | 100% |
| Related AC | Text | Linked acceptance criteria | AC-4 |
| Validation Method | Text | How BR is verified | Negative test - empty field |
| Implementation Status | Text | Implemented / Pending / N/A | Implemented |

**Example Data**:

```
BR ID  | Category       | Description                                       | Priority | Mapped Scenarios | Count | Coverage | Related AC | Validation Method
-------|----------------|---------------------------------------------------|----------|------------------|-------|----------|------------|---------------------------
BR-001 | Validation     | Email field is required (cannot be empty)         | Critical | Scenarios [4]    | 1     | 100%     | AC-4       | Negative test - empty field
BR-002 | Validation     | Password field is required (cannot be empty)      | Critical | Scenarios [4]    | 1     | 100%     | AC-4       | Negative test - empty field
BR-003 | Validation     | Email must follow valid email format (RFC 5322)   | Critical | Scenarios [5]    | 1     | 100%     | AC-3       | Format validation test
BR-004 | Authentication | Valid active credentials redirect to dashboard    | Critical | Scenarios [2, 11]| 2     | 100%     | AC-2       | Positive test - valid login
```

**Summary Row**:
```
Total BRs: 12 | Critical: 4 | High: 6 | Medium: 2 | Low: 0 | Overall BR Coverage: 100%
```

**Formatting**:
- Header: Bold, dark orange (#C65911), white text
- Conditional formatting:
  - Priority = "Critical" → Red text
  - Priority = "High" → Orange text
  - Coverage % < 100% → Red background
- Auto-filter enabled

---

### Sheet 6: `Test_Design_Techniques`

**Purpose**: Catalog of test design techniques applied to ensure comprehensive coverage

**Columns**:

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| Technique ID | Number | Sequential technique number | 1 |
| Technique Name | Text | Test design technique name | Equivalence Partitioning (EP) |
| Technique Category | Text | Structural/Black-box/Experience-based | Black-box |
| Description | Text | Brief technique description | Divide inputs into valid/invalid classes |
| Applied to Scenarios | Text | Scenarios using this technique | Scenario 3 (invalid creds classes) |
| Scenario Count | Number | Number of scenarios using technique | 2 |
| Coverage Target | Text | What aspect is covered | Input validation, edge cases |
| Effectiveness | Text | High/Medium/Low | High |
| Reference | Text | Link to skill file or standard | test-design-techniques.md#EP |

**Example Data**:

```
ID | Technique Name                  | Category  | Description                              | Applied to Scenarios                    | Count | Effectiveness
---|--------------------------------|-----------|------------------------------------------|-----------------------------------------|-------|-------------
1  | Equivalence Partitioning (EP)  | Black-box | Divide inputs into valid/invalid classes | Scenario 3 (invalid creds), Scenario 5  | 2     | High
2  | Boundary Value Analysis (BVA)  | Black-box | Test at min, max, typical boundaries     | Scenario 6 (password length: 0,1,8,60) | 1     | High
3  | Decision Table Testing         | Black-box | Cover all combinations of conditions     | Scenario 10 (account status × creds)   | 1     | High
4  | State Transition Testing       | Black-box | Test state changes and transitions       | Scenario 10 (account states)           | 1     | Medium
5  | User Journey / End-to-End      | Experience| Complete user workflow testing           | Scenario 11 (landing → dashboard)      | 1     | High
6  | RBAC Testing                   | Black-box | Role-based access validation             | Scenario 12 (role-based sections)      | 1     | Medium
7  | Alternative Flow Testing       | Experience| User deviates from main flow             | Scenario 7 (navigate away, back button)| 1     | Medium
8  | Exception Flow Testing         | Black-box | System failure and error handling        | Scenario 9 (network, service errors)   | 1     | High
```

**Summary Row**:
```
Total Techniques Applied: 8 | Black-box: 6 | Experience-based: 2 | High Effectiveness: 6 | Target: ≥5 techniques per story ✅
```

**Formatting**:
- Header: Bold, purple (#7030A0), white text
- Effectiveness color coding:
  - High → Green background (#C6EFCE)
  - Medium → Yellow background (#FFEB9C)
  - Low → Red background (#FFC7CE)

---

### Sheet 7: `Test_Category_Coverage`

**Purpose**: Track coverage across 17 standard test categories

**Columns**:

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| Category ID | Number | Sequential category number | 1 |
| Category Name | Text | Test category name | Happy Path |
| Coverage Status | Text | Covered (✅) / Not Covered (❌) | ✅ Covered |
| Mapped Scenarios | Text | Scenarios in this category | Scenarios [1, 2, 11] |
| Scenario Count | Number | Number of scenarios in category | 3 |
| Coverage % | Number | % of total scenarios in category | 25% |
| Priority | Text | Must-Have / Should-Have / Nice-to-Have | Must-Have |
| Notes | Text | Additional context | Core functionality validation |

**17 Standard Categories** (from bdd-coverage-strategies.md):

```
ID | Category Name         | Status     | Mapped Scenarios      | Count | Coverage % | Priority    | Notes
---|-----------------------|------------|----------------------|-------|------------|-------------|------------------------
1  | Happy Path            | ✅ Covered | [1, 2, 11]           | 3     | 25%        | Must-Have   | Core positive flows
2  | Input Validation      | ✅ Covered | [3, 4, 5]            | 3     | 25%        | Must-Have   | Field validation rules
3  | Business Rules        | ✅ Covered | [2, 3, 4, 5, 10]     | 5     | 42%        | Must-Have   | Business logic enforcement
4  | Authentication        | ✅ Covered | [2, 3, 10]           | 3     | 25%        | Must-Have   | Login & session
5  | Authorization         | ✅ Covered | [12]                 | 1     | 8%         | Must-Have   | Role-based access
6  | Error Handling        | ✅ Covered | [3, 4, 5, 9]         | 4     | 33%        | Must-Have   | Graceful error display
7  | Edge Cases            | ✅ Covered | [6]                  | 1     | 8%         | Should-Have | Boundary scenarios
8  | State Transitions     | ✅ Covered | [10]                 | 1     | 8%         | Should-Have | Account state changes
9  | Navigation            | ✅ Covered | [7, 11]              | 2     | 17%        | Should-Have | Page navigation flows
10 | User Journeys         | ✅ Covered | [11]                 | 1     | 8%         | Must-Have   | End-to-end workflows
11 | Alternative Flows     | ✅ Covered | [7, 8]               | 2     | 17%        | Should-Have | User deviations
12 | Exception Flows       | ✅ Covered | [9]                  | 1     | 8%         | Must-Have   | System failures
13 | Data Integrity        | ❌ Not Covered | -                | 0     | 0%         | Should-Have | N/A for sign-in scope
14 | Integration Points    | ❌ Not Covered | -                | 0     | 0%         | Should-Have | Deferred to integration
15 | Dependent Features    | ❌ Not Covered | -                | 0     | 0%         | Nice-to-Have| N/A for sign-in
16 | Definition of Done    | ✅ Covered | [1, 9]               | 2     | 17%        | Must-Have   | Performance ≤5s
17 | Performance           | ✅ Covered | [1, 9]               | 2     | 17%        | Should-Have | Load time validation
```

**Summary Row**:
```
Categories Covered: 12/17 (70.6%) | Must-Have: 9/10 (90%) | Should-Have: 3/6 (50%) | Target: ≥10 categories ✅
```

**Formatting**:
- Header: Bold, teal (#00A170), white text
- Status color coding:
  - ✅ Covered → Green row background (#E2EFDA)
  - ❌ Not Covered → Light red (#FCE4D6)
- Priority badges:
  - Must-Have → Red text, bold
  - Should-Have → Orange text
  - Nice-to-Have → Gray text

---

## 🔧 Implementation Approach

### ✅ Recommended: Use the Traceability Excel Generator Utility

**Utility**: `src/utils/traceability_excel_generator.py`  
**Reference**: [src/utils/traceability_excel_generator.py](../../src/utils/traceability_excel_generator.py)

This utility replaces the fragile 200-line `python -c` inline approach with a
proper maintainable module. Use it directly via CLI — no new scripts needed.

**Prerequisites**:
```powershell
# Check if openpyxl is installed
python -c "import openpyxl; print('openpyxl version:', openpyxl.__version__)"

# Install if missing
pip install openpyxl
```

**CLI Invocation**:
```powershell
# Single story export
python src/utils/traceability_excel_generator.py \
  Output/testcases/GenAI_generated/POCTC-56_bdd.feature \
  Output/testcases/GenAI_generated/POCTC-56_Traceability_Matrix.xlsx \
  POCTC-56

# Traditional test case format
python src/utils/traceability_excel_generator.py \
  Output/testcases/GenAI_generated/POCTC-83_traditional.txt \
  Output/testcases/GenAI_generated/POCTC-83_Traceability_Matrix.xlsx \
  POCTC-83
```

**Inline Python (alternative when terminal is not available)**:

**Basic Export Template**:

```powershell
python -c "
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
import os
import re

# Initialize workbook
wb = openpyxl.Workbook()
wb.remove(wb.active)  # Remove default sheet

# =========================================
# SHEET 1: Story_Summary
# =========================================
ws1 = wb.create_sheet('Story_Summary', 0)
ws1.append(['Metric', 'Value'])

# Header formatting
ws1['A1'].font = Font(bold=True, color='FFFFFF')
ws1['A1'].fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
ws1['B1'].font = Font(bold=True, color='FFFFFF')
ws1['B1'].fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')

# Read feature file and extract metadata
feature_file = 'Output/testcases/GenAI_generated/POCTC-54_bdd.feature'
with open(feature_file, 'r', encoding='utf-8') as f:
    content = f.read()
    
    # Extract story ID from filename
    story_id = os.path.basename(feature_file).replace('_bdd.feature', '')
    
    # Extract metadata from comments
    generated_date = re.search(r'# Generated: ([\d-]+)', content)
    story_title = re.search(r'# Story:\s+[\w-]+ - (.+)', content)
    total_scenarios = content.count('Scenario Outline:') + content.count('Scenario:')
    scenario_outline_count = content.count('Scenario Outline:')
    simple_count = content.count('Scenario:') - content.count('Scenario Outline:')
    
    # Add data rows
    ws1.append(['Story ID', story_id])
    ws1.append(['Story Title', story_title.group(1) if story_title else ''])
    ws1.append(['Generated Date', generated_date.group(1) if generated_date else ''])
    ws1.append(['Total Scenarios', total_scenarios])
    ws1.append(['Scenario Outline Count', scenario_outline_count])
    ws1.append(['Simple Scenario Count', simple_count])
    ws1.append(['Scenario Outline %', f'{(scenario_outline_count/total_scenarios*100):.1f}%' if total_scenarios > 0 else '0%'])

# Column widths
ws1.column_dimensions['A'].width = 30
ws1.column_dimensions['B'].width = 20

# =========================================
# SHEET 2: Acceptance_Criteria
# =========================================
ws2 = wb.create_sheet('Acceptance_Criteria', 1)
ws2.append(['AC ID', 'AC Description', 'Sub-Criteria ID', 'Sub-Criteria Description', 'Mapped Scenarios', 'Scenario Count', 'Coverage %', 'Priority', 'Tags'])

# Header formatting
for col in range(1, 10):
    cell = ws2.cell(row=1, column=col)
    cell.font = Font(bold=True, color='FFFFFF')
    cell.fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')

# Extract AC data from feature file comments
ac_pattern = r'# (AC-\d+):\s+(.+)\n#\s+├─\s+(AC-\d+\.\d+):\s+(.+?)\s+→\s+Scenario\s+\[(.+?)\]'
for match in re.finditer(ac_pattern, content):
    ac_id, ac_desc, sub_id, sub_desc, scenarios = match.groups()
    scenario_list = scenarios.strip()
    scenario_count = len(scenario_list.split(','))
    ws2.append([ac_id, ac_desc, sub_id, sub_desc, f'Scenario [{scenario_list}]', scenario_count, '100%', 'Critical', ''])

ws2.freeze_panes = 'A2'
ws2.auto_filter.ref = ws2.dimensions

# =========================================
# Additional sheets follow same pattern...
# =========================================

# Save workbook
output_file = f'Output/testcases/GenAI_generated/{story_id}_Traceability_Matrix.xlsx'
wb.save(output_file)
print(f'✅ Traceability matrix exported: {output_file}')
"
```

---

## 📋 Data Extraction Patterns from Feature Files

### Extract Story Metadata

```python
import re

# Story ID from filename
story_id = os.path.basename(feature_file).replace('_bdd.feature', '')

# Generated date
generated_date = re.search(r'# Generated: ([\d-]+)', content).group(1)

# Story title
story_title = re.search(r'# Story:\s+[\w-]+ - (.+)', content).group(1)

# Application
application = re.search(r'# Application: (.+)', content).group(1)

# Base URL
base_url = re.search(r'# Base URL:\s+(.+)', content).group(1)
```

### Extract Acceptance Criteria

```python
# AC with sub-criteria
ac_pattern = r'# (AC-\d+):\s+(.+?)\n((?:#\s+[├└]─\s+.+\n)+)'
matches = re.findall(ac_pattern, content, re.MULTILINE)

for ac_id, ac_desc, sub_criteria_block in matches:
    # Extract sub-criteria
    sub_pattern = r'#\s+[├└]─\s+(AC-[\d.]+):\s+(.+?)\s+→\s+Scenario[s]?\s+\[(.+?)\]'
    sub_matches = re.findall(sub_pattern, sub_criteria_block)
    
    for sub_id, sub_desc, scenarios in sub_matches:
        print(f"{ac_id} | {ac_desc} | {sub_id} | {sub_desc} | {scenarios}")
```

### Extract Business Rules

```python
br_pattern = r'# (BR-\d+)\s+\|\s+(.+?)\s+\|\s+(.+?)\s+\|\s+(\w+)\s+\|\s+Scenario[s]?\s+\[(.+?)\]'
br_matches = re.findall(br_pattern, content)

for br_id, category, description, priority, scenarios in br_matches:
    print(f"{br_id} | {category} | {description} | {priority} | {scenarios}")
```

### Extract Scenarios

```python
# Scenario Outline
scenario_outline_pattern = r'@(.+?)\n\s+Scenario Outline:\s+(.+?)\n(.+?)Examples:'
outline_matches = re.findall(scenario_outline_pattern, content, re.DOTALL)

# Count example rows
example_pattern = r'Examples:.*?\n\s+\|(.+?)\n((?:\s+\|.+\n)+)'
example_matches = re.findall(example_pattern, content, re.DOTALL)

for match in example_matches:
    headers, rows = match
    row_count = len([r for r in rows.split('\n') if r.strip().startswith('|')])
```

### Extract Test Design Techniques

```python
technique_pattern = r'\d+\.\s+(.+?):\s+Scenario\s+\d+\s+\((.+?)\)'
techniques = re.findall(technique_pattern, content)

for technique_name, application_desc in techniques:
    print(f"{technique_name} | Applied to: {application_desc}")
```

### Extract Metrics

```python
# Total scenarios
total_scenarios = re.search(r'# Total Scenarios:\s+(\d+)', content).group(1)

# AC Coverage
ac_coverage = re.search(r'# AC Coverage:\s+([\d.]+)%', content).group(1)

# BR Coverage
br_coverage = re.search(r'# BR Coverage:\s+([\d.]+)%', content).group(1)

# Quality Score
quality_score = re.search(r'# Quality Score:\s+(\d+)/100', content).group(1)
```

---

## 🎨 Excel Styling Reference

### Color Palette

```python
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# Headers
header_fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
header_font = Font(bold=True, color='FFFFFF', size=11)

# Alternate row colors
row_alt_fill = PatternFill(start_color='D9E1F2', end_color='D9E1F2', fill_type='solid')

# Status colors
green_fill = PatternFill(start_color='C6EFCE', end_color='C6EFCE', fill_type='solid')
red_fill = PatternFill(start_color='FFC7CE', end_color='FFC7CE', fill_type='solid')
yellow_fill = PatternFill(start_color='FFEB9C', end_color='FFEB9C', fill_type='solid')

# Borders
thin_border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)
```

### Apply Formatting

```python
# Apply to header row
for col in range(1, ws.max_column + 1):
    cell = ws.cell(row=1, column=col)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', vertical='center')
    cell.border = thin_border

# Apply alternate row colors
for row in range(2, ws.max_row + 1):
    if row % 2 == 0:
        for col in range(1, ws.max_column + 1):
            ws.cell(row=row, column=col).fill = row_alt_fill

# Freeze panes
ws.freeze_panes = 'A2'  # Freeze header row

# Auto-filter
ws.auto_filter.ref = ws.dimensions

# Adjust column widths
for col in range(1, ws.max_column + 1):
    ws.column_dimensions[get_column_letter(col)].width = 20
```

---

## 🛠️ Complete Export Function

**Utility**: `src/utils/traceability_excel_generator.py` — [view source](../../src/utils/traceability_excel_generator.py)

**Key Public Function**:
```python
generate_traceability_matrix(input_file, output_file, story_id=None) → str
```

**Usage Pattern**:

```powershell
# Single story — BDD feature file
python src/utils/traceability_excel_generator.py \
  Output/testcases/GenAI_generated/POCTC-54_bdd.feature \
  Output/testcases/GenAI_generated/POCTC-54_Traceability_Matrix.xlsx

# story_id auto-derived from filename when not provided as 3rd arg
```

**Inline call via python -c** (when terminal is used from agent):
```powershell
python -c "
from src.utils.traceability_excel_generator import generate_traceability_matrix
generate_traceability_matrix(
    'Output/testcases/GenAI_generated/POCTC-54_bdd.feature',
    'Output/testcases/GenAI_generated/POCTC-54_Traceability_Matrix.xlsx',
    'POCTC-54'
)
"
```

---

## 📥 Integration with Test Generation Agents

### BDD Test Case Generator Integration

**Location**: `.github/agents/web-BDD_Testscenarios-gen.agent.md`

**Add to "Required Skills & Knowledge Base" section**:

```markdown
8. **[traceability-excel-export.md](../skills/traceability-excel-export.md)**
   - Excel workbook generation with 7 subsheets per story
   - Traceability matrix format and RTM structure
   - Inline Python export patterns using `openpyxl`
   - Post-generation export automation
```

**Add to "Post-Generation Actions" section**:

```markdown
## 📊 Post-Generation: Export Traceability Matrix

After generating the feature file, automatically export the traceability matrix:

**Workflow**:
1. Feature file saved → `Output/testcases/GenAI_generated/{STORY_ID}_bdd.feature`
2. Parse feature file metadata and coverage data
3. Generate Excel workbook → `Output/testcases/GenAI_generated/{STORY_ID}_Traceability_Matrix.xlsx`
4. 7 subsheets: Story_Summary, Acceptance_Criteria, Test_Scenarios, AC_Coverage_Matrix, Business_Rules, Test_Design_Techniques, Test_Category_Coverage

**Export Command** (using utility):
```powershell
python src/utils/traceability_excel_generator.py \
  Output/testcases/GenAI_generated/{STORY_ID}_bdd.feature \
  Output/testcases/GenAI_generated/{STORY_ID}_Traceability_Matrix.xlsx \
  {STORY_ID}
```

**See**: [traceability-excel-export.md](../skills/traceability-excel-export.md) for complete implementation
```

### Traditional Test Case Generator Integration

**Location**: `.github/agents/web-Traditional-Testcases-gen.agent.md`

**Add same reference to "Required Skills & Knowledge Base" section**:

```markdown
3. **[traceability-excel-export.md](../skills/traceability-excel-export.md)**
   - Excel traceability matrix export (applies to traditional test cases too)
   - 7-sheet workbook format with AC/BR coverage matrices
   - Inline Python generation patterns
```

**Adapt Sheet 3 format**:
Replace "Test_Scenarios" columns for traditional format:

```
Traditional Test Case Columns:
- Test Case ID
- Test Case Title
- Objective
- Preconditions
- Test Steps (numbered)
- Expected Result
- AC Coverage
- BR Coverage
- Test Technique
- Priority
- Automation Status
```

---

## 🔄 Automation Workflow (End-to-End)

```
1. User requests: "Generate BDD test cases for POCTC-54"
   ↓
2. Agent reads: data/stories/JIRA_POCTC-54.txt
   ↓
3. Agent calls MCP Context Server for application/domain/business context
   ↓
4. Agent generates: Output/testcases/GenAI_generated/POCTC-54_bdd.feature
   ↓
5. Agent auto-exports: Output/testcases/GenAI_generated/POCTC-54_Traceability_Matrix.xlsx
   ↓
6. User receives:
   - ✅ Feature file (Gherkin test cases)
   - ✅ Excel workbook (7 subsheets: traceability, coverage, metrics)
   ↓
7. User opens Excel → Review coverage → Share with stakeholders
```

**Trigger Export Manually**:
```powershell
python src/utils/traceability_excel_generator.py \
  Output/testcases/GenAI_generated/POCTC-54_bdd.feature \
  Output/testcases/GenAI_generated/POCTC-54_Traceability_Matrix.xlsx \
  POCTC-54
```

**Batch Export All Stories** (inline Python loop — no new files):
```powershell
python -c "
import glob
from pathlib import Path
from src.utils.traceability_excel_generator import generate_traceability_matrix
for f in glob.glob('Output/testcases/GenAI_generated/*_bdd.feature'):
    sid = Path(f).stem.split('_')[0]
    out = f.replace('_bdd.feature', '_Traceability_Matrix.xlsx')
    generate_traceability_matrix(f, out, sid)
    print(f'Exported: {sid}_Traceability_Matrix.xlsx')
"
```

---

## ⚠️ Implementation Constraints (Framework Rules)

### ❌ Prohibited
- Using `pandas` for Excel export (use `openpyxl` only)
- Hardcoding paths (use `copilot-agent.paths.yaml`)
- Creating new wrapper scripts or pipeline scripts

### ✅ Allowed & Recommended
- **Use the utility directly**: `python src/utils/traceability_excel_generator.py <input> <output> [story_id]`
- **Inline import call**: `python -c "from src.utils.traceability_excel_generator import generate_traceability_matrix; generate_traceability_matrix(...)"`
- Reading existing feature files and parsing metadata
- Creating `.xlsx` data files (non-executable)

### Utility Reference
- **File**: [src/utils/traceability_excel_generator.py](../../src/utils/traceability_excel_generator.py)
- **Main function**: `generate_traceability_matrix(input_file, output_file, story_id=None)`
- **Dependencies**: `openpyxl` (auto-checked on import)

---

## 📊 Quality Checklist (Before Export)

Before exporting the traceability matrix, validate:

- [ ] All 6-7 subsheets created
- [ ] Story_Summary has all required metrics
- [ ] AC Coverage Matrix shows 100% coverage (or identifies gaps)
- [ ] Business Rules mapped to scenarios
- [ ] Test Techniques documented (minimum 5 techniques)
- [ ] Test Categories show ≥10 categories covered
- [ ] Header rows formatted (bold, colored)
- [ ] Auto-filter enabled on all sheets
- [ ] Column widths adjusted for readability
- [ ] Freeze panes applied (header row)
- [ ] Summary rows added to bottom of sheets
- [ ] File saved to correct path: `Output/testcases/GenAI_generated/{STORY_ID}_Traceability_Matrix.xlsx`

---

## 📚 References

- **Skill Files**: 
  - [bdd-coverage-strategies.md](./bdd-coverage-strategies.md) - AC/BR coverage methodology
  - [test-design-techniques.md](./test-design-techniques.md) - Techniques catalog
  - [bdd-gherkin-patterns.md](./bdd-gherkin-patterns.md) - Scenario patterns

- **Framework Docs**:
  - `docs/framework_arch.md` - Architecture overview
  - `docs/web-bdd-Test scenarios-generation-guide.md` - BDD generation workflow

- **Libraries**:
  - `openpyxl` documentation: https://openpyxl.readthedocs.io/

---

## 🎯 Success Criteria

**Traceability matrix export is successful when**:

1. ✅ Excel file generated with exactly 7 subsheets
2. ✅ All metadata extracted accurately from feature file
3. ✅ AC Coverage Matrix shows complete RTM
4. ✅ Business Rules inventory complete with 100% coverage tracking
5. ✅ Test Design Techniques catalog lists all applied techniques
6. ✅ Test Category Coverage shows ≥10/17 categories
7. ✅ File is business-stakeholder ready (formatted, professional, clear)
8. ✅ Export completes in <5 seconds per story
9. ✅ No manual editing required (fully automated)
10. ✅ Compatible with Excel 2016+ and Google Sheets

---

**END OF TRACEABILITY EXCEL EXPORT SKILLS**
