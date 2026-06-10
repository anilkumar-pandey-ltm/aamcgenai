genai-test-framework/
│
├── src/
│   ├── core/
│   │   ├── mcp_client.py           # MCP server client implementation
│   │   ├── copilot_integration.py  # GitHub Copilot API integration
│   │   ├── prompt_manager.py       # Prompt template management
│   │   └── orchestrator.py         # Main workflow orchestration
│   │
│   ├── story_fetcher/
│   │   ├── __init__.py
│   │   ├── fetcher.py              # Story fetching logic
│   │   ├── parser.py               # Story parsing/formatting
│   │   └── validator.py            # Story validation rules
│   │
│   ├── prompt_engine/
│   │   ├── __init__.py
│   │   ├── domain_context.py       # Domain-specific context builder
│   │   ├── test_design_techniques.py # Test design technique prompts
│   │   └── prompt_builder.py       # Dynamic prompt construction
│   │
│   ├── test_generator/
│   │   ├── __init__.py
│   │   ├── generator.py            # Test case generation logic
│   │   ├── formatter.py            # Output formatting
│   │   └── validator.py            # Test case validation
│   │
│   └── utils/
│       ├── __init__.py
│       ├── file_handler.py         # File I/O operations
│       ├── logger.py               # Logging configuration
│       └── config_loader.py        # Configuration management
│
├── config/
│   ├── app_config.yaml             # Application settings
│   ├── mcp_config.yaml             # MCP server configuration
│   ├── copilot_config.yaml         # Copilot settings
│   └── prompts/
│       ├── domain_contexts/        # Domain-specific prompts
│       │   ├── ecommerce.yaml
│       │   ├── banking.yaml
│       │   └── healthcare.yaml
│       └── test_techniques/        # Test design technique prompts
│           ├── boundary_value.yaml
│           ├── equivalence_partition.yaml
│           ├── decision_table.yaml
│           └── state_transition.yaml
│
├── data/
│   ├── stories/
│   │   ├── raw/                    # Fetched raw stories
│   │   ├── processed/              # Processed/parsed stories
│   │   └── archive/                # Archived stories
│   │
│   └── test_cases/
│       ├── generated/              # Generated test cases
│       ├── reviewed/               # Human-reviewed test cases
│       └── templates/              # Test case templates
│
├── prompts/
│   ├── system_prompts/             # System-level prompts
│   ├── story_prompts/              # Story-specific prompts
│   └── generation_prompts/         # Test generation prompts
│
├── tests/
│   ├── unit/
│   │   ├── test_mcp_client.py
│   │   ├── test_copilot_integration.py
│   │   └── test_prompt_builder.py
│   │
│   ├── integration/
│   │   ├── test_story_to_testcase_flow.py
│   │   └── test_end_to_end.py
│   │
│   └── fixtures/
│       ├── sample_stories.json
│       └── expected_outputs.json
│
├── docs/
│   ├── architecture.md             # System architecture
│   ├── setup.md                    # Setup instructions
│   ├── api_reference.md            # API documentation
│   └── examples/                   # Usage examples
│       ├── basic_usage.md
│       └── advanced_scenarios.md
│
├── scripts/
│   ├── setup.sh                    # Environment setup
│   ├── fetch_stories.py            # Story fetching script
│   └── generate_tests.py          # Test generation script
│
├── .env.example                    # Environment variables template
├── .gitignore
├── requirements.txt                # Python dependencies
├── setup.py                        # Package setup
├── README.md                       # Project documentation
└── main.py                         # Application entry point




Key Components Explanation:
1. Core Module: Central components for MCP client, Copilot integration, and workflow orchestration
2. Story Fetcher: Handles fetching stories from MCP server with validation
3. Prompt Engine: Manages domain contexts and test design technique prompts for dynamic generation
4. Test Generator: Processes prompts through Copilot and generates test cases
5. Config Directory: Centralized configuration with separate files for different concerns and reusable prompt templates
6. Data Directory: Organized storage for stories (raw → processed) and test cases (generated → reviewed)
7. Prompts Directory: Repository of all prompt templates organized by category
This structure provides:

Separation of concerns for maintainability
Scalability for adding new domains/techniques
Clear data flow from story fetching to test generation
Configuration flexibility without code changes
Testing support with dedicated test directories


genai-test-framework/
│
├── .github/
│   ├── workflows/
│   │   ├── fetch-stories.yml           # Workflow to fetch stories from MCP
│   │   ├── generate-tests.yml          # Workflow to generate test cases
│   │   ├── validate-tests.yml          # Workflow to validate generated tests
│   │   └── ci-cd.yml                   # Main CI/CD pipeline
│   │
│   ├── copilot/
│   │   ├── instructions.md             # GitHub Copilot instructions
│   │   └── chat-instructions.md        # Copilot Chat specific instructions
│   │
│   ├── prompts/
│   │   ├── story_analysis/
│   │   │   ├── parse_story.md          # Prompt for story parsing
│   │   │   ├── extract_acceptance_criteria.md
│   │   │   └── identify_test_scenarios.md
│   │   │
│   │   ├── domain_contexts/
│   │   │   ├── ecommerce_context.md
│   │   │   ├── banking_context.md
│   │   │   ├── healthcare_context.md
│   │   │   └── insurance_context.md
│   │   │
│   │   ├── test_techniques/
│   │   │   ├── boundary_value_analysis.md
│   │   │   ├── equivalence_partitioning.md
│   │   │   ├── decision_table.md
│   │   │   ├── state_transition.md
│   │   │   ├── pairwise_testing.md
│   │   │   └── exploratory_testing.md
│   │   │
│   │   ├── test_generation/
│   │   │   ├── unit_test_template.md
│   │   │   ├── integration_test_template.md
│   │   │   ├── e2e_test_template.md
│   │   │   └── api_test_template.md
│   │   │
│   │   └── quality_checks/
│   │       ├── test_coverage_analysis.md
│   │       ├── test_quality_review.md
│   │       └── edge_case_identification.md
│   │
│   └── ISSUE_TEMPLATE/
│       ├── story_template.md           # Template for story issues
│       └── test_case_review.md         # Template for test review
│
├── src/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── mcp_client.py               # MCP server client implementation
│   │   ├── copilot_integration.py      # GitHub Copilot API integration
│   │   ├── prompt_manager.py           # Prompt template management
│   │   ├── orchestrator.py             # Main workflow orchestration
│   │   └── github_client.py            # GitHub API client
│   │
│   ├── story_fetcher/
│   │   ├── __init__.py
│   │   ├── fetcher.py                  # Story fetching logic
│   │   ├── parser.py                   # Story parsing/formatting
│   │   ├── validator.py                # Story validation rules
│   │   └── enricher.py                 # Story enrichment with context
│   │
│   ├── prompt_engine/
│   │   ├── __init__.py
│   │   ├── domain_context_loader.py    # Load domain context from .github
│   │   ├── technique_loader.py         # Load test techniques from .github
│   │   ├── prompt_builder.py           # Dynamic prompt construction
│   │   └── prompt_combiner.py          # Combine multiple prompt sources
│   │
│   ├── test_generator/
│   │   ├── __init__.py
│   │   ├── generator.py                # Test case generation logic
│   │   ├── formatter.py                # Output formatting
│   │   ├── validator.py                # Test case validation
│   │   └── enhancer.py                 # Test enhancement with Copilot
│   │
│   └── utils/
│       ├── __init__.py
│       ├── file_handler.py             # File I/O operations
│       ├── logger.py                   # Logging configuration
│       ├── config_loader.py            # Configuration management
│       └── prompt_loader.py            # Load prompts from .github
│
├── config/
│   ├── app_config.yaml                 # Application settings
│   ├── mcp_config.yaml                 # MCP server configuration
│   ├── copilot_config.yaml             # Copilot settings
│   ├── workflow_config.yaml            # Workflow configurations
│   └── domains/
│       ├── domain_mapping.yaml         # Map stories to domains
│       └── technique_mapping.yaml      # Map scenarios to techniques
│
├── data/
│   ├── stories/
│   │   ├── raw/                        # Fetched raw stories from MCP
│   │   ├── processed/                  # Processed/parsed stories
│   │   ├── enriched/                   # Stories with domain context
│   │   └── archive/                    # Archived stories
│   │
│   ├── test_cases/
│   │   ├── generated/                  # Generated test cases
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   ├── e2e/
│   │   │   └── api/
│   │   ├── reviewed/                   # Human-reviewed test cases
│   │   ├── approved/                   # Approved test cases
│   │   └── templates/                  # Test case templates
│   │
│   └── reports/
│       ├── generation_logs/            # Test generation logs
│       ├── coverage_reports/           # Coverage analysis
│       └── quality_metrics/            # Quality metrics
│
├── tests/
│   ├── unit/
│   │   ├── test_mcp_client.py
│   │   ├── test_copilot_integration.py
│   │   ├── test_prompt_builder.py
│   │   └── test_story_parser.py
│   │
│   ├── integration/
│   │   ├── test_story_to_testcase_flow.py
│   │   ├── test_prompt_workflow.py
│   │   └── test_end_to_end.py
│   │
│   └── fixtures/
│       ├── sample_stories.json
│       ├── expected_outputs.json
│       └── mock_prompts/
│
├── docs/
│   ├── architecture.md                 # System architecture
│   ├── setup.md                        # Setup instructions
│   ├── workflow_guide.md               # GitHub workflow guide
│   ├── prompt_engineering.md           # Prompt creation guidelines
│   ├── api_reference.md                # API documentation
│   ├── mcp_integration.md              # MCP server integration guide
│   └── examples/
│       ├── basic_usage.md
│       ├── advanced_scenarios.md
│       └── custom_workflows.md
│
├── scripts/
│   ├── setup.sh                        # Environment setup
│   ├── fetch_stories.py                # Story fetching script
│   ├── generate_tests.py               # Test generation script
│   ├── sync_prompts.py                 # Sync prompts from .github
│   └── validate_structure.py           # Validate folder structure
│
├── .env.example                        # Environment variables template
├── .gitignore
├── .copilotignore                      # Files to ignore for Copilot
├── requirements.txt                    # Python dependencies
├── setup.py                            # Package setup
├── README.md                           # Project documentation
└── main.py                             # Application entry point