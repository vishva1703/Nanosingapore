import { Storage } from '../utils/storage.js';
import { apiClient } from './base.js';

// Mock data for when user is not authenticated
const mockProfileData = {
  currentWeight: 85,
  startedWeight: 92,
  targetWeight: 72,
  weeklyCalorieIntake: 8400,
  weeklyCalorieBalance: -500,
  estimatedGoalTime: '1'
};

const mockPersonalDetails = {
  name: 'Cameron Williamson'
};

export const ProfileAPI = {
  // Get profile dashboard data
  getProfileDashboard: async () => {
    try {
      console.log('🔄 [ProfileAPI] Fetching profile dashboard from /nutrition-api/profile/dashboard...');
      
      // Check for token
      const token = await Storage.getToken();
      const hasToken = !!token;
      
      console.log(`🔑 [ProfileAPI] Token status: ${hasToken ? 'Found' : 'Not found'}`);
      if (hasToken) {
        console.log(`🔑 [ProfileAPI] Token: ${token.substring(0, 20)}...`);
      }
      
      if (!hasToken) {
        console.warn('⚠️ [ProfileAPI] No token found, returning mock data');
        return {
          success: false,
          error: 'No authentication token found',
          data: mockProfileData
        };
      }
      
      // Fetch from /nutrition-api/profile/dashboard (POST request)
      console.log('📡 [ProfileAPI] Making POST request to /profile/dashboard...');
      let response;
      try {
        response = await apiClient.post('/profile/dashboard');
        console.log('📥 [ProfileAPI] Profile dashboard raw response received');
        console.log('📥 [ProfileAPI] Response type:', typeof response);
        console.log('📥 [ProfileAPI] Response keys:', response ? Object.keys(response) : 'null');
        console.log('📥 [ProfileAPI] Full response:', JSON.stringify(response, null, 2));
      } catch (apiError) {
        console.error('❌ [ProfileAPI] API request failed:', apiError);
        console.error('❌ [ProfileAPI] Error message:', apiError.message);
        console.error('❌ [ProfileAPI] Error stack:', apiError.stack);
        
        // Return error details instead of mock data
        return {
          success: false,
          error: apiError.message || 'Failed to fetch profile dashboard',
          errorDetails: apiError,
          data: null
        };
      }
      
      // Handle different response structures
      let profileData = null;
      
      // Case 1: Response has flag and data property (new API structure)
      if (response && response.flag !== undefined && response.data) {
        profileData = response.data;
        console.log('✅ [ProfileAPI] Extracted data from response.data (flag structure)');
      }
      // Case 2: Response has data property
      else if (response && response.data) {
        profileData = response.data;
        console.log('✅ [ProfileAPI] Extracted data from response.data');
      }
      // Case 3: Response has success and data structure
      else if (response && response.success !== undefined && response.data) {
        profileData = response.data;
        console.log('✅ [ProfileAPI] Extracted data from response.data (success structure)');
      }
      // Case 4: Response is the data itself (direct object)
      else if (response && (response.weight || response.currentWeight || response.startedWeight || response.goalWeight || response.targetWeight || response.current_weight || response.started_weight || response.target_weight)) {
        profileData = response;
        console.log('✅ [ProfileAPI] Using response as data directly');
      }
      // Case 5: Response has result property
      else if (response && response.result) {
        profileData = response.result;
        console.log('✅ [ProfileAPI] Extracted data from response.result');
      }
      // Case 6: Response structure is nested differently
      else if (response && typeof response === 'object') {
        profileData = response;
        console.log('✅ [ProfileAPI] Using entire response object');
      }
      
      if (profileData) {
        console.log('📊 [ProfileAPI] Extracted profile data:', JSON.stringify(profileData, null, 2));
        return {
          success: response.flag !== undefined ? response.flag : true,
          data: profileData
        };
      }
      
      // If no valid data found, return error instead of mock data
      console.error('❌ [ProfileAPI] No valid data found in response');
      console.error('❌ [ProfileAPI] Response structure:', JSON.stringify(response, null, 2));
      return {
        success: false,
        error: 'Invalid response structure from API',
        rawResponse: response,
        data: null
      };
    } catch (error) {
      console.error('❌ [ProfileAPI] Unexpected error fetching profile dashboard:', error);
      console.error('❌ [ProfileAPI] Error message:', error.message);
      console.error('❌ [ProfileAPI] Error stack:', error.stack);
      
      // Return error details
      return {
        success: false,
        error: error.message || 'Unexpected error occurred',
        errorDetails: error,
        data: null
      };
    }
  },

  // Get user personal details
  getPersonalDetails: async () => {
    try {
      console.log('Fetching personal details...');
      
      // If no token, return mock data
      const hasToken = await Storage.hasValidToken();
      if (!hasToken) {
        console.log('No token found, returning mock personal data');
        return {
          success: true,
          data: mockPersonalDetails
        };
      }
      
      const response = await apiClient.get('/setting/get-personal-details');
      console.log('Personal details response:', response);
      
      // If API fails but we have token, return mock data as fallback
      if (!response || !response.success) {
        return {
          success: true,
          data: mockPersonalDetails
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching personal details, returning mock data:', error);
      return {
        success: true,
        data: mockPersonalDetails
      };
    }
  },

  // Update methods - only work when authenticated
  setCurrentWeight: async (weight) => {
    const hasToken = await Storage.hasValidToken();
    if (!hasToken) {
      console.log('No token - weight update skipped');
      return { success: true, message: 'Demo mode - changes not saved' };
    }
    
    try {
      console.log('Updating current weight:', weight);
      const response = await apiClient.post('/profile/set-current-weight', { weight });
      return response;
    } catch (error) {
      console.error('Error updating weight:', error);
      throw error;
    }
  },

  setGoalWeight: async (goalWeight) => {
    const hasToken = await Storage.hasValidToken();
    if (!hasToken) {
      console.log('No token - goal weight update skipped');
      return { success: true, message: 'Demo mode - changes not saved' };
    }
    
    try {
      console.log('Updating goal weight:', goalWeight);
      const response = await apiClient.post('/profile/set-goal-weight', { goalWeight });
      return response;
    } catch (error) {
      console.error('Error updating goal weight:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    return await Storage.hasValidToken();
  },

  // Set token manually
  setToken: async (token) => {
    await Storage.setToken(token);
  },

  // Remove token
  clearToken: async () => {
    await Storage.removeToken();
  },

getCalendarChart: async ({ sDate, eDate, type } = {}) => {
  try {
    console.log('🔄 [ProfileAPI] Fetching calendar chart from /nutrition-api/profile/calendar-chart...');
    
    // Prepare request body
    const body = {};
    if (sDate) body.sDate = sDate;
    if (eDate) body.eDate = eDate;
    if (type) body.type = type;
    
    console.log('📡 [ProfileAPI] Request body:', body);
    
    // If no token, return empty array
    const token = await Storage.getToken();
    const hasToken = !!token;
    
    console.log(`🔑 [ProfileAPI] Token status: ${hasToken ? 'Found' : 'Not found'}`);
    
    if (!hasToken) {
      console.log('⚠️ [ProfileAPI] No token found, returning empty calendar data');
      return {
        success: true,
        data: []
      };
    }
    
    // Fetch from /nutrition-api/profile/calendar-chart (POST request)
    const response = await apiClient.post('/profile/calendar-chart', body);
    console.log('📥 [ProfileAPI] Calendar chart raw response:', JSON.stringify(response, null, 2));
    
    // Handle different response structures
    let calendarData = null;
    
    // Case 1: Response has data property
    if (response && response.data) {
      calendarData = response.data;
      console.log('✅ [ProfileAPI] Extracted calendar data from response.data');
    }
    // Case 2: Response is an array directly
    else if (response && Array.isArray(response)) {
      calendarData = response;
      console.log('✅ [ProfileAPI] Using response array directly');
    }
    // Case 3: Response has result property
    else if (response && response.result) {
      calendarData = response.result;
      console.log('✅ [ProfileAPI] Extracted calendar data from response.result');
    }
    // Case 4: Response structure is nested differently
    else if (response && typeof response === 'object') {
      calendarData = response;
      console.log('✅ [ProfileAPI] Using entire response object');
    }
    
    if (calendarData) {
      console.log('📅 [ProfileAPI] Extracted calendar data:', JSON.stringify(calendarData, null, 2));
      return {
        success: response.flag !== undefined ? response.flag : true,
        data: calendarData
      };
    }
    
    // If no valid data found, return empty array
    console.log('⚠️ [ProfileAPI] No valid calendar data found in response, returning empty array');
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('❌ [ProfileAPI] Error fetching calendar chart, returning empty array:', error);
    // Return empty array even if API fails
    return {
      success: false,
      error: error.message || 'Failed to fetch calendar chart',
      data: []
    };
  }
},
  
  // Get weight chart data
  getWeightChart: async (params = {}) => {
    try {
      console.log('🔄 [ProfileAPI] Fetching weight chart from /nutrition-api/profile/weight-chart...');
      
      // If no token, return empty data
      const hasToken = await Storage.hasValidToken();
      if (!hasToken) {
        console.log('⚠️ [ProfileAPI] No token found, returning empty weight chart data');
        return {
          success: true,
          data: []
        };
      }
      
      // Prepare request body with optional parameters
      const body = {};
      if (params.sDate) body.sDate = params.sDate;
      if (params.eDate) body.eDate = params.eDate;
      if (params.trend) body.trend = params.trend;
      
      // Fetch from /nutrition-api/profile/weight-chart (POST request)
      const response = await apiClient.post('/profile/weight-chart', body);
      console.log('📥 [ProfileAPI] Weight chart raw response:', JSON.stringify(response, null, 2));
      
      // Handle different response structures
      let weightChartData = null;
      
      // Case 1: Response has data property
      if (response && response.data) {
        weightChartData = response.data;
        console.log('✅ [ProfileAPI] Extracted weight chart data from response.data');
      }
      // Case 2: Response is an array directly
      else if (response && Array.isArray(response)) {
        weightChartData = response;
        console.log('✅ [ProfileAPI] Using response array directly');
      }
      // Case 3: Response has result property
      else if (response && response.result) {
        weightChartData = response.result;
        console.log('✅ [ProfileAPI] Extracted weight chart data from response.result');
      }
      // Case 4: Response structure is nested differently
      else if (response && typeof response === 'object') {
        weightChartData = response;
        console.log('✅ [ProfileAPI] Using entire response object');
      }
      
      if (weightChartData) {
        console.log('📊 [ProfileAPI] Extracted weight chart data:', JSON.stringify(weightChartData, null, 2));
        return {
          success: response.flag !== undefined ? response.flag : true,
          data: weightChartData
        };
      }
      
      // If no valid data found, return empty array
      console.log('⚠️ [ProfileAPI] No valid weight chart data found in response, returning empty array');
      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('❌ [ProfileAPI] Error fetching weight chart, returning empty array:', error);
      // Return empty array even if API fails
      return {
        success: false,
        error: error.message || 'Failed to fetch weight chart',
        data: []
      };
    }
  },

  // Get water intake settings
  getWaterIntakeSettings: async () => {
    try {
      console.log('🔄 [ProfileAPI] Fetching water intake settings from /nutrition-api/dashboard/water-intake-settings...');
      
      // Check for token
      const token = await Storage.getToken();
      const hasToken = !!token;
      
      console.log(`🔑 [ProfileAPI] Token status: ${hasToken ? 'Found' : 'Not found'}`);
      if (hasToken) {
        console.log(`🔑 [ProfileAPI] Token: ${token.substring(0, 20)}...`);
      }
      
      if (!hasToken) {
        console.warn('⚠️ [ProfileAPI] No token found, returning null for water intake settings');
        return {
          success: false,
          error: 'No authentication token found',
          data: null
        };
      }
      
      // Fetch from /nutrition-api/dashboard/water-intake-settings (GET request)
      console.log('📡 [ProfileAPI] Making GET request to /dashboard/water-intake-settings...');
      let response;
      try {
        response = await apiClient.get('/dashboard/water-intake-settings');
        console.log('📥 [ProfileAPI] Water intake settings raw response received');
        console.log('📥 [ProfileAPI] Response type:', typeof response);
        console.log('📥 [ProfileAPI] Response keys:', response ? Object.keys(response) : 'null');
        console.log('📥 [ProfileAPI] Full response:', JSON.stringify(response, null, 2));
      } catch (apiError) {
        console.error('❌ [ProfileAPI] API request failed:', apiError);
        console.error('❌ [ProfileAPI] Error message:', apiError.message);
        console.error('❌ [ProfileAPI] Error stack:', apiError.stack);
        
        // Return error details
        return {
          success: false,
          error: apiError.message || 'Failed to fetch water intake settings',
          errorDetails: apiError,
          data: null
        };
      }
      
      // Handle different response structures
      let waterSettingsData = null;
      
      // Case 1: Response has flag and data property (new API structure)
      if (response && response.flag !== undefined && response.data) {
        waterSettingsData = response.data;
        console.log('✅ [ProfileAPI] Extracted data from response.data (flag structure)');
      }
      // Case 2: Response has data property
      else if (response && response.data) {
        waterSettingsData = response.data;
        console.log('✅ [ProfileAPI] Extracted data from response.data');
      }
      // Case 3: Response has success and data structure
      else if (response && response.success !== undefined && response.data) {
        waterSettingsData = response.data;
        console.log('✅ [ProfileAPI] Extracted data from response.data (success structure)');
      }
      // Case 4: Response is the data itself (direct object with value/unit)
      else if (response && (response.value !== undefined || response.unit !== undefined)) {
        waterSettingsData = response;
        console.log('✅ [ProfileAPI] Using response as data directly');
      }
      // Case 5: Response has result property
      else if (response && response.result) {
        waterSettingsData = response.result;
        console.log('✅ [ProfileAPI] Extracted data from response.result');
      }
      // Case 6: Response structure is nested differently
      else if (response && typeof response === 'object') {
        waterSettingsData = response;
        console.log('✅ [ProfileAPI] Using entire response object');
      }
      
      if (waterSettingsData) {
        console.log('💧 [ProfileAPI] Extracted water intake settings:', JSON.stringify(waterSettingsData, null, 2));
        return {
          success: response.flag !== undefined ? response.flag : true,
          data: waterSettingsData
        };
      }
      
      // If no valid data found, return error
      console.error('❌ [ProfileAPI] No valid data found in response');
      console.error('❌ [ProfileAPI] Response structure:', JSON.stringify(response, null, 2));
      return {
        success: false,
        error: 'Invalid response structure from API',
        rawResponse: response,
        data: null
      };
    } catch (error) {
      console.error('❌ [ProfileAPI] Unexpected error fetching water intake settings:', error);
      console.error('❌ [ProfileAPI] Error message:', error.message);
      console.error('❌ [ProfileAPI] Error stack:', error.stack);
      
      // Return error details
      return {
        success: false,
        error: error.message || 'Unexpected error occurred',
        errorDetails: error,
        data: null
      };
    }
  }
};