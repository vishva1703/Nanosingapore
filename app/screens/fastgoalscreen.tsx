import ProgressBar from '@/components/ProgressBar';
import { getOnboardingData, saveOnboardingData } from '@/utils/onboardingStorage';
import Slider from "@react-native-community/slider";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function FastGoalScreen() {
  const router = useRouter();

  const minWeight = 0.1;  
  const maxWeight = 1.5;
  const [currentWeight, setCurrentWeight] = useState(0.8);
  const [goalText, setGoalText] = useState("Lose Weight");

  // Load goal from storage and set the display text
  const loadGoal = useCallback(async () => {
    try {
      const onboardingData = await getOnboardingData();
      if (onboardingData?.goal) {
        // Map the stored goal value to display text
        const goal = onboardingData.goal.toLowerCase();
        if (goal.includes("lose")) {
          setGoalText("Lose Weight");
        } else if (goal.includes("maintain")) {
          setGoalText("Maintain Weight");
        } else if (goal.includes("gain")) {
          setGoalText("Gain Weight");
        } else {
          setGoalText("Lose Weight"); // default fallback
        }
      }
    } catch (error) {
      console.error("Error loading goal:", error);
    }
  }, []);

  // Load goal when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadGoal();
    }, [loadGoal])
  );

  // 🔹 Static header progress (e.g. step 2 of 4)

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* 🔹 Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            {/* <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity> */}

            {/* Fixed progress bar */}
              <ProgressBar screen="fast-goal" noContainer={true} />
          </View>
        </View>

        {/* 🔹 Main Content */}
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
          <Text style={styles.title}>How fast do you want to reach your Goal?</Text>
          <Text style={styles.subtitle}>
            This will be used to calibrate your custom plan.
          </Text>
</View>
          {/* 🔹 Weight Info */}
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={styles.helperText}>{goalText} speed per week</Text>
            <Text style={styles.weightText}>{currentWeight.toFixed(1)} kg</Text>
          </View>

          {/* 🔹 Interactive Slider */}
          <View style={styles.progressContainer}>
            <Slider
              style={{ width: width * 0.85, height: 40 }}
              minimumValue={minWeight}
              maximumValue={maxWeight}
              value={currentWeight}
              step={0.1}
              minimumTrackTintColor="#4B3AAC"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#4B3AAC"
              onValueChange={(value) => setCurrentWeight(value)}
            />

            <View style={styles.labelRow}>
              <Text style={styles.labelText}>0.1 kg</Text>
              <Text style={[styles.labelText, { color: "#4B3AAC", fontWeight: "600" }]}>
                {currentWeight.toFixed(1)} kg
              </Text>
              <Text style={styles.labelText}>1.5 kg</Text>
            </View>
          </View>
        </ScrollView>

        {/* 🔹 Next Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={async () => {
              // Convert kg per week to lbs per week (1 kg = 2.20462 lbs)
              const changeInWeightPerWeekLbs = Math.round(currentWeight * 2.20462 * 10) / 10; // Round to 1 decimal

              // Save change in weight per week
              try {
                await saveOnboardingData({
                  changeInWeightPerWeek: {
                    kg: currentWeight,
                    lbs: changeInWeightPerWeekLbs,
                  },
                });
                console.log("✅ Saved change in weight per week:", currentWeight, "kg /", changeInWeightPerWeekLbs, "lbs");
              } catch (error) {
                console.error("Error saving change in weight per week:", error);
              }

              router.push("/screens/losingwightscreen");
            }}
          >
            <Text style={styles.primaryCtaText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  wrapper: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 120,
    gap: 28,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4B3AAC" },
  
  section: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 22,
  },
  helperText: {
    fontSize: 15,
    color: "#6B7280",
  },
  weightText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#4B3AAC",
    marginTop: 6,
  },
  progressContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.85,
    marginTop: 6,
  },
  labelText: { fontSize: 14, color: "#6B7280" },
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
  },
  primaryCtaText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
