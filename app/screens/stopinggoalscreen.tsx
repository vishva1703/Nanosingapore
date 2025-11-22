import ProgressBar from '@/components/ProgressBar';
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
const DIET_OPTIONS: ReadonlyArray<{
    value: string;
    label: string;
    type: 'ion' | 'mci' | 'fa';
    icon: string;
}> = [
        { value: 'lack_of_consistency', label: 'Lack of consistency', type: 'ion', icon: 'bar-chart' },
        { value: 'unhealthy_eating', label: 'Unhealthy eating habits', type: 'fa', icon: 'pizza-slice' },
        { value: 'lack_of_support', label: 'Lack of supports', type: 'fa', icon: 'handshake' }, // 👈 here
        { value: 'busy_schedule', label: 'Busy schedule', type: 'ion', icon: 'calendar' },
        { value: 'lack_of_inspiration', label: 'Lack of meal inspiration', type: 'mci', icon: 'food-apple' },
    ];




export default function StoppingGoalScreen() {
    const router = useRouter();
    const [selectedDiet, setSelectedDiet] = useState<string | null>(null);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.wrapper}>
                {/* 🔹 Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#1F2937" />
                        </TouchableOpacity> */}

                        <ProgressBar screen="stopping-goal" noContainer={true} />
                    </View>
                </View>

                {/* 🔹 Main Question */}
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>What's stopping you from reaching your Goals?</Text>
                        <Text style={styles.helperText}>
                            This will be used to calibrate your custom plan.
                        </Text>
                    </View>

                    {/* 🔹 Diet Options */}
                    <View style={styles.optionList}>
                        {DIET_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionButton,
                                    selectedDiet === option.value && styles.selectedOption,
                                ]}
                                onPress={() => setSelectedDiet(option.value)}
                                activeOpacity={0.85}
                            >
                                <View style={styles.optionContent}>
                                    <View
                                        style={[
                                            styles.optionIconWrapper,
                                            selectedDiet === option.value && styles.optionIconWrapperSelected,
                                        ]}
                                    >
                                        {option.type === 'ion' ? (
                                            <Ionicons
                                                name={option.icon as IoniconName}
                                                size={22}
                                                color={selectedDiet === option.value ? '#4B3AAC' : '#000000'}
                                            />
                                        ) : option.type === 'mci' ? (
                                            <MaterialCommunityIcons
                                                name={option.icon as any}
                                                size={22}
                                                color={selectedDiet === option.value ? '#4B3AAC' : '#000000'}
                                            />
                                        ) : (
                                            <FontAwesome6
                                                name={option.icon as any}
                                                size={22}
                                                color={selectedDiet === option.value ? '#4B3AAC' : '#000000'}
                                            />
                                        )}


                                    </View>

                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedDiet === option.value && styles.selectedOptionText,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* 🔹 Bottom CTA */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[styles.primaryCta, !selectedDiet && { opacity: 0.6 }]}
                        disabled={!selectedDiet}
                        onPress={() => router.push('/screens/accomplishscreen')}
                    >
                        <Text style={styles.primaryCtaText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    wrapper: {
        flex: 1,
    },
    // Header
    headerContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#F9FAFB',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    progressTrack: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4B3AAC',
    },

    // Content
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 0,
        paddingBottom: 120,
        gap: 28,
    },
    section: {
        marginBottom: 8,
    },
    sectionLabel: {
        marginBottom: 8,
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
    },
    helperText: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 4,
        lineHeight: 22,
    },

    // Options
    optionList: {
        gap: 14,
    },
    optionButton: {
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    selectedOption: {
        backgroundColor: '#4B3AAC',
        borderColor: '#4B3AAC',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 12,
        paddingLeft: 12,
    },
    optionIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionIconWrapperSelected: {
        backgroundColor: '#FFFFFF',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    selectedOptionText: {
        color: '#FFFFFF',
    },

    // Bottom Button
    bottomContainer: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        right: 24,
    },
    primaryCta: {
        backgroundColor: '#4B3AAC',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#4B3AAC',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    primaryCtaText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
