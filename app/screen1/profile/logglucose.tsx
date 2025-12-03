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

export default function LogGlucoseScreen() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [glucose, setGlucose] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Format date to ISO format (YYYY-MM-DD)
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time to ISO format (HH:MM:SS)
  const formatTimeToISO = (time: Date): string => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Handle save glucose
  const handleSaveGlucose = async () => {
    // Validate glucose input
    if (!glucose || glucose.trim() === '') {
      Alert.alert('Validation Error', 'Please enter glucose level.');
      return;
    }

    const glucoseValue = parseFloat(glucose);
    if (isNaN(glucoseValue) || glucoseValue <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid glucose value.');
      return;
    }

    try {
      setLoading(true);

      // Format date and time
      const dateISO = formatDateToISO(date);
      const timeISO = formatTimeToISO(time);

      const requestPayload = {
        date: dateISO,
        time: timeISO,
        glucose: glucoseValue,
      };

      console.log('========================================');
      console.log('[logglucose] 📤 SENDING REQUEST TO BACKEND');
      console.log('[logglucose] Request Payload:', JSON.stringify(requestPayload, null, 2));
      console.log('[logglucose] Date:', dateISO);
      console.log('[logglucose] Time:', timeISO);
      console.log('[logglucose] Glucose Value:', glucoseValue, 'mg/dL');
      console.log('========================================');

      // Call API
      const response = await wellnessApi.logGlucose(requestPayload);

      console.log('========================================');
      console.log('[logglucose] ✅ API RESPONSE RECEIVED');
      console.log('[logglucose] Full Response:', JSON.stringify(response, null, 2));
      console.log('[logglucose] Response Type:', typeof response);
      console.log('[logglucose] Response Keys:', response ? Object.keys(response) : 'null');
      
      // Check if response indicates success
      if (response) {
        const successFlag = response.flag || response.success || response.status === 'success';
        const message = response.message || response.msg || 'Data saved';
        
        console.log('[logglucose] Success Flag:', successFlag);
        console.log('[logglucose] Message:', message);
        console.log('[logglucose] Response Data:', response.data ? JSON.stringify(response.data, null, 2) : 'No data field');
        
        if (successFlag || response.data) {
          console.log('[logglucose] ✅ DATA SUCCESSFULLY STORED IN BACKEND');
        } else {
          console.log('[logglucose] ⚠️ WARNING: Response received but success flag not set');
        }
      } else {
        console.log('[logglucose] ⚠️ WARNING: Empty response received');
      }
      console.log('========================================');

      // Show success message with details
      const successMessage = response?.message || 'Glucose logged successfully!';
      Alert.alert(
        'Success',
        `${successMessage}\n\nDate: ${dateISO}\nTime: ${timeISO}\nGlucose: ${glucoseValue} mg/dL`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log('========================================');
      console.error('[logglucose] ❌ ERROR LOGGING GLUCOSE');
      console.error('[logglucose] Error Type:', error?.constructor?.name);
      console.error('[logglucose] Error Message:', error?.message);
      console.error('[logglucose] Error Stack:', error?.stack);
      
      if (error?.response) {
        console.error('[logglucose] Response Status:', error.response.status);
        console.error('[logglucose] Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('[logglucose] Response Headers:', error.response.headers);
      } else if (error?.request) {
        console.error('[logglucose] Request was made but no response received');
        console.error('[logglucose] Request:', error.request);
      } else {
        console.error('[logglucose] Error setting up request:', error.message);
      }
      console.log('========================================');

      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error 
        || error?.message 
        || 'Failed to log glucose. Please try again.';
      
      Alert.alert(
        'Error',
        `Failed to save glucose data:\n\n${errorMessage}\n\nPlease check console logs for details.`
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
          <Text style={styles.header}>Log glucose</Text>
  
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
  
            {/* GLUCOSE INPUT */}
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.label}>Glucose</Text>
              <View style={styles.weightInputWrapper}>
                <TextInput
                  placeholder="0"
                  value={glucose}
                  onChangeText={setGlucose}
                  keyboardType="decimal-pad"
                  style={styles.weightInput}
                />
                    <Text style={styles.kg}>mg/dL</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowlabel}>XXX does not share manually logged glucose readings with other connected apps.</Text>
          </View>
        </ScrollView>
  
        {/* FIXED BOTTOM BUTTON */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSaveGlucose}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save glucose</Text>
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
  rowlabel: {
    fontSize: 16,
    color: "#555",
  },
});
