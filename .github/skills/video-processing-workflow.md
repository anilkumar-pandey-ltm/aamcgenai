---
name: video-processing-workflow
description: Complete workflow for video analysis including pre-checks, input gathering, validation, execution, and result reporting. Covers FFmpeg setup, dependency checks, and graceful degradation strategies.
---

# Video Processing Workflow

## Purpose
Standardized 4-step workflow for processing video files with proper validation, dependency checking, and error handling.

---

## 🔧 Dependencies Management

### **Required**
- ✅ **Python 3.8+** with virtual environment activated
- ✅ **src.services.video_service** module available in framework

### **Optional (Enhanced Features)**

#### **FFmpeg** (Frame Extraction & Audio Processing)
- **Purpose**: Extract video frames and audio tracks for analysis
- **Install Windows**: `choco install ffmpeg`
- **Install Manual**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- **Verify**: `ffmpeg -version`
- **Fallback**: Without FFmpeg, provides basic metadata and analysis framework

#### **Audio Transcription** (Multiple Fallback Strategies)
- **Tier 1 (Preferred)**: Local `whisper` Python package (no API key, no file-size limit, works offline)
- **Tier 2 (Fallback)**: OpenAI Whisper API with automatic chunking for large files
  - **Setup**: `$env:OPENAI_API_KEY="sk-..."`
  - **Verify**: `$env:OPENAI_API_KEY`
- **Tier 3 (No Audio)**: Comprehensive video-only analysis (12 standard + flow-specific test cases)
- **Philosophy**: Audio enhances analysis but is never required — videos without audio get full template-based test case generation

### **Graceful Degradation Strategy**

| Missing Dependency | Impact | Fallback Behavior |
|-------------------|--------|-------------------|
| FFmpeg | No frame/audio extraction | Provides analysis framework with manual review guidance |
| Local Whisper | Falls back to OpenAI Whisper API | Attempts OpenAI API if key available, else proceeds video-only |
| OpenAI API Key | No audio transcription | **Comprehensive template generation**: 12 standard test design techniques + flow-specific cases (Authentication, Search, Checkout, etc.) — full E2E coverage without audio |

---

## PRE-CHECK: Verify Dependencies

**Action:** Verify required tools before processing

### 1. Check Python Environment
```powershell
python -c "from src.services.video_service import VideoProcessingService; print('✅ Video service available')"
```
- ✅ **Success**: Proceed to next check
- ❌ **Error**: Verify virtual environment is activated

### 2. Check FFmpeg (Optional)
```powershell
ffmpeg -version
```
- ✅ **Found**: Full frame extraction and audio processing available
- ⚠️ **Not found**: Basic metadata only, provide analysis framework
- **Install**: `choco install ffmpeg` (Windows) or download from ffmpeg.org

### 3. Status Report Template
```
==========================================
VIDEO PROCESSOR DEPENDENCIES CHECK
==========================================
✅ Python Video Service: AVAILABLE
✅ FFmpeg: AVAILABLE (or ⚠️ NOT FOUND - limited features)

Ready to process videos ✅
==========================================
```

---

## 🔄 Processing Workflow (4 Steps)

### **STEP 1: Gather User Inputs**

**Action:** Collect all required parameters from user

**Required Inputs:**
- **Video file path**: Full path to video file (e.g., `C:\videos\demo.mp4`)
- **Task type**: `test_case`, `e2e_testcase`, `defect`, `user_story`, or `bdd`
- **Output directory**: Where to save results (e.g., `Output/video_analysis_output`)

**Optional Inputs:**
- **Output format**: 
  - **E2E test cases**: `excel` (recommended), `csv`, `json`, `markdown`
  - **Other tasks**: `markdown` (default), `json`, `yaml`, `xml`
- **Model**: Default `claude-3.5-sonnet` (alternatives: `gpt-4o`, `gpt-4-turbo`)
- **Description**: Video content description for better context
- **Include timestamps**: Default `true` (timestamp references in output)
- **Video quality**: `high`/`medium`/`low` (default: `medium`)

**Excel Output (Recommended for Test Cases):**
- Use task_type = `e2e_testcase` with output_format = `excel`
- Generates comprehensive 12-technique test case workbook
- Ready for import into Jira, TestRail, Azure DevOps

---

### **STEP 2: Validate Inputs**

**Action:** Verify all inputs before processing

```powershell
# Check video file exists
Test-Path "C:\videos\demo.mp4"

# Verify supported format
$ext = [System.IO.Path]::GetExtension("demo.mp4")
$supported = @('.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.m4v')
$supported -contains $ext

# Ensure output directory accessible
New-Item -ItemType Directory -Force -Path "Output/video_analysis_output"
```

