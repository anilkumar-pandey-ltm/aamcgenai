import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

const logger = Logger.getInstance();

interface ResultsDirectoryInfo {
  totalFiles: number;
  totalSize: number;
  directories: Record<string, { fileCount: number; totalSize: number }>;

  cucumberReportExists: boolean;
  cucumberReportSize: number;
}

export class TestResultsCleanup {
  private static instance: TestResultsCleanup;
  private testResultsDir = path.resolve(process.cwd(), 'test-results');

  public static getInstance(): TestResultsCleanup {
    if (!TestResultsCleanup.instance) {
      TestResultsCleanup.instance = new TestResultsCleanup();
    }
    return TestResultsCleanup.instance;
  }

  /**
   * Clean up test results before starting new execution
   */
  public async cleanupBeforeExecution(): Promise<void> {
    try {
      logger.info('🧹 Cleaning up previous test results...');
      
      const itemsToClean = [
        'cucumber-report.json',
        'cucumber-report.html',
        'screenshots',
        'videos',
        'logs'
      ];

      let cleanedItems = 0;

      for (const item of itemsToClean) {
        const itemPath = path.join(this.testResultsDir, item);
        
        if (fs.existsSync(itemPath)) {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            await this.cleanDirectory(itemPath);
            cleanedItems++;
          } else {
            fs.unlinkSync(itemPath);
            cleanedItems++;
            logger.debug(`Removed file: ${item}`);
          }
        }
      }

      if (cleanedItems > 0) {
        logger.success(`✅ Cleaned up ${cleanedItems} previous test result items`);
      } else {
        logger.debug('No previous test results found to clean');
      }

      // Ensure test-results directory and subdirectories exist
      this.ensureDirectoriesExist();

    } catch (error) {
      logger.warn('Warning during test results cleanup:', error);
      // Don't fail the test execution due to cleanup issues
    }
  }

  /**
   * Clean up old test results (keep recent ones)
   */
  public async cleanupOldResults(daysToKeep: number = 7): Promise<void> {
    try {
      logger.info(`🧹 Cleaning up test results older than ${daysToKeep} days...`);
      
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      const directories = ['screenshots', 'videos', 'logs'];
      
      let totalCleaned = 0;

      for (const dir of directories) {
        const dirPath = path.join(this.testResultsDir, dir);
        if (fs.existsSync(dirPath)) {
          const cleaned = await this.cleanOldFilesInDirectory(dirPath, cutoffTime);
          totalCleaned += cleaned;
        }
      }

      if (totalCleaned > 0) {
        logger.success(`✅ Cleaned up ${totalCleaned} old files`);
      }

    } catch (error) {
      logger.warn('Warning during old results cleanup:', error);
    }
  }

  /**
   * Clean directory contents but keep the directory
   */
  private async cleanDirectory(dirPath: string): Promise<void> {
    try {
      const files = fs.readdirSync(dirPath);
      let removedCount = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          await this.removeDirectoryRecursive(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
        removedCount++;
      }

      if (removedCount > 0) {
        logger.debug(`Cleaned directory: ${path.basename(dirPath)} (${removedCount} items)`);
      }
    } catch (error) {
      logger.warn(`Error cleaning directory ${dirPath}:`, error);
    }
  }

  /**
   * Remove directory and all its contents
   */
  private async removeDirectoryRecursive(dirPath: string): Promise<void> {
    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          await this.removeDirectoryRecursive(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }

      fs.rmdirSync(dirPath);
    } catch (error) {
      logger.warn(`Error removing directory ${dirPath}:`, error);
    }
  }

  /**
   * Clean old files in a directory based on modification time
   */
  private async cleanOldFilesInDirectory(dirPath: string, cutoffTime: number): Promise<number> {
    try {
      const files = fs.readdirSync(dirPath);
      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          if (stats.isDirectory()) {
            await this.removeDirectoryRecursive(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      logger.warn(`Error cleaning old files in ${dirPath}:`, error);
      return 0;
    }
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectoriesExist(): void {
    const requiredDirs = [
      this.testResultsDir,
      path.join(this.testResultsDir, 'screenshots'),
      path.join(this.testResultsDir, 'videos'),
      path.join(this.testResultsDir, 'logs')
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.debug(`Created directory: ${path.relative(process.cwd(), dir)}`);
      }
    }
  }

  /**
   * Get current test results directory size and file count
   */
  private getResultsDirectoryInfo(): ResultsDirectoryInfo {
    const resultsDir = path.join(process.cwd(), 'test-results');
    const info: ResultsDirectoryInfo = {
      totalFiles: 0,
      totalSize: 0,
      directories: {},
      cucumberReportExists: false,
      cucumberReportSize: 0
    };

    try {
      if (!fs.existsSync(resultsDir)) {
        return info;
      }

      const items = fs.readdirSync(resultsDir);
      
      for (const item of items) {
        const itemPath = path.join(resultsDir, item);
        
        try {
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            const dirInfo = this.getDirectoryInfo(itemPath);
            info.directories[item] = { fileCount: dirInfo.files, totalSize: dirInfo.size };
            info.totalFiles += dirInfo.files;
            info.totalSize += dirInfo.size;
          } else {
            info.totalFiles++;
            info.totalSize += stats.size;
            
            // Check for cucumber report specifically
            if (item === 'cucumber-report.json') {
              info.cucumberReportExists = true;
              info.cucumberReportSize = stats.size;
            }
          }
        } catch (statError) {
          // Skip files that can't be accessed due to permissions
          console.log(`⚠️  Skipping inaccessible file: ${item}`);
          continue;
        }
      }
    } catch (error) {
      console.error('⚠️  Error reading results directory:', error);
    }

    return info;
  }

  /**
   * Get information about a specific directory
   */
  private getDirectoryInfo(dirPath: string): { size: number; files: number } {
    let size = 0;
    let files = 0;

    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isFile()) {
          size += stats.size;
          files++;
        } else if (stats.isDirectory()) {
          const subDirInfo = this.getDirectoryInfo(itemPath);
          size += subDirInfo.size;
          files += subDirInfo.files;
        }
      }
    } catch (error) {
      logger.warn(`Error reading directory ${dirPath}:`, error);
    }

    return { size, files };
  }

  /**
   * Format file size in human readable format
   */
  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Display current test results directory status
   */
  public displayResultsStatus(): void {
    const info = this.getResultsDirectoryInfo();
    
    if (info.totalFiles === 0) {
      logger.info('📁 Test results directory is clean');
      return;
    }

    logger.info(`📁 Test results directory: ${info.totalFiles} files, ${TestResultsCleanup.formatFileSize(info.totalSize)}`);
    
    for (const [dir, dirInfo] of Object.entries(info.directories)) {
      if (dirInfo.fileCount > 0) {
        logger.info(`   ${dir}: ${dirInfo.fileCount} files, ${TestResultsCleanup.formatFileSize(dirInfo.totalSize)}`);
      }
    }
  }
}
