import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";

export default function LogKetonsScreen() {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [level, setLevel] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const formatDateTime = (dateObj: Date, timeObj: Date) => {
        const dateStr = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        const timeStr = timeObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
        });

        return `${dateStr}, ${timeStr}`;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
            >
                {/* MAIN SCROLL CONTENT */}
                <ScrollView
                    contentContainerStyle={{ padding: 20 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.header}>Log ketones levels</Text>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>

                    {/* CARD */}
                    <View style={styles.card}>
                        {/* DATE ROW */}
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.label}>Time</Text>
                            <Text style={styles.value}>
                                {formatDateTime(date, time)}
                            </Text>

                        </TouchableOpacity>

                        <View style={[styles.row, { borderBottomWidth: 0 }]}>
                            <Text style={styles.label}>Level</Text>
                            <View style={styles.weightInputWrapper}>
                                <TextInput
                                    placeholder="0"
                                    value={level}
                                    onChangeText={setLevel}
                                    keyboardType="decimal-pad"
                                    style={styles.weightInput}
                                />
                                <Text style={styles.kg}>mmol/L</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.row, { borderBottomWidth: 0 }]}>
                        <Text style={styles.rowlabel}>To log your ketone levels automatically, connect a Biosense ketone monitor</Text>
                    </View>
                </ScrollView>

                {/* FIXED BOTTOM BUTTON */}
                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => router.push("/me")}>
                        <Text style={styles.buttonText}>Save keton levels</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    backButton: {
        position: "absolute",
        right: 20,
        top: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: "400",
        textAlign: "center",
        marginBottom: 25,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderColor: "#e6e6e8",
    },
    label: {
        fontSize: 16,
        color: "#555",
    },
    value: {
        fontSize: 16,
        color: "#333",
    },
    weightInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    weightInput: {
        fontSize: 16,
        width: 60,
        textAlign: "right",
        color: "#333",
    },
    kg: {
        fontSize: 16,
        color: "#aaa",
        marginLeft: 4,
    },
    bottomButtonContainer: {
        padding: 20,
    },

    button: {
        backgroundColor: "#4b2ea7",
        paddingVertical: 15,
        borderRadius: 30,
        marginTop: 40,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "600",
    },
    rowlabel: {
        fontSize: 16,
        color: "#555",
    },
});
