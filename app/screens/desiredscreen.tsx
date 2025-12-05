  import ProgressBar from '@/components/ProgressBar';
  import Ruler from "@/components/Ruler";
  import wellnessApi from "@/api/wellnessApi";   // <-- ADD THIS
  import { Ionicons } from "@expo/vector-icons";
  import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
  import React, { useCallback, useMemo, useRef, useState } from "react";
  import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";

  const { width } = Dimensions.get("window");
  const SMALL_TICKS_PER_KG = 5;
  const ITEM_WIDTH = 16;
  const START_WEIGHT = 40;
  const END_WEIGHT = 140;

  export default function DesiredWeightScreen() {
    const router = useRouter();
    const [selectedWeight, setSelectedWeight] = useState(48);
    const [goalText, setGoalText] = useState("Lose Weight");
    const scrollX = useRef(new Animated.Value(0)).current;
    const { from } = useLocalSearchParams();
    const isFromSettings = from === "settings";

    // 👉 Load weight goal from API
    const loadGoalFromAPI = useCallback(async () => {
      try {
        const res = await wellnessApi.getWeightGoal();
        console.log("📥 Fetched weight goal:", res);

        if (res?.goalWeight?.kg) {
          setSelectedWeight(res.goalWeight.kg);
        }

        if (res?.goalType) {
          // lose / maintain / gain
          if (res.goalType.includes("lose")) setGoalText("Lose Weight");
          if (res.goalType.includes("maintain")) setGoalText("Maintain Weight");
          if (res.goalType.includes("gain")) setGoalText("Gain Weight");
        }
      } catch (e) {
        console.error("❌ Error fetching weight goal", e);
      }
    }, []);

    // load API when screen focused
    useFocusEffect(
      useCallback(() => {
        loadGoalFromAPI();
      }, [loadGoalFromAPI])
    );

    // 🔢 Build ruler ticks
    const ticks = useMemo(() => {
      const arr = [];
      let index = 0;
      for (let kg = START_WEIGHT; kg <= END_WEIGHT; kg++) {
        for (let i = 0; i < SMALL_TICKS_PER_KG; i++) {
          arr.push({
            value: kg + i / SMALL_TICKS_PER_KG,
            isMajor: i === 0,
            index: index++,
          });
        }
      }
      return arr;
    }, []);

    const initialIndex = (selectedWeight - START_WEIGHT) * SMALL_TICKS_PER_KG;

    scrollX.addListener(({ value }) => {
      const kgValue = START_WEIGHT + value / (SMALL_TICKS_PER_KG * ITEM_WIDTH);
      setSelectedWeight(Math.round(kgValue));
    });

    const handleSaveGoal = async () => {
      const goalWeightLbs = Math.round(selectedWeight * 2.20462);
    
      const payload = {
        goalWeight: {
          kg: selectedWeight,
          lbs: goalWeightLbs,
        },
      };
    
      try {
        if (isFromSettings) {
          // ⚡ SETTINGS MODE → Update only weight goal
          await wellnessApi.updateWeightGoal(payload);
          router.back();
        } else {
          // ⚡ ONBOARDING MODE → Save to onboarding + set weight goal
          await wellnessApi.saveOnboardingQuiz({
            goalWeightKg: selectedWeight,
            goalWeightLbs: goalWeightLbs,
            goalType: goalText.toLowerCase().includes("lose")
              ? "lose"
              : goalText.toLowerCase().includes("gain")
              ? "gain"
              : "maintain",
          });
    
          await wellnessApi.updateWeightGoal(payload);
    
          router.push("/screens/fastgoalscreen");
        }
      } catch (error) {
        console.error("❌ Failed to update weight goal:", error);
      }
    };
    

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.wrapper}>

          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              {!isFromSettings ? (
                <ProgressBar screen="desired" noContainer={true} />
              ) : (
                <View style={styles.headerRow}>
                  <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 12 }}>
                    Edit weight goal
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            {!isFromSettings && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  What is your desired weight?
                </Text>
                <Text style={styles.helperText}>
                  This will be used to calibrate your custom plan.
                </Text>
              </View>
            )}

            {/* Scale */}
            <View style={styles.scaleWrapper}>
              <View style={styles.weightInfo}>
                <Text style={styles.subLabel}>{goalText}</Text>
              </View>

              <Ruler />
            </View>
          </ScrollView>

          {/* Bottom CTA */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.primaryCta} onPress={handleSaveGoal}>
              <Text style={styles.primaryCtaText}>Next</Text>
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
    wrapper: {
      flex: 1,
    },
    headerContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: "#F9FAFB",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
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
    container: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 120,
      gap: 28,
    },
    section: {
      marginBottom: 8,
    },
    sectionLabel: {
      marginBottom: 8,
      fontSize: 26,
      fontWeight: "700",
      color: "#111827",
    },
    helperText: {
      fontSize: 15,
      color: "#6B7280",
      marginTop: 4,
    },
    scaleWrapper: {
      flex: 1,
      justifyContent: "center",
      marginBottom: 20,
    },
    weightInfo: {
      alignItems: "center",
      marginBottom: 90,
    },
    subLabel: {
      fontSize: 20,
      color: "#111",
      marginBottom: 8,
    },
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
    primaryCtaText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });
