---
name: impact-based-test-prioritization
description: AI-powered test prioritization using multi-factor scoring algorithms (LLM, module, defects, business scores) to reduce test suite size by 85-95% while maximizing risk coverage.
---

# Impact-Based Test Prioritization Patterns

## Purpose
Reusable patterns for AI-powered test prioritization using multi-factor scoring algorithms to reduce test suite size by 85-95%.

---

## Multi-Factor Scoring Algorithm

### Core Formula
```
Final_Score = (LLM_Score × 0.4) + (Module_Score × 0.3) + 
              (Defects_Score × 0.2) + (Business_Score × 0.1)
```

### Configurable Weights
```yaml
# config/config.yaml
analysis_weights:
  llm_recommendation: 0.4   # AI-driven semantic analysis
  module_match: 0.3         # Direct component impact
  historical_defects: 0.2   # Risk-based prediction
  business_priority: 0.1    # Business criticality
```

---

## Score Component Calculations

### 1. LLM Score (0.0 - 1.0)
**Purpose**: Semantic relevance analysis using AI

**Calculation Logic**:
```python
# Base relevance
base_relevance = 0.6 if test_in_impacted_module else 0.0

# Keyword matching bonus (+0.2 per keyword)
for keyword in change_keywords:
    if keyword in test_description:
        base_relevance += 0.2

# Functionality-specific bonus (+0.1 to +0.3)
if specific_functionality_match:
    base_relevance += 0.1 to 0.3

# High-risk bonus (+0.3)
if high_risk_change and high_priority_test:
    base_relevance += 0.3

# Cap at 1.0
llm_score = min(base_relevance, 1.0)
```

**Factors Considered**:
- Test is in impacted module (0.6 base)
- Keyword matches in description (+0.2 each)
- Specific functionality alignment (+0.1-0.3)
- High-risk change + high-priority test (+0.3)

---

### 2. Module Score (0.0 - 1.0)
**Purpose**: Direct component impact mapping

**Calculation Logic**:
```python
if direct_module_match:
    module_score = 1.0      # Exact match
elif component_match:
    module_score = 0.8      # Related component
elif related_module_match:
    module_score = 0.6      # Adjacent module
else:
    module_score = 0.0      # No match
```

**Match Types**:
- **Direct Module Match** (1.0): Test module === Change request module
- **Component Match** (0.8): Test component overlaps with CR components
- **Related Module** (0.6): Upstream/downstream dependency
- **No Match** (0.0): Unrelated test

---

### 3. Historical Defects Score (0.0 - 1.0)
**Purpose**: Risk assessment based on past defect patterns

**Calculation Logic**:
```python
if module_has_historical_defects:
    # Get module risk from defect analysis
    module_risk = defect_patterns['module_risk_scores'][module_name]
    
    # Scale to 0-1 range (multiply by 5, cap at 1.0)
    defects_score = min(module_risk * 5, 1.0)
else:
    # No defect history = 0.0 (not an error, valid for stable modules)
    defects_score = 0.0
```

**Risk Factors**:
- Defect frequency in module
- Defect severity distribution
- Recent defect trends
- Defect resolution time

**⚠️ Important**: Score of 0.0 is VALID for:
- New modules (no history yet)
- Stable modules (few/no defects)
- Modules not in defect database

---

### 4. Business Score (0.0 - 1.0)
**Purpose**: Business criticality assessment

**Calculation Logic**:
```python
if module_in_critical_business_modules:
    # Critical business module = max score
    business_score = 1.0
else:
    # Priority-based scoring
    priority_boost = {
        'High': 0.8,
        'Medium': 0.5,
        'Low': 0.2
    }
    business_score = priority_boost[test_priority]
```

**Factors**:
- Critical business module identification
- Test priority level
- Revenue impact
- Compliance requirements

---

## Priority Categorization

### Threshold Definitions
```python
if final_score >= 0.7:
    priority = "High"        # Must execute
elif final_score >= 0.4:
    priority = "Medium"      # Should execute
elif final_score >= 0.3:
    priority = "Low"         # May execute
else:
    priority = "Not Recommended"  # Skip
```

