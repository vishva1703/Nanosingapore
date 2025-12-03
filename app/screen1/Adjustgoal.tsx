import wellnessApi from "@/api/wellnessApi";
import { getMacroData, saveMacroData } from "@/utils/onboardingStorage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdjustGoalsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calorie, setCalorie] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  // Fetch macro data from storage and API
  const fetchGoalValues = async () => {
    try {
      setLoading(true);

      // Fetch from Dashboard API first (same as index.tsx uses)
      let dashboardData = null;
      let goalsData = null;
      
      try {
        // Get today's date in YYYY-MM-DD format (same format as index.tsx)
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const dashboardResponse = await wellnessApi.getDashboard(dateString);
        dashboardData = dashboardResponse?.data || dashboardResponse?.result || dashboardResponse;
        console.log("✅ Dashboard data from API:", JSON.stringify(dashboardData, null, 2));
      } catch (apiError) {
        console.log("⚠️ Could not fetch dashboard from API:", apiError);
      }
      
      // Also try getGoals API as fallback
      if (!dashboardData?.macroGoal) {
        try {
          const goalsResponse = await wellnessApi.getGoals();
          goalsData = goalsResponse?.data || goalsResponse?.result || goalsResponse;
          console.log("✅ Goals from getGoals API:", goalsData);
        } catch (goalsError) {
          console.log("⚠️ Could not fetch goals from getGoals API");
        }
      }

      // Also get from stored macro data (from planscreen)
      const storedMacroData = await getMacroData();
      console.log("=== FETCHING GOAL VALUES ===");
      console.log("1. Goals from API:", JSON.stringify(goalsData, null, 2));
      console.log("2. Stored macro data (full):", JSON.stringify(storedMacroData, null, 2));

      // Extract values - prioritize API, fallback to stored data, then defaults
      // Structure matches planscreen.tsx extraction logic exactly
      let caloriesValue = 2000;
      let proteinValue = 150;
      let carbsValue = 200;
      let fatsValue = 65;

      // Priority order: 1) Stored macroNutrient, 2) Dashboard macroNutrient, 3) Dashboard macroGoal, 4) Goals API, 5) Stored macro data
      
      // Priority 1: Check stored macro data for macroNutrient structure first
      if (storedMacroData?.macroNutrient) {
        console.log("3. Using stored macroNutrient data");
        const macroNut = storedMacroData.macroNutrient;
        caloriesValue = macroNut.calories?.value || macroNut.calories?.goal || caloriesValue;
        proteinValue = macroNut.protein?.value || macroNut.protein?.goal || proteinValue;
        carbsValue = macroNut.carbs?.value || macroNut.carbs?.goal || carbsValue;
        fatsValue = macroNut.fats?.value || macroNut.fats?.goal || 
                   (macroNut as any).fat?.value || (macroNut as any).fat?.goal || fatsValue;
        console.log("3a. Extracted from stored macroNutrient:", {
          caloriesValue,
          proteinValue,
          carbsValue,
          fatsValue,
        });
      }
      // Priority 2: Check Dashboard API for macroNutrient structure
      else if (dashboardData?.macroNutrient) {
        console.log("3. Using Dashboard API macroNutrient data");
        const macroNut = dashboardData.macroNutrient;
        caloriesValue = macroNut.calories?.value || macroNut.calories?.goal || caloriesValue;
        proteinValue = macroNut.protein?.value || macroNut.protein?.goal || proteinValue;
        carbsValue = macroNut.carbs?.value || macroNut.carbs?.goal || carbsValue;
        fatsValue = macroNut.fats?.value || macroNut.fats?.goal || 
                   (macroNut as any).fat?.value || (macroNut as any).fat?.goal || fatsValue;
        console.log("3a. Extracted from dashboard macroNutrient:", {
          caloriesValue,
          proteinValue,
          carbsValue,
          fatsValue,
        });
      }
      // Priority 3: Use Dashboard macroGoal if available
      else if (dashboardData?.macroGoal) {
        console.log("3. Using Dashboard API macroGoal data");
        caloriesValue = dashboardData.macroGoal.calories?.value || dashboardData.macroGoal.calories?.goal || caloriesValue;
        proteinValue = dashboardData.macroGoal.protein?.value || dashboardData.macroGoal.protein?.goal || proteinValue;
        carbsValue = dashboardData.macroGoal.carbs?.value || dashboardData.macroGoal.carbs?.goal || carbsValue;
        fatsValue = dashboardData.macroGoal.fats?.value || dashboardData.macroGoal.fats?.goal || 
                   dashboardData.macroGoal.fat?.value || dashboardData.macroGoal.fat?.goal || fatsValue;
        console.log("3a. Extracted from dashboard macroGoal:", {
          caloriesValue,
          proteinValue,
          carbsValue,
          fatsValue,
        });
      }
      // Priority 4: Check Dashboard nutrients.goal as fallback
      else if (dashboardData?.nutrients || dashboardData?.calories) {
        console.log("3. Using Dashboard nutrients/calories data");
        if (dashboardData.nutrients) {
          proteinValue = dashboardData.nutrients.protein?.goal || proteinValue;
          carbsValue = dashboardData.nutrients.carbs?.goal || carbsValue;
          fatsValue = dashboardData.nutrients.fat?.goal || dashboardData.nutrients.fats?.goal || fatsValue;
        }
        if (dashboardData.calories?.goal) {
          caloriesValue = dashboardData.calories.goal || caloriesValue;
        }
        console.log("3a. Extracted from dashboard nutrients/calories:", {
          caloriesValue,
          proteinValue,
          carbsValue,
          fatsValue,
        });
      } else if (goalsData) {
        console.log("3. Using Goals API data");
        caloriesValue = goalsData.calories?.value || goalsData.calories?.goal || caloriesValue;
        proteinValue = goalsData.protein?.value || goalsData.protein?.goal || proteinValue;
        carbsValue = goalsData.carbs?.value || goalsData.carbs?.goal || carbsValue;
        fatsValue = goalsData.fats?.value || goalsData.fats?.goal || goalsData.fat?.value || goalsData.fat?.goal || fatsValue;
      } else if (storedMacroData) {
        console.log("3. Using stored macro data");
        // Extract exactly like planscreen.tsx does
        const macroNutrient = storedMacroData.macroNutrient || storedMacroData || {};
        const calories = macroNutrient.calories || {};
        const protein = macroNutrient.protein || {};
        const carbs = macroNutrient.carbs || {};
        const fats = macroNutrient.fats || {};

        console.log("4. Extracted nutrient objects:", {
          calories,
          protein,
          carbs,
          fats,
        });

        // Extract goal values (target/recommended values) - exactly like planscreen
        caloriesValue = calories.value || calories.goal || caloriesValue;
        proteinValue = protein.value || protein.goal || proteinValue;
        carbsValue = carbs.value || carbs.goal || carbsValue;
        fatsValue = fats.value || fats.goal || fatsValue;

        console.log("5. Extracted values from macroNutrient:", {
          caloriesValue,
          proteinValue,
          carbsValue,
          fatsValue,
        });
      } else {
        console.log("3. Using default values");
      }

      // Set the state values (remove any units/letters, keep only numbers)
      const caloriesString = String(caloriesValue).replace(/[^\d]/g, '');
      const proteinString = String(proteinValue).replace(/[^\d]/g, '');
      const carbsString = String(carbsValue).replace(/[^\d]/g, '');
      const fatString = String(fatsValue).replace(/[^\d]/g, '');

      setCalorie(caloriesString || "2000");
      setProtein(proteinString || "150");
      setCarbs(carbsString || "200");
      setFat(fatString || "65");

      console.log("6. Final loaded goal values:", {
        calories: caloriesString,
        protein: proteinString,
        carbs: carbsString,
        fat: fatString,
        source: dashboardData ? "Dashboard API" : goalsData ? "Goals API" : storedMacroData ? "Stored Macro Data" : "Defaults",
      });
      console.log("=== END FETCHING GOAL VALUES ===");
    } catch (error) {
      console.error("Error fetching goal values:", error);
      Alert.alert(
        "Error",
        "Failed to load goal values. Using defaults."
      );
      // Set defaults
      setCalorie("2000");
      setProtein("150");
      setCarbs("200");
      setFat("65");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchGoalValues();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Empty deps - we want to fetch fresh data each time screen is focused
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }} // add space for button
        >
  
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Adjust goals</Text>
            <View style={{ width: 22 }} />
          </View>
  
          {/* Form */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F2D9F" />
              <Text style={styles.loadingText}>Loading goals...</Text>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Calorie</Text>
              <TextInput
                value={calorie}
                onChangeText={(text) => {
                  // Allow only numbers
                  const numericText = text.replace(/[^\d]/g, '');
                  setCalorie(numericText);
                }}
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter calories"
              />
    
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                value={protein}
                onChangeText={(text) => {
                  // Allow only numbers
                  const numericText = text.replace(/[^\d]/g, '');
                  setProtein(numericText);
                }}
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter protein in grams"
              />
    
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={(text) => {
                  // Allow only numbers
                  const numericText = text.replace(/[^\d]/g, '');
                  setCarbs(numericText);
                }}
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter carbs in grams"
              />
    
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                value={fat}
                onChangeText={(text) => {
                  // Allow only numbers
                  const numericText = text.replace(/[^\d]/g, '');
                  setFat(numericText);
                }}
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter fat in grams"
              />
            </View>
          )}
  
        </ScrollView>
  
        {/* Fixed Button */}
        <TouchableOpacity
          style={[styles.addBtn, (loading || saving) && styles.addBtnDisabled]}
          onPress={async () => {
            try {
              setSaving(true);

              // Validate inputs
              const caloriesNum = parseInt(calorie) || 0;
              const proteinNum = parseInt(protein) || 0;
              const carbsNum = parseInt(carbs) || 0;
              const fatNum = parseInt(fat) || 0;

              if (caloriesNum <= 0 || proteinNum <= 0 || carbsNum <= 0 || fatNum <= 0) {
                Alert.alert("Error", "Please enter valid values for all goals.");
                setSaving(false);
                return;
              }

              // Update stored macro data with new values
              const existingMacroData = await getMacroData() || {};
              const macroNutrient = existingMacroData.macroNutrient || {};

              // Build macroNutrient structure with units
              const updatedMacroNutrient = {
                calories: {
                  ...(macroNutrient.calories || {}),
                  unit: macroNutrient.calories?.unit || "Cal",
                  value: caloriesNum,
                  goal: caloriesNum,
                },
                protein: {
                  ...(macroNutrient.protein || {}),
                  unit: macroNutrient.protein?.unit || "g",
                  value: proteinNum,
                  goal: proteinNum,
                },
                carbs: {
                  ...(macroNutrient.carbs || {}),
                  unit: macroNutrient.carbs?.unit || "g",
                  value: carbsNum,
                  goal: carbsNum,
                },
                fats: {
                  ...(macroNutrient.fats || {}),
                  unit: macroNutrient.fats?.unit || "g",
                  value: fatNum,
                  goal: fatNum,
                },
              };

              const updatedMacroData = {
                ...existingMacroData,
                macroNutrient: updatedMacroNutrient,
                calories: {
                  ...(existingMacroData.calories || {}),
                  unit: existingMacroData.calories?.unit || "Cal",
                  value: caloriesNum,
                  goal: caloriesNum,
                },
                protein: {
                  ...(existingMacroData.protein || {}),
                  unit: existingMacroData.protein?.unit || "g",
                  value: proteinNum,
                  goal: proteinNum,
                },
                carbs: {
                  ...(existingMacroData.carbs || {}),
                  unit: existingMacroData.carbs?.unit || "g",
                  value: carbsNum,
                  goal: carbsNum,
                },
                fats: {
                  ...(existingMacroData.fats || {}),
                  unit: existingMacroData.fats?.unit || "g",
                  value: fatNum,
                  goal: fatNum,
                },
              };

              // Save to storage
              await saveMacroData(updatedMacroData);

              console.log("✅ Goals saved:", updatedMacroData);

              Alert.alert(
                "Success",
                "Goals updated successfully!",
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              console.error("Error saving goals:", error);
              Alert.alert(
                "Error",
                error?.message || "Failed to save goals. Please try again."
              );
            } finally {
              setSaving(false);
            }
          }}
          disabled={loading || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.addBtnText}>Save goals</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5FB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    marginBottom: hp("2%"),
    justifyContent: "flex-start",
    textAlign: "left",
    gap: 20,
  },

  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
  },

  formContainer: {
    paddingHorizontal: wp("5%"),
  },

  label: {
    fontSize: RFValue(14),
    fontWeight: "400",
    marginTop: hp("2%"),
    marginBottom: hp("0.5%"),
  },

  input: {
    width: "100%",
    height: hp("6%"),
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    paddingHorizontal: wp("4%"),
    fontSize: RFValue(14),
    fontWeight: "600",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  addBtn: {
    backgroundColor: "#4F2D9F",
    paddingVertical: hp("2%"),
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 10,
    left: wp("4%"),
    right: wp("4%"),
  
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  addBtnText: {
    color: "#FFF",
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  fixedBottomContainer: {
    position: "absolute",
    bottom: hp("5%"),
    left: wp("5%"),
    right: wp("5%"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("10%"),
  },
  loadingText: {
    marginTop: hp("2%"),
    fontSize: RFValue(14),
    color: "#666",
  },
  addBtnDisabled: {
    opacity: 0.6,
  },
});
