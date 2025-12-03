import { apiClient } from './base.js';

export const ScanAPI = {
  // Scan food image
  scanFood: (file, date) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);
    return apiClient.postFormData('/scan/food', formData);
  },

  // Scan barcode
  scanBarcode: (barcode, date) => 
    apiClient.post('/scan/barcode', { barcode, date }),

  // Get scan details
  getScanDetail: (scanMealId, logId = null) => 
    apiClient.post('/scan/detail', { scanMealId, logId }),

  // Update scan details
  updateScanDetail: (updateData) => 
    apiClient.post('/scan/update-detail', updateData),

  // Fix scan result
  fixResult: (scanMealId, text, logId = null) => 
    apiClient.post('/scan/fix-result', { scanMealId, text, logId }),

  // Add ingredient
  addIngredient: (scanMealId, logId, name, description) => 
    apiClient.post('/scan/add-ingredient', { scanMealId, logId, name, description }),

  // Delete ingredient
  deleteIngredient: (scanMealId, logId, itemId) => 
    apiClient.post('/scan/delete-ingredient', { scanMealId, logId, itemId }),
};