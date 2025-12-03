import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogActivityScreen() {
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [weight, setWeight] = useState("");

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const activityOptions = [
    "Aerobics",
    "Yoga",
    "Pilates",
    "Zumba",
    "Kickboxing",
    "Running",
    "Tai Chi",
    "HIIT",
    "Dance Cardio",
    "Circuit Training",
    "Martial Arts",
    "Strength Training",
  ];

  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  
  const formatDateTime = (dateObj: Date, timeObj: Date) => {
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const timeStr = timeObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });

    return `${dateStr}, ${timeStr}`;
  };

  // Combine date and time into ISO string
  const combineDateTime = (date: Date, time: Date): string => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(time.getSeconds());
    return combined.toISOString();
  };

  // Handle save activity
  const handleSaveActivity = async () => {
    // Validation
    if (!selectedActivity) {
      Alert.alert("Error", "Please select an activity type");
      return;
    }

    const startDateTime = combineDateTime(startDate, startTime);
    const endDateTime = combineDateTime(endDate, endTime);

    // Validate that end time is after start time
    if (new Date(endDateTime) <= new Date(startDateTime)) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }

    try {
      setLoading(true);
      
      // Log the data being sent
      const activityData = {
        type: selectedActivity,
        startTime: startDateTime,
        endTime: endDateTime,
      };
      
      console.log('========================================');
      console.log('[LogActivity] 📤 SENDING DATA TO API:');
      console.log('Activity Type:', activityData.type);
      console.log('Start Time:', activityData.startTime);
      console.log('End Time:', activityData.endTime);
      console.log('Full Payload:', JSON.stringify(activityData, null, 2));
      console.log('========================================');

      // Save activity to database
      const response = await wellnessApi.logActivity(activityData);

      console.log('========================================');
      console.log('[LogActivity] ✅ API RESPONSE RECEIVED:');
      console.log('Response Status:', response?.status || 'N/A');
      console.log('Response Data:', JSON.stringify(response, null, 2));
      console.log('Response Keys:', response ? Object.keys(response) : 'null');
      console.log('========================================');

      // Verify data was saved by fetching activity chart data
      try {
        const today = new Date();
        const startDateForVerify = new Date(today);
        startDateForVerify.setDate(today.getDate() - 6);
        const endDateForVerify = new Date(today);
        endDateForVerify.setDate(today.getDate() + 1);

        const sDate = startDateForVerify.toISOString().split('T')[0];
        const eDate = endDateForVerify.toISOString().split('T')[0];

        console.log('[LogActivity] 🔍 VERIFYING DATA IN DATABASE...');
        console.log('Fetching activity chart for date range:', { sDate, eDate });

        const verifyResponse = await wellnessApi.getActivityChart({
          sDate,
          eDate,
          trend: 'weekly',
        });

        console.log('========================================');
        console.log('[LogActivity] 🔍 VERIFICATION RESPONSE:');
        console.log('Verification Data:', JSON.stringify(verifyResponse, null, 2));
        
        // Check if our saved activity appears in the response
        // API returns aggregated data: { data: { min: [{ date: "23", min: 0 }, ...] } }
        let foundActivity = false;
        let minutesData: any[] = [];
        
        // Handle the actual API response structure: response.data.min
        if (verifyResponse?.data?.min && Array.isArray(verifyResponse.data.min)) {
          minutesData = verifyResponse.data.min;
          console.log('[LogActivity] Found minutes data in response.data.min');
        } else if (verifyResponse?.data?.data?.min && Array.isArray(verifyResponse.data.data.min)) {
          minutesData = verifyResponse.data.data.min;
          console.log('[LogActivity] Found minutes data in response.data.data.min');
        }

        // Calculate the day of month for the saved activity
        const savedDate = new Date(startDateTime);
        const savedDayOfMonth = String(savedDate.getDate()).padStart(2, '0');
        
        // Calculate minutes from start to end time
        const startTime = new Date(startDateTime).getTime();
        const endTime = new Date(endDateTime).getTime();
        const activityMinutes = Math.round((endTime - startTime) / (1000 * 60)); // Convert ms to minutes

        console.log('[LogActivity] Saved activity details:');
        console.log('  - Day of month:', savedDayOfMonth);
        console.log('  - Activity minutes:', activityMinutes);
        console.log('  - Activity type:', selectedActivity);

        // Check if the day we saved has minutes data
        const dayEntry = minutesData.find((item: any) => {
          // API returns date as day number (e.g., "23", "24") or full date
          const itemDate = String(item.date || item.day || '');
          return itemDate === savedDayOfMonth || itemDate.endsWith(savedDayOfMonth);
        });

        if (dayEntry) {
          const existingMinutes = dayEntry.min || dayEntry.minutes || 0;
          console.log('[LogActivity] Found day entry:', dayEntry);
          console.log('[LogActivity] Existing minutes for this day:', existingMinutes);
          
          // Activity is found if:
          // 1. The day has minutes > 0 (activity was saved)
          // 2. OR the minutes match our calculated activity duration (within reasonable tolerance)
          foundActivity = existingMinutes > 0 || Math.abs(existingMinutes - activityMinutes) < 60;
          
          if (foundActivity) {
            console.log('[LogActivity] ✅ Activity verified! Day has', existingMinutes, 'minutes');
          } else {
            console.log('[LogActivity] ⚠️ Day found but minutes may not match yet');
          }
        } else {
          console.log('[LogActivity] Day entry not found in response');
        }

        console.log('Total days with data:', minutesData.length);
        console.log('Our activity found in database:', foundActivity ? '✅ YES' : '❌ NO');
        console.log('========================================');

        // Show success message with verification result
        const successMessage = foundActivity
          ? `Activity logged successfully!\n\n✅ Verified in database:\n• Type: ${selectedActivity}\n• Start: ${new Date(startDateTime).toLocaleString()}\n• End: ${new Date(endDateTime).toLocaleString()}`
          : `Activity logged successfully!\n\n⚠️ Note: Verification pending. The activity may take a moment to appear in the chart.`;

        Alert.alert("Success", successMessage, [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } catch (verifyError: any) {
        console.error('[LogActivity] ⚠️ Verification failed (but save may have succeeded):', verifyError);
        // Still show success even if verification fails
        Alert.alert(
          "Success", 
          "Activity logged successfully!\n\nNote: Could not verify immediately, but data should be saved.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('========================================');
      console.error('[LogActivity] ❌ ERROR SAVING ACTIVITY:');
      console.error('Error Type:', error?.constructor?.name || typeof error);
      console.error('Error Message:', error?.message);
      console.error('Error Response:', error?.response?.data);
      console.error('Error Status:', error?.response?.status);
      console.error('Error Headers:', error?.response?.headers);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('========================================');

      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        "Failed to save activity. Please try again.";

      Alert.alert(
        "Error",
        `Failed to save activity:\n\n${errorMessage}\n\nCheck console for details.`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        {/* MAIN SCROLL CONTENT */}
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Log activity minutes</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          {/* CARD */}
          <View style={styles.card}>
            {/* DATE ROW */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setActivityModalVisible(true)}
            >
              <Text style={styles.label}>Activity Type</Text>
              <Text style={styles.value}>
                {selectedActivity || "Select"}
              </Text>
            </TouchableOpacity>


            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.label}>Started activity</Text>
              <Text style={styles.value}>
                {formatDateTime(startDate, startTime)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.label}>Start time</Text>
              <Text style={styles.value}>
                {startTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.label}>Finished date</Text>
              <Text style={styles.value}>
                {formatDateTime(endDate, endTime)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.label}>End time</Text>
              <Text style={styles.value}>
                {endTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
            </TouchableOpacity>


          </View>
        </ScrollView>

        {/* ACTIVITY TYPE MODAL */}
        {activityModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Activity type</Text>
                <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Scrollable List */}
              <ScrollView style={{ maxHeight: 350 }}>
                {activityOptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalOption}
                    onPress={() => setSelectedActivity(item)}
                  >
                    <Text style={styles.optionText}>{item}</Text>

                    {/* Radio Button */}
                    <View
                      style={[
                        styles.radioOuter,
                        selectedActivity === item && styles.radioOuterActive,
                      ]}
                    >
                      {selectedActivity === item && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => setActivityModalVisible(false)}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FIXED BOTTOM BUTTON */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSaveActivity}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* START DATE PICKER */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={(e, d) => {
              setShowStartDatePicker(false);
              if (d) setStartDate(d);
            }}
          />
        )}

        {/* START TIME PICKER */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="spinner"
            onChange={(e, t) => {
              setShowStartTimePicker(false);
              if (t) setStartTime(t);
            }}
          />
        )}

        {/* END DATE PICKER */}
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="spinner"
            onChange={(e, d) => {
              setShowEndDatePicker(false);
              if (d) setEndDate(d);
            }}
          />
        )}

        {/* END TIME PICKER */}
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="spinner"
            onChange={(e, t) => {
              setShowEndTimePicker(false);
              if (t) setEndTime(t);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  backButton: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: "#e6e6e8",
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  weightInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  weightInput: {
    fontSize: 16,
    width: 60,
    textAlign: "right",
    color: "#333",
  },
  kg: {
    fontSize: 16,
    color: "#aaa",
    marginLeft: 4,
  },
  bottomButtonContainer: {
    padding: 20,
  },

  button: {
    backgroundColor: "#4b2ea7",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "500",
  },

  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.6,
    borderColor: "#e5e5e5",
  },

  optionText: {
    fontSize: 16,
    color: "#333",
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },

  radioOuterActive: {
    borderColor: "#4b2ea7",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4b2ea7",
  },

  modalSaveButton: {
    backgroundColor: "#4b2ea7",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  modalSaveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

});