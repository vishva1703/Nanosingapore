import { Ionicons, Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SelectedFood() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [servings, setServings] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [showServingsModal, setShowServingsModal] = useState(false);
  const [inputType, setInputType] = useState<"decimal" | "fraction">("decimal");
  const [selectedNumber, setSelectedNumber] = useState(4);
  const [selectedFraction, setSelectedFraction] = useState("1/3");
  
  const numbersList = Array.from({ length: 20 }, (_, i) => i + 1);
  const fractions = ["1/8", "1/6", "1/4", "1/3", "1/2", "2/3", "3/4"];
  
  const numberListRef = useRef<FlatList>(null);
  const fractionListRef = useRef<FlatList>(null);
  
  // Scroll to selected item when modal opens
  useEffect(() => {
    if (showServingsModal) {
      setTimeout(() => {
        numberListRef.current?.scrollToIndex({
          index: selectedNumber - 1,
          animated: false,
        });
        if (inputType === "fraction") {
          const fractionIndex = fractions.indexOf(selectedFraction);
          if (fractionIndex >= 0) {
            fractionListRef.current?.scrollToIndex({
              index: fractionIndex,
              animated: false,
            });
          }
        }
      }, 100);
    }
  }, [showServingsModal, selectedNumber, selectedFraction, inputType]);
  
  const getParam = (param: string | string[] | undefined): string => {
    return Array.isArray(param) ? param[0] : (param || "");
  };
  
  // Check if called from AddIngredients
  const fromAddIngredients = getParam(params.fromAddIngredients) === 'true';
  
  const measurement = getParam(params.servingSize) || "30g";
  
  // Parse food data from params
  const food = {
    name: getParam(params.name),
    brand: getParam(params.brand),
    description: getParam(params.description) || getParam(params.name),
    servingSize: getParam(params.servingSize),
    servingsPerContainer: getParam(params.servingsPerContainer),
    calories: getParam(params.calories),
    protein: getParam(params.protein),
    carbs: getParam(params.carbs),
    fat: getParam(params.fat),
    saturatedFat: getParam(params.saturatedFat),
    polyunsaturatedFat: getParam(params.polyunsaturatedFat),
    monounsaturatedFat: getParam(params.monounsaturatedFat),
    trans: getParam(params.trans),
    cholesterol: getParam(params.cholesterol),
    sodium: getParam(params.sodium),
    sugar: getParam(params.sugar),
    potassium: getParam(params.potassium),
    fiber: getParam(params.fiber),
    vitaminA: getParam(params.vitaminA),
    vitaminC: getParam(params.vitaminC),
    calcium: getParam(params.calcium),
    iron: getParam(params.iron),
  };

  const nutritionCards = [
    {
      icon: "flame-outline",
      label: "Calories",
      value: food.calories || "0",
      editable: true,
    },
    {
      icon: "nutrition-outline",
      label: "Protein",
      value: food.protein || "0",
      unit: "g",
      editable: false,
    },
    {
      icon: "fast-food-outline",
      label: "Carbs",
      value: food.carbs || "0",
      unit: "g",
      editable: false,
    },
    {
      icon: "water-outline",
      label: "Fat",
      value: food.fat || "0",
      unit: "g",
      editable: false,
    },
  ];

  const otherNutrition = [
    { label: "Saturated fat", value: food.saturatedFat || "0.00", unit: "g" },
    { label: "Polyunsaturated fat", value: food.polyunsaturatedFat || "0.00", unit: "g" },
    { label: "Monounsaturated fat", value: food.monounsaturatedFat || "0.00", unit: "g" },
    { label: "Cholesterol", value: food.cholesterol || "0.00", unit: "g" },
    { label: "Sodium", value: food.sodium || "0.00", unit: "g" },
    { label: "Potassium", value: food.potassium || "0.00", unit: "g" },
    { label: "Sugar", value: food.sugar || "0.00", unit: "g" },
    { label: "Fiber", value: food.fiber || "0.00", unit: "g" },
    { label: "Vitamin A", value: food.vitaminA || "0.00", unit: "" },
    { label: "Vitamin C", value: food.vitaminC || "0.00", unit: "" },
    { label: "Calcium", value: food.calcium || "0.00", unit: "mg" },
    { label: "Iron", value: food.iron || "0.00", unit: "mg" },
  ];

  const handleServingsChange = (change: number) => {
    setServings((prev) => Math.max(1, prev + change));
  };

  return ( 
  <SafeAreaView style={styles.container}>

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
     
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

          <Text style={styles.headerTitle}>
            {fromAddIngredients ? 'Edit Ingredients' : 'Selected Food'}
          </Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={RFValue(22)}
              color="#111"
            />
          </TouchableOpacity>
        </View>

        {/* Menu Modal */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  console.log("Report food");
                }}
              >
                <Octicons name="report" size={RFValue(18)} color="#111" />
                <Text style={styles.menuItemText}>Report food</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  console.log("Delete food");
                  router.back();
                }}
              >
                <Ionicons name="trash-outline" size={RFValue(18)} color="#FF3B30" />
                <Text style={[styles.menuItemText, styles.deleteText]}>Delete food</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.foodNameContainer}>
            <View style={styles.foodNameRow}>
              <View style={styles.foodNameTextContainer}>
                <Text style={styles.foodName}>{food.description || food.name || "Food"}</Text>
                {food.brand && (
                  <Text style={styles.foodBrand}>{food.brand}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.measurementsServingsContainer}>
            <View style={styles.measurementRow}>
              <Text style={styles.measurementLabel}>Measurements</Text>
              <TouchableOpacity style={styles.measurementButton}>
                <Text style={styles.measurementText}>{measurement}</Text>
              </TouchableOpacity>
            </View>

            {/* Number of Servings */}
            <View style={styles.servingsRow}>
              <Text style={styles.servingsLabel}>Number of servings</Text>
              <View style={styles.servingsValueRow}>
                <Text style={styles.servingsValue}>{servings}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    // Initialize modal state from current servings
                    const currentServings = Math.floor(servings);
                    setSelectedNumber(currentServings || 1);
                    setShowServingsModal(true);
                  }}
                >
                  <Ionicons name="pencil-outline" size={RFValue(16)} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Key Nutrition Facts Cards - Two Horizontal Rows */}
          <View style={styles.nutritionCardsContainer}>
            {/* Row 1: Calories & Protein */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionCard}>
                {nutritionCards[0].editable && (
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => {
                      router.push({
                        pathname: "/screen1/fooddatabase/EditCalories",
                        params: {
                          calories: nutritionCards[0].value,
                          ...params,
                        },
                      });
                    }}
                  >
                    <Ionicons name="pencil-outline" size={RFValue(14)} color="#666" />
                  </TouchableOpacity>
                )}
                <View style={styles.nutritionCardContent}>
                  <Ionicons
                    name={nutritionCards[0].icon as any}
                    size={RFValue(24)}
                    color="#4B3AAC"
                  />
                  <View style={styles.nutritionCardTextContainer}>
                    <Text style={styles.nutritionCardLabel}>{nutritionCards[0].label}</Text>
                    <Text style={styles.nutritionCardValue}>
                      {nutritionCards[0].value}
                      {nutritionCards[0].unit || ""}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.nutritionCard}>
                <View style={styles.nutritionCardContent}>
                  <Ionicons
                    name={nutritionCards[1].icon as any}
                    size={RFValue(24)}
                    color="#4B3AAC"
                  />
                  <View style={styles.nutritionCardTextContainer}>
                    <Text style={styles.nutritionCardLabel}>{nutritionCards[1].label}</Text>
                    <Text style={styles.nutritionCardValue}>
                      {nutritionCards[1].value}
                      {nutritionCards[1].unit || ""}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Row 2: Carbs & Fat */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionCardContent}>
                  <Ionicons
                    name={nutritionCards[2].icon as any}
                    size={RFValue(24)}
                    color="#4B3AAC"
                  />
                  <View style={styles.nutritionCardTextContainer}>
                    <Text style={styles.nutritionCardLabel}>{nutritionCards[2].label}</Text>
                    <Text style={styles.nutritionCardValue}>
                      {nutritionCards[2].value}
                      {nutritionCards[2].unit || ""}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.nutritionCard}>
                <View style={styles.nutritionCardContent}>
                  <Ionicons
                    name={nutritionCards[3].icon as any}
                    size={RFValue(24)}
                    color="#4B3AAC"
                  />
                  <View style={styles.nutritionCardTextContainer}>
                    <Text style={styles.nutritionCardLabel}>{nutritionCards[3].label}</Text>
                    <Text style={styles.nutritionCardValue}>
                      {nutritionCards[3].value}
                      {nutritionCards[3].unit || ""}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Other Nutrition Facts - Only show if not from AddIngredients */}
          {!fromAddIngredients && (
            <View style={styles.otherNutritionContainer}>
              <Text style={styles.otherNutritionTitle}>Other nutrition facts</Text>
              {otherNutrition.map((item, index) => (
                <View key={index} style={styles.nutritionListItem}>
                  <Text style={styles.nutritionLabel}>{item.label}</Text>
                  <Text style={styles.nutritionValue}>
                    {item.value}{item.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: hp("5%") }} />
        </ScrollView>

        {/* Log/Done Button - Fixed at Bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => {
              if (fromAddIngredients) {
                // Handle done action - navigate back to FoodDetail with ingredient data
                const originalName = getParam(params.originalName) || '';
                const imageUri = getParam(params.imageUri) || '';
                
                const queryParams = new URLSearchParams();
                if (originalName) queryParams.append('name', originalName);
                if (imageUri) queryParams.append('imageUri', imageUri);
                // Pass ingredient name and quantity
                queryParams.append('ingredientName', food.description || food.name || '');
                queryParams.append('ingredientQuantity', servings.toString());
                queryParams.append('ingredientCalories', food.calories || '0');
                
                router.push(`/screen1/scanfood/FoodDetail?${queryParams.toString()}`);
              } else {
                // Handle log action
                console.log("Log food:", food);
              }
            }}
          >
            <Text style={styles.logButtonText}>
              {fromAddIngredients ? 'Done' : 'Log'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Servings Edit Modal */}
        <Modal
          visible={showServingsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowServingsModal(false)}
        >
          <View style={styles.servingsModalContainer}>
            <View style={styles.servingsModalContent}>
              {/* Input Type Buttons */}
              <View style={styles.inputTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.inputTypeButton,
                    inputType === "decimal" && styles.inputTypeButtonActive,
                  ]}
                  onPress={() => setInputType("decimal")}
                >
                  <Text
                    style={[
                      styles.inputTypeButtonText,
                      inputType === "decimal" && styles.inputTypeButtonTextActive,
                    ]}
                  >
                    Decimal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.inputTypeButton,
                    inputType === "fraction" && styles.inputTypeButtonActive,
                  ]}
                  onPress={() => setInputType("fraction")}
                >
                  <Text
                    style={[
                      styles.inputTypeButtonText,
                      inputType === "fraction" && styles.inputTypeButtonTextActive,
                    ]}
                  >
                    Fraction
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Picker Container */}
              <View style={styles.pickerContainer}>
                {/* Numbers Column */}
                <FlatList
                  ref={numberListRef}
                  data={numbersList}
                  keyExtractor={(item) => item.toString()}
                  showsVerticalScrollIndicator={false}
                  style={styles.pickerColumn}
                  contentContainerStyle={styles.pickerContent}
                  getItemLayout={(data, index) => ({
                    length: hp("6%"),
                    offset: hp("6%") * index,
                    index,
                  })}
                  renderItem={({ item }) => {
                    const isSelected = selectedNumber === item;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.pickerItem,
                          isSelected && styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedNumber(item);
                          numberListRef.current?.scrollToIndex({
                            index: item - 1,
                            animated: true,
                          });
                        }}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            isSelected && styles.pickerItemTextSelected,
                          ]}
                        >
                          {item}
                        </Text> 
                      </TouchableOpacity>
                    );
                  }}
                  initialScrollIndex={selectedNumber - 1}
                  onScrollToIndexFailed={(info) => {
                    const wait = new Promise((resolve) => setTimeout(resolve, 500));
                    wait.then(() => {
                      numberListRef.current?.scrollToIndex({
                        index: info.index,
                        animated: true,
                      });
                    });
                  }}
                />

                {/* Fractions Column - Only show if fraction mode */}
                {inputType === "fraction" && (
                  <FlatList
                    ref={fractionListRef}
                    data={fractions}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    style={styles.pickerColumn}
                    contentContainerStyle={styles.pickerContent}
                    getItemLayout={(data, index) => ({
                      length: hp("6%"),
                      offset: hp("6%") * index,
                      index,
                    })}
                    renderItem={({ item }) => {
                      const isSelected = selectedFraction === item;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.pickerItem,
                            isSelected && styles.pickerItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedFraction(item);
                            const index = fractions.indexOf(item);
                            fractionListRef.current?.scrollToIndex({
                              index,
                              animated: true,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              isSelected && styles.pickerItemTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                    initialScrollIndex={fractions.indexOf(selectedFraction)}
                    onScrollToIndexFailed={(info) => {
                      const wait = new Promise((resolve) => setTimeout(resolve, 500));
                      wait.then(() => {
                        fractionListRef.current?.scrollToIndex({
                          index: info.index,
                          animated: true,
                        });
                      });
                    }}
                  />
                )}
              </View>

              {/* Done Button */}
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => {
                  const newServings = inputType === "decimal" 
                    ? selectedNumber 
                    : parseFloat(selectedNumber.toString()) + parseFloat(selectedFraction.split('/')[0]) / parseFloat(selectedFraction.split('/')[1]);
                  setServings(newServings);
                  setShowServingsModal(false);
                }}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </KeyboardAvoidingView>
     </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4FA", // lighter, matches screenshot
    paddingHorizontal: 16,
},

header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 22,
  marginTop: 6,
  gap: 10,
},


  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("50%"),
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },

  headerTitle: {
    fontSize: RFValue(20),
    fontWeight: "600",
    color: "#111",
  },

  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: hp("6%"),
    paddingRight: wp("4%"),
  },

  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("3%"),
    minWidth: wp("40%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    gap: wp("3%"),
  },

  menuItemText: {
    fontSize: RFValue(12),
    fontWeight: "500",
    color: "#111",
  },

  deleteText: {
    color: "#FF3B30",
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: wp("2%"),
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("3%"),
    paddingBottom: hp("2%"),
  },

  foodNameContainer: {
    marginBottom: hp("3%"),
  },

  foodNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  foodNameTextContainer: {
    flex: 1,
    marginRight: wp("3%"),
  },

  foodName: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("0.5%"),
  },

  foodBrand: {
    fontSize: RFValue(13),
    fontWeight: "400",
    color: "#666",
  },

  bookmarkButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("0.5%"),
  },

  measurementsServingsContainer: {
    marginBottom: hp("2%"),
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: "#fff",
    borderRadius: wp("3%"),
    borderWidth: 1,
    borderColor: "#E5E5EA",
    width: wp("95%"),
    alignSelf: "center",
    left: wp("0.2%"),

  },

  measurementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp("2%"),
  },

  measurementLabel: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#111",
  },

  measurementButton: {
    backgroundColor: "#4B3AAC",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("10%"),
  },

  measurementText: {
    color: "#FFFFFF",
    fontSize: RFValue(11),
    fontWeight: "600",
  },

  servingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  servingsLabel: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#111",
  },

  servingsValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
  },

  servingsValue: {
    fontSize: RFValue(13),
    fontWeight: "600",
    color: "#111",
  },

  editButton: {
    padding: wp("1%"),
  },

  nutritionCardsContainer: {
    marginBottom: hp("1%"),
    
  },

  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("2%"),
    gap: wp("3%"),
  },

  nutritionCard: {
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    padding: wp("2%"),
    flex: 1,
    position: "relative",
    minHeight: hp("10%"),
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    left: wp("1%"),
  },

  nutritionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: wp("3%"),
  },

  nutritionCardTextContainer: {
    flex: 1,
    alignItems: "flex-start",
  },

  nutritionCardLabel: {
    fontSize: RFValue(12),
    fontWeight: "500",
    color: "#666",
    marginBottom: hp("0.5%"),
  },

  nutritionCardValue: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#111",
  },

  editIconButton: {
    position: "absolute",
    top: wp("15%"),
    right: wp("2%"),
    padding: wp("1%"),

  },

  otherNutritionContainer: {
    marginBottom: hp("2%"),
  },

  otherNutritionTitle: {
    fontSize: RFValue(18),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("2%"),
  },

  nutritionListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp("1.2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  nutritionLabel: {
    fontSize: RFValue(14),
    fontWeight: "500",
    color: "#666",
  },

  nutritionValue: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#111",
  },

  buttonContainer: {
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("2%"),
    backgroundColor: "#FFFFFF",
    
  },

  logButton: {
    backgroundColor: "#4B3AAC",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("10%"),
    alignItems: "center",
  },

  logButtonText: {
    color: "#FFF",
    fontSize: RFValue(16),
    fontWeight: "600",
  },

  servingsModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  servingsModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: wp("6%"),
    borderTopRightRadius: wp("6%"),
    paddingTop: hp("3%"),
    paddingBottom: hp("4%"),
    maxHeight: hp("70%"),
  },

  inputTypeContainer: {
    flexDirection: "row",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("3%"),
    gap: wp("3%"),
  },

  inputTypeButton: {
    flex: 1,
    paddingVertical: hp("1.5%"),
    borderRadius: wp("8%"),
    backgroundColor: "#F3F3FA",
    alignItems: "center",
  },

  inputTypeButtonActive: {
    backgroundColor: "#4B3AAC",
  },

  inputTypeButtonText: {
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#111",
  },

  inputTypeButtonTextActive: {
    color: "#FFFFFF",
  },

  pickerContainer: {
    flexDirection: "row",
    height: hp("40%"),
    paddingHorizontal: wp("5%"),
    marginBottom: hp("3%"),
  },

  pickerColumn: {
    flex: 1,
  },

  pickerContent: {
    paddingVertical: hp("15%"),
  },

  pickerItem: {
    height: hp("6%"),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp("0.5%"),
    borderRadius: wp("2%"),
  },

  pickerItemSelected: {
    backgroundColor: "#F3F3FA",
  },

  pickerItemText: {
    fontSize: RFValue(18),
    fontWeight: "400",
    color: "#666",
  },

  pickerItemTextSelected: {
    fontWeight: "700",
    color: "#111",
  },

  modalDoneButton: {
    backgroundColor: "#4B3AAC",
    marginHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    borderRadius: wp("10%"),
    alignItems: "center",
  },

  modalDoneButtonText: {
    color: "#FFFFFF",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
});

