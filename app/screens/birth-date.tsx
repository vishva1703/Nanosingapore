import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from "expo-router";
import { getProgressForScreen } from '@/utils/progressUtils';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

export default function BirthDateScreen() {
    const router = useRouter();
    const today = useMemo(() => new Date(), []);
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [day, setDay] = useState(today.getDate());
    const progress = useMemo(() => getProgressForScreen('birth-date'), []);
    const { from } = useLocalSearchParams();
    const isFromSettings = from === "settings";

    const dayOptions = useMemo(() => {
        const count = getDaysInMonth(month, year);
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [month, year]);

    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

    const yearOptions = useMemo(
        () => Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, idx) => MIN_YEAR + idx),
        []
    );

    useEffect(() => {
        const maxDay = getDaysInMonth(month, year);
        if (day > maxDay) {
            setDay(maxDay);
        }
    }, [month, year, day]);

    const handleMonthSelect = useCallback((value: number) => {
        setMonth(value);
    }, []);

    const handleDaySelect = useCallback((value: number) => {
        setDay(value);
    }, []);

    const handleYearSelect = useCallback((value: number) => {
        setYear(value);
    }, []);

    const VerticalPicker = React.memo(function VerticalPicker({
        label,
        value,
        options,
        onSelect,
        displayFn,
        style,
    }: {
        label: string;
        value: number;
        options: number[];
        onSelect: (val: number) => void;
        displayFn: (item: number) => string;
        style?: any;
    }) {
        const scrollY = useRef(new Animated.Value(0)).current;
        const listRef = useRef<FlatList>(null);

        useEffect(() => {
            if (!listRef.current || options.length === 0) return;

            let index = options.indexOf(value);
            if (index === -1) index = 0;

            listRef.current.scrollToOffset({
                offset: index * ITEM_HEIGHT,
                animated: false,
            });
        }, [options, value]);

        const onScrollEnd = (e: any) => {
            const offsetY = e.nativeEvent.contentOffset.y;
            const index = Math.round(offsetY / ITEM_HEIGHT);
            const safeIndex = clamp(index, 0, options.length - 1);
            const selected = options[safeIndex];
            if (typeof selected === 'number' && selected !== value) {
                onSelect(selected);
            }
        };

        return (
            <View style={[{ flex: 1, alignItems: 'center', width: '100%' }, style]}>
                <Text style={styles.selectorLabel}>{label}</Text>

                <View
                    style={{
                        position: 'relative',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: ITEM_HEIGHT * VISIBLE_ITEMS,
                    }}
                >
                    {/* Highlight Box */}
                    <View
                        style={{
                            position: 'absolute',
                            top: (ITEM_HEIGHT * VISIBLE_ITEMS) / 2 - ITEM_HEIGHT / 2,
                            width: '100%', // ✅ full width to avoid clipping
                            height: ITEM_HEIGHT,
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: 10,
                            zIndex: 2,
                            paddingHorizontal: 12, // ✅ add side padding for long month names
                        }}
                    />


                    <Animated.FlatList
                        ref={listRef}
                        data={options}
                        keyExtractor={(item) => item.toString()}
                        showsVerticalScrollIndicator={false}
                        snapToInterval={ITEM_HEIGHT}
                        decelerationRate="fast"
                        bounces={false}
                        contentContainerStyle={{
                            paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
                        }}
                        getItemLayout={(_, index) => ({
                            length: ITEM_HEIGHT,
                            offset: ITEM_HEIGHT * index,
                            index,
                        })}
                        onMomentumScrollEnd={onScrollEnd}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            { useNativeDriver: true }
                        )}
                        renderItem={({ item, index }) => {
                            const inputRange = [
                                (index - 2) * ITEM_HEIGHT,
                                (index - 1) * ITEM_HEIGHT,
                                index * ITEM_HEIGHT,
                                (index + 1) * ITEM_HEIGHT,
                                (index + 2) * ITEM_HEIGHT,
                            ];

                            const opacity = scrollY.interpolate({
                                inputRange,
                                outputRange: [0.2, 0.5, 1, 0.5, 0.2],
                                extrapolate: 'clamp',
                            });

                            const scale = scrollY.interpolate({
                                inputRange,
                                outputRange: [0.9, 0.95, 1.1, 0.95, 0.9],
                                extrapolate: 'clamp',
                            });

                            return (
                                <Animated.View
                                    style={[styles.itemContainer, { opacity, transform: [{ scale }] }]}
                                >
                                    <Text
                                        style={[
                                            styles.itemText,
                                            item === value && styles.selectedItemText,
                                        ]}
                                    >
                                        {displayFn(item)}
                                    </Text>
                                </Animated.View>
                            );
                        }}
                    />
                </View>
            </View>
        );
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.wrapper}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#1F2937" />
                        </TouchableOpacity>

                        {!isFromSettings ? (
                            // PROGRESS BAR UI
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                            </View>
                        ) : (
                            // TITLE FOR SETTINGS
                            <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 12 }}>
                                 Set Birthday
                            </Text>
                        )}
                    </View>
                </View>

                {/* Main Content Container */}
                <View style={[
                    styles.contentContainer,
                    isFromSettings && styles.centeredContent
                ]}>
                    {!isFromSettings && (
                        <View style={styles.titleContainer}>
                            <Text style={styles.sectionLabel}>Where were you born?</Text>
                            <Text style={styles.helperText}>
                                This will be used to calibrate your custom plan.
                            </Text>
                        </View>
                    )}

                    <View style={[
                        styles.horizontalRow,
                        isFromSettings && styles.centeredHorizontalRow
                    ]}>
                        <VerticalPicker
                            label=""
                            value={month}
                            options={monthOptions}
                            onSelect={handleMonthSelect}
                            displayFn={(item) => MONTHS[item]}
                            style={{ flex: 1, marginRight: 8 }}
                        />
                        <VerticalPicker
                            label=""
                            value={day}
                            options={dayOptions}
                            onSelect={handleDaySelect}
                            displayFn={(item) => String(item).padStart(2, '0')}
                            style={{ flex: 1, marginHorizontal: 8 }}
                        />
                        <VerticalPicker
                            label=""
                            value={year}
                            options={yearOptions}
                            onSelect={handleYearSelect}
                            displayFn={(item) => item.toString()}
                            style={{ flex: 1, marginLeft: 8 }}
                        />
                    </View>
                </View>

                {/* Bottom Button - Conditionally positioned */}
                {!isFromSettings ? (
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            style={[styles.primaryCta, { opacity: 1 }]}
                            onPress={() => router.replace('/screens/goalscreen')}
                        >
                            <Text style={styles.primaryCtaText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.settingsBottomContainer}>
                        <TouchableOpacity
                            style={[styles.primaryCta, { opacity: 1 }]}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.primaryCtaText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    wrapper: { flex: 1 },
    headerContainer: { 
        paddingHorizontal: 24, 
        paddingVertical: 16,
        paddingBottom: 16,
    },
    headerRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
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
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    progressFill: { 
        height: '100%', 
        backgroundColor: '#4B3AAC' 
    },
    
    // Content container styles
    contentContainer: {
        flex: 1,
    },
    centeredContent: {
        justifyContent: 'center',
        marginBottom: 100, // Add space for the bottom button
    },
    
    titleContainer: { 
        paddingHorizontal: 24, 
        marginBottom: 16,
        marginTop: 20,
    },
    sectionLabel: { 
        fontSize: 26, 
        fontWeight: '700', 
        color: '#111827' 
    },
    helperText: { 
        fontSize: 15, 
        color: '#6B7280', 
        lineHeight: 22, 
        marginTop: 4 
    },
    
    horizontalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 70,
        gap: 12,
    },
    centeredHorizontalRow: {
        marginTop: 0, // Remove top margin when centered
    },

    selectorLabel: {
        fontSize: 12,
        fontWeight: '400',
        color: '#111827',
        marginBottom: 10,
        textAlign: 'center',
    },
    itemContainer: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 18,
        color: '#9CA3AF',
        textAlign: 'center',
        flexWrap: 'nowrap',
        includeFontPadding: false,
        letterSpacing: 0.2,
        width: '100%',
    },
    selectedItemText: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 14,
    },
    
    // Bottom containers
    bottomContainer: { 
        position: 'absolute', 
        bottom: 24, 
        left: 24, 
        right: 24 
    },
    settingsBottomContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
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
        letterSpacing: 0.3 
    },
});