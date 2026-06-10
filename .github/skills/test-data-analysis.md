---
name: test-data-analysis
description: Patterns for loading, validating, and analyzing test data from CSV/Excel files including test cases, defects, requirements, and module coverage mapping with column name normalization.
---

# Test Data Analysis & CSV Validation Patterns

## Purpose
Patterns for loading, validating, and analyzing test data from CSV/Excel files, including test cases, defects, and requirements.

---

## CSV/Excel Data Loading Patterns

### Test Case CSV Structure

#### Common Column Names (Handle Variations)
```python
# Column name mapping - handle different naming conventions
COLUMN_MAPPINGS = {
    'test_id': ['Test_ID', 'Functional TC ID', 'TC_ID', 'TestCase_ID'],
    'test_name': ['Test_Name', 'Function Testcase name', 'TestCase_Name', 'Test Case Name'],
    'module': ['Module', 'Component', 'Module_Name', 'Area'],
    'priority': ['Priority', 'Test_Priority', 'Severity'],
    'summary': ['Test_Summary', 'Testcases summary', 'Description', 'Test Description'],
    'automation_id': ['Automation_ID', 'Automation TC ID', 'Auto_ID']
}
```

#### Flexible Column Detection
```python
def detect_column(df, possible_names):
    """Detect column name from multiple possibilities"""
    for name in possible_names:
        if name in df.columns:
            return name
    return None

# Usage
test_id_col = detect_column(df, COLUMN_MAPPINGS['test_id'])
if not test_id_col:
    raise ValueError("Could not find Test_ID column")
```

### Historical Defects CSV Structure

#### Required Columns
```python
DEFECT_REQUIRED_COLUMNS = {
    'module': ['Module', 'Component', 'Module_Name'],  # CRITICAL: Must match test case modules
    'priority': ['Priority', 'Severity', 'Impact'],
    'status': ['Status', 'State', 'Defect_Status'],
    'created': ['Created', 'Creation_Date', 'Created_Date'],
    'description': ['Description', 'Summary', 'Defect_Description']
}

DEFECT_OPTIONAL_COLUMNS = {
    'business_impact': ['Business_Impact', 'Business Impact', 'Impact'],
    'customer_impact': ['Customer_Impact', 'Customer Impact'],
    'resolved_date': ['Resolved', 'Resolution_Date', 'Resolved_Date']
}
```

#### ⚠️ Critical: Module Name Consistency
```python
# Test cases use "Component" column
test_df['Component'] = "Browse Products by Category"

# Defects use "Module" column - MUST MATCH
defect_df['Module'] = "Browse Products by Category"

# Mismatch example (WILL FAIL):
test_df['Component'] = "Product Browse"       # Different name
defect_df['Module'] = "Browse Products by Category"  # Different name
# Result: Defects_Score = 0.0 ❌
```

---

## Data Validation Patterns

### Pre-Analysis Validation Checklist

#### 1. File Existence Check
```python
import os
from pathlib import Path

def validate_input_files(config):
    """Validate all required input files exist"""
    required_files = {
        'change_request': config['input_paths']['cr'],
        'test_cases': config['input_paths']['tcs_dump'],
        'defects': config['input_paths']['defects'],
        'stories': config['input_paths']['stories']
    }
    
    missing = []
    for name, path in required_files.items():
        if not Path(path).exists():
            missing.append(f"{name}: {path}")
    
    if missing:
        raise FileNotFoundError(f"Missing files:\n" + "\n".join(missing))
    
    return True
```

#### 2. CSV Structure Validation
```python
def validate_csv_structure(df, required_columns, csv_name):
    """Validate CSV has required columns"""
    missing = []
    
    for logical_name, possible_names in required_columns.items():
        found = False
        for col_name in possible_names:
            if col_name in df.columns:
                found = True
                break
        
        if not found:
            missing.append(f"{logical_name} (tried: {', '.join(possible_names)})")
    
    if missing:
        raise ValueError(f"{csv_name} missing columns:\n" + "\n".join(missing))
    
    return True
```

