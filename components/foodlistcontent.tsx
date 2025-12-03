import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { 
  heightPercentageToDP as hp, 
  widthPercentageToDP as wp 
} from "react-native-responsive-screen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";

interface FoodlistContentProps {
  nutrients: Array<{
    label: string;
    grams: number;
    color: string;
    value: number;
    icon: any;
  }>;
  calories?: {
    consumed?: number;
    goal?: number;
    remaining?: number;
  };
  loading?: boolean;
}

interface CircleProgressProps {
  progress: number;
  color: string;
  label: string;
  sizeMultiplier?: number;
  showFire?: boolean;
  iconSource?: any;
  grams?: number;
}

const CircleProgress: React.FC<CircleProgressProps> = ({
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
                backgroundColor: "#E5E7EB",
              }}
            >
              <MaterialCommunityIcons
                name="fire"
                size={RFValue(20)}
                color="#1E3A8A"
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

const FoodlistContent: React.FC<FoodlistContentProps> = ({
  nutrients,
  calories,
  loading = false,
}) => {
  const router = useRouter();
  const avg = (
    (nutrients[0].value + nutrients[1].value + nutrients[2].value) / 3
  ).toFixed(2);

  // Maximum/total values for calculating progress (goal / total = progress)
  const MAX_CALORIES = 3000;

  const caloriesGoal = calories?.goal || 1200;
  const caloriesRemaining = calories?.remaining !== undefined 
    ? calories.remaining 
    : caloriesGoal - (calories?.consumed || 0);
  const caloriesConsumed = calories?.consumed || 0;

  // Calculate progress for calories circle: goal / total maximum (like in planscreen)
  const caloriesProgress = caloriesGoal > 0 && MAX_CALORIES > 0
    ? Math.min(Math.max(caloriesGoal / MAX_CALORIES, 0), 1)
    : 0;

  return (
    <View style={styles.contentContainer}>
      {/* Calories Card */}
      <View style={styles.caloriesCard}>
        <TouchableOpacity
          style={styles.caloriesCardContent}
          onPress={() => router.push("/screen1/Adjustgoal")}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.goalText}>Daily goal: {caloriesGoal}</Text>
          <Text style={styles.caloriesNumber}>
            {loading ? '...' : caloriesRemaining}
          </Text>
          <Text style={styles.caloriesLeft}>Calories left</Text>
        </TouchableOpacity>
        <CircleProgress
          progress={loading ? 0 : Number(caloriesProgress)}
          color="#4B3AAC"
          label=""
          sizeMultiplier={1.6}
          showFire={true}
        />
      </View>

      {/* Nutrient Rings */}
      <View style={styles.ringContainer}>
        {nutrients.map((nutrient, index) => (
          <CircleProgress
            key={index}
            progress={nutrient.value}
            color={nutrient.color}
            label={nutrient.label}
            grams={nutrient.grams}
            iconSource={nutrient.icon}
          />
        ))}
      </View>

      {/* Food List Section */}
      
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
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
  caloriesCardContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
    marginLeft: wp("5%"),
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
  ringCard: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: hp("2%"),
  },
  ringCenterContent: {
    position: "absolute",
    top: "30%",
    alignItems: "center",
    justifyContent: "center",
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
 
});

export default FoodlistContent;