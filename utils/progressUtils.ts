// utils/progressUtils.ts

export type ScreenStep = 
  | 'onboarding'
  | 'workout-frequency'
  | 'weight'
  | 'birth-date'
  | 'goal'
  | 'desired'
  | 'fast-goal'
  | 'losing-weight'
  | 'diet'
  | 'stopping-goal'
  | 'accomplish'
  | 'potential'
  | 'greeting'
  | 'plan'
  | 'login'
  | 'complete';

export const getProgressForScreen = (screen: ScreenStep): number => {
  const totalScreens = 15; // Total screens in your flow
  
  const progressMap: Record<ScreenStep, number> = {
    'onboarding': 0.07,           // 1/15 ≈ 7%
    'workout-frequency': 0.13,    // 2/15 ≈ 13%
    'weight': 0.2,                // 3/15 ≈ 20%
    'birth-date': 0.27,           // 4/15 ≈ 27%
    'goal': 0.33,                 // 5/15 ≈ 33%
    'desired': 0.4,               // 6/15 ≈ 40%
    'fast-goal': 0.47,            // 7/15 ≈ 47%
    'losing-weight': 0.53,        // 8/15 ≈ 53%
    'diet': 0.6,                  // 9/15 ≈ 60%
    'stopping-goal': 0.67,        // 10/15 ≈ 67%
    'accomplish': 0.73,           // 11/15 ≈ 73%
    'potential': 0.8,             // 12/15 ≈ 80%
    'greeting': 0.87,             // 13/15 ≈ 87%
    'plan': 0.93,                 // 14/15 ≈ 93%
    'login': 0.97,                // 15/15 ≈ 97% (adjusted for completion)
    'complete': 1.0               // 100%
  };
  
  return progressMap[screen] || 0;
};

// Alternative: Dynamic calculation
export const getProgressByStepNumber = (stepNumber: number, totalSteps: number = 15): number => {
  return Math.min((stepNumber - 1) / totalSteps, 1);
};