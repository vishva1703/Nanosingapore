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

export default function WeightInScreen() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Convert kg to lbs (1 kg = 2.20462 lbs)
  const convertKgToLbs = (kg: number): number => {
    return Math.round(kg * 2.20462 * 10) / 10; // Round to 1 decimal place
  };

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

  // Handle save weight
  const handleSaveWeight = async () => {
    // Validate weight input
    if (!weight || weight.trim() === '') {
      Alert.alert('Validation Error', 'Please enter your weight.');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid weight value.');
      return;
    }

    try {
      setLoading(true);

      // Format date and time
      const dateISO = formatDateToISO(date);
      const timeISO = formatTimeToISO(time);

      // Convert weight to both kg and lbs
      const weightKg = weightValue;
      const weightLbs = convertKgToLbs(weightKg);

      console.log('[saveweight] Logging weight:', {
        date: dateISO,
        time: timeISO,
        weight: { kg: weightKg, lbs: weightLbs }
      });

      // Call API
      const response = await wellnessApi.logWeight({
        date: dateISO,
        time: timeISO,
        weight: {
          kg: weightKg,
          lbs: weightLbs,
        },
      });

      console.log('[saveweight] Weight logged successfully:', response);

      // Show success message and navigate back
      Alert.alert(
        'Success',
        'Weight logged successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[saveweight] Error logging weight:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to log weight. Please try again.'
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
          <Text style={styles.header}>Weight in</Text>

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

            {/* WEIGHT INPUT */}
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.label}>Weight</Text>
              <View style={styles.weightInputWrapper}>
                <TextInput
                  placeholder="72"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  style={styles.weightInput}
                />
                <Text style={styles.kg}>kg</Text>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* FIXED BOTTOM BUTTON */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleSaveWeight}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save weight</Text>
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
