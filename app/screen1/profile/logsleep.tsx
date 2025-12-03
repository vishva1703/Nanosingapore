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

export default function LogSleepScreen() {
  const [fellAsleepDate, setFellAsleepDate] = useState(new Date());
  const [fellAsleepTime, setFellAsleepTime] = useState(new Date());
  const [wokeUpDate, setWokeUpDate] = useState(new Date());
  const [wokeUpTime, setWokeUpTime] = useState(new Date());

  const [showFellAsleepDatePicker, setShowFellAsleepDatePicker] = useState(false);
  const [showFellAsleepTimePicker, setShowFellAsleepTimePicker] = useState(false);
  const [showWokeUpDatePicker, setShowWokeUpDatePicker] = useState(false);
  const [showWokeUpTimePicker, setShowWokeUpTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Handle save sleep
  const handleSaveSleep = async () => {
    const fellAsleepDateTime = combineDateTime(fellAsleepDate, fellAsleepTime);
    const wokeUpDateTime = combineDateTime(wokeUpDate, wokeUpTime);

    // Validate that woke up time is after fell asleep time
    if (new Date(wokeUpDateTime) <= new Date(fellAsleepDateTime)) {
      Alert.alert("Error", "Wake up time must be after fall asleep time");
      return;
    }

    try {
      setLoading(true);
      console.log('[LogSleep] Saving sleep:', {
        fellAsleep: fellAsleepDateTime,
        wokeUp: wokeUpDateTime,
      });

      const response = await wellnessApi.logSleep({
        fellAsleep: fellAsleepDateTime,
        wokeUp: wokeUpDateTime,
      });

      console.log('[LogSleep] Sleep saved successfully:', response);
      Alert.alert("Success", "Sleep logged successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('[LogSleep] Error saving sleep:', error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Failed to save sleep. Please try again."
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
          <Text style={styles.header}>Log sleep</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>

          {/* CARD */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowFellAsleepDatePicker(true)}
            >
              <Text style={styles.label}>Fell asleep date</Text>
              <Text style={styles.value}>
                {formatDateTime(fellAsleepDate, fellAsleepTime)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowFellAsleepTimePicker(true)}
            >
              <Text style={styles.label}>Fell asleep time</Text>
              <Text style={styles.value}>
                {fellAsleepTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowWokeUpDatePicker(true)}
            >
              <Text style={styles.label}>Woke up date</Text>
              <Text style={styles.value}>
                {formatDateTime(wokeUpDate, wokeUpTime)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => setShowWokeUpTimePicker(true)}
            >
              <Text style={styles.label}>Woke up time</Text>
              <Text style={styles.value}>
                {wokeUpTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSaveSleep}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save sleep</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* FELL ASLEEP DATE PICKER */}
        {showFellAsleepDatePicker && (
          <DateTimePicker
            value={fellAsleepDate}
            mode="date"
            display="spinner"
            onChange={(e, d) => {
              setShowFellAsleepDatePicker(false);
              if (d) setFellAsleepDate(d);
            }}
          />
        )}

        {/* FELL ASLEEP TIME PICKER */}
        {showFellAsleepTimePicker && (
          <DateTimePicker
            value={fellAsleepTime}
            mode="time"
            display="spinner"
            onChange={(e, t) => {
              setShowFellAsleepTimePicker(false);
              if (t) setFellAsleepTime(t);
            }}
          />
        )}

        {/* WOKE UP DATE PICKER */}
        {showWokeUpDatePicker && (
          <DateTimePicker
            value={wokeUpDate}
            mode="date"
            display="spinner"
            onChange={(e, d) => {
              setShowWokeUpDatePicker(false);
              if (d) setWokeUpDate(d);
            }}
          />
        )}

        {/* WOKE UP TIME PICKER */}
        {showWokeUpTimePicker && (
          <DateTimePicker
            value={wokeUpTime}
            mode="time"
            display="spinner"
            onChange={(e, t) => {
              setShowWokeUpTimePicker(false);
              if (t) setWokeUpTime(t);
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
