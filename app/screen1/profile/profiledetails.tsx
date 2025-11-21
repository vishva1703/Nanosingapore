import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PersonalDetails() {
    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal details</Text>
            </View>

            {/* Goal weight card */}
            <View style={styles.goalCard}>
                <View>
                    <Text style={styles.labelSmall}>Goal weight</Text>
                    <Text style={styles.goalValue}>72 kg</Text>
                </View>

                <TouchableOpacity style={styles.changeGoalBtn} onPress={() => router.push({
                    pathname: "/screens/desiredscreen",
                    params: { from: "settings" }
                })}>
                    <Text style={styles.changeGoalText}>Change Goal</Text>
                </TouchableOpacity>
            </View>

            {/* Fields container */}
            <View style={styles.fieldCard}>

                {/* Current Weight */}
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Current weight</Text>
                    <View style={styles.rowValueWrap}>
                        <Text style={styles.rowValue}>85 kg</Text>
                        <TouchableOpacity onPress={() => router.push({
                            pathname: "/screens/WeightScreen",
                            params: { from: "settings" }
                        })}>
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Height */}
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Height</Text>
                    <View style={styles.rowValueWrap}>
                        <Text style={styles.rowValue}>5 ft 5 in</Text>
                        <TouchableOpacity style={styles.row} onPress={() => router.push({
                            pathname: "/screens/WeightScreen",
                            params: { from: "settings" }
                        })}>
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date of birth */}
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Date of birth</Text>
                    <View style={styles.rowValueWrap}>
                        <Text style={styles.rowValue}>05/04/2012</Text>
                        <TouchableOpacity style={styles.row} onPress={() => router.push({
                            pathname: "/screens/birth-date",
                            params: { from: "settings" }
                        })}>
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Gender */}
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Gender</Text>
                    <View style={styles.rowValueWrap}>
                        <Text style={styles.rowValue}>Female</Text>
                        <TouchableOpacity style={styles.row} onPress={() => router.push({
                            pathname: "/screens/onboarding",
                            params: { from: "settings" }
                        })}>       
                         <Ionicons name="pencil-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

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

    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
    },

    goalCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 18,
        marginBottom: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    labelSmall: {
        color: "#666",
        fontSize: 14,
        marginBottom: 2,
    },

    goalValue: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
    },

    changeGoalBtn: {
        backgroundColor: "#433AAC",
        paddingVertical: 7,
        paddingHorizontal: 16,
        borderRadius: 18,
    },

    changeGoalText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },

    fieldCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingTop: 4,
        paddingBottom: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#EFEFEF",
    },

    rowLabel: {
        fontSize: 15,
        color: "#444",
        fontWeight: "400",
    },

    rowValueWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    rowValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
    },
});

