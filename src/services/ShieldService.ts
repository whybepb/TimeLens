/**
 * ShieldService - Manages the Focus Shield overlay state
 * Tracks blacklisted apps and triggers the shield when they're opened
 */

type ShieldCallback = (isActive: boolean, appName: string | null) => void;

export interface BlacklistedApp {
  bundleId: string;
  displayName: string;
  category: "social" | "entertainment" | "news" | "games" | "other";
}

class ShieldService {
  private static instance: ShieldService;
  private subscribers: Set<ShieldCallback> = new Set();
  private _isActive: boolean = false;
  private _currentApp: string | null = null;
  private _blacklistedApps: BlacklistedApp[] = [];
  private _isEnabled: boolean = true;

  private constructor() {
    // Initialize with common distracting apps
    // TODO: Allow users to customize this list
    this._blacklistedApps = [
      { bundleId: "com.facebook.Facebook", displayName: "Facebook", category: "social" },
      { bundleId: "com.burbn.instagram", displayName: "Instagram", category: "social" },
      { bundleId: "com.atebits.Tweetie2", displayName: "Twitter/X", category: "social" },
      { bundleId: "com.zhiliaoapp.musically", displayName: "TikTok", category: "entertainment" },
      { bundleId: "com.google.ios.youtube", displayName: "YouTube", category: "entertainment" },
      { bundleId: "com.reddit.Reddit", displayName: "Reddit", category: "social" },
      { bundleId: "com.toyopagroup.picaboo", displayName: "Snapchat", category: "social" },
      { bundleId: "net.whatsapp.WhatsApp", displayName: "WhatsApp", category: "social" },
    ];

    // TODO: Set up DeviceActivity monitoring
    this.initializeDeviceActivityMonitor();
  }

  public static getInstance(): ShieldService {
    if (!ShieldService.instance) {
      ShieldService.instance = new ShieldService();
    }
    return ShieldService.instance;
  }

  /**
   * Initialize DeviceActivity Framework monitoring
   * TODO: Implement actual native module integration
   */
  private initializeDeviceActivityMonitor(): void {
    // TODO: Implement DeviceActivity Framework integration
    // This requires:
    // 1. Family Controls capability in app entitlements
    // 2. react-native-device-activity or custom native module
    // 3. User authorization via Family Controls
    
    // Example implementation:
    // import { DeviceActivityMonitor } from 'react-native-device-activity';
    // 
    // DeviceActivityMonitor.onAppLaunch((bundleId: string) => {
    //   const blacklisted = this._blacklistedApps.find(
    //     (app) => app.bundleId === bundleId
    //   );
    //   if (blacklisted && this._isEnabled) {
    //     this.triggerShield(blacklisted.displayName);
    //   }
    // });

    console.log("[ShieldService] DeviceActivity monitor initialized (placeholder)");
  }

  /**
   * Subscribe to shield state changes
   */
  public subscribe(callback: ShieldCallback): () => void {
    this.subscribers.add(callback);
    // Immediately notify with current state
    callback(this._isActive, this._currentApp);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      callback(this._isActive, this._currentApp);
    });
  }

  /**
   * Trigger the shield overlay
   */
  public triggerShield(appName: string): void {
    if (!this._isEnabled) return;
    
    console.log("[ShieldService] Triggering shield for:", appName);
    this._isActive = true;
    this._currentApp = appName;
    this.notifySubscribers();
  }

  /**
   * User chose to proceed to the app
   */
  public proceedToApp(): void {
    console.log("[ShieldService] User proceeding to:", this._currentApp);
    this._isActive = false;
    
    // TODO: Log this decision for analytics/insights
    // DataManager.getInstance().logDistraction(this._currentApp);
    
    this._currentApp = null;
    this.notifySubscribers();
  }

  /**
   * User chose to return to focus
   */
  public returnToFocus(): void {
    console.log("[ShieldService] User returning to focus");
    this._isActive = false;
    this._currentApp = null;
    this.notifySubscribers();
    
    // TODO: Navigate back or to the dashboard
    // Could integrate with expo-router here
  }

  /**
   * Enable/disable the shield globally
   */
  public setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
    console.log("[ShieldService] Shield enabled:", enabled);
    
    if (!enabled && this._isActive) {
      this._isActive = false;
      this._currentApp = null;
      this.notifySubscribers();
    }
  }

  /**
   * Check if shield is enabled
   */
  public isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Get current shield state
   */
  public getState(): { isActive: boolean; currentApp: string | null } {
    return {
      isActive: this._isActive,
      currentApp: this._currentApp,
    };
  }

  /**
   * Get blacklisted apps
   */
  public getBlacklistedApps(): BlacklistedApp[] {
    return [...this._blacklistedApps];
  }

  /**
   * Add an app to the blacklist
   */
  public addToBlacklist(app: BlacklistedApp): void {
    if (!this._blacklistedApps.find((a) => a.bundleId === app.bundleId)) {
      this._blacklistedApps.push(app);
      console.log("[ShieldService] Added to blacklist:", app.displayName);
    }
  }

  /**
   * Remove an app from the blacklist
   */
  public removeFromBlacklist(bundleId: string): void {
    this._blacklistedApps = this._blacklistedApps.filter(
      (app) => app.bundleId !== bundleId
    );
    console.log("[ShieldService] Removed from blacklist:", bundleId);
  }

  /**
   * Demo method to test the shield overlay
   * Call this to simulate a blacklisted app being opened
   */
  public demoTrigger(appName: string = "Instagram"): void {
    this.triggerShield(appName);
  }
}

export const getShieldService = () => ShieldService.getInstance();

export default ShieldService;
