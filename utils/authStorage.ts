import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'barber_app_auth';

export interface UserData {
  phone: string;
  name?: string;
  isAuthenticated: boolean;
  loginTimestamp: number;
}

export const AuthStorage = {
  // Save user authentication data
  async saveAuthData(phone: string): Promise<void> {
    try {
      const authData: UserData = {
        phone,
        isAuthenticated: true,
        loginTimestamp: Date.now(),
      };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth data:', error);
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
};
