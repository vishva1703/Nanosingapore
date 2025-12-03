import wellnessApi from "@/api/wellnessApi";
import { useActivity } from "@/components/ActivityContext";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from 'react-native-safe-area-context';

const RunScreen = () => {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const [intensity, setIntensity] = useState(2); 
  const [duration, setDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const { addActivity, setIsAnalyzing } = useActivity();

  // Get activity type from params or default to "Run"
  const activityType = typeof type === 'string' ? type : 'Run';
  
  const intensityTitle = (selected: boolean): TextStyle => ({
    fontSize: 16,
    fontWeight: "700",
    color: selected ? "#000" : "#aaa",
    marginTop: 8,
  });

  // Dynamic content based on activity type
  const getActivityConfig = (type: string) => {
    switch (type) {
      case "WeightLifting":
        return {
          title: "WeightLifting",
          icon: require("../../assets/images/weight lifting.png"), // Add this image
          intensityLabels: {
            high: "Heavy Lifting",
            medium: "Moderate Weights", 
            low: "Light Weights"
          },
          intensityDescriptions: {
            high: "Low reps, heavy weights near max capacity",
            medium: "Moderate weight with controlled reps",
            low: "Light weight for endurance and form"
          }
        };
      case "Run":
      default:
        return {
          title: "Run",
          icon: require("../../assets/images/run.png"),
          intensityLabels: {
            high: "High",
            medium: "Medium",
            low: "Low"
          },
          intensityDescriptions: {
            high: "Sprinting - 24 mph (4 minute miles)",
            medium: "Jogging - 24 mph (10 minute miles)", 
            low: "Chill walk - 6 mph (20 minute miles)"
          }
        };
    }
  };

  const activityConfig = getActivityConfig(activityType);
  const durationOptions = [15, 30, 60, 90];

  // Map intensity number to API string format
  const getIntensityString = (intensityValue: number): string => {
    switch (intensityValue) {
      case 0:
        return "low";
      case 1:
        return "medium";
      case 2:
        return "high";
      default:
        return "medium";
    }
  };

  // Calculate calories based on activity type and intensity
  const calculateCalories = () => {
    const baseCalories = activityType === "WeightLifting" ? 4 : 8; // Weight lifting burns fewer calories per minute
    const intensityMultiplier = intensity === 2 ? 1.5 : intensity === 1 ? 1.2 : 1;
    return Math.round(baseCalories * duration * intensityMultiplier);
  };

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>

    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={activityConfig.icon} style={{ width: 20, height: 20 }} />
          <Text style={styles.headerTitle}>{activityConfig.title}</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
  style={{ flex: 1 }} 
  contentContainerStyle={{ paddingBottom: hp(20) }}
  showsVerticalScrollIndicator={false}
>

        <Text style={styles.sectionTitle}>Set Intensity</Text>

        <View style={styles.intensityCard}>
          <View style={styles.intensityTextBlock}>
            <Text style={intensityTitle(intensity === 2)}>
              {activityConfig.intensityLabels.high}
            </Text>
            <Text style={styles.intensityDesc} numberOfLines={1} ellipsizeMode="tail">
              {activityConfig.intensityDescriptions.high}
            </Text>

            <Text style={intensityTitle(intensity === 1)}>
              {activityConfig.intensityLabels.medium}
            </Text>
            <Text style={styles.intensityDesc} numberOfLines={1} ellipsizeMode="tail">
              {activityConfig.intensityDescriptions.medium}
            </Text>

            <Text style={intensityTitle(intensity === 0)}>
              {activityConfig.intensityLabels.low}
            </Text>
            <Text style={styles.intensityDesc} numberOfLines={1} ellipsizeMode="tail">
              {activityConfig.intensityDescriptions.low}
            </Text>
          </View>

          <View style={styles.verticalSliderContainer}>
            <Slider
              style={styles.verticalSlider}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor="#4F2D9F"
              maximumTrackTintColor="#D3D3D3"
              thumbTintColor="#4F2D9F"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Duration</Text>

        <View style={styles.durationRow}>
          {durationOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.durationChip,
                duration === item && styles.durationChipActive,
              ]}
              onPress={() => setDuration(item)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === item && styles.durationTextActive,
                ]}
              >
                {item} mins
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(duration)}
          onChangeText={(t) => setDuration(Number(t))}
        />
      </ScrollView>

      <TouchableOpacity 
        style={[styles.addBtn, loading && styles.addBtnDisabled]}
        onPress={async () => {
          if (loading) return;
          
          try {
            setLoading(true);
            setIsAnalyzing(true);
            
            // Get current date and time
            const now = new Date();
            const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            // Map intensity to API format
            const intensityString = getIntensityString(intensity);
            
            console.log("🏃 Logging exercise to backend:", {
              type: activityType,
              intensity: intensityString,
              duration,
              date: currentDate
            });
            
            // Call appropriate API endpoint based on activity type
            let apiResponse;
            const requestPayload = {
              intensity: intensityString,
              duration,
              date: currentDate
            };
            
            console.log("📤 [RunScreen] Sending request payload:", JSON.stringify(requestPayload, null, 2));
            
            if (activityType === "WeightLifting") {
              apiResponse = await (wellnessApi.logWeightLifting as any)(requestPayload);
            } else {
              // Default to Run
              apiResponse = await (wellnessApi.logRun as any)(requestPayload);
            }
            
            console.log("📥 [RunScreen] Full API Response:", JSON.stringify(apiResponse, null, 2));
            console.log("📥 [RunScreen] Response type:", typeof apiResponse);
            console.log("📥 [RunScreen] Response keys:", apiResponse ? Object.keys(apiResponse) : 'null');
            
            // Verify response indicates success
            // Success indicators: flag === true, success === true, or presence of data/logId
            const hasSuccessFlag = apiResponse?.flag === true;
            const hasSuccessProperty = apiResponse?.success === true;
            const hasData = !!apiResponse?.data;
            const hasLogId = !!(apiResponse?.logId || apiResponse?.id || apiResponse?.data?.logId || apiResponse?.data?.id);
            
            // Failure indicators: flag === false, success === false, or explicit error
            const hasFailureFlag = apiResponse?.flag === false;
            const hasFailureProperty = apiResponse?.success === false;
            const hasError = !!(apiResponse?.error || (apiResponse?.message && apiResponse?.message.toLowerCase().includes('error')));
            
            // Check if message indicates success (common success messages)
            const successMessages = ['logged', 'saved', 'created', 'success', 'added'];
            const message = apiResponse?.message?.toLowerCase() || '';
            const hasSuccessMessage = successMessages.some(successMsg => message.includes(successMsg));
            
            const isSuccess = (hasSuccessFlag || hasSuccessProperty || hasData || hasLogId || hasSuccessMessage) && 
                            !hasFailureFlag && 
                            !hasFailureProperty && 
                            !hasError;
            
            console.log("🔍 [RunScreen] Success check:", {
              hasSuccessFlag,
              hasSuccessProperty,
              hasData,
              hasLogId,
              hasSuccessMessage,
              hasFailureFlag,
              hasFailureProperty,
              hasError,
              isSuccess,
              message: apiResponse?.message
            });
            
            if (!isSuccess) {
              console.warn("⚠️ [RunScreen] API response indicates failure:", apiResponse);
              const errorMsg = apiResponse?.error || 
                             (apiResponse?.message && !hasSuccessFlag && !hasSuccessMessage ? apiResponse.message : null) ||
                             "Unknown error";
              throw new Error(errorMsg);
            }
            
            console.log("✅ [RunScreen] Exercise successfully logged to database!");
            console.log("✅ [RunScreen] Success message:", apiResponse?.message || "Exercise logged successfully");
            
            // Extract logId from API response (try multiple possible locations)
            const logId = apiResponse?.data?.logId || 
                         apiResponse?.data?.id || 
                         apiResponse?.data?.exerciseLogId ||
                         apiResponse?.logId || 
                         apiResponse?.id ||
                         apiResponse?.data?.data?.logId;
            
            console.log("🆔 [RunScreen] Extracted logId:", logId);
            
            // Log verification details
            if (logId) {
              console.log("✅ [RunScreen] ✅ VERIFICATION: Data saved to database with logId:", logId);
              console.log("✅ [RunScreen] You can verify this by:");
              console.log("   1. Checking the 'Recently Logged' section on the dashboard");
              console.log("   2. The activity should appear in the recent logs API");
              console.log("   3. The logId can be used to update/delete this entry later");
              
              // Optional: Verify by fetching recent logs (for debugging)
              try {
                console.log("🔍 [RunScreen] Verifying by fetching recent logs...");
                const recentLogsResponse = await wellnessApi.getRecentLogs({
                  page: 1,
                  limit: 10,
                  date: currentDate
                });
                console.log("📋 [RunScreen] Recent logs response:", JSON.stringify(recentLogsResponse, null, 2));
                
                const recentLogs = recentLogsResponse?.data?.list || 
                                 recentLogsResponse?.data || 
                                 recentLogsResponse?.list ||
                                 recentLogsResponse || [];
                
                // Check if our logged exercise appears in recent logs
                const foundLog = Array.isArray(recentLogs) 
                  ? recentLogs.find((log: any) => 
                      (log.logId === logId || log.id === logId) ||
                      (log.type === activityConfig.title.toLowerCase() && 
                       log.duration === duration)
                    )
                  : null;
                
                if (foundLog) {
                  console.log("✅ [RunScreen] ✅ VERIFICATION SUCCESS: Exercise found in recent logs!");
                  console.log("✅ [RunScreen] Found log:", JSON.stringify(foundLog, null, 2));
                } else {
                  console.log("ℹ️ [RunScreen] Exercise may not appear in recent logs yet (could be a timing issue)");
                  console.log("ℹ️ [RunScreen] Recent logs count:", Array.isArray(recentLogs) ? recentLogs.length : 0);
                }
              } catch (verifyError) {
                console.warn("⚠️ [RunScreen] Could not verify via recent logs (non-critical):", verifyError);
              }
            } else {
              console.warn("⚠️ [RunScreen] No logId found in response, but request may have succeeded");
              console.warn("⚠️ [RunScreen] Response structure:", JSON.stringify(apiResponse, null, 2));
            }
            
            // Create activity object with API response data
            const activityData = {
              id: logId || `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: activityConfig.title,
              intensity,
              duration,
              calories: calculateCalories(),
              time: currentTime,
              date: currentDate,
              logId: logId, // Store API logId for future updates/deletes
            };
            
            console.log("🏃 [RunScreen] Adding activity to context:", activityData);
            
            // Add to context (for immediate display on index page)
            addActivity(activityData);
            
            // Show success message with verification details
            const successMessage = logId 
              ? `Exercise logged successfully!\n\nLog ID: ${logId}\n\nYou can verify this in the "Recently Logged" section.`
              : `Exercise logged successfully!\n\nCheck the "Recently Logged" section to verify.`;
            
            Alert.alert(
              "Success! ✅",
              successMessage,
              [
                {
                  text: "OK",
                  onPress: async () => {
                    // Small delay to ensure backend has processed the request
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Navigate to dashboard (index page) - activity will appear in "Recently Logged" section
                    // The useFocusEffect in index.tsx will automatically refresh the data
                    router.push('/(tabs)/');
                  }
                }
              ],
              { cancelable: false }
            );
          } catch (error: any) {
            console.error("❌ [RunScreen] Error logging exercise:", error);
            console.error("❌ [RunScreen] Error type:", typeof error);
            console.error("❌ [RunScreen] Error message:", error?.message);
            console.error("❌ [RunScreen] Error response:", error?.response);
            console.error("❌ [RunScreen] Error response data:", error?.response?.data);
            console.error("❌ [RunScreen] Error response status:", error?.response?.status);
            console.error("❌ [RunScreen] Full error object:", JSON.stringify(error, null, 2));
            
            const errorMessage = error?.response?.data?.message || 
                               error?.response?.data?.error ||
                               error?.message || 
                               "Failed to log exercise. Please try again.";
            
            const errorDetails = error?.response?.status 
              ? `Status: ${error?.response?.status}\n\n${errorMessage}`
              : errorMessage;
            
            Alert.alert(
              "Error ❌",
              errorDetails,
              [{ text: "OK" }]
            );
          } finally {
            setLoading(false);
            setIsAnalyzing(false);
          }
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.addBtnText}>+ Add</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default RunScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F9",
    paddingHorizontal: wp("4%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("2%"),
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  section: {
    marginTop: hp("1%"),
  },
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: "600",
    marginVertical: hp("1%"),
  },
  intensityCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: wp("4%"),
    borderRadius: 14,
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  intensityTextBlock: {
    flex: 1,
    paddingRight: wp("2%"),
  },
  intensityDesc: {
    fontSize: RFValue(11),
    color: "#6D6D6D",
    marginBottom: hp("1%"),
    flexShrink: 1,
  },
  verticalSliderContainer: {
    width: 70,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("2%"),
    overflow: "visible",
  },
  verticalSlider: {
    width: 180,
    height: 60,
    transform: [{ rotate: "-90deg" }],
    overflow: "visible",
    position: "absolute",
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: hp("1.5%"),
  },
  durationChip: {
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  durationChipActive: {
    backgroundColor: "#4F2D9F",
  },
  durationText: {
    color: "#000",
    fontSize: RFValue(11),
  },
  durationTextActive: {
    color: "#FFF",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    fontSize: RFValue(13),
    marginBottom: hp("2%"),
  },
  caloriesPreview: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  caloriesText: {
    fontSize: RFValue(14),
    color: "#666",
  },
  caloriesNumber: {
    fontWeight: "700",
    color: "#4F2D9F",
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
  addBtnDisabled: {
    opacity: 0.6,
  },
});