import { getProgressForScreen } from "@/utils/progressUtils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
const VISIBLE_ITEMS = 1000; // Large enough to simulate infinite scrolling

export default function GoodScreen() {
  const router = useRouter();
  const [selectedWeight, setSelectedWeight] = useState(48);
  const [isScrolling, setIsScrolling] = useState(false);
  const progress = useMemo(() => getProgressForScreen('desired'), []);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const { from } = useLocalSearchParams();
  const isFromSettings = from === "settings";
  
  // Create a large array to simulate infinite scrolling
  const ticks = useMemo(() => {
    const arr = [];
    let index = 0;
    
    // Create multiple repetitions of the weight range
    const totalItems = VISIBLE_ITEMS;
    const weightRange = END_WEIGHT - START_WEIGHT;
    const itemsPerCycle = weightRange * SMALL_TICKS_PER_KG;
    
    for (let i = 0; i < totalItems; i++) {
      const cycleIndex = i % itemsPerCycle;
      const kg = START_WEIGHT + Math.floor(cycleIndex / SMALL_TICKS_PER_KG);
      const subIndex = cycleIndex % SMALL_TICKS_PER_KG;
      
      arr.push({
        value: kg + subIndex / SMALL_TICKS_PER_KG,
        isMajor: subIndex === 0,
        index: i,
        actualValue: kg + subIndex / SMALL_TICKS_PER_KG, // Store the actual weight value
      });
    }
    
    return arr;
  }, []);

  // Calculate initial index based on selected weight
  const getIndexForWeight = (weight : number) => {
    const weightRange = END_WEIGHT - START_WEIGHT;
    const itemsPerCycle = weightRange * SMALL_TICKS_PER_KG;
    
    // Start in the middle of the visible items for infinite scrolling effect
    const middleIndex = Math.floor(VISIBLE_ITEMS / 2);
    const offsetInCycle = (weight - START_WEIGHT) * SMALL_TICKS_PER_KG;
    
    return middleIndex + offsetInCycle;
  };

  const initialIndex = getIndexForWeight(selectedWeight);

  // Get the actual weight value from any index
  const getWeightFromIndex = (index : number) => {
    const weightRange = END_WEIGHT - START_WEIGHT;
    const itemsPerCycle = weightRange * SMALL_TICKS_PER_KG;
    
    const cycleIndex = index % itemsPerCycle;
    const kg = START_WEIGHT + Math.floor(cycleIndex / SMALL_TICKS_PER_KG);
    const subIndex = cycleIndex % SMALL_TICKS_PER_KG;
    
    return kg + subIndex / SMALL_TICKS_PER_KG;
  };

  // Debounced scroll listener
  const scrollListener = useRef(
    Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { 
        useNativeDriver: false,
        listener: ({ nativeEvent }) => {
          if (!isScrolling) return;
          
          const offset = (nativeEvent as any).contentOffset.x;
          const currentIndex = Math.round(offset / ITEM_WIDTH);
          const weightValue = getWeightFromIndex(currentIndex);
          const roundedValue = Math.round(weightValue * 10) / 10;
          
          // Only update if the value actually changed
          if (Math.abs(roundedValue - selectedWeight) >= 0.1) {
            setSelectedWeight(roundedValue);
          }
        }
      }
    )
  ).current;

  // Initialize scroll position
  useEffect(() => {
    const timer = setTimeout(() => {
      if (flatListRef.current) {
        (flatListRef.current as any).scrollToIndex({
          index: initialIndex,
          animated: false,
          viewPosition: 0.5
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
  };

  const handleMomentumScrollBegin = () => {
    setIsScrolling(true);
  };

  const handleMomentumScrollEnd = (event : any) => {
    setIsScrolling(false);
    
    const offset = (event.nativeEvent as any).contentOffset.x;
    const currentIndex = Math.round(offset / ITEM_WIDTH);
    const weightValue = getWeightFromIndex(currentIndex);
    
    // Round to nearest 0.2 (since we have 5 ticks per kg: 0, 0.2, 0.4, 0.6, 0.8)
    const roundedValue = Math.round(weightValue * SMALL_TICKS_PER_KG) / SMALL_TICKS_PER_KG;
    const finalWeight = Math.max(START_WEIGHT, Math.min(END_WEIGHT, roundedValue));
    
    // Update the selected weight
    setSelectedWeight(finalWeight);
    
    // Calculate the exact index for the rounded value
    const targetIndex = getIndexForWeight(finalWeight);
    
    // Snap to the exact position with a slight delay to ensure smooth animation
    setTimeout(() => {
      if (flatListRef.current) {
        (flatListRef.current as any).scrollToIndex({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5
        });
      }
    }, 50);
  };

  const handleScrollEndDrag = (event : any) => {
    // If user releases without momentum, still handle the snap
    if (!event.nativeEvent.velocity || 
        (Math.abs(event.nativeEvent.velocity.x) < 0.1)) {
      handleMomentumScrollEnd(event);
    }
  };

  // Handle reaching the edges of the list (infinite scroll simulation)
  const handleScroll = (event : any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const contentWidth = ticks.length * ITEM_WIDTH;
    const threshold = contentWidth * 0.1; // 10% threshold
    
    // If we're near the beginning, jump to the middle
    if (offsetX < threshold) {
      const middleIndex = Math.floor(VISIBLE_ITEMS / 2);
      setTimeout(() => {
        if (flatListRef.current && !isScrolling) {
          (flatListRef.current as any).scrollToIndex({
            index: middleIndex,
            animated: false,
            viewPosition: 0.5
          });
        }
      }, 100);
    }
    // If we're near the end, jump to the middle
    else if (offsetX > contentWidth - threshold) {
      const middleIndex = Math.floor(VISIBLE_ITEMS / 2);
      setTimeout(() => {
        if (flatListRef.current && !isScrolling) {
          (flatListRef.current as any).scrollToIndex({
            index: middleIndex,
            animated: false,
            viewPosition: 0.5
          });
        }
      }, 100);
    }
  };

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

            {!isFromSettings ? (
                <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
              ) : (
                <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 12 }}>
                  Edit weight goal
                </Text>
              )}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {!isFromSettings && (
            <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              What is your desired Weight?
            </Text>
            <Text style={styles.helperText}>
              This will be used to calibrate your custom plan.
            </Text>
          </View>
          )}

          {/* Weight Display */}
          <View style={styles.weightDisplay}>
            <Text style={styles.goalLabel}>Lose Weight</Text>
            <View style={styles.weightValueContainer}>
              <Text style={styles.selectedWeight}>{Math.round(selectedWeight)}</Text>
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>

          {/* Scale */}
          <View style={styles.scaleWrapper}>
            <View style={styles.scaleContainer}>
              {/* Center indicator line */}
              <View style={styles.centerIndicator} />
              
              <Animated.FlatList
                ref={flatListRef}
                data={ticks}
                horizontal
                keyExtractor={(item : any) => item.index.toString()}
                showsHorizontalScrollIndicator={false}
                snapToInterval={ITEM_WIDTH}
                snapToAlignment="center"
                decelerationRate="fast"
                bounces={false}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, index) => ({
                  length: ITEM_WIDTH,
                  offset: ITEM_WIDTH * index,
                  index,
                })}
                scrollEventThrottle={16}
                onScroll={(event : any) => {
                  scrollListener(event);
                  handleScroll(event);
                }}
                onScrollBeginDrag={handleScrollBeginDrag}
                onMomentumScrollBegin={handleMomentumScrollBegin}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScrollEndDrag={handleScrollEndDrag}
                contentContainerStyle={{
                  paddingHorizontal: width / 2 - ITEM_WIDTH / 2,
                }}
                renderItem={({ item, index } : any) => {
                  const inputRange = [
                    (index - 2) * ITEM_WIDTH,
                    (index - 1) * ITEM_WIDTH,
                    index * ITEM_WIDTH,
                    (index + 1) * ITEM_WIDTH,
                    (index + 2) * ITEM_WIDTH,
                  ];

                  const color = scrollX.interpolate({
                    inputRange,
                    outputRange: ["#D1D5DB", "#9CA3AF", "#4B3AAC", "#9CA3AF", "#D1D5DB"],
                    extrapolate: "clamp",
                  });

                  const scale = scrollX.interpolate({
                    inputRange,
                    outputRange: [1, 1.1, 1.3, 1.1, 1],
                    extrapolate: "clamp",
                  });

                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.6, 0.8, 1, 0.8, 0.6],
                    extrapolate: "clamp",
                  });

                  // Increased tick heights
                  const height = item.isMajor ? 70 : 35;

                  return (
                    <Animated.View style={styles.tickContainer}>
                      <Animated.View
                        style={[
                          styles.tick,
                          {
                            height,
                            backgroundColor: color,
                            width: item.isMajor ? 3 : 1.5,
                            transform: [{ scale }],
                            opacity,
                          },
                        ]}
                      />
                      {item.isMajor && (
                        <Animated.Text
                          style={[styles.tickLabel, { color, opacity }]}
                        >
                          {Math.round(item.value)}
                        </Animated.Text>
                      )}
                    </Animated.View>
                  );
                }}
                onScrollToIndexFailed={(info : any) => {
                  const wait = new Promise(resolve => setTimeout(resolve, 500));
                  wait.then(() => {
                    if (flatListRef.current) {
                      (flatListRef.current as any).scrollToIndex({
                        index: Math.min(info.index, ticks.length - 1),
                        animated: false,
                        viewPosition: 0.5
                      });
                    }
                  });
                }}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push("/screens/fastgoalscreen")}
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
  // New weight display styles
  weightDisplay: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
  },
  weightValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  selectedWeight: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111827",
  },
  weightUnit: {
    fontSize: 20,
    color: "#6B7280",
    marginLeft: 4,
  },
  scaleWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  scaleContainer: {
    position: "relative",
  },
  centerIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: width / 2,
    width: 2,
    backgroundColor: "#4B3AAC",
    zIndex: 10,
  },
  tickContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 150,
    width: ITEM_WIDTH,
  },
  tick: {
    borderRadius: 1,
  },
  tickLabel: {
    position: "absolute",
    bottom: -22,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
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
  primaryCtaText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

