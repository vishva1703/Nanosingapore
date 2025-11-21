import { useFood } from "@/components/FoodContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddFoodToMeal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { myFoods } = useFood();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Sample recently logged foods - in real app, this would come from context/state
  const [recentlyLoggedFoods] = useState([
    {
      id: "1",
      name: "Jasmin rice",
      brand: "Dream dinner",
      calories: "450",
      serving: "Serving",
    },
    {
      id: "2",
      name: "Brown rice",
      brand: "Mahatma",
      calories: "450",
      serving: "cup, Cooked",
    },
    {
      id: "3",
      name: "Basmati rice",
      brand: "",
      calories: "450",
      serving: "cup, Cooked",
    },
  ]);

  const tabs = ["All", "My food", "Save scans"];

  const filteredMyFoods = myFoods.filter((item: any) => {
    if (!searchText.trim()) return true;
    const searchLower = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower)
    );
  });

  const filteredRecentlyLogged = recentlyLoggedFoods.filter((item) => {
    if (!searchText.trim()) return true;
    const searchLower = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddFood = (food: any) => {
    // Pass the selected food back to CreateMeal via params
    // Navigate back to CreateMeal with the food item as params
    router.push({
      pathname: "/screen1/fooddatabase/CreateMeal",
      params: {
        addedFoodId: food.id || Date.now().toString(),
        addedFoodName: food.name || food.description || "",
        addedFoodDescription: food.description || food.name || "",
        addedFoodBrand: food.brand || "",
        addedFoodCalories: food.calories || "0",
        addedFoodProtein: food.protein || "0",
        addedFoodCarbs: food.carbs || "0",
        addedFoodFat: food.fat || "0",
        addedFoodServingSize: food.servingSize || food.serving || "",
      },
    });
  };

  const handleViewFood = (food: any) => {
    // Navigate to SelectedFood with all food details
    router.push({
      pathname: "/screen1/fooddatabase/SelectedFood",
      params: {
        // Map food data to match SelectedFood expected format
        name: food.name || food.description || "",
        description: food.description || food.name || "",
        brand: food.brand || "",
        servingSize: food.servingSize || food.serving || "",
        servingsPerContainer: food.servingsPerContainer || "",
        calories: food.calories || "0",
        protein: food.protein || "0",
        carbs: food.carbs || "0",
        fat: food.fat || "0",
        saturatedFat: food.saturatedFat || "0",
        polyunsaturatedFat: food.polyunsaturatedFat || "0",
        monounsaturatedFat: food.monounsaturatedFat || "0",
        trans: food.trans || "0",
        cholesterol: food.cholesterol || "0",
        sodium: food.sodium || "0",
        sugar: food.sugar || "0",
        potassium: food.potassium || "0",
        fiber: food.fiber || "0",
        vitaminA: food.vitaminA || "0",
        vitaminC: food.vitaminC || "0",
        calcium: food.calcium || "0",
        iron: food.iron || "0",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={RFValue(24)} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food to Meal</Text>
        <View style={{ width: RFValue(24) }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={false}
        />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const tabKey = tab.toLowerCase().replace(" ", "");
            const isActive = activeTab === tabKey;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  isActive && styles.activeTabPurple,
                ]}
                onPress={() => setActiveTab(tabKey)}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabTextWhite,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content Area */}
        {activeTab === "all" && (
          <View style={styles.contentContainer}>
            {/* AI Generator Button */}
            <TouchableOpacity
              style={styles.aiGeneratorButton}
              onPress={() => {
                // Handle AI generator action
                console.log("AI Generator clicked");
              }}
            >
              <Ionicons name="sparkles-outline" size={RFValue(20)} color="#4B3AAC" />
              <Text style={styles.aiGeneratorButtonText}>AI generator</Text>
            </TouchableOpacity>

            {/* Select from database section */}
            <Text style={styles.sectionTitle}>Select from database</Text>
            {filteredRecentlyLogged.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.foodItemCard}
                onPress={() => handleViewFood(food)}
              >
                <View style={styles.foodItemContent}>
                  <Text style={styles.foodItemName}>
                    {food.name}
                    {food.brand && ` • ${food.brand}`}
                  </Text>
                  <View style={styles.foodItemInfo}>
                    <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
                    <Text style={styles.foodItemDetails}>
                      {food.calories} cal • {food.serving}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.foodItemPlusButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAddFood(food);
                  }}
                >
                  <Text style={styles.foodItemPlusText}>+</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === "myfood" && (
          <View style={styles.contentContainer}>
            {filteredMyFoods.length === 0 ? (
              <Text style={styles.emptyText}>No foods found</Text>
            ) : (
              filteredMyFoods.map((item: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.foodItemCard}
                  onPress={() => handleViewFood(item)}
                >
                  <View style={styles.foodItemContent}>
                    <Text style={styles.foodItemName}>
                      {item.description || item.name}
                      {item.brand && ` • ${item.brand}`}
                    </Text>
                    <View style={styles.foodItemInfo}>
                      <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
                      <Text style={styles.foodItemDetails}>
                        {item.calories || "0"} cal • {item.servingSize || "Serving"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.foodItemPlusButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddFood(item);
                    }}
                  >
                    <Text style={styles.foodItemPlusText}>+</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === "savescans" && (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No saved scans</Text>
          </View>
        )}

        <View style={{ height: hp("5%") }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("2%"),
    backgroundColor: "#F9FAFB",
  },
  backButton: {
    width: wp("10%"),
    height: wp("10%"),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp("5%"),
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("4%"),
    paddingVertical: hp("1.8%"),
    paddingHorizontal: wp("4%"),
    fontSize: RFValue(14),
    color: "#111827",
    marginHorizontal: wp("5%"),
    marginTop: hp("1%"),
    marginBottom: hp("2%"),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("2%"),
    gap: wp("2%"),
  },
  tab: {
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("8%"),
    backgroundColor: "#F3F4F6",
  },
  activeTabPurple: {
    backgroundColor: "#4B3AAC",
  },
  tabText: {
    fontSize: RFValue(13),
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabTextWhite: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  contentContainer: {
    paddingHorizontal: wp("5%"),
    marginTop: hp("1%"),
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#111827",
    marginTop: hp("3%"),
    marginBottom: hp("2%"),
  },
  aiGeneratorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#4B3AAC",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("8%"),
    gap: wp("2%"),
    marginBottom: hp("2%"),
  },
  aiGeneratorButtonText: {
    color: "#4B3AAC",
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  foodItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    marginBottom: hp("1%"),
    borderRadius: wp("4%"),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  foodItemContent: {
    flex: 1,
    marginRight: wp("2%"),
  },
  foodItemName: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#111827",
    marginBottom: hp("0.5%"),
  },
  foodItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("0.3%"),
  },
  foodItemDetails: {
    fontSize: RFValue(12),
    marginLeft: wp("1%"),
    color: "#6B7280",
  },
  foodItemPlusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  foodItemPlusText: {
    fontSize: RFValue(20),
    color: "#4B3AAC",
    fontWeight: "900",
  },
  emptyText: {
    fontSize: RFValue(14),
    color: "#6B7280",
    textAlign: "center",
    marginTop: hp("3%"),
  },
});

