// @ts-nocheck
/** @jsxImportSource react */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  Line,
  G,
} from "react-native-svg";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48; // Card total width
const CHART_WIDTH = CARD_WIDTH - 48; // Inner SVG width
const CHART_HEIGHT = 160;

// Chart curve points
const chartPoints = [
  { x: 0, y: 120 },
  { x: CHART_WIDTH * 0.15, y: 105 },
  { x: CHART_WIDTH * 0.35, y: 80 },
  { x: CHART_WIDTH * 0.55, y: 95 },
  { x: CHART_WIDTH * 0.75, y: 60 },
  { x: CHART_WIDTH, y: 40 }, // END of curve (trophy anchor)
];

// Smooth curve path generator
function createSmoothCurve(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

const growthLabels = ["2 Days", "5 Days", "7 Days", "30 Days"];

export default function PotentialScreen() {
  const router = useRouter();
  const headerProgress = 0.55;

  const curvedPath = React.useMemo(() => createSmoothCurve(chartPoints), []);
  const filledPath = `${curvedPath} L ${CHART_WIDTH},${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`;

  // 🏆 trophy coordinates (clamped to chart boundaries)
  const lastPoint = chartPoints[chartPoints.length - 1];
  const safeX = Math.min(CHART_WIDTH - 12, lastPoint.x);
  const safeY = Math.max(0, Math.min(CHART_HEIGHT - 12, lastPoint.y));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* Header */}
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

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.mainText}>
            You have great potential to{" "}
            <Text style={styles.highlightText}>crush your goal</Text>
          </Text>
          <Text style={styles.subText}>
            This will be used to calibrate your custom plan.
          </Text>

          {/* Chart Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your weight transition</Text>

            <View style={styles.chartContainer}>
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Defs>
                  <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FFB256" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#FFDDB4" stopOpacity="0.05" />
                  </LinearGradient>
                </Defs>

                {/* Only Horizontal Grid Lines */}
                <G>
                  {[1, 2, 3, 4].map((i) => (
                    <Line
                      key={`h-${i}`}
                      x1="0"
                      y1={(CHART_HEIGHT / 5) * i}
                      x2={CHART_WIDTH}
                      y2={(CHART_HEIGHT / 5) * i}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                    />
                  ))}
                </G>

                {/* Gradient Fill */}
                <Path d={filledPath} fill="url(#chartGradient)" />

                {/* Smooth Orange Curve with transparency */}
                <Path
                  d={curvedPath}
                  stroke="rgba(255,154,61,0.8)"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>

              {/* 🏆 Trophy now inside visible curve end */}
              <View
                style={[
                  styles.goalBadge,
                  {
                    left: safeX - 12,
                    top: safeY - 12,
                  },
                ]}
              >
                <Ionicons name="trophy" size={14} color="#FFF" />
              </View>
            </View>

            {/* X Axis Labels */}
            <View style={styles.xAxis}>
              {growthLabels.map((label) => (
                <View key={label} style={styles.xAxisLabelWrapper}>
                  <Text style={styles.xAxisLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom CTA */}
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
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  wrapper: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
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
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4B3AAC" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  mainText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 34,
    marginBottom: 8,
  },
  highlightText: { color: "#4B3AAC" },
  subText: { fontSize: 15, color: "#6B7280", lineHeight: 22 },
  card: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: "#1F2937",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  chartContainer: {
    position: "relative",
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  goalBadge: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF9A3D",
    alignItems: "center",
    justifyContent: "center",
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  xAxisLabelWrapper: { flex: 1, alignItems: "center" },
  xAxisLabel: { fontSize: 12, color: "#6B7280" },
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
