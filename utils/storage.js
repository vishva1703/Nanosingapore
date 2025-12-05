// Utility functions for handling auth token storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

export const Storage = {
    getToken: async () => {
        try {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },
    setToken: async (token) => {
        try {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
            console.error('Error setting token:', error);
        }
    },
    removeToken: async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error removing token:', error);
        }
    },
    hasValidToken: async () => {
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            return !!token;
        } catch (error) {
            console.error('Error checking token:', error);
            return false;
        }
    },
    saveOnboardingData: async (values) => {
        try {
          const existing = await AsyncStorage.getItem(StorageKeys.ONBOARDING);
          const merged = existing ? { ...JSON.parse(existing), ...values } : values;
          await AsyncStorage.setItem(StorageKeys.ONBOARDING, JSON.stringify(merged));
        } catch (e) {
          console.log("Error saving onboarding", e);
        }
      },
    
      getOnboardingData: async () => {
        try {
          const data = await AsyncStorage.getItem(StorageKeys.ONBOARDING);
          return data ? JSON.parse(data) : null;
        } catch (e) {
          console.log("Error getting onboarding", e);
          return null;
        }
      },
    
      clearOnboarding: async () => {
        try {
          await AsyncStorage.removeItem(StorageKeys.ONBOARDING);
        } catch (e) {
          console.log("Error clearing onboarding", e);
        }
      },
    
      // ---------------------------
      // FOOD LIST STORAGE
      // ---------------------------
      saveMyFoods: async (foods) => {
        try {
          await AsyncStorage.setItem(StorageKeys.MY_FOODS, JSON.stringify(foods));
        } catch (e) {
          console.log("Error saving foods", e);
        }
      },
    
      getMyFoods: async () => {
        try {
          const data = await AsyncStorage.getItem(StorageKeys.MY_FOODS);
          return data ? JSON.parse(data) : [];
        } catch (e) {
          console.log("Error getting foods", e);
          return [];
        }
      },
    
      clearMyFoods: async () => {
        try {
          await AsyncStorage.removeItem(StorageKeys.MY_FOODS);
        } catch (e) {
          console.log("Error clearing foods", e);
        }
      },
  };