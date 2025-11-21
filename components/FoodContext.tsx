import React, { createContext, useContext, useState } from "react";

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
}

interface FoodContextType {
  myFoods: Food[];
  addFood: (food: Food) => void;
  removeFood: (foodId: string) => void;
}

const FoodContext = createContext<FoodContextType | null>(null);

export const FoodProvider = ({ children }: { children: React.ReactNode }) => {
  const [myFoods, setMyFoods] = useState<Food[]>([]);

  const addFood = (food: Food) => {
    setMyFoods((prev) => [...prev, food]);
  };

  const removeFood = (foodId: string) => {
    setMyFoods((prev) => prev.filter((food) => food.id !== foodId));
  };

  return (
    <FoodContext.Provider value={{ myFoods, addFood, removeFood }}>
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
