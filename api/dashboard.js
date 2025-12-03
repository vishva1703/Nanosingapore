import { apiClient } from './base.js';
import { ENDPOINTS } from '../constants/config.js';

export const DashboardAPI = {
  // Get dashboard data
  getDashboard: (date) => 
    apiClient.post(ENDPOINTS.DASHBOARD.MAIN, { date }),

  // Auto generate macros
  autoGenerateMacro: (userInfo) => 
    apiClient.post(ENDPOINTS.DASHBOARD.AUTO_MACRO, userInfo),

  // Get previous log status
  getPreviousLogStatus: (date) => 
    apiClient.post(ENDPOINTS.DASHBOARD.PREVIOUS_LOG, { date }),

  // Update water intake settings
  updateWaterSettings: (settings) => 
    apiClient.post(ENDPOINTS.DASHBOARD.WATER_SETTINGS, settings),

  // Get water intake settings
  getWaterSettings: () => 
    apiClient.get(ENDPOINTS.DASHBOARD.WATER_SETTINGS),

  // Log water intake
  logWaterIntake: (date) => 
    apiClient.post(ENDPOINTS.DASHBOARD.LOG_WATER, { date }),

  // Remove water log
  removeWaterLog: (date) => 
    apiClient.post(ENDPOINTS.DASHBOARD.REMOVE_WATER, { date }),

  // Get recent logs
  getRecentLogs: (page = 1, limit = 10, date) => 
    apiClient.post(ENDPOINTS.DASHBOARD.RECENT_LOG, { page, limit, date }),

  // Update macro goal
  updateMacroGoal: (scheduleDate, macroGoal) => 
    apiClient.post(ENDPOINTS.DASHBOARD.UPDATE_MACRO, { scheduleDate, macroGoal }),

  // Store third-party data
  storeThirdPartyData: (date, steps) => 
    apiClient.post(ENDPOINTS.DASHBOARD.THIRD_PARTY, { date, steps }),
};