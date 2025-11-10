import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function RealisticTargetScreen() {
  const router = useRouter();

  const headerProgress = 0.55;
//   const targetWeight = 09.9;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* 🔹 Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${headerProgress * 100}%` }]}
              />
            </View>
          </View>
        </View>

        {/* 🔹 Center Content */}
        <View style={styles.centerContent}>
          <Text style={styles.mainText}>
            Losing{" "}
            <Text >09.9 kg</Text>{" "}
            is a realistic target. It’s not hard at all!
          </Text>

          <Text style={styles.subText}>
            90% of users say that the change is obvious after using{" "}
            <Text >Nano Singapore</Text>{" "}
             and it’s not easy to rebound.
          </Text>
        </View>

        {/* 🔹 Next Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.primaryCta}
            activeOpacity={0.85}
            onPress={() => router.push("/dietscreen")}
          >
            <Text style={styles.primaryCtaText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  wrapper: { flex: 1 },

  // HEADER
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4B3AAC",
  },

  // MAIN CONTENT
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 150,
  },
  mainText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 14,
  },
  highlightText: {
    color: "#4B3AAC",
    fontWeight: "800",
  },
  subText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: width * 0.85,
  },

  // BUTTON
  bottomContainer: {
    position: "absolute",
    bottom: 32,
    left: 24,
    right: 24,
  },
  primaryCta: {
    backgroundColor: "#4B3AAC",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#4B3AAC",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryCtaText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
