# FusionIQ Framework - Documentation Directory

Welcome to the comprehensive documentation for the FusionIQ Test Automation Framework with GitHub Copilot integration.

---

## 🚀 Start Here

### New Users
👉 **[AGENT_DOCUMENTATION_INDEX.md](AGENT_DOCUMENTATION_INDEX.md)** - Complete directory of all 13 agents with usage templates

### What Was Updated
👉 **[UPDATE_SUMMARY.md](UPDATE_SUMMARY.md)** - Recent documentation updates (Feb 24, 2026)

---

## 📚 Documentation Categories

### 🌐 Web Testing

| Guide | Agent | Purpose |
|-------|-------|---------|
| [web-bdd-Test scenarios-generation-guide.md](web-bdd-Test%20scenarios-generation-guide.md) | `@web-BDD_Testscenarios-gen` | Generate BDD feature files from user stories |
| [web-step-definitions-generation-guide.md](web-step-definitions-generation-guide.md) | `@web-step-definitions-generator` | Create Cucumber step definitions |
| [web-page-actions-gen-guide.md](web-page-actions-gen-guide.md) | `@web-page-actions-generator` | Generate page object classes |
| [locator-generation-guide.md](locator-generation-guide.md) | `@page-objects-generator` | Complete locator generation pipeline |

---

### 🔌 API Testing

| Guide | Agent | Purpose |
|-------|-------|---------|
| [api-analyzer-service-guide.md](api-analyzer-service-guide.md) | `@api-analyzer-service` | Parse API docs (Postman/Swagger) into YAML |
| [api-bdd-testscenarios-generation-guide.md](api-bdd-testscenarios-generation-guide.md) | `@api-BDD_Testscenarios-gen` | Generate API BDD test scenarios |
| [api-service-client-generator-guide.md](api-service-client-generator-guide.md) | `@api-service-client-generator` | Create multi-language API service clients |
| [api-stepdef-gen-guide.md](api-stepdef-gen-guide.md) | `@api-step-definitions-generator` | Generate API step definitions |
| [API_REQUEST_BUILDER_GUIDE.md](API_REQUEST_BUILDER_GUIDE.md) | `@api-requestbuilder-gen` | Create HTTP client utilities |

---

### 📊 Test Analysis & Optimization

| Guide | Agent | Purpose |
|-------|-------|---------|
| [COPILOT_IMPACT_ANALYSIS_GUIDE.md](COPILOT_IMPACT_ANALYSIS_GUIDE.md) | `@impact-based-test-analysis` | Prioritize test cases (85-95% reduction) |
| [IMPACT_ANALYSIS_GUIDE.md](IMPACT_ANALYSIS_GUIDE.md) | `@impact-based-test-analysis` | Alternative impact analysis guide |

---

### 🎥 Multimedia Analysis

| Guide | Agent | Purpose |
|-------|-------|---------|
| [video_processor_analyzer_guide.md](video_processor_analyzer_guide.md) | `@video-processor-analyzer` | Convert videos to test documentation |

---

### 🔧 General & Utilities

| Guide | Purpose |
|-------|---------|
| [framework_arch.md](framework_arch.md) | Framework architecture overview |

---

## 🎯 Common Use Cases

### "I want to automate a web application"

**Complete Workflow:**
```
1. Extract locators:     @page-objects-generator
2. Generate page objects: @web-page-actions-generator
3. Create BDD scenarios:  @web-BDD_Testscenarios-gen
4. Generate step defs:    @web-step-definitions-generator
```

**Guides**: [Locator Guide](locator-generation-guide.md) → [Page Actions Guide](web-page-actions-gen-guide.md) → [Web BDD Guide](web-bdd-Test%20scenarios-generation-guide.md) → [Step Defs Guide](web-step-definitions-generation-guide.md)

---

### "I want to automate an API"

**Complete Workflow:**
```
1. Analyze API docs:      @api-analyzer-service
2. Generate BDD tests:    @api-BDD_Testscenarios-gen
3. Create service client: @api-service-client-generator
4. Generate step defs:    @api-step-definitions-generator
```

