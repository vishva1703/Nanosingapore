import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdjustGoalsScreen({ navigation }: any) {
    const router = useRouter();
  const [calorie, setCalorie] = useState("900 kcl");
  const [protein, setProtein] = useState("120");
  const [carbs, setCarbs] = useState("100");
  const [fat, setFat] = useState("125");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adjust goals</Text>
        <View style={{ width: 22 }} /> 
      </View>

      {/* Form */}
      <View style={styles.formContainer}>

        {/* Calorie */}
        <Text style={styles.label}>Calorie</Text>
        <TextInput
          value={calorie}
          onChangeText={setCalorie}
          style={styles.input}
          keyboardType="numeric"
        />

        {/* Protein */}
        <Text style={styles.label}>Protein</Text>
        <TextInput
          value={protein}
          onChangeText={setProtein}
          style={styles.input}
          keyboardType="numeric"
        />

        {/* Carbs */}
        <Text style={styles.label}>Carbs</Text>
        <TextInput
          value={carbs}
          onChangeText={setCarbs}
          style={styles.input}
          keyboardType="numeric"
        />

        {/* Fat */}
        <Text style={styles.label}>Fat</Text>
        <TextInput
          value={fat}
          onChangeText={setFat}
          style={styles.input}
          keyboardType="numeric"
        />

        {/* Auto Generate Button */}
        <TouchableOpacity style={styles.autoButton} onPress={()=>router.push('/screens/workout-frequency')}>
          <Text style={styles.autoButtonText}>Auto generate goals</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5FB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    marginBottom: hp("2%"),
    justifyContent: "flex-start",
    textAlign: "left",
    gap: 20,
  },

  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
  },

  formContainer: {
    paddingHorizontal: wp("5%"),
  },

  label: {
    fontSize: RFValue(14),
    fontWeight: "400",
    marginTop: hp("2%"),
    marginBottom: hp("0.5%"),
  },

  input: {
    width: "100%",
    height: hp("6%"),
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    paddingHorizontal: wp("4%"),
    fontSize: RFValue(14),
    fontWeight: "600",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  autoButton: {
    marginTop: hp("5%"),
    width: "100%",
    height: hp("7%"),
    borderRadius: wp("9%"),
    borderWidth: 1.5,
    borderColor: "#4B3AAC",
    justifyContent: "center",
    alignItems: "center",
  },

  autoButtonText: {
    fontSize: RFValue(14),
    color: "#111111",
    fontWeight: "600",
  },
});
