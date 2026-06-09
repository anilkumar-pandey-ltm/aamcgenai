const fs = require('fs');
const path = require('path');

class TestResultsCleanup {
  constructor() {
    this.testResultsDir = path.resolve(process.cwd(), 'test-results');
  }

  static getInstance() {
    if (!TestResultsCleanup.instance) {
      TestResultsCleanup.instance = new TestResultsCleanup();
    }
    return TestResultsCleanup.instance;
  }

  async cleanupBeforeExecution() {
    try {
      if (!fs.existsSync(this.testResultsDir)) {
        console.log('✅ No previous test results to clean up');
        return;
      }

      // Create a list of items to clean up
      const itemsToCleanup = [];
      const entries = fs.readdirSync(this.testResultsDir);

      for (const entry of entries) {
        const entryPath = path.join(this.testResultsDir, entry);
        const stat = fs.statSync(entryPath);
        
        if (stat.isDirectory()) {
          // Clean up directory contents
          this.cleanupDirectory(entryPath);
          itemsToCleanup.push(`${entry}/`);
        } else if (entry.endsWith('.json') || entry.endsWith('.html') || entry.endsWith('.xml')) {
          // Remove old report files
          fs.unlinkSync(entryPath);
          itemsToCleanup.push(entry);
        }
      }

      if (itemsToCleanup.length > 0) {
        console.log(`✅ Cleaned up ${itemsToCleanup.length} previous test result items`);
      } else {
        console.log('✅ No test results to clean up');
      }

    } catch (error) {
      console.log('⚠️ Error during cleanup:', error.message);
    }
  }

  cleanupDirectory(dirPath) {
    try {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            this.cleanupDirectory(filePath);
            fs.rmdirSync(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (error) {
      // Ignore errors for individual files/directories
    }
  }

  async cleanupOldResults(daysOld = 7) {
    try {
      if (!fs.existsSync(this.testResultsDir)) {
        console.log('✅ No test results directory found');
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;
      const entries = fs.readdirSync(this.testResultsDir);

      for (const entry of entries) {
        const entryPath = path.join(this.testResultsDir, entry);
        try {
          const stat = fs.statSync(entryPath);
          if (stat.mtime < cutoffDate) {
            if (stat.isDirectory()) {
              this.cleanupDirectory(entryPath);
              fs.rmdirSync(entryPath);
            } else {
              fs.unlinkSync(entryPath);
            }
            deletedCount++;
          }
        } catch (error) {
          // Skip files that can't be processed
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ Cleaned up ${deletedCount} old test result items (older than ${daysOld} days)`);
      } else {
        console.log(`✅ No old test results found (older than ${daysOld} days)`);
      }

    } catch (error) {
      console.log('⚠️ Error during old results cleanup:', error.message);
    }
  }

  displayResultsStatus() {
    try {
      if (!fs.existsSync(this.testResultsDir)) {
        console.log('📁 No test results directory found');
        return;
      }

      const entries = fs.readdirSync(this.testResultsDir);
      console.log(`📁 Test results directory contains ${entries.length} items:`);

      for (const entry of entries) {
        const entryPath = path.join(this.testResultsDir, entry);
        try {
          const stat = fs.statSync(entryPath);
          const size = this.formatFileSize(stat.size);
          const modified = stat.mtime.toISOString().split('T')[0];
          
          if (stat.isDirectory()) {
            const subFiles = fs.readdirSync(entryPath).length;
            console.log(`   📂 ${entry}/ - ${subFiles} files, modified: ${modified}`);
          } else {
            console.log(`   📄 ${entry} - ${size}, modified: ${modified}`);
          }
        } catch (error) {
          console.log(`   ❌ ${entry} - Error reading stats`);
        }
      }

    } catch (error) {
      console.log('⚠️ Error displaying results status:', error.message);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = { TestResultsCleanup };
