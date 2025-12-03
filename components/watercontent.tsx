import { ProfileAPI } from "@/api/profile";
import wellnessApi from "@/api/wellnessApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from "react-native-responsive-screen";
import Svg, { Circle } from "react-native-svg";

interface WaterContentProps {
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  showWaterModal: boolean;
  setShowWaterModal: (show: boolean) => void;
  selectedAmount: number;
  setSelectedAmount: (amount: number) => void;
  nutrients: Array<{
    label: string;
    grams: number;
    color: string;
    value: number;
    icon: any;
  }>;
  date?: string; // Date in YYYY-MM-DD format
  onRefresh?: () => void; // Callback to refresh dashboard data
  currentWaterIntake?: number; // Current water intake in ml from dashboard
  steps?: number; // Current steps count from dashboard
}

interface CircleProgressProps {
  progress: number;
  color: string;
  label: string;
  sizeMultiplier?: number;
  showFire?: boolean;
  iconSource?: any;
  grams?: number;
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  progress,
  color,
  label,
  sizeMultiplier = 1.25,
  showFire = false,
  iconSource,
  grams,
}) => {
  const baseSize = wp("18%");
  const size = baseSize * sizeMultiplier;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View
      style={[
        styles.nutrientCard,
        showFire && { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
      ]}
    >
      {grams && (
        <Text style={styles.gramText}>
          {grams} g
        </Text>
      )}
      {!showFire && (
        <Text style={styles.gramLabel}>{label} left</Text>
      )}

      <View style={[styles.ringCard, { width: size, height: size }]}>
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

        <View style={styles.ringCenterContent}>
          {showFire ? (
            <View
              style={{
                width: wp("10%"),
                height: wp("10%"),
                borderRadius: wp("5%"),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="footsteps"
                size={RFValue(20)}
                color="#44CAF3"
              />
            </View>
          ) : (
            iconSource && (
              <Image
                source={iconSource}
                style={{
                  width: wp("10%"),
                  height: wp("10%"),
                  resizeMode: "contain",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: hp("3%"),
                }}
              />
            )
          )}
        </View>
      </View>
    </View>
  );
};

const WaterContent: React.FC<WaterContentProps> = ({
  showPopup,
  setShowPopup,
  showWaterModal,
  setShowWaterModal,
  selectedAmount,
  setSelectedAmount,
  nutrients,
  date,
  onRefresh,
  currentWaterIntake = 0,
  steps: stepsProp = 0,
}) => {
  // Local state for the picker
  const [showPicker, setShowPicker] = useState(false);
  const [originalAmount, setOriginalAmount] = useState(selectedAmount);
  const pickerScrollRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [waterSettings, setWaterSettings] = useState<{ value?: number; unit?: string } | null>(null);
  const [steps, setSteps] = useState<number>(stepsProp);
  const [stepsLoading, setStepsLoading] = useState(false);

  const waterOptions = [250, 500, 750, 1000, 1250, 1500, 1750, 2000];

  // Helper to get current date in YYYY-MM-DD format
  const getCurrentDate = useCallback((): string => {
    if (date) return date;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [date]);

  // Fetch water intake settings on mount and when modal opens
  useEffect(() => {
    const fetchWaterSettings = async () => {
      try {
        console.log("💧 [WaterContent] Fetching water intake settings...");
        const response = await ProfileAPI.getWaterIntakeSettings();
        console.log("💧 [WaterContent] Water intake settings response:", JSON.stringify(response, null, 2));
        
        // Check if API call was successful (handle both flag and success)
        const isSuccess = response?.success || (response as any)?.flag === true;
        if (response && isSuccess && response.data) {
          const settings = response.data;
          setWaterSettings(settings);
          // Update selectedAmount if settings exist
          if (settings.value) {
            setSelectedAmount(settings.value);
            console.log("✅ [WaterContent] Loaded water settings and updated selectedAmount:", settings);
          } else {
            console.log("✅ [WaterContent] Loaded water settings (no value):", settings);
          }
        } else {
          console.warn("⚠️ [WaterContent] Water intake settings response not successful or missing data");
          // Try fallback to wellnessApi if ProfileAPI fails
          try {
            const fallbackResponse = await wellnessApi.getWaterIntakeSettings();
            const fallbackSettings = fallbackResponse?.data || fallbackResponse?.result || fallbackResponse;
            if (fallbackSettings) {
              setWaterSettings(fallbackSettings);
              if (fallbackSettings.value) {
                setSelectedAmount(fallbackSettings.value);
              }
              console.log("✅ [WaterContent] Loaded water settings from fallback API:", fallbackSettings);
            }
          } catch (fallbackError) {
            console.error("❌ [WaterContent] Fallback API also failed:", fallbackError);
          }
        }
      } catch (error: any) {
        console.error("❌ [WaterContent] Error fetching water settings:", error);
        // Try fallback to wellnessApi if ProfileAPI fails
        try {
          const fallbackResponse = await wellnessApi.getWaterIntakeSettings();
          const fallbackSettings = fallbackResponse?.data || fallbackResponse?.result || fallbackResponse;
          if (fallbackSettings) {
            setWaterSettings(fallbackSettings);
            if (fallbackSettings.value) {
              setSelectedAmount(fallbackSettings.value);
            }
            console.log("✅ [WaterContent] Loaded water settings from fallback API:", fallbackSettings);
          }
        } catch (fallbackError) {
          console.error("❌ [WaterContent] Fallback API also failed:", fallbackError);
          // Don't show alert on initial load - just log
        }
      }
    };

    fetchWaterSettings();
  }, []);

  // Refresh water settings when modal opens
  useEffect(() => {
    if (showWaterModal) {
      const refreshWaterSettings = async () => {
        try {
          const response = await ProfileAPI.getWaterIntakeSettings();
          const isSuccess = response?.success || (response as any)?.flag === true;
          if (response && isSuccess && response.data) {
            const settings = response.data;
            setWaterSettings(settings);
            if (settings.value) {
              setSelectedAmount(settings.value);
            }
          }
        } catch (error) {
          console.error("Error refreshing water settings:", error);
        }
      };
      refreshWaterSettings();
    }
  }, [showWaterModal, setSelectedAmount]);

  // Fetch steps from dashboard
  useEffect(() => {
    const fetchSteps = async () => {
      try {
        setStepsLoading(true);
        const currentDate = getCurrentDate();
        console.log("🚶 [WaterContent] Fetching steps from dashboard...");
        console.log("🚶 [WaterContent] Date:", currentDate);

        const dashboardResponse = await wellnessApi.getDashboard(currentDate);
        console.log("🚶 [WaterContent] Dashboard response:", JSON.stringify(dashboardResponse, null, 2));

        // Extract steps from dashboard response
        const dashboard = dashboardResponse?.data || dashboardResponse?.result || dashboardResponse;
        const stepsValue = dashboard?.steps || dashboard?.stepCount || dashboard?.stepsCount || 0;
        
        if (stepsValue > 0) {
          setSteps(stepsValue);
          console.log("✅ [WaterContent] Steps fetched:", stepsValue);
        } else {
          console.log("⚠️ [WaterContent] No steps found in dashboard, using prop value:", stepsProp);
          setSteps(stepsProp);
        }
      } catch (error: any) {
        console.error("❌ [WaterContent] Error fetching steps:", error);
        // Fallback to prop value if API fails
        setSteps(stepsProp);
      } finally {
        setStepsLoading(false);
      }
    };

    fetchSteps();
  }, [date, getCurrentDate, stepsProp]);

  // Update steps when prop changes
  useEffect(() => {
    if (stepsProp !== undefined && stepsProp !== steps) {
      setSteps(stepsProp);
    }
  }, [stepsProp]);

  // Handle logging water intake (+ button)
  const handleAddWater = useCallback(async () => {
    try {
      setLoading(true);
      const currentDate = getCurrentDate();

      console.log("=== LOGGING WATER INTAKE ===");
      console.log("Date:", currentDate);

      const response = await wellnessApi.logWaterIntake({ date: currentDate });
      console.log("✅ Water intake logged successfully:", response);

      // Refresh dashboard data to show updated water intake
      if (onRefresh) {
        onRefresh();
      }

      Alert.alert("Success", "Water intake logged successfully!");
    } catch (error: any) {
      console.error("=== ERROR LOGGING WATER ===");
      console.error("Error:", error);
      console.error("Response:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Failed to log water intake. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [getCurrentDate, onRefresh]);

  // Handle removing last water log (- button)
  const handleRemoveWater = useCallback(async () => {
    try {
      setLoading(true);
      const currentDate = getCurrentDate();

      console.log("=== REMOVING WATER INTAKE ===");
      console.log("Date:", currentDate);

      const response = await wellnessApi.removeWaterLogIntake({ date: currentDate });
      console.log("✅ Water intake removed successfully:", response);

      // Refresh dashboard data
      if (onRefresh) {
        onRefresh();
      }

      Alert.alert("Success", "Last water intake entry removed!");
    } catch (error: any) {
      console.error("=== ERROR REMOVING WATER ===");
      console.error("Error:", error);
      console.error("Response:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Failed to remove water intake. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [getCurrentDate, onRefresh]);

  // Handle saving water settings
  const handleSaveWaterSettings = useCallback(async () => {
    try {
      setSaving(true);
      const unit = selectedAmount >= 1000 ? "L" : "ml";
      const value = selectedAmount;

      console.log("=== UPDATING WATER SETTINGS ===");
      console.log("Value:", value, "Unit:", unit);

      // Save to backend using ProfileAPI or wellnessApi
      let response;
      try {
        // Try using ProfileAPI first (if updateWaterIntakeSettings is available)
        // Otherwise use wellnessApi
        response = await wellnessApi.updateWaterIntakeSettings({ value, unit });
        console.log("✅ [WaterContent] Water settings updated successfully via wellnessApi:", response);
      } catch (apiError: any) {
        console.error("❌ [WaterContent] Error updating via wellnessApi:", apiError);
        throw apiError;
      }

      // Update local state
      setWaterSettings({ value, unit });
      
      // Update parent component's selectedAmount prop
      setSelectedAmount(value);
      
      // Close modal and picker
      setShowPicker(false);
      setShowWaterModal(false);

      Alert.alert("Success", `Water serving size set to ${value} ${unit}!`);
    } catch (error: any) {
      console.error("=== ERROR UPDATING WATER SETTINGS ===");
      console.error("Error:", error);
      console.error("Response:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Failed to update water settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }, [selectedAmount, setSelectedAmount]);

  // Scroll to selected value when picker opens
  React.useEffect(() => {
    if (showPicker && pickerScrollRef.current) {
      const selectedIndex = waterOptions.indexOf(selectedAmount);
      if (selectedIndex !== -1) {
        setTimeout(() => {
          pickerScrollRef.current?.scrollTo({
            y: selectedIndex * 50,
            animated: true,
          });
        }, 100);
      }
    }
  }, [showPicker, selectedAmount]);

  const avg = (
    (nutrients[0].value + nutrients[1].value + nutrients[2].value) / 3
  ).toFixed(2);

  return (
    <View style={styles.contentContainer}>
      {/* Calories Row */}
      <View style={styles.caloriesRow}>
        {/* Card 1 - Steps */}
        <View style={{ position: "relative" }}>
          <TouchableOpacity
            style={[styles.smallCard, { marginRight: wp("3%") }]}
            activeOpacity={0.7}
            onPress={() => setShowPopup(true)}
          >
            <Text style={styles.stepText}>
              <Text style={styles.stepCurrent}>{stepsLoading ? "..." : steps.toLocaleString()}</Text>
              <Text style={styles.stepTotal}> /10,000</Text>
            </Text>
            <Text style={styles.stepText1}>Steps today</Text>

            <CircleProgress
              progress={Number(avg)}
              color="#44CAF3"
              label=""
              sizeMultiplier={1.6}
              showFire={true}
            />
          </TouchableOpacity>

          {/* Grey Overlay Only on Card */}
          {showPopup && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: wp("46%"),
                height: hp("28%"),
                backgroundColor: "rgba(0,0,0,0.25)",
                borderRadius: wp("5%"),
                zIndex: 9,
              }}
            />
          )}

          {/* Popup */}
          {showPopup && (
            <View style={styles.popoverWrapper}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="heart" size={RFValue(15)} color="#FF4C4C" style={{ marginRight: 8 }} />
                <Text style={styles.popoverText}>Connect Apple Health to track your steps</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card 2 - Calories Burned */}
        <TouchableOpacity
          style={[styles.smallCard, { paddingVertical: hp("2%"), paddingHorizontal: wp("4%") }]}
          activeOpacity={0.7}
        >
          {/* TOP: Calories Burned */}
          <View style={{ marginBottom: hp("1.5%") }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="flame" size={RFValue(20)} color="#000" style={{ marginRight: 6, marginTop: hp("2%") }} />
              <Text style={{ fontSize: RFValue(22), fontWeight: "700", color: "#000" }}>40</Text>
            </View>
            <Text style={{ color: "#000", fontSize: RFValue(13), marginLeft: wp("8%"), marginTop: -hp("0.3%") }}>
              Calories Burned
            </Text>
          </View>

          {/* STATS LIST */}
          <View style={{ marginTop: hp("1%") }}>
            {/* Steps */}
            <View style={styles.statRow}>
              <Ionicons name="footsteps" size={RFValue(18)} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Steps</Text>
              <Text style={styles.statValue}>+48</Text>
            </View>

            {/* Run */}
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="run" size={RFValue(18)} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Run</Text>
              <Text style={styles.statValue}>+189</Text>
            </View>

            {/* Weight lifting */}
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="weight-lifter" size={RFValue(18)} color="#000" style={styles.statIcon} />
              <Text style={styles.statLabel}>Weight lifting</Text>
              <Text style={styles.statValue}>+75</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Water Card */}
      <View style={styles.foodWaterCard}>
        {/* Left icon */}
        <Ionicons
          name="water"
          size={RFValue(26)}
          color="#44CAF3"
          style={{ marginRight: 6 }}
        />

        {/* Middle Section */}
        <View style={{ flex: 1, marginLeft: wp("3%") }}>
          {/* Title */}
          <Text style={styles.waterTitle}>Water</Text>

          {/* Amount + Settings Icon in same row */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: hp("0.3%") }}>
            <View>
              <Text style={styles.waterAmount}>{waterSettings?.value} ml</Text>
              
            </View>
            <TouchableOpacity onPress={() => setShowWaterModal(true)}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={RFValue(18)}
                color="#555"
                style={{ marginLeft: wp("3%"), marginTop: hp("1%") }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Minus Button */}
        <TouchableOpacity
          style={[styles.circleBtn, loading && styles.circleBtnDisabled]}
          onPress={handleRemoveWater}
          disabled={loading || currentWaterIntake <= 0}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.circleBtnText}>−</Text>
          )}
        </TouchableOpacity>

        {/* Plus Button */}
        <TouchableOpacity
          style={[styles.circleBtn, styles.circleBtnDark, loading && styles.circleBtnDisabled]}
          onPress={handleAddWater}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.circleBtnText, { color: "#fff" }]}>+</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Water Settings Modal */}
      <Modal
        visible={showWaterModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowWaterModal(false);
          setShowPicker(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.waterModalContainer}>
            
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Water settings</Text>

              <TouchableOpacity
                onPress={() => {
                  setShowWaterModal(false);
                  setShowPicker(false);
                }}
              >
                <Ionicons name="close" size={RFValue(22)} color="#000" />
              </TouchableOpacity>
            </View>

            {/* INPUT BOX */}
            <TouchableOpacity
              style={styles.amountInputBox}
              onPress={() => {
                setOriginalAmount(selectedAmount);
                setShowPicker(true);
              }}
              disabled={showPicker}
            >
              <Text style={styles.inputText}>
                {selectedAmount} {selectedAmount >= 1000 ? "L" : "ml"}
              </Text>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={RFValue(18)}
                color="#555"
              />
            </TouchableOpacity>

            {/* PICKER - Only shown when edit button is clicked, between input and description */}
            {showPicker ? (
              <View style={styles.pickerWrapper}>
                <View style={styles.pickerContainer}>
                  {/* Highlight box for selected item */}
                  <View style={styles.pickerHighlight} />
                  
                  <ScrollView
                    ref={pickerScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={50}
                    decelerationRate="fast"
                    contentContainerStyle={styles.pickerScrollContent}
                    onMomentumScrollEnd={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      const index = Math.round(offsetY / 50);
                      const safeIndex = Math.max(0, Math.min(index, waterOptions.length - 1));
                      setSelectedAmount(waterOptions[safeIndex]);
                    }}
                    
                    scrollEventThrottle={16}
                  >
                    {waterOptions.map((num, index) => (
                      <View
                        key={index}
                        style={styles.pickerItemContainer}
                      >
                        <Text
                          style={[
                            styles.pickerItem,
                            num === selectedAmount && styles.pickerItemActive,
                          ]}
                        >
                          {num} {num >= 1000 ? "L" : "ml"}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : null}

            {/* DESCRIPTION - Always visible */}
            <Text style={[styles.modalSubtitle, !showPicker && { marginTop: hp("3%") }, showPicker && { marginTop: hp("2%") }]}>
              How much water do you need to stay hydrated?
            </Text>

            <Text style={styles.modalDescription}>
              Everyone's needs are slightly different, but we recommend aiming for at
              least 2000 ml (2 L) of water each day.
            </Text>

            {/* Cancel and Save Buttons - Only shown when picker is visible */}
            {showPicker && (
              <View style={styles.pickerButtonsRow}>
                <TouchableOpacity
                  style={styles.pickerCancelBtn}
                  onPress={() => {
                    setSelectedAmount(originalAmount);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pickerSaveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSaveWaterSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.pickerSaveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  caloriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
    marginBottom: hp("2%"),
  },
  smallCard: {
    height: hp("28%"),
    backgroundColor: "#FFFFFF",
    width: wp("46%"),
    borderRadius: wp("5%"),
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("3%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  stepText: {
    textAlign: "center",
    marginBottom: 6,
    flexDirection: "row",
    marginRight: wp("18%"),
  },
  stepText1: {
    textAlign: "center",
    marginBottom: hp("1.5%"),
    flexDirection: "row",
    marginRight: wp("18%"),
  },
  stepCurrent: {
    fontSize: RFValue(24),
    fontWeight: "700",
    color: "#000",
  },
  stepTotal: {
    fontSize: RFValue(14),
    fontWeight: "500",
    color: "#666",
  },
  popoverWrapper: {
    position: "absolute",
    top: hp("10%"),
    left: wp("5%"),
    width: wp("38%"),
    padding: wp("4%"),
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    zIndex: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  popoverText: {
    fontSize: RFValue(12),
    color: "#777",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: hp("0.6%"),
  },
  statIcon: {
    marginRight: wp("2%"),
  },
  statLabel: {
    flex: 1,
    fontSize: RFValue(14),
    color: "#000",
  },
  statValue: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#000",
  },
  foodWaterCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginTop: hp("0.5%"),
  },
  waterTitle: {
    fontSize: RFValue(12),
    color: "#999",
    fontWeight: "500",
  },
  waterAmount: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: "#000",
    marginTop: hp("0.5%"),
  },
  waterServingSize: {
    fontSize: RFValue(11),
    fontWeight: "500",
    color: "#666",
    marginTop: hp("0.2%"),
  },
  circleBtn: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: wp("2%"),
  },
  circleBtnDark: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  circleBtnText: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#000",
  },
  ringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingHorizontal: wp("5%"),
    marginTop: hp("1%"),
  },
  nutrientCard: {
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
    width: wp("28%"),
    height: hp("18%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: hp("2%"),
  },
  ringCard: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: hp("2%"),
  },
  ringCenterContent: {
    position: "absolute",
    top: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  gramText: {
    fontSize: RFValue(13),
    fontWeight: "700",
    color: "#111",
    marginRight: wp("12%"),
    marginTop: hp("1%"),
  },
  gramLabel: {
    color: "#777",
    fontSize: RFValue(10),
    marginBottom: hp("1%"),
    marginRight: wp("9%"),
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  waterModalContainer: {
    backgroundColor: "#fff",
    padding: wp("6%"),
    borderTopLeftRadius: wp("6%"),
    borderTopRightRadius: wp("6%"),
    paddingBottom: hp("3%"),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: "#000",
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("4%"),
    marginTop: hp("1%"),
  },
  inputText: {
    fontSize: RFValue(15),
    color: "#000",
  },
  modalSubtitle: {
    fontSize: RFValue(13),
    fontWeight: "700",
    color: "#000",
    marginTop: hp("3%"),
    textAlign: "center",
  },
  modalDescription: {
    fontSize: RFValue(12),
    color: "#777",
    marginTop: hp("1%"),
    textAlign: "center",
    lineHeight: 18,
  },
  pickerWrapper: {
    marginTop: hp("1%"),
    width: "100%",
  },
  pickerContainer: {
    position: "relative",
    height: hp("25%"),
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("2%"),
  },
  pickerHighlight: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 50,
    marginTop: -25,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: wp("2%"),
    zIndex: 1,
  },
  pickerScrollContent: {
    paddingVertical: hp("10%"),
    alignItems: "center",
  },
  pickerItemContainer: {
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  pickerItem: {
    fontSize: RFValue(18),
    color: "#aaa",
    textAlign: "center",
    fontWeight: "400",
  },
  pickerItemActive: {
    fontSize: RFValue(22),
    fontWeight: "700",
    color: "#000",
  },
  pickerButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp("2%"),
    gap: wp("3%"),
  },
  pickerCancelBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("8%"),
    alignItems: "center",
  },
  pickerCancelText: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#000",
  },
  pickerSaveBtn: {
    flex: 1,
    backgroundColor: "#4B3AAC",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("8%"),
    alignItems: "center",
  },
  pickerSaveText: {
    fontSize: RFValue(15),
    fontWeight: "700",
    color: "#fff",
  },
  circleBtnDisabled: {
    opacity: 0.5,
  },
});

export default WaterContent;