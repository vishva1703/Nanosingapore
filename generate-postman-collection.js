const fs = require('fs');

// Base URL path from config
const basePath = '/nutrition-api';

// Collection structure
const collection = {
  info: {
    name: 'Wellness API Collection',
    description: 'Complete API collection for Wellness Application with all endpoints and request body details',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'base_url', value: 'http://localhost:4000', type: 'string' },
    { key: 'auth_token', value: '', type: 'string' }
  ],
  item: []
};

// Helper function to create request
function createRequest(name, method, path, body = null, description = '', hasAuth = false, isFileUpload = false) {
  const request = {
    name: name,
    request: {
      method: method,
      header: [],
      url: {
        raw: '{{base_url}}' + basePath + path,
        host: ['{{base_url}}'],
        path: (basePath + path).split('/').filter(p => p)
      },
      description: description
    }
  };

  if (hasAuth) {
    request.request.header.push({
      key: 'x-auth-token',
      value: '{{auth_token}}',
      type: 'text'
    });
  }

  if (isFileUpload) {
    request.request.body = {
      mode: 'formdata',
      formdata: [
        {
          key: 'file',
          type: 'file',
          src: []
        },
        ...(body ? Object.keys(body).map(key => ({
          key: key,
          value: JSON.stringify(body[key]),
          type: 'text'
        })) : [])
      ]
    };
  } else if (body) {
    request.request.header.push({
      key: 'Content-Type',
      value: 'application/json',
      type: 'text'
    });
    request.request.body = {
      mode: 'raw',
      raw: JSON.stringify(body, null, 2)
    };
  }

  return request;
}

// Helper function to create folder
function createFolder(name, description, items) {
  return {
    name: name,
    description: description,
    item: items
  };
}

// Auth endpoints
const authEndpoints = [
  createRequest(
    'Sign Up with Google',
    'POST',
    '/auth/sign-up-with-google',
    {
      idToken: 'string (Google ID token)',
      platform: 'string (e.g., "android", "ios", "web")',
      gender: 'string (e.g., "male", "female")',
      activityLevel: 'string (e.g., "sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active")',
      unitSystem: 'string ("Metric" or "Imperial")',
      height: { cm: 170, feet: 5, inches: 7 },
      weight: { kg: 70, lbs: 154 },
      dateOfBirth: 'string (ISO date format)',
      goal: 'string (e.g., "Lose weight", "Gain weight", "Maintain weight")',
      goalWeight: { kg: 65, lbs: 143 },
      changeInWeightPerWeek: { kg: 0.5, lbs: 1.1 },
      goalObstacles: 'string (optional)',
      wantToAccomplish: 'string (optional)',
      dietType: 'string (optional)',
      timezone: 'string (optional, e.g., "America/New_York")'
    },
    'Sign up a new user with Google authentication',
    false
  ),
  createRequest(
    'Sign Up with Apple',
    'POST',
    '/auth/signup-with-apple',
    {
      idToken: 'string (Apple ID token)',
      platform: 'string',
      gender: 'string',
      activityLevel: 'string',
      unitSystem: 'string',
      height: { cm: 170, feet: 5, inches: 7 },
      weight: { kg: 70, lbs: 154 },
      dateOfBirth: 'string',
      goal: 'string',
      goalWeight: { kg: 65, lbs: 143 },
      changeInWeightPerWeek: { kg: 0.5, lbs: 1.1 },
      goalObstacles: 'string (optional)',
      wantToAccomplish: 'string (optional)',
      dietType: 'string (optional)',
      timezone: 'string (optional)'
    },
    'Sign up a new user with Apple authentication',
    false
  ),
  createRequest(
    'Sign In with Google',
    'POST',
    '/auth/sign-in-with-google',
    {
      idToken: 'string (Google ID token)',
      platform: 'string',
      timezone: 'string (optional)'
    },
    'Sign in an existing user with Google',
    false
  ),
  createRequest(
    'Sign In with Apple',
    'POST',
    '/auth/sign-in-with-apple',
    {
      idToken: 'string (Apple ID token)',
      timezone: 'string (optional)'
    },
    'Sign in an existing user with Apple',
    false
  ),
  createRequest(
    'Onboarding Quiz',
    'POST',
    '/auth/onboarding-quiz',
    {
      gender: 'string',
      activityLevel: 'string',
      unitSystem: 'string',
      height: { cm: 170, feet: 5, inches: 7 },
      weight: { kg: 70, lbs: 154 },
      dateOfBirth: 'string',
      goal: 'string',
      goalWeight: { kg: 65, lbs: 143 },
      changeInWeightPerWeek: { kg: 0.5, lbs: 1.1 },
      goalObstacles: 'string (optional)',
      wantToAccomplish: 'string (optional)',
      dietType: 'string (optional)'
    },
    'Complete onboarding quiz to calculate macros',
    false
  ),
  createRequest(
    'Auto Generate Macro',
    'POST',
    '/auth/auto-generate-macro',
    {
      gender: 'string',
      activityLevel: 'string',
      unitSystem: 'string',
      height: { cm: 170, feet: 5, inches: 7 },
      weight: { kg: 70, lbs: 154 },
      dateOfBirth: 'string',
      goal: 'string',
      goalWeight: { kg: 65, lbs: 143 },
      changeInWeightPerWeek: { kg: 0.5, lbs: 1.1 },
      goalObstacles: 'string (optional)',
      wantToAccomplish: 'string (optional)',
      dietType: 'string (optional)'
    },
    'Auto generate macro nutrients based on user info',
    false
  ),
  createRequest(
    'Login with Name',
    'POST',
    '/auth/login',
    {
      emailId: 'string'
    },
    'Login with email/name',
    false
  )
];