#### 3. Data Quality Validation
```python
def validate_data_quality(df, csv_name):
    """Validate data quality metrics"""
    issues = []
    
    # Check for empty DataFrame
    if df.empty:
        issues.append(f"{csv_name} is empty")
    
    # Check for null values in critical columns
    critical_cols = detect_critical_columns(df)
    for col in critical_cols:
        null_count = df[col].isnull().sum()
        if null_count > 0:
            null_pct = (null_count / len(df)) * 100
            if null_pct > 10:  # More than 10% nulls
                issues.append(f"{csv_name}.{col}: {null_pct:.1f}% null values")
    
    # Check for duplicate IDs
    id_col = detect_column(df, ['Test_ID', 'Defect_ID', 'ID'])
    if id_col:
        duplicates = df[id_col].duplicated().sum()
        if duplicates > 0:
            issues.append(f"{csv_name}: {duplicates} duplicate IDs found")
    
    if issues:
        warnings.warn(f"Data quality issues in {csv_name}:\n" + "\n".join(issues))
    
    return len(issues) == 0
```

---

## Module Coverage Verification

### Defect Coverage Check (CRITICAL)

**Problem**: Change request affects modules with NO defect history

**Detection**:
```python
def verify_defect_coverage(change_request, test_cases_df, defects_df):
    """Verify if CR modules have defect history"""
    
    # Get change request modules
    cr_modules = set(change_request.get('components_affected', []))
    
    # Get available defect modules
    defect_module_col = detect_column(defects_df, ['Module', 'Component'])
    available_defect_modules = set(defects_df[defect_module_col].unique())
    
    # Check coverage
    coverage = {
        'requested_modules': list(cr_modules),
        'available_modules': list(available_defect_modules),
        'covered_modules': list(cr_modules & available_defect_modules),
        'uncovered_modules': list(cr_modules - available_defect_modules),
        'has_coverage': len(cr_modules & available_defect_modules) > 0
    }
    
    # Log warning if no coverage
    if not coverage['has_coverage']:
        warning_msg = f"""
⚠️ DEFECT COVERAGE WARNING:
Change Request Module: {coverage['requested_modules']}
Available Defect Modules: {coverage['available_modules']}
Module Coverage: NO - Defect scores will be 0.0

This is VALID for:
• New modules (no history yet)
• Stable modules (few/no defects)
• Recently added features

Impact:
• Defects_Score will be 0.0 for all tests
• Final scoring relies on: LLM (40%) + Module (30%) + Business (10%) = 80%
• Risk prediction unavailable for this module

Options:
1. Accept 0.0 defect scores (recommended for new/stable modules)
2. Add sample defects to defects CSV
3. Map to similar module with defect history
"""
        print(warning_msg)
    
    return coverage
```

### Module Mapping Resolution

**Pattern for mapping test modules to defect modules**:
```python
def map_test_to_defect_modules(test_module, defect_modules, similarity_threshold=0.8):
    """Map test module to defect module using fuzzy matching"""
    from difflib import SequenceMatcher
    
    best_match = None
    best_score = 0.0
    
    for defect_module in defect_modules:
        # Calculate similarity
        similarity = SequenceMatcher(None, test_module.lower(), defect_module.lower()).ratio()
        
        if similarity > best_score:
            best_score = similarity
            best_match = defect_module
    
    if best_score >= similarity_threshold:
        return {
            'mapped_module': best_match,
            'confidence': best_score,
            'original_module': test_module
        }
    
    return None  # No good match
```

---

## Historical Defects Analysis

### Defect Pattern Analysis

