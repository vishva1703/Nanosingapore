import { apiClient } from './base.js';

export const SavedScanAPI = {
  // Save scan or food for later
  saveScan: (saveData) => 
    apiClient.post('/saved-scan/save', saveData),

  // Get list of saved scans
  getSavedScans: (page = 1, limit = 10, search = '') => 
    apiClient.post('/saved-scan/list', { page, limit, search }),

  // Delete saved scan
  deleteSavedScan: (savedScanId) => 
    apiClient.delete(`/saved-scan/${savedScanId}`),

  // Log saved scan
  logSavedScan: (savedScanId) => 
    apiClient.post(`/saved-scan/log/${savedScanId}`),
};