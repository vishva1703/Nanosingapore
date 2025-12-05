// api/wellnessApi.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

/**
 * Wellness API client
 * Base URL: https://api.corangelab.com
 *
 * Token storage key: 'WELLNESS_AUTH_TOKEN'
 *
 * NOTE: Endpoints were generated from your Postman collection.
 * See: wellness-api-postman-collection.json (uploaded).
 */

const STORAGE_KEY = "WELLNESS_AUTH_TOKEN";
const BASE_URL = "https://api.corangelab.com";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to attach token automatically
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEY);
      if (token) config.headers["x-auth-token"] = token;
    } catch (err) {
      // ignore storage errors — request will continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: You can add a response interceptor for global error handling
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Example: if 401, clear token (optional)
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    return Promise.reject(error);
  }
);

/* ---------- Auth helpers ---------- */

const saveToken = async (token) => {
  if (!token) return;
  await AsyncStorage.setItem(STORAGE_KEY, token);
};

const clearToken = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

const getToken = async () => {
  return AsyncStorage.getItem(STORAGE_KEY);
};

/* ---------- API functions ---------- */

/**
 * Authentication
 */
const signInWithGoogle = async ({ idToken, platform = Platform.OS, timezone }) => {
  const body = { idToken, platform, timezone };
  const res = await client.post("/nutrition-api/auth/sign-in-with-google", body);
  // assume response contains token at res.data.token or res.data.data.token — adapt if needed
  const token = res?.data?.token ?? res?.data?.data?.token;
  if (token) await saveToken(token);
  return res.data;
};

const signUpWithGoogle = async (payload) => {
  const res = await client.post("/nutrition-api/auth/sign-up-with-google", payload);
  const token = res?.data?.token ?? res?.data?.data?.token;
  if (token) await saveToken(token);
  return res.data;
};

const signInWithApple = async ({ idToken, timezone }) => {
  const res = await client.post("/nutrition-api/auth/sign-in-with-apple", { idToken, timezone });
  const token = res?.data?.token ?? res?.data?.data?.token;
  if (token) await saveToken(token);
  return res.data;
};

const logout = async () => {
  await clearToken();
  return { success: true };
};

const autoGenerateMacro = async (payload) => {
  const res = await client.post("/nutrition-api/auth/auto-generate-macro", payload);
  return res.data;
};

const saveOnboardingQuiz = async (payload) => {
  const res = await client.post("/nutrition-api/auth/onboarding-quiz", payload);
  return res.data;
};

/**
 * Dashboard
 */
const getDashboard = async (date) => {
  const body = { date };
  const res = await client.post("/nutrition-api/dashboard/", body);
  return res.data;
};

const getRecentLogs = async ({ page = 1, limit = 10, date }) => {
  const body = { page, limit, date };
  const res = await client.post("/nutrition-api/dashboard/recent-log", body);
  return res.data;
};

const dashboardAutoGenerateMacro = async (payload) => {
  const res = await client.post("/nutrition-api/dashboard/auto-generate-macro", payload);
  return res.data;
};

// 📌 1. Scan Food (Image Upload)
const scanFood = async (imageUri, date) => {
  const formData = new FormData();

  // In Expo/React Native → MUST remove "file://" for Android uploads
  const cleanUri =
    imageUri.startsWith("file://") ? imageUri.replace("file://", "") : imageUri;

  formData.append("file", {
    uri: imageUri,              
    name: `food_${Date.now()}.jpg`,
    type: "image/jpeg",
  });

  formData.append("date", date); 

  const res = await client.post("/nutrition-api/scan/food", formData, {
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
    timeout: 20000,
  });

  return res.data;
};

// 📌 2. Scan Barcode
const scanBarcode = async ({ barcode, date }) => {
  const body = { barcode };
  if (date) body.date = date;
  const res = await client.post("/nutrition-api/scan/barcode", body);
  return res.data;
};

// 📌 3. Scan Food Label
const scanFoodLabel = async (imageUri, date) => {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: `label_${Date.now()}.jpg`,
    type: "image/jpeg",
  });

  // Add date parameter if provided
  if (date) {
    formData.append("date", date);
  }

  const res = await client.post("/nutrition-api/scan/food-label", formData, {
    headers: { 
      Accept: "application/json",
      "Content-Type": "multipart/form-data" 
    },
    timeout: 60000, // Increase timeout for file uploads
  });

  return res.data;
};

// 📌 4. Get Scan Detail
const getScanDetail = async (scanId) => {
  const res = await client.get(`/nutrition-api/scan/detail/${scanId}`);
  return res.data;
};

