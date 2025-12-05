export const API_CONFIG = {
    BASE_URL: 'https://api.corangelab.com/nutrition-api',
    TIMEOUT: 30000,
  };
  
  export const ENDPOINTS = {
    AUTH: {
      GOOGLE_SIGNUP: '/auth/sign-up-with-google',
      APPLE_SIGNUP: '/auth/signup-with-apple',
      GOOGLE_SIGNIN: '/auth/sign-in-with-google',
      APPLE_SIGNIN: '/auth/sign-in-with-apple',
      ONBOARDING: '/auth/onboarding-quiz',
      AUTO_MACRO: '/auth/auto-generate-macro',
      LOGIN: '/auth/login',
    },
    DASHBOARD: {
      MAIN: '/dashboard/',
      AUTO_MACRO: '/dashboard/auto-generate-macro',
      PREVIOUS_LOG: '/dashboard/previous-log-status',
      WATER_SETTINGS: '/dashboard/water-intake-settings',
      LOG_WATER: '/dashboard/log-water-intake',
      REMOVE_WATER: '/dashboard/remove-water-log-intake',
      RECENT_LOG: '/dashboard/recent-log',
      UPDATE_MACRO: '/dashboard/update-macro-goal',
      THIRD_PARTY: '/dashboard/store-third-party-data',
    },
  };