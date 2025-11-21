import { getProgressForScreen } from "@/utils/progressUtils";
import React, { useMemo } from "react";
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

export default function GreatingsScreen() {
  const router = useRouter();
  const headerProgress = useMemo(() => getProgressForScreen('greeting'), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* 🔹 Header Progress */}
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
                style={[
                  styles.progressFill,
                  { width: `${headerProgress * 100}%` },
                ]}
              />            
              </View>
          </View>
        </View>

        {/* 🔹 Center Content */}
        <View style={styles.centerContent}>
          {/* ✅ Icon and Text Inline */}
          <View style={styles.inlineContainer}>
            <Ionicons name="checkmark-circle" size={22} color="#FBBF24" />
            <Text style={styles.subTextInline}>All done!</Text>
          </View>

          <Text style={styles.mainText}>
            Thank you for{"\n"}
            <Text style={styles.highlightText}>trusting us</Text>
          </Text>

          <Text style={styles.bottomSubText}>
            This will be used to calibrate your{"\n"}custom plan
          </Text>
        </View>

        {/* 🔹 Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.primaryCta}
            activeOpacity={0.85}
            onPress={() => router.push("/screens/planscreen")}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
},
headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
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

  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  subTextInline: {
    fontSize: 15,
    color: "#6B7280",
    marginLeft: 6, // spacing between icon and text
  },

  mainText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 10,
  },
  highlightText: {
    color: "#111827",
    fontWeight: "700",
  },
  bottomSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
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