### Typical Distribution
| Priority | Threshold | Expected % | Typical Count (1000 tests) |
|----------|-----------|------------|---------------------------|
| High     | ≥ 0.7     | 10-20%     | 100-200 tests |
| Medium   | 0.4-0.7   | 30-50%     | 300-500 tests |
| Low      | 0.3-0.4   | 20-30%     | 200-300 tests |
| Not Recommended | < 0.3 | 10-20% | 100-200 tests |

---

## Change Request Priority Multipliers

**Purpose**: Boost scores for critical/high-priority change requests

**Multiplier Logic**:
```python
# Apply after calculating final_score
if change_priority == 'critical':
    final_score *= 1.5      # 50% boost
elif change_priority == 'high':
    final_score *= 1.2      # 20% boost
# Medium/low = no multiplier
```

**Example**:
- Original score: 0.5 (Medium)
- Change priority: Critical
- Boosted score: 0.5 × 1.5 = 0.75 (High) ✨

---

## Validation Checks

### Score Distribution Validation
```python
# Healthy distribution
high_percentage = (high_count / total_tests) * 100
assert 10 <= high_percentage <= 20, "High priority should be 10-20%"

medium_percentage = (medium_count / total_tests) * 100
assert 30 <= medium_percentage <= 50, "Medium priority should be 30-50%"
```

### Coverage Validation
```python
# Ensure impacted modules are covered
covered_modules = set(test['Module'] for test in high_priority_tests)
required_modules = set(change_request['components_affected'])

coverage = len(covered_modules & required_modules) / len(required_modules)
assert coverage >= 0.9, "Must cover 90%+ of impacted modules"
```

### Consistency Checks
```python
# High LLM scores should correlate with high module scores
high_llm_tests = [t for t in tests if t['LLM_Score'] > 0.7]
for test in high_llm_tests:
    if test['Module_Score'] < 0.3:
        warnings.append(f"Test {test['ID']}: High LLM ({test['LLM_Score']}) but low Module ({test['Module_Score']})")

# Business-critical tests should be boosted
critical_tests = [t for t in tests if t['Business_Score'] == 1.0]
for test in critical_tests:
    assert test['Final_Score'] >= 0.5, f"Critical test {test['ID']} has low final score"
```

---

## Common Scoring Patterns

### Pattern 1: Direct Impact Test
```python
# Change: Update login validation
# Test: "Verify login with valid credentials"

LLM_Score = 0.6        # Base relevance (in impacted module)
              + 0.2    # Keyword "login" match
              = 0.8

Module_Score = 1.0     # Direct match: Login module

Defects_Score = 0.4    # Historical login defects (moderate risk)

Business_Score = 1.0   # Login is critical business module

Final_Score = (0.8 × 0.4) + (1.0 × 0.3) + (0.4 × 0.2) + (1.0 × 0.1)
            = 0.32 + 0.3 + 0.08 + 0.1
            = 0.8 → High Priority ✅
```

### Pattern 2: Indirect Impact Test
```python
# Change: Update payment gateway
# Test: "Verify order confirmation email"

LLM_Score = 0.0        # Not in impacted module

Module_Score = 0.6     # Related module (order processing)

Defects_Score = 0.2    # Low defect rate in email module

Business_Score = 0.8   # High priority test

Final_Score = (0.0 × 0.4) + (0.6 × 0.3) + (0.2 × 0.2) + (0.8 × 0.1)
            = 0 + 0.18 + 0.04 + 0.08
            = 0.3 → Low Priority (still included)
```

### Pattern 3: High-Risk Module Test
```python
# Change: Minor UI update in checkout
# Test: "Verify checkout payment processing"

LLM_Score = 0.2        # Minor relevance

Module_Score = 0.8     # Component match

Defects_Score = 0.9    # High defect history in checkout

Business_Score = 1.0   # Critical module

Final_Score = (0.2 × 0.4) + (0.8 × 0.3) + (0.9 × 0.2) + (1.0 × 0.1)
            = 0.08 + 0.24 + 0.18 + 0.1
            = 0.6 → Medium Priority (critical module protection)
```

---

## Tuning Recommendations

### When to Adjust Weights

**Increase LLM Weight** (0.4 → 0.5):
- Complex semantic changes (refactoring, architecture updates)
- Natural language descriptions (not module-specific)
- New features without clear module mapping

**Increase Module Weight** (0.3 → 0.4):
- Targeted bug fixes
- Module-specific enhancements
- Clear component boundaries

