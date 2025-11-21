import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from 'react-native-safe-area-context';

const ExerciseScreen = () => {
  const router = useRouter();

  const renderCard = (icon: any, title: string, subtitle: string, onPress: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardLeft}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title || ""}</Text>
        <Text style={styles.cardSubtitle}>{subtitle || ""}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Exercise</Text>

        <View style={{ width: 28 }} /> 
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Log Exercise</Text>

        {renderCard(
  <Image source={require("../../assets/images/run.png")} style={{ width: 20, height: 20 }} />,
  "Run",
  "Running-Jogging, Sprinting, etc",
  () => router.push({ pathname: "/screen1/Run?type=Run", params: { type: "Run" } })
)}

{renderCard(
    <Image source={require("../../assets/images/weight lifting.png")} style={{ width: 20, height: 20 }} />,
    "Weight Lifting",
  "Machines, free weight etc.",
  () => router.push({
  pathname: "/screen1/Run",
  params: { type: "WeightLifting" }
})
)}


        {renderCard(
          <MaterialCommunityIcons name="text-box-edit-outline" size={30} color="#000" />,
          "Describe",
          "Write your workout in text",
          () => router.push("/screen1/DescribeExercise")
        )}
      </View>
    </SafeAreaView>
  );
};

export default ExerciseScreen;

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

  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#000",
  },

  section: {
    marginTop: hp("2%"),
  },

  sectionTitle: {
    fontSize: RFValue(14),
    fontWeight: "600",
    marginBottom: hp("2%"),
    color: "#000",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: wp("4%"),
    borderRadius: 14,
    marginBottom: hp("1.8%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardLeft: {
    marginRight: wp("4%"),
  },

  cardTitle: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#000",
  },

  cardSubtitle: {
    fontSize: RFValue(11),
    color: "#6D6D6D",
    marginTop: 3,
  },
});
