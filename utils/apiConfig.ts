/**
 * API Configuration File
 * 
 * How to switch between local and production:
 * 1. For local development: Set USE_LOCAL = true
 * 2. For production: Set USE_LOCAL = false
 * 
 * Make sure your local server is running on http://localhost:3000
 * when using local development mode.
 */

// API Configuration
// Change USE_LOCAL to switch between development and production
export const API_CONFIG = {
  // Set to true for local development, false for production
  USE_LOCAL: true,
  
  // Local development server
  LOCAL_URL: 'http://localhost:3000',
  
  // Production server
  PRODUCTION_URL: 'https://barber-api-three.vercel.app',
  
  // Enable detailed logging for debugging
  DEBUG_LOGS: true
};

// Get the current API base URL
export const getApiBaseUrl = () => {
  return API_CONFIG.USE_LOCAL ? API_CONFIG.LOCAL_URL : API_CONFIG.PRODUCTION_URL;
};

// Helper to log API calls if debugging is enabled
export const logApiCall = (message: string) => {
  if (API_CONFIG.DEBUG_LOGS) {
    console.log(`🔧 API: ${message}`);
  }
};
