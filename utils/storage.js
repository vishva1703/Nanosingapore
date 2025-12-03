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
  };