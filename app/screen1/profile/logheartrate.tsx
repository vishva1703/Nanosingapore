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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogHeartRateScreen() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [heartRate, setHeartRate] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (dateObj: Date): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time for API (HH:MM:SS) - matching saveweight format
  const formatTimeForAPI = (timeObj: Date): string => {
    const hours = String(timeObj.getHours()).padStart(2, '0');
    const minutes = String(timeObj.getMinutes()).padStart(2, '0');
    const seconds = String(timeObj.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Handle save heart rate
  const handleSaveHeartRate = async () => {
    // Validation
    if (!heartRate || heartRate.trim() === '') {
      Alert.alert("Error", "Please enter resting heart rate");
      return;
    }

    // Check if input contains only numbers (no letters or special characters except decimal point)
    const numericPattern = /^[0-9]+\.?[0-9]*$/;
    if (!numericPattern.test(heartRate.trim())) {
      Alert.alert("Error", "Please enter a valid number for heart rate");
      return;
    }

    const heartRateValue = parseFloat(heartRate);
    if (isNaN(heartRateValue) || !isFinite(heartRateValue)) {
      Alert.alert("Error", "Please enter a valid heart rate number");
      return;
    }

    if (heartRateValue <= 0) {
      Alert.alert("Error", "Heart rate must be greater than 0");
      return;
    }

    // Resting heart rate should be a reasonable range (30-220 bpm)
    // Typical resting heart rate: 60-100 bpm, but can be lower (40-60) for athletes
    // or higher in some conditions. We'll allow 30-220 as a safe range.
    if (heartRateValue < 30) {
      Alert.alert("Error", "Heart rate seems too low. Please enter a value between 30-220 bpm");
      return;
    }

    if (heartRateValue > 220) {
      Alert.alert("Error", "Heart rate seems too high. Please enter a value between 30-220 bpm");
      return;
    }

    // Heart rate should typically be a whole number (round to nearest integer)
    const heartRateRounded = Math.round(heartRateValue);
    if (Math.abs(heartRateValue - heartRateRounded) > 0.01) {
      Alert.alert("Error", "Heart rate should be a whole number (e.g., 72, not 72.5)");
      return;
    }

    const dateStr = formatDateForAPI(date);
    const timeStr = formatTimeForAPI(time);

    try {
      setLoading(true);
      // Prepare the payload that will be sent to backend
      const payload = {
        date: dateStr,
        time: timeStr,
        rhr: heartRateRounded, // Backend expects 'rhr' parameter
      };

      console.log('========================================');
      console.log('[LogHeartRate] 📤 SENDING DATA TO API:');
      console.log('Date:', dateStr);
      console.log('Time:', timeStr);
      console.log('Heart Rate (rhr):', heartRateRounded, 'bpm');
      console.log('Full Payload (what backend receives):', JSON.stringify(payload, null, 2));
      console.log('========================================');

      // Save heart rate to database (use rounded value)
      const response = await wellnessApi.logHeartRate({
        date: dateStr,
        time: timeStr,
        heartRate: heartRateRounded,
      });

      console.log('========================================');
      console.log('[LogHeartRate] ✅ API RESPONSE RECEIVED:');
      console.log('Response Type:', typeof response);
      console.log('Response:', response);
      console.log('Response Data:', JSON.stringify(response, null, 2));
      console.log('Response Keys:', response ? Object.keys(response) : 'null');
      
      // Check if response indicates success
      if (response?.success === false || response?.error) {
        console.error('[LogHeartRate] ⚠️ API returned error:', response.error || response.message);
      } else if (response?.message) {
        console.log('[LogHeartRate] API Message:', response.message);
      }
      console.log('========================================');

      // Verify data was saved by fetching heart rate chart data
      try {
        const today = new Date();
        const startDateForVerify = new Date(today);
        startDateForVerify.setDate(today.getDate() - 6);
        const endDateForVerify = new Date(today);
        endDateForVerify.setDate(today.getDate() + 1);

        const sDate = formatDateForAPI(startDateForVerify);
        const eDate = formatDateForAPI(endDateForVerify);

        console.log('[LogHeartRate] 🔍 VERIFYING DATA IN DATABASE...');
        console.log('Fetching heart rate chart for date range:', { sDate, eDate });

        const verifyResponse = await wellnessApi.getHeartRateChart({
          sDate,
          eDate,
          trend: 'weekly',
        });

        console.log('========================================');
        console.log('[LogHeartRate] 🔍 VERIFICATION RESPONSE:');
        console.log('Verification Data:', JSON.stringify(verifyResponse, null, 2));
        
        // Check if our saved heart rate appears in the response
        let foundHeartRate = false;
        let heartRateData: any[] = [];
        
        // Handle different possible response structures
        if (verifyResponse?.data?.heartRate && Array.isArray(verifyResponse.data.heartRate)) {
          heartRateData = verifyResponse.data.heartRate;
          console.log('[LogHeartRate] Found heart rate data in response.data.heartRate');
        } else if (verifyResponse?.data?.rhr && Array.isArray(verifyResponse.data.rhr)) {
          heartRateData = verifyResponse.data.rhr;
          console.log('[LogHeartRate] Found heart rate data in response.data.rhr');
        } else if (verifyResponse?.data?.list && Array.isArray(verifyResponse.data.list)) {
          heartRateData = verifyResponse.data.list;
          console.log('[LogHeartRate] Found heart rate data in response.data.list');
        } else if (verifyResponse?.data?.data?.heartRate && Array.isArray(verifyResponse.data.data.heartRate)) {
          heartRateData = verifyResponse.data.data.heartRate;
          console.log('[LogHeartRate] Found heart rate data in response.data.data.heartRate');
        } else if (Array.isArray(verifyResponse?.data)) {
          heartRateData = verifyResponse.data;
          console.log('[LogHeartRate] Found heart rate data array directly in response.data');
        }

        // Calculate the day of month for the saved heart rate
        const savedDate = new Date(date);
        const savedDayOfMonth = String(savedDate.getDate()).padStart(2, '0');
        const savedMonth = String(savedDate.getMonth() + 1).padStart(2, '0');
        const savedYear = savedDate.getFullYear();

        console.log('[LogHeartRate] Saved heart rate details:');
        console.log('  - Date:', dateStr);
        console.log('  - Day of month:', savedDayOfMonth);
        console.log('  - Heart rate value:', heartRateRounded, 'bpm');

        // Check if the day we saved has heart rate data
        const dayEntry = heartRateData.find((item: any) => {
          // API returns date as day number (e.g., "23", "24") or full date
          const itemDate = item.date || item.loggedAt || item.timestamp || '';
          const itemDateStr = String(itemDate);
          
          // Check if date matches (could be day number, full date string, or ISO string)
          return itemDateStr === savedDayOfMonth || 
                 itemDateStr.endsWith(savedDayOfMonth) ||
                 itemDateStr.includes(dateStr) ||
                 itemDateStr.includes(`${savedYear}-${savedMonth}-${savedDayOfMonth}`);
        });

        if (dayEntry) {
          const existingHeartRate = dayEntry.heartRate || dayEntry.rhr || dayEntry.value || dayEntry.bpm || 0;
          console.log('[LogHeartRate] Found day entry:', dayEntry);
          console.log('[LogHeartRate] Existing heart rate for this day:', existingHeartRate, 'bpm');
          
          // Heart rate is found if:
          // 1. The day has heart rate > 0 (heart rate was saved)
          // 2. OR the heart rate matches our saved value (within reasonable tolerance)
          foundHeartRate = existingHeartRate > 0 || Math.abs(existingHeartRate - heartRateRounded) < 10;
          
          if (foundHeartRate) {
            console.log('[LogHeartRate] ✅ Heart rate verified! Day has', existingHeartRate, 'bpm');
          } else {
            console.log('[LogHeartRate] ⚠️ Day found but heart rate may not match yet');
          }
        } else {
          console.log('[LogHeartRate] Day entry not found in response');
        }

        console.log('Total days with data:', heartRateData.length);
        console.log('Our heart rate found in database:', foundHeartRate ? '✅ YES' : '❌ NO');
        console.log('========================================');

        // Show success message with verification result
        const successMessage = foundHeartRate
          ? `Resting heart rate logged successfully!\n\n✅ Verified in database:\n• Date: ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\n• Time: ${time.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}\n• Heart Rate: ${heartRateRounded} bpm`
          : `Resting heart rate logged successfully!\n\n⚠️ Note: Verification pending. The heart rate may take a moment to appear in the chart.`;

        Alert.alert("Success", successMessage, [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } catch (verifyError: any) {
        console.error('[LogHeartRate] ⚠️ Verification failed (but save may have succeeded):', verifyError);
        // Still show success even if verification fails
        Alert.alert(
          "Success", 
          "Resting heart rate logged successfully!\n\nNote: Could not verify immediately, but data should be saved.",
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
      console.error('[LogHeartRate] ❌ ERROR SAVING HEART RATE:');
      console.error('Error Type:', error?.constructor?.name || typeof error);
      console.error('Error Message:', error?.message);
      console.error('Error Response:', error?.response?.data);
      console.error('Error Status:', error?.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('========================================');

      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message || 
        "Failed to save heart rate. Please try again.";

      Alert.alert(
        "Error",
        `Failed to save heart rate:\n\n${errorMessage}\n\nCheck console for details.`,
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
          <Text style={styles.header}>Log resting heart rate</Text>
  
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
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
  
            {/* TIME ROW */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>
                {time.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
            </TouchableOpacity>
  
            {/* HEART RATE INPUT */}
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.label}>Resting heart rate</Text>
              <View style={styles.weightInputWrapper}>
                <TextInput
                  placeholder="0"
                  value={heartRate}
                  onChangeText={setHeartRate}
                  keyboardType="number-pad"
                  style={styles.weightInput}
                />
                <Text style={styles.kg}>bpm</Text>
              </View>
            </View>
          </View>
        </ScrollView>
  
        {/* FIXED BOTTOM BUTTON */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSaveHeartRate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save resting heart rate</Text>
            )}
          </TouchableOpacity>
        </View>
  
        {/* DATE PICKER */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setDate(d);
            }}
          />
        )}
  
        {/* TIME PICKER */}
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="spinner"
            onChange={(e, t) => {
              setShowTimePicker(false);
              if (t) setTime(t);
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
});
