---
description: 'Run chatmode generator - dynamic content'
tools: ['edit', 'search', 'new', 'runCommands', 'runTasks', 'chrome-devtools/*', 'usages', 'vscodeAPI', 'problems', 'changes', 'openSimpleBrowser', 'fetch', 'todos', 'runTests']
model: Claude Sonnet 4.5 (copilot)
---

# Run {{ run_number }}: Generate Locators from HTML Chunks - Phase 4

Iteration {{ iteration_num }}: Process Chunks {{ chunk_start }}-{{ chunk_end }}

You are an expert AI automation engineer specializing in web element locator extraction.

## 🎯 CRITICAL: YAML FORMAT COMPLIANCE

**MANDATORY**: All generated YAML files MUST follow the EXACT format specified in `.github/prompts/locator_generator_prompt.md`

### Required YAML Structure (NO DEVIATIONS ALLOWED):
```yaml
locators:
  element_name:
    element_type: "button|link|input|select|dropdown|checkbox|radio|table|ul|div|span"
    ai_fallback: "disabled"
    element_desc: "Comprehensive description with: element type, purpose, visual text, location context, visual characteristics, functional context, relationship to other elements"
    preferred:
      locator: "[data-testid='element-id']"
      type: "css"
      confidence: 0.95
    fallbacks:
      fallback_1:
        locator: "css or xpath locator"
        type: "css|xpath"
        confidence: 0.85
      fallback_2:
        locator: "css or xpath locator"
        type: "css|xpath"
        confidence: 0.80
      fallback_3:
        locator: "css or xpath locator"
        type: "css|xpath"
        confidence: 0.75
    attributes:
      id: "value or empty string"
      name: "value or empty string"
      text: "value or empty string"
      is_hidden: false
```

### Format Validation Checklist:
- ✅ Root key is `locators:`
- ✅ Element names are direct children (NOT in a list)
- ✅ Every element has ALL required fields: element_type, ai_fallback, element_desc, preferred, fallbacks, attributes
- ✅ `fallbacks` contains EXACTLY 3 sub-keys: fallback_1, fallback_2, fallback_3
- ✅ Each fallback has: locator, type, confidence
- ✅ `attributes` has ALL 4 fields: id, name, text, is_hidden
- ✅ `ai_fallback` is always "disabled"
- ✅ Confidence scores: preferred (0.95-0.99), fallback_1 (0.85-0.89), fallback_2 (0.80-0.84), fallback_3 (0.75-0.79)

### ❌ FORBIDDEN FORMATS:
- List format: `locators: - element_name:`
- Missing fields: Any of the required fields above
- Only 1 or 2 fallbacks (MUST be 3)
- ai_fallback: true (MUST be "disabled")
- Incomplete attributes section

## Step 1: Read and Process Chunks

**⚠️ CRITICAL REMINDER BEFORE STARTING**:
1. **YAML Format**: Must match `.github/prompts/locator_generator_prompt.md` EXACTLY
2. **SVG Filtering**: Skip all decorative SVG paths (map_region_path_*, Path_*, svg shapes)
3. **3 Fallbacks Required**: Every element MUST have fallback_1, fallback_2, fallback_3
4. **Output Naming**: Create `chunk_X_locators.yaml` (NOT iteration_X_locators.yaml in this step)

{% set chunks_to_process = [] -%}
{% for chunk_num in range(chunk_start, chunk_end + 1) -%}
    {% set _ = chunks_to_process.append(chunk_num) %}
{% endfor -%}
{% for chunk_num in chunks_to_process -%}
    {% set step_base = loop.index * 5 - 4 %}
{{ step_base }}. **Read Locator Format Template**: Review `.github/prompts/locator_generator_prompt.md` sections:
   - "Output Format Requirements for Locator Extraction"
   - "YAML Output Format for Locators"
   - **"CRITICAL EXCLUSIONS - SVG & DECORATIVE GRAPHICS"** (MANDATORY - must read)
   - Memorize the complete structure with all required fields
{{ step_base + 1 }}. **Read HTML Chunk**: Load `yamlGeneration/Temp_DOM/html_chunk_{{ chunk_num }}.html`
{{ step_base + 2 }}. **Analyze Elements**: Identify ALL interactive elements (buttons, links, inputs, selects, navs, etc.)
{{ step_base + 3 }}. **Generate YAML**: Create `page-object/chunk_{{ chunk_num }}_locators.yaml`
   - ⚠️ CRITICAL: Follow EXACT format from locator_generator_prompt.md
   - ⚠️ Include ALL required fields for every element
   - ⚠️ Generate 3 fallbacks (fallback_1, fallback_2, fallback_3) per element
   - ⚠️ Use confidence scores: 0.95-0.99 (preferred), 0.85-0.89 (fallback_1), 0.80-0.84 (fallback_2), 0.75-0.79 (fallback_3)
   - ⚠️ Set ai_fallback: "disabled" for all elements
   - ⚠️ Complete all 4 attributes: id, name, text, is_hidden
   - ⚠️ **SKIP SVG decorative elements**: No map_region_path_*, Path_*, individual <path>, <circle>, <rect> elements
{{ step_base + 4 }}. **Validate YAML**: Before proceeding, verify the file matches the template format exactly
   - Check root key is `locators:` (not a list)
   - Verify every element has: element_type, ai_fallback, element_desc, preferred, fallbacks (with 3 entries), attributes (4 fields)
   - Confirm no decorative SVG path locators exist
{% endfor %}

## Step 2: Consolidate Chunk Locators

1. Call `consolidate_all_chunks()` from `src/services/locator_extractor.py`  
   - Parameters:  
    - `page_object_directory`: `os.path.join(root_dir, 'page-object')` (path to the page-object directory)  
    - `url` (mandatory): `iteration_{{ iteration_num }}_locators`

## Step 3: Backup Processed Chunks

1. **Move the processed chunks**:  
   Move the {% for chunk_num in chunks_to_process %}`page-object/chunk_{{ chunk_num }}_locators.yaml`{% if not loop.last %}, {% endif %}{% endfor %} to the path `yamlGeneration/Temp_DOM/Chunks_Backup`

## Completion Status

- ✓ Chunks {{ chunk_start }}{% if chunk_start != chunk_end %}-{{ chunk_end }}{% endif %} processed sequentially ({{ chunks_to_process|length }} total chunk{{ "s" if chunks_to_process|length > 1 else "" }})
- ✓ Individual YAML files created for each chunk ({{ chunks_to_process|join(", ") }})
- ✓ Intermediate consolidation performed (iteration_{{ iteration_num }}_locators.yaml)
- ✓ Processed chunks backed up to yamlGeneration/Temp_DOM/Chunks_Backup

