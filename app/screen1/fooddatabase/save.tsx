import { useFood } from "@/components/FoodContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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
  const { myFoods } = useFood();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(params.tab === 'savescans' ? 'savescans' : 'savescans');
    const [quantity, setQuantity] = useState(1);
  const [loggedFoods, setLoggedFoods] = useState<Set<string>>(new Set());
  const [showFoodLoggedModal, setShowFoodLoggedModal] = useState(false);
  const [savedFoods] = useState([
    {
      id: 1,
      name: "Chickpea curry with brown rice",
      mealType: "Breakfast",
      image: require("../../../assets/images/chickpea curry rice.png"), // Replace with actual food image
    },
  ]);

  const tabs = ["All", "My meals", "My food", "Save scans"];

  React.useEffect(() => {
    if (params.tab) {
      const validTabs = ['all', 'mymeals', 'myfood', 'savescans'];
      if (validTabs.includes(params.tab as string)) {
        setActiveTab(params.tab as string);
      }
    }
  }, [params.tab]);


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

            {myFoods.length > 0 && (
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
                      <View>
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
                            {item.calories} cal-oz, {item.cookedType}
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
            )}

            {/* Show empty message if no foods */}
            {myFoods.length === 0 && (
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
        ) : activeTab === "myfood" || activeTab === "mymeals" ? (
  <View style={styles.myFoodContainer}>

    {/* ALWAYS show create button */}
    <TouchableOpacity
      style={styles.createFoodButton}
      onPress={() => {
        if (activeTab === "mymeals") {
          router.push("/screen1/fooddatabase/CreateMeal");
        } else {
          router.push("/screen1/fooddatabase/CreateFoodScreen");
        }
      }}
    >
      <MaterialCommunityIcons
        name="food-fork-drink"
        size={RFValue(20)}
        color="#4B3AAC"
      />
      <Text style={styles.createFoodButtonText}>Create a food</Text>
    </TouchableOpacity>

    {/* If empty, show message */}
    {myFoods.length === 0 && (
      <Text style={styles.myFoodTitle}>You have created no foods.</Text>
    )}

    {/* If food exists, show list */}
    {myFoods.length > 0 &&
      myFoods.map((item: any, index: number) => {
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
            <View>
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
                  {item.calories} cal-oz, {item.cookedType}
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
  
  foodCardSaveScans: {
    marginBottom: hp("4%"),
    marginHorizontal: wp("18%"),
  },
  
  foodName: {
    fontSize: RFValue(15),
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: wp("2%"),
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
});

