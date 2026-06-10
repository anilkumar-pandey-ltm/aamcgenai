# Video Processor - Excel Output Quick Reference

**Agent**: `video-processor-analyzer`  
**Primary Output Format**: Excel (.xlsx)  
**Purpose**: Generate comprehensive test cases ready for import into test management tools

---

## 🎯 Quick Start - Excel Output

### Single Command
```
@video-processor-analyzer Generate E2E test cases from demo.mp4 in Excel format
```

**Result**: Excel workbook with 12 comprehensive test cases

---

## 📊 Excel Output Structure

### File Details
- **File Name**: `{video_name}_E2E_TestCases_{timestamp}.xlsx`
- **File Size**: ~10-15 KB (12 test cases)
- **Location**: `Output/video_analysis_output/`
- **Format**: Microsoft Excel 2007+ (.xlsx)

### Workbook Layout
```
demo_video_E2E_TestCases_20260428_190411.xlsx
│
└── Sheet: "Test Cases"
    ├── Header Row (12 columns)
    └── Data Rows (12 test cases - one per technique)
```

---

## 📋 12 Columns in Excel Output

| # | Column Name | Description | Example |
|---|-------------|-------------|---------|
| 1 | `test_case_id` | Unique identifier | TC_E2E_DATA_ENTRY_001 |
| 2 | `e2e_flow_name` | Business scenario name | Complete Form Submission - Happy Path |
| 3 | `business_scenario` | Detailed description | Verify user can successfully complete form... |
| 4 | `user_role` | Actor performing test | Registered User, Admin, Guest |
| 5 | `module` | System component | Data Entry, Authentication, Checkout |
| 6 | `pre_conditions` | Setup requirements | Application loaded, user logged in... |
| 7 | `test_data` | Input values | {"username": "test@example.com", ...} |
| 8 | `test_steps` | Detailed action steps | [{"step_number": 1, "step_description": ...}] |
| 9 | `expected_output` | Success criteria | Form submitted successfully, data persisted... |
| 10 | `test_design_technique` | Testing methodology | Happy Path Testing, Negative Testing, BVA... |
| 11 | `priority` | Business criticality | Critical, High, Medium, Low |
| 12 | `coverage_tag` | Layers covered | UI \| API \| DB |

---

## 🎨 12 Test Design Techniques (12 Test Cases)

Each Excel file contains **one test case per technique**:

| # | Technique | Description |
|---|-----------|-------------|
| 1 | **Happy Path Testing** | Complete successful workflow |
| 2 | **Negative Testing** | Invalid inputs, error scenarios |
| 3 | **Boundary Value Analysis** | Min/max/edge values |
| 4 | **Equivalence Partitioning** | Valid/invalid data classes |
| 5 | **Decision Table Testing** | Complex condition combinations |
| 6 | **State Transition Testing** | Workflow state changes |
| 7 | **Error Handling & Recovery** | Failure scenarios |
| 8 | **Role-Based Access Control** | Permission testing |
| 9 | **Integration Testing** | Multi-system workflows |
| 10 | **Session Management** | Timeout/expiry scenarios |
| 11 | **Cross-Browser Compatibility** | Multi-browser testing |
| 12 | **Data Persistence & Concurrency** | DB operations |

---

## 💬 Example Commands

### Basic Excel Generation
```
@video-processor-analyzer Generate E2E test cases from C:\videos\demo.mp4 in Excel format
```

### With Quality Settings
```
@video-processor-analyzer Generate E2E test cases from demo.mp4 in Excel with high quality analysis
```

### With Description
```
@video-processor-analyzer Generate E2E test cases from login_flow.mp4 in Excel - Description: User authentication workflow with MFA
```

### Batch Processing
```
@video-processor-analyzer Generate E2E test cases in Excel for all videos in C:\videos\sprint_demos\
```

---

## 🔧 Technical Command (PowerShell)