**Increase Defects Weight** (0.2 → 0.3):
- Legacy systems with rich defect history
- High-risk modules (payment, security, authentication)
- Regression-heavy testing

**Increase Business Weight** (0.1 → 0.2):
- Compliance-driven testing
- Revenue-critical modules
- Customer-facing features

### Threshold Tuning

**Stricter (fewer tests)**:
```python
HIGH_PRIORITY_THRESHOLD = 0.8     # Only highest-confidence tests
MEDIUM_PRIORITY_THRESHOLD = 0.5   # Moderate confidence
LOW_PRIORITY_THRESHOLD = 0.4      # Reduced low-priority
```

**Lenient (more tests)**:
```python
HIGH_PRIORITY_THRESHOLD = 0.6     # More inclusive
MEDIUM_PRIORITY_THRESHOLD = 0.3   # Broader coverage
LOW_PRIORITY_THRESHOLD = 0.2      # Include edge cases
```

---

## Best Practices

### 1. Always Use MCP Context
- Application context for accurate module detection
- Business rules for criticality assessment
- Domain model for dependency mapping

### 2. Maintain Defect History
- Regular defect database updates
- Categorize defects by module
- Include severity and resolution time

### 3. Validate Results
- Review top 20% of high-priority tests manually
- Check for missing critical paths
- Verify module coverage

### 4. Iterate and Improve
- Track false positives/negatives
- Adjust weights based on feedback
- Update thresholds per project needs

### 5. Document Decisions
- Log why tests were prioritized
- Capture stakeholder approval
- Track execution results vs predictions

---

## Integration with CI/CD

### Pre-Commit Analysis
```yaml
# .github/workflows/impact-analysis.yml
on: pull_request
jobs:
  impact-analysis:
    runs-on: ubuntu-latest
    steps:
      - name: Analyze Change Impact
        run: python src/services/impact_analyzer.py --detailed PR_CHANGES.json
      
      - name: Execute High-Priority Tests Only
        run: pytest @high_priority_tests.txt
```

### Smart Regression Selection
```python
# Select tests based on file changes
changed_modules = detect_changed_modules(git_diff)
prioritized_tests = prioritize_tests(changed_modules, all_tests)

# Execute by priority
execute_tests(prioritized_tests['High'])
if build_type == 'nightly':
    execute_tests(prioritized_tests['Medium'])
```

---

---

## Excel Report Generation - 3-Sheet Pattern

### Purpose
Generate comprehensive multi-sheet Excel reports with test prioritization, detailed scoring metrics, and defect predictions.

### Pre-Flight Checklist
Before running analysis, verify:
- ✅ Change request exists in `data/Input/CR/change_request.json`
- ✅ Test cases exist in `data/Input/Tcs_dump/*.csv`
- ✅ Historical defects exist in `data/Input/Defectsdump/*.csv`
- ✅ Application context: `data/context/application/*.txt`
- ✅ Business rules context: `data/context/business_rules/*.txt`
- ✅ Output directory: `Output_Files/impact_report/` (auto-created if missing)

### Implementation Steps

#### Step 1: Initialize Analyzer
```python
from services.impact_analyzer import ImpactBasedTestingUtility
import json

# ✅ ALWAYS use these paths
analyzer = ImpactBasedTestingUtility(
    stories_dir='data/Input/Stories',
    testcases_dir='data/Input/Tcs_dump',
    defects_dir='data/Input/Defectsdump',
    input_dir='data/Input'
)
```

#### Step 2: Load and Analyze Change Request
```python
# Load change request
cr = json.load(open('data/Input/CR/change_request.json'))['change_requests'][0]

# Run analysis
result = analyzer.analyze_change_request_with_llm(cr)
```

#### Step 3: Generate Report (CRITICAL)
```python
# ✅ CORRECT WAY - Generates 3 sheets automatically
test_suite = result.get('prioritized_test_suite', {})
excel_path = analyzer.save_test_suite_to_file(
    test_suite=test_suite,
    change_request_id=cr['id'],      # String ID like 'CR003'
    output_format='excel',            # MUST specify 'excel'
    change_request=cr                 # Full CR dict for metadata
)

print(f'Report saved: {excel_path}')
```

