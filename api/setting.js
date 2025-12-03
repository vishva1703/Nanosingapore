import { apiClient } from './base.js';

export const SettingsAPI = {
  // Get user settings
  getSettings: () => 
    apiClient.get('/setting/get-setting'),

  // Get user macro goals
  getGoals: () => 
    apiClient.get('/setting/get-goals'),

  // Get personal details
  getPersonalDetails: () => 
    apiClient.get('/setting/get-personal-details'),

  // Toggle burned calories flag
  toggleBurnedCaloriesFlag: () => 
    apiClient.post('/setting/toggle-burned-calories-flag'),

  // Set height and weight
  setHeightWeight: (height, weight) => 
    apiClient.post('/setting/set-height-weight', { height, weight }),

  // Set weight goal
  setWeightGoal: (goalWeight) => 
    apiClient.post('/setting/set-weight-goal', { goalWeight }),

  // Set birth date
  setBirthDate: (dateOfBirth) => 
    apiClient.post('/setting/set-birth-date', { dateOfBirth }),

  // Set gender
  setGender: (gender) => 
    apiClient.post('/setting/set-gender', { gender }),

  // Delete user account
  deleteAccount: () => 
    apiClient.delete('/setting/account'),
};