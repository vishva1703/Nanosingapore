import wellnessApi from '@/api/wellnessApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface FoodItem {
    id: string;
    name: string;
    calories: string;
    serving: string;
}

export default function AddIngredients() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [searchText, setSearchText] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showFoodLoggedModal, setShowFoodLoggedModal] = useState(false);

    const getParam = (param: string | string[] | undefined): string => {
        return Array.isArray(param) ? param[0] : (param || '');
    };

    // Sample food items - in real app, this would come from an API
    const allFoodItems: FoodItem[] = [
        { id: '1', name: '2% Extra Sharp Cheddar Cheese', calories: '90', serving: 'Serving' },
        { id: '2', name: 'Colby Jack Cheese', calories: '340', serving: 'cup, shredded' },
        { id: '3', name: 'Cheese', calories: '99', serving: 'Serving' },
        { id: '4', name: 'American Cheese Singles', calories: '60', serving: 'Serving' },
        { id: '5', name: 'Mozzarella Cheese', calories: '80', serving: 'oz' },
        { id: '6', name: 'Swiss Cheese', calories: '106', serving: 'slice' },
    ];

    const filteredFoodItems = allFoodItems.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleAddItem = async (item: FoodItem) => {
        // Toggle selection
        const newSelectedItems = new Set(selectedItems);
        if (newSelectedItems.has(item.id)) {
            newSelectedItems.delete(item.id);
        } else {
            newSelectedItems.add(item.id);
            
            // Call addIngredient API when item is selected
            try {
                const name = getParam(params.name) || '';
                const imageUri = getParam(params.imageUri) || '';
                const mode = getParam(params.mode) || 'scan';
                const date = getParam(params.date) || new Date().toISOString().split('T')[0];
                
                const payload = {
                    ingredientName: item.name,
                    ingredientCalories: item.calories,
                    ingredientServing: item.serving,
                    foodName: name,
                    imageUri: imageUri,
                    mode: mode,
                    date: date,
                };
                
                console.log("🔧 Calling addIngredient API...", payload);
                const response = await wellnessApi.addIngredient(payload);
                console.log("✅ Ingredient added successfully:", response);
            } catch (error: any) {
                console.error("❌ Failed to add ingredient:", error);
                console.error("❌ Error details:", {
                    message: error?.message,
                    response: error?.response?.data,
                    status: error?.response?.status
                });
                // Don't show alert here - just log the error
                // The ingredient selection will still proceed
            }
            
            // Show modal when item is selected
            setShowFoodLoggedModal(true);
        }
        setSelectedItems(newSelectedItems);
    };

    const handleView = async () => {
        setShowFoodLoggedModal(false);
        // Navigate to SelectedFood with selected ingredient data
        const name = getParam(params.name) || '';
        const originalName = getParam(params.originalName) || name;
        const calories = getParam(params.calories) || '';
        const portion = getParam(params.portion) || '';
        const imageUri = getParam(params.imageUri) || '';
        
        // Get the first selected item (or use the first item if multiple selected)
        const selectedItemIds = Array.from(selectedItems);
        const selectedItem = selectedItemIds.length > 0 
            ? allFoodItems.find(item => item.id === selectedItemIds[0])
            : null;
        
        if (selectedItem) {
            // Ensure ingredient is added via API before navigation
            try {
                const mode = getParam(params.mode) || 'scan';
                const date = getParam(params.date) || new Date().toISOString().split('T')[0];
                
                const payload = {
                    ingredientName: selectedItem.name,
                    ingredientCalories: selectedItem.calories,
                    ingredientServing: selectedItem.serving,
                    foodName: name,
                    imageUri: imageUri,
                    mode: mode,
                    date: date,
                };
                
                console.log("🔧 Calling addIngredient API before navigation...", payload);
                await wellnessApi.addIngredient(payload);
                console.log("✅ Ingredient added successfully before navigation");
            } catch (error: any) {
                console.warn("⚠️ Failed to add ingredient before navigation:", error);
                // Continue with navigation even if API call fails
            }
            
            const queryParams = new URLSearchParams();
            // Use ingredient name as description/name
            queryParams.append('name', selectedItem.name);
            queryParams.append('description', selectedItem.name);
            queryParams.append('calories', selectedItem.calories);
            queryParams.append('servingSize', selectedItem.serving);
            // Mark that this is from AddIngredients
            queryParams.append('fromAddIngredients', 'true');
            // Preserve original params if they exist
            if (originalName) queryParams.append('originalName', originalName);
            if (imageUri) queryParams.append('imageUri', imageUri);
            
            router.push(`/screen1/fooddatabase/SelectedFood?${queryParams.toString()}`);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Ingredients</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search ingredients..."
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus={false}
                        />
                    </View>

                    {/* Suggestion Section */}
                    {filteredFoodItems.length > 0 && (
                        <View style={styles.suggestionSection}>
                            <Text style={styles.suggestionTitle}>Suggestion</Text>
                            {filteredFoodItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.foodItemCard}
                                    onPress={() => handleAddItem(item)}
                                >
                                    <View style={styles.foodItemContent}>
                                        <Text style={styles.foodItemName}>{item.name}</Text>
                                        <View style={styles.foodItemInfo}>
                                            <Ionicons name="flame-outline" size={RFValue(14)} color="#111" />
                                            <Text style={styles.foodItemDetails}>
                                                {item.calories} cal • {item.serving}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.addButton,
                                            selectedItems.has(item.id) && styles.addButtonSelected
                                        ]}
                                        onPress={() => handleAddItem(item)}
                                    >
                                        <Ionicons 
                                            name={selectedItems.has(item.id) ? "checkmark" : "add"} 
                                            size={RFValue(20)} 
                                            color={selectedItems.has(item.id) ? "#fff" : "#4B3AAC"} 
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {filteredFoodItems.length === 0 && searchText && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No results found</Text>
                        </View>
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
                                onPress={handleView}
                            >
                                <Text style={styles.modalButtonText}>View</Text>
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
    },
    headerTitle: {
        fontSize: RFValue(18),
        fontWeight: '600',
        color: '#111',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: hp('5%'),
    },
    searchContainer: {
        paddingHorizontal: wp('5%'),
        marginBottom: hp('2%'),
    },
    searchInput: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#4B3AAC',
        borderRadius: wp('8%'),
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('4%'),
        fontSize: RFValue(14),
        fontWeight: '500',
        color: '#111',
    },
    suggestionSection: {
        paddingHorizontal: wp('5%'),
    },
    suggestionTitle: {
        fontSize: RFValue(16),
        fontWeight: '700',
        color: '#111',
        marginBottom: hp('1.5%'),
    },
    foodItemCard: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        padding: wp('4%'),
        marginBottom: hp('1%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    foodItemContent: {
        flex: 1,
    },
    foodItemName: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#111',
        marginBottom: hp('0.5%'),
    },
    foodItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1%'),
    },
    foodItemDetails: {
        fontSize: RFValue(12),
        color: '#666',
    },
    addButton: {
        width: wp('10%'),
        height: wp('10%'),
        borderRadius: wp('5%'),
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonSelected: {
        backgroundColor: '#4B3AAC',
    },
    emptyState: {
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('5%'),
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: RFValue(14),
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: wp('6%'),
        padding: wp('6%'),
        width: wp('85%'),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: RFValue(20),
        fontWeight: '700',
        color: '#111',
        marginBottom: hp('1%'),
    },
    modalSubtext: {
        fontSize: RFValue(14),
        color: '#666',
        textAlign: 'center',
        marginBottom: hp('3%'),
        lineHeight: RFValue(20),
    },
    modalButton: {
        backgroundColor: '#4B3AAC',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('10%'),
        borderRadius: wp('8%'),
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#fff',
    },
});