// 📌 5. Update Scan Detail
const updateScanDetail = async (payload) => {
  const res = await client.post("/nutrition-api/scan/update", payload);
  return res.data;
};

// 📌 6. Fix Scan Result (Submit corrected food details)
const fixScanResult = async (payload) => {
  const res = await client.post("/nutrition-api/scan/fix-result", payload);
  return res.data;
};

// 📌 7. Add Ingredient to Scan
const addIngredient = async (payload) => {
  const res = await client.post("/nutrition-api/scan/add-ingredient", payload);
  return res.data;
};



/**
 * Profile endpoints (examples)
 */
const getProfileDashboard = async () => {
  const res = await client.post("/nutrition-api/profile/dashboard");
  return res.data;
};

const setCurrentWeight = async (weight) => {
  // weight: { kg: 70, lbs: 154 }
  const res = await client.post("/nutrition-api/profile/set-current-weight", { weight });
  return res.data;
};

const logSleep = async ({ fellAsleep, wokeUp }) => {
  const res = await client.post("/nutrition-api/profile/log-sleep", { fellAsleep, wokeUp });
  return res.data;
};

const logWeight = async ({ date, time, weight }) => {
  // weight: { kg: 70, lbs: 154 }
  const res = await client.post("/nutrition-api/profile/log-weight", { date, time, weight });
  return res.data;
};

const logActivity = async ({ type, startTime, endTime }) => {
  // type: string (activity type), startTime: ISO datetime, endTime: ISO datetime
  const res = await client.post("/nutrition-api/profile/log-activity", { type, startTime, endTime });
  return res.data;
};

const getWeightChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/weight-chart", body);
  return res.data;
};

const getFastingChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/fasting-chart", body);
  return res.data;
};

const getActivityChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/activity-chart", body);
  return res.data;
};

const getSleepChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/sleep-chart", body);
  return res.data;
};

const logHeartRate = async ({ date, time, heartRate }) => {
  // date: YYYY-MM-DD, time: HH:MM, heartRate: number (bpm)
  // Backend expects 'rhr' parameter name
  const res = await client.post("/nutrition-api/profile/log-rhr", { date, time, rhr: heartRate });
  return res.data;
};

const getHeartRateChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/rhr-chart", body);
  return res.data;
};

const logCalories = async ({ date, time, calories }) => {
  // date: YYYY-MM-DD, time: HH:MM:SS, calories: number (kcal)
  const res = await client.post("/nutrition-api/profile/log-calorie-intake", { date, time, calories });
  return res.data;
};

const getCalorieChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/calorie-chart", body);
  return res.data;
};

const logGlucose = async ({ date, time, glucose }) => {
  // date: YYYY-MM-DD, time: HH:MM:SS, glucose: number (mg/dL)
  const res = await client.post("/nutrition-api/profile/log-glucose-levels", { date, time, glucose });
  return res.data;
};

const getGlucoseChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/glucose-chart", body);
  return res.data;
};

const logKetone = async ({ date, time, level }) => {
  // date: YYYY-MM-DD, time: HH:MM:SS, level: number (mmol/L)
  const res = await client.post("/nutrition-api/profile/log-ketone-levels", { date, time, level });
  return res.data;
};

const getKetoneChart = async ({ sDate, eDate, trend } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (trend) body.trend = trend;
  const res = await client.post("/nutrition-api/profile/ketone-chart", body);
  return res.data;
};



/**
 * Settings endpoints
 */
const getPersonalDetails = async () => {
  const res = await client.get("/nutrition-api/setting/get-personal-details");
  return res.data;
};

const setGender = async (gender) => {
  const res = await client.post("/nutrition-api/setting/set-gender", { gender });
  return res.data;
};

const setDateOfBirth = async (dateOfBirth) => {
  const res = await client.post("/nutrition-api/setting/set-birth-date", { dateOfBirth });
  return res.data;
};

const setHeightWeight = async (heightCm, heightFt, heightIn, weightKg, weightLbs) => {
  return client.post("/nutrition-api/setting/set-height-weight", {
    height: {
      cm: heightCm,
      feet: heightFt,
      inches: heightIn
    },
    weight: {
      kg: weightKg,
      lbs: weightLbs
    }
  });
};

const getCalendarChart = async ({ sDate, eDate, type } = {}) => {
  const body = {};
  if (sDate) body.sDate = sDate;
  if (eDate) body.eDate = eDate;
  if (type) body.type = type;   // example: "calories" | "weight" | "water" etc.

  const res = await client.post("/nutrition-api/profile/calendar-chart", body);
  return res.data;
};