#### Calculate Module Risk Scores
```python
def calculate_module_risk_scores(defects_df):
    """Calculate risk score for each module based on defect patterns"""
    
    module_col = detect_column(defects_df, ['Module', 'Component'])
    severity_col = detect_column(defects_df, ['Priority', 'Severity'])
    
    # Group by module
    module_stats = {}
    
    for module in defects_df[module_col].unique():
        module_defects = defects_df[defects_df[module_col] == module]
        
        # Count defects by severity
        severity_counts = module_defects[severity_col].value_counts().to_dict()
        
        # Calculate risk score (0.0 - 1.0)
        risk_score = (
            severity_counts.get('Critical', 0) * 1.0 +
            severity_counts.get('High', 0) * 0.7 +
            severity_counts.get('Medium', 0) * 0.4 +
            severity_counts.get('Low', 0) * 0.2
        ) / max(len(module_defects), 1)  # Normalize by defect count
        
        # Normalize to 0-1 scale (cap at 0.2 for 1.0 score)
        risk_score = min(risk_score / 0.2, 1.0)
        
        module_stats[module] = {
            'defect_count': len(module_defects),
            'risk_score': risk_score,
            'severity_distribution': severity_counts
        }
    
    return module_stats
```

#### Trend Analysis
```python
def analyze_defect_trends(defects_df, time_window_days=90):
    """Analyze recent defect trends"""
    
    created_col = detect_column(defects_df, ['Created', 'Creation_Date'])
    module_col = detect_column(defects_df, ['Module', 'Component'])
    
    # Convert to datetime
    defects_df[created_col] = pd.to_datetime(defects_df[created_col])
    
    # Filter recent defects
    recent_date = datetime.now() - timedelta(days=time_window_days)
    recent_defects = defects_df[defects_df[created_col] >= recent_date]
    
    # Analyze trends per module
    trends = {}
    for module in defects_df[module_col].unique():
        all_count = len(defects_df[defects_df[module_col] == module])
        recent_count = len(recent_defects[recent_defects[module_col] == module])
        
        trends[module] = {
            'total_defects': all_count,
            'recent_defects': recent_count,
            'trend': 'increasing' if recent_count > all_count * 0.3 else 'stable'
        }
    
    return trends
```

---

## Test Case Filtering & Grouping

### Group Tests by Module
```python
def group_tests_by_module(tests_df):
    """Group test cases by module for analysis"""
    
    module_col = detect_column(tests_df, ['Module', 'Component'])
    
    grouped = {}
    for module in tests_df[module_col].unique():
        module_tests = tests_df[tests_df[module_col] == module]
        
        grouped[module] = {
            'tests': module_tests.to_dict('records'),
            'count': len(module_tests),
            'priorities': module_tests['Priority'].value_counts().to_dict()
        }
    
    return grouped
```

### Filter Tests by Criteria
```python
def filter_tests(tests_df, criteria):
    """Filter tests based on multiple criteria"""
    
    filtered = tests_df.copy()
    
    # Filter by module
    if 'modules' in criteria:
        module_col = detect_column(filtered, ['Module', 'Component'])
        filtered = filtered[filtered[module_col].isin(criteria['modules'])]
    
    # Filter by priority
    if 'priorities' in criteria:
        filtered = filtered[filtered['Priority'].isin(criteria['priorities'])]
    
    # Filter by keywords
    if 'keywords' in criteria:
        summary_col = detect_column(filtered, ['Test_Summary', 'Description'])
        keyword_pattern = '|'.join(criteria['keywords'])
        filtered = filtered[filtered[summary_col].str.contains(keyword_pattern, case=False, na=False)]
    
    return filtered
```

---

## Data Export Patterns

### Excel Report Generation (3-Sheet Format)

