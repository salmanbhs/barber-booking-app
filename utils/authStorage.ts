import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'barber_app_auth';

export interface UserData {
  phone: string;
  name?: string;
  isAuthenticated: boolean;
  loginTimestamp: number;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  userId?: string;
  email?: string;
  customerId?: string;
  totalVisits?: number;
  totalSpent?: number;
}

export const AuthStorage = {
  // Save user authentication data
  async saveAuthData(phone: string, accessToken?: string, additionalData?: {
    userId?: string;
    email?: string;
    refreshToken?: string;
    tokenExpiresAt?: number;
  }): Promise<void> {
    try {
      const authData: UserData = {
        phone,
        isAuthenticated: true,
        loginTimestamp: Date.now(),
        accessToken,
        refreshToken: additionalData?.refreshToken,
        tokenExpiresAt: additionalData?.tokenExpiresAt,
        userId: additionalData?.userId,
        email: additionalData?.email,
      };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  },

  // Get saved authentication data
  async getAuthData(): Promise<UserData | null> {
    try {
      const authData = await AsyncStorage.getItem(AUTH_KEY);
      if (authData) {
        const parsedData: UserData = JSON.parse(authData);
        
        // Check if login is still valid (optional: add expiration logic here)
        // For now, we'll keep the user logged in indefinitely
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const authData = await this.getAuthData();
      return authData?.isAuthenticated || false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  },

  // Clear authentication data (logout)
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  // Complete logout - clear ALL local storage data
  async completeLogout(): Promise<void> {
    try {
      console.log('🧹 Starting complete logout - clearing all local storage...');
      
      // Option 1: Clear only our app's data (recommended)
      await AsyncStorage.removeItem(AUTH_KEY);
      
      // Option 2: Clear ALL AsyncStorage (uncomment if needed)
      // await AsyncStorage.clear();
      
      console.log('✅ All local storage cleared successfully');
    } catch (error) {
      console.error('❌ Error during complete logout:', error);
      throw error;
    }
  },

  // Get user phone number
  async getUserPhone(): Promise<string | null> {
    try {
      const authData = await this.getAuthData();
      return authData?.phone || null;
    } catch (error) {
      console.error('Error getting user phone:', error);
      return null;
    }
  },

  // Save user name
  async saveUserName(name: string): Promise<void> {
    try {
      const authData = await this.getAuthData();
      if (authData) {
        const updatedData: UserData = {
          ...authData,
          name,
        };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error saving user name:', error);
      throw error;
    }
  },

  // Get user name
  async getUserName(): Promise<string | null> {
    try {
      const authData = await this.getAuthData();
      return authData?.name || null;
    } catch (error) {
      console.error('Error getting user name:', error);
      return null;
    }
  },

  // Check if user has name
  async hasUserName(): Promise<boolean> {
    try {
      const name = await this.getUserName();
      return !!name && name.trim().length > 0;
    } catch (error) {
      console.error('Error checking user name:', error);
      return false;
    }
  },

  // Manually set access token (for testing)
  async setAccessToken(token: string): Promise<void> {
    try {
      const authData = await this.getAuthData();
      if (authData) {
        const updatedData: UserData = {
          ...authData,
          accessToken: token,
        };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error setting access token:', error);
      throw error;
    }
  },

  // Save customer profile data
  async saveCustomerProfile(profileData: {
    name?: string;
    customerId?: string;
    email?: string;
    totalVisits?: number;
    totalSpent?: number;
  }): Promise<void> {
    try {
      const authData = await this.getAuthData();
      if (authData) {
        const updatedData: UserData = {
          ...authData,
          name: profileData.name || authData.name,
          customerId: profileData.customerId || authData.customerId,
          email: profileData.email || authData.email,
          totalVisits: profileData.totalVisits ?? authData.totalVisits,
          totalSpent: profileData.totalSpent ?? authData.totalSpent,
        };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error saving customer profile:', error);
      throw error;
    }
  },

  // Update tokens after refresh
  async updateTokens(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
    try {
      const authData = await this.getAuthData();
      if (authData) {
        const updatedData: UserData = {
          ...authData,
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
        };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  },

  // Check if token is expired or about to expire (within 5 minutes)
  async isTokenExpired(): Promise<boolean> {
    try {
      const authData = await this.getAuthData();
      if (!authData?.tokenExpiresAt) {
        return false; // If no expiration time, assume valid for backward compatibility
      }
      const fiveMinutesInMs = 5 * 60 * 1000;
      const now = Date.now() / 1000; // Convert to seconds
      return authData.tokenExpiresAt <= (now + (fiveMinutesInMs / 1000));
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired on error for safety
    }
  },

  // Get refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      const authData = await this.getAuthData();
      return authData?.refreshToken || null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },
};
