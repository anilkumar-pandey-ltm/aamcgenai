# Impact-Based Test Analysis - Complete Guide

## 🤖 Agent Information

**Agent Mode**: `impact-based-test-analysis`  
**Agent File**: `.github/agents/impact-based-test-analysis.agent.md`  
**Activation**: Use `@impact-based-test-analysis` prefix in your Copilot prompts

### How to Activate This Agent

```
@impact-based-test-analysis [Your Prompt]
```

**Example:**
```
@impact-based-test-analysis Analyze change request CR-2024-001 and prioritize test cases
```

## 📖 Table of Contents
- [Overview](#overview)
- [Executive Summary](#executive-summary)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [End-to-End Workflow](#-end-to-end-workflow)
- [Scoring Algorithm & Formulas](#-scoring-algorithm--formulas)
- [Input Formats](#-input-formats)
- [Output Formats](#-output-formats)
- [Configuration](#-configuration)
- [Demo Use Cases](#-demo-use-cases)
- [Advanced Features](#-advanced-features)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [API Reference](#-api-reference)

---

## Overview

This comprehensive guide covers the **Impact-Based Test Analysis** system - a sophisticated utility that leverages AI-powered analysis combined with traditional rule-based approaches to provide intelligent test case prioritization for change requests. The system integrates with GitHub Copilot and MCP Server for context-aware analysis, requiring no external LLM configuration.

**Key Capabilities:**
- ✅ 85-95% reduction in test suite size while maintaining coverage
- ✅ Transparent scoring with detailed reasoning
- ✅ Domain-aware analysis with business context integration
- ✅ Risk-based prioritization using historical defect patterns
- ✅ Interactive dashboard for real-time visualization
- ✅ Copilot-native intelligence (no external LLM required)

---

## Executive Summary

The Impact-Based Testing utility provides a comprehensive solution for test case prioritization that combines:
- **AI Intelligence**: Copilot-native semantic analysis
- **Traditional Analysis**: Rule-based module matching
- **Risk Assessment**: Historical defect pattern analysis
- **Business Context**: Domain-aware criticality evaluation

### Formula Summary
```
Final_Score = (LLM_Score × 0.4) + (Module_Score × 0.3) + 
              (Defects_Score × 0.2) + (Business_Score × 0.1)

Priority Thresholds:
  High:   Final_Score >= 0.7
  Medium: Final_Score >= 0.4
  Low:    Final_Score >= 0.3
```

---

## 🏗️ System Architecture

### Core Components
```
📁 System Structure
├── CLI Interface
│   ├── src/cli/                    # Command-line interfaces
│   └── Basic and LLM-enhanced analysis
├── Core Engine
│   ├── src/core/impact_analyzer.py # Main analysis engine
│   └── Scoring algorithms
├── LLM Integration
│   ├── src/llm/llm_analyzer.py    # AI-powered analysis
│   └── Copilot-native intelligence
├── Interactive Dashboard
│   ├── dashboard_server.py         # Web server
│   └── templates/dashboard.html    # Web UI
└── Configuration
    └── config/config.yaml          # System configuration
```

### Data Flow Architecture
```
Change Request Input 
    ↓
LLM Analysis (Copilot-native)
    ↓
Module Impact Detection
    ↓
Test Case Scoring
    ↓
Prioritization
    ↓
Report Generation (Excel/JSON/Dashboard)
```

### Component Interaction
1. **Input Processing**: JSON change requests + business context
2. **Analysis Pipeline**: Multi-phase scoring with AI and rules
3. **Output Generation**: Excel reports, JSON, dashboard visualization
4. **Quality Assurance**: Validation and consistency checks

---

## 🚀 Quick Start

### Method 1: Using Copilot Chatmode (Recommended)

1. **Activate the Chatmode**
   - Open GitHub Copilot Chat in VS Code
   - Type: `@workspace /chatmode impact-based-test-analysis`

2. **Execute Analysis with Proper Prompt**
   
   **Recommended Prompt (Full Analysis with MCP Context):**
   ```
   Analyze the change request from Input/CR/change_request.json and generate impact-based test analysis report. Use MCP context for application and business rules.
   ```

   **What this prompt does:**
   - Loads change request from configured JSON file
   - Retrieves application context from MCP Server (MANDATORY for accurate analysis)
   - Retrieves business rules from MCP Server (MANDATORY for risk assessment)
   - Analyzes impacted modules using keyword detection and semantic matching
   - Generates multi-factor scores (LLM 40%, Module 30%, Defects 20%, Business 10%)
   - Creates Excel report with 3 sheets automatically
   - Saves to `Output_Files/impact_report/` directory

   **⚠️ CRITICAL:** Always include "Use MCP context" in your prompt. Without it:
   - Module detection accuracy drops significantly
   - Business-critical tests may not be prioritized correctly
   - Risk assessment will be incomplete

3. **Review Results**
   - Analysis results displayed in console
   - Excel report: `Output_Files/impact_report/GenAI_Impact_Analysis_{CR_ID}_{timestamp}.xlsx`
   - Contains 3 sheets: Testcases, Metrics, Defects Prediction
   - Filtering efficiency, priority distribution, and risk assessment included

### Method 2: Using Python Utility Directly (Command Line)

#### Run Analysis with Comprehensive Output

```powershell
# Analyze default file (Input/CR/change_request.json)
python src/services/impact_analyzer.py --detailed

# Analyze specific change request file
python src/services/impact_analyzer.py --detailed Input/CR/my_change_request.json
```

**What Happens:**
- ✅ Loads change request from JSON automatically
- ✅ Loads business context from `Input/business_context.txt`
- ✅ Loads test cases from `Input/Tcs_dump/*.csv`
- ✅ Loads historical defects from `Input/Defectsdump/*.csv`
- ✅ Displays detailed progress and results in console
- ✅ Shows impacted modules, test recommendations, filtering efficiency
- ✅ Automatically generates Excel report with 3 sheets
- ✅ Includes priority distribution and risk assessment
- ✅ No temporary scripts or complex Python one-liners needed

**Output:**
- **Console**: Detailed analysis summary with metrics
- **Excel**: `Output_Files/impact_report/GenAI_Impact_Analysis_{CR_ID}_{timestamp}.xlsx`

**Note:** This method uses local business context files. For MCP context integration, use Method 1 (Copilot Chatmode).

### Method 3: Using Python Code Directly (Advanced)

#### Option A: Using Detailed Analysis Function

```python
from src.services.impact_analyzer import run_detailed_analysis

# Run detailed analysis with automatic Excel generation
analyzer, result, excel_path = run_detailed_analysis(
    change_request_file='Input/CR/change_request.json',
    generate_excel=True
)

print(f"Excel Report: {excel_path}")
print(f"Recommended Tests: {result['total_tests_recommended']}")
```

#### Option B: Using Step-by-Step Analysis

```python
from src.services.impact_analyzer import ImpactBasedTestingUtility
import json

# Initialize analyzer
analyzer = ImpactBasedTestingUtility()

# Load change request
with open('Input/CR/change_request.json', 'r') as f:
    cr_data = json.load(f)
cr = cr_data['change_requests'][0]

# Execute analysis
result = analyzer.analyze_change_request_with_llm(cr)

# Generate Excel report
prioritized_suite = result.get('prioritized_test_suite', {})
excel_path = analyzer.save_test_suite_to_file(
    test_suite=prioritized_suite,
    change_request_id=cr['id'],
    output_format='excel',
    change_request=cr
)

print(f"Excel Report: {excel_path}")
print(f"Impacted Modules: {result['impacted_modules']}")
print(f"Recommended Tests: {result['total_tests_recommended']}")
```

## 📋 Input Formats

### Change Request JSON Format

**Location:** `Input/CR/change_request.json`

```json
{
  "change_requests": [
    {
      "id": "CR003",
      "title": "User Profile Enhancement for Loyalty Program",
      "description": "Add functionality to the user profile section allowing customers to view and manage their loyalty points, redemption history directly from their account dashboard.",
      "type": "enhancement",
      "priority": "medium",
      "business_justification": "Improves user engagement and transparency in the loyalty program. Expected to increase repeat purchases by 10% and reduce support queries related to loyalty status.",
      "technical_details": "Integrate with loyalty points API, create new dashboard widgets, add redemption history table",
      "components_affected": ["user-management", "loyalty-program", "dashboard"]
    }
  ]
}
```

**Required Fields:**
- `id` (string): Unique change request identifier
- `title` (string): Short descriptive title
- `description` (string): Detailed description of the change
- `type` (string): enhancement | bugfix | feature | refactoring
- `priority` (string): critical | high | medium | low

**Optional Fields:**
- `business_justification` (string): Business rationale and expected impact
- `technical_details` (string): Implementation details
- `components_affected` (array): List of affected components/modules

### Single Change Request Format

```json
{
  "id": "CR001",
  "title": "Add Voice Search",
  "description": "...",
  "type": "enhancement",
  "priority": "high"
}
```

## 📊 Output Formats

### Console Output

```
🚀 Starting Impact-Based Test Analysis
=====================================

📋 Change Request: CR001 - Add Voice Search
   Type: enhancement | Priority: high

🧠 Executing LLM-powered analysis...

📊 Analysis Results
=====================================

✅ Status: Analysis completed successfully

📈 Metrics:
   • Total Tests Available: 1000
   • Tests Recommended: 87
   • Filtering Efficiency: 91.3%
   • High Priority Tests: 23
   • Medium Priority Tests: 42
   • Low Priority Tests: 22
   • Impacted Modules: 3
   • Impacted Stories: 5

🎯 Impacted Modules:
   • search for products
   • voice recognition
   • ui components

📁 Excel Report: Output_Files/impact_report/GenAI_Impact_Analysis_CR003_20251113_200001.xlsx
```

### Excel Report Structure

The generated Excel file contains 3 sheets:

#### Sheet 1: GenAI_Impact based Testcases
Simple test list with execution priorities

#### Sheet 2: GenAI_Impact Metrics
Detailed scoring breakdown:
- Final_Score (0.0-1.0)
- LLM_Score (0.0-1.0)
- Module_Score (0.0-1.0)
- Defects_Score (0.0-1.0)
- Business_Score (0.0-1.0)
- Selection_Reason

#### Sheet 3: GenAI_Defects Prediction
Risk assessment and predicted defect areas

### JSON Output

```json
{
  "status": "success",
  "message": "Analysis completed successfully",
  "change_request_id": "CR001",
  "metrics": {
    "total_tests_available": 1000,
    "total_tests_recommended": 87,
    "filtering_efficiency": 91.3,
    "high_priority_tests": 23,
    "medium_priority_tests": 42,
    "low_priority_tests": 22
  },
  "impacted_modules": ["search", "voice-recognition", "ui"],
  "excel_report_path": "./CR001_impact_analysis.xlsx"
}
```

---

## 📊 End-to-End Workflow

### Workflow Phases

#### Phase 1: Input Processing
1. **Change Request Ingestion**
   - Source: JSON file (`Input/CR/change_request.json`)
   - Required fields: `id`, `title`, `description`, `type`, `priority`
   - Optional fields: `technical_details`, `components_affected`, `business_justification`

2. **Business Context Loading**
   - Business domain detection from `business_context.yaml`
   - Critical module identification
   - Compliance requirements mapping
   - Technical architecture understanding

3. **Historical Data Integration**
   - Test cases: `Input/Tcs_dump/ecommerce_regression_testcases.csv`
   - Historical defects: `Input/Defectsdump/ecommerce_historical_defects.csv`
   - User stories: `Input/Stories/` directory

#### Phase 2: LLM-Powered Analysis
```python
# Analysis Input Structure
llm_input = {
    'change_request': change_request_data,
    'test_cases': test_cases_subset,
    'business_context': business_context,
    'historical_defects': defect_patterns
}
```

**Copilot-Native Analysis:**
- Semantic keyword matching
- Pattern recognition
- Functionality-specific bonuses
- Risk area identification

#### Phase 3: Impact Module Detection
- **Direct Module Matching**: Exact module name matching
- **Component Mapping**: Intelligent component-to-module relationships
- **Semantic Analysis**: NLP-based relevance detection

#### Phase 4: Test Case Scoring & Prioritization
- **Multi-factor Scoring Algorithm** (detailed below)
- **Priority Categorization** (High/Medium/Low)
- **Risk Assessment Integration**

#### Phase 5: Report Generation
- **Excel Reports**: Multi-sheet detailed analysis
- **CSV Export**: Simplified test suite format
- **JSON Output**: Machine-readable format
- **Dashboard Visualization**: Interactive web interface

---

## 🧮 Scoring Algorithm & Formulas

### Core Scoring Formula

The system uses a **weighted multi-factor scoring approach**:

```
Final_Score = (LLM_Score × W_LLM) + (Module_Score × W_Module) + 
              (Defects_Score × W_Defects) + (Business_Score × W_Business)
```

**Default Weights Configuration:**
```yaml
analysis_weights:
  llm_recommendation: 0.4    # 40% - AI-powered relevance
  module_match: 0.3          # 30% - Direct module impact
  historical_defects: 0.2    # 20% - Historical risk patterns
  business_priority: 0.1     # 10% - Business criticality
```

**Note:** Copilot-native mode uses intelligent keyword matching and pattern recognition instead of external LLM API calls.

### Priority Thresholds & Adjustment Factors

#### Base Priority Categorization
```python
if final_score >= 0.7:
    priority = "High"
elif final_score >= 0.4:
    priority = "Medium"  
elif final_score >= 0.3:
    priority = "Low"
else:
    priority = "Not Recommended"
```

#### Change Request Priority Multipliers
```python
if change_priority == 'high':
    final_score *= 1.2      # 20% boost
elif change_priority == 'critical':
    final_score *= 1.5      # 50% boost
```

### Advanced Selection Logic

#### Multi-Criteria Selection Rules

**High Priority Selection** (OR logic):
- `final_score >= 0.7`
- `(llm_score >= 0.6 AND module_score > 0)`
- `(module_score > 0 AND defects_score >= 0.8)`

**Medium Priority Selection** (OR logic):
- `final_score >= 0.4`
- `llm_score >= 0.4`
- `(module_score > 0 AND (defects_score >= 0.5 OR business_score >= 0.8))`
- `(llm_score >= 0.3 AND (defects_score >= 0.3 OR business_score >= 0.5))`

**Low Priority Selection** (OR logic):
- `final_score >= 0.3`
- `llm_score >= 0.2`
- `(module_score > 0 AND test_priority == 'High')`

#### Test Filtering Algorithm

**Inclusion Logic** (OR logic):
```python
include_test = False

if llm_score > 0:
    include_test = True  # LLM explicitly recommended
elif module_score > 0:
    include_test = True  # Direct module impact
elif (defects_score >= 0.8 AND test_priority == 'High' AND final_score >= 0.5):
    include_test = True  # High-risk scenario
elif (final_score >= 0.6 AND (defects_score >= 0.5 OR business_score >= 0.8)):
    include_test = True  # Strong overall relevance
```

### Smart Filtering for Large Test Suites

```python
# Prioritize direct recommendations
direct_recommendations = tests_with_llm_or_module_score > 0
high_risk_supplementary = tests_with_final_score >= 0.6 AND defects_score >= 0.7

# Limit supplementary tests to avoid over-testing
if len(high_risk_supplementary) > 5:
    high_risk_supplementary = top_5_by_final_score
```

---

### Individual Score Components

#### 1. LLM Score (40% weight) - Range: 0.0 to 1.0
**Purpose**: AI-determined relevance based on semantic analysis

**Calculation Logic**:
```python
llm_score = 0.0
base_relevance = 0.0

# Base relevance from module analysis
if test_belongs_to_impacted_module:
    base_relevance += 0.6

# Keyword matching enhancement
for keyword in change_keywords:
    if keyword_in_test_description:
        base_relevance += 0.2

# Functionality-specific bonuses
if specific_functionality_match:
    base_relevance += 0.1 to 0.3

# Risk area bonuses
if high_risk_change and high_priority_test:
    base_relevance += 0.3

# Normalize to 0-1 range
llm_score = min(base_relevance, 1.0)
```

**Example**:
```
Change: "Voice search optimization"
Test: "Search functionality validation"

Base relevance (module match): 0.6
Keyword match ('search'): +0.2
Voice functionality bonus: +0.2
Final LLM Score: 1.0 (capped)
```

#### 2. Module Score (30% weight) - Range: 0.0 to 1.0
**Purpose**: Direct impact assessment based on affected modules

**Calculation Logic**:
```python
module_score = 0.0

if direct_module_match:
    module_score = 1.0
elif component_match:
    module_score = 0.8
elif related_module_match:
    module_score = 0.6
else:
    module_score = 0.0
```

**Component Mapping Rules**:
```python
component_mappings = {
    'search engine': ['search for products', 'search'],
    'payment': ['checkout and payment', 'payment'],
    'cart': ['add products to cart'],
    'category': ['browse products by category'],
    'voice': ['search for products'],  # Voice search maps to search
}
```

#### 3. Historical Defects Score (20% weight) - Range: 0.0 to 1.0
**Purpose**: Risk assessment based on historical defect patterns

**Calculation Logic**:
```python
defects_score = 0.0

if module_has_historical_defects:
    # Get module risk score from historical analysis
    module_risk = defect_patterns['module_risk_scores'][module_name]
    
    # Scale to 0-1 range (risk scores typically 0-0.2)
    defects_score = min(module_risk * 5, 1.0)
```

**Historical Risk Calculation**:
```python
def calculate_module_risk(defects_for_module):
    recent_defects = defects_last_6_months
    total_defects = all_historical_defects
    severity_weight = average_severity_score
    
    risk_score = (recent_defects * 0.7 + total_defects * 0.3) * severity_weight / 100
    return min(risk_score, 0.2)  # Cap at 0.2
```

#### 4. Business Score (10% weight) - Range: 0.0 to 1.0
**Purpose**: Business criticality and priority assessment

**Calculation Logic**:
```python
business_score = 0.0

# Critical business module check
if module_in_critical_business_modules:
    business_score = 1.0

# Test case priority contribution
priority_boost = {
    'High': 0.8,
    'Medium': 0.5,
    'Low': 0.2
}
business_score = max(business_score, priority_boost[test_priority])
```

## 🔧 Configuration

### Analysis Weights (config/config.yaml)

```yaml
analysis_weights:
  llm_recommendation: 0.4    # AI-powered analysis weight
  module_match: 0.3          # Direct impact weight
  historical_defects: 0.2    # Risk-based weight
  business_priority: 0.1     # Business criticality weight
```

### Customization

To adjust the scoring behavior:

1. **More AI-driven**: Increase `llm_recommendation` to 0.5+
2. **More traditional**: Increase `module_match` to 0.4+
3. **More risk-averse**: Increase `historical_defects` to 0.3+
4. **More business-focused**: Increase `business_priority` to 0.2+

## 📁 Directory Structure

Required directories:
```
Input/
├── business_context.yaml      # Business domain context
├── business_context.txt       # Alternative text format
├── CR/                        # Change requests
│   └── change_request.json
├── Stories/                   # User stories
│   └── *.txt
├── Tcs_dump/                  # Test cases
│   └── ecommerce_regression_testcases.csv
└── Defectsdump/              # Historical defects
    └── ecommerce_historical_defects.csv

src/
├── config/
│   └── impact_path.yaml      # Path configuration
└── services/
    └── impact_analyzer.py    # Core analysis engine

Output_Files/
└── impact_report/           # Generated Excel reports (auto-created)
data/
└── stories/                  # Fetched stories from Jira/ADO
```

## 🔍 Validation

### Pre-Analysis Validation

```powershell
# Validate setup by running detailed analysis mode
# It will automatically validate all components during initialization
python src/services/impact_analyzer.py --detailed
```

**Automatic Checks Performed:**
- ✅ Python environment and required packages
- ✅ Required directories exist (Input/CR, Input/Tcs_dump, Input/Defectsdump)
- ✅ Business context loaded from Input/business_context.txt
- ✅ Test cases loaded (displays count)
- ✅ Historical defects available (displays count)
- ✅ Stories loaded (displays count)
- ✅ Copilot-native analyzer initialized
- ✅ Configuration loaded or defaults applied

**Expected Console Output:**
```
INFO: Business context support initialized
INFO: Loaded 500 test cases from Input\Tcs_dump\...
INFO: Total historical defects loaded: 1068
INFO: ✅ Copilot-native analyzer initialized
```

### Post-Analysis Validation

**Verify report generation:**
```powershell
Get-ChildItem -Path "." -Filter "*impact_analysis*.xlsx" -Recurse
```

**Check metrics:**
- Filtering efficiency: 85-95%
- High priority tests: 10-20% of recommended
- Module coverage: >= 90% of impacted modules

---

## 🎯 Demo Use Cases

### Use Case 1: Single Feature Addition

**Scenario:** Adding voice search functionality

```powershell
python copilot_impact_analysis_helper.py quick_analysis `
  --cr-id CR-VOICE-001 `
  --title "Voice Search Implementation" `
  --desc "Add voice input capability to product search" `
  --type feature `
  --priority high `
  --components "search,voice-recognition,ui"
```

**Expected Output:**
- 50-100 recommended tests
- Modules: Search, Voice Recognition, UI
- High focus on search functionality tests
- Voice-specific test scenarios

### Use Case 2: Bug Fix Analysis

**Scenario:** Fixing payment gateway timeout issue

```powershell
python copilot_impact_analysis_helper.py quick_analysis `
  --cr-id BUG-PAY-042 `
  --title "Fix Payment Gateway Timeout" `
  --desc "Increase timeout and add retry logic for payment processing" `
  --type bugfix `
  --priority critical `
  --components "payment,checkout"
```

**Expected Output:**
- 30-70 recommended tests
- Modules: Payment, Checkout
- High focus on payment processing tests
- Regression tests for related functionality

### Use Case 3: Batch Analysis

**Scenario:** Analyze multiple change requests from sprint planning

```json
// Input/sprint_changes.json
[
  {"id": "CR001", "title": "Voice Search", ...},
  {"id": "CR002", "title": "Payment Optimization", ...},
  {"id": "CR003", "title": "Category Filter", ...}
]
```

```powershell
python copilot_impact_analysis_helper.py from_json --file Input/sprint_changes.json
```

**Expected Output:**
- Individual Excel reports for each CR
- Batch summary with total metrics
- Consolidated test execution plan

---

## 🔧 Advanced Features

### Performance Metrics

#### Filtering Efficiency
```python
filtering_efficiency = ((total_available_tests - recommended_tests) / total_available_tests) * 100

# Typical results:
# Total Available: 1000+ tests
# Recommended: 50-150 tests
# Efficiency: 85-95% reduction
```

#### Analysis Quality Metrics
```python
scoring_summary = {
    'llm_weight': 0.4,
    'module_weight': 0.3, 
    'defects_weight': 0.2,
    'business_weight': 0.1
}

# Domain-Aware Capabilities:
# ✅ Domain Detection: Automatic
# ✅ Business Context: Available
# ✅ Historical Defects: Available  
# ✅ AI-Powered Analysis: Enabled
```

### Algorithm Validation

#### Scoring Validation
```python
# Ensure module coverage
required_modules = change_request.impacted_modules
recommended_modules = [test.module for test in recommended_tests]
coverage_ratio = len(set(required_modules) & set(recommended_modules)) / len(required_modules)

# Validate score distribution
high_scores = len([t for t in tests if t.final_score >= 0.7])
medium_scores = len([t for t in tests if 0.4 <= t.final_score < 0.7])
low_scores = len([t for t in tests if 0.3 <= t.final_score < 0.4])
```

#### Quality Checks
- ✅ High LLM scores correlate with module matches
- ✅ Historical defects boost scores for affected modules
- ✅ Business-critical tests receive appropriate priority boosts
- ✅ Edge cases handled (zero recommendations, missing data)

### Interactive Dashboard Features

**Real-Time Visualizations:**
- Priority distribution (pie chart)
- Module impact analysis (bar chart)
- Relevance score distribution (histogram)
- Analysis timeline (time series)

**Export Capabilities:**
- Excel multi-sheet reports
- CSV simplified format
- JSON machine-readable
- PDF executive summary

---

## 🛠️ Troubleshooting

### Issue: No Test Cases Found

**Symptom:** "No test cases loaded" or "Empty test suite"

**Solution:**
```powershell
# Check test cases file exists
Test-Path "Input/Tcs_dump/*.csv"

# Run analysis in detailed mode - it will show what's loaded
python src/services/impact_analyzer.py --detailed
```

**Expected Output:**
```
INFO: Loaded 500 test cases from Input\Tcs_dump\ecommerce_regression_testcases.csv
```

**Required columns:** Test_ID (or Functional TC ID), Test_Name (or Function Testcase name), Module (or Component), Priority

**Note:** The utility automatically handles column name variations.

### Issue: Analysis Fails or Produces Errors

**Symptom:** "Analysis failed" or "ImportError" or "Module not found"

**Solution:**
```powershell
# Verify Python packages are installed
python -m pip list | Select-String -Pattern "pandas|pyyaml"

# Run analysis in detailed mode to see specific error
python src/services/impact_analyzer.py --detailed Input/CR/change_request.json
```

**Common Issues:**
- Missing pandas or pyyaml: `pip install pandas pyyaml openpyxl`
- Invalid JSON format in change request file
- Missing required directories (Input/CR, Input/Tcs_dump, etc.)

**Note:** The system uses Copilot-native analysis (no external LLM API required). Analysis is based on keyword matching and pattern recognition.

### Issue: Low Filtering Efficiency

**Possible causes:**
- Change request too broad or vague
- Module mapping incomplete
- Business context insufficient

**Solutions:**
- Provide more specific change request description
- Update business context with component mappings
- Add technical details to change request

### Issue: Defect Scores Are 0.0 for All Tests

**Symptom:** All test cases show `Defects_Score = 0.0` in the Excel report

**Root Cause:** The change request affects a module that has NO historical defects in the defects CSV.

**Example:**
- Change Request Module: "User Management"
- Available Defect Modules in CSV: "Search for Products", "Browse Products by Category", "Checkout and Payment", "Add Products to Cart"
- Result: No match → Defect scores = 0.0 for all tests

**Verification:**
```powershell
# Run detailed analysis - it will log defect coverage warnings
python src/services/impact_analyzer.py --detailed Input/CR/change_request.json

# Look for this in console output:
# "Historical defects available: 1068 records"
# Check if your module is in the defect data
```

**Is This a Bug?**
No, this is **correct behavior**. It means:
- The module may be stable with no recent defects (good news!)
- The module may be newly developed with no defect history yet
- Historical defects dataset doesn't cover this module

**Impact on Analysis:**
- Tests are still prioritized using other 3 factors:
  - Module Match (30% weight) ✅
  - Business Priority (10% weight) ✅
  - LLM Analysis (40% weight) ✅ (Copilot-native keyword matching)
- Defect-based risk prediction (20% weight) is unavailable ⚠️

**Solutions:**
1. **Accept current results** (recommended if module is stable/new)
2. **Add sample defects** to CSV if historical data exists
3. **Adjust scoring weights** in `config/config.yaml` to reduce defect dependency

### Issue: Missing Excel Report

**Solution:**
```powershell
# Check output directory exists
Test-Path -Path "Output_Files/impact_report" -PathType Container

# Create output directory if missing
New-Item -ItemType Directory -Path "Output_Files/impact_report" -Force

# List recent reports
Get-ChildItem -Path "Output_Files/impact_report" -Filter "*.xlsx" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

## 📚 API Reference

### Python Utility Command Line Interface

#### Standard Analysis Mode
```powershell
python src/services/impact_analyzer.py [change_request_file]
```

**Parameters:**
- `change_request_file` (optional): Path to JSON file (default: `Input/CR/change_request.json`)

**Output:**
- Console: Basic analysis summary
- Excel: Generated in `Output_Files/impact_report/`

---

#### Detailed Analysis Mode (Recommended)
```powershell
python src/services/impact_analyzer.py --detailed [change_request_file]
```

**Parameters:**
- `--detailed` or `-d`: Enable verbose output
- `change_request_file` (optional): Path to JSON file

**Output:**
- Console: Comprehensive analysis with metrics, progress, warnings
- Excel: Same as standard mode but with detailed console logging

**Use When:**
- Debugging issues
- Validating setup
- Understanding analysis decisions
- Troubleshooting defect scores

---

### Python Function API

#### `run_detailed_analysis(change_request_file, generate_excel=True)`
Execute complete analysis with automatic Excel generation.

**Parameters:**
- `change_request_file` (str): Path to change request JSON
- `generate_excel` (bool): Generate Excel report (default: True)

**Returns:**
- `tuple`: (analyzer, result_dict, excel_path)

**Example:**
```python
from src.services.impact_analyzer import run_detailed_analysis

analyzer, result, excel_path = run_detailed_analysis(
    'Input/CR/change_request.json'
)

print(f"Report: {excel_path}")
print(f"Tests: {result['total_tests_recommended']}")
```

---

#### `ImpactBasedTestingUtility.analyze_change_request_with_llm(change_request)`
Core analysis function with Copilot-native intelligence.

**Parameters:**
- `change_request` (dict): Change request data

**Returns:**
- `dict`: Analysis results with keys:
  - `impacted_modules` (list)
  - `recommended_tests` (list)
  - `prioritized_test_suite` (dict)
  - `total_tests_recommended` (int)
  - `filtering_efficiency` (float)

**Example:**
```python
from src.services.impact_analyzer import ImpactBasedTestingUtility
import json

analyzer = ImpactBasedTestingUtility()

with open('Input/CR/change_request.json') as f:
    cr_data = json.load(f)

result = analyzer.analyze_change_request_with_llm(cr_data)

print(f"Modules: {result['impacted_modules']}")
print(f"Tests: {result['total_tests_recommended']}")
```

---

### Command Line Arguments Reference

| Argument | Description | Example |
|----------|-------------|----------|
| (none) | Standard mode | `python src/services/impact_analyzer.py` |
| `--detailed` | Verbose output | `python src/services/impact_analyzer.py --detailed` |
| `-d` | Short form of --detailed | `python src/services/impact_analyzer.py -d` |
| `file_path` | Custom CR file | `python src/services/impact_analyzer.py Input/CR/my_cr.json` |
| `--detailed file_path` | Both options | `python src/services/impact_analyzer.py --detailed Input/CR/my_cr.json` |

## 🎓 Best Practices

1. **Before Analysis**
   - ✅ Update business context regularly
   - ✅ Clean obsolete test cases
   - ✅ Validate change request completeness

2. **During Analysis**
   - ✅ Monitor console output for warnings
   - ✅ Review impacted modules for accuracy
   - ✅ Check score distribution

3. **After Analysis**
   - ✅ Manually review top 20% of tests
   - ✅ Share results with stakeholders
   - ✅ Track execution outcomes

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review documentation: `docs/END_TO_END_WORKFLOW_AND_FORMULAS.md`
- Validate setup: `python copilot_impact_analysis_helper.py validate`

## 🔄 Updates

To update analysis weights or thresholds, edit `config/config.yaml` and restart the analysis.

---

## 🎯 Sample Prompts for Copilot Chat

### ✅ Prompt 1: Complete Analysis (Recommended)
**Use Case:** Analyze change request with full MCP context integration

**Prompt:**
```
Analyze the change request from Input/CR/change_request.json and generate impact-based test analysis report. Use MCP context for application and business rules.
```

**What Happens:**
1. Retrieves application context from MCP Server
2. Retrieves business rules from MCP Server
3. Loads change request, test cases, defects, stories
4. Executes Copilot-native impact analysis
5. Generates multi-factor scores for all test cases
6. Creates Excel report with 3 sheets
7. Saves to `Output_Files/impact_report/`

**Expected Output:**
- Console: Detailed analysis metrics
- Excel: `GenAI_Impact_Analysis_{CR_ID}_{timestamp}.xlsx`
- 3 sheets: Testcases, Metrics, Defects Prediction

---

### ✅ Prompt 2: Quick Analysis with Validation
**Use Case:** Verify setup before running full analysis

**Prompt:**
```
Run impact analysis with setup validation. Check if all input files are present before analysis.
```

**What Happens:**
1. Validates Python environment
2. Checks all input directories exist
3. Verifies data files are present and readable
4. Executes analysis if all checks pass
5. Reports any missing files or configuration issues

**Expected Output:**
- Validation report with ✅/❌ for each check
- Analysis results if validation passes
- Error messages with resolution steps if validation fails

---

### ✅ Prompt 3: Analysis with Specific File
**Use Case:** Analyze a specific change request file

**Prompt:**
```
Analyze the change request from "C:\path\to\my_change_request.json" and generate impact-based test analysis report. Use MCP context.
```

**What Happens:**
- Same as Prompt 1, but uses specified file path
- Useful for analyzing change requests outside default directory

---

### ✅ Prompt 4: Batch Analysis
**Use Case:** Analyze multiple change requests at once

**Prompt:**
```
Analyze all change requests in Input/CR/ directory and generate separate reports for each. Use MCP context for all analyses.
```

**What Happens:**
1. Scans Input/CR/ for all JSON files
2. Loads MCP context once (reused for all)
3. Processes each change request sequentially
4. Generates individual Excel report for each
5. Creates batch summary report

**Expected Output:**
```
Output_Files/impact_report/
  ├── GenAI_Impact_Analysis_CR001_{timestamp}.xlsx
  ├── GenAI_Impact_Analysis_CR002_{timestamp}.xlsx
  ├── GenAI_Impact_Analysis_CR003_{timestamp}.xlsx
  └── batch_summary_{timestamp}.txt
```

---

### ✅ Prompt 5: Analysis with Focus on Specific Module
**Use Case:** Filter analysis for specific module

**Prompt:**
```
Analyze change request for Search module enhancement. Retrieve MCP application context and filter test cases only for Search and Advanced Search modules.
```

**What Happens:**
- Retrieves MCP application context
- Identifies Search-related components
- Filters test cases by module
- Generates focused report

---

### ✅ Prompt 6: Analysis with Custom Priority
**Use Case:** Analyze high-priority/critical change request

**Prompt:**
```
Analyze change request CR-005 for payment gateway integration. Priority: Critical. Include MCP business rules context and predict high-risk defect areas.
```

**What Happens:**
- Applies 1.5x priority multiplier for critical changes
- Focuses on high-risk modules
- Generates defect prediction
- Highlights integration points

---

### 🔧 Prompt 7: Troubleshooting - View Recent Reports
**Use Case:** List and open recent analysis reports

**Prompt:**
```
Show me the most recent impact analysis report and summarize key findings.
```

**What Happens:**
- Lists recent Excel reports in output directory
- Opens most recent report (if requested)
- Summarizes key metrics and recommendations

---

### 🔧 Prompt 8: Troubleshooting - Explain Defect Scores
**Use Case:** Understand why defect scores are 0.0

**Prompt:**
```
Explain why all defect scores are 0.0 in the CR003 analysis report. Is this a problem?
```

**What Happens:**
- Analyzes the report and change request
- Checks module coverage in defects data
- Explains root cause
- Provides recommendations

---

### ⚠️ Important Notes for All Prompts

**Always Include:**
- "Use MCP context" or "Use MCP context for application and business rules"
- Without this, analysis will use only local context files

**File Path Format:**
- Use forward slashes: `Input/CR/change_request.json` ✅
- Or backslashes with quotes: `"C:\path\to\file.json"` ✅
- Avoid mixing: `Input\CR/file.json` ❌

**Output Location:**
- All Excel reports: `Output_Files/impact_report/`
- File naming: `GenAI_Impact_Analysis_{CR_ID}_{timestamp}.xlsx`

---

---

## 📈 Future Enhancements & Roadmap

### Advanced AI Integration
- **Multi-LLM Ensemble**: Combine multiple AI models for better accuracy
- **Confidence Scoring**: Add confidence intervals to AI recommendations
- **Learning Feedback Loop**: Improve recommendations based on test results

### Enhanced Analytics
- **Predictive Risk Modeling**: ML-based defect prediction
- **Test Execution Optimization**: Order tests by execution dependencies
- **Coverage Gap Analysis**: Identify untested scenarios automatically

### Enterprise Features  
- **Database Integration**: Store analysis history and patterns
- **CI/CD Integration**: Automated analysis triggers
- **Multi-Project Support**: Cross-project impact analysis
- **Advanced Reporting**: Executive dashboards and trend analysis

---

## 📊 Summary

### Key Benefits

| Benefit | Description | Impact |
|---------|-------------|--------|
| **Test Reduction** | 85-95% reduction in suite size | Faster execution |
| **Transparent Scoring** | Detailed reasoning for each test | Better understanding |
| **Domain Awareness** | Business context integration | Accurate prioritization |
| **Risk-Based** | Historical defect patterns | Proactive testing |
| **Interactive Dashboard** | Real-time visualization | Better decisions |
| **Copilot-Native** | No external LLM setup | Easy deployment |

### Complete Formula Reference

```
Final_Score = (LLM_Score × 0.4) + (Module_Score × 0.3) + 
              (Defects_Score × 0.2) + (Business_Score × 0.1)

Where:
  LLM_Score      = AI-powered semantic relevance (0.0-1.0)
  Module_Score   = Direct module impact (0.0-1.0)
  Defects_Score  = Historical risk assessment (0.0-1.0)
  Business_Score = Business criticality (0.0-1.0)

Priority Assignment:
  High:              Final_Score >= 0.7
  Medium:            0.4 <= Final_Score < 0.7
  Low:               0.3 <= Final_Score < 0.4
  Not Recommended:   Final_Score < 0.3
```

### Success Metrics

- ✅ **Efficiency**: 85-95% test suite reduction
- ✅ **Coverage**: 90%+ module coverage maintained
- ✅ **Accuracy**: High correlation with actual defects
- ✅ **Speed**: Analysis completes in seconds
- ✅ **Usability**: Single prompt execution via Copilot

---

## 📞 Support & Documentation

**Quick Links:**
- **Agent File**: `.github/agents/impact-based-test-analysis.agent.md`
- **Core Engine**: `src/services/impact_analyzer.py`
- **Configuration**: `config/config.yaml`
- **Output Directory**: `Output_Files/impact_report/`

**For Issues:**
1. Run validation: `python copilot_impact_analysis_helper.py validate`
2. Check troubleshooting section above
3. Review console output for warnings
4. Verify all input files are present and valid

---

**Last Updated:** November 21, 2025
**Version:** 2.1.0 (Consolidated Documentation)
**System Status:** Production Ready
**Integration:** GitHub Copilot + MCP Context Server
