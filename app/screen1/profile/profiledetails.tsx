import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PersonalDetailsData {
  dateOfBirth?: string;
  height?: { cm?: number; feet?: number; inches?: number };
  currentWeight?: { kg?: number; lbs?: number };
  gender?: string;
  goalWeight?: { kg?: number; lbs?: number };
}

interface GoalsData {
  goalWeight?: { kg?: number; lbs?: number };
}

const formatWeight = (w: any) =>
  !w ? "N/A" : w.kg !== undefined ? `${w.kg} kg` : `${w.lbs} lbs`;

const formatHeight = (h: any) => {
  if (!h) return "N/A";
  return h.feet ? `${h.feet} ft ${h.inches} in` : `${h.cm} cm`;
};

const formatDOB = (dob: string) => {
  if (!dob) return "N/A";
  const d = new Date(dob);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

export default function PersonalDetails() {
  const [loading, setLoading] = useState(true);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsData | null>(null);
  const [goals, setGoals] = useState<GoalsData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [pdRes, goalsRes] = await Promise.all([
        wellnessApi.getPersonalDetails(),
        wellnessApi.getGoals(),
      ]);

      setPersonalDetails(pdRes?.data ?? pdRes);
      setGoals(goalsRes?.data ?? goalsRes);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const goalWeight = goals?.goalWeight || personalDetails?.goalWeight;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal details</Text>
        </View>

        {/* Goal weight */}
        <View style={styles.goalCard}>
          <View>
            <Text style={styles.labelSmall}>Goal weight</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.goalValue}>{formatWeight(goalWeight)}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.changeGoalBtn}
            onPress={() =>
              router.push({
                pathname: "/screens/desiredscreen",
                params: { from: "settings" },
              })
            }
          >
            <Text style={styles.changeGoalText}>Change Goal</Text>
          </TouchableOpacity>
        </View>

        {/* Field Card */}
        <View style={styles.fieldCard}>
          {/* Current Weight */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current weight</Text>
            <View style={styles.rowValueWrap}>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Text style={styles.rowValue}>
                    {formatWeight(personalDetails?.currentWeight)}
                  </Text>
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color="#666"
                    onPress={() =>
                      router.push({
                        pathname: "/screens/WeightScreen",
                        params: {
                          from: "settings",
                          currentKg: personalDetails?.currentWeight?.kg ?? "",
                          currentLbs: personalDetails?.currentWeight?.lbs ?? "",
                          heightCm: personalDetails?.height?.cm ?? "",
                          heightFeet: personalDetails?.height?.feet ?? "",
                          heightInches: personalDetails?.height?.inches ?? "",
                        },
                      })
                    }
                  />
                </>
              )}
            </View>
          </View>

          {/* Height */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Height</Text>
            <View style={styles.rowValueWrap}>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Text style={styles.rowValue}>
                    {formatHeight(personalDetails?.height)}
                  </Text>
                  <Ionicons name="pencil-outline" size={18} color="#666"
                    onPress={() =>
                      router.push({
                        pathname: "/screens/WeightScreen",
                        params: {
                          from: "settings",
                          heightCm: personalDetails?.height?.cm ?? "",
                          heightFeet: personalDetails?.height?.feet ?? "",
                          heightInches: personalDetails?.height?.inches ?? "",
                        },
                      })
                    }
                  />
                </>
              )}
            </View>
          </View>

          {/* DOB */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date of Birth</Text>
            <View style={styles.rowValueWrap}>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Text style={styles.rowValue}>
                    {formatDOB(personalDetails?.dateOfBirth ?? "")}
                  </Text>
                  <Ionicons name="pencil-outline" size={18} color="#666"
                    onPress={() =>
                      router.push({
                        pathname: "/screens/birth-date",
                        params: {
                          from: "settings",
                        },
                      })
                    }
                  />
                </>
              )}
            </View>
          </View>

          {/* Gender */}
          <View style={styles.rowLast}>
            <Text style={styles.rowLabel}>Gender</Text>
            <View style={styles.rowValueWrap}>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Text style={styles.rowValue}>{personalDetails?.gender ?? "N/A"}</Text>
                  <Ionicons name="pencil-outline" size={18} color="#666"
                    onPress={() =>
                      router.push({
                        pathname: "/screens/onboarding",
                        params: {
                          from: "settings",
                        },
                      })
                    }
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6FB",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFEFFD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },

  goalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    // soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  labelSmall: {
    color: "#777",
    fontSize: 14,
    marginBottom: 2,
  },

  goalValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },

  changeGoalBtn: {
    backgroundColor: "#433AAC",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  changeGoalText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  fieldCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF5",
  },

  rowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  rowLabel: {
    fontSize: 16,
    color: "#444",
    fontWeight: "500",
  },

  rowValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  rowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
