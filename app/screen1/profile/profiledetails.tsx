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
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal details</Text>
            </View>

            {/* Goal weight card */}
            <View style={styles.goalCard}>
                <View>
                    <Text style={styles.labelSmall}>Goal weight</Text>
                    <Text style={styles.goalValue}>72 kg</Text>
                </View>

                <TouchableOpacity style={styles.changeGoalBtn} onPress={() =>
                    router.push({
                        pathname: "/screens/desiredscreen",
                        params: { from: "settings" },
                    })
                }>
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
                        <TouchableOpacity onPress={() =>
                            router.push({
                                pathname: "/screens/WeightScreen",
                                params: { from: "settings" },
                            })
                        }>
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Height */}
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Height</Text>

                    <View style={styles.rowValueWrap}>
                        <Text style={styles.rowValue}>5 ft 5 in</Text>
                        <TouchableOpacity onPress={() =>
                            router.push({
                                pathname: "/screens/WeightScreen",
                                params: { from: "settings" },
                            })
                        }>
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* DOB */}
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Date of birth</Text>

                    <View style={styles.rowValueWrap}>
                        <Text style={styles.rowValue}>05/04/2012</Text>
                        <TouchableOpacity onPress={() =>
                            router.push({
                                pathname: "/screens/birth-date",
                                params: { from: "settings" },
                            })
                        }>
                            <Ionicons name="pencil-outline" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Gender */}
                <View style={styles.rowLast}>
                    <Text style={styles.rowLabel}>Gender</Text>

                    <View style={styles.rowValueWrap}>
                        <Text style={styles.rowValue}>Female</Text>
                        <TouchableOpacity onPress={() =>
                            router.push({
                                pathname: "/screens/onboarding",
                                params: { from: "settings" },
                            })
                        }>
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
        backgroundColor: "#F6F6FB",
        paddingHorizontal: 16,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 24,
    },

    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EFEFFD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
    },

    goalCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 20,
        marginBottom: 22,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        // soft shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    labelSmall: {
        color: "#777",
        fontSize: 14,
        marginBottom: 2,
    },

    goalValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000",
    },

    changeGoalBtn: {
        backgroundColor: "#433AAC",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },

    changeGoalText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },

    fieldCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingVertical: 4,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#EFEFF5",
    },

    rowLast: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        paddingHorizontal: 18,
    },

    rowLabel: {
        fontSize: 16,
        color: "#444",
        fontWeight: "500",
    },

    rowValueWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    rowValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
});
