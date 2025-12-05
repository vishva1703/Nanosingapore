import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Food {
  id?: string;
  name: string;
  brand?: string;
  description?: string;
  servingSize?: string;
  servingsPerContainer?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  saturatedFat?: string;
  polyunsaturatedFat?: string;
  monounsaturatedFat?: string;
  trans?: string;
  cholesterol?: string;
  sodium?: string;
  sugar?: string;
  potassium?: string;
  fiber?: string;
  vitaminA?: string;
  vitaminC?: string;
  calcium?: string;
  iron?: string;
  cookedType?: string;
  imageUri?: string;
  quantity?: number;
  mode?: string;
  [key: string]: any; // Allow additional properties
}

interface FoodContextType {
  myFoods: Food[];
  addFood: (food: Food) => void;
  removeFood: (foodId: string) => void;
  isLoading: boolean;
}

const FOOD_STORAGE_KEY = "MY_FOODS_STORAGE";

const FoodContext = createContext<FoodContextType | null>(null);

export const FoodProvider = ({ children }: { children: React.ReactNode }) => {
  const [myFoods, setMyFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load foods from AsyncStorage on mount
  useEffect(() => {
    loadFoods();
  }, []);

  // Save foods to AsyncStorage whenever myFoods changes
  useEffect(() => {
    if (!isLoading) {
      saveFoods();
    }
  }, [myFoods, isLoading]);

  const loadFoods = async () => {
    try {
      setIsLoading(true);
      const storedFoods = await AsyncStorage.getItem(FOOD_STORAGE_KEY);
      if (storedFoods) {
        const parsedFoods = JSON.parse(storedFoods);
        setMyFoods(Array.isArray(parsedFoods) ? parsedFoods : []);
        console.log("✅ Loaded foods from storage:", parsedFoods.length);
      } else {
        console.log("📦 No stored foods found");
        setMyFoods([]);
      }
    } catch (error) {
      console.error("❌ Error loading foods from storage:", error);
      setMyFoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFoods = async () => {
    try {
      await AsyncStorage.setItem(FOOD_STORAGE_KEY, JSON.stringify(myFoods));
      console.log("💾 Saved foods to storage:", myFoods.length);
    } catch (error) {
      console.error("❌ Error saving foods to storage:", error);
    }
  };

  const addFood = (food: Food) => {
    // Ensure food has an ID
    if (!food.id) {
      food.id = `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    setMyFoods((prev) => {
      // Check if food with same ID already exists
      const exists = prev.some((f) => f.id === food.id);
      if (exists) {
        console.log("⚠️ Food with this ID already exists, updating instead");
        return prev.map((f) => (f.id === food.id ? food : f));
      }
      return [...prev, food];
    });
  };

  const removeFood = (foodId: string) => {
    setMyFoods((prev) => prev.filter((food) => food.id !== foodId));
  };

  return (
    <FoodContext.Provider value={{ myFoods, addFood, removeFood, isLoading }}>
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFood must be used within a FoodProvider");
  }
  return context;
};
