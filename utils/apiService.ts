import { AuthStorage } from './authStorage';
import { getApiBaseUrl, logApiCall, API_CONFIG } from './apiConfig';

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
  private static async getAuthToken(): Promise<string | null> {
    try {
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

    return fetch(url, {
      ...options,
      headers,
    });
  }

  static async updateCustomerProfile(data: {
    name?: string;
    email?: string;
  }): Promise<ApiResponse> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
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
}
