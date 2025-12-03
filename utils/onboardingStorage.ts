/**
 * Utility functions for storing and retrieving onboarding data
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = "ONBOARDING_DATA";
const MACRO_DATA_STORAGE_KEY = "MACRO_DATA";

export interface OnboardingData {
  // Required fields
  gender?: string;
  activityLevel?: string;
  unitSystem?: "Metric" | "Imperial";
  height?: {
    cm?: number;
    feet?: number;
    inches?: number;
  };
  weight?: {
    kg?: number;
    lbs?: number;
  };
  dateOfBirth?: string;
  goal?: string;
  goalWeight?: {
    kg?: number;
    lbs?: number;
  };
  changeInWeightPerWeek?: {
    kg?: number;
    lbs?: number;
  };
  
  // Optional fields
  goalObstacles?: string;
  wantToAccomplish?: string;
  dietType?: string;
}

export interface MacroData {
  macroNutrient: {
    calories: {
      value: number;
      goal: number;
      unit: string;
    };
    carbs: {
      value: number;
      goal: number;
      unit: string;
    };
    protein: {
      value: number;
      goal: number;
      unit: string;
    };
    fats: {
      value: number;
      goal: number;
      unit: string;
    };
  };
}

export const saveOnboardingData = async (data: Partial<OnboardingData>): Promise<void> => {
  try {
    const existingDataString = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    const existingData = existingDataString ? JSON.parse(existingDataString) : {};
    const updatedData = { ...existingData, ...data };
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    throw error;
  }
};

export const getOnboardingData = async (): Promise<OnboardingData | null> => {
  try {
    const dataString = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return dataString ? JSON.parse(dataString) : null;
  } catch (error) {
    console.error("Error retrieving onboarding data:", error);
    return null;
  }
};

export const clearOnboardingData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing onboarding data:", error);
    throw error;
  }
};

/**
 * Macro data storage with consistent structure
 */
export const saveMacroData = async (data: MacroData): Promise<void> => {
  try {
    // Ensure consistent structure
    const macroData: MacroData = {
      macroNutrient: {
        calories: {
          value: data.macroNutrient.calories.value || 0,
          goal: data.macroNutrient.calories.goal,
          unit: data.macroNutrient.calories.unit || "kcal"
        },
        carbs: {
          value: data.macroNutrient.carbs.value || 0,
          goal: data.macroNutrient.carbs.goal,
          unit: data.macroNutrient.carbs.unit || "g"
        },
        protein: {
          value: data.macroNutrient.protein.value || 0,
          goal: data.macroNutrient.protein.goal,
          unit: data.macroNutrient.protein.unit || "g"
        },
        fats: {
          value: data.macroNutrient.fats.value || 0,
          goal: data.macroNutrient.fats.goal,
          unit: data.macroNutrient.fats.unit || "g"
        }
      }
    };
    
    await AsyncStorage.setItem(MACRO_DATA_STORAGE_KEY, JSON.stringify(macroData));
    console.log("✅ Macro data saved with consistent structure:", macroData);
  } catch (error) {
    console.error("Error saving macro data:", error);
    throw error;
  }
};

export const getMacroData = async (): Promise<MacroData | null> => {
  try {
    const dataString = await AsyncStorage.getItem(MACRO_DATA_STORAGE_KEY);
    if (!dataString) return null;
    
    const data = JSON.parse(dataString);
    
    // Ensure backward compatibility and consistent structure
    const macroData: MacroData = {
      macroNutrient: {
        calories: {
          value: data.macroNutrient?.calories?.value || data.calories?.value || 0,
          goal: data.macroNutrient?.calories?.goal || data.calories?.goal || data.macroNutrient?.calories?.value || data.calories?.value || 2000,
          unit: data.macroNutrient?.calories?.unit || data.calories?.unit || "kcal"
        },
        carbs: {
          value: data.macroNutrient?.carbs?.value || data.carbs?.value || 0,
          goal: data.macroNutrient?.carbs?.goal || data.carbs?.goal || data.macroNutrient?.carbs?.value || data.carbs?.value || 200,
          unit: data.macroNutrient?.carbs?.unit || data.carbs?.unit || "g"
        },
        protein: {
          value: data.macroNutrient?.protein?.value || data.protein?.value || 0,
          goal: data.macroNutrient?.protein?.goal || data.protein?.goal || data.macroNutrient?.protein?.value || data.protein?.value || 150,
          unit: data.macroNutrient?.protein?.unit || data.protein?.unit || "g"
        },
        fats: {
          value: data.macroNutrient?.fats?.value || data.fats?.value || 0,
          goal: data.macroNutrient?.fats?.goal || data.fats?.goal || data.macroNutrient?.fats?.value || data.fats?.value || 65,
          unit: data.macroNutrient?.fats?.unit || data.fats?.unit || "g"
        }
      }
    };
    
    console.log("✅ Loaded macro data with consistent structure:", macroData);
    return macroData;
  } catch (error) {
    console.error("Error retrieving macro data:", error);
    return null;
  }
};

export const clearMacroData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MACRO_DATA_STORAGE_KEY);
    console.log("Macro data cleared.");
  } catch (error) {
    console.error("Error clearing macro data:", error);
    throw error;
  }
};