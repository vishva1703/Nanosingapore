import { useFood } from '@/components/FoodContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';

interface IngredientItem {
    name: string;
    quantity: number;
}

export default function FoodDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { addFood } = useFood();
    const [quantity, setQuantity] = useState(1);
    const [ingredients, setIngredients] = useState<string>('');
    const [ingredientsList, setIngredientsList] = useState<IngredientItem[]>([]);
    const [saving, setSaving] = useState(false);

    const getParam = (param: string | string[] | undefined): string => {
        return Array.isArray(param) ? param[0] : (param || '');
    };

    const foodName = getParam(params.name) || 'Chickpea curry';
    const calories = getParam(params.calories) || '300';
    const caloriesUnit = getParam(params.caloriesUnit) || 'Cal';
    const carbs = getParam(params.carbs) || '0';
    const carbsUnit = getParam(params.carbsUnit) || 'g';
    const protein = getParam(params.protein) || '0';
    const proteinUnit = getParam(params.proteinUnit) || 'g';
    const fat = getParam(params.fat) || '0';
    const fatUnit = getParam(params.fatUnit) || 'g';
    const portion = getParam(params.portion) || '8 oz cooked';
    const imageUri = getParam(params.imageUri);
    const mode = getParam(params.mode);

    // Update ingredients list when returning from AddIngredients (SelectedFood)
    useEffect(() => {
        const ingredientName = getParam(params.ingredientName);
        const ingredientQuantity = getParam(params.ingredientQuantity);
        
        if (ingredientName && ingredientQuantity) {
            const newIngredient: IngredientItem = {
                name: ingredientName,
                quantity: parseInt(ingredientQuantity) || 1,
            };
            // Add the new ingredient at the beginning of the list
            setIngredientsList(prev => [newIngredient, ...prev]);
            // Clear the params after reading
            router.setParams({ ingredientName: '', ingredientQuantity: '' } as any);
        }
    }, [params.ingredientName, params.ingredientQuantity]);

    // Update ingredients text when returning from Fixresult
    useEffect(() => {
        const ingredientsParam = getParam(params.ingredients);
        if (ingredientsParam && ingredientsParam.trim()) {
            setIngredients(ingredientsParam);
            // Clear the param after reading
            router.setParams({ ingredients: '' } as any);
        }
    }, [params.ingredients]);

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };

    // Calculate adjusted values based on quantity
    const calculateAdjustedValue = (value: string, unit: string): string => {
        const numericValue = parseFloat(value) || 0;
        const adjusted = numericValue * quantity;
        return `${adjusted}${unit}`;
    };

    const nutritionCards = [
        {
            icon: 'flame-outline',
            label: 'Calories',
            value: calculateAdjustedValue(calories, caloriesUnit),
            color: '#000',
        },
        {
            icon: 'nutrition-outline',
            label: 'Carbs',
            value: calculateAdjustedValue(carbs, carbsUnit),
            color: '#F59E0B',
        },
        {
            icon: 'fitness-outline',
            label: 'Protein',
            value: calculateAdjustedValue(protein, proteinUnit),
            color: '#EF4444',
        },
        {
            icon: 'water-outline',
            label: 'Fat',
            value: calculateAdjustedValue(fat, fatUnit),
            color: '#10B981',
        },
    ];

    // Function to add an ingredient to the beginning of the list
    const addIngredientToTop = (name: string, quantity: number) => {
        const newIngredient: IngredientItem = { name, quantity };
        setIngredientsList(prev => [newIngredient, ...prev]);
    };

    const handleDone = async () => {
        try {
            setSaving(true);
            
            // Prepare food data object
            const foodData = {
                id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: foodName,
                calories: `${parseFloat(calories) * quantity}${caloriesUnit}`,
                protein: `${parseFloat(protein) * quantity}${proteinUnit}`,
                carbs: `${parseFloat(carbs) * quantity}${carbsUnit}`,
                fat: `${parseFloat(fat) * quantity}${fatUnit}`,
                servingSize: portion,
                cookedType: portion, // Using portion as cookedType for display
                description: ingredients || '',
                // Combine all ingredients into description
                ingredients: ingredientsList.length > 0 
                    ? ingredientsList.map(item => `${item.name} (Qty: ${item.quantity})`).join(', ')
                    : ingredients,
                imageUri: imageUri || '',
                quantity: quantity,
                mode: mode || 'scan',
            };

            console.log('💾 Saving food data:', foodData);

            // Add to FoodContext
            addFood(foodData);

            // Optionally save to API if you have an endpoint
            // try {
            //     await wellnessApi.addOrUpdateFood(foodData);
            // } catch (apiError) {
            //     console.warn('API save failed, but food saved locally:', apiError);
            // }

            Alert.alert(
                'Success',
                `${foodName} has been saved to your food database!`,
                [
                    {
                        text: 'View Database',
                        onPress: () => {
                            router.push({
                                pathname: '/screen1/fooddatabase/save',
                                params: { tab: 'all' }
                            });
                        }
                    },
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error: any) {
            console.error('Error saving food:', error);
            Alert.alert(
                'Error',
                'Failed to save food. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Food Image with Close Button */}
                <View style={styles.imageContainer}>
                    <Image
                        source={imageUri ? { uri: imageUri } : require('../../../assets/images/chickpea curry rice.png')}
                        style={styles.foodImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={RFValue(24)} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Content Container with Curved Top Corners */}
                <View style={styles.contentContainer}>
                    {/* Food Name and Quantity Selector */}
                    <View style={styles.headerSection}>
                        <Text style={styles.foodName}>{foodName}</Text>
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={handleDecrease}
                            >
                                <Text style={styles.quantityButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={handleIncrease}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Nutrition Cards Grid */}
                    <View style={styles.nutritionGrid}>
                        {nutritionCards.map((card, index) => (
                            <View key={index} style={styles.nutritionCard}>
                                <View style={styles.nutritionCardContent}>
                                    <View style={styles.nutritionCardLeft}>
                                        <View style={styles.iconContainer}>
                                            <Ionicons
                                                name={card.icon as any}
                                                size={RFValue(18)}
                                                color={card.color}
                                            />
                                        </View>
                                        <View style={styles.nutritionTextContainer}>
                                            <Text style={styles.nutritionLabel}>{card.label}</Text>
                                            <Text style={styles.nutritionValue}>{card.value}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.editButton}>
                                        <Ionicons
                                            name="create-outline"
                                            size={RFValue(14)}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Health Score */}
                    <View style={styles.healthScoreSection}>
                        <View style={styles.healthScoreHeader}>
                            <Ionicons name="heart" size={RFValue(20)} color="#EF4444" />
                            <Text style={styles.healthScoreTitle}>Health Score</Text> 
                            <Text style={styles.healthScoreValue}>7/10</Text>
                        </View>
                        <View style={styles.healthScoreBar}>
                            <View style={styles.healthScoreFill} />
                        </View>
                    </View>

                    {/* Ingredients Section */}
                    <View style={styles.ingredientsSection}>
                        <Text style={styles.sectionTitle}>Ingredients</Text>
                        
                        {/* Ingredients Cards Row - Show original ingredients + added ingredients + Add button */}
                        <View style={styles.ingredientsListWrapper}>
                            {/* Original Ingredients from Image Scan - Parse and show as individual cards */}
                            {ingredients && ingredients.trim() && (() => {
                                // Parse ingredients string (comma-separated) into individual items
                                const originalIngredientsArray = ingredients
                                    .split(',')
                                    .map(ing => ing.trim())
                                    .filter(ing => ing.length > 0);
                                
                                return originalIngredientsArray.map((ingredient, index) => (
                                    <View key={`original-${index}`} style={styles.ingredientItemCard}>
                                        <View style={styles.ingredientItemContent}>
                                            <Text style={styles.ingredientItemName} numberOfLines={2} ellipsizeMode="tail">
                                                {ingredient}
                                            </Text>
                                            <Text style={styles.ingredientItemQuantity}>{portion}</Text>
                                        </View>
                                    </View>
                                ));
                            })()}
                            
                            {/* Added Ingredients Cards from AddIngredients - Show alongside original */}
                            {ingredientsList.map((item, index) => (
                                <View key={`added-${index}`} style={styles.ingredientItemCard}>
                                    <View style={styles.ingredientItemContent}>
                                        <Text style={styles.ingredientItemName} numberOfLines={2} ellipsizeMode="tail">
                                            {item.name}
                                        </Text>
                                        <Text style={styles.ingredientItemQuantity}>
                                            {item.quantity} {item.quantity === 1 ? 'cup' : 'cups'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            
                            {/* Add Button Card - Always visible */}
                            <TouchableOpacity 
                                style={styles.addIngredientsCard}
                                onPress={() => {
                                    const queryParams = new URLSearchParams();
                                    if (foodName) queryParams.append('name', foodName);
                                    if (calories) queryParams.append('calories', calories);
                                    if (portion) queryParams.append('portion', portion);
                                    if (imageUri) queryParams.append('imageUri', imageUri);
                                    if (mode) queryParams.append('mode', mode);
                                    queryParams.append('originalName', foodName);
                                    router.push(`/screen1/scanfood/AddIngredients?${queryParams.toString()}`);
                                }}
                            >
                                <Text style={styles.addIngredientsText}>Add</Text>
                                <Ionicons name="add" size={RFValue(32)} color="#4B3AAC" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Bottom Buttons */}
                <View style={styles.bottomButtons}>
                    <TouchableOpacity 
                        style={styles.fixResultsButton} 
                        onPress={() => {
                            const queryParams = new URLSearchParams();
                            if (foodName) queryParams.append('name', foodName);
                            if (calories) queryParams.append('calories', calories);
                            if (portion) queryParams.append('portion', portion);
                            if (imageUri) queryParams.append('imageUri', imageUri);
                            router.push(`/screen1/scanfood/Fixresult?${queryParams.toString()}`);
                        }}
                    >
                        <Ionicons name="sparkles-outline" size={RFValue(20)} color="#4B3AAC" />
                        <Text style={styles.fixResultsText}>Fix Results</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.doneButton, saving && styles.doneButtonDisabled]}
                        onPress={handleDone}
                        disabled={saving}
                    >
                        <Text style={styles.doneButtonText}>
                            {saving ? 'Saving...' : 'Done'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: hp('30%'),
        position: 'relative',
    },
    foodImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: hp('2%'),
        left: wp('5%'),
        width: wp('10%'),
        height: wp('10%'),
        borderRadius: wp('5%'),
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: wp('8%'),
        borderTopRightRadius: wp('8%'),
        marginTop: -wp('4%'),
        paddingTop: wp('4%'),
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
    },
    foodName: {
        fontSize: RFValue(20),
        fontWeight: '700',
        color: '#111',
        flex: 1,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F7',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('1%'),
        borderRadius: wp('8%'),
        borderWidth: 1.5,
        borderColor: '#4B3AAC',
    },
    quantityButton: {
        paddingHorizontal: wp('2%'),
    },
    quantityButtonText: {
        fontSize: RFValue(18),
        fontWeight: '600',
        color: '#4B3AAC',
    },
    quantityValue: {
        fontSize: RFValue(16),
        fontWeight: '700',
        color: '#111',
        marginHorizontal: wp('3%'),
        minWidth: wp('8%'),
        textAlign: 'center',
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: wp('5%'),
        marginBottom: hp('2%'),
        justifyContent: 'space-between',
    },
    nutritionCard: {
        width: '47%',
        backgroundColor: '#F9FAFB',
        borderRadius: wp('3%'),
        padding: wp('3%'),
        marginBottom: hp('1.5%'),
        minHeight: hp('12%'),
        position: 'relative',
    },
    nutritionCardContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nutritionCardLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp('3%'),
    },
    nutritionTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    editButton: {
        position: 'absolute',
        bottom: wp('2%'),
        right: wp('2%'),
        padding: wp('1%'),
    },
    nutritionLabel: {
        fontSize: RFValue(11),
        color: '#666',
        marginBottom: hp('0.3%'),
    },
    nutritionValue: {
        fontSize: RFValue(16),
        fontWeight: '700',
        color: '#111',
    },
    healthScoreSection: {
        paddingHorizontal: wp('5%'),
        marginBottom: hp('3%'),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: wp('3%'),
        padding: wp('3%'),
        marginHorizontal: wp('5%'),
    },
    healthScoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('1%'),
    },
    healthScoreTitle: {
        fontSize: RFValue(16),
        fontWeight: '600',
        color: '#111',
        marginLeft: wp('2%'),
    },
    healthScoreBar: {
        width: '90%',
        height: hp('1%'),
        backgroundColor: '#E5E7EB',
        borderRadius: wp('2%'),
        overflow: 'hidden',
        marginBottom: hp('0.5%'),
        alignSelf: 'center',
        left: wp('5%'),
    },
    healthScoreFill: {
        width: '70%',
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: wp('2%'),
    },
    healthScoreValue: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#111',
        textAlign: 'right',
        textTransform: 'uppercase',
        marginLeft: wp('2%'),
    },
    ingredientsSection: {
        paddingHorizontal: wp('5%'),
        marginBottom: hp('3%'),
    },
    sectionTitle: {
        fontSize: RFValue(18),
        fontWeight: '600',
        color: '#111',
        marginBottom: hp('1.5%'),
    },
    addIngredientsCard: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('2%'),
        width: '31%',
        minHeight: hp('12%'),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addIngredientsText: {
        fontSize: RFValue(14),
        color: '#666',
        marginBottom: hp('0.5%'),
        textAlign: 'center',
    },
    ingredientsListContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: wp('3%'),
    },
    ingredientsContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#4B3AAC',
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('2%'),
        minHeight: hp('8%'),
    },
    ingredientsText: {
        fontSize: RFValue(14),
        color: '#111',
        lineHeight: RFValue(20),
    },
    addIngredientsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#4B3AAC',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('1.5%'),
        gap: wp('1%'),
        width: '100%',
        minHeight: hp('8%'),
    },
    addIngredientsButtonText: {
        fontSize: RFValue(14),
        color: '#4B3AAC',
        fontWeight: '600',
    },
    ingredientsListWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('2%'),
        marginBottom: hp('1%'),
    },
    ingredientItemCard: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: wp('3%'),
        paddingVertical: hp('2%'),
        width: '31%',
        minHeight: hp('12%'),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    ingredientItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    ingredientItemName: {
        fontSize: RFValue(13),
        fontWeight: '600',
        color: '#111',
        textAlign: 'center',
        marginBottom: hp('0.5%'),
        lineHeight: RFValue(18),
    },
    ingredientItemQuantity: {
        fontSize: RFValue(12),
        color: '#666',
        textAlign: 'center',
    },
    bottomButtons: {
        flexDirection: 'row',
        paddingHorizontal: wp('5%'),
        paddingBottom: hp('3%'),
        gap: wp('3%'),
    },
    fixResultsButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        paddingVertical: hp('2%'),
        borderRadius: wp('8%'),
        gap: wp('2%'),
    },
    fixResultsText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#4B3AAC',
    },
    doneButton: {
        flex: 1,
        backgroundColor: '#4B3AAC',
        paddingVertical: hp('2%'),
        borderRadius: wp('8%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonDisabled: {
        opacity: 0.6,
    },
    doneButtonText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#fff',
    },
});