import { BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { getConfig } from './configUtility';

const logger = Logger.getInstance();

interface VideoRecording {
  tempPath: string;
  startTime: number;
}

export class VideoRecordingManager {
  private static instance: VideoRecordingManager;
  private videoDirectory: string = '';
  private recordings = new Map<BrowserContext, VideoRecording>();
  private config: any;
  private recordingStartTime: number = 0;
  private currentScenarioName: string = '';

  private constructor() {
    this.config = getConfig();
    this.ensureVideoDirectoryExists();
  }

  public static getInstance(): VideoRecordingManager {
    if (!VideoRecordingManager.instance) {
      VideoRecordingManager.instance = new VideoRecordingManager();
    }
    return VideoRecordingManager.instance;
  }

  public async startVideoRecording(context: BrowserContext, scenarioName: string): Promise<void> {
    // Check if video recording should be enabled based on environment and configuration
    const envVideoSetting = process.env.LOCAL_RECORD_VIDEO;
    const localRecordVideo = this.config.localRecordVideo || 'off';
    
    // Allow video recording if:
    // 1. Environment is local, OR
    // 2. LOCAL_RECORD_VIDEO environment variable is explicitly set, OR
    // 3. recording.enabled is true in config
    const shouldRecord = 
      this.config.execution.environment === 'local' ||
      (envVideoSetting && envVideoSetting !== 'off') ||
      this.config.recording?.enabled;
    
    if (!shouldRecord) {
      logger.debug('Video recording disabled - no local recording setting found');
      return;
    }

    // Check localRecordVideo setting
    const finalRecordingSetting = envVideoSetting || localRecordVideo;
    
    if (finalRecordingSetting === 'off') {
      logger.debug('Video recording disabled via localRecordVideo setting');
      return;
    }

    // Check global recording setting (fallback)
    if (!this.config.recording?.enabled && !envVideoSetting && this.config.execution.environment !== 'local') {
      logger.debug('Video recording disabled via recording.enabled setting');
      return;
    }

    try {
      // Determine recording mode based on configuration
      let recordingMode: 'off' | 'on' | 'retain-on-failure' = 'off';
      
      if (localRecordVideo === 'on') {
        recordingMode = 'on';
      } else if (localRecordVideo === 'failures') {
        recordingMode = 'retain-on-failure';
      } else if (this.config.recording?.enabled) {
        recordingMode = this.config.recording?.mode || 'retain-on-failure';
      }

      // Configure video recording
      const videoOptions = {
        mode: recordingMode as any,
        size: this.parseVideoSize(this.config.recording?.size || '1920x1080')
      };

      logger.debug(`Video recording configured for scenario: ${scenarioName}`);
      logger.debug(`Recording mode: ${recordingMode} (localRecordVideo: ${localRecordVideo})`);

      // Note: Actual video recording setup would be done in browser context setup
      // This is a placeholder for the recording configuration
      
    } catch (error) {
      logger.error('Error starting video recording:', error);
    }
  }

  public async stopVideoRecording(context: BrowserContext, scenarioName: string): Promise<void> {
    if (!this.config.recording?.enabled) {
      return;
    }

    this.recordingStartTime = Date.now();
    logger.info(`🎬 Video recording started for: ${scenarioName}`);
  }

  public async stopRecording(context: BrowserContext, scenarioName: string, testPassed: boolean): Promise<string | null> {
    try {
      const config = this.getVideoRecordingConfig();
      
      if (!config.enabled) {
        logger.debug('📹 Video recording disabled, skipping video processing');
        return null;
      }

      const page = context.pages()[0];
      if (!page) {
        logger.warn('⚠️  No page found in context');
        return null;
      }

      logger.debug(`🎬 Processing video for: ${scenarioName} (${testPassed ? 'PASSED' : 'FAILED'})`);

      // Get the video path from Playwright's video recording
      const video = page.video();
      if (!video) {
        logger.warn('⚠️  No video recording found for this test');
        return null;
      }

      // Let the hook close the context, we just get the video path
      // Don't close the context here - let the caller handle it
      
      // Try to get the video path
      let videoPath: string | null = null;
      try {
        videoPath = await video.path();
      } catch (error) {
        logger.warn('⚠️  Could not get video path before context close, will try after');
      }

      if (!videoPath) {
        logger.warn('⚠️  No video path available');
        return null;
      }

      const sanitizedTestName = scenarioName.replace(/[^a-zA-Z0-9\-_]/g, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const status = testPassed ? 'PASS' : 'FAIL';
      const finalVideoName = `${sanitizedTestName}_${status}_${timestamp}.webm`;
      const finalVideoPath = path.join(this.videoDirectory, finalVideoName);

      // Check recording mode to decide whether to keep the video
      const shouldKeepVideo = this.shouldKeepVideo(config.localRecording, testPassed);
      
      if (shouldKeepVideo) {
        // Store video info to process after context is closed
        const videoInfo = {
          originalPath: videoPath,
          finalPath: finalVideoPath,
          scenarioName: scenarioName,
          testPassed: testPassed
        };
        
        logger.debug(`📹 Video will be processed: ${finalVideoName}`);
        
        // Process video asynchronously after a delay
        setTimeout(async () => {
          await this.processStoredVideo(videoInfo);
        }, 3000);

        return finalVideoPath;
      } else {
        logger.debug(`🗑️  Test passed - video will be discarded (mode: ${config.localRecording})`);
        return null;
      }

    } catch (error) {
      logger.error('❌ Error stopping video recording:', error);
      return null;
    }
  }

  private async processStoredVideo(videoInfo: any): Promise<void> {
    try {
      // Wait for video file to be fully written
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        if (fs.existsSync(videoInfo.originalPath)) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      if (!fs.existsSync(videoInfo.originalPath)) {
        logger.warn(`⚠️  Video file not found after ${maxAttempts} attempts: ${videoInfo.originalPath}`);
        return;
      }

      // Copy the video to permanent location
      fs.copyFileSync(videoInfo.originalPath, videoInfo.finalPath);
      logger.info(`✅ Video saved: ${videoInfo.finalPath}`);
      
      // Clean up temp video file
      setTimeout(() => {
        try {
          if (fs.existsSync(videoInfo.originalPath)) {
            fs.unlinkSync(videoInfo.originalPath);
          }
        } catch (deleteError) {
          logger.debug(`ℹ️  Temp video file will be cleaned up later: ${videoInfo.originalPath}`);
        }
      }, 2000);

    } catch (error) {
      logger.error('❌ Error processing stored video:', error);
    }
  }

  public async processRecordedVideo(context: BrowserContext, testName: string, testPassed: boolean): Promise<string | null> {
    try {
      const videoRecording = this.recordings.get(context);
      if (!videoRecording) {
        logger.warn('⚠️  No video recording found for this test');
        return null;
      }

      // Close the video recording properly
      await context.close();
      
      // Wait a moment for the video file to be fully written
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tempVideoPath = videoRecording.tempPath;
      
      // Check if temp video file exists
      if (!fs.existsSync(tempVideoPath)) {
        logger.error(`❌ Temporary video file not found: ${tempVideoPath}`);
        return null;
      }

      const sanitizedTestName = testName.replace(/[^a-zA-Z0-9\-_]/g, '_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalVideoName = `${sanitizedTestName}_${timestamp}.webm`;
      const finalVideoPath = path.join(this.videoDirectory, finalVideoName);

      try {
        // Copy instead of move to avoid file locking issues
        fs.copyFileSync(tempVideoPath, finalVideoPath);
        logger.success(`✅ Video saved: ${finalVideoPath}`);
        
        // Try to delete temp file after a delay
        setTimeout(() => {
          try {
            if (fs.existsSync(tempVideoPath)) {
              fs.unlinkSync(tempVideoPath);
            }
          } catch (deleteError) {
            logger.debug(`ℹ️  Temp video file will be cleaned up later: ${tempVideoPath}`);
          }
        }, 2000);

        // Remove from recordings map
        this.recordings.delete(context);
        
        return finalVideoPath;

      } catch (copyError) {
        logger.error('❌ Error copying video file:', copyError);
        // Fallback: just leave the temp file and report its location
        logger.info(`ℹ️  Video available at temp location: ${tempVideoPath}`);
        return tempVideoPath;
      }

    } catch (error) {
      logger.error('❌ Error processing recorded video:', error);
      return null;
    }
  }

  public logVideoUrls(info: any): void {
    // Handle BrowserStack video URLs
    if (this.config.execution.environment === 'browserstack') {
      if (info.browserstack) {
        logger.info(`📹 BrowserStack video available at: ${info.browserstack}`);
      }
    }
    if (this.config.execution.environment === 'saucelabs') {
      if (info.saucelabs) {
        logger.info(`📹 SauceLabs video available at: ${info.saucelabs}`);
      }
    }
  }

  private parseVideoSize(sizeString: string): { width: number; height: number } {
    const [width, height] = sizeString.split('x').map(Number);
    return { width: width || 1920, height: height || 1080 };
  }

  private ensureVideoDirectoryExists(): void {
    // Use default directory if not specified in config
    const defaultVideoDir = path.join(process.cwd(), 'test-results', 'videos');
    this.videoDirectory = this.config.recording?.dir ? 
      path.resolve(this.config.recording.dir) : 
      defaultVideoDir;
    
    if (!fs.existsSync(this.videoDirectory)) {
      fs.mkdirSync(this.videoDirectory, { recursive: true });
      logger.debug(`✅ Created video directory: ${this.videoDirectory}`);
    }
  }

  public async cleanupOldVideos(daysOld: number = 7): Promise<void> {
    if (!this.config.recording?.enabled) {
      return;
    }

    try {
      const videoDir = this.config.recording?.dir ? 
        path.resolve(this.config.recording.dir) : 
        path.join(process.cwd(), 'test-results', 'videos');
      
      if (!fs.existsSync(videoDir)) {
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const files = fs.readdirSync(videoDir);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(videoDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info(`🧹 Cleaned up ${deletedCount} old video files (older than ${daysOld} days)`);
      }

    } catch (error) {
      logger.error('Error cleaning up old videos:', error);
    }
  }

  public getVideoRecordingConfig(): any {
    // Provide safe defaults for configuration
    const defaultConfig = {
      execution: { environment: 'local' },
      localRecordVideo: 'off',
      recording: { enabled: false, mode: 'off', dir: 'test-results/videos' }
    };

    const config = this.config || defaultConfig;
    
    // Check environment variable first (highest priority)
    const envVideoSetting = process.env.LOCAL_RECORD_VIDEO;
    const localRecordVideo = envVideoSetting || config.localRecordVideo || 'off';
    
    // Enable recording when:
    // 1. Environment is local and localRecordVideo is not 'off', OR
    // 2. LOCAL_RECORD_VIDEO environment variable is set (regardless of environment), OR
    // 3. recording.enabled is true in config
    const isLocalRecordingEnabled = 
      (config.execution?.environment === 'local' && localRecordVideo !== 'off') ||
      (envVideoSetting && envVideoSetting !== 'off') ||
      config.recording?.enabled;

    logger.debug(`🎬 Video Recording Config:`);
    logger.debug(`   Environment: ${config.execution?.environment}`);
    logger.debug(`   LOCAL_RECORD_VIDEO: ${envVideoSetting}`);
    logger.debug(`   localRecordVideo: ${config.localRecordVideo}`);
    logger.debug(`   Final localRecordVideo: ${localRecordVideo}`);
    logger.debug(`   Recording enabled: ${isLocalRecordingEnabled}`);

    return {
      enabled: isLocalRecordingEnabled,
      localRecording: localRecordVideo,
      mode: config.recording?.mode || 'off',
      directory: config.recording?.dir || 'test-results/videos',
      environment: config.execution?.environment || 'local',
      cloudRecording: ['browserstack', 'saucelabs'].includes(config.execution?.environment || 'local')
    };
  }

  public getRecordingStatus(): any {
    const config = this.getVideoRecordingConfig();
    return {
      enabled: config.enabled,
      environment: config.environment,
      mode: config.mode,
      directory: config.directory,
      localRecording: config.localRecording,
      cloudRecording: config.cloudRecording
    };
  }

  public getVideoRecordingOptions(scenarioName: string): any {
    const config = this.getVideoRecordingConfig();
    
    if (!config.enabled) {
      return {}; // No video recording options if disabled
    }

    // Return Playwright-compatible video recording options
    const videoDir = config.directory || path.join(process.cwd(), 'test-results', 'videos');
    
    // Ensure video directory exists
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
      console.log(`✅ Created video directory: ${videoDir}`);
    }

    // Return the recordVideo property directly so it can be spread into context options
    return {
      recordVideo: {
        dir: videoDir,
        size: this.parseVideoSize(this.config?.recording?.size || '1920x1080')
      }
    };
  }

  public startRecording(scenarioName: string): void {
    try {
      const config = this.getVideoRecordingConfig();
      
      if (!config.enabled) {
        logger.debug(`Video recording disabled for scenario: ${scenarioName}`);
        return;
      }

      this.recordingStartTime = Date.now();
      logger.info(`🎬 Video recording started for: ${scenarioName}`);
      
      // Store scenario name for later use
      this.currentScenarioName = scenarioName;
      
    } catch (error) {
      logger.error('Error starting video recording:', error);
    }
  }

  public getCloudVideoInfo(sessionId?: string): any {
    const config = this.getVideoRecordingConfig();
    
    if (!config.cloudRecording) {
      return null;
    }

    const videoInfo: any = {};

    if (config.environment === 'browserstack' && sessionId) {
      // BrowserStack video URL format
      videoInfo.browserstack = `https://automate.browserstack.com/dashboard/v2/sessions/${sessionId}`;
    }

    if (config.environment === 'saucelabs' && sessionId) {
      // SauceLabs video URL format (this would need actual session details)
      videoInfo.saucelabs = `https://app.saucelabs.com/tests/${sessionId}`;
    }

    return Object.keys(videoInfo).length > 0 ? videoInfo : null;
  }

  private shouldKeepVideo(recordingMode: string, testPassed: boolean): boolean {
    switch (recordingMode) {
      case 'all':
        return true; // Keep all videos
      case 'failures':
        return !testPassed; // Keep only failed test videos
      case 'on':
        return true; // Keep all videos (same as 'all')
      default:
        return false; // Don't keep any videos
    }
  }
}
