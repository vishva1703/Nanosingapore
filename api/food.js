import { apiClient } from './base.js';

export const FoodAPI = {
  // My Food endpoints
  addUpdateFood: (foodData) => 
    apiClient.post('/my-food/add-update-food', foodData),

  getFoodList: (page = 1, limit = 10, search = '') => 
    apiClient.post('/my-food/food-list', { page, limit, search }),

  getFoodDetails: (foodId) => 
    apiClient.get(`/my-food/food-details/${foodId}`),

  logFood: (foodId) => 
    apiClient.post('/my-food/log-food', { foodId }),

  deleteFood: (foodId) => 
    apiClient.delete(`/my-food/${foodId}`),

  // Food Search endpoints
  getRecentlyLogged: (page = 1, limit = 10, date) => 
    apiClient.post('/food-search/recently-logged', { page, limit, date }),

  reLogFood: (logId) => 
    apiClient.post('/food-search/re-log', { logId }),

  autocompleteFood: (search) => 
    apiClient.post('/food-search/autocomplete', { search }),

  searchFood: (search, page = 0, limit = 10) => 
    apiClient.post('/food-search/search', { search, page, limit }),

  getFoodDetail: (foodId) => 
    apiClient.post('/food-search/food-detail', { foodId }),

  logFoodFromSearch: (foodId, date) => 
    apiClient.post('/food-search/log-food', { foodId, date }),

  logFoodWithServing: (foodData) => 
    apiClient.post('/food-search/log-food-with-serving', foodData),

  updateLogFood: (logId, servingData) => 
    apiClient.post('/food-search/update-log-food', { logId, ...servingData }),

  // My Meal endpoints
  addUpdateMeal: (mealData) => 
    apiClient.post('/my-meal/add-update-meal', mealData),

  getMealList: (page = 1, limit = 10, search = '') => 
    apiClient.post('/my-meal/meal-list', { page, limit, search }),

  getMealDetails: (mealId) => 
    apiClient.get(`/my-meal/meal-details/${mealId}`),

  logMeal: (mealId) => 
    apiClient.post('/my-meal/log-meal', { mealId }),

  deleteMeal: (mealId) => 
    apiClient.delete(`/my-meal/${mealId}`),
};