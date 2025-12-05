import wellnessApi from "@/api/wellnessApi";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateMeal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [mealName, setMealName] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [mealItems, setMealItems] = useState<any[]>([]);
    const [showServingsModal, setShowServingsModal] = useState(false);
    const [inputType, setInputType] = useState<"decimal" | "fraction">("decimal");
    const [selectedNumber, setSelectedNumber] = useState(1);
    const [selectedFraction, setSelectedFraction] = useState("1/3");
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const numbersList = Array.from({ length: 20 }, (_, i) => i + 1);
    const fractions = ["1/8", "1/6", "1/4", "1/3", "1/2", "2/3", "3/4"];

    const numberListRef = useRef<FlatList>(null);
    const fractionListRef = useRef<FlatList>(null);

    // Check for food item added from AddFoodToMeal
    useEffect(() => {
        const getParam = (param: string | string[] | undefined): string => {
            return Array.isArray(param) ? param[0] : (param || "");
        };

        // Check if we have a food item to add
        if (params.addedFoodName || params.addedFoodId) {
            const foodItem = {
                id: getParam(params.addedFoodId) || Date.now().toString(),
                name: getParam(params.addedFoodName) || getParam(params.addedFoodDescription) || "Food",
                description: getParam(params.addedFoodDescription) || getParam(params.addedFoodName) || "",
                brand: getParam(params.addedFoodBrand) || "",
                calories: getParam(params.addedFoodCalories) || "0",
                protein: getParam(params.addedFoodProtein) || "0",
                carbs: getParam(params.addedFoodCarbs) || "0",
                fat: getParam(params.addedFoodFat) || "0",
                servingSize: getParam(params.addedFoodServingSize) || "",
            };

            console.log("➕ Adding food item to meal:", {
                id: foodItem.id,
                name: foodItem.name,
                calories: foodItem.calories,
            });

            // Check if item already exists
            setMealItems(prev => {
                const exists = prev.some(item => item.id === foodItem.id);
                if (!exists) {
                    console.log("✅ Food item added. Total items:", prev.length + 1);
                    return [...prev, foodItem];
                } else {
                    console.log("⚠️ Food item already exists, skipping");
                }
                return prev;
            });

            // Clear params to avoid re-adding
            router.setParams({
                addedFoodName: undefined,
                addedFoodId: undefined,
                addedFoodDescription: undefined,
                addedFoodBrand: undefined,
                addedFoodCalories: undefined,
                addedFoodProtein: undefined,
                addedFoodCarbs: undefined,
                addedFoodFat: undefined,
                addedFoodServingSize: undefined,
            } as any);
        }
    }, [params.addedFoodName, params.addedFoodId, router]);

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

    // Calculate total nutrition from meal items
    const totalNutrition = mealItems.reduce((acc, item) => {
        return {
            calories: acc.calories + (parseFloat(item.calories || "0") || 0),
            protein: acc.protein + (parseFloat(item.protein || "0") || 0),
            carbs: acc.carbs + (parseFloat(item.carbs || "0") || 0),
            fat: acc.fat + (parseFloat(item.fat || "0") || 0),
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const nutritionCards = [
        {
            icon: "flame-outline",
            label: "Calories",
            value: Math.round(totalNutrition.calories).toString(),
            editable: true,
        },
        {
            icon: "nutrition-outline",
            label: "Protein",
            value: Math.round(totalNutrition.protein).toString(),
            unit: "g",
            editable: false,
        },
        {
            icon: "fast-food-outline",
            label: "Carbs",
            value: Math.round(totalNutrition.carbs).toString(),
            unit: "g",
            editable: false,
        },
        {
            icon: "water-outline",
            label: "Fat",
            value: Math.round(totalNutrition.fat).toString(),
            unit: "g",
            editable: false,
        },
    ];

    const isCreateMealEnabled = mealName.trim().length > 0 && mealItems.length > 0;

    // Debug: Log when button state changes
    useEffect(() => {
        if (__DEV__) {
            console.log("🔘 Create Meal Button State:", {
                enabled: isCreateMealEnabled,
                mealName: mealName.trim(),
                mealNameLength: mealName.trim().length,
                mealItemsCount: mealItems.length,
                mealItems: mealItems.map(item => ({ id: item.id, name: item.name || item.description }))
            });
        }
    }, [isCreateMealEnabled, mealName, mealItems]);

    // Handle create meal action
    const handleCreateMeal = async () => {
        if (!mealName.trim() || mealItems.length === 0) {
            Alert.alert("Error", "Please provide a meal name and add at least one food item.");
            return;
        }

        try {
            setLoading(true);
            console.log("🍽️ Creating meal with:", {
                name: mealName.trim(),
                itemsCount: mealItems.length,
                totalCalories: totalNutrition.calories,
                totalProtein: totalNutrition.protein,
            });

            // Prepare meal payload for API
            // Structure it according to the meal API endpoint format
            const mealPayload: any = {
                mealName: mealName.trim(), // Use mealName instead of description
                // Calories in object format {value, unit}
                calories: {
                    value: Math.round(totalNutrition.calories),
                    unit: "Cal"
                },
                // Macronutrients in object format
                macronutrients: {
                    protein: {
                        value: Math.round(totalNutrition.protein),
                        unit: "g"
                    },
                    carbs: {
                        value: Math.round(totalNutrition.carbs),
                        unit: "g"
                    },
                    fats: {
                        value: Math.round(totalNutrition.fat),
                        unit: "g"
                    }
                },
                // Meal items - array of food items
                mealItems: mealItems.map(item => {
                    // Handle servingSize for meal items
                    let itemServingSize: any = { quantity: 1, unit: "serving" };
                    if (item.servingSize) {
                        if (typeof item.servingSize === "string") {
                            // Try to parse string servingSize
                            const parsed = parseFloat(item.servingSize);
                            if (!isNaN(parsed)) {
                                itemServingSize = { quantity: parsed, unit: "serving" };
                            }
                        } else if (typeof item.servingSize === "object" && item.servingSize.quantity !== undefined) {
                            itemServingSize = item.servingSize;
                        }
                    }

                    return {
                        foodId: item.id,
                        name: item.name || item.description,
                        description: item.description || item.name,
                        brand: item.brand || "",
                        calories: parseFloat(item.calories || "0"),
                        protein: parseFloat(item.protein || "0"),
                        carbs: parseFloat(item.carbs || "0"),
                        fat: parseFloat(item.fat || "0"),
                        servingSize: itemServingSize,
                    };
                }),
            };

            // Clean up payload - remove empty strings and ensure all values are valid
            const cleanedPayload: any = {
                mealName: mealPayload.mealName,
                calories: mealPayload.calories,
                macronutrients: mealPayload.macronutrients,
                mealItems: mealPayload.mealItems.map((item: any) => {
                    const cleanedItem: any = {
                        foodId: item.foodId,
                        name: item.name || "",
                        description: item.description || item.name || "",
                        calories: item.calories || 0,
                        protein: item.protein || 0,
                        carbs: item.carbs || 0,
                        fat: item.fat || 0,
                        servingSize: item.servingSize,
                    };
                    // Only include brand if it's not empty
                    if (item.brand && item.brand.trim()) {
                        cleanedItem.brand = item.brand;
                    }
                    return cleanedItem;
                }),
            };

            console.log("📝 Saving meal to backend:", JSON.stringify(cleanedPayload, null, 2));

            // Call API to add/update meal using the meal-specific endpoint
            const apiResponse = await wellnessApi.addUpdateMeal(cleanedPayload);

            console.log("✅ Meal saved to backend:", apiResponse);

            // Extract meal ID from API response
            const mealId = apiResponse?.data?.id ||
                          apiResponse?.data?.foodId ||
                          apiResponse?.data?.mealId ||
                          apiResponse?.id ||
                          apiResponse?.foodId ||
                          apiResponse?.mealId ||
                          Date.now().toString();

            console.log("✅ Meal created successfully with ID:", mealId);
            console.log("✅ Meal details:", {
                name: mealName.trim(),
                itemsCount: mealItems.length,
                totalCalories: totalNutrition.calories,
            });

            Alert.alert(
                "Success",
                `Meal "${mealName.trim()}" created successfully!`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate to save.tsx with "My meals" tab active
                            // This will automatically refresh the meal list
                            router.push({
                                pathname: "/screen1/fooddatabase/save",
                                params: {
                                    tab: "mymeals",
                                },
                            });
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error("❌ Error creating meal:", error);
            Alert.alert(
                "Error",
                error?.response?.data?.message || error?.message || "Failed to create meal. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle delete meal action
    const handleDeleteMeal = async () => {
        // Check if this is an existing meal being edited (has mealId in params)
        const getParam = (param: string | string[] | undefined): string => {
            return Array.isArray(param) ? param[0] : (param || "");
        };
        
        const mealId = getParam(params.mealId);
        
        if (!mealId) {
            // If it's a new meal being created, just go back
            router.back();
            return;
        }

        try {
            setLoading(true);
            setShowDeleteModal(false);

            // Call API to delete meal
            await wellnessApi.deleteFood(mealId);
            
            console.log("✅ Meal deleted from backend:", mealId);

            Alert.alert(
                "Success",
                "Meal deleted successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.back();
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error("❌ Error deleting meal:", error);
            Alert.alert(
                "Error",
                error?.response?.data?.message || error?.message || "Failed to delete meal. Please try again."
            );
        } finally {
            setLoading(false);
        }
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

                    <Text style={styles.headerTitle}>Create Meal</Text>

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
                                    // Handle report food
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
                                    setShowDeleteModal(true);
                                }}
                                disabled={loading}
                            >
                                <Ionicons name="trash-outline" size={RFValue(18)} color="#FF3B30" />
                                <Text style={[styles.menuItemText, styles.deleteText]}>Delete meal</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mealNameContainer}>
                        <TextInput
                            style={styles.mealNameInput}
                            placeholder="Tap to name"
                            placeholderTextColor="#A4A4A4"
                            value={mealName}
                            onChangeText={setMealName}
                        />
                        <Ionicons
                            name="pencil-outline"
                            size={RFValue(16)}
                            color="#666"
                            style={{ marginRight: wp("3%") }}
                        />
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

                    {/* Meal Items Section */}
                    <View style={styles.mealItemsSection}>
                        <Ionicons name="restaurant-outline" size={RFValue(24)} color="#111" alignSelf="center" />
                        <View style={styles.mealItemsHeader}>
                            <Text style={styles.mealItemsTitle}>Meal items</Text>
                        </View>

                        {/* Meal Items List */}
                        {mealItems.length > 0 && (
                            <View style={styles.mealItemsList}>
                                {mealItems.map((item, index) => (
                                    <View key={item.id || index} style={styles.mealItemCard}>
                                        <View style={styles.mealItemContent}>
                                            <Text style={styles.mealItemName}>
                                                {item.description || item.name}
                                            </Text>
                                            <View style={styles.mealItemInfo}>
                                                <Ionicons name="flame-outline" size={RFValue(14)} color="#111" />
                                                <Text style={styles.mealItemCalories}>
                                                    {item.calories || "0"} cal
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.mealItemDeleteButton}
                                            onPress={() => {
                                                setMealItems(prev => prev.filter((_, i) => i !== index));
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={RFValue(18)} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.addItemsButton}
                            onPress={() => {
                                router.push("/screen1/fooddatabase/AddFoodToMeal");
                            }}
                        >
                            <Ionicons name="add" size={RFValue(20)} color="#4B3AAC" />
                            <Text style={styles.addItemsButtonText}>Add items to this meal</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: hp("5%") }} />
                </ScrollView>

                {/* Create Meal Button - Fixed at Bottom */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.createMealButton,
                            (!isCreateMealEnabled || loading) && styles.createMealButtonDisabled
                        ]}
                        disabled={!isCreateMealEnabled || loading}
                        onPress={handleCreateMeal}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={[
                                styles.createMealButtonText,
                                !isCreateMealEnabled && styles.createMealButtonTextDisabled
                            ]}>
                                Create meal
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Delete Confirmation Modal */}
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={showDeleteModal}
                    onRequestClose={() => setShowDeleteModal(false)}
                >
                    <View style={styles.deleteModalOverlay}>
                        <View style={styles.deleteModalContent}>
                            <Ionicons name="trash-outline" size={48} color="#FF3B30" style={styles.deleteModalIcon} />
                            <Text style={styles.deleteModalTitle}>Delete Meal?</Text>
                            <Text style={styles.deleteModalMessage}>
                                Are you sure you want to delete this meal? This action cannot be undone.
                            </Text>
                            
                            <View style={styles.deleteModalButtons}>
                                <TouchableOpacity
                                    style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                                    onPress={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                >
                                    <Text style={styles.deleteModalButtonTextCancel}>Cancel</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.deleteModalButton, styles.deleteModalButtonDelete]}
                                    onPress={handleDeleteMeal}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={styles.deleteModalButtonTextDelete}>Delete</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

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
                                    setShowServingsModal(false);
                                }}
                            >
                                <Text style={styles.modalDoneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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

    mealNameContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: wp("8%"),
        borderWidth: 1.5,
        borderColor: "#D9D6E2",
        paddingHorizontal: wp("4%"),
        paddingVertical: hp("0.5%"),
        marginBottom: hp("2%"),
    },

    mealNameInput: {
        flex: 1,
        fontSize: RFValue(14),
        color: "#111",
        fontWeight: "600",
    },


    mealNameEditButton: {
        padding: wp("2%"),
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
        fontSize: RFValue(20),
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
        paddingVertical: hp("2%"),
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
        marginBottom: hp("0%"),
        marginLeft: wp("3%"),

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
        right: wp("2.5%"),
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

    mealItemsSection: {
        marginTop: hp("9%"),
        marginBottom: hp("2%"),
    },

    mealItemsHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp("2%"),
        marginBottom: hp("2%"),
    },

    mealItemsTitle: {
        marginLeft: wp("30%"),
        alignSelf: "flex-start",
        fontSize: RFValue(18),
        fontWeight: "700",
        color: "#111",
    },

    mealItemsList: {
        marginBottom: hp("2%"),
    },

    mealItemCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: hp("1.5%"),
        paddingHorizontal: wp("4%"),
        marginBottom: hp("1%"),
        borderRadius: wp("4%"),
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    mealItemContent: {
        flex: 1,
    },

    mealItemName: {
        fontSize: RFValue(15),
        fontWeight: "600",
        color: "#111827",
        marginBottom: hp("0.5%"),
    },

    mealItemInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: hp("0.3%"),
    },

    mealItemCalories: {
        fontSize: RFValue(12),
        marginLeft: wp("1%"),
        color: "#6B7280",
    },

    mealItemDeleteButton: {
        padding: wp("2%"),
        marginLeft: wp("2%"),
    },

    addItemsButton: {
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
    },

    addItemsButtonText: {
        color: "#4B3AAC",
        fontSize: RFValue(14),
        fontWeight: "600",
    },

    createMealButton: {
        backgroundColor: "#4B3AAC",
        paddingVertical: hp("1.8%"),
        borderRadius: wp("10%"),
        alignItems: "center",
    },

    createMealButtonDisabled: {
        backgroundColor: "#D1CEDA",
    },

    createMealButtonText: {
        color: "#FFF",
        fontSize: RFValue(16),
        fontWeight: "600",
    },

    createMealButtonTextDisabled: {
        color: "#FFFFFF",
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

    deleteModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    deleteModalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp("6%"),
        padding: wp("6%"),
        width: wp("85%"),
        alignItems: "center",
    },

    deleteModalIcon: {
        marginBottom: hp("2%"),
    },

    deleteModalTitle: {
        fontSize: RFValue(20),
        fontWeight: "700",
        color: "#111",
        marginBottom: hp("1%"),
    },

    deleteModalMessage: {
        fontSize: RFValue(14),
        color: "#666",
        textAlign: "center",
        marginBottom: hp("3%"),
        lineHeight: RFValue(20),
    },

    deleteModalButtons: {
        flexDirection: "row",
        gap: wp("3%"),
        width: "100%",
    },

    deleteModalButton: {
        flex: 1,
        paddingVertical: hp("1.5%"),
        borderRadius: wp("4%"),
        alignItems: "center",
        justifyContent: "center",
    },

    deleteModalButtonCancel: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },

    deleteModalButtonDelete: {
        backgroundColor: "#FF3B30",
    },

    deleteModalButtonTextCancel: {
        fontSize: RFValue(14),
        fontWeight: "600",
        color: "#111",
    },

    deleteModalButtonTextDelete: {
        fontSize: RFValue(14),
        fontWeight: "600",
        color: "#FFF",
    },
});

