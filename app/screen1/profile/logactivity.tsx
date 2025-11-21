import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";

export default function LogActivityScreen() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [weight, setWeight] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
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
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.label}>Started activity</Text>
              <Text style={styles.value}>
                {formatDateTime(date, time)}
              </Text>

            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.label}>Finished</Text>
              <Text style={styles.value}>
                {formatDateTime(date, time)}
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
          <TouchableOpacity style={styles.button} onPress={() => router.push("/screen1/profile/logsleep")}>
            <Text style={styles.buttonText}>Save</Text>
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