const getSettings = async () => {
  const res = await client.get("/nutrition-api/setting/get-setting");
  return res.data;
};

const getGoals = async () => {
  const res = await client.get("/nutrition-api/setting/get-goals");
  return res.data;
};

const getWeightGoal = async () => {
  const res = await client.post("/nutrition-api/setting/set-weight-goal");
  return res.data;
};

// 👉 Update / set new weight goal
const updateWeightGoal = async (payload) => {
  const res = await client.post("/nutrition-api/setting/set-weight-goal", payload);
  return res.data;
};

const toggleBurnedCaloriesFlag = async () => {
  const res = await client.post("/nutrition-api/setting/toggle-burned-calories-flag");
  return res.data;
};

const deleteAccount = async () => {
  const res = await client.delete("/nutrition-api/setting/account");
  return res.data;
};

/**
 * My Food (custom food management)
 */
const addOrUpdateFood = async (foodPayload) => {
  // Transform the payload to match backend expectations
  let transformedServingSize = foodPayload.servingSize;
  
  // Transform servingSize from string to object
  if (typeof foodPayload.servingSize === 'string') {
    transformedServingSize = {
      quantity: parseFloat(foodPayload.servingSize) || 0,
      unit: foodPayload.servingUnit || 'g' // default unit
    };
  }
  // If servingSize is undefined and it's a meal, provide default
  else if (!foodPayload.servingSize && foodPayload.type === 'meal') {
    transformedServingSize = {
      quantity: 1,
      unit: 'serving'
    };
  }
  // If servingSize is undefined for regular food, provide default
  else if (!foodPayload.servingSize) {
    transformedServingSize = {
      quantity: 1,
      unit: 'g'
    };
  }

  const transformedPayload = {
    ...foodPayload,
    servingSize: transformedServingSize,
    // Ensure servingPerContainer is provided (backend expects this field name)
    servingPerContainer: foodPayload.servingsPerContainer || foodPayload.servingPerContainer || 1
  };

  // Remove any unwanted fields that might cause conflicts
  delete transformedPayload.servingUnit;
  delete transformedPayload.servingsPerContainer;

  console.log('Transformed food payload:', transformedPayload);
  
  const res = await client.post("/nutrition-api/my-food/add-update-food", transformedPayload);
  return res.data;
};

// api/wellnessApi.js

const getFoodList = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const res = await client.post("/nutrition-api/my-food/food-list", { page, limit, search });
  
  const responseData = res.data;
  
  // Return the food items array directly, or empty array if none
  if (responseData && responseData.data && Array.isArray(responseData.data.list)) {
    return responseData.data.list;
  }
  
  return [];
};

const deleteFood = async (foodId) => {
  const res = await client.delete(`/nutrition-api/my-food/${foodId}`);
  return res.data;
};

// In WellnessAPI.js
const getDashboardRecentLogs = async ({ date, page = 1, limit = 20 } = {}) => {
  try {
    const body = { page, limit };
    if (date) body.date = date;
    
    const res = await client.post("/nutrition-api/dashboard/recent-log", body);
    console.log('📊 Dashboard recent logs response:', JSON.stringify(res.data, null, 2));
    
    // Handle different response structures
    const responseData = res.data;
    
    if (responseData.flag || responseData.success) {
      // Return the data in a consistent format
      return {
        success: true,
        flag: responseData.flag || false,
        message: responseData.message || '',
        data: responseData.data || { list: [] }
      };
    }
    
    return {
      success: false,
      message: responseData.message || 'Failed to fetch logs',
      data: { list: [] }
    };
  } catch (error) {
    console.error('❌ Error in getDashboardRecentLogs:', error);
    return {
      success: false,
      message: error.message,
      data: { list: [] }
    };
  }
};

/**
 * Food search & logging
 */
const searchFood = async ({ search, page = 0, limit = 10 }) => {
  const res = await client.post("/nutrition-api/food-search/search", { search, page, limit });
  return res.data;
};

const logFoodFromSearch = async ({ foodId, date }) => {
  const res = await client.post("/nutrition-api/food-search/log-food", { foodId, date });
  return res.data;
};

/**
 * Water Intake endpoints
 */
const getWaterIntakeSettings = async () => {
  const res = await client.get("/nutrition-api/dashboard/water-intake-settings");
  return res.data;
};

const updateWaterIntakeSettings = async ({ value, unit }) => {
  const res = await client.post("/nutrition-api/dashboard/water-intake-settings", { value, unit });
  return res.data;
};

const logWaterIntake = async ({ date }) => {
  const res = await client.post("/nutrition-api/dashboard/log-water-intake", { date });
  return res.data;
};

const removeWaterLogIntake = async ({ date }) => {
  const res = await client.post("/nutrition-api/dashboard/remove-water-log-intake", { date });
  return res.data;
};

const storeThirdPartyData = async ({ date, steps }) => {
  const res = await client.post("/nutrition-api/dashboard/store-third-party-data", { date, steps });
  return res.data;
};

const logRun = async ({ logId, intensity, duration, date } = {}) => {
  const body = { intensity, duration };
  if (logId) body.logId = logId;
  if (date) body.date = date;
  const res = await client.post("/nutrition-api/log-exercise/log-run", body);
  return res.data;
};

const logWeightLifting = async ({ logId, intensity, duration, date } = {}) => {
  const body = { intensity, duration };
  if (logId) body.logId = logId;
  if (date) body.date = date;
  const res = await client.post("/nutrition-api/log-exercise/log-weight-lifting", body);
  return res.data;
};

const logExerciseByDescribe = async ({ logId, description, date } = {}) => {
  const body = { description };
  if (logId) body.logId = logId;
  if (date) body.date = date;
  const res = await client.post("/nutrition-api/log-exercise/log-by-describe", body);
  return res.data;
};

const deleteExerciseLog = async (logId) => {
  const res = await client.delete(`/nutrition-api/log-exercise/log/${logId}`);
  return res.data;
};



/**
 * My Meal endpoints
 */
const getMealList = async ({ page = 1, limit = 10, search = "" } = {}) => {
  const res = await client.post("/nutrition-api/my-meal/meal-list", { page, limit, search });
  return res.data;
};

const addUpdateMeal = async (payload) => {
  // payload structure should match your Postman collection
  const res = await client.post("/nutrition-api/my-meal/add-update-meal", payload);
  return res.data;
};

const getMealDetails = async (mealId) => {
  const res = await client.get(`/nutrition-api/my-meal/meal-details/${mealId}`);
  return res.data;
};

const logMeal = async (mealId) => {
  const res = await client.post("/nutrition-api/my-meal/log-meal", { mealId });
  return res.data;
};

const deleteMeal = async (mealId) => {
  const res = await client.delete(`/nutrition-api/my-meal/${mealId}`);
  return res.data;
};



/* ---------- Utility - expose client for custom calls ---------- */
const rawClient = client;

/* ---------- Export ---------- */
export default {
  // token helpers
  saveToken,
  getToken,
  clearToken,

  // auth
  signInWithGoogle,
  signUpWithGoogle,
  signInWithApple,
  logout,
  autoGenerateMacro,
  saveOnboardingQuiz,

  // dashboard
  getDashboard,
  dashboardAutoGenerateMacro,
  getRecentLogs,

  // scan
  scanFood,
  scanBarcode,
  scanFoodLabel,
  getScanDetail,
  updateScanDetail,
  fixScanResult,
  addIngredient,

  // profile
  getProfileDashboard,
  setCurrentWeight,
  logSleep,
  logWeight,
  logActivity,
  logHeartRate,
  logCalories,
  logGlucose,
  logKetone,
  getWeightChart,
  getFastingChart,
  getActivityChart,
  getSleepChart,
  getHeartRateChart,
  getCalorieChart,
  getGlucoseChart,
  getKetoneChart,

  // settings
  getPersonalDetails,
  setGender,
  setDateOfBirth,
  setHeightWeight,
  getCalendarChart,
  getSettings,
  getGoals,
  getWeightGoal,
  updateWeightGoal,
  toggleBurnedCaloriesFlag,
  deleteAccount,

  // my food
  addOrUpdateFood,
  getFoodList,
  deleteFood,
  getDashboardRecentLogs,

  // my meal
  getMealList,
  addUpdateMeal,
  getMealDetails,
  logMeal,
  deleteMeal,

  // food-search
  searchFood,
  logFoodFromSearch,

  // water intake
  getWaterIntakeSettings,
  updateWaterIntakeSettings,
  logWaterIntake,
  removeWaterLogIntake,

  // third party data (steps)
  storeThirdPartyData,

  // exercise logging
  logRun,
  logWeightLifting,
  logExerciseByDescribe,
  deleteExerciseLog,

  // raw axios client (if you need to call endpoints not covered above)
  rawClient,
};
