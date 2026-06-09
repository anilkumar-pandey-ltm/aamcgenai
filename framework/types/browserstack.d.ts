// Type declarations for browserstack-node-sdk
declare module 'browserstack-node-sdk' {
  export interface BrowserStackOptions {
    userName: string;
    accessKey: string;
    projectName?: string;
    buildName?: string;
    sessionName?: string;
    local?: boolean;
    debug?: boolean;
    networkLogs?: boolean;
    consoleLogs?: string;
    video?: boolean;
    seleniumVersion?: string;
    resolution?: string;
    timezone?: string;
  }

  export interface BrowserStackCapabilities {
    'bstack:options': BrowserStackOptions;
    browserName: string;
    browserVersion: string;
    os: string;
    osVersion: string;
  }

  export function createBrowser(capabilities: BrowserStackCapabilities): Promise<any>;
  export function connectToBrowserStack(options: BrowserStackOptions): Promise<any>;
  
  // Add other exports as needed
  const browserStackSDK: any;
  export default browserStackSDK;
}