collection.item.push(createFolder('Authentication', 'Authentication endpoints', authEndpoints));

// Dashboard endpoints
const dashboardEndpoints = [
  createRequest(
    'Get Dashboard',
    'POST',
    '/dashboard/',
    {
      date: 'string (ISO date format, e.g., "2025-01-15")'
    },
    'Get dashboard data for a specific date',
    true
  ),
  createRequest(
    'Auto Generate Macro',
    'POST',
    '/dashboard/auto-generate-macro',
    {
      gender: 'string',
      activityLevel: 'string',
      unitSystem: 'string',
      height: { cm: 170, feet: 5, inches: 7 },
      weight: { kg: 70, lbs: 154 },
      dateOfBirth: 'string',
      goal: 'string',
      goalWeight: { kg: 65, lbs: 143 },
      changeInWeightPerWeek: { kg: 0.5, lbs: 1.1 },
      goalObstacles: 'string (optional)',
      wantToAccomplish: 'string (optional)',
      dietType: 'string (optional)'
    },
    'Auto generate macro nutrients',
    true
  ),
  createRequest(
    'Get Previous Log Status',
    'POST',
    '/dashboard/previous-log-status',
    {
      date: 'string (ISO date format)'
    },
    'Get previous log status for calendar',
    true
  ),
  createRequest(
    'Update Water Intake Settings',
    'POST',
    '/dashboard/water-intake-settings',
    {
      value: 250,
      unit: 'string ("ml" or "L")'
    },
    'Update water serving size settings',
    true
  ),
  createRequest(
    'Get Water Intake Settings',
    'GET',
    '/dashboard/water-intake-settings',
    null,
    'Get water serving size settings',
    true
  ),
  createRequest(
    'Log Water Intake',
    'POST',
    '/dashboard/log-water-intake',
    {
      date: 'string (ISO date format)'
    },
    'Log water intake for a date',
    true
  ),
  createRequest(
    'Remove Water Log Intake',
    'POST',
    '/dashboard/remove-water-log-intake',
    {
      date: 'string (ISO date format)'
    },
    'Remove last water log entry',
    true
  ),
  createRequest(
    'Recent Log',
    'POST',
    '/dashboard/recent-log',
    {
      page: 1,
      limit: 10,
      date: 'string (ISO date format)'
    },
    'Get recent logs with pagination',
    true
  ),
  createRequest(
    'Update Macro Goal',
    'POST',
    '/dashboard/update-macro-goal',
    {
      scheduleDate: 'string (ISO date format)',
      macroGoal: {
        calories: { value: 2000, unit: 'Cal' },
        protein: { value: 150, unit: 'g' },
        carbs: { value: 200, unit: 'g' },
        fats: { value: 65, unit: 'g' }
      }
    },
    'Update macro goal for a specific date',
    true
  ),
  createRequest(
    'Store Third Party Data',
    'POST',
    '/dashboard/store-third-party-data',
    {
      date: 'string (ISO date format)',
      steps: 10000
    },
    'Store steps data from third-party integrations',
    true
  )
];

