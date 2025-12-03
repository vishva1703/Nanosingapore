import ProgressBar from '@/components/ProgressBar';
import { getMacroData, getOnboardingData, MacroData, OnboardingData, saveMacroData } from '@/utils/onboardingStorage';
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

// Maximum/total values for calculating progress (same as index.tsx)
const MAX_CALORIES = 3000;
const MAX_CARBS = 400; // grams
const MAX_PROTEIN = 250; // grams
const MAX_FATS = 150; // grams

// Helper function to calculate progress value (0-1)
// Progress = goal value / total maximum value (same as index.tsx)
const calculateProgress = (goal: number = 0, total: number = 1): number => {
  if (total <= 0 || goal <= 0) return 0;
  const progress = goal / total;
  return Math.min(Math.max(progress, 0), 1); // Clamp between 0 and 1
};

export default function CustomPlanReadyScreen() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [calculatedData, setCalculatedData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);

  // Calculate calories and macros based on user data
  const calculateMacros = (data: OnboardingData) => {
    if (!data) {
      console.warn("⚠️ No onboarding data provided for calculation");
      return null;
    }

    console.log("📊 Starting macro calculation with data:", {
      unitSystem: data.unitSystem,
      weight: data.weight,
      height: data.height,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      activityLevel: data.activityLevel,
      goal: data.goal
    });

    // Extract and convert weight to kg (BMR formula requires kg)
    let weightKg: number;
    if (data.unitSystem === 'Metric') {
      weightKg = data.weight?.kg || 0;
    } else {
      // Convert lbs to kg: 1 lb = 0.453592 kg
      weightKg = (data.weight?.lbs || 0) * 0.453592;
    }

    // Extract and convert height to cm (BMR formula requires cm)
    let heightCm: number;
    if (data.unitSystem === 'Metric') {
      heightCm = data.height?.cm || 0;
    } else {
      // Convert feet and inches to cm
      // 1 foot = 30.48 cm, 1 inch = 2.54 cm
      const feet = data.height?.feet || 0;
      const inches = data.height?.inches || 0;
      heightCm = (feet * 30.48) + (inches * 2.54);
    }

    // Calculate age from date of birth
    let age: number = 30; // default
    if (data.dateOfBirth) {
      try {
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      } catch (error) {
        console.warn("⚠️ Error calculating age from dateOfBirth:", error);
        age = 30;
      }
    }

    const gender = (data.gender || 'male').toLowerCase();
    const rawActivityLevel = data.activityLevel || 'moderate';
    
    // Map stored activity levels to calculation keys
    const activityLevelMap: { [key: string]: string } = {
      'sedentary': 'sedentary',
      'moderately_active': 'moderate',
      'very_active': 'veryActive',
      'moderate': 'moderate',
      'active': 'active',
      'veryActive': 'veryActive',
      'light': 'light'
    };
    
    const mappedActivityLevel = activityLevelMap[rawActivityLevel] || 'moderate';
    const goal = (data.goal || 'maintain').toLowerCase();

    // Validate required values
    if (!weightKg || weightKg <= 0) {
      console.error("❌ Invalid weight:", weightKg);
      return null;
    }
    if (!heightCm || heightCm <= 0) {
      console.error("❌ Invalid height:", heightCm);
      return null;
    }

    console.log("📐 Conversion results:", {
      weightKg,
      heightCm,
      age,
      gender,
      mappedActivityLevel,
      goal
    });

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    // Formula requires: weight in kg, height in cm, age in years
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    console.log("🔥 BMR calculated:", bmr);

    // Apply activity multiplier
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const activityMultiplier = activityMultipliers[mappedActivityLevel] || 1.55;
    const tdee = bmr * activityMultiplier;

    console.log("⚡ TDEE calculated:", {
      activityLevel: mappedActivityLevel,
      multiplier: activityMultiplier,
      tdee
    });

    // Apply goal adjustment
    let goalCalories = tdee;
    if (goal === 'lose' || goal === 'losing weight') {
      goalCalories = tdee - 500; // 500 calorie deficit for weight loss
    } else if (goal === 'gain' || goal === 'gaining weight') {
      goalCalories = tdee + 500; // 500 calorie surplus for weight gain
    }

    console.log("🎯 Goal calories after adjustment:", {
      goal,
      originalTDEE: tdee,
      adjustedCalories: goalCalories
    });

    // Calculate macronutrients (standard distribution)
    const proteinGrams = Math.round((goalCalories * 0.3) / 4); // 30% from protein (4 cal/g)
    const fatGrams = Math.round((goalCalories * 0.25) / 9);    // 25% from fat (9 cal/g)
    const carbGrams = Math.round((goalCalories * 0.45) / 4);   // 45% from carbs (4 cal/g)

    const calculatedMacros = {
      calories: Math.round(goalCalories),
      protein: proteinGrams,
      fats: fatGrams,
      carbs: carbGrams
    };

    console.log("✅ Final Calculated Macros:", calculatedMacros);
    console.log("📊 Calculation breakdown:", {
      bmr,
      tdee,
      goalCalories,
      protein: `${proteinGrams}g (${((proteinGrams * 4 / goalCalories) * 100).toFixed(1)}%)`,
      carbs: `${carbGrams}g (${((carbGrams * 4 / goalCalories) * 100).toFixed(1)}%)`,
      fats: `${fatGrams}g (${((fatGrams * 9 / goalCalories) * 100).toFixed(1)}%)`
    });

    return calculatedMacros;
  };


  // Load and display macro data - always calculates from onboarding data, ignores Adjustgoal changes
  const loadMacroData = useCallback(async () => {
    try {
      console.log("=== LOADING MACRO DATA IN PLAN SCREEN ===");
      
      // Get saved macro data from storage (for units only, not values)
      const storedMacroData = await getMacroData();
      console.log("📦 Stored macro data from Adjustgoal:", JSON.stringify(storedMacroData, null, 2));

      // Get onboarding data for calculation
      const onboardingData = await getOnboardingData();
      setOnboardingData(onboardingData);
      console.log("📋 Onboarding Data:", onboardingData);

      let macros: any = null;

      // Priority 1: Always calculate from current onboarding data (ignores Adjustgoal changes)
      if (onboardingData) {
        const calculated = calculateMacros(onboardingData);
        if (calculated) {
          macros = calculated;
          setCalculatedData(calculated);
          console.log("✅ Calculated macros from current onboarding data:", calculated);
          
          // Always save calculated macro data (overwrites any Adjustgoal changes)
          const macroData: MacroData = {
            macroNutrient: {
              calories: {
                value: 0,
                goal: macros.calories,
                unit: "Cal"
              },
              carbs: {
                value: 0,
                goal: macros.carbs,
                unit: "g"
              },
              protein: {
                value: 0,
                goal: macros.protein,
                unit: "g"
              },
              fats: {
                value: 0,
                goal: macros.fats,
                unit: "g"
              }
            }
          };
          
          // Always save calculated values (calculation takes priority over Adjustgoal changes)
          await saveMacroData(macroData);
          console.log("💾 Saved calculated macro data (overwrites Adjustgoal changes):", macroData);
        }
      }
      
      // Fallback: Use stored macro data only if calculation failed
      if (!macros && storedMacroData?.macroNutrient) {
        const macroNut = storedMacroData.macroNutrient;
        macros = {
          calories: macroNut.calories?.goal || macroNut.calories?.value || 2000,
          protein: macroNut.protein?.goal || macroNut.protein?.value || 150,
          carbs: macroNut.carbs?.goal || macroNut.carbs?.value || 200,
          fats: macroNut.fats?.goal || macroNut.fats?.value || 65,
        };
        console.log("✅ Using stored macro data (fallback after calculation failure):", macros);
      }

      if (macros) {
        // Get units from stored data if available
        const storedCaloriesUnit = storedMacroData?.macroNutrient?.calories?.unit || "Cal";
        const storedProteinUnit = storedMacroData?.macroNutrient?.protein?.unit || "g";
        const storedCarbsUnit = storedMacroData?.macroNutrient?.carbs?.unit || "g";
        const storedFatsUnit = storedMacroData?.macroNutrient?.fats?.unit || "g";

        // Set daily data with values from storage (updated by Adjustgoal) or calculated values
        const newDailyData = [
          { 
            label: "Calories", 
            value: `${macros.calories} ${storedCaloriesUnit}`, 
            color: "#22C55E", 
            progress: calculateProgress(macros.calories, MAX_CALORIES) 
          },
          { 
            label: "Carbs", 
            value: `${macros.carbs} ${storedCarbsUnit}`, 
            color: "#F97316", 
            progress: calculateProgress(macros.carbs, MAX_CARBS) 
          },
          { 
            label: "Protein", 
            value: `${macros.protein} ${storedProteinUnit}`, 
            color: "#EF4444", 
            progress: calculateProgress(macros.protein, MAX_PROTEIN) 
          },
          { 
            label: "Fats", 
            value: `${macros.fats} ${storedFatsUnit}`, 
            color: "#8B5CF6", 
            progress: calculateProgress(macros.fats, MAX_FATS) 
          },
        ];
        
        setDailyData(newDailyData);
        console.log("📊 Daily Data Set (with updated values):", newDailyData);
      } else {
        // Fallback to default data
        const fallbackData = [
          { label: "Calories", value: "2000 Cal", color: "#22C55E", progress: calculateProgress(2000, MAX_CALORIES) },
          { label: "Carbs", value: "200 g", color: "#F97316", progress: calculateProgress(200, MAX_CARBS) },
          { label: "Protein", value: "150 g", color: "#EF4444", progress: calculateProgress(150, MAX_PROTEIN) },
          { label: "Fats", value: "65 g", color: "#8B5CF6", progress: calculateProgress(65, MAX_FATS) },
        ];
        setDailyData(fallbackData);
        console.log("🔄 Using fallback data:", fallbackData);
      }
    } catch (error) {
      console.error("❌ Error loading macro data:", error);
      
      // Fallback to default data if loading fails
      const fallbackData = [
        { label: "Calories", value: "2000 Cal", color: "#22C55E", progress: calculateProgress(2000, MAX_CALORIES) },
        { label: "Carbs", value: "200 g", color: "#F97316", progress: calculateProgress(200, MAX_CARBS) },
        { label: "Protein", value: "150 g", color: "#EF4444", progress: calculateProgress(150, MAX_PROTEIN) },
        { label: "Fats", value: "65 g", color: "#8B5CF6", progress: calculateProgress(65, MAX_FATS) },
      ];
      setDailyData(fallbackData);
      console.log("🔄 Using fallback data due to error:", fallbackData);
    }
  }, []);

  // Load data on mount and when screen comes into focus (after returning from Adjustgoal)
  useEffect(() => {
    loadMacroData();
  }, []);

  // Refresh data when screen comes into focus (after returning from Adjustgoal)
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Plan screen focused - reloading macro data");
      loadMacroData();
    }, [loadMacroData])
  );

  const CircleProgress = ({ progress, color, value }: any) => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={{ position: "relative", alignItems: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            stroke="#E5E7EB"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <Text
          style={{
            position: "absolute",
            top: "38%",
            color: "#111827",
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          {value}
        </Text>
      </View>
    );
  };

  const calculateGoalDate = () => {
    if (!onboardingData?.changeInWeightPerWeek) return "March 15";
    
    const weeksToGoal = 8; 
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToGoal * 7));
    
    return targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.wrapper}>
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <ProgressBar screen="plan" noContainer={true} />
            </View>
          </View>

          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={22} color="#FFF" />
            </View>

            <Text style={styles.titleText}>
              Congratulations your custom plan is ready!
            </Text>

            <Text style={styles.subText}>You should {onboardingData?.goal === 'gain' ? 'Gain' : 'Lose'}:</Text>
            <Text style={styles.lossText}>
              {onboardingData?.changeInWeightPerWeek?.kg || onboardingData?.changeInWeightPerWeek?.lbs || '0.5'} kg by {calculateGoalDate()}
            </Text>

            {/* Daily Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>Daily recommendation</Text>
              <Text style={styles.recommendationSubText}>
                You can edit this any time
              </Text>

              <View style={styles.grid}>
                {dailyData.map((item, index) => (
                  <View style={styles.card} key={index}>
                    <Text style={styles.cardLabel}>{item.label}</Text>
                    <CircleProgress
                      progress={item.progress}
                      color={item.color}
                      value={item.value}
                    />
                    <TouchableOpacity 
                      style={styles.editIcon} 
                      onPress={() => router.push("/screen1/Adjustgoal")}
                    >
                      <AntDesign name="edit" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.primaryCta}
              activeOpacity={0.85}
              onPress={() => router.push("/screens/loginscreen")}
            >
              <Text style={styles.primaryCtaText}>Let's get started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  wrapper: {
    flex: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginLeft: 10,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    width: "90%",
    height: "100%",
    backgroundColor: "#4B3AAC",
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: "center",
    marginTop: 3,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4B3AAC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 20,
  },
  subText: {
    fontSize: 18,
    color: "#111827 ",
    fontWeight: "600",
  },
  lossText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recommendationCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    width: width - 40,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  recommendationSubText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (width - 80) / 2,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 14,
    position: "relative",
  },
  cardLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 6,
  },
  editIcon: {
    position: "absolute",
    bottom: 8,
    right: 10,
  },
  bottomContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  primaryCta: {
    backgroundColor: "#4B3AAC",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: width - 48,
    alignSelf: "center",
  },
  primaryCtaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});