**Guides**: [API Analyzer Guide](api-analyzer-service-guide.md) → [API BDD Guide](api-bdd-testscenarios-generation-guide.md) → [Service Client Guide](api-service-client-generator-guide.md) → [API Step Defs Guide](api-stepdef-gen-guide.md)

---

### "I have a 30-minute product demo video and need UAT test cases"

**Workflow:**
```
1. Chunk video (FFmpeg):   5-minute segments
2. Analyze each chunk:     @video-processor-analyzer
3. Generate test cases:    @web-BDD_Testscenarios-gen
```

**Guide**: [Video Processor Guide](video_processor_analyzer_guide.md) - See "Video Chunking Strategy" section

---

### "I need to reduce my test suite for a change request"

**Workflow:**
```
1. Create change_requests.json with CR details
2. Run impact analysis:   @impact-based-test-analysis
3. Execute prioritized tests (85-95% reduction)
```

**Guide**: [Impact Analysis Guide](COPILOT_IMPACT_ANALYSIS_GUIDE.md)

---

## 📖 Documentation Structure

```
docs/
│
├── 🚀 Quick Start & Reference
│   ├── AGENT_DOCUMENTATION_INDEX.md       ← START HERE (all agents + usage templates)
│   ├── UPDATE_SUMMARY.md                  ← What's new (Feb 2026)
│   └── README.md                          ← This file
│
├── 🌐 Web Testing Guides (4 files)
│   ├── web-bdd-Test scenarios-generation-guide.md
│   ├── web-step-definitions-generation-guide.md
│   ├── web-page-actions-gen-guide.md
│   └── locator-generation-guide.md
│
├── 🔌 API Testing Guides (5 files)
│   ├── api-analyzer-service-guide.md
│   ├── api-bdd-testscenarios-generation-guide.md
│   ├── api-service-client-generator-guide.md
│   ├── api-stepdef-gen-guide.md
│   └── API_REQUEST_BUILDER_GUIDE.md
│
├── 📊 Analysis & Optimization (3 files)
│   ├── COPILOT_IMPACT_ANALYSIS_GUIDE.md
│   ├── IMPACT_ANALYSIS_GUIDE.md
│   └── video_processor_analyzer_guide.md
│
└── 🔧 General Guides (1 file)
    └── framework_arch.md
```

**Total**: 17 documentation files (excludes duplicate/copy files)

---

## 🔍 Quick Agent Lookup

### By Purpose

| I Want To... | Use Agent | Guide |
|--------------|-----------|-------|
| Generate web BDD tests | `@web-BDD_Testscenarios-gen` | [Link](web-bdd-Test%20scenarios-generation-guide.md) |
| Generate API BDD tests | `@api-BDD_Testscenarios-gen` | [Link](api-bdd-testscenarios-generation-guide.md) |
| Create page objects | `@web-page-actions-generator` | [Link](web-page-actions-gen-guide.md) |
| Extract UI locators | `@locator-generator-*` | [Link](locator-generation-guide.md) |
| Parse API docs | `@api-analyzer-service` | [Link](api-analyzer-service-guide.md) |
| Prioritize tests | `@impact-based-test-analysis` | [Link](COPILOT_IMPACT_ANALYSIS_GUIDE.md) |
| Analyze videos | `@video-processor-analyzer` | [Link](video_processor_analyzer_guide.md) |

### By Input Type

| I Have... | Use Agent | Guide |
|-----------|-----------|-------|
| User story | `@web-BDD_Testscenarios-gen` | [Link](web-bdd-Test%20scenarios-generation-guide.md) |
| Postman collection | `@api-analyzer-service` | [Link](api-analyzer-service-guide.md) |
| Swagger/OpenAPI | `@api-analyzer-service` | [Link](api-analyzer-service-guide.md) |
| Web page URL | `@locator-generator-step1` | [Link](locator-generation-guide.md) |
| YAML locators | `@web-page-actions-generator` | [Link](web-page-actions-gen-guide.md) |
| Feature file | `@web/api-step-definitions-generator` | [Web](web-step-definitions-generation-guide.md) / [API](api-stepdef-gen-guide.md) |
| Video recording | `@video-processor-analyzer` | [Link](video_processor_analyzer_guide.md) |
| Change request | `@impact-based-test-analysis` | [Link](COPILOT_IMPACT_ANALYSIS_GUIDE.md) |