**Validation Checks:**
- ✅ File exists and is readable
- ✅ Format in supported list: MP4, WebM, AVI, MOV, MKV, FLV, WMV, M4V
- ✅ Output directory writable (create if doesn't exist)
- ✅ Task type valid: `test_case`, `e2e_testcase`, `defect`, `user_story`, `bdd`

---

### **STEP 3: Execute Video Processing**

**Action:** Process video using VideoProcessingService

#### Standard Processing (test_case, defect, user_story, bdd)
```python
python -c "
from src.services.video_service import VideoProcessingService

service = VideoProcessingService()
result = service.process_video_for_copilot(
    video_file_path='C:\\videos\\demo.mp4',
    task_type='test_case',
    output_directory='Output/video_analysis_output',
    model='claude-3.5-sonnet',
    description='Login functionality demo',
    include_timestamps=True,
    video_quality='medium',
    output_format='markdown'
)

print('✅ Processing complete!')
print('File saved:', result['file_path'])
print('Processing time:', result['processing_time'], 'seconds')
print('Frames analyzed:', result['frames_analyzed'])
print('Video duration:', result['video_duration'], 'seconds')
"
```

#### E2E Test Case Generation (Excel/CSV format)
```python
python -c "
from src.services.video_service import VideoProcessingService

service = VideoProcessingService()
result = service.generate_e2e_testcases_from_video_frames(
    video_file_path='C:\\videos\\demo.mp4',
    output_directory='Output/video_analysis_output',
    model='claude-3.5-sonnet',
    description='Demo video comprehensive E2E test case generation',
    include_timestamps=True,
    video_quality='medium',
    output_format='excel'
)

print('✅ E2E test cases generated!')
print('Excel file:', result['output_files']['excel'])
print('Test cases generated:', result['test_cases_generated'])
"
```

**Processing Steps:**
1. Extract video metadata (duration, resolution, fps)
2. Extract frames based on quality setting
3. Extract audio transcript (if available)
4. Analyze frames with vision model
5. Generate task-specific documentation
6. Save to output file

---

### **STEP 4: Report Results**

**Action:** Provide comprehensive processing summary

**Standard Output Information:**
```json
{
  "success": true,
  "file_path": "Output/video_analysis_output/demo_test_case_analysis.md",
  "document_type": "test_case",
  "processing_time": 45.3,
  "video_duration": 120.5,
  "frames_analyzed": 30,
  "confidence_score": 0.85,
  "model_used": "claude-3.5-sonnet",
  "output_format": "markdown",
  "content_length": 5432
}
```

**E2E Test Case Output:**
```json
{
  "success": true,
  "test_cases_generated": 12,
  "frames_analyzed": 50,
  "video_duration": 368.066667,
  "processing_time": 13.67,
  "output_files": {
    "excel": "Output/video_analysis_output/demo_video_E2E_TestCases_20260428_190411.xlsx"
  }
}
```

**Next Steps:**
- Review generated documentation
- Validate output structure and content
- Integrate with existing test suites
- Process additional videos if needed

---

## 📁 File Organization

### **Path Configuration**
**Framework paths from `copilot-agent.paths.yaml`:**
- `{{test_paths.video_analysis}}` → `Output/video_analysis_output`

### **Output Structure**
**Naming Convention:** `[output_dir]/[video_name]_{task_type}_analysis.{format}`

**Example Output Directory:**
```
Output/video_analysis_output/
  ├── login_demo_test_case_analysis.md
  ├── search_bug_defect_analysis.md
  ├── checkout_flow_user_story_analysis.json
  ├── payment_process_bdd_analysis.yaml
  └── demo_video_E2E_TestCases_20260428_190411.xlsx
```

---

## 🔧 Troubleshooting

| Issue | Fix |
|-------|-----|
| Format not supported | Check MP4/WebM/AVI/MOV/MKV/FLV/WMV/M4V |
| API key missing | Set `OPENAI_API_KEY` environment variable |
| Output dir access | Verify write permissions |
| Processing timeout | Reduce quality setting (Low: 5s/15 frames) |
| FFmpeg not found | Install FFmpeg or continue with basic metadata |
| Virtual env not active | Run `.\venv\Scripts\Activate.ps1` |

---

## Quality Settings Reference

| Quality | Frame Interval | Total Frames | Use Case |
|---------|---------------|--------------|----------|
| High | 1 second | ~50+ frames | Detailed UI analysis, complex workflows |
| Medium | 2 seconds | ~30 frames | Standard test case generation (default) |
| Low | 5 seconds | ~15 frames | Quick analysis, long videos |

---

## Supported Video Formats

**Primary**: MP4, WebM, MOV  
**Additional**: AVI, MKV, FLV, WMV, M4V

**Codec Support**: H.264, H.265, VP8, VP9, AV1
