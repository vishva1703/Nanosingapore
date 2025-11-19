import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const SMALL_TICKS_PER_KG = 5;
const ITEM_WIDTH = 16;
const START_WEIGHT = 40;
const END_WEIGHT = 140;

export default function DesiredWeightScreen() {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState(48);
  const progress = 0.45;
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const ticks = useMemo(() => {
    const arr = [];
    let index = 0;
    for (let kg = START_WEIGHT; kg <= END_WEIGHT; kg++) {
      for (let i = 0; i < SMALL_TICKS_PER_KG; i++) {
        arr.push({
          value: kg + i / SMALL_TICKS_PER_KG,
          isMajor: i === 0,
          index: index++,
        });
      }
    }
    return arr;
  }, []);

  const initialIndex = (selectedWeight - START_WEIGHT) * SMALL_TICKS_PER_KG;

  scrollX.addListener(({ value }) => {
    const kgValue = START_WEIGHT + value / (SMALL_TICKS_PER_KG * ITEM_WIDTH);
    setSelectedWeight(Math.round(kgValue));
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* 🔹 New Unified Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              What is your desired weight?
            </Text>
            <Text style={styles.helperText}>
              This will be used to calibrate your custom plan.
            </Text>
          </View>

          {/* Scale */}
          <View style={styles.scaleWrapper}>
            <View style={styles.weightInfo}>
              <Text style={styles.subLabel}>Lose Weight</Text>
              <Text style={styles.centerWeight}>{selectedWeight} kg</Text>
            </View>

            <Animated.FlatList
              data={ticks}
              horizontal
              keyExtractor={(item) => item.index.toString()}
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH}
              decelerationRate="fast"
              bounces={false}
              initialScrollIndex={initialIndex}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,
                offset: ITEM_WIDTH * index,
                index,
              })}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              contentContainerStyle={{
                paddingHorizontal: width / 2 - ITEM_WIDTH / 2,
              }}
              renderItem={({ item, index }) => {
                const inputRange = [
                  (index - 1) * ITEM_WIDTH,
                  index * ITEM_WIDTH,
                  (index + 1) * ITEM_WIDTH,
                ];

                const color = scrollX.interpolate({
                  inputRange,
                  outputRange: ["#D1D5DB", "#4B3AAC", "#D1D5DB"],
                  extrapolate: "clamp",
                });

                const height = item.isMajor ? 40 : 20;

                return (
                  <Animated.View style={styles.tickContainer}>
                    <Animated.View
                      style={[
                        styles.tick,
                        {
                          height,
                          backgroundColor: color,
                          width: item.isMajor ? 3 : 1.5,
                        },
                      ]}
                    />
                    {item.isMajor && (
                      <Animated.Text
                        style={[styles.tickLabel, { color }]}
                      >
                        {Math.round(item.value)}
                      </Animated.Text>
                    )}
                  </Animated.View>
                );
              }}
            />
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push("/fastgoalscreen")}
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
  wrapper: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
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
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4B3AAC",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 120,
    gap: 28,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  helperText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 4,
  },

  scaleWrapper: { flex: 1, justifyContent: "center" },
  weightInfo: { alignItems: "center", marginBottom: 40 },
  subLabel: { fontSize: 16, color: "#6B7280", marginBottom: 8 },
  centerWeight: { fontSize: 36, fontWeight: "700", color: "#111827" },

  tickContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 80,
    width: ITEM_WIDTH,
  },
  tick: { borderRadius: 1 },
  tickLabel: {
    position: "absolute",
    bottom: -18,
    fontSize: 12,
    textAlign: "center",
  },

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
  },
  primaryCtaText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
