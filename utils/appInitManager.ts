// Global app initialization state manager
class AppInitManager {
  private static instance: AppInitManager;
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  static getInstance(): AppInitManager {
    if (!AppInitManager.instance) {
      AppInitManager.instance = new AppInitManager();
    }
    return AppInitManager.instance;
  }

  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.isInitialized) {
      console.log('📱 App already initialized');
      return;
    }

    // If currently initializing, wait for that to complete
    if (this.isInitializing && this.initPromise) {
      console.log('⏳ App initialization in progress, waiting...');
      return this.initPromise;
    }

    // Start initialization
    this.isInitializing = true;
    console.log('🚀 Starting app initialization...');

    this.initPromise = this.performInitialization();
    
    try {
      await this.initPromise;
      this.isInitialized = true;
      this.isInitializing = false;
      console.log('✅ App initialization completed');
    } catch (error) {
      this.isInitializing = false;
      this.initPromise = null;
      console.error('❌ App initialization failed:', error);
      throw error;
    }
  }

  private async performInitialization(): Promise<void> {
    const { DataCache } = await import('./dataCache');
    
    try {
      console.log('📱 Starting parallel data loading...');
      // Preload all app data in parallel
      await DataCache.preloadData();
      console.log('📱 All data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to preload app data:', error);
      // Don't throw error - app should still work with existing cache
    }
  }

  isAppInitialized(): boolean {
    return this.isInitialized;
  }

  isAppInitializing(): boolean {
    return this.isInitializing;
  }

  // Force reinitialize (for testing or manual refresh)
  async reinitialize(): Promise<void> {
    this.isInitialized = false;
    this.isInitializing = false;
    this.initPromise = null;
    return this.initialize();
  }
}

export const appInitManager = AppInitManager.getInstance();
