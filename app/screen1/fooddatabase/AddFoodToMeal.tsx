import wellnessApi from "@/api/wellnessApi";
import { useFood } from "@/components/FoodContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  
  // State for "All" tab - Recently Logged
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loadingRecentLogs, setLoadingRecentLogs] = useState(false);
  
  // State for "My food" tab
  const [myFoodsList, setMyFoodsList] = useState<any[]>([]);
  const [loadingMyFoods, setLoadingMyFoods] = useState(false);
  
  // State for "Save scans" tab
  const [savedScans, setSavedScans] = useState<any[]>([]);
  const [loadingSavedScans, setLoadingSavedScans] = useState(false);
  // Fetch recently logged foods for "All" tab
  const fetchRecentLogs = useCallback(async () => {
    try {
      setLoadingRecentLogs(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const response = await wellnessApi.getDashboardRecentLogs({
        date: today,
        page: 1,
        limit: 20
      } as any);

      console.log("📊 Recent logs response:", JSON.stringify(response, null, 2));

      let logsList: any[] = [];
      
      if (response?.data?.list && Array.isArray(response.data.list)) {
        logsList = response.data.list;
        console.log("✅ Recent logs loaded:", logsList.length, "items");
      } else if (response?.data && Array.isArray(response.data)) {
        logsList = response.data;
        console.log("✅ Recent logs loaded (direct array):", logsList.length, "items");
      } else {
        console.warn("⚠️ Could not find recent logs in response");
        logsList = [];
      }
      
      // Remove duplicates before setting state
      const seen = new Set<string>();
      const uniqueLogs = logsList.filter((item) => {
        const id = item.id || item.foodId || `${item.name || item.description || ""}_${item.brand || ""}`;
        if (seen.has(id)) {
          return false;
        }
        seen.add(id);
        return true;
      });
      
      console.log("✅ Unique recent logs:", uniqueLogs.length, "items (removed", logsList.length - uniqueLogs.length, "duplicates)");
      setRecentLogs(uniqueLogs);
    } catch (error: any) {
      console.error("❌ Error fetching recent logs:", error);
      setRecentLogs([]);
    } finally {
      setLoadingRecentLogs(false);
    }
  }, []);

  // Fetch user's saved foods for "My food" tab
  const fetchMyFoods = useCallback(async () => {
    try {
      setLoadingMyFoods(true);
      const response = await wellnessApi.getFoodList({
        page: 1,
        limit: 50,
        search: searchText.trim()
      });

      console.log("🍎 My foods response:", JSON.stringify(response, null, 2));

      // getFoodList already returns an array directly
      const foodsList = Array.isArray(response) ? response : [];
      console.log("✅ My foods loaded:", foodsList.length, "items");
      
      // Remove duplicates before setting state
      const seen = new Set<string>();
      const uniqueFoods = foodsList.filter((item) => {
        const id = item.id || item.foodId || `${item.name || item.description || ""}_${item.brand || ""}`;
        if (seen.has(id)) {
          return false;
        }
        seen.add(id);
        return true;
      });
      
      console.log("✅ Unique my foods:", uniqueFoods.length, "items (removed", foodsList.length - uniqueFoods.length, "duplicates)");
      setMyFoodsList(uniqueFoods);
    } catch (error: any) {
      console.error("❌ Error fetching my foods:", error);
      setMyFoodsList([]);
    } finally {
      setLoadingMyFoods(false);
    }
  }, [searchText]);

  // Fetch saved scans for "Save scans" tab
  const fetchSavedScans = useCallback(async () => {
    try {
      setLoadingSavedScans(true);
      // Note: If there's a specific endpoint for saved scans, replace this
      // For now, using a placeholder - you may need to add this endpoint to wellnessApi
      console.log("📸 Fetching saved scans...");
      
      // TODO: Add API endpoint for saved scans if available
      // const response = await wellnessApi.getSavedScans({ page: 1, limit: 50 });
      
      setSavedScans([]);
    } catch (error: any) {
      console.error("❌ Error fetching saved scans:", error);
      setSavedScans([]);
    } finally {
      setLoadingSavedScans(false);
    }
  }, []);

  // Reset to "all" tab when page is focused and fetch data
  useFocusEffect(
    useCallback(() => {
      setActiveTab("all");
      fetchRecentLogs();
    }, [fetchRecentLogs])
  );

  // Fetch data when tab changes
  React.useEffect(() => {
    if (activeTab === "all") {
      fetchRecentLogs();
    } else if (activeTab === "myfood") {
      fetchMyFoods();
    } else if (activeTab === "savescans") {
      fetchSavedScans();
    }
  }, [activeTab, fetchRecentLogs, fetchMyFoods, fetchSavedScans]);

  // Debounce search for "My food" tab
  React.useEffect(() => {
    if (activeTab === "myfood") {
      const timeoutId = setTimeout(() => {
        fetchMyFoods();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchText, activeTab, fetchMyFoods]);

  const tabs = ["All", "My food", "Save scans"];

  // Helper function to format servingSize (handles both string and object formats)
  const formatServingSize = (servingSize: any): string => {
    if (!servingSize) return "1 serving";
    if (typeof servingSize === "string") return servingSize;
    if (typeof servingSize === "object" && servingSize.value !== undefined && servingSize.unit) {
      return `${servingSize.value} ${servingSize.unit}`;
    }
    if (typeof servingSize === "object" && servingSize.value !== undefined) {
      return `${servingSize.value}`;
    }
    return "1 serving";
  };

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

  // Helper function to extract numeric value from any format
  const extractNumericValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === "object" && value.value !== undefined) {
      const numValue = typeof value.value === "number" ? value.value : parseFloat(value.value);
      return isNaN(numValue) ? 0 : numValue;
    }
    return 0;
  };

  // Helper function to remove duplicates based on ID
  const removeDuplicates = (items: any[]): any[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const id = item.id || item.foodId || `${item.name || item.description || ""}_${item.brand || ""}`;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  };

  // Filter recent logs for "All" tab (with deduplication)
  const filteredRecentLogs = removeDuplicates(recentLogs).filter((item: any) => {
    if (!searchText.trim()) return true;
    const searchLower = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower)
    );
  });

  // Filter my foods for "My food" tab (with deduplication)
  const filteredMyFoods = removeDuplicates(myFoodsList).filter((item: any) => {
    if (!searchText.trim()) return true;
    const searchLower = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.brand?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddFood = (food: any) => {
    // Extract nutrition values properly
    const extractValue = (val: any): string => {
      const num = extractNumericValue(val);
      return num.toString();
    };

    router.push({
      pathname: "/screen1/fooddatabase/CreateMeal",
      params: {
        addedFoodId: food.id || food.foodId || Date.now().toString(),
        addedFoodName: formatValue(food.name || food.description || ""),
        addedFoodDescription: formatValue(food.description || food.name || ""),
        addedFoodBrand: formatValue(food.brand || ""),
        addedFoodCalories: extractValue(food.calories),
        addedFoodProtein: extractValue(food.protein),
        addedFoodCarbs: extractValue(food.carbs),
        addedFoodFat: extractValue(food.fat),
        addedFoodServingSize: typeof food.servingSize === "object" 
          ? JSON.stringify(food.servingSize) 
          : formatValue(food.servingSize || food.serving || ""),
      },
    });
  };

  const handleViewFood = (food: any) => {
    // Extract nutrition values properly (handles both number and object formats)
    const extractValue = (val: any): string => {
      const num = extractNumericValue(val);
      return num.toString();
    };

    router.push({
      pathname: "/screen1/fooddatabase/SelectedFood",
      params: {
        name: formatValue(food.name || food.description || ""),
        description: formatValue(food.description || food.name || ""),
        brand: formatValue(food.brand || ""),
        servingSize: typeof food.servingSize === "object" 
          ? JSON.stringify(food.servingSize) 
          : formatValue(food.servingSize || food.serving || ""),
        servingsPerContainer: extractValue(food.servingsPerContainer),
        calories: extractValue(food.calories),
        protein: extractValue(food.protein),
        carbs: extractValue(food.carbs),
        fat: extractValue(food.fat),
        saturatedFat: extractValue(food.saturatedFat),
        polyunsaturatedFat: extractValue(food.polyunsaturatedFat),
        monounsaturatedFat: extractValue(food.monounsaturatedFat),
        trans: extractValue(food.trans),
        cholesterol: extractValue(food.cholesterol),
        sodium: extractValue(food.sodium),
        sugar: extractValue(food.sugar),
        potassium: extractValue(food.potassium),
        fiber: extractValue(food.fiber),
        vitaminA: extractValue(food.vitaminA),
        vitaminC: extractValue(food.vitaminC),
        calcium: extractValue(food.calcium),
        iron: extractValue(food.iron),
        foodId: food.id || food.foodId || "",
        fromAddFoodToMeal: "true", // Mark that this is from AddFoodToMeal
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
                <TextInput
          style={styles.searchInput}
          placeholder="Search foods..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={false}
        />
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
        {activeTab === "all" && (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Recently Logged</Text>

            {loadingRecentLogs ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4B3AAC" />
                <Text style={styles.loadingText}>Loading recent items...</Text>
              </View>
            ) : filteredRecentLogs.length === 0 ? (
              <Text style={styles.emptyText}>No recent items</Text>
            ) : (
              filteredRecentLogs.map((item: any, index: number) => (
                <TouchableOpacity
                  key={item.id || item.foodId || index}
                  style={styles.foodItemCard}
                  onPress={() => handleViewFood(item)}
                >
                  <View style={styles.foodItemContent}>
                    <Text style={styles.foodItemName}>
                      {formatValue(item.description || item.name)}
                    </Text>

                    <View style={styles.foodItemInfo}>
                      <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
                      <Text style={styles.foodItemDetails}>
                        {formatValue(item.calories)} cal • {formatServingSize(item.servingSize)}
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

        {activeTab === "myfood" && (
          <View style={styles.contentContainer}>
            {loadingMyFoods ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4B3AAC" />
                <Text style={styles.loadingText}>Loading your foods...</Text>
              </View>
            ) : filteredMyFoods.length === 0 ? (
              <Text style={styles.emptyText}>No foods found</Text>
            ) : (
              filteredMyFoods.map((item: any, index: number) => (
                <TouchableOpacity
                  key={item.id || item.foodId || index}
                  style={styles.foodItemCard}
                  onPress={() => handleViewFood(item)}
                >
                  <View style={styles.foodItemContent}>
                    <Text style={styles.foodItemName}>
                      {formatValue(item.description || item.name)}
                      {item.brand && ` • ${formatValue(item.brand)}`}
                    </Text>
                    <View style={styles.foodItemInfo}>
                      <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
                      <Text style={styles.foodItemDetails}>
                        {formatValue(item.calories)} cal • {formatServingSize(item.servingSize)}
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
            {loadingSavedScans ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4B3AAC" />
                <Text style={styles.loadingText}>Loading saved scans...</Text>
              </View>
            ) : savedScans.length === 0 ? (
              <Text style={styles.emptyText}>No saved scans</Text>
            ) : (
              savedScans.map((item: any, index: number) => (
                <TouchableOpacity
                  key={item.id || item.scanId || index}
                  style={styles.foodItemCard}
                  onPress={() => handleViewFood(item)}
                >
                  <View style={styles.foodItemContent}>
                    <Text style={styles.foodItemName}>
                      {formatValue(item.description || item.name || "Scanned Food")}
                    </Text>
                    <View style={styles.foodItemInfo}>
                      <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
                      <Text style={styles.foodItemDetails}>
                        {formatValue(item.calories)} cal • {formatServingSize(item.servingSize)}
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("5%"),
  },
  loadingText: {
    fontSize: RFValue(14),
    color: "#6B7280",
    marginTop: hp("2%"),
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("2%"),
    marginBottom: hp("0.5%"),
  },
});

  