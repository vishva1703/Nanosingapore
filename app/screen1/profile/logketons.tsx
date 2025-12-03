import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogKetonsScreen() {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [level, setLevel] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Format date to ISO format (YYYY-MM-DD)
    const formatDateToISO = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format time to ISO format (HH:MM:SS)
    const formatTimeToISO = (time: Date): string => {
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        const seconds = String(time.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

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

    // Handle save ketone
    const handleSaveKetone = async () => {
        // Validate ketone input
        if (!level || level.trim() === '') {
            Alert.alert('Validation Error', 'Please enter ketone level.');
            return;
        }

        const ketoneValue = parseFloat(level);
        if (isNaN(ketoneValue) || ketoneValue <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid ketone value.');
            return;
        }

        try {
            setLoading(true);

            // Format date and time
            const dateISO = formatDateToISO(date);
            const timeISO = formatTimeToISO(time);

            const requestPayload = {
                date: dateISO,
                time: timeISO,
                level: ketoneValue,
            };

            console.log('========================================');
            console.log('[logketons] 📤 SENDING REQUEST TO BACKEND');
            console.log('[logketons] Request Payload:', JSON.stringify(requestPayload, null, 2));
            console.log('[logketons] Date:', dateISO);
            console.log('[logketons] Time:', timeISO);
            console.log('[logketons] Ketone Value:', ketoneValue, 'mmol/L');
            console.log('========================================');

            // Call API
            const response = await wellnessApi.logKetone(requestPayload);

            console.log('========================================');
            console.log('[logketons] ✅ API RESPONSE RECEIVED');
            console.log('[logketons] Full Response:', JSON.stringify(response, null, 2));
            console.log('========================================');

            // Show success message
            const successMessage = response?.message || 'Ketone logged successfully!';
            Alert.alert(
                'Success',
                `${successMessage}\n\nDate: ${dateISO}\nTime: ${timeISO}\nKetone: ${ketoneValue} mmol/L`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('[logketons] ❌ ERROR LOGGING KETONE:', error);
            
            const errorMessage = error?.response?.data?.message 
                || error?.response?.data?.error 
                || error?.message 
                || 'Failed to log ketone. Please try again.';
            
            Alert.alert(
                'Error',
                `Failed to save ketone data:\n\n${errorMessage}`
            );
        } finally {
            setLoading(false);
        }
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
                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.value}>
                                {date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </Text>
                        </TouchableOpacity>

                        {/* TIME ROW */}
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.label}>Time</Text>
                            <Text style={styles.value}>
                                {time.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "numeric",
                                })}
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
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleSaveKetone}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Save keton levels</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* DATE PICKER */}
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={(e, d) => {
                            setShowDatePicker(false);
                            if (d) setDate(d);
                        }}
                    />
                )}

                {/* TIME PICKER */}
                {showTimePicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="spinner"
                        onChange={(e, t) => {
                            setShowTimePicker(false);
                            if (t) setTime(t);
                        }}
                    />
                )}
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
    buttonDisabled: {
        opacity: 0.6,
    },
    rowlabel: {
        fontSize: 16,
        color: "#555",
    },
});