collection.item.push(createFolder('Dashboard', 'Dashboard endpoints', dashboardEndpoints));

// Scan endpoints
const scanEndpoints = [
  createRequest('Scan Food', 'POST', '/scan/food', { date: 'string (ISO date format)' }, 'Scan food image and analyze nutritional information', true, true),
  createRequest('Scan Barcode', 'POST', '/scan/barcode', { barcode: 'string', date: 'string (ISO date format)' }, 'Scan barcode to get product nutritional info', true),
  createRequest('Scan Food Label', 'POST', '/scan/food-label', { date: 'string (ISO date format)' }, 'Scan food label image', true, true),
  createRequest('Scan Detail', 'POST', '/scan/detail', { logId: 'string (optional)', scanMealId: 'string (required)' }, 'Get scan meal details', true),
  createRequest('Update Scan Detail', 'POST', '/scan/update-detail', { logId: 'string (required)', scanMealId: 'string (required)', name: 'string', servingCount: 1, calories: { value: 0, unit: 'Cal' }, fats: { value: 0, unit: 'g' }, proteins: { value: 0, unit: 'g' }, carbs: { value: 0, unit: 'g' }, items: [] }, 'Update scan meal details', true),
  createRequest('Fix Result', 'POST', '/scan/fix-result', { scanMealId: 'string', logId: 'string (optional)', text: 'string' }, 'Fix/regenerate scan result with additional text', true),
  createRequest('Add Ingredient', 'POST', '/scan/add-ingredient', { scanMealId: 'string', logId: 'string', name: 'string', description: 'string (nutritional text)' }, 'Add ingredient to scan meal', true),
  createRequest('Delete Ingredient', 'POST', '/scan/delete-ingredient', { scanMealId: 'string', logId: 'string', itemId: 'string' }, 'Delete ingredient from scan meal', true)
];
collection.item.push(createFolder('Scan', 'Scan endpoints for food analysis', scanEndpoints));

// My Food endpoints
const myFoodEndpoints = [
  createRequest('Add/Update Food', 'POST', '/my-food/add-update-food', { foodId: 'string (optional, for update)', brandName: 'string', description: 'string', servingSize: { value: 100, unit: 'g' }, servingPerContainer: 1, calories: { value: 250, unit: 'Cal' }, macronutrients: { protein: { value: 20, unit: 'g' }, carbs: { value: 30, unit: 'g' }, fats: { value: 10, unit: 'g' } }, fats: { saturated: { value: 5, unit: 'g' }, polyunsaturated: { value: 2, unit: 'g' }, monounsaturated: { value: 3, unit: 'g' }, trans: { value: 0, unit: 'g' } }, carbs: { sugar: { value: 5, unit: 'g' }, fiber: { value: 3, unit: 'g' } }, microNutrients: { minerals: { cholesterol: { value: 0, unit: 'mg' }, sodium: { value: 500, unit: 'mg' }, potassium: { value: 200, unit: 'mg' } }, vitamin: { A: { value: 0, unit: 'mcg' }, C: { value: 0, unit: 'mg' }, calcium: { value: 0, unit: 'mg' }, iron: { value: 0, unit: 'mg' } } } }, 'Add or update custom food entry', true),
  createRequest('Get Food List', 'POST', '/my-food/food-list', { page: 1, limit: 10, search: 'string (optional)' }, 'Get list of custom foods with pagination', true),
  createRequest('Get Food Details', 'GET', '/my-food/food-details/:foodId', null, 'Get details of a specific food', true),
  createRequest('Log Food', 'POST', '/my-food/log-food', { foodId: 'string' }, 'Log a custom food entry', true),
  createRequest('Delete Food', 'DELETE', '/my-food/:foodId', null, 'Delete a custom food entry', true)
];
collection.item.push(createFolder('My Food', 'Custom food management endpoints', myFoodEndpoints));