```powershell
python -c "
from src.services.video_service import VideoProcessingService

service = VideoProcessingService()
result = service.generate_e2e_testcases_from_video_frames(
    video_file_path='C:\videos\demo.mp4',
    output_directory='Output/video_analysis_output',
    model='claude-3.5-sonnet',
    description='Optional: Demo video context',
    include_timestamps=True,
    video_quality='medium',
    output_format='excel'  # KEY: Excel output
)

print('Excel file:', result['output_files']['excel'])
print('Test cases generated:', result['test_cases_generated'])
"
```

---

## ✅ Excel Output Validation

### File Created
```powershell
Test-Path "Output/video_analysis_output/*.xlsx"  # Should return True
```

### File Size Check
```powershell
Get-ChildItem "Output/video_analysis_output/*.xlsx" | Select-Object Name, Length
# Expected: 10-15 KB
```

### Content Verification
Open Excel file and verify:
- ✅ 12 columns present (A through L)
- ✅ 12 data rows (one per test technique)
- ✅ Header row with column names
- ✅ All cells populated (no empty critical fields)
- ✅ Proper formatting (borders, filters enabled)

---

## 📤 Import into Test Management Tools

### Jira (Xray/Zephyr)
1. Open Jira → Navigate to Test section
2. Import → Select Excel file
3. Map columns: test_case_id → Test Key, test_steps → Steps, etc.
4. Import and review

### TestRail
1. Projects → Test Cases → Import
2. Upload Excel file
3. Map fields: e2e_flow_name → Title, test_steps → Steps
4. Complete import

### Azure DevOps
1. Test Plans → Test Cases → Import
2. Upload .xlsx file
3. Map columns to Azure DevOps fields
4. Verify and import

---

## 🎯 Output Format Comparison

| Format | Best For | File Size | Readability | Import Ready |
|--------|----------|-----------|-------------|--------------|
| **Excel** | Test management tools | 10-15 KB | ⭐⭐⭐⭐⭐ | ✅ Yes |
| CSV | Spreadsheets, bulk import | 5-8 KB | ⭐⭐⭐ | ✅ Yes |
| JSON | Automation, APIs | 8-12 KB | ⭐⭐ | ⚠️ Requires parsing |
| Markdown | Documentation | 6-10 KB | ⭐⭐⭐⭐ | ❌ Manual copy |

**Recommendation**: Use **Excel** for maximum compatibility and ease of use.

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Excel file not created | Check `output_format='excel'` parameter |
| File corrupted | Verify FFmpeg installed for video processing |
| Missing columns | Re-run with latest agent version |
| Empty cells | Add `description` parameter for better context |
| Only 1-2 test cases | Check video_quality setting (use 'medium' or 'high') |

---

## 📊 Sample Output Preview

```
demo_video_E2E_TestCases_20260428_190411.xlsx

Row 1:  TC_E2E_DATA_ENTRY_001 | Complete Form Submission - Happy Path | Verify user can complete form... | Critical | UI|API|DB
Row 2:  TC_E2E_DATA_ENTRY_002 | Form Submission - Invalid Input | Verify invalid inputs are rejected... | High | UI|API
Row 3:  TC_E2E_DATA_ENTRY_003 | Form Submission - Boundary Values | Test min/max values... | High | UI|API|DB
...
Row 12: TC_E2E_DATA_ENTRY_012 | Data Persistence & Concurrency | Verify concurrent edits... | High | UI|API|DB
```

---

## 🔗 Related Documentation

- [Video Processor Agent](.github/agents/video-processor-analyzer.agent.md)
- [Video Task Templates](.github/skills/video-task-templates.md)
- [Test Design Techniques](.github/skills/test-design-techniques.md)
- [Excel Export Patterns](.github/skills/traceability-excel-export.md)

---

## ✅ Success Criteria

✅ Excel file generated (`.xlsx` extension)  
✅ File size 10-15 KB (12 test cases)  
✅ 12 columns × 12 rows structure  
✅ All test design techniques represented  
✅ Ready for import into test management tools  
✅ Proper Excel formatting (headers, filters, borders)  
