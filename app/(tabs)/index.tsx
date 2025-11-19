import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import Svg, { Circle } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DashboardScreen() {
  const nutrients = [
    { label: "Protein", grams: 120, color: "#ff595e", value: 0.75, icon: require("../../assets/images/meat.png") },
    { label: "Carbs", grams: 100, color: "#ffca3a", value: 0.55, icon: require("../../assets/images/grass.png") },
    { label: "Fat", grams: 125, color: "#8ac926", value: 0.45, icon: require("../../assets/images/avacado.png") },
  ];


  const avg = (
    (nutrients[0].value + nutrients[1].value + nutrients[2].value) / 3
  ).toFixed(2);

  // ✅ Reusable circular progress ring (like in CustomPlanReadyScreen)
  interface CircleProgressProps {
    progress: number;
    color: string;
    label: string;
  }



  const CircleProgress: React.FC<
    CircleProgressProps & { sizeMultiplier?: number; showFire?: boolean; iconSource?: any; grams?: number }
  > = ({
    progress,
    color,
    label,
    sizeMultiplier = 1.25,
    showFire = false,
    iconSource,
    grams,
  }) => {
      const baseSize = wp("18%");
      const size = baseSize * sizeMultiplier;
      const strokeWidth = 6;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference * (1 - progress);

      return (
        <View
          style={[
            styles.nutrientCard,
            showFire && { backgroundColor: "transparent", elevation: 0, shadowOpacity: 0 },
          ]}
        >

          {grams && (
            <Text style={styles.gramText}>
              {grams} g
            </Text>
          )}
          {!showFire && (
            <Text style={styles.gramLabel}>{label} left</Text>
          )}

          <View style={[styles.ringCard, { width: size, height: size }]}>
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
                rotation={-90}
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>

            <View style={styles.ringCenterContent}>
              {showFire ? (
                <View
                  style={{
                    width: wp("10%"),
                    height: wp("10%"),
                    borderRadius: wp("5%"),
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#E5E7EB", // optional light blue background tint
                  }}
                >
                  <MaterialCommunityIcons
                    name="fire"
                    size={RFValue(20)}
                    color="#1E3A8A" // dark blue fire color
                  />
                </View>
              ) : (
                iconSource && (
                  <Image
                    source={iconSource}
                    style={{
                      width: wp("10%"),
                      height: wp("10%"),
                      resizeMode: "contain",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: hp("3%"),
                    }}
                  />
                )
              )}

            </View>
          </View>
        </View>
      );
    };




  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Ionicons name="settings-outline" size={RFValue(22)} color="#333" />
      </View>

      {/* Week Row */}
      <View style={styles.weekRow}>
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <View key={i} style={styles.weekDay}>
            <View
              style={[
                styles.dayCircle,
                i === 2 && styles.dayCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.weekDayLabel,
                  i === 2 && styles.weekDayLabelActive,
                ]}
              >
                {day}
              </Text>
            </View>
            <Text style={styles.dateText}>{20 + i}</Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calories card */}
        <View style={styles.caloriesCard}>
          <View style={styles.caloriesCardContent}>
            <Text style={styles.goalText}>Daily goal: 1200</Text>
            <Text style={styles.caloriesNumber}>900</Text>
            <Text style={styles.caloriesLeft}>Calories left</Text>
          </View>
          <CircleProgress
            progress={Number(avg)}
            color="#4a3aff"
            label=""
            sizeMultiplier={1.6} // ⚖️ medium size (not too large)
            showFire={true}
          />


        </View>

        {/* Nutrient Rings */}
        <View style={styles.ringContainer}>
          {nutrients.map((n, i) => (
            <CircleProgress
              key={i}
              progress={n.value}
              color={n.color}
              label={n.label}
              grams={n.grams}
              iconSource={n.icon}
            />
          ))}
        </View>
        {/* Pagination Dots */}
        <View style={styles.paginationDots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>


        {/* Info Box */}
       {/* Food List Section */}
<View style={styles.foodListContainer}>
  <Text style={styles.foodListTitle}>Today's Meals</Text>

  {/* Scrollable list (only this part scrolls) */}
  <ScrollView
    style={styles.foodScroll}
    showsVerticalScrollIndicator={false}
  >
    {[
      { name: "Vegetable omelette with spinach", calories: 350, time: "12:30 PM", image: require("../../assets/images/spinch.jpg") },
      { name: "Oatmeal with Fruits", calories: 280, time: "8:00 AM", image: require("../../assets/images/greek.jpg") },
      { name: "Avocado Toast", calories: 200, time: "10:00 AM", image: require("../../assets/images/salad.jpg") },
      { name: "Protein Shake", calories: 150, time: "3:30 PM", image: require("../../assets/images/meat.png") },
      { name: "Salmon & Veggies", calories: 420, time: "7:00 PM", image: require("../../assets/images/grass.png") },
    ].map((food, index) => (
      <View key={index} style={styles.foodItem}>
        <Image source={food.image} style={styles.foodImage} />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodTime}>{food.time}</Text>
        </View>
        <Text style={styles.foodCalories}>{food.calories} kcal</Text>
      </View>
    ))}
  </ScrollView>
</View>

      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => console.log("Add new meal")}
      >
        <Ionicons name="add" size={RFValue(30)} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8fc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp("5%"),
    marginTop: hp("4%"),
  },
  headerTitle: {
    fontSize: RFValue(20),
    fontWeight: "600",
    textAlign: "center",
    marginLeft: wp("25%"),
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: hp("2%"),
  },
  weekDay: {
    alignItems: "center",
  },
  dayCircle: {
    width: wp("9%"),
    height: wp("9%"),
    borderRadius: wp("4.5%"),
    borderWidth: 2,
    borderColor: "#aaa",
    borderStyle: "dotted",
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleActive: {
    backgroundColor: "#4a3aff",
    borderStyle: "solid",
    borderColor: "#4a3aff",
  },
  weekDayLabel: {
    fontWeight: "500",
    color: "#555",
  },
  weekDayLabelActive: {
    color: "#fff",
  },
  dateText: {
    color: "#999",
    fontSize: RFValue(11),
    marginTop: 4,
  },
  caloriesCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: wp("3%"),
    borderRadius: wp("5%"),
    paddingHorizontal: wp("3%"),
    paddingVertical: wp("1%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
    paddingTop: hp("1%"),
  },
  goalText: {
    color: "#000",
    fontSize: RFValue(14),
    fontWeight: "700",
  },
  caloriesNumber: {
    fontSize: RFValue(38),
    fontWeight: "700",
    marginTop: 4,
  },
  caloriesLeft: {
    color: "#666",
    fontSize: RFValue(14),
  },
  ringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingHorizontal: wp("5%"),
    marginTop: hp("1%"),
  },

  ringCard: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: hp("2%"),
  },
  ringLabel: {
    fontSize: RFValue(12),
    color: "#555",
    marginTop: hp("0.5%"),
  },
  ringPercent: {
    position: "absolute",
    top: "35%",
    color: "#111827",
    fontWeight: "700",
    fontSize: RFValue(12),
  },
  infoBox: {
    backgroundColor: "#fff",
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    borderRadius: wp("5%"),
    padding: wp("6%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoTitle: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#333",
  },
  infoText: {
    color: "#888",
    marginTop: hp("1%"),
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: hp("1%"),
    right: wp("6%"),
    backgroundColor: "#4a3aff",
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("7.5%"),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  caloriesCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caloriesCardContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
    marginLeft: wp("5%"),
  },
  ringCenterContent: {
    position: "absolute",
    top: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  nutrientCard: {
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
    width: wp("28%"),
    height: hp("18%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: hp("2%"),
  },
  gramText: {
    fontSize: RFValue(13),
    fontWeight: "700",
    color: "#111",
    marginRight: wp("12%"),
    marginTop: hp("1%"),
  },
  gramLabel: {
    color: "#777",
    fontSize: RFValue(10),
    marginBottom: hp("1%"),
    marginRight: wp("9%"),
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("0%"),
  },

  dot: {
    width: wp("2.5%"),
    height: wp("2.5%"),
    borderRadius: wp("1.25%"),
    backgroundColor: "#E5E7EB",
    marginHorizontal: wp("1%"),
    
  },

  activeDot: {
    backgroundColor: "#4a3aff",
  },
  
  foodListContainer: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    borderRadius: wp("5%"),
    padding: wp("4%"),
     // add white background back
    marginBottom: hp("8%"),
   
  },
  
  foodScroll: {
    maxHeight: hp("33%"), // instead of hp("30%")
    paddingBottom: hp("2%"),
  },
 foodItem: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#fff",
  borderRadius: wp("4%"),
  marginBottom: hp("1.5%"),
  padding: wp("3%"),
  elevation: 3,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 3,
},

foodImage: {
  width: wp("15%"),
  height: wp("15%"),
  borderRadius: wp("3%"),
  resizeMode: "cover",
  marginRight: wp("3%"),
},

foodInfo: {
  flex: 1,
  justifyContent: "center",
},

foodName: {
  fontSize: RFValue(14),
  fontWeight: "600",
  color: "#111",
},

foodTime: {
  fontSize: RFValue(11),
  color: "#888",
  marginTop: hp("0.3%"),
},

caloriesBox: {
  alignItems: "flex-end",
},

foodCalories: {
  fontSize: RFValue(14),
  fontWeight: "700",
  color: "#4a3aff",
},

foodCaloriesLabel: {
  fontSize: RFValue(10),
  color: "#777",
},

foodListTitle: {
  fontSize: RFValue(16),
  fontWeight: "700",
  color: "#111",
  marginBottom: hp("1%"),
  textAlign: "left",
},

});
