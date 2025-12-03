import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PersonalDetails {
  age?: number;
  dateOfBirth?: string;
  height?: {
    cm?: number;
    feet?: number;
    inches?: number;
  };
  weight?: {
    kg?: number;
    lbs?: number;
  };
  currentWeight?: {
    kg?: number;
    lbs?: number;
  };
  name?: string;
}

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string | undefined): number | null => {
  if (!dateOfBirth) return null;
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    return null;
  }
};

// Helper function to format height
const formatHeight = (height: PersonalDetails['height']): string => {
  if (!height) return "N/A";
  
  if (height.feet && height.inches !== undefined) {
    return `${height.feet} ft ${height.inches} in`;
  } else if (height.cm) {
    // Convert cm to ft/in
    const totalInches = height.cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet} ft ${inches} in`;
  }
  
  return "N/A";
};

// Helper function to format weight
const formatWeight = (weight: PersonalDetails['weight'] | PersonalDetails['currentWeight']): string => {
  if (!weight) return "N/A";
  
  if (weight.kg !== undefined) {
    return `${weight.kg} kg`;
  } else if (weight.lbs !== undefined) {
    return `${weight.lbs} lbs`;
  }
  
  return "N/A";
};

interface SettingsData {
  burnedCaloriesFlag?: boolean;
  [key: string]: any;
}

interface GoalsData {
  goalWeight?: {
    kg?: number;
    lbs?: number;
  };
  [key: string]: any;
}

export default function SettingsScreen() {
  const [burnedCalories, setBurnedCalories] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [goals, setGoals] = useState<GoalsData | null>(null);
  
  // Save token on mount if needed
  useEffect(() => {
    // Save the provided token - you can remove this if token is already saved from login
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbElkIjoiQWthc2ggR2FqZXJhIiwidXNlcklkIjoiNjgyNWI2NmE1ZWFhNzQ2YmRmOTAwN2ZjIiwiaWF0IjoxNzY0MTM4MTM5fQ.FnYCXdy76eaF-twisjH1rxTnKN7ReNuz7Br490iyRig";
    wellnessApi.saveToken(token);
  }, []);

  // Fetch all settings data
  const fetchAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all settings data in parallel
      const [personalDetailsResponse, settingsResponse, goalsResponse] = await Promise.all([
        wellnessApi.getPersonalDetails(),
        wellnessApi.getSettings(),
        wellnessApi.getGoals()
      ]);
      
      // Handle different response formats
      const details = personalDetailsResponse?.data || personalDetailsResponse?.result || personalDetailsResponse;
      const settingsData = settingsResponse?.data || settingsResponse?.result || settingsResponse;
      const goalsData = goalsResponse?.data || goalsResponse?.result || goalsResponse;
      
      if (details) {
        setPersonalDetails(details);
      }
      
      if (settingsData) {
        setSettings(settingsData);
        // Set burned calories flag from settings
        if (settingsData.burnedCaloriesFlag !== undefined) {
          setBurnedCalories(settingsData.burnedCaloriesFlag);
        }
      }
      
      if (goalsData) {
        setGoals(goalsData);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Failed to load settings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAllSettings();
    }, [fetchAllSettings])
  );

  // Handle burned calories toggle
  const handleBurnedCaloriesToggle = useCallback(async (value: boolean) => {
    try {
      // Optimistically update UI
      setBurnedCalories(value);
      
      // Call API to toggle
      await wellnessApi.toggleBurnedCaloriesFlag();
      
      // Refresh settings to get updated state
      const settingsResponse = await wellnessApi.getSettings();
      const settingsData = settingsResponse?.data || settingsResponse?.result || settingsResponse;
      
      if (settingsData?.burnedCaloriesFlag !== undefined) {
        setBurnedCalories(settingsData.burnedCaloriesFlag);
      }
    } catch (error: any) {
      // Revert on error
      setBurnedCalories(!value);
      console.error("Error toggling burned calories flag:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Failed to update burned calories setting. Please try again."
      );
    }
  }, []);

  // Handle delete account
  const handleDeleteAccount = useCallback(async () => {
    try {
      setDeleting(true);
      
      await wellnessApi.deleteAccount();
      
      // Clear token and navigate to login
      await wellnessApi.logout();
      
      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/screens/loginscreen");
            }
          }
        ]
      );
    } catch (error: any) {
      console.error("Error deleting account:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.message || "Failed to delete account. Please try again."
      );
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  }, []);

  // Calculate age from date of birth
  const age = personalDetails?.age || calculateAge(personalDetails?.dateOfBirth) || null;
  
  // Format height and weight
  const heightText = formatHeight(personalDetails?.height);
  const weightText = formatWeight(personalDetails?.currentWeight || personalDetails?.weight);

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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4B3AAC" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Age</Text>
                <Text style={styles.value}>{age !== null ? `${age}` : "N/A"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Height</Text>
                <Text style={styles.value}>{heightText}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Current weight</Text>
                <Text style={styles.value}>{weightText}</Text>
              </View>
            </>
          )}
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
              onValueChange={handleBurnedCaloriesToggle}
              disabled={loading}
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
          style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.deleteBtnText}>Delete</Text>
          )}
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
  
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  
  deleteBtnDisabled: {
    opacity: 0.6,
  },
  
});
