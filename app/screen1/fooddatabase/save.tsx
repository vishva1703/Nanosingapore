import wellnessApi from "@/api/wellnessApi";
import { useFood } from "@/components/FoodContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
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


export default function SaveFoodDatabaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { myFoods, isLoading } = useFood();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize tab from params or default to 'all'
    if (params.tab && ['all', 'mymeals', 'myfood', 'savescans'].includes(params.tab as string)) {
      return params.tab as string;
    }
    return 'all';
  });
  const [quantity, setQuantity] = useState(1);
  const [loggedFoods, setLoggedFoods] = useState<Set<string>>(new Set());
  const [showFoodLoggedModal, setShowFoodLoggedModal] = useState(false);
  
  // State for meals
  const [meals, setMeals] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [savedFoods] = useState([
    {
      id: 1,
      name: "Chickpea curry with brown rice",
      mealType: "Breakfast",
      image: require("../../../assets/images/chickpea curry rice.png"), // Replace with actual food image
    },
  ]);

  const tabs = ["All", "My meals", "My food", "Save scans"];

  // Helper function to safely convert any value to string for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "0";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object" && value.value !== undefined) {
      return typeof value.value === "number" ? value.value.toString() : String(value.value);
    }
    return String(value);
  };

  // Fetch meals from backend API using getMealList
  const fetchMeals = useCallback(async () => {
    try {
      setLoadingMeals(true);
      console.log("🔄 Fetching meals from API...");
      
      // Call the getMealList API endpoint
      const response = await wellnessApi.getMealList({
        page: 1,
        limit: 50,
        search: searchText.trim()
      });

      console.log("📋 Meal list API response:", JSON.stringify(response, null, 2));

      let mealsList: any[] = [];
      
      // Check if response indicates error
      if (response?.flag === false || (response?.success === false && !response?.data)) {
        console.warn("⚠️ API returned error flag:", response?.message || "Unknown error");
        setMeals([]);
        return;
      }
      
      // Handle different response structures from /nutrition-api/my-meal/meal-list
      // Priority order: most common structures first
      // Check for response.data.list first (most common structure)
      if (response?.data?.list !== undefined) {
        if (Array.isArray(response.data.list)) {
          mealsList = response.data.list;
          console.log("✅ Meals loaded from response.data.list:", mealsList.length, "meals");
        } else {
          console.warn("⚠️ response.data.list exists but is not an array:", typeof response.data.list);
        }
      }
      // Check for nested data.data.list
      else if (response?.data?.data?.list && Array.isArray(response.data.data.list)) {
        mealsList = response.data.data.list;
        console.log("✅ Meals loaded from response.data.data.list:", mealsList.length, "meals");
      }
      // Check if response.data is directly an array
      else if (response?.data && Array.isArray(response.data)) {
        mealsList = response.data;
        console.log("✅ Meals loaded from response.data (direct array):", mealsList.length, "meals");
      }
      // Check for response.list
      else if (response?.list && Array.isArray(response.list)) {
        mealsList = response.list;
        console.log("✅ Meals loaded from response.list:", mealsList.length, "meals");
      }
      // Check if response is directly an array
      else if (Array.isArray(response)) {
        mealsList = response;
        console.log("✅ Meals loaded from direct array response:", mealsList.length, "meals");
      }
      // Check for response.data.items
      else if (response?.data?.items && Array.isArray(response.data.items)) {
        mealsList = response.data.items;
        console.log("✅ Meals loaded from response.data.items:", mealsList.length, "meals");
      }
      // Check for response.data.meals
      else if (response?.data?.meals && Array.isArray(response.data.meals)) {
        mealsList = response.data.meals;
        console.log("✅ Meals loaded from response.data.meals:", mealsList.length, "meals");
      }
      // Check for response.data.data (nested data array)
      else if (response?.data?.data && Array.isArray(response.data.data)) {
        mealsList = response.data.data;
        console.log("✅ Meals loaded from response.data.data:", mealsList.length, "meals");
      }
      // If response has flag: true, try to extract data from common structures
      else if (response?.flag === true && response?.data) {
        // Try to find any array in the response
        const findArrayInObject = (obj: any): any[] | null => {
          if (Array.isArray(obj)) return obj;
          if (typeof obj !== 'object' || obj === null) return null;
          for (const key in obj) {
            if (Array.isArray(obj[key])) return obj[key];
            const nested = findArrayInObject(obj[key]);
            if (nested) return nested;
          }
          return null;
        };
        const foundArray = findArrayInObject(response.data);
        if (foundArray) {
          mealsList = foundArray;
          console.log("✅ Meals loaded from nested structure:", mealsList.length, "meals");
        } else {
          console.warn("⚠️ Could not find meal list in response");
          console.warn("⚠️ Full response structure:", JSON.stringify(response, null, 2));
          mealsList = [];
        }
      }
      else {
        console.warn("⚠️ Could not find meal list in response");
        console.warn("⚠️ Full response structure:", JSON.stringify(response, null, 2));
        mealsList = [];
      }
      
      // Since we're calling getMealList API, all items should be meals
      // Only filter out items that explicitly have type === "food" (not meals)
      const filteredMeals = mealsList.filter((item: any) => {
        // Include all items from getMealList (they're all meals)
        // Only exclude if type is explicitly set to "food"
        return item.type !== "food";
      });
      
      console.log("📦 Final meals list:", filteredMeals.length, "meals (filtered from", mealsList.length, "items)");
      if (filteredMeals.length > 0) {
        console.log("📦 Sample meal (first):", JSON.stringify(filteredMeals[0], null, 2));
        if (filteredMeals.length > 1) {
          console.log("📦 Sample meal (second):", JSON.stringify(filteredMeals[1], null, 2));
        }
        console.log("📦 All meal IDs:", filteredMeals.map((m: any) => m.mealId || m.id || m.foodId || m._id || "no-id"));
      } else {
        console.warn("⚠️ No meals found after filtering");
        console.warn("⚠️ Original mealsList:", JSON.stringify(mealsList.slice(0, 2), null, 2));
      }
      setMeals(filteredMeals);
    } catch (error: any) {
      console.error("❌ Error fetching meals from getMealList API:", error);
      console.error("❌ Error details:", error?.response?.data || error?.message);
      setMeals([]);
    } finally {
      setLoadingMeals(false);
    }
  }, [searchText]);

  // Refresh meals when screen comes into focus (e.g., after creating a meal)
  useFocusEffect(
    useCallback(() => {
      if (activeTab === "mymeals") {
        fetchMeals();
      }
    }, [activeTab, fetchMeals])
  );

  // Update tab from params and fetch if needed
  React.useEffect(() => {
    if (params.tab) {
      const validTabs = ['all', 'mymeals', 'myfood', 'savescans'];
      if (validTabs.includes(params.tab as string)) {
        const newTab = params.tab as string;
        setActiveTab(newTab);
        // If switching to mymeals, fetch meals immediately
        if (newTab === "mymeals") {
          fetchMeals();
        }
      }
    }
  }, [params.tab, fetchMeals]);

  // Fetch meals when tab changes to "My meals"
  React.useEffect(() => {
    if (activeTab === "mymeals") {
      fetchMeals();
    }
  }, [activeTab, fetchMeals]);

  // Debounce search for "My meals" tab
  React.useEffect(() => {
    if (activeTab === "mymeals") {
      const timeoutId = setTimeout(() => {
        fetchMeals();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchText, activeTab, fetchMeals]);

  // Initial fetch on mount if tab is "mymeals"
  React.useEffect(() => {
    if (activeTab === "mymeals") {
      fetchMeals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={RFValue(24)} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Database</Text>
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
          placeholder="Describe what ate"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsRow}>
            {tabs.map((tab) => {
              const tabKey = tab.toLowerCase().replace(" ", "");
              const isActive = activeTab === tabKey;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    isActive && styles.activeTab,
                    isActive && styles.activeTabPurple,
                  ]}
                  onPress={() => setActiveTab(tabKey)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.activeTabText,
                      isActive && styles.activeTabTextWhite,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {/* Content Area */}
        {activeTab === "all" ? (
          <View style={styles.myFoodContainer}>
            {/* Show all foods from My food */}
            <TouchableOpacity style={styles.aiButton}>
            <Ionicons name="sparkles-outline" size={RFValue(18)} color="#6C3EB6" />
            <Text style={styles.aiText}>Generate macros using  AI</Text>
          </TouchableOpacity>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4B3AAC" />
                <Text style={styles.loadingText}>Loading foods...</Text>
              </View>
            ) : myFoods.length > 0 ? (
              <>
                {myFoods.map((item: any, index: number) => {
                  const isLogged = loggedFoods.has(item.id || index.toString());
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.foodCard,
                        isLogged && styles.foodCardLogged
                      ]}
                      onPress={() => {
                        if (!isLogged) {
                          router.push({
                            pathname: "/screen1/fooddatabase/SelectedFood",
                            params: {
                              ...item,
                            }
                          });
                        }
                      }}
                    >
                      <View style={styles.foodCardContentWrapper}>
                        <Text style={[
                          styles.foodName,
                          isLogged && styles.foodCardTextLogged
                        ]}>
                          {item.name}
                        </Text>

                        <View style={styles.rowLine}>
                          <Ionicons
                            name="flame-outline"
                            size={16}
                            color={isLogged ? "#FFFFFF" : "black"}
                          />
                          <Text style={[
                            styles.subtitle,
                            isLogged && styles.foodCardTextLogged
                          ]}>
                            {item.calories || '0 Cal'}, {item.cookedType || item.servingSize || '1 serving'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.plusButton,
                          isLogged && styles.plusButtonLogged
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (!isLogged) {
                            const newLoggedFoods = new Set(loggedFoods);
                            newLoggedFoods.add(item.id || index.toString());
                            setLoggedFoods(newLoggedFoods);
                            setShowFoodLoggedModal(true);
                          }
                        }}
                      >
                        {isLogged ? (
                          <Ionicons name="checkmark" size={RFValue(20)} color="#FFFFFF" />
                        ) : (
                          <Text style={styles.plusText}>+</Text>
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <Text style={styles.myFoodTitle}>No foods in database.</Text>
            )}
          </View>
        ) : activeTab === "savescans" ? (
          <>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No save food</Text>
            </View>

            <View style={styles.foodListContainer}>
              {savedFoods.map((food) => (
                <View key={food.id} style={styles.foodCardSaveScans}>
                  <View style={styles.imageWrapper}>
                    <Image source={food.image} style={styles.foodImage} />
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.mealType}>{food.mealType}</Text>

                    <View style={styles.rowWithName}>
                      <Text style={styles.foodNameSaveScans} numberOfLines={2}>{food.name}</Text>

                      <View style={styles.quantitySelector}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleQuantityChange(-1)}
                        >
                          <Text style={styles.quantityButtonText}>−</Text>
                        </TouchableOpacity>

                        <Text style={styles.quantityValue}>{quantity}</Text>

                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => handleQuantityChange(1)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.tooltipContainer}>
                <Image
                  source={require("../../../assets/images/arrow.png")}
                  style={styles.instructionArrow}
                />
                <View style={styles.tooltipBox}>
                  <Text style={styles.tooltipText}>
                    To save food, press the{" "}
                    <Ionicons name="bookmark-outline" size={RFValue(14)} color="#333" /> button
                    while editing a food log.
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : activeTab === "mymeals" ? (
          <View style={styles.myFoodContainer}>
            {/* Show loading state */}
            {loadingMeals ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4B3AAC" />
                <Text style={styles.loadingText}>Loading meals...</Text>
              </View>
            ) : (
              <>
                {/* Debug info - remove in production */}
                {__DEV__ && (
                  <Text style={{ fontSize: 10, color: '#666', marginBottom: 10 }}>
                    Debug: meals.length = {meals.length}, loadingMeals = {loadingMeals ? 'true' : 'false'}
                  </Text>
                )}

                {/* If empty, show message first */}
                {meals.length === 0 && (
                  <Text style={styles.myFoodTitle}>
                    You have created no meals.
                  </Text>
                )}

                {/* Display meals list */}
                {meals.length > 0 && (
                  <View style={styles.mealsListContainer}>
                    {meals.map((meal: any, index: number) => {
                      // Create unique ID - handle mealId from API response
                      const mealId = meal.mealId || meal.id || meal.foodId || meal._id || `meal-index-${index}`;
                      const isLogged = loggedFoods.has(mealId);
                      
                      // Debug log for first few meals
                      if (__DEV__ && index < 3) {
                        console.log(`🍽️ Rendering meal ${index + 1}/${meals.length}:`, {
                          mealId: mealId,
                          originalMealId: meal.mealId,
                          name: meal.mealName || meal.description || meal.name,
                          calories: meal.calories,
                        });
                      }
                      
                      // Extract meal name/description - handle mealName from API
                      const mealName = meal.mealName || meal.description || meal.name || meal.title || "Meal";
                      
                      // Extract calories - handle object format {value: 500, unit: "Cal"}
                      let caloriesValue = "0";
                      if (meal.calories !== undefined && meal.calories !== null) {
                        if (typeof meal.calories === "number") {
                          caloriesValue = meal.calories.toString();
                        } else if (typeof meal.calories === "string") {
                          caloriesValue = meal.calories;
                        } else if (typeof meal.calories === "object" && meal.calories.value !== undefined) {
                          caloriesValue = meal.calories.value.toString();
                        }
                      }
                      
                      // Extract protein - handle macronutrients.protein.value structure
                      let proteinValue: number | null = null;
                      if (meal.macronutrients?.protein?.value !== undefined) {
                        const parsed = parseFloat(meal.macronutrients.protein.value);
                        if (!isNaN(parsed)) proteinValue = parsed;
                      } else if (meal.protein !== undefined && meal.protein !== null) {
                        if (typeof meal.protein === "number") {
                          proteinValue = meal.protein;
                        } else if (typeof meal.protein === "string") {
                          const parsed = parseFloat(meal.protein);
                          if (!isNaN(parsed)) proteinValue = parsed;
                        } else if (typeof meal.protein === "object" && meal.protein.value !== undefined) {
                          const parsed = parseFloat(meal.protein.value);
                          if (!isNaN(parsed)) proteinValue = parsed;
                        }
                      }
                      
                      // Extract carbs - handle macronutrients.carbs.value structure
                      let carbsValue = "0";
                      if (meal.macronutrients?.carbs?.value !== undefined) {
                        carbsValue = meal.macronutrients.carbs.value.toString();
                      } else if (meal.carbs !== undefined && meal.carbs !== null) {
                        if (typeof meal.carbs === "number") {
                          carbsValue = meal.carbs.toString();
                        } else if (typeof meal.carbs === "string") {
                          carbsValue = meal.carbs;
                        } else if (typeof meal.carbs === "object" && meal.carbs.value !== undefined) {
                          carbsValue = meal.carbs.value.toString();
                        }
                      }
                      
                      // Extract fat - handle macronutrients.fats.value structure
                      let fatValue = "0";
                      if (meal.macronutrients?.fats?.value !== undefined) {
                        fatValue = meal.macronutrients.fats.value.toString();
                      } else if (meal.fat !== undefined || meal.fats !== undefined) {
                        const fatData = meal.fat || meal.fats;
                        if (typeof fatData === "number") {
                          fatValue = fatData.toString();
                        } else if (typeof fatData === "string") {
                          fatValue = fatData;
                        } else if (typeof fatData === "object" && fatData.value !== undefined) {
                          fatValue = fatData.value.toString();
                        }
                      }
                      
                      return (
                        <TouchableOpacity
                          key={mealId}
                          style={[
                            styles.foodCard,
                            isLogged && styles.foodCardLogged
                          ]}
                          onPress={() => {
                            if (!isLogged) {
                              router.push({
                                pathname: "/screen1/fooddatabase/SelectedFood",
                                params: {
                                  id: mealId,
                                  mealId: mealId, // Pass mealId explicitly as well
                                  foodId: mealId, // Also pass as foodId for compatibility
                                  name: mealName,
                                  description: mealName,
                                  brand: meal.brand || "",
                                  calories: caloriesValue,
                                  protein: proteinValue?.toString() || "0",
                                  carbs: carbsValue,
                                  fat: fatValue,
                                  servingSize: meal.servingSize || "",
                                  ...meal,
                                }
                              });
                            }
                          }}
                        >
                          <View style={styles.foodCardContentWrapper}>
                            <Text style={[
                              styles.foodName,
                              isLogged && styles.foodCardTextLogged
                            ]}>
                              {mealName}
                            </Text>

                            <View style={styles.rowLine}>
                              <Ionicons
                                name="flame-outline"
                                size={16}
                                color={isLogged ? "#FFFFFF" : "black"}
                              />
                              <Text style={[
                                styles.subtitle,
                                isLogged && styles.foodCardTextLogged
                              ]}>
                                {caloriesValue} Cal
                                {proteinValue !== null && ` • ${Math.round(proteinValue)}g protein`}
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={[
                              styles.plusButton,
                              isLogged && styles.plusButtonLogged
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              if (!isLogged) {
                                const newLoggedFoods = new Set(loggedFoods);
                                newLoggedFoods.add(mealId);
                                setLoggedFoods(newLoggedFoods);
                                setShowFoodLoggedModal(true);
                              }
                            }}
                          >
                            {isLogged ? (
                              <Ionicons name="checkmark" size={RFValue(20)} color="#FFFFFF" />
                            ) : (
                              <Text style={styles.plusText}>+</Text>
                            )}
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* ALWAYS show create button */}
                <TouchableOpacity
                  style={styles.createFoodButton}
                  onPress={() => {
                    router.push("/screen1/fooddatabase/CreateMeal");
                  }}
                >
                  <MaterialCommunityIcons
                    name="food-fork-drink"
                    size={RFValue(20)}
                    color="#4B3AAC"
                  />
                  
                  <Text style={styles.createFoodButtonText}>
                    Create a meal
                  </Text>
                </TouchableOpacity>

                {/* Description text for meals tab */}
                {meals.length === 0 && (
                  <Text style={styles.myFoodSubtitle}>
                    Mix multiple foods together into a meal for easy and fast logging.
                  </Text>
                )}
              </>
            )}
          </View>
        ) : activeTab === "myfood" ? (
          <View style={styles.myFoodContainer}>
            {/* If empty, show message first */}
            {myFoods.length === 0 && (
              <Text style={styles.myFoodTitle}>
                You have created no foods.
              </Text>
            )}

            {/* ALWAYS show create button */}
            <TouchableOpacity
              style={styles.createFoodButton}
              onPress={() => {
                router.push("/screen1/fooddatabase/CreateFoodScreen");
              }}
            >
              <MaterialCommunityIcons
                name="food-fork-drink"
                size={RFValue(20)}
                color="#4B3AAC"
              />
              
              <Text style={styles.createFoodButtonText}>
                Create a food
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No content</Text>
            </View>
          </>
        )}

      </ScrollView>

      {/* Food Logged Modal */}
      <Modal
        visible={showFoodLoggedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFoodLoggedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Food logged</Text>
            <Text style={styles.modalSubtext}>
              if you'd like to make edits, click view to make changes. 
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowFoodLoggedModal(false)}
            >
              <Text style={styles.modalButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("2%"),
  },
  tabsRow: {
    flexDirection: "row",
    gap: wp("2%"),
  },
  tab: {
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
    borderRadius: wp("2%"),
  },
  activeTab: {
    backgroundColor: "#F3F4F6",
  },
  tabText: {
    fontSize: RFValue(13),
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#111827",
    fontWeight: "600",
  },
  activeTabPurple: {
    backgroundColor: "#4B3AAC",
  },
  activeTabTextWhite: {
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("3%"),
  },
  emptyText: {
    fontSize: RFValue(30),
    fontWeight: "700",
    color: "#111827",
  },
  foodListContainer: {
    paddingHorizontal: wp("18%"),
    marginTop: hp("2%"),
    maxWidth: wp("200%"),
  },
  // foodCard: {
  //   marginBottom: 30,
  //   paddingHorizontal: wp("2%"),
  //   paddingVertical: hp("2%"),
  // },
  imageWrapper: {
    left: -wp("20%"),
    width: "250%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  // foodImage: {
  //   width: "100%",
  //   height: hp("30%"),
  //   resizeMode: "cover",
  // },
  foodInfo: {
    padding: wp("5%"),
    height: hp("10%"),
    left: -wp("20%"),

  },
  // mealType: {
  //   fontSize: RFValue(12),
  //   color: "#6B7280",
  //   marginBottom: hp("0.5%"),
  //   fontWeight: "500",
  // },
  // foodName: {
  //   fontSize: RFValue(16),
  //   fontWeight: "600",
  //   color: "#111827",
  // },

  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    flexShrink: 0,
  },

  quantityButton: {
    paddingHorizontal: 8,
  },

  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },

  quantityValue: {
    fontSize: 16,
    marginHorizontal: 6,
    fontWeight: "700",
  },
  tooltipContainer: {
    marginTop: hp("3%"),
    alignItems: "center",
    position: "relative",
    width: wp("80%"),     // ✓ WIDER THAN SCREEN
    left: -wp("8%"),
  },

  instructionArrow: {
    width: wp("15%"),
    height: hp("8%"),
    resizeMode: "contain",
    marginBottom: hp("1%"),
    transform: [{ rotate: "210deg" }],  // ← rotate here
  },

  tooltipBox: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    borderRadius: wp("3%"),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxWidth: wp("100%"),
  },
  tooltipText: {
    fontSize: RFValue(15),
    color: "#374151",
    lineHeight: RFValue(18),
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",   // IMPORTANT
  },

  foodImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlayInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.4)", // semi-transparent background
  },

  mealType: {
    fontSize: 12,
    color: "#777",
  },

  // foodName: {
  //   fontSize: 14,
  //   flexShrink: 1,
  //   maxWidth: "70%",   // keeps long names inside the card
  // },
  infoBox: {
    position: "absolute",
    bottom: -35,
    left: -wp("20%"),
    right: -wp("22.5%"),
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "column",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  
  rowWithName: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    gap: wp("2%"),
  },
  myFoodContainer: {
    alignItems: "center",
    marginTop: hp("10%"),
    paddingHorizontal: wp("5%"),
    width: "100%",
  },
  
  mealsListContainer: {
    width: "100%",
    marginBottom: hp("2%"),
    flexDirection: "column",
  },
  
  myFoodTitle: {
    fontSize: RFValue(25),
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
    marginBottom: hp("3%"),
  },
  
  createFoodButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4B3AAC",
    paddingVertical: hp("1.6%"),
    paddingHorizontal: wp("25%"),
    borderRadius: wp("8%"),
    marginBottom: hp("1.5%"),
    gap: wp("2%"),
  },
  
  createFoodButtonText: {
    color: "#4B3AAC",
    fontSize: RFValue(16),
    fontWeight: "700",
  },
  
  myFoodSubtitle: {
    color: "#777",
    fontSize: RFValue(12),
    marginTop: hp("1%"),
  },
  foodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    marginVertical: hp("1%"),
    width: "100%",
    maxWidth: wp("90%"),
    alignSelf: "center",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  
  foodCardContentWrapper: {
    flex: 1,
    minWidth: 0,
    marginRight: wp("3%"),
  },
  
  foodCardSaveScans: {
    marginBottom: hp("4%"),
    marginHorizontal: wp("18%"),
  },
  
  foodName: {
    fontSize: RFValue(15),
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
  },
  
  foodNameSaveScans: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: wp("2%"),
  },
  
  rowLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  
  subtitle: {
    fontSize: RFValue(12),
    marginLeft: 5,
    color: "#444",
  },
  
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  
  plusText: {
    fontSize: RFValue(20),
    color: "#4B3AAC",
    fontWeight: "900",
  },

  foodCardLogged: {
    backgroundColor: "#4B3AAC",
  },

  foodCardTextLogged: {
    color: "#FFFFFF",
  },

  plusButtonLogged: {
    backgroundColor: "#6B4CD9",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp("6%"),
    padding: wp("6%"),
    width: wp("80%"),
    alignItems: "center",
  },

  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("1.5%"),
  },

  modalSubtext: {
    fontSize: RFValue(14),
    color: "#666",
    textAlign: "center",
    marginBottom: hp("3%"),
    lineHeight: RFValue(20),
  },

  modalButton: {
    backgroundColor: "#4B3AAC",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("20%"),
    borderRadius: wp("8%"),
    width: "100%",
    alignItems: "center",
  },

  modalButtonText: {
    color: "#FFFFFF",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",  
    backgroundColor: "#EFE8FF",
    paddingVertical: hp("1.8%"),
    borderRadius: wp("10%"),
    borderWidth: 1.5,
    borderColor: "#6C3EB6",
    marginBottom: hp("2%"),
    width: "90%",             
    alignSelf: "center",       
  },
  aiText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#6C3EB6",
    marginLeft: wp("2%"),
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("5%"),
  },
  loadingText: {
    marginTop: hp("2%"),
    fontSize: RFValue(14),
    color: "#666",
  },
});