```python
def generate_excel_report(analysis_results, output_path):
    """Generate 3-sheet Excel report"""
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment
    
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Sheet 1: Simplified view
        simplified_df = pd.DataFrame([
            {
                'Test_ID': test['test_id'],
                'Test_Name': test['test_name'],
                'Module': test['module'],
                'Execution_Priority': test['execution_priority'],
                'Automation_ID': test.get('automation_id', ''),
                'Test_Summary': test['test_summary']
            }
            for test in analysis_results['prioritized_tests']
        ])
        simplified_df.to_excel(writer, sheet_name='GenAI_Impact based Testcases', index=False)
        
        # Sheet 2: Detailed metrics
        metrics_df = pd.DataFrame([
            {
                'Test_ID': test['test_id'],
                'Test_Name': test['test_name'],
                'Module': test['module'],
                'Original_Priority': test['original_priority'],
                'Execution_Priority': test['execution_priority'],
                'Final_Score': round(test['final_score'], 3),
                'LLM_Score': round(test['llm_score'], 3),
                'Module_Score': round(test['module_score'], 3),
                'Defects_Score': round(test['defects_score'], 3),
                'Business_Score': round(test['business_score'], 3),
                'Automation_ID': test.get('automation_id', ''),
                'Test_Summary': test['test_summary'],
                'Selection_Reason': test.get('selection_reason', '')
            }
            for test in analysis_results['prioritized_tests']
        ])
        metrics_df.to_excel(writer, sheet_name='GenAI_Impact Metrics', index=False)
        
        # Sheet 3: Defects prediction
        defects_df = pd.DataFrame([
            {
                'Module': module,
                'Risk_Level': data['risk_level'],
                'Predicted_Defect_Areas': data['predicted_areas'],
                'Historical_Similarity': data['similarity_score'],
                'Recommended_Action': data['recommendation']
            }
            for module, data in analysis_results['defect_predictions'].items()
        ])
        defects_df.to_excel(writer, sheet_name='GenAI_Defects Prediction', index=False)
        
        # Apply formatting
        workbook = writer.book
        for sheet_name in workbook.sheetnames:
            worksheet = workbook[sheet_name]
            
            # Header formatting
            for cell in worksheet[1]:
                cell.font = Font(bold=True, color="FFFFFF")
                cell.fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
                cell.alignment = Alignment(horizontal="center", vertical="center")
            
            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    if cell.value:
                        max_length = max(max_length, len(str(cell.value)))
                worksheet.column_dimensions[column_letter].width = min(max_length + 2, 50)
    
    return output_path
```

---

## Best Practices

### 1. Always Handle Column Name Variations
```python
# ❌ BAD: Assumes exact column names
test_id = df['Test_ID']

# ✅ GOOD: Handles variations
test_id_col = detect_column(df, ['Test_ID', 'Functional TC ID', 'TC_ID'])
test_id = df[test_id_col]
```

### 2. Validate Data Before Analysis
```python
# Always validate before proceeding
validate_input_files(config)
validate_csv_structure(test_df, TEST_REQUIRED_COLUMNS, 'test_cases.csv')
validate_data_quality(test_df, 'test_cases.csv')
```

### 3. Check Defect Coverage
```python
# Verify  defect coverage for accurate risk assessment
coverage = verify_defect_coverage(change_request, test_df, defects_df)
if not coverage['has_coverage']:
    # Log warning and proceed with 0.0 defect scores
    logger.warning("No defect history for CR modules - defect scores will be 0.0")
```

### 4. Handle Missing Data Gracefully
```python
# Use defaults for optional fields
automation_id = test.get('automation_id', 'N/A')
business_impact = defect.get('business_impact', 'Unknown')
```

### 5. Log Data Statistics
```python
logger.info(f"Loaded {len(test_df)} test cases")
logger.info(f"Loaded {len(defects_df)} historical defects")
logger.info(f"Modules in tests: {test_df['Component'].nunique()}")
logger.info(f"Modules in defects: {defects_df['Module'].nunique()}")
```

---

## Related Skills
- [impact-based-test-prioritization.md](impact-based-test-prioritization.md) - Scoring algorithms
- [validation-and-autofix.md](validation-and-autofix.md) - Data validation patterns
