import { Logger } from './logger';

const logger = Logger.getInstance();

interface SessionInfo {
  sessionId: string;
  workerId: string;
  scenarioName: string;
  timestamp: number;
  buildName: string;
}

/**
 * Session Tracker to avoid race conditions in parallel execution
 * Each worker tracks its own sessions independently
 */
export class SessionTracker {
  private static instance: SessionTracker;
  private sessions: Map<string, SessionInfo> = new Map();
  private workerId: string;

  private constructor() {
    this.workerId = process.env.CUCUMBER_WORKER_ID || process.env.JEST_WORKER_ID || '0';
    logger.debug(`SessionTracker initialized for worker: ${this.workerId}`);
  }

  public static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }

  /**
   * Register a new session for this worker
   */
  public registerSession(sessionId: string, scenarioName: string, buildName: string): void {
    const sessionInfo: SessionInfo = {
      sessionId,
      workerId: this.workerId,
      scenarioName,
      timestamp: Date.now(),
      buildName
    };
    
    this.sessions.set(sessionId, sessionInfo);
    logger.debug(`Session registered: ${sessionId} for scenario: ${scenarioName}`);
  }

  /**
   * Get the most recent session for this worker
   */
  public getMostRecentSessionForWorker(): SessionInfo | null {
    const workerSessions = Array.from(this.sessions.values())
      .filter(session => session.workerId === this.workerId)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return workerSessions.length > 0 ? workerSessions[0] : null;
  }

  /**
   * Get session by scenario name for this worker
   */
  public getSessionByScenario(scenarioName: string): SessionInfo | null {
    const sessions = Array.from(this.sessions.values());
    return sessions.find(session => 
      session.workerId === this.workerId && 
      session.scenarioName === scenarioName
    ) || null;
  }

  /**
   * Clean up old sessions (older than 10 minutes)
   */
  public cleanupOldSessions(): void {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const toDelete: string[] = [];
    
    this.sessions.forEach((session, sessionId) => {
      if (session.timestamp < tenMinutesAgo) {
        toDelete.push(sessionId);
      }
    });
    
    toDelete.forEach(sessionId => {
      this.sessions.delete(sessionId);
      logger.debug(`Cleaned up old session: ${sessionId}`);
    });
  }

  /**
   * Get current worker ID
   */
  public getWorkerId(): string {
    return this.workerId;
  }

  /**
   * Get all sessions for debugging
   */
  public getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }
}