// Log Exercise endpoints
const logExerciseEndpoints = [
  createRequest('Log Run', 'POST', '/log-exercise/log-run', { logId: 'string (optional, for update)', intensity: 'string (low, medium, high)', duration: 30, date: 'string (ISO date format, optional)' }, 'Log running exercise', true),
  createRequest('Log Weight Lifting', 'POST', '/log-exercise/log-weight-lifting', { logId: 'string (optional, for update)', intensity: 'string (low, medium, high)', duration: 45, date: 'string (ISO date format, optional)' }, 'Log weight lifting exercise', true),
  createRequest('Log By Describe', 'POST', '/log-exercise/log-by-describe', { logId: 'string (optional, for update)', description: 'string', date: 'string (ISO date format, optional)' }, 'Log exercise by describing activity', true),
  createRequest('Delete Log', 'DELETE', '/log-exercise/log/:logId', null, 'Delete an exercise log', true)
];
collection.item.push(createFolder('Log Exercise', 'Exercise logging endpoints', logExerciseEndpoints));

// Intermittent Fasting endpoints
const fastingEndpoints = [
  createRequest('Get Fasting Dashboard', 'POST', '/intermitted-fasting/dashboard', null, 'Get fasting dashboard information', true),
  createRequest('Start Fasting', 'POST', '/intermitted-fasting/start-fasting', { durationHours: 16 }, 'Start a fasting session', true),
  createRequest('End Fasting', 'POST', '/intermitted-fasting/end-fasting', null, 'End current fasting session', true),
  createRequest('Get Fasting Presets', 'GET', '/intermitted-fasting/fasting-presets', null, 'Get available fasting presets', true),
  createRequest('Add Fasting Preset', 'POST', '/intermitted-fasting/add-fasting-presets', { hours: 16, description: 'string (optional)' }, 'Add custom fasting preset', true),
  createRequest('Delete Fasting Preset', 'DELETE', '/intermitted-fasting/fasting-preset/:presetId', null, 'Delete a fasting preset', true)
];
collection.item.push(createFolder('Intermittent Fasting', 'Fasting management endpoints', fastingEndpoints));

