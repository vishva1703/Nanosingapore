import { useActivity } from "@/components/ActivityContext";
import { useFood } from "@/components/FoodContext";
import FoodlistContent from "@/components/foodlistcontent";
import DashboardHeaderWeek from "@/components/header";
import { IconSymbol } from '@/components/ui/icon-symbol';
import WaterContent from "@/components/watercontent";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  Image,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

export default function HomeScreen() {
  const router = useRouter();
  const [page, setPage] = React.useState(0);
  const [showPopup, setShowPopup] = React.useState(false);
  const [showWaterModal, setShowWaterModal] = React.useState(false);
  const [selectedAmount, setSelectedAmount] = React.useState(500);
  const [showActions, setShowActions] = React.useState(false);
  const { activities, isAnalyzing } = useActivity();
  const { myFoods, removeFood } = useFood();
  const [swipedIndex, setSwipedIndex] = React.useState<number | null>(null);
  const swipeAnimations = React.useRef<{ [key: number]: Animated.Value }>({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const nutrients1 = [
    { label: "Protein", grams: 120, color: "#ff595e", value: 0, icon: require("../../assets/images/meat.png") },
    { label: "Carbs", grams: 100, color: "#ffca3a", value: 0, icon: require("../../assets/images/grass.png") },
    { label: "Fat", grams: 125, color: "#8ac926", value: 0, icon: require("../../assets/images/avacado.png") },
  ];
  const nutrients = [
    { label: "Protein", grams: 120, color: "#44CAF3", value: 1.5, icon: require("../../assets/images/meat.png") },
    { label: "Carbs", grams: 100, color: "#44CAF3", value: 0.5, icon: require("../../assets/images/grass.png") },
    { label: "Fat", grams: 125, color: "#44CAF3", value: 0.4, icon: require("../../assets/images/avacado.png") },
  ];
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };
  const actionButtons = [
    {
      id: 1,
      title: "Scan food",
      icon: "camera-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/scanfood/camera")
    },
    {
      id: 2,
      title: "Food database",
      icon: "fast-food-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/fooddatabase/save?tab=all")
    },
    {
      id: 3,
      title: "Log exercise",
      icon: "barbell-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/Exercise")
    },
    {
      id: 4,
      title: "Save foods",
      icon: "bookmark-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/fooddatabase/save?tab=savescans")
    },
  ];

  const toggleActions = () => {
    if (showActions) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowActions(false));
    } else {
      setShowActions(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };


  const onHorizontalScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const screenWidth = wp("100%");
    const currentPage = Math.round(x / screenWidth);

    setPage(currentPage);
  };

  const scrollViewRef = React.useRef<ScrollView>(null);

  const goToPage = (pageIndex: number) => {
    setPage(pageIndex);
    scrollViewRef.current?.scrollTo({
      x: pageIndex * wp("100%"),
      animated: true,
    });
  };

  const backgroundStyle = {
    opacity: fadeAnim,
  };

  const cardStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
    opacity: slideAnim,
  };

  const firstRow = actionButtons.slice(0, 2);
  const secondRow = actionButtons.slice(2, 4);

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeaderWeek
        title="Dashboard"
        activeIndex={2}
        onDayPress={(i) => console.log("Pressed day:", i)}
        onSettingsPress={() => console.log("Settings opened")}
      />

      <ScrollView
        style={styles.verticalScrollView}
        contentContainerStyle={styles.verticalScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onHorizontalScroll}
          scrollEventThrottle={16}
          style={styles.horizontalScroll}
          nestedScrollEnabled={true}
        >
          <View style={styles.page}>
            <FoodlistContent nutrients={nutrients1} />
          </View>

          <View style={styles.page}>
            <WaterContent
              showPopup={showPopup}
              setShowPopup={setShowPopup}
              showWaterModal={showWaterModal}
              setShowWaterModal={setShowWaterModal}
              selectedAmount={selectedAmount}
              setSelectedAmount={setSelectedAmount}
              nutrients={nutrients}
            />
          </View>
        </ScrollView>

        {isAnalyzing && (
          <View style={styles.analyzingBox}>
            <Image
              source={require("../../assets/images/weight lifting.png")}
              style={styles.analyzingIcon}
            />

            <Text style={styles.analyzingTitle}>Analyzing exercise...</Text>

            <View style={styles.skeletonBar} />
            <View style={[styles.skeletonBar, { width: "70%" }]} />
            <View style={[styles.skeletonBar, { width: "50%" }]} />

            <Text style={styles.analyzingNote}>We'll notify you when done!</Text>
          </View>
        )}

        <View style={styles.paginationDots}>
          <TouchableOpacity onPress={() => goToPage(0)}>
            <View style={[styles.dot, page === 0 && styles.activeDot]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goToPage(1)}>
            <View style={[styles.dot, page === 1 && styles.activeDot]} />
          </TouchableOpacity>
        </View>

        {activities.length > 0 && (
          <View style={styles.activityList}>
            <Text style={styles.activityListTitle}>Recently Logged</Text>
            {activities.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.activityCard}
                onPress={() => router.push(`/screen1/DescribeExercise`)
                }
              >

                {/* Top Right Time */}
                <Text style={styles.activityTime}>
                  {item.time ? item.time : "10:28"}
                </Text>

                {/* Left Icon + Info */}
                <View style={styles.activityRow}>
                  <View style={styles.activityIconBox}>
                    <Image
                      source={item.type === "WeightLifting"
                        ? require("../../assets/images/weight lifting.png")
                        : require("../../assets/images/run.png")}
                      style={styles.activityIcon}
                    />
                  </View>

                  <View style={styles.activityInfo}>

                    <Text style={styles.activityTitle}>{item.type}</Text>

                    <Text style={styles.activityCalories}>
                      <Ionicons name="flame-outline" size={RFValue(16)} color="#111" />
                      {item.calories} calories
                    </Text>

                    <Text style={styles.activityDetails}>
                      <Image source={require("../../assets/images/flash.png")} style={{ width: 16, height: 16 }} />
                      Intensity:
                      {item.intensity === 2 ? " High" : item.intensity === 1 ? " Medium" : " Low"}
                      {"   "}<IconSymbol size={16} name="clock.fill" color="#111" /> {item.duration} Mins
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* My Food List Section - Shows when food list exists, replaces tooltip */}
        {myFoods.length > 0 && (
          <View style={styles.foodListSection}>
            <Text style={styles.foodListSectionTitle}>My Foods</Text>
            {myFoods.map((item: any, index: number) => {
              // Initialize animation value for this card if not exists
              if (!swipeAnimations.current[index]) {
                swipeAnimations.current[index] = new Animated.Value(0);
              }

              const panResponder = PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                  return Math.abs(gestureState.dx) > 10;
                },
                onPanResponderGrant: () => {
                  // Close any other swiped card
                  if (swipedIndex !== null && swipedIndex !== index) {
                    Animated.spring(swipeAnimations.current[swipedIndex], {
                      toValue: 0,
                      useNativeDriver: true,
                    }).start();
                    setSwipedIndex(null);
                  }
                },
                onPanResponderMove: (_, gestureState) => {
                  // Only allow left swipe (negative dx)
                  if (gestureState.dx < 0) {
                    swipeAnimations.current[index].setValue(gestureState.dx);
                  }
                },
                onPanResponderRelease: (_, gestureState) => {
                  const swipeThreshold = -80;
                  if (gestureState.dx < swipeThreshold) {
                    // Swipe left enough to show delete
                    Animated.spring(swipeAnimations.current[index], {
                      toValue: -80,
                      useNativeDriver: true,
                    }).start();
                    setSwipedIndex(index);
                  } else {
                    // Snap back
                    Animated.spring(swipeAnimations.current[index], {
                      toValue: 0,
                      useNativeDriver: true,
                    }).start();
                    setSwipedIndex(null);
                  }
                },
              });

              const handleDelete = () => {
                // Animate card out
                Animated.timing(swipeAnimations.current[index], {
                  toValue: -wp("100%"),
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  // Remove food from context after animation
                  if (item.id) {
                    removeFood(item.id);
                  } else {
                    // If no id, remove by index (fallback)
                    // This requires updating FoodContext to support index-based removal
                    // For now, we'll just reset if no id
                    swipeAnimations.current[index].setValue(0);
                    setSwipedIndex(null);
                  }
                });
              };

              const handleResetSwipe = () => {
                Animated.spring(swipeAnimations.current[index], {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
                setSwipedIndex(null);
              };

              // Replace the entire return statement for each food item with this improved version:

              return (
                <View key={index} style={styles.swipeContainer}>
                  {/* Delete Button Background - Only visible when swiped */}
                  {swipedIndex === index && (
                    <View style={styles.deleteButtonContainer}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                      >
                        <Ionicons name="trash-outline" size={RFValue(20)} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Food Card */}
                  <Animated.View
                    style={[
                      styles.foodCard,
                      {
                        transform: [{ translateX: swipeAnimations.current[index] }],
                      },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    <TouchableOpacity
                      style={styles.foodCardTouchable}
                      onPress={() => {
                        if (swipedIndex === index) {
                          handleResetSwipe();
                        } else {
                          router.push({
                            pathname: "/screen1/fooddatabase/SelectedFood",
                            params: {
                              ...item,
                            }
                          });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.foodCardContent}>
                        <Text style={styles.foodCardName}>{item.name}</Text>
                        <View style={styles.foodCardRow}>
                          <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
                          <Text style={styles.foodCardSubtitle}>
                            {item.calories} cal-oz, {item.cookedType}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.foodCardPlusButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (swipedIndex === index) {
                            handleResetSwipe();
                          } else {
                            router.push({
                              pathname: "/screen1/fooddatabase/SelectedFood",
                              params: {
                                ...item,
                              }
                            });
                          }
                        }}
                      >
                        <Text style={styles.foodCardPlusText}>+</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        )}

        {/* Tooltip - Only shows when no activities and no foods */}
        {activities.length === 0 && myFoods.length === 0 && (
          <View style={styles.foodListContainer}>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>You haven't logged anything</Text>
              <Text style={styles.foodTime}>
                Start tracking by adding activity.
              </Text>
            </View>
            <Image
              source={require("../../assets/images/arrow.png")}
              style={styles.arrow}
            />
          </View>
        )}

        {/* Bottom padding for scroll */}
        <View style={{ height: hp("10%") }} />
      </ScrollView>

      {showActions && (
        <Animated.View style={[styles.overlay, backgroundStyle]}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={toggleActions}
            activeOpacity={1}
          >
            <Animated.View style={[styles.actionCard, cardStyle]}>
              <View style={styles.actionRow}>
                {secondRow.map((button) => (
                  <TouchableOpacity
                    key={button.id}
                    style={[styles.actionItem, { backgroundColor: button.color }]}
                    onPress={() => {
                      button.onPress();
                      toggleActions();
                    }}
                  >
                    <Ionicons name={button.icon as any} size={RFValue(24)} color="#111" />
                    <Text style={styles.actionText}>{button.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>


              <View style={styles.actionRow}>
                {firstRow.map((button) => (
                  <TouchableOpacity
                    key={button.id}
                    style={[styles.actionItem, { backgroundColor: button.color }]}
                    onPress={() => {
                      button.onPress();
                      toggleActions();
                    }}
                  >
                    <Ionicons name={button.icon as any} size={RFValue(24)} color="#111" />
                    <Text style={styles.actionText}>{button.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={toggleActions}
      >
        <Animated.View style={rotateStyle}>
          <Ionicons name="add" size={RFValue(30)} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8fc",
  },
  verticalScrollView: {
    flex: 1,
  },
  verticalScrollContent: {
    flexGrow: 1,
  },
  horizontalScroll: {
    height: hp("45%"),
  },
  page: {
    width: wp("100%"),
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp("1%"),
  },
  dot: {
    width: wp("2.5%"),
    height: wp("2.5%"),
    borderRadius: wp("1.25%"),
    backgroundColor: "#E5E7EB",
    marginHorizontal: wp("1%"),
  },
  activeDot: {
    backgroundColor: "#4B3AAC",
  },
  addButton: {
    position: "absolute",
    bottom: hp("1%"),
    right: wp("6%"),
    backgroundColor: "#4B3AAC",
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("7.5%"),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 110, // Increased from 100 to 110 to be above overlay
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100, // Lower than add button
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: hp("15%"),
  },
  actionCard: {
    borderRadius: wp("6%"),
    padding: wp("5%"),
    width: wp("90%"),
    

  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("2%"),
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2%"),
    borderRadius: wp("4%"),
    marginHorizontal: wp("1%"),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  actionText: {
    color: "#111",
    fontSize: RFValue(12),
    fontWeight: "600",
    marginTop: hp("1%"),
    textAlign: "center",
  },
  foodListContainer: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    borderRadius: wp("6%"),
    padding: wp("4%"),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("8%"),
    height: hp("10%"),
  },
  foodInfo: {
    flex: 1,
    justifyContent: "center",
  },
  foodName: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
  foodTime: {
    fontSize: RFValue(11),
    color: "#888",
    marginTop: hp("0.5%"),
    textAlign: "center",
    marginLeft: wp("10%"),
    marginRight: wp("10%"),
  },
  arrow: {
    width: wp("15%"),
    height: hp("8%"),
    resizeMode: "contain",
    position: "absolute",
    top: hp("10%"),
    right: wp("20%"),
    zIndex: 10,
  },
  activityList: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
  },
  activityListTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#222",
    marginBottom: hp("1%"),
  },

  activityCard: {
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    padding: wp("4%"),
    marginBottom: hp("1.5%"),

  },

  activityTime: {
    position: "absolute",
    right: wp("4%"),
    top: hp("1%"),
    fontSize: RFValue(10),
    color: "#999",
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  activityIconBox: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("3%"),
    backgroundColor: "#F2F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("4%"),
  },

  activityIcon: {
    width: wp("7%"),
    height: wp("7%"),
    resizeMode: "contain",
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#222",
  },

  activityCalories: {
    marginTop: hp("0.5%"),
    fontSize: RFValue(12),
    color: "#555",
  },

  activityDetails: {
    marginTop: hp("0.5%"),
    fontSize: RFValue(11),
    color: "#777",
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1%"),
  },
  analyzingBox: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    backgroundColor: "#fff",
    padding: wp("5%"),
    borderRadius: wp("5%"),
    alignItems: "flex-start"
  },
  analyzingIcon: {
    width: wp("10%"),
    height: wp("10%"),
    resizeMode: "contain",
    marginBottom: hp("1%")
  },
  analyzingTitle: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#222",
    marginBottom: hp("1%")
  },
  skeletonBar: {
    height: hp("1.2%"),
    backgroundColor: "#E5E5EE",
    borderRadius: 8,
    width: "85%",
    marginVertical: hp("0.5%")
  },
  analyzingNote: {
    marginTop: hp("1.5%"),
    color: "#999",
    fontSize: RFValue(11)
  },

  foodListSection: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
  },

  foodListSectionTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#222",
    marginBottom: hp("1%"),
  },

  foodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("4%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 2, // Ensure card is above delete button
  },

  foodCardContent: {
    flex: 1,
    marginRight: wp("2%"),
  },

  foodCardName: {
    fontSize: RFValue(15),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("0.5%"),
  },

  foodCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("0.3%"),
  },

  foodCardSubtitle: {
    fontSize: RFValue(12),
    marginLeft: wp("1%"),
    color: "#666",
  },

  foodCardPlusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  foodCardPlusText: {
    fontSize: RFValue(20),
    color: "#4B3AAC",
    fontWeight: "900",
  },
  swipeContainer: {
    position: "relative",
    marginBottom: hp("1%"),
    borderRadius: wp("4%"),
    overflow: "hidden", // Crucial: contains everything within rounded borders
  },

  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    backgroundColor: "#4B3AAC", // Move background color here
    zIndex: 1,
  },

  deleteButton: {
    backgroundColor: "#4B3AAC",
    width: 80,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("4%"),
  },

  foodCardTouchable: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },


});