---

## 💡 Documentation Features

Every guide now includes:

- ✅ **Agent Information Section** - Clear activation instructions
- ✅ **Quick Start Examples** - Copy-paste ready prompts
- ✅ **Prerequisites Checklist** - What you need before starting
- ✅ **Sample Prompts Library** - Multiple usage examples
- ✅ **Troubleshooting** - Common issues and solutions
- ✅ **Best Practices** - Tips for optimal results

---

## 🛠️ Prerequisites

### For Most Agents

**Required**:
- Python 3.8+
- GitHub Copilot enabled in VS Code
- Virtual environment activated

**MCP Servers** (for most agents):
```powershell
# Terminal 1
python src/mcp/mcp_context_server.py

# Terminal 2
python src/mcp/mcp_automation_server.py
```

**Configuration**:
- `copilot-agent.paths.yaml` - Path configuration
- `config.json` - Service configuration

---

## 🆘 Getting Help

### Quick Help

1. **"I'm new here"** → Read [AGENT_DOCUMENTATION_INDEX.md](AGENT_DOCUMENTATION_INDEX.md)
2. **"Which agent do I need?"** → Check [AGENT_DOCUMENTATION_INDEX.md](AGENT_DOCUMENTATION_INDEX.md)
3. **"How do I use agent X?"** → Find the guide in the tables above
4. **"My agent isn't working"** → See troubleshooting section in specific agent guide

### Detailed Help

- **Agent-specific issues**: Open the specific agent guide and check the "Troubleshooting" section
- **Framework architecture**: See [framework_arch.md](framework_arch.md)
- **Configuration issues**: Review prerequisites in individual guides

---

## 📊 Documentation Statistics

- **Total Guides**: 17
- **Agent Guides**: 13
- **Reference Docs**: 4
- **Total Agents**: 16
- **Example Prompts**: 50+
- **Complete Workflows**: 4

---

## 🔄 Recent Updates

**February 24, 2026**:
- ✅ All guides updated with agent information sections
- ✅ Created master agent index ([AGENT_DOCUMENTATION_INDEX.md](AGENT_DOCUMENTATION_INDEX.md))
- ✅ Standardized documentation structure
- ✅ Added video chunking strategy (30-min videos)
- ✅ Added comprehensive usage templates for all agents

See [UPDATE_SUMMARY.md](UPDATE_SUMMARY.md) for complete details.

---

## 📚 Additional Resources

### Skills Library
- `.github/skills/*.md` - Reusable patterns and best practices

### Agent Definitions
- `.github/agents/*.agent.md` - Complete agent specifications

### Configuration
- `copilot-agent.paths.yaml` - Path configuration
- `config.json` - Service configuration
- `.github/instructions/copilot-instructions.md` - Copilot behavior configuration

---

## 🎯 Next Steps

### For New Users
1. Review [AGENT_DOCUMENTATION_INDEX.md](AGENT_DOCUMENTATION_INDEX.md) for agent usage templates
2. Review prerequisites in individual guides
3. Start with top 5 most common agents
4. Try a complete workflow

### For Experienced Users
1. Bookmark [AGENT_DOCUMENTATION_INDEX.md](AGENT_DOCUMENTATION_INDEX.md)
2. Explore new agents you haven't tried
3. Review complete workflows for efficiency
4. Share feedback for documentation improvements

---

**Happy Testing! 🚀**

**Last Updated**: February 24, 2026  
**Version**: 1.0  
**Maintained By**: FusionIQ Framework Team
