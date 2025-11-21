import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
};

const FloatingInput = React.memo(({ label, value, onChangeText }: FloatingInputProps) => {
  const isFocused = value.trim().length > 0;

  return (
    <View style={{ marginBottom: hp("4%") }}>
      {/* Floating Label */}
      {isFocused && (
        <Text
          style={{
            position: "absolute",
            top: -hp("3.2%"),
            left: wp("1%"),
            backgroundColor: "#F3F3FA",
            paddingHorizontal: 8,
            fontSize: RFValue(14),
            fontWeight: "600",
            color: "#111",
            zIndex: 10,
          }}
        >
          {label}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder={isFocused ? "" : label}
        placeholderTextColor="#A4A4A4"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
});

FloatingInput.displayName = "FloatingInput";

export default function CreateFoodScreen() {
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servingsPerContainer, setServingsPerContainer] = useState("");

  const isFormValid =
    brand.trim() &&
    description.trim() &&
    servingSize.trim() &&
    servingsPerContainer.trim();


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={RFValue(22)}
              color="#111"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Food</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FloatingInput
            label="Brand name"
            value={brand}
            onChangeText={setBrand}
          />

          <FloatingInput
            label="Description"
            value={description}
            onChangeText={setDescription}
          />

          <FloatingInput
            label="Serving size"
            value={servingSize}
            onChangeText={setServingSize}
          />

          <FloatingInput
            label="Serving per container"
            value={servingsPerContainer}
            onChangeText={setServingsPerContainer}
          />

        </ScrollView>

        {/* Next Button - Fixed at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={!isFormValid}
            style={[
              styles.nextButton,
              isFormValid && { backgroundColor: "#4B1F8C" }, // enabled color
            ]}
            onPress={() => router.push({
              pathname: "/screen1/fooddatabase/NuticiationFood",
              params: {
                brand: brand.trim(),
                description: description.trim(),
                servingSize: servingSize.trim(),
                servingsPerContainer: servingsPerContainer.trim(),
              }
            })}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3FA", // soft gray from screenshot
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("4%"),
    paddingVertical: hp("1.5%"),
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: RFValue(20),
    fontWeight: "600",
    color: "#111",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("5%"),
    paddingBottom: hp("2%"),
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("4%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    fontSize: RFValue(15),
    borderWidth: 1.5,
    borderColor: "#D9D6E2",
  },
  

  buttonContainer: {
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("1%"),
    backgroundColor: "#F3F3FA",
    top: hp("1%"),
    bottom: hp("1%"),
    position: "relative",
  },

  nextButton: {
    backgroundColor: "#D1CEDA",   // default disabled color
    paddingVertical: hp("1.8%"),
    borderRadius: wp("10%"),
    alignItems: "center",
  },

  nextButtonText: {
    color: "#FFF",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
});
