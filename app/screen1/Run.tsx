import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActivity } from "@/components/ActivityContext";
import { useLocalSearchParams } from "expo-router";

const RunScreen = () => {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const [intensity, setIntensity] = useState(2); 
  const [duration, setDuration] = useState(15);
  const { addActivity, setIsAnalyzing } = useActivity();

  // Get activity type from params or default to "Run"
  const activityType = typeof type === 'string' ? type : 'Run';
  
  const intensityTitle = (selected: boolean): TextStyle => ({
    fontSize: 16,
    fontWeight: "700",
    color: selected ? "#000" : "#aaa",
    marginTop: 8,
  });

  // Dynamic content based on activity type
  const getActivityConfig = (type: string) => {
    switch (type) {
      case "WeightLifting":
        return {
          title: "WeightLifting",
          icon: require("../../assets/images/weight lifting.png"), // Add this image
          intensityLabels: {
            high: "Heavy Lifting",
            medium: "Moderate Weights", 
            low: "Light Weights"
          },
          intensityDescriptions: {
            high: "Low reps, heavy weights near max capacity",
            medium: "Moderate weight with controlled reps",
            low: "Light weight for endurance and form"
          }
        };
      case "Run":
      default:
        return {
          title: "Run",
          icon: require("../../assets/images/run.png"),
          intensityLabels: {
            high: "High",
            medium: "Medium",
            low: "Low"
          },
          intensityDescriptions: {
            high: "Sprinting - 24 mph (4 minute miles)",
            medium: "Jogging - 24 mph (10 minute miles)", 
            low: "Chill walk - 6 mph (20 minute miles)"
          }
        };
    }
  };

  const activityConfig = getActivityConfig(activityType);
  const durationOptions = [15, 30, 60, 90];

  // Calculate calories based on activity type and intensity
  const calculateCalories = () => {
    const baseCalories = activityType === "Weight Lifting" ? 4 : 8; // Weight lifting burns fewer calories per minute
    const intensityMultiplier = intensity === 2 ? 1.5 : intensity === 1 ? 1.2 : 1;
    return Math.round(baseCalories * duration * intensityMultiplier);
  };

  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>

    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={activityConfig.icon} style={{ width: 20, height: 20 }} />
          <Text style={styles.headerTitle}>{activityConfig.title}</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
  style={{ flex: 1 }} 
  contentContainerStyle={{ paddingBottom: hp(20) }}
  showsVerticalScrollIndicator={false}
>

        <Text style={styles.sectionTitle}>Set Intensity</Text>

        <View style={styles.intensityCard}>
          <View style={styles.intensityTextBlock}>
            <Text style={intensityTitle(intensity === 2)}>
              {activityConfig.intensityLabels.high}
            </Text>
            <Text style={styles.intensityDesc} numberOfLines={1} ellipsizeMode="tail">
              {activityConfig.intensityDescriptions.high}
            </Text>

            <Text style={intensityTitle(intensity === 1)}>
              {activityConfig.intensityLabels.medium}
            </Text>
            <Text style={styles.intensityDesc} numberOfLines={1} ellipsizeMode="tail">
              {activityConfig.intensityDescriptions.medium}
            </Text>

            <Text style={intensityTitle(intensity === 0)}>
              {activityConfig.intensityLabels.low}
            </Text>
            <Text style={styles.intensityDesc} numberOfLines={1} ellipsizeMode="tail">
              {activityConfig.intensityDescriptions.low}
            </Text>
          </View>

          <View style={styles.verticalSliderContainer}>
            <Slider
              style={styles.verticalSlider}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor="#4F2D9F"
              maximumTrackTintColor="#D3D3D3"
              thumbTintColor="#4F2D9F"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Duration</Text>

        <View style={styles.durationRow}>
          {durationOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.durationChip,
                duration === item && styles.durationChipActive,
              ]}
              onPress={() => setDuration(item)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === item && styles.durationTextActive,
                ]}
              >
                {item} mins
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(duration)}
          onChangeText={(t) => setDuration(Number(t))}
        />

    
      </ScrollView>

      <TouchableOpacity 
        style={styles.addBtn}
        onPress={() => {
          addActivity({
            type: activityConfig.title,
            intensity,
            duration,
            calories: calculateCalories(),
          });
          router.push('/');
        }}
      >
        <Text style={styles.addBtnText}>+ Add</Text>
      </TouchableOpacity>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default RunScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F9",
    paddingHorizontal: wp("4%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("2%"),
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  section: {
    marginTop: hp("1%"),
  },
  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: "600",
    marginVertical: hp("1%"),
  },
  intensityCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: wp("4%"),
    borderRadius: 14,
    marginBottom: hp("2%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  intensityTextBlock: {
    flex: 1,
    paddingRight: wp("2%"),
  },
  intensityDesc: {
    fontSize: RFValue(11),
    color: "#6D6D6D",
    marginBottom: hp("1%"),
    flexShrink: 1,
  },
  verticalSliderContainer: {
    width: 70,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp("2%"),
    overflow: "visible",
  },
  verticalSlider: {
    width: 180,
    height: 60,
    transform: [{ rotate: "-90deg" }],
    overflow: "visible",
    position: "absolute",
  },
  durationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: hp("1.5%"),
  },
  durationChip: {
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  durationChipActive: {
    backgroundColor: "#4F2D9F",
  },
  durationText: {
    color: "#000",
    fontSize: RFValue(11),
  },
  durationTextActive: {
    color: "#FFF",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    fontSize: RFValue(13),
    marginBottom: hp("2%"),
  },
  caloriesPreview: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  caloriesText: {
    fontSize: RFValue(14),
    color: "#666",
  },
  caloriesNumber: {
    fontWeight: "700",
    color: "#4F2D9F",
  },
  addBtn: {
    backgroundColor: "#4F2D9F",
    paddingVertical: hp("2%"),
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 10,
    left: wp("4%"),
    right: wp("4%"),
  
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  addBtnText: {
    color: "#FFF",
    fontSize: RFValue(14),
    fontWeight: "600",
  },
});