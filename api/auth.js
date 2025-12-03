import { apiClient } from './base.js';
import { ENDPOINTS } from '../constants/config.js';
import { Storage } from '../utils/storage.js';

export const AuthAPI = {
  // Sign up with Google
  signUpWithGoogle: (userData) => 
    apiClient.post(ENDPOINTS.AUTH.GOOGLE_SIGNUP, userData),

  // Sign up with Apple
  signUpWithApple: (userData) => 
    apiClient.post(ENDPOINTS.AUTH.APPLE_SIGNUP, userData),

  // Sign in with Google
  signInWithGoogle: (credentials) => 
    apiClient.post(ENDPOINTS.AUTH.GOOGLE_SIGNIN, credentials),

  // Sign in with Apple
  signInWithApple: (credentials) => 
    apiClient.post(ENDPOINTS.AUTH.APPLE_SIGNIN, credentials),

  // Complete onboarding quiz
  onboardingQuiz: (quizData) => 
    apiClient.post(ENDPOINTS.AUTH.ONBOARDING, quizData),

  // Auto generate macros
  autoGenerateMacro: (userInfo) => 
    apiClient.post(ENDPOINTS.AUTH.AUTO_MACRO, userInfo),

  // Login with email/name
  login: (email) => 
    apiClient.post(ENDPOINTS.AUTH.LOGIN, { emailId: email }),

  // Store token after successful authentication
  setAuthToken: (token) => {
    Storage.setToken(token);
  },

  // Remove token on logout
  logout: () => {
    Storage.removeToken();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Storage.getToken();
  },
};