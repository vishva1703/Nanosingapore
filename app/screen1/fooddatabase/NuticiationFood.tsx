import { useFood } from "@/components/FoodContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
                keyboardType="numeric"
            />
        </View>
    );
});

FloatingInput.displayName = "FloatingInput";

export default function NuticiationFood() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addFood } = useFood();
    const [calories , setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [saturatedFat, setSaturatedFat] = useState("");
    const [polyunsaturatedFat, setPolyunsaturatedFat] = useState("");
    const [monounsaturatedFat, setMonounsaturatedFat] = useState("");
    const [trans, setTrans] = useState("");
    const [cholesterol, setCholesterol] = useState("");
    const [sodium, setSodium] = useState("");
    const [sugar, setSugar] = useState("");
    const [potassium, setPotassium] = useState("");
    const [fiber, setFiber] = useState("");
    const [vitaminA, setVitaminA] = useState("");
    const [vitaminC, setVitaminC] = useState("");
    const [calcium, setCalcium] = useState("");
    const [iron, setIron] = useState("");

    const isFormValid =
    calories.trim() &&
    protein.trim() &&
    carbs.trim() &&
    fat.trim() &&
    saturatedFat.trim() &&
    polyunsaturatedFat.trim() &&
    monounsaturatedFat.trim() &&
    trans.trim() &&
    cholesterol.trim() &&
    sodium.trim() &&
    sugar.trim() &&
    potassium.trim() &&
    fiber.trim() &&
    vitaminA.trim() &&
    vitaminC.trim() &&
    calcium.trim() &&
    iron.trim();

    const handleSave = () => {
        const getParam = (param: string | string[] | undefined): string => {
          return Array.isArray(param) ? param[0] : (param || "");
        };
        
        const brand = getParam(params.brand);
        const description = getParam(params.description);
        const servingSize = getParam(params.servingSize);
        const servingsPerContainer = getParam(params.servingsPerContainer);
        
        const foodName = description ? `${description}${brand ? ` - ${brand}` : ''}` : (brand || "Food");
        addFood({
          id: Date.now().toString(),
          name: foodName,
          brand,
          description,
          servingSize,
          servingsPerContainer,
          calories,
          protein,
          carbs,
          fat,
          saturatedFat,
          polyunsaturatedFat,
          monounsaturatedFat,
          trans,
          cholesterol,
          sodium,
          sugar,
          potassium,
          fiber,
          vitaminA,
          vitaminC,
          calcium,
          iron,
          cookedType: "cooked",
        });
      
        router.push("/screen1/fooddatabase/save");
      };

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
                        label="Calories"
                        value={calories}
                        onChangeText={setCalories}
                    />

                    <FloatingInput
                        label="Protein (g)"
                        value={protein}
                        onChangeText={setProtein}
                    />

                    <FloatingInput
                        label="Carbs (g)"
                        value={carbs}
                        onChangeText={setCarbs}
                    />

                    <FloatingInput
                        label="Total fat (g)"
                        value={fat}
                        onChangeText={setFat}
                    />

                    <FloatingInput
                        label="Saturated fat (g)"
                        value={saturatedFat}
                        onChangeText={setSaturatedFat}
                    />

                    <FloatingInput
                        label="Polyunsaturated fat (g)"
                        value={polyunsaturatedFat}
                        onChangeText={setPolyunsaturatedFat}
                    />
                    <FloatingInput
                        label="Monounsaturated fat (g)"
                        value={monounsaturatedFat}
                        onChangeText={setMonounsaturatedFat}
                    />

                    <FloatingInput
                        label="Trans (g)"
                        value={trans}
                        onChangeText={setTrans}
                    />

                    <FloatingInput
                        label="Cholesterol (mg)"
                        value={cholesterol}
                        onChangeText={setCholesterol}
                    />
                    <FloatingInput
                        label="Sodium (mg)"
                        value={sodium}
                        onChangeText={setSodium}
                    />
 <FloatingInput
                        label="Potassium (mg)"
                        value={potassium}
                        onChangeText={setPotassium}
                    />
                    <FloatingInput
                        label="Sugar (g)"
                        value={sugar}
                        onChangeText={setSugar}
                    />

                   
                    <FloatingInput
                        label="Fiber (g)"
                        value={fiber}
                        onChangeText={setFiber}
                    />

                    <FloatingInput
                            label="Vitamin A"
                        value={vitaminA}
                        onChangeText={setVitaminA}
                    />

                    <FloatingInput
                        label="Vitamin C"
                        value={vitaminC}
                        onChangeText={setVitaminC}
                    />
                    <FloatingInput
                        label="Calcium (mg)"
                        value={calcium}
                        onChangeText={setCalcium}
                    />

                    <FloatingInput
                        label="Iron (mg)"
                        value={iron}
                        onChangeText={setIron}
                    />
                </ScrollView>

                {/* Next Button - Fixed at Bottom */}
                <View style={styles.buttonContainer}>
                <TouchableOpacity
  disabled={!isFormValid}
  style={[styles.nextButton, isFormValid && { backgroundColor: "#4B1F8C" }]}
  onPress={handleSave}
>
  <Text style={styles.nextButtonText}>Save Food</Text>
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
        borderRadius: wp("8%"),
        paddingVertical: hp("2%"),
        paddingHorizontal: wp("4%"),
        fontSize: RFValue(13),
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
