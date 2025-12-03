import wellnessApi from '@/api/wellnessApi';
import ProgressBar from '@/components/ProgressBar';
import { getOnboardingData } from '@/utils/onboardingStorage';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function GreatingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const collectOnboardingData = async () => {
    try {
      // Get all stored onboarding data
      const storedData = await getOnboardingData();
      
      // Log the raw stored data
      console.log("=== ONBOARDING DATA COLLECTION ===");
      console.log("Raw stored data from AsyncStorage:", JSON.stringify(storedData, null, 2));
      
      if (!storedData) {
        console.error("ERROR: No onboarding data found in storage");
        Alert.alert("Error", "Onboarding data not found. Please complete the onboarding process.");
        return null;
      }

      // Build the payload for auto-generate-macro API
      const payload: any = {
        gender: storedData.gender || "male",
        activityLevel: storedData.activityLevel || "sedentary",
        unitSystem: storedData.unitSystem || "Imperial",
        height: storedData.height || { cm: 170, feet: 5, inches: 7 },
        weight: storedData.weight || { kg: 70, lbs: 154 },
        dateOfBirth: storedData.dateOfBirth || new Date().toISOString(),
        goal: storedData.goal || "Lose weight",
        goalWeight: storedData.goalWeight || { kg: 65, lbs: 143 },
        changeInWeightPerWeek: storedData.changeInWeightPerWeek || { kg: 0.5, lbs: 1.1 },
      };

      // Add optional fields if they exist
      if (storedData.goalObstacles) {
        payload.goalObstacles = storedData.goalObstacles;
      }
      if (storedData.wantToAccomplish) {
        payload.wantToAccomplish = storedData.wantToAccomplish;
      }
      if (storedData.dietType) {
        payload.dietType = storedData.dietType;
      }

      // Log the complete payload before sending
      console.log("=== API PAYLOAD ===");
      console.log("Complete payload to be sent:", JSON.stringify(payload, null, 2));
      console.log("Payload keys:", Object.keys(payload));
      console.log("Payload values:", Object.values(payload));

      return payload;
    } catch (error: any) {
      console.error("=== ERROR COLLECTING ONBOARDING DATA ===");
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to collect onboarding data. Please try again.");
      return null;
    }
  };

  const handleGenerateMacro = async () => {
    try {
      setLoading(true);

      console.log("=== STARTING MACRO GENERATION ===");
      console.log("Timestamp:", new Date().toISOString());

      // Collect all onboarding data
      const payload = await collectOnboardingData();
      if (!payload) {
        console.error("ERROR: Failed to collect payload, aborting API call");
        setLoading(false);
        return;
      }

      console.log("=== CALLING AUTO-GENERATE-MACRO API ===");
      console.log("API endpoint: /nutrition-api/auth/auto-generate-macro");
      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      // Call auto-generate-macro API
      const response = await wellnessApi.autoGenerateMacro(payload);
      
      console.log("=== API RESPONSE RECEIVED ===");
      console.log("Full response:", JSON.stringify(response, null, 2));
      console.log("Response keys:", Object.keys(response || {}));
      console.log("Response.data:", response?.data);
      console.log("Response.result:", response?.result);
      
      // Handle response
      const macroData = response?.data || response?.result || response;

      console.log("=== PROCESSED MACRO DATA ===");
      console.log("Macro data to be displayed:", JSON.stringify(macroData, null, 2));

      // Navigate to planscreen with generated macro data
      console.log("=== NAVIGATING TO PLAN SCREEN ===");
      router.push({
        pathname: "/screens/planscreen",
        params: {
          macroData: JSON.stringify(macroData),
        },
      });
      
      console.log("=== MACRO GENERATION SUCCESS ===");
    } catch (error: any) {
      console.error("=== ERROR GENERATING MACRO ===");
      console.error("Error timestamp:", new Date().toISOString());
      console.error("Error type:", typeof error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      
      // Log error response details if available
      if (error?.response) {
        console.error("=== ERROR RESPONSE DETAILS ===");
        console.error("Status:", error.response.status);
        console.error("Status text:", error.response.statusText);
        console.error("Headers:", JSON.stringify(error.response.headers, null, 2));
        console.error("Response data:", JSON.stringify(error.response.data, null, 2));
        console.error("Response config:", JSON.stringify(error.response.config, null, 2));
      }
      
      // Log request details if available
      if (error?.request) {
        console.error("=== ERROR REQUEST DETAILS ===");
        console.error("Request:", JSON.stringify(error.request, null, 2));
      }
      
      // Log full error object
      console.error("=== FULL ERROR OBJECT ===");
      console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Failed to generate macros. Please try again.";
      
      console.error("=== USER-FACING ERROR MESSAGE ===");
      console.error("Message:", errorMessage);
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
      console.log("=== MACRO GENERATION PROCESS COMPLETED ===");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* 🔹 Header Progress */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            {/* <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color="#1F2937" />
            </TouchableOpacity> */}

            <ProgressBar screen="greeting" noContainer={true} />
          </View>
        </View>

        {/* 🔹 Center Content */}
        <View style={styles.centerContent}>
          {/* ✅ Icon and Text Inline */}
          <View style={styles.inlineContainer}>
            <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />
            <Text style={styles.subTextInline}>All done!</Text>
          </View>

          <Text style={styles.mainText}>
            Thank you for{"\n"}
            <Text style={styles.highlightText}>trusting us</Text>
          </Text>

          <Text style={styles.bottomSubText}>
            This will be used to calibrate your{"\n"}custom plan
          </Text>
        </View>

        {/* 🔹 Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.primaryCta, loading && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={handleGenerateMacro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.primaryCtaText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  wrapper: { flex: 1 },

  // HEADER
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
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4B3AAC",
  },

  // MAIN CONTENT
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 150,
  },

  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  subTextInline: {
    fontSize: 15,
    color: "#6B7280",
    marginLeft: 6, // spacing between icon and text
  },

  mainText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 10,
  },
  highlightText: {
    color: "#111827",
    fontWeight: "700",
  },
  bottomSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
  },

  // BUTTON
  bottomContainer: {
    position: "absolute",
    bottom: 32,
    left: 24,
    right: 24,
  },
  primaryCta: {
    backgroundColor: "#4B3AAC",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#4B3AAC",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryCtaText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
