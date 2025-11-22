import ProgressBar from '@/components/ProgressBar';
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function CustomPlanReadyScreen() {
  const router = useRouter();

  const dailyData = [
    { label: "Calories", value: "100 g", color: "#22C55E", progress: 0.8 },
    { label: "Carbs", value: "40 g", color: "#F97316", progress: 0.4 },
    { label: "Protein", value: "40 g", color: "#EF4444", progress: 0.5 },
    { label: "Fats", value: "05 g", color: "#8B5CF6", progress: 0.2 },
  ];

  const CircleProgress = ({ progress, color, value }: any) => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View style={{ position: "relative", alignItems: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            stroke="#E5E7EB"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
         <Circle
  stroke={color}
  fill="none"
  cx={size / 2}
  cy={size / 2}
  r={radius}
  strokeWidth={strokeWidth}
  strokeDasharray={circumference}
  strokeDashoffset={strokeDashoffset}
  strokeLinecap="round"
  rotation={-90}            // rotate the circle so it starts from top
  origin={`${size / 2}, ${size / 2}`} // set rotation origin to center
/>

        </Svg>
        <Text
          style={{
            position: "absolute",
            top: "38%",
            color: "#111827",
            fontWeight: "700",
            fontSize: 14,
          }}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#1F2937" />
                        </TouchableOpacity> */}

                        <ProgressBar screen="plan" noContainer={true} />
                    </View>
                </View>


          {/* Main content */}
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark" size={22} color="#FFF" />
            </View>

            <Text style={styles.titleText}>
              Congratulations your custom plan is ready!
            </Text>

            <Text style={styles.subText}>You should Lose:</Text>
            <Text style={styles.lossText}>09 kg by March 15</Text>

            {/* Daily Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>Daily recommendation</Text>
              <Text style={styles.recommendationSubText}>
                You can edit this any time
              </Text>

              <View style={styles.grid}>
                {dailyData.map((item, index) => (
                  <View style={styles.card} key={index}>
                    <Text style={styles.cardLabel}>{item.label}</Text>
                    <CircleProgress
                      progress={item.progress}
                      color={item.color}
                      value={item.value}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                    <AntDesign name="edit" size={18} color="#6B7280" />
                                        </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.primaryCta}
              activeOpacity={0.85}
              onPress={() => router.push("/screens/loginscreen")}
            >
              <Text style={styles.primaryCtaText}>Let’s get started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  wrapper: {
    flex: 1,
    paddingBottom: 40,
  },
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
progressTrack: {
  flex: 1,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#E5E7EB',
  overflow: 'hidden',
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
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginLeft: 10,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    width: "90%",
    height: "100%",
    backgroundColor: "#4B3AAC",
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: "center",
    marginTop: 3,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4B3AAC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 20,
  },
  subText: {
    fontSize: 18,
    color: "#111827 ",
    fontWeight: "600",
  },
  lossText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // Daily Recommendation
  recommendationCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    width: width - 40,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  recommendationSubText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (width - 80) / 2,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 14,
    position: "relative",
  },
  cardLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 6,
  },
  editIcon: {
    position: "absolute",
    bottom: 8,
    right: 10,
  },

  // Bottom Button
  bottomContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  primaryCta: {
    backgroundColor: "#4B3AAC",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: width - 48,
    alignSelf: "center",
  },
  primaryCtaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
