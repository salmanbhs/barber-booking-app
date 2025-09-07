import { AuthStorage } from './authStorage';
import { getApiBaseUrl, logApiCall, API_CONFIG } from './apiConfig';
import { router } from 'expo-router';

const API_BASE_URL = getApiBaseUrl();

// Log which API URL is being used for debugging
logApiCall(`Service initialized with: ${API_BASE_URL}`);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ApiService {
  // Method to get current API configuration
  static getApiConfig() {
    return {
      baseUrl: API_BASE_URL,
      isLocal: API_CONFIG.USE_LOCAL,
      localUrl: API_CONFIG.LOCAL_URL,
      productionUrl: API_CONFIG.PRODUCTION_URL
    };
  }

  // Refresh access token using refresh token
  private static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = await AuthStorage.getRefreshToken();
      if (!refreshToken) {
        logApiCall('🔧 API: No refresh token available');
        return false;
      }

      const url = `${API_BASE_URL}/api/auth/refresh`;
      logApiCall(`Refreshing token at: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        logApiCall('Token refresh failed');
        return false;
      }

      const data = await response.json();
      logApiCall('Token refresh successful');

      // Extract token info from the response
      const { session, token_info } = data;
      const newAccessToken = session?.access_token || token_info?.access_token;
      const newRefreshToken = session?.refresh_token || token_info?.refresh_token;
      const expiresAt = session?.expires_at || token_info?.expires_at;

      if (newAccessToken && newRefreshToken && expiresAt) {
        await AuthStorage.updateTokens(newAccessToken, newRefreshToken, expiresAt);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  // Handle logout when authentication fails
  private static async handleAuthenticationFailure(): Promise<void> {
    try {
      logApiCall('🔧 API: Authentication failed, clearing data and redirecting to login');
      
      // Clear all local storage data
      await AuthStorage.completeLogout();
      
      // Navigate to main page (phone entry)
      router.replace('/');
    } catch (error) {
      console.error('Error handling authentication failure:', error);
    }
  }
  private static async getAuthToken(): Promise<string | null> {
    try {
      // Check if token is expired or about to expire
      const isExpired = await AuthStorage.isTokenExpired();
      if (isExpired) {
        logApiCall('Token is expired or about to expire, attempting refresh');
        const refreshSuccess = await this.refreshAccessToken();
        if (!refreshSuccess) {
          logApiCall('🔧 API: Token refresh failed');
          // Don't redirect here as this might be called during app initialization
          // Let the actual API call handle the 401 and redirect
          return null;
        }
      }

      const authData = await AuthStorage.getAuthData();
      logApiCall(`Auth data retrieved: ${JSON.stringify(authData, null, 2)}`);
      const token = authData?.accessToken || null;
      logApiCall(`Access token: ${token ? `Found (${token.substring(0, 10)}...)` : 'Not found'}`);
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private static async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    logApiCall(`Making authenticated request to: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401 (Unauthorized), try to refresh the token once
    if (response.status === 401) {
      logApiCall('🔧 API: Received 401, attempting token refresh');
      const refreshSuccess = await this.refreshAccessToken();
      
      if (refreshSuccess) {
        // Retry the request with the new token
        const newToken = await AuthStorage.getAuthData();
        if (newToken?.accessToken) {
          const newHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken.accessToken}`,
          };
          
          logApiCall('Retrying request with refreshed token');
          return fetch(url, {
            ...options,
            headers: newHeaders,
          });
        }
      } else {
        // Token refresh failed, handle logout
        await this.handleAuthenticationFailure();
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    return response;
  }

  static async updateCustomerProfile(data: {
    name?: string;
    email?: string;
  }): Promise<ApiResponse> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        // Handle case where no token is available
        await this.handleAuthenticationFailure();
        return {
          success: false,
          message: 'Authentication required. Please log in again.',
        };
      }

      logApiCall('Using token-based authentication for profile update');
      const response = await this.makeAuthenticatedRequest('/api/customers/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: responseData,
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to update profile',
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        return {
          success: false,
          message: 'Session expired. Please log in again.',
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  static async getCustomerProfile(): Promise<ApiResponse> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        // Handle case where no token is available
        await this.handleAuthenticationFailure();
        return {
          success: false,
          message: 'Authentication required. Please log in again.',
        };
      }

      logApiCall('Fetching customer profile');
      const response = await this.makeAuthenticatedRequest('/api/customers/profile', {
        method: 'GET',
      });

      const responseData = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: responseData,
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to fetch profile',
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        return {
          success: false,
          message: 'Session expired. Please log in again.',
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  static async sendOTP(phone: string): Promise<ApiResponse> {
    try {
      const url = `${API_BASE_URL}/api/auth/send-otp`;
      logApiCall(`Sending OTP to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message || (response.ok ? 'OTP sent successfully' : 'Failed to send OTP'),
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  static async verifyOTP(phone: string, token: string): Promise<ApiResponse> {
    try {
      const url = `${API_BASE_URL}/api/auth/verify-otp`;
      logApiCall(`Verifying OTP at: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, token }),
      });

      const data = await response.json();
      
      // Debug: Log the full response structure
      logApiCall(`OTP verification response: ${JSON.stringify(data, null, 2)}`);

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        message: data.message || (response.ok ? 'OTP verified successfully' : 'Invalid OTP'),
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  // Helper method to test authentication
  static async testAuthentication(): Promise<ApiResponse> {
    try {
      const token = await this.getAuthToken();
      logApiCall(`Testing authentication with token: ${token ? 'Present' : 'Missing'}`);
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token available',
        };
      }

      // Try to make a simple authenticated request
      const response = await this.makeAuthenticatedRequest('/api/customers/profile', {
        method: 'GET',
      });

      return {
        success: response.ok,
        message: response.ok ? 'Authentication successful' : 'Authentication failed',
      };
    } catch (error) {
      console.error('Test authentication error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Authentication test failed',
      };
    }
  }

  // Manual token refresh function that can be called from UI
  static async manualRefreshToken(): Promise<ApiResponse> {
    try {
      const success = await this.refreshAccessToken();
      return {
        success,
        message: success ? 'Token refreshed successfully' : 'Failed to refresh token',
      };
    } catch (error) {
      console.error('Manual token refresh error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }

  // Check authentication status and redirect if needed
  static async checkAuthenticationAndRedirect(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        await this.handleAuthenticationFailure();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Authentication check error:', error);
      await this.handleAuthenticationFailure();
      return false;
    }
  }

  // Force logout and redirect to login
  static async logout(): Promise<void> {
    await AuthStorage.completeLogout();
    router.replace('/');
  }

  // Get list of all barbers
  static async getBarbers(): Promise<ApiResponse> {
    try {
      const url = `${API_BASE_URL}/api/barbers`;
      logApiCall(`Fetching barbers from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch barbers',
        };
      }
    } catch (error) {
      console.error('Get barbers error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Get list of all services
  static async getServices(): Promise<ApiResponse> {
    try {
      const url = `${API_BASE_URL}/api/services`;
      logApiCall(`Fetching services from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch services',
        };
      }
    } catch (error) {
      console.error('Get services error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }
}
