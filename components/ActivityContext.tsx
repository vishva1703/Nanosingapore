import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Activity {
  id: string;
  type: string;
  calories: number;
  duration: number;
  intensity: number;
  description?: string;
  time: string;
  date: string;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  clearActivities: () => void;

  // NEW
  updateActivity: (id: string, updatedFields: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  isAnalyzing: boolean;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addActivity = (activity: Activity) => {
    setActivities(prev => [activity, ...prev]);
  };

  const updateActivity = (id: string, updatedFields: Partial<Activity>) => {
    setActivities(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updatedFields } : a))
    );
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <ActivityContext.Provider value={{
      activities,
      addActivity,
      clearActivities,
      updateActivity,
      deleteActivity,
      isAnalyzing,
      setIsAnalyzing
    }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