// Profile endpoints - Adding key ones
const profileEndpoints = [
  createRequest('Get Profile Dashboard', 'POST', '/profile/dashboard', null, 'Get profile dashboard data', true),
  createRequest('Get Calendar Chart', 'POST', '/profile/calendar-chart', null, 'Get calendar chart data', true),
  createRequest('Get Weight Chart', 'POST', '/profile/weight-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get weight chart data', true),
  createRequest('Get Fasting Chart', 'POST', '/profile/fasting-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get fasting chart data', true),
  createRequest('Get Activity Chart', 'POST', '/profile/activity-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get activity chart data', true),
  createRequest('Get Sleep Chart', 'POST', '/profile/sleep-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get sleep chart data', true),
  createRequest('Get RHR Chart', 'POST', '/profile/rhr-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get resting heart rate chart data', true),
  createRequest('Get Calorie Chart', 'POST', '/profile/calorie-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get calorie chart data', true),
  createRequest('Get Glucose Chart', 'POST', '/profile/glucose-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get glucose chart data', true),
  createRequest('Get Ketone Chart', 'POST', '/profile/ketone-chart', { sDate: 'string (optional)', eDate: 'string (optional)', trend: 'string (weekly, monthly, yearly)' }, 'Get ketone chart data', true),
  createRequest('Set Current Weight', 'POST', '/profile/set-current-weight', { weight: { kg: 70, lbs: 154 } }, 'Update current weight', true),
  createRequest('Set Goal Weight', 'POST', '/profile/set-goal-weight', { goalWeight: { kg: 65, lbs: 143 } }, 'Update goal weight', true),
  createRequest('Log Weight', 'POST', '/profile/log-weight', { date: 'string (ISO date)', time: 'string (ISO time)', weight: { kg: 70, lbs: 154 } }, 'Log weight entry', true),
  createRequest('Log Sleep', 'POST', '/profile/log-sleep', { fellAsleep: 'string (ISO datetime)', wokeUp: 'string (ISO datetime)' }, 'Log sleep entry', true),
  createRequest('Log Activity', 'POST', '/profile/log-activity', { type: 'string', startTime: 'string (ISO datetime)', endTime: 'string (ISO datetime)' }, 'Log activity entry', true),
  createRequest('Log Resting Heart Rate', 'POST', '/profile/log-rhr', { date: 'string (ISO date)', time: 'string (ISO time)', bpm: 72 }, 'Log resting heart rate', true),
  createRequest('Log Calorie Intake', 'POST', '/profile/log-calorie-intake', { date: 'string (ISO date)', time: 'string (ISO time)', calories: 250 }, 'Log manual calorie intake', true),
  createRequest('Log Glucose Levels', 'POST', '/profile/log-glucose-levels', { date: 'string (ISO date)', time: 'string (ISO time)', level: 95 }, 'Log glucose level', true),
  createRequest('Log Ketone Levels', 'POST', '/profile/log-ketone-levels', { date: 'string (ISO date)', time: 'string (ISO time)', level: 0.5 }, 'Log ketone level', true),
  createRequest('Update Macro Nutrient', 'POST', '/profile/update-macro-nutrient', { macroNutrient: { calories: { value: 2000, unit: 'Cal' }, protein: { value: 150, unit: 'g' }, carbs: { value: 200, unit: 'g' }, fats: { value: 65, unit: 'g' } } }, 'Update macro nutrient goals', true),
  createRequest('Update Name', 'POST', '/profile/update-name', { name: 'string' }, 'Update user name', true),
  createRequest('Upload Profile Image', 'POST', '/profile/upload-profile-img', null, 'Upload profile image', true, true)
];
collection.item.push(createFolder('Profile', 'Profile and chart endpoints', profileEndpoints));

// Food Search endpoints
const foodSearchEndpoints = [
  createRequest('Get Recently Logged', 'POST', '/food-search/recently-logged', { page: 1, limit: 10, date: 'string (ISO date format)' }, 'Get recently logged foods', true),
  createRequest('Re-Log Food', 'POST', '/food-search/re-log', { logId: 'string' }, 'Re-log a previously logged food', true),
  createRequest('Autocomplete Food', 'POST', '/food-search/autocomplete', { search: 'string' }, 'Get food autocomplete suggestions', true),
  createRequest('Search Food', 'POST', '/food-search/search', { search: 'string', page: 0, limit: 10 }, 'Search for foods', true),
  createRequest('Get Food Detail', 'POST', '/food-search/food-detail', { foodId: 'string' }, 'Get detailed food information', true),
  createRequest('Log Food', 'POST', '/food-search/log-food', { foodId: 'string', date: 'string (ISO date format, optional)' }, 'Log a food from search', true),
  createRequest('Log Food With Serving', 'POST', '/food-search/log-food-with-serving', { foodId: 'string', servingId: 'string', serviceSize: { value: 1, unit: 'serving' }, calories: { value: 250, unit: 'Cal' }, macronutrients: { protein: { value: 20, unit: 'g' }, carbs: { value: 30, unit: 'g' }, fats: { value: 10, unit: 'g' } }, date: 'string (ISO date format, optional)' }, 'Log food with custom serving size', true),
  createRequest('Update Log Food', 'POST', '/food-search/update-log-food', { logId: 'string', serviceSize: { value: 1.5, unit: 'serving' }, calories: { value: 375, unit: 'Cal' }, macronutrients: { protein: { value: 30, unit: 'g' }, carbs: { value: 45, unit: 'g' }, fats: { value: 15, unit: 'g' } } }, 'Update logged food entry', true)
];
collection.item.push(createFolder('Food Search', 'Food search and logging endpoints', foodSearchEndpoints));

// My Meal endpoints
const myMealEndpoints = [
  createRequest('Add/Update Meal', 'POST', '/my-meal/add-update-meal', { myMealId: 'string (optional, for update)', mealName: 'string', calories: { value: 500, unit: 'Cal' }, macronutrients: { protein: { value: 30, unit: 'g' }, carbs: { value: 50, unit: 'g' }, fats: { value: 20, unit: 'g' } }, fats: {}, carbs: {}, microNutrients: {}, items: [] }, 'Add or update custom meal', true),
  createRequest('Get Meal List', 'POST', '/my-meal/meal-list', { page: 1, limit: 10, search: 'string (optional)' }, 'Get list of custom meals', true),
  createRequest('Get Meal Details', 'GET', '/my-meal/meal-details/:mealId', null, 'Get details of a specific meal', true),
  createRequest('Log Meal', 'POST', '/my-meal/log-meal', { mealId: 'string' }, 'Log a custom meal', true),
  createRequest('Delete Meal', 'DELETE', '/my-meal/:mealId', null, 'Delete a custom meal', true)
];
collection.item.push(createFolder('My Meal', 'Custom meal management endpoints', myMealEndpoints));

// Setting endpoints
const settingEndpoints = [
  createRequest('Get Settings', 'GET', '/setting/get-setting', null, 'Get user settings', true),
  createRequest('Get Goals', 'GET', '/setting/get-goals', null, 'Get user macro goals', true),
  createRequest('Get Personal Details', 'GET', '/setting/get-personal-details', null, 'Get user personal details', true),
  createRequest('Toggle Burned Calories Flag', 'POST', '/setting/toggle-burned-calories-flag', null, 'Toggle burned calories flag', true),
  createRequest('Set Height Weight', 'POST', '/setting/set-height-weight', { height: { cm: 170, feet: 5, inches: 7 }, weight: { kg: 70, lbs: 154 } }, 'Update height and weight', true),
  createRequest('Set Weight Goal', 'POST', '/setting/set-weight-goal', { goalWeight: { kg: 65, lbs: 143 } }, 'Update weight goal', true),
  createRequest('Set Birth Date', 'POST', '/setting/set-birth-date', { dateOfBirth: 'string (ISO date format)' }, 'Update birth date', true),
  createRequest('Set Gender', 'POST', '/setting/set-gender', { gender: 'string' }, 'Update gender', true),
  createRequest('Maintain', 'POST', '/setting/maintain', null, 'Maintain database (admin)', true),
  createRequest('Calculate BMR', 'POST', '/setting/calculateBMR', null, 'Calculate BMR for all users (admin)', true),
  createRequest('Calculate Steps Energy', 'POST', '/setting/calculateStepsEnergy', null, 'Calculate steps energy (admin)', true),
  createRequest('Delete Account', 'DELETE', '/setting/account', null, 'Delete user account', true)
];
collection.item.push(createFolder('Setting', 'User settings endpoints', settingEndpoints));

// Saved Scan endpoints
const savedScanEndpoints = [
  createRequest('Save Scan', 'POST', '/saved-scan/save', { scanMealId: 'string (optional)', mealName: 'string', calories: { value: 250, unit: 'Cal' }, macronutrients: { protein: { value: 20, unit: 'g' }, carbs: { value: 30, unit: 'g' }, fats: { value: 10, unit: 'g' } }, foodId: 'string (optional)', servingId: 'string (optional)', serviceSize: { value: 1, unit: 'serving' } }, 'Save a scan or food for later', true),
  createRequest('Get Saved Scans', 'POST', '/saved-scan/list', { page: 1, limit: 10, search: 'string (optional)' }, 'Get list of saved scans', true),
  createRequest('Delete Saved Scan', 'DELETE', '/saved-scan/:savedScanId', null, 'Delete a saved scan', true),
  createRequest('Log Saved Scan', 'POST', '/saved-scan/log/:savedScanId', null, 'Log a saved scan', true)
];
collection.item.push(createFolder('Saved Scan', 'Saved scan management endpoints', savedScanEndpoints));

// Write to file
fs.writeFileSync('wellness-api-postman-collection.json', JSON.stringify(collection, null, 2));
console.log('Postman collection generated successfully!');