#### Step 4: Verify Report Structure
```python
import pandas as pd

# Verify 3 sheets exist
xl = pd.ExcelFile(excel_path)
assert len(xl.sheet_names) == 3, f"Expected 3 sheets, got {len(xl.sheet_names)}"
assert 'GenAI_Impact based Testcases' in xl.sheet_names
assert 'GenAI_Impact Metrics' in xl.sheet_names
assert 'GenAI_Defects Prediction' in xl.sheet_names

print('✅ Comprehensive report verified!')
```

### Expected Report Structure
```
Output_Files/impact_report/
  └── CR003_impact_analysis_20260224_143022.xlsx
      ├── Sheet 1: GenAI_Impact based Testcases
      │   └── Columns: Test_ID, Test_Name, Module, Execution_Priority,
      │                Automation_ID, Test_Summary
      ├── Sheet 2: GenAI_Impact Metrics
      │   └── Columns: Test_ID, Test_Name, Module, Original_Priority,
      │                Execution_Priority, Final_Score, LLM_Score,
      │                Module_Score, Defects_Score, Business_Score,
      │                Selection_Reason
      └── Sheet 3: GenAI_Defects Prediction
          └── Columns: Module, Risk_Level, Prediction, Historical_Pattern
```

### Common Mistakes to Avoid

❌ **WRONG METHODS:**
```python
# ❌ Creates only 1 sheet
pd.DataFrame(tests).to_excel('file.xlsx')

# ❌ Wrong parameter name
analyzer.save_test_suite_to_file(
    test_suite=test_suite,
    output_file='path/to/file.xlsx',  # WRONG!
    change_request=cr
)

# ❌ Manual sheet creation (framework handles this)
with pd.ExcelWriter('file.xlsx') as writer:
    df.to_excel(writer, sheet_name='Sheet1')
```

✅ **CORRECT METHOD:**
- Always use `analyzer.save_test_suite_to_file()` with `output_format='excel'`
- Pass `change_request_id` as string ID, not file path
- Let the method auto-generate the output path

### Troubleshooting

**Issue: Single-sheet report generated**
- Check: Did you use `output_format='excel'`?
- Check: Did you call `save_test_suite_to_file()` with correct parameters?
- Check: Did you use `pd.to_excel()` directly instead of the method?
- Fix: Use the pattern in Step 3 above

**Issue: Report generation fails**
```python
# Fallback: Manual multi-sheet generation
import pandas as pd
from openpyxl import Workbook

with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
    # Sheet 1: Simplified testcases
    df1 = pd.DataFrame(test_suite.get('all_tests', []))
    cols = ['test_id', 'test_name', 'module', 'priority', 'automation_id', 'summary']
    df1[[c for c in cols if c in df1.columns]].to_excel(
        writer, sheet_name='GenAI_Impact based Testcases', index=False
    )
    
    # Sheet 2: Detailed metrics
    df2 = pd.DataFrame(test_suite.get('all_tests', []))
    df2.to_excel(writer, sheet_name='GenAI_Impact Metrics', index=False)
    
    # Sheet 3: Defects prediction
    defect_data = [{
        'Module': 'Module Name',
        'Risk_Level': 'Low',
        'Prediction': 'No significant defects predicted',
        'Historical_Pattern': 'Stable module with no historical defects'
    }]
    pd.DataFrame(defect_data).to_excel(
        writer, sheet_name='GenAI_Defects Prediction', index=False
    )
```

**Issue: Empty test suite**
- Root Cause: `prioritized_test_suite` not found in result
- Check: Verify analysis completed successfully
- Check: Look for `result.get('test_recommendations', [])` as alternative
- Fix: Debug analysis execution first

### Validation Checklist

✅ **After generation, verify:**
- Report file exists in `Output_Files/impact_report/`
- File size > 5 KB (indicates content present)
- 3 sheets exist with correct names
- Sheet 1 has test cases (rows > 0)
- Sheet 2 has scoring columns (Final_Score, LLM_Score, etc.)
- Sheet 3 has defects prediction (Module, Risk_Level)

---

## Related Skills
- [validation-and-autofix.md](validation-and-autofix.md) - Validation patterns for score distribution
- [mcp-integration-guide.md](mcp-integration-guide.md) - MCP context retrieval for module mapping
- [test-design-techniques.md](test-design-techniques.md) - Test design strategies
