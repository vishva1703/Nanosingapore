import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

export default function EditCalories() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const getParam = (param: string | string[] | undefined): string => {
    return Array.isArray(param) ? param[0] : (param || "");
  };

  const initialCalories = getParam(params.calories) || "0";
  const totalDailyCalories = 1065; // This could come from user settings
  
  const [calories, setCalories] = useState(initialCalories);
  const [originalCalories] = useState(initialCalories);

  const caloriesNumber = parseFloat(calories) || 0;
  const remainingCalories = Math.max(0, totalDailyCalories - caloriesNumber);
  const progressPercentage = Math.min(100, (caloriesNumber / totalDailyCalories) * 100);

  const hasChanged = calories !== originalCalories;

  const handleRevert = () => {
    setCalories(originalCalories);
  };

  const handleDone = () => {
    // Update the calories and go back with updated value
    router.back();
    // You can add callback or context update here to save the value
    if (params.onSave) {
      // Handle save callback if provided
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={RFValue(22)}
              color="#111"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit calories</Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Calorie Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              {/* Circular Progress with Icon */}
              <View style={styles.progressContainer}>
                <Svg width={wp("20%")} height={wp("20%")} style={styles.progressSvg}>
                  {/* Background Circle */}
                  <Circle
                    cx={wp("10%")}
                    cy={wp("10%")}
                    r={wp("8%")}
                    stroke="#E5E5EA"
                    strokeWidth={8}
                    fill="none"
                  />
                  {/* Progress Circle */}
                  {progressPercentage > 0 && (
                    <Circle
                      cx={wp("10%")}
                      cy={wp("10%")}
                      r={wp("8%")}
                      stroke="#4B3AAC"
                      strokeWidth={8}
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * wp("8%")}`}
                      strokeDashoffset={`${2 * Math.PI * wp("8%") * (1 - progressPercentage / 100)}`}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${wp("10%")} ${wp("10%")})`}
                    />
                  )}
                </Svg>
                <View style={styles.progressCircleInner}>
                  <Ionicons
                    name="flame"
                    size={RFValue(28)}
                    color="#4B3AAC"
                  />
                </View>
              </View>

              {/* Calories Info */}
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryValue}>{caloriesNumber}</Text>
                <Text style={styles.summarySubtext}>
                  Out of {totalDailyCalories.toLocaleString()} left today
                </Text>
              </View>
            </View>
          </View>

          {/* Calories Input Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="Enter calories"
              placeholderTextColor="#A4A4A4"
              keyboardType="numeric"
              autoFocus={true}
            />
          </View>
        </ScrollView>

        {/* Action Buttons - Fixed at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.revertButton,
              !hasChanged && styles.disabledButton,
            ]}
            onPress={handleRevert}
            disabled={!hasChanged}
          >
            <Text
              style={[
                styles.revertButtonText,
                !hasChanged && styles.disabledButtonText,
              ]}
            >
              Revert
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.doneButton,
              !hasChanged && styles.disabledButton,
            ]}
            onPress={handleDone}
            disabled={!hasChanged}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3FA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
  },    

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: RFValue(20),
    fontWeight: "600",
    color: "#111",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("3%"),
    paddingBottom: hp("2%"),
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("4%"),
    padding: wp("5%"),
    marginBottom: hp("4%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("5%"),
  },

  progressContainer: {
    width: wp("20%"),
    height: wp("20%"),
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  progressSvg: {
    position: "absolute",
  },

  progressCircleInner: {
    width: wp("14%"),
    height: wp("14%"),
    borderRadius: wp("7%"),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  summaryTextContainer: {
    flex: 1,
  },

  summaryValue: {
    fontSize: RFValue(20),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("0.5%"),
  },

  summarySubtext: {
    fontSize: RFValue(12),
    fontWeight: "400",
    color: "#666",
  },

  inputContainer: {
    marginBottom: hp("2%"),
  },

  inputLabel: {
    fontSize: RFValue(16),

    color: "#111",
    marginBottom: hp("1.5%"),
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("8%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    fontSize: RFValue(16),
    borderWidth: 1.5,
    borderColor: "#4B3AAC",
    color: "#111",
  },

  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    gap: wp("3%"),
    marginTop: "auto",
  },

  revertButton: {
    flex: 1,
    backgroundColor: "#F3F3FA",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("10%"),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4B3AAC",
  },

  revertButtonText: {
    color: "#4B3AAC",
    fontSize: RFValue(16),
    fontWeight: "600",
  },

  doneButton: {
    flex: 1,
    backgroundColor: "#4B3AAC",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("10%"),
    alignItems: "center",
  },

  doneButtonText: {
    color: "#FFFFFF",
    fontSize: RFValue(16),
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.5,
  },

  disabledButtonText: {
    opacity: 0.5,
  },
});

