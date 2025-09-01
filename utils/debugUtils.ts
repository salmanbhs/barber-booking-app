import { ApiService } from './apiService';
import { AuthStorage } from './authStorage';

/**
 * Debug utilities for API and authentication testing
 * Use these methods in console or during development to debug issues
 */

export const DebugUtils = {
  // Check current authentication status
  async checkAuthStatus() {
    console.log('🔍 Checking authentication status...');
    
    const authData = await AuthStorage.getAuthData();
    console.log('📋 Auth Data:', JSON.stringify(authData, null, 2));
    
    const hasToken = !!authData?.accessToken;
    console.log(`🔑 Token Status: ${hasToken ? '✅ Present' : '❌ Missing'}`);
    
    if (hasToken) {
      const authTest = await ApiService.testAuthentication();
      console.log(`🧪 Auth Test: ${authTest.success ? '✅ Valid' : '❌ Invalid'} - ${authTest.message}`);
    }
    
    return {
      isAuthenticated: !!authData?.isAuthenticated,
      hasToken,
      phone: authData?.phone,
      name: authData?.name,
      userId: authData?.userId,
      email: authData?.email,
      customerId: authData?.customerId,
      totalVisits: authData?.totalVisits,
      totalSpent: authData?.totalSpent,
    };
  },

  // Manually set a test token
  async setTestToken(token: string) {
    console.log('🔧 Setting test token...');
    await AuthStorage.setAccessToken(token);
    console.log('✅ Test token set successfully');
    return this.checkAuthStatus();
  },

  // Clear all auth data
  async clearAuth() {
    console.log('🧹 Clearing all auth data...');
    await AuthStorage.clearAuthData();
    console.log('✅ Auth data cleared');
  },

  // Get API configuration
  getApiConfig() {
    const config = ApiService.getApiConfig();
    console.log('⚙️ API Configuration:', config);
    return config;
  },

  // Test profile update with current auth
  async testProfileUpdate(name: string = 'Test User') {
    console.log(`🧪 Testing profile update with name: "${name}"`);
    
    const result = await ApiService.updateCustomerProfile({ name });
    console.log(`📝 Profile Update Result: ${result.success ? '✅ Success' : '❌ Failed'} - ${result.message}`);
    
    return result;
  },

  // Test profile fetching
  async testProfileFetch() {
    console.log('🧪 Testing profile fetch');
    
    const result = await ApiService.getCustomerProfile();
    console.log(`📋 Profile Fetch Result: ${result.success ? '✅ Success' : '❌ Failed'} - ${result.message}`);
    
    if (result.success) {
      console.log('👤 Customer Data:', result.data?.data?.customer);
      console.log('🔐 Auth User:', result.data?.data?.auth_user);
      console.log('📊 Stats:', result.data?.data?.stats);
    }
    
    return result;
  },

  // Generate a simple JWT token for testing (NOT for production!)
  generateTestToken(phone: string) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      phone, 
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }));
    const signature = 'test-signature';
    
    const token = `${header}.${payload}.${signature}`;
    console.log(`🎫 Generated test token for phone ${phone}:`, token);
    return token;
  },

  // Set up test authentication
  async setupTestAuth(phone: string = '36304442') {
    console.log(`🔧 Setting up test authentication for phone: ${phone}`);
    
    // Save basic auth data
    await AuthStorage.saveAuthData(phone);
    
    // Generate and set a test token
    const testToken = this.generateTestToken(phone);
    await AuthStorage.setAccessToken(testToken);
    
    console.log('✅ Test authentication setup complete');
    return this.checkAuthStatus();
  },

  // Refresh profile data from API
  async refreshProfile() {
    console.log('🔄 Refreshing profile data from API');
    
    const result = await this.testProfileFetch();
    
    if (result.success && result.data?.data?.customer) {
      const customer = result.data.data.customer;
      await AuthStorage.saveCustomerProfile({
        name: customer.name,
        customerId: customer.id,
        email: customer.email,
        totalVisits: customer.total_visits,
        totalSpent: customer.total_spent,
      });
      console.log('✅ Profile data refreshed and saved locally');
    }
    
    return result;
  }
};

// Make it available globally for console debugging
(global as any).DebugUtils = DebugUtils;
