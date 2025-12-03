import { apiClient } from './base.js';

export const FastingAPI = {
  // Get fasting dashboard
  getFastingDashboard: () => 
    apiClient.post('/intermitted-fasting/dashboard'),

  // Start fasting session
  startFasting: (durationHours) => 
    apiClient.post('/intermitted-fasting/start-fasting', { durationHours }),

  // End current fasting session
  endFasting: () => 
    apiClient.post('/intermitted-fasting/end-fasting'),

  // Get fasting presets
  getFastingPresets: () => 
    apiClient.get('/intermitted-fasting/fasting-presets'),

  // Add custom fasting preset
  addFastingPreset: (hours, description = '') => 
    apiClient.post('/intermitted-fasting/add-fasting-presets', { hours, description }),

  // Delete fasting preset
  deleteFastingPreset: (presetId) => 
    apiClient.delete(`/intermitted-fasting/fasting-preset/${presetId}`),
};