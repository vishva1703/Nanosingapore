import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
// Mock data for food database
const FOOD_DATABASE = [
    {
        id: '1',
        name: 'Chickpea curry with brown rice',
        calories: '450 cal',
        portion: '8 oz cooked',
    },
    {
        id: '2',
        name: 'Quinoa bowl with black beans and corn',
        calories: '420 cal',
        portion: '8 oz cooked',
    },
    {
        id: '3',
        name: 'Grilled chicken breast',
        calories: '230 cal',
        portion: '6 oz cooked',
    },
    {
        id: '4',
        name: 'Greek yogurt with berries',
        calories: '180 cal',
        portion: '1 cup',
    },
    {
        id: '5',
        name: 'Avocado toast',
        calories: '320 cal',
        portion: '2 slices',
    },
];

type FoodItem = {
    id: string;
    name: string;
    calories: string;
    portion: string;
};

export default function ScanImageScreen() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");

    const handleFoodItemPress = (food: FoodItem) => {
        // Navigate to food detail screen
        router.push({
            pathname: '/screen1/scanfood/camera',
            params: {
                id: food.id,
                name: food.name,
                calories: food.calories,
                portion: food.portion,
            }
        });
    };

    const filteredFoods = FOOD_DATABASE.filter((food) =>
        food.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={RFValue(24)} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select from database</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TextInput
                    style={styles.searchInput}
                    placeholder="Describe what ate"
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                />

                <TouchableOpacity style={styles.aiButton}>
                    <Ionicons name="sparkles-outline" size={RFValue(18)} color="#6C3EB6" />
                    <Text style={styles.aiText}>Generate macros using  AI</Text>
                </TouchableOpacity>

                {/* Food List */}
                <View style={styles.listContainer}>
                    {filteredFoods.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.foodCard}
                            onPress={() => handleFoodItemPress(item)}
                        >
                            <View>
                                <Text style={styles.foodName}>{item.name}</Text>
                                <View style={styles.rowLine}>
                                    <Ionicons
                                        name="flame-outline"
                                        size={16}
                                        color="black"
                                    />
                                    <Text style={styles.subtitle}>
                                        {item.calories} • {item.portion}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.plusButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleFoodItemPress(item);
                                }}
                            >
                                <Text style={styles.plusText}>+</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        paddingVertical: hp('2%'),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: wp('2%'),
    },
    headerTitle: {
        fontSize: RFValue(18),
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: wp('10%'),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: hp('5%'),
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
    listContainer: {
        paddingHorizontal: wp('5%'),
        paddingBottom: hp('2%'),
    },
    foodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: hp('2%'),
        paddingHorizontal: wp('4%'),
        marginVertical: hp('1%'),
        width: '100%',
        maxWidth: wp('90%'),
        alignSelf: 'center',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    foodName: {
        fontSize: RFValue(15),
        fontWeight: '700',
        color: '#111',
        flex: 1,
        marginRight: wp('2%'),
    },
    rowLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    subtitle: {
        fontSize: RFValue(12),
        marginLeft: 5,
        color: '#444',
    },
    plusButton: {
        width: 36,
        height: 36,
        borderRadius: 20,
        backgroundColor: '#EEF0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusText: {
        fontSize: RFValue(20),
        color: '#4B3AAC',
        fontWeight: '900',
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