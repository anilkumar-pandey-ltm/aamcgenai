const path = require('path');
const fs = require('fs');
const reporter = require('cucumber-html-reporter');

function generateHtmlReport() {
  const jsonReportPath = path.resolve(__dirname, '../../test-results/cucumber-report.json');
  const htmlReportPath = path.resolve(__dirname, '../../test-results/cucumber-report.html');

  console.log('🔍 Checking for JSON report at:', jsonReportPath);
  
  if (!fs.existsSync(jsonReportPath)) {
    console.error('❌ JSON report not found at:', jsonReportPath);
    console.log('📁 Available files in test-results:');
    const testResultsDir = path.dirname(jsonReportPath);
    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir);
      files.forEach(file => console.log('  -', file));
    }
    return;
  }

  // Check if JSON file has content
  const jsonContent = fs.readFileSync(jsonReportPath, 'utf8');
  if (!jsonContent || jsonContent.trim() === '') {
    console.error('❌ JSON report is empty');
    return;
  }

  try {
    // Validate JSON structure
    const jsonData = JSON.parse(jsonContent);
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      console.error('❌ JSON report has invalid structure or no test results');
      return;
    }

    console.log('✅ Valid JSON report found with', jsonData.length, 'feature(s)');
    
    // Clean and validate the JSON data to prevent cucumber-html-reporter errors
    const cleanedData = jsonData.map(feature => {
      const cleanedFeature = {
        ...feature,
        uri: feature.uri || 'unknown-feature.feature',
        elements: (feature.elements || []).map(element => ({
          ...element,
          steps: (element.steps || []).map(step => ({
            ...step,
            match: step.match || { location: 'unknown:0' },
            result: step.result || { status: 'undefined', duration: 0 }
          }))
        }))
      };
      return cleanedFeature;
    });
    
    // Write the cleaned data back to a temp file for report generation
    const tempJsonPath = jsonReportPath + '.temp';
    fs.writeFileSync(tempJsonPath, JSON.stringify(cleanedData, null, 2));
    
    const options = {
      theme: 'bootstrap',
      jsonFile: tempJsonPath,
      output: htmlReportPath,
      reportSuiteAsScenarios: true,
      launchReport: false,
      metadata: {
        "App Version": "1.0.0",
        "Test Environment": process.env.EXECUTION_ENV || "local",
        "Browser": process.env.BROWSER || "chrome",
        "Platform": process.platform,
        "Parallel": "Scenarios",
        "Executed": new Date().toISOString()
      }
    };

    reporter.generate(options);
    
    // Clean up temp file
    if (fs.existsSync(tempJsonPath)) {
      fs.unlinkSync(tempJsonPath);
    }
    
    console.log('✅ HTML Report successfully generated at:', htmlReportPath);
    
    // Display summary
    let totalScenarios = 0;
    let passedScenarios = 0;
    jsonData.forEach(feature => {
      if (feature.elements) {
        feature.elements.forEach(scenario => {
          totalScenarios++;
          if (scenario.steps && scenario.steps.every(step => step.result && step.result.status === 'passed')) {
            passedScenarios++;
          }
        });
      }
    });
    
    console.log(`📊 Test Summary: ${passedScenarios}/${totalScenarios} scenarios passed`);
    
  } catch (error) {
    console.error('❌ Error generating HTML report:', error);
    console.error('JSON content preview:', jsonContent.substring(0, 200) + '...');
  }
}

// Run if called directly
if (require.main === module) {
  generateHtmlReport();
}

module.exports = { generateHtmlReport };