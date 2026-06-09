// Utility to mark BrowserStack session status using REST API
import fetch from 'node-fetch';

/**
 * Set BrowserStack session name using Test Annotation API
 */
export async function setBrowserStackSessionName({
  sessionId,
  testName,
  username,
  accessKey
}: {
  sessionId: string;
  testName: string;
  username: string;
  accessKey: string;
}): Promise<void> {
  const url = `https://api.browserstack.com/automate/sessions/${sessionId}.json`;
  const body = JSON.stringify({ name: testName });
  const auth = Buffer.from(`${username}:${accessKey}`).toString('base64');
  
  console.log(`🏷️ Setting BrowserStack session ${sessionId} name to: "${testName}"`);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to set BrowserStack session name: ${response.status} ${response.statusText} - ${text}`);
  }
  
  const responseData = await response.text();
  console.log(`✅ BrowserStack session name set successfully: ${responseData}`);
}

/**
 * Advanced BrowserStack Test Annotation - Sets name, status, and reason in one call
 */
export async function setBrowserStackTestAnnotation({
  sessionId,
  testName,
  status,
  reason,
  username,
  accessKey
}: {
  sessionId: string;
  testName: string;
  status: 'passed' | 'failed' | 'error';
  reason?: string;
  username: string;
  accessKey: string;
}): Promise<void> {
  const url = `https://api.browserstack.com/automate/sessions/${sessionId}.json`;
  
  // Combine name and status for better tracking
  const annotatedName = `${testName} - [${status.toUpperCase()}]`;
  
  const body = JSON.stringify({ 
    name: annotatedName,
    status,
    reason: reason || (status === 'failed' ? 'Test failed' : 'Test passed')
  });
  
  const auth = Buffer.from(`${username}:${accessKey}`).toString('base64');
  
  console.log(`🏷️ Setting BrowserStack test annotation: "${annotatedName}" (${status})`);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to set BrowserStack test annotation: ${response.status} ${response.statusText} - ${text}`);
  }
  
  const responseData = await response.text();
  console.log(`✅ BrowserStack test annotation set successfully: ${responseData}`);
}

export async function markBrowserStackSessionStatus({
  sessionId,
  status,
  reason,
  username,
  accessKey
}: {
  sessionId: string;
  status: 'passed' | 'failed';
  reason?: string;
  username: string;
  accessKey: string;
}): Promise<void> {
  const url = `https://api.browserstack.com/automate/sessions/${sessionId}.json`;
  const body = JSON.stringify({ 
    status, 
    reason: reason || (status === 'failed' ? 'Test failed' : 'Test passed')
  });
  const auth = Buffer.from(`${username}:${accessKey}`).toString('base64');
  
  console.log(`🔄 Updating BrowserStack session ${sessionId} status to: ${status}`);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update BrowserStack session status: ${response.status} ${response.statusText} - ${text}`);
  }
  
  const responseData = await response.text();
  console.log(`✅ BrowserStack session status updated successfully: ${responseData}`);
}

export async function findRecentBrowserStackSession(options: {
  username: string;
  accessKey: string;
  buildName?: string;
  testName?: string;
  maxAgeMinutes?: number;
}): Promise<string | null> {
  const { username, accessKey, buildName, testName, maxAgeMinutes = 10 } = options;
  const auth = Buffer.from(`${username}:${accessKey}`).toString('base64');
    try {
    console.log('🔍 Searching for BrowserStack sessions...');
      // Get recent builds
    const buildsUrl = 'https://api.browserstack.com/automate/builds.json?limit=10';
    const buildsResponse = await fetch(buildsUrl, {
      headers: { 'Authorization': `Basic ${auth}` },
      timeout: 10000 // 10 second timeout
    });
    
    if (!buildsResponse.ok) {
      throw new Error(`Failed to fetch builds: ${buildsResponse.status} ${buildsResponse.statusText}`);
    }
    
    const builds = await buildsResponse.json() as any[];
    console.log(`Found ${builds.length} recent builds`);
    
    const cutoffTime = new Date(Date.now() - (maxAgeMinutes * 60 * 1000));
    
    // Search through builds for matching sessions
    for (const build of builds) {
      const buildData = build.automation_build || build;
      const buildId = buildData.hashed_id;
      
      // If buildName is specified, only check matching builds
      if (buildName && buildData.name !== buildName) {
        continue;
      }
      
      if (!buildId) {
        console.log(`Skipping build without ID: ${buildData.name}`);
        continue;
      }
      
      console.log(`Checking build: ${buildData.name} (${buildId})`);
      
      try {        // Get sessions for this build
        const sessionsUrl = `https://api.browserstack.com/automate/builds/${buildId}/sessions.json`;
        const sessionsResponse = await fetch(sessionsUrl, {
          headers: { 'Authorization': `Basic ${auth}` },
          timeout: 10000 // 10 second timeout
        });
        
        if (!sessionsResponse.ok) {
          console.log(`Failed to fetch sessions for build ${buildId}: ${sessionsResponse.status}`);
          continue;
        }
        
        const sessions = await sessionsResponse.json() as any[];
        
        if (sessions && sessions.length > 0) {
          // Sort sessions by creation time (most recent first)
          const sortedSessions = sessions.sort((a: any, b: any) => {
            const sessionA = a.automation_session || a;
            const sessionB = b.automation_session || b;
            const timeA = new Date(sessionA.created_at || 0).getTime();
            const timeB = new Date(sessionB.created_at || 0).getTime();
            return timeB - timeA;
          });          for (const session of sortedSessions) {
            const sessionData = session.automation_session || session;
            if (!sessionData?.hashed_id) continue;
            
            const createdAt = new Date(sessionData.created_at);
            const sessionName = sessionData.name || '';
            
            // If testName is specified, try to match it first (regardless of age)
            if (testName) {
              if (sessionName.includes(testName) || testName.includes(sessionName)) {
                console.log(`✅ Found matching session by name: ${sessionData.hashed_id} (${sessionName})`);
                return sessionData.hashed_id;
              }
            }
            
            // Check if session is recent enough and not already named with a specific test
            if (createdAt >= cutoffTime) {
              // Skip sessions that already have a specific test name (avoid conflicts)
              const hasGenericName = sessionName.includes('FusionIQ Test') || sessionName.includes('windows-chrome') || sessionName === '';
              if (hasGenericName) {
                console.log(`✅ Found recent session: ${sessionData.hashed_id} (${sessionName})`);
                return sessionData.hashed_id;
              } else {
                console.log(`⚠️ Skipping already-named session: ${sessionData.hashed_id} (${sessionName})`);
              }
            } else {
              console.log(`Session ${sessionData.hashed_id} too old (${createdAt.toISOString()})`);
            }
          }
          
          // If no recent sessions found, try the most recent one anyway
          if (sortedSessions.length > 0 && !testName) {
            const mostRecent = sortedSessions[0];
            const sessionData = mostRecent.automation_session || mostRecent;
            if (sessionData?.hashed_id) {
              console.log(`⚠️ Using most recent session despite age: ${sessionData.hashed_id}`);
              return sessionData.hashed_id;
            }
          }
        }
        
        // Add small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));      } catch (sessionError) {
        console.log(`Failed to fetch sessions for build ${buildId}:`, sessionError instanceof Error ? sessionError.message : String(sessionError));
      }
    }
    
    console.log('⚠️ No matching BrowserStack sessions found');
    return null;  } catch (error) {
    console.error('❌ BrowserStack session search error:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Simplified function to set session name (used by compatibility test manager)
 */
export async function setSessionName(browser: any, sessionName: string): Promise<string | undefined> {
  // This is a simplified version that works with the browser instance
  // In practice, this would need to extract session ID from the browser
  // For now, we'll use the existing findRecentBrowserStackSession approach
  const config = await import('../utils/configUtility').then(m => m.getConfig());
  const sessionId = await findRecentBrowserStackSession({
    username: config.browserstack.username,
    accessKey: config.browserstack.accessKey,
    testName: sessionName,
    maxAgeMinutes: 2
  });
  
  if (sessionId) {
    await setBrowserStackSessionName({
      sessionId,
      testName: sessionName,
      username: config.browserstack.username,
      accessKey: config.browserstack.accessKey
    });
    return sessionId;
  }
  
  return undefined;
}

/**
 * Simplified function to update session status (used by compatibility test manager)
 */
export async function updateSessionStatus(sessionId: string, status: 'passed' | 'failed', reason?: string): Promise<void> {
  const config = await import('../utils/configUtility').then(m => m.getConfig());
  
  await markBrowserStackSessionStatus({
    sessionId,
    status,
    reason,
    username: config.browserstack.username,
    accessKey: config.browserstack.accessKey
  });
}
