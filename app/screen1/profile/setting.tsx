import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function SettingsScreen() {
  const [burnedCalories, setBurnedCalories] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Values */}
        <View style={styles.card}>
          <View style={styles.row} >
            <Text style={styles.label} >Age</Text>
            <Text style={styles.value}>18</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>5 ft 5 in</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Current weight</Text>
            <Text style={styles.value}>85 kg</Text>
          </View>
        </View>

        {/* Customization */}
        <Text style={styles.sectionTitle}>Customization</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push("/screen1/profile/profiledetails")}>
            <Text style={styles.linkLabel}>Personal details</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push("/screen1/Adjustgoal")}>
            <View>
              <Text style={styles.linkLabel}>Adjust goals</Text>
              <Text style={styles.subText}>Calories, carbs, fats, and protein</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.linkRow}>
            <View>
              <Text style={styles.linkLabel}>Burned Calories</Text>
              <Text style={styles.subText}>Add burned calories to daily goal</Text>
            </View>
            <Switch
              value={burnedCalories}
              onValueChange={setBurnedCalories}
            />
          </View>
        </View>

        {/* Legal */}
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkLabel}>Terms and Condition</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkLabel}>Privacy policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.deleteRow}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
      <Modal
  transparent={true}
  animationType="slide"
  visible={deleteModalVisible}
  onRequestClose={() => setDeleteModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>

      <Ionicons name="trash" size={40} color="red" style={{ marginBottom: 10 }} />

      <Text style={styles.modalTitle}>Delete account?</Text>

      <Text style={styles.modalDesc}>
        Are you sure you want to permanently delete your account?
      </Text>

      {/* Buttons */}
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setDeleteModalVisible(false)}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => {
            // Handle delete account here
            setDeleteModalVisible(false);
          }}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  backBtn: { marginRight: 10 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    marginVertical: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  label: { fontSize: 16, color: "#444" },
  value: { fontSize: 16, fontWeight: "600" },

  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 6,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    marginLeft: 18,
    marginBottom: 8,
  },

  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  linkLabel: { fontSize: 16, color: "#333" },

  subText: { fontSize: 12, color: "#999", marginTop: 3 },

  deleteRow: { paddingVertical: 12 },

  deleteText: { color: "red", fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 8,
  },
  
  modalDesc: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 25,
  },
  
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F0EDF6",
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    alignItems: "center",
  },
  
  cancelText: {
    color: "#4F3F84",
    fontSize: 16,
    fontWeight: "600",
  },
  
  deleteBtn: {
    flex: 1,
    backgroundColor: "#4F3F84",
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: "center",
  },
  
  deleteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
});
