import ActiveMinutesChart from '@/components/activemintuschart';
import CalorieIntakeChart from '@/components/calorieintake';
import GlucoseLevelChart from '@/components/Glucoselevelchart';
import RestingHeartChart from '@/components/Restingheartchart';
import SleepHourChart from '@/components/sleephourchart';
import FastingHoursChart from '@/components/Totalfastingchart';
import Weightchart from '@/components/Weightchart';
import Ketonchart from '@/components/Ketonchart';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';

interface CalendarDay {
    day: number;
    status: ('fasting' | 'calLogged' | 'activity')[]; // Now an array to support multiple statuses
    isSelected: boolean;
}

export default function MeScreen() {
    const [currentWeight] = useState(85);
    const [startedWeight] = useState(92);
    const [targetWeight, setTargetWeight] = useState(72);
    const [weeklyCalorieIntake] = useState(8400);
    const [weeklyCalorieBalance] = useState(-500);
    const [estimatedGoalTime] = useState('1');
    const [activeTab, setActiveTab] = useState("Yearly");
    const [showAllCalendarDays, setShowAllCalendarDays] = useState(false);
    const [calendarModalVisible, setCalendarModalVisible] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeFilters, setActiveFilters] = useState<('fasting' | 'calLogged' | 'activity')[]>([]);

    // Calculate progress percentage
    const totalWeightLoss = startedWeight - targetWeight;
    const currentWeightLoss = startedWeight - currentWeight;
    const progressPercentage = Math.min(100, Math.max(0, (currentWeightLoss / totalWeightLoss) * 100));


    // Calendar data - days 1-14 for main view
    const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([
        { day: 1, status: [], isSelected: false },
        { day: 2, status: [], isSelected: false },
        { day: 3, status: [], isSelected: false },
        { day: 4, status: [], isSelected: false },
        { day: 5, status: [], isSelected: false },
        { day: 6, status: [], isSelected: false },
        { day: 7, status: ['fasting', 'activity', 'calLogged'], isSelected: false },
        { day: 8, status: [], isSelected: false },
        { day: 9, status: [], isSelected: false },
        { day: 10, status: [], isSelected: false },
        { day: 11, status: [], isSelected: false },
        { day: 12, status: [], isSelected: false },
    ]);

    // Full month calendar for November 2024 (30 days)
    const [fullMonthCalendar, setFullMonthCalendar] = useState<CalendarDay[]>([
        // [] days for October (November 1st is Friday, so we need 4 [] days for Thu, Wed, Tue, Mon)
        { day: 0, status: [], isSelected: false },
        { day: 0, status: [], isSelected: false },
        { day: 0, status: [], isSelected: false },
        { day: 0, status: [], isSelected: false },

        // November 2024 days - all [] by default
        { day: 1, status: [], isSelected: false },
        { day: 2, status: ['fasting'], isSelected: false },
        { day: 3, status: ['activity'], isSelected: false },
        { day: 4, status: ['calLogged'], isSelected: false },
        { day: 5, status: ['fasting', 'activity'], isSelected: false },
        { day: 6, status: ['fasting', 'calLogged'], isSelected: false },
        { day: 7, status: ['activity', 'calLogged'], isSelected: false },
        { day: 8, status: ['fasting', 'activity', 'calLogged'], isSelected: false },
        { day: 9, status: [], isSelected: false },
        { day: 10, status: [], isSelected: false },
        { day: 11, status: [], isSelected: false },
        { day: 12, status: [], isSelected: false },
        { day: 13, status: [], isSelected: false },
        { day: 14, status: [], isSelected: false },
        { day: 15, status: [], isSelected: false },
        { day: 16, status: [], isSelected: false },
        { day: 17, status: [], isSelected: false },
        { day: 18, status: [], isSelected: false },
        { day: 19, status: [], isSelected: false },
        { day: 20, status: [], isSelected: false },
        { day: 21, status: [], isSelected: false },
        { day: 22, status: [], isSelected: false },
        { day: 23, status: [], isSelected: false },
        { day: 24, status: [], isSelected: false },
        { day: 25, status: [], isSelected: false },
        { day: 26, status: [], isSelected: false },
        { day: 27, status: [], isSelected: false },
        { day: 28, status: [], isSelected: false },
        { day: 29, status: [], isSelected: false },
        { day: 30, status: [], isSelected: false },
    ]);

    const toggleFilter = (filter: 'fasting' | 'calLogged' | 'activity') => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };
    const shouldShowDay = (dayStatus: string[]) => {
        if (activeFilters.length === 0) return true; // Show all if no filters
        return activeFilters.some(filter => dayStatus.includes(filter));
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    // Function to deselect all dates

    // Function to handle date selection
    const handleDateSelect = (index: number, isFullMonth: boolean = false) => {
        if (isFullMonth) {
            const updatedCalendar = [...fullMonthCalendar];
            // Toggle selection
            updatedCalendar[index] = {
                ...updatedCalendar[index],
                isSelected: !updatedCalendar[index].isSelected,
                status: updatedCalendar[index].isSelected ? 'empty' : 'empty' 
            };
            setFullMonthCalendar(updatedCalendar);
        } else {
            const updatedCalendar = [...calendarDays];
            // Toggle selection
            updatedCalendar[index] = {
                ...updatedCalendar[index],
                isSelected: !updatedCalendar[index].isSelected,
                status: updatedCalendar[index].isSelected ? 'empty' : 'empty' // Keep as empty when selected
            };
            setCalendarDays(updatedCalendar);
        }
    };

    // Show only first 14 days (2 rows) initially, show all when "See all" is clicked
    const visibleCalendarDays = showAllCalendarDays ? calendarDays : calendarDays.slice(0, 14);

    const getDayStyle = (status: string[], isSelected: boolean) => {
        const borderWidth = wp('0.5%');

        if (isSelected) {
            return {
                borderColor: '#4B3AAC',
                borderWidth: borderWidth * 2,
                backgroundColor: 'rgba(75, 58, 172, 0.1)'
            };
        }

        // If any status exists, remove the dashed border and use solid
        if (status.length > 0) {
            return {
                borderColor: '#E5E7EB', // Default border color
                borderWidth: borderWidth,
                backgroundColor: 'transparent'
            };
        }

        // Default empty state with dashed border
        return {
            borderColor: '#E5E7EB',
            borderWidth: borderWidth,
            borderStyle: 'dashed' as const,
            backgroundColor: 'transparent'
        };
    };

    const renderCalendarDay = (item: CalendarDay, index: number, isFullMonth: boolean = false) => {
        if (!shouldShowDay(item.status)) {
            return (
                <View
                    key={index}
                    style={[
                        styles.calendarDay,
                        styles.hiddenDay,
                        item.day === 0 && styles.emptyDay,
                    ]}
                >
                    {item.day !== 0 && (
                        <Text style={styles.hiddenDayText}>{item.day}</Text>
                    )}
                </View>
            );
        }

        const hasFasting = item.status.includes('fasting');
        const hasCalLogged = item.status.includes('calLogged');
        const hasActivity = item.status.includes('activity');

        const statusCount = item.status.length;

        return (
            <TouchableOpacity
                key={index}
                onPress={() => handleDateSelect(index, isFullMonth)}
                style={[
                    styles.calendarDay,
                    getDayStyle(item.status, item.isSelected),
                    item.day === 0 && styles.emptyDay,
                ]}
            >
                {/* Segmented Progress Fill */}
                {statusCount > 0 && (
                    <View style={styles.segmentedContainer}>
                        <Svg width="100%" height="100%" viewBox="0 0 100 100" style={styles.segmentedSvg}>
                            {/* Single status - fill entire circle */}
                            {statusCount === 1 && (
                                <>
                                    {hasFasting && (
                                        <Circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            stroke="#4B3AAC"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="100 0"
                                            transform="rotate(-90 50 50)"
                                        />
                                    )}
                                    {hasCalLogged && (
                                        <Circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            stroke="#10B981"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="100 0"
                                            transform="rotate(-90 50 50)"
                                        />
                                    )}
                                    {hasActivity && (
                                        <Circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            stroke="#34D399"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="100 0"
                                            transform="rotate(-90 50 50)"
                                        />
                                    )}
                                </>
                            )}

                            {/* Two statuses - 50% each */}
                            {statusCount === 2 && (
                                <>
                                    {hasFasting && (
                                        <Circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            stroke="#4B3AAC"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="50 50"
                                            strokeDashoffset="0"
                                            transform="rotate(-90 50 50)"
                                        />
                                    )}
                                    {hasCalLogged && (
                                        <Circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            stroke="#10B981"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="50 50"
                                            strokeDashoffset={hasFasting ? "-50" : "0"}
                                            transform="rotate(-90 50 50)"
                                        />
                                    )}
                                    {hasActivity && (
                                        <Circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            stroke="#34D399"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray="50 50"
                                            strokeDashoffset={
                                                (hasFasting && hasCalLogged) ? "0" :
                                                    (hasFasting || hasCalLogged) ? "-50" : "0"
                                            }
                                            transform="rotate(-90 50 50)"
                                        />
                                    )}
                                </>
                            )}

                            {/* Three statuses - 33.33% each */}
                            {statusCount === 3 && (
                                <>
                                    <Circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="#4B3AAC"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="33.33 66.67"
                                        strokeDashoffset="0"
                                        transform="rotate(-90 50 50)"
                                    />
                                    <Circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="#10B981"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="33.33 66.67"
                                        strokeDashoffset="-33.33"
                                        transform="rotate(-90 50 50)"
                                    />
                                    <Circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="#34D399"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="33.33 66.67"
                                        strokeDashoffset="-66.67"
                                        transform="rotate(-90 50 50)"
                                    />
                                </>
                            )}
                        </Svg>
                    </View>
                )}

                {item.day !== 0 && (
                    <Text
                        style={[
                            styles.calendarDayText,
                            item.status.length > 0 && styles.calendarDayTextActive,
                        ]}
                    >
                        {item.day}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    const radius = wp('20%'); // Slightly reduced radius
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/screen1/profile/setting")}>
                        <Ionicons name="settings-outline" size={RFValue(20)} color="#111" />
                    </TouchableOpacity>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileCardContainer}>
                        <View style={styles.profileIcon}>
                            <Ionicons name="person" size={RFValue(36)} color="#666" />
                        </View>

                        <Text style={styles.profileName}>Cameron Williamson</Text>
                    </View>
                </View>

                {/* Weight and Calorie Summary Card */}
                <View style={styles.summaryCard}>
                    {/* Weight Progress Section */}
                    <View style={styles.weightSection}>
                        {/* CIRCLE CENTERED */}
                        <View style={styles.progressWrapper}>
                            <View style={styles.progressContainer}>
                                <Svg width={wp("50%")} height={wp("50%")} style={styles.progressSvg}>
                                    {/* Background circle */}
                                    <Circle
                                        cx={wp("25%")}
                                        cy={wp("25%")}
                                        r={radius}
                                        stroke="#fff"
                                        strokeWidth={wp("1.8%")}
                                        fill="#E5E7EB"
                                    />

                                    {/* Progress circle */}
                                    <Circle
                                        cx={wp("25%")}
                                        cy={wp("25%")}
                                        r={radius}
                                        stroke="#10B981"
                                        strokeWidth={wp("1.8%")}
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        transform={`rotate(-90 ${wp("25%")} ${wp("25%")})`}
                                    />
                                </Svg>

                                {/* Inner content */}
                                <View style={styles.progressInner}>
                                    <Text style={styles.progressLabel}>Current Weight</Text>
                                    <Text style={styles.progressValue}>{currentWeight}kg</Text>

                                    <TouchableOpacity style={styles.logWeightButton} onPress={() => router.push("/screen1/profile/weightScreen")}>
                                        <Text style={styles.logWeightButtonText}>Log weight</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* END POSITION BADGE */}
                                <View
                                    style={[
                                        styles.progressBadge,
                                        {
                                            left:
                                                wp("25%") +
                                                radius * Math.cos((-90 + progressPercentage * 3.6) * (Math.PI / 180)) -
                                                wp("4.5%"),
                                            top:
                                                wp("25%") +
                                                radius * Math.sin((-90 + progressPercentage * 3.6) * (Math.PI / 180)) -
                                                wp("4.5%"),
                                        },
                                    ]}
                                >
                                    <Text style={styles.progressBadgeText}>
                                        {Math.round(progressPercentage)}%
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* BOTTOM ROW: STARTED & TARGET */}
                        <View style={styles.weightInfoContainer}>
                            {/* Started Weight - Top */}
                            <View style={styles.weightInfoItem}>
                                <Text style={styles.weightInfoLabel}>Started Weight</Text>
                                <Text style={styles.weightInfoValue}>{startedWeight} kg</Text>
                            </View>

                            {/* Target Weight - Bottom */}
                            <View style={styles.weightInfoItem}>
                                <Text style={styles.weightInfoLabel}>Target Weight</Text>
                                <View style={styles.targetWeightRow}>
                                    <Text style={styles.weightInfoValue}>{targetWeight} kg</Text>
                                    <TouchableOpacity style={styles.editTargetButton}>
                                        <Ionicons name="pencil-outline" size={RFValue(14)} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Calorie Summary */}
                    <View style={styles.calorieSummaryRow}>
                        <View style={styles.calorieItem}>
                            <Text style={styles.calorieLabel}>Weekly Calorie Intake</Text>
                            <Text style={styles.calorieValue}>{weeklyCalorieIntake} <Text style={{ fontWeight: '300', color: '#666', fontSize: RFValue(11) }}>kcal</Text></Text>
                        </View>

                        <View style={styles.calorieItem}>
                            <Text style={styles.calorieLabel}>Weekly Calorie Balance</Text>
                            <Text style={styles.calorieValue}>{weeklyCalorieBalance} <Text style={{ fontWeight: '300', color: '#666', fontSize: RFValue(11) }}>kcal</Text></Text>
                        </View>

                        <View style={styles.calorieItem}>
                            <Text style={styles.calorieLabel}>Estimated Goal Achievement time</Text>
                            <Text style={styles.calorieValue}>{estimatedGoalTime}<Text style={{ fontWeight: '300', color: '#666', fontSize: RFValue(11) }}> weeks/s</Text></Text>
                        </View>
                    </View>
                </View>

                {/* Rest of your code remains the same... */}
                <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>Calendar</Text>
                    <View style={styles.calendarHeaderActions}>
                        <TouchableOpacity onPress={() => setCalendarModalVisible(true)}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Calendar Section */}
                <View style={styles.calendarContainer}>
                    <View style={styles.calendarSection}>
                        <View style={styles.calendarGrid}>
                            {visibleCalendarDays.map((item, index) => renderCalendarDay(item, index))}
                        </View>

                        {/* Legend */}
                        <View style={styles.legend}>

                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.legendDotRing, { borderColor: '#4B3AAC' }]} />
                                <Text style={styles.legendText}>Fasting</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.legendDotRing, { borderColor: '#10B981' }]} />
                                <Text style={styles.legendText}>Cal logged</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { borderColor: '#10B981', backgroundColor: '#4B3AAC' }]} />
                                <Text style={styles.legendText}>Activity</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: wp('0.25%'), borderColor: '#E5E7EB', borderStyle: 'dashed' as const }]} />
                                <Text style={styles.legendText}>Empty</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Rest of your components remain the same */}
                <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>Trends</Text>
                    <TouchableOpacity>
                        <Ionicons name="filter" size={RFValue(24)} color="#111" />
                    </TouchableOpacity>
                </View>

                <View style={styles.chartTabsSection}>
                    <View style={styles.chartTabsContainer}>
                        {["Weekly", "Monthly", "Yearly"].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                style={[
                                    styles.chartTab,
                                    activeTab === tab && styles.chartTabActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chartTabText,
                                        activeTab === tab && styles.chartTabTextActive,
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Chart sections remain the same */}
                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Weight</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <View style={styles.weightChartWrapper}>
                        <Weightchart />
                    </View>
                </View>

                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Total fasting hours</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <FastingHoursChart />
                </View>

                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Active minutes</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <ActiveMinutesChart />
                </View>

                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Sleep hours</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <SleepHourChart />
                </View>

                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Resting heart rate</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <RestingHeartChart />
                </View>

                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Calorie intake</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <CalorieIntakeChart />
                </View>

                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Glucose level</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <GlucoseLevelChart />
                </View>

                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Keton level</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <Ketonchart />
                </View>

            </ScrollView>

            {/* Modal */}
            <Modal
                visible={calendarModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCalendarModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setCalendarModalVisible(false)}
                        >
                            <Ionicons name="close" size={RFValue(22)} color="#111" />
                        </TouchableOpacity>

                        {/* Month Header with Navigation */}
                        <View style={styles.monthHeader}>
                            <TouchableOpacity
                                style={styles.monthNavButton}
                                onPress={goToPreviousMonth}
                            >
                                <Ionicons name="chevron-back" size={RFValue(20)} color="#111" />
                            </TouchableOpacity>

                            <Text style={styles.modalMonthTitle}>
                                {formatMonthYear(currentMonth)}
                            </Text>

                            <TouchableOpacity
                                style={styles.monthNavButton}
                                onPress={goToNextMonth}
                            >
                                <Ionicons name="chevron-forward" size={RFValue(20)} color="#111" />
                            </TouchableOpacity>
                        </View>

                        {/* Week days row */}
                        <View style={styles.weekRow}>
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                <Text key={d} style={styles.weekText}>{d}</Text>
                            ))}
                        </View>

                        {/* Interactive Legend */}
                        <View style={styles.modalLegendContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.modalLegendButton,
                                    activeFilters.length === 0 && styles.modalLegendButtonActive
                                ]}
                                onPress={() => setActiveFilters([])}
                            >
                                <View style={[
                                    styles.legendDot,
                                    { backgroundColor: '#4B3AAC' }
                                ]} />
                                <Text style={[
                                    styles.modalLegendButtonText,
                                    activeFilters.length === 0 && styles.modalLegendButtonTextActive
                                ]}>All</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalLegendButton,
                                    activeFilters.includes('fasting') && styles.modalLegendButtonActive
                                ]}
                                onPress={() => toggleFilter('fasting')}
                            >
                                <View style={[
                                    styles.legendDot,
                                    { backgroundColor: '#4B3AAC' }
                                ]} />
                                <Text style={[
                                    styles.modalLegendButtonText,
                                    activeFilters.includes('fasting') && styles.modalLegendButtonTextActive
                                ]}>Fasting</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalLegendButton,
                                    activeFilters.includes('calLogged') && styles.modalLegendButtonActive
                                ]}
                                onPress={() => toggleFilter('calLogged')}
                            >
                                <View style={[
                                    styles.legendDot,
                                    { backgroundColor: '#10B981' }
                                ]} />
                                <Text style={[
                                    styles.modalLegendButtonText,
                                    activeFilters.includes('calLogged') && styles.modalLegendButtonTextActive
                                ]}>Cal logged</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalLegendButton,
                                    activeFilters.includes('activity') && styles.modalLegendButtonActive
                                ]}
                                onPress={() => toggleFilter('activity')}
                            >
                                <View style={[
                                    styles.legendDot,
                                    { backgroundColor: '#34D399' }
                                ]} />
                                <Text style={[
                                    styles.modalLegendButtonText,
                                    activeFilters.includes('activity') && styles.modalLegendButtonTextActive
                                ]}>Activity</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Statistics Section - Clean minimal design */}
                        <View style={styles.statsContainer}>
                            {activeFilters.length === 0 ? (
                                // All selected - Show balanced stats
                                <View style={styles.statsRow}>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.circleTextContainer}>
                                            <View style={styles.segmentedCircleContainer}>
                                                <Svg width={wp('12%')} height={wp('12%')} style={styles.segmentedCircleSvg}>
                                                    {/* Three equal segments for balanced state */}
                                                    <Circle
                                                        cx={wp('3%')}
                                                        cy={wp('3%')}
                                                        r={wp('2%')}
                                                        stroke="#4B3AAC"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray="33.33 66.67"
                                                        strokeDashoffset="0"
                                                        transform={`rotate(-90 ${wp('3%')} ${wp('3%')})`}
                                                    />
                                                    <Circle
                                                        cx={wp('3%')}
                                                        cy={wp('3%')}
                                                        r={wp('2%')}
                                                        stroke="#10B981"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray="33.33 66.67"
                                                        strokeDashoffset="-33.33"
                                                        transform={`rotate(-90 ${wp('3%')} ${wp('3%')})`}
                                                    />
                                                    <Circle
                                                        cx={wp('3%')}
                                                        cy={wp('3%')}
                                                        r={wp('2%')}
                                                        stroke="#34D399"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray="33.33 66.67"
                                                        strokeDashoffset="-66.67"
                                                        transform={`rotate(-90 ${wp('3%')} ${wp('3%')})`}
                                                    />
                                                </Svg>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.statLabel}>Balanced</Text>
                                                <Text style={styles.statValue}>0 days</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.circleTextContainer}>
                                            <View style={styles.tickContainer}>
                                                <Ionicons name="checkmark" size={RFValue(16)} color="#10B981" />
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.statLabel}>Longest streak</Text>
                                                <Text style={styles.statValue}>0</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : activeFilters.includes('fasting') ? (
                                // Fasting selected
                                <View style={styles.statsRow}>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.circleTextContainer}>
                                            <View style={styles.segmentedCircleContainer}>
                                                <Svg width={wp('12%')} height={wp('12%')} style={styles.segmentedCircleSvg}>
                                                    <Circle
                                                        cx={wp('3%')}
                                                        cy={wp('3%')}
                                                        r={wp('2%')}
                                                        stroke="#4B3AAC"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray="100 0"
                                                        transform={`rotate(-90 ${wp('3%')} ${wp('3%')})`}
                                                    />
                                                </Svg>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.statLabel}>Completed</Text>
                                                <Text style={styles.statValue}>0 days</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.textOnlyContainer}>
                                            <Text style={styles.statLabel}>Total fast</Text>
                                            <Text style={styles.statValue}>0</Text>
                                        </View>
                                    </View>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.textOnlyContainer}>
                                            <Text style={styles.statLabel}>Fast avg.</Text>
                                            <Text style={styles.statValue}>0h 0m</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : activeFilters.includes('calLogged') ? (
                                // Cal logged selected
                                <View style={styles.statsRow}>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.circleTextContainer}>
                                            <View style={styles.segmentedCircleContainer}>
                                                <Svg width={wp('12%')} height={wp('12%')} style={styles.segmentedCircleSvg}>
                                                    <Circle
                                                        cx={wp('3%')}
                                                        cy={wp('3%')}
                                                        r={wp('2%')}
                                                        stroke="#10B981"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray="100 0"
                                                        transform={`rotate(-90 ${wp('3%')} ${wp('3%')})`}
                                                    />
                                                </Svg>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.statLabel}>Completed</Text>
                                                <Text style={styles.statValue}>0 days</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.textOnlyContainer}>
                                            <Text style={styles.statLabel}>Total logged</Text>
                                            <Text style={styles.statValue}>0</Text>
                                        </View>
                                    </View>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.textOnlyContainer}>
                                            <Text style={styles.statLabel}>Cal avg.</Text>
                                            <Text style={styles.statValue}>0 kcal</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : activeFilters.includes('activity') ? (
                                // Activity selected
                                <View style={styles.statsRow}>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.circleTextContainer}>
                                            <View style={styles.segmentedCircleContainer}>
                                                <Svg width={wp('12%')} height={wp('12%')} style={styles.segmentedCircleSvg}>
                                                    <Circle
                                                        cx={wp('3%')}
                                                        cy={wp('3%')}
                                                        r={wp('2%')}
                                                        stroke="#34D399"
                                                        strokeWidth="2"
                                                        fill="none"
                                                        strokeDasharray="100 0"
                                                        transform={`rotate(-90 ${wp('3%')} ${wp('3%')})`}
                                                    />
                                                </Svg>
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.statLabel}>Completed</Text>
                                                <Text style={styles.statValue}>0 days</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.horizontalStatItem}>
                                        <View style={styles.textOnlyContainer}>
                                            <Text style={styles.statLabel}>Activity avg.</Text>
                                            <Text style={styles.statValue}>0h 0m</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : null}
                        </View>
                        {/* FULL Calendar Grid */}
                        <View style={styles.modalCalendarGrid}>
                            {fullMonthCalendar.map((item, index) => renderCalendarDay(item, index, true))}
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: hp('5%'),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: wp('5%'),
        paddingTop: hp('2%'),
        paddingBottom: hp('1%'),
    },
    settingsButton: {
        width: wp('10%'),
        height: wp('10%'),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4F2FA',
        borderRadius: wp('10%'),
        padding: wp('1%'),
    },
    profileCardContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: wp("19%"),
        paddingVertical: hp("2%"),
        borderRadius: wp("3%"),
        borderWidth: wp("0.25%"),
        borderColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        paddingTop: hp('5%'),
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: hp('3%'),
    },
    profileIcon: {
        width: wp("18%"),
        height: wp("18%"),
        borderRadius: wp("9%"),
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: -hp("3%"),
    },
    profileName: {
        fontSize: RFValue(18),
        fontWeight: "700",
        color: "#111",
        marginTop: hp("1.5%"),
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        padding: wp('3.5%'), // Reduced from wp('5%')
        marginHorizontal: wp('5%'),
        marginBottom: hp('3%'),
        borderWidth: wp('0.25%'),
        borderColor: '#E5E7EB',
        paddingTop: hp('2%'),
    },
    weightSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: hp('2%'),
        flexWrap: 'wrap',
    },
    progressWrapper: {
        marginRight: wp('6%'), // Reduced from wp('8%')
        marginBottom: hp('0%'),
    },
    progressContainer: {
        position: 'relative',
        minWidth: wp('42%'), // Reduced from wp('46%')
        minHeight: wp('42%'), // Reduced from wp('46%')
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSvg: {
        position: 'absolute',
        width: 'auto'
    },
    progressInner: {
        width: wp('42%'), // Reduced from wp('46%')
        height: wp('42%'), // Reduced from wp('46%')
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp('1.5%'), // Reduced padding
    },
    progressLabel: {
        fontSize: RFValue(12), // Reduced from RFValue(14)
        color: '#666',
        marginBottom: hp('0.8%'), // Reduced margin
    },
    progressValue: {
        fontSize: RFValue(18), // Reduced from RFValue(22)
        fontWeight: '700',
        color: '#111',
        marginBottom: hp('0.8%'), // Reduced margin
    },
    progressBadge: {
        position: "absolute",
        backgroundColor: "#10B981",
        paddingHorizontal: wp("2.5%"), // Reduced padding
        paddingVertical: hp("0.4%"), // Reduced padding
        borderRadius: wp("20%"),
        justifyContent: "center",
        alignItems: "center",
        minWidth: wp("10%"), // Reduced width
    },
    progressBadgeText: {
        fontSize: RFValue(10), // Reduced from RFValue(12)
        fontWeight: '700',
        color: '#fff',
    },
    weightInfoContainer: {
        paddingLeft: wp('5%'), // Reduced from wp('7%')
        flex: 1,
        justifyContent: 'space-between',
        marginTop: hp('0%'),
    },
    weightInfoItem: {
        marginBottom: hp('1.5%'),
        marginTop: hp('3%')
    },
    weightInfoLabel: {
        fontSize: RFValue(12), // Reduced from RFValue(14)
        color: '#666',
        marginBottom: hp('0.3%'), // Reduced margin
    },
    weightInfoValue: {
        fontSize: RFValue(14), // Reduced from RFValue(16)
        fontWeight: '600',
        color: '#111',
    },
    targetWeightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1.5%'), // Reduced gap
    },
    editTargetButton: {
        padding: wp('0.8%'), // Reduced padding
    },
    logWeightButton: {
        backgroundColor: '#F3F3FA',
        paddingVertical: hp('1%'), // Reduced padding
        paddingHorizontal: wp('3%'), // Reduced padding
        borderRadius: wp('8%'),
        alignSelf: 'center',
    },
    logWeightButtonText: {
        fontSize: RFValue(11), // Reduced from RFValue(13)
        fontWeight: '600',
        color: '#111',
    },
    // ... rest of your styles remain the same
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        marginHorizontal: wp('4%'),
        marginBottom: hp('3%'),
        borderWidth: wp('0.25%'),
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    calendarSection: {
        padding: wp('4%'),
    },
    calendarHeader: {
        paddingHorizontal: wp('5%'),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('2%'),
    },
    calendarHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('4%'),
    },
    calendarTitle: {
        fontSize: RFValue(18),
        fontWeight: '700',
        color: '#111',
    },
    seeAllText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#4B3AAC',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('2%'),
        marginBottom: hp('3%'),
    },
    calendarDay: {
        width: wp('12%'),
        height: wp('12%'),
        borderRadius: wp('6%'),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        position: 'relative',
    },
    calendarDayText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#111',
    },
    calendarDayTextActive: {
        color: '#111',
    },
    emptyDay: {
        opacity: 0.3,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('3%'),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('2%'),
    },
    legendDot: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: wp('1.5%'),
    },
    legendDotRing: {
        backgroundColor: 'transparent',
        borderWidth: wp('0.5%'),
    },
    legendText: {
        fontSize: RFValue(12),
        color: '#666',
    },
    chartTabsSection: {
        marginHorizontal: wp('4%'),
        marginTop: hp('0%'),
        marginBottom: hp('1.5%'),
        width: '90%',
        alignSelf: 'center',
    },
    chartTabsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#F4F2FA",
        borderRadius: wp('5%'),
        padding: wp('2%'),
    },
    chartTab: {
        paddingVertical: hp('0.7%'),
        paddingHorizontal: wp('8.5%'),
        borderRadius: wp('4%'),
        backgroundColor: "transparent",
    },
    chartTabActive: {
        backgroundColor: "#4B3AAC",
    },
    chartTabText: {
        color: "#333",
        fontWeight: "600",
        fontSize: RFValue(12),
    },
    chartTabTextActive: {
        color: "#fff",
    },
    chartHeaderSection: {
        marginHorizontal: wp('5%'),
        marginBottom: hp('1.5%'),
        width: '90%',
        alignSelf: 'center',
    },
    chartHeaderText: {
        fontSize: RFValue(18),
        fontWeight: "700",
        color: '#111',
    },
    weightChartSection: {
        marginHorizontal: wp('5%'),
        marginBottom: hp('2%'),
        width: '90%',
        alignSelf: 'center',
    },
    weightChartWrapper: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: wp('4%'),
        padding: wp('1%'),
        borderWidth: wp('0.25%'),
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    calorieSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: hp('1.5%'), // Reduced margin
        paddingVertical: hp('0.5%'), // Reduced padding
        gap: wp('1.5%'), // Reduced gap
    },
    calorieItem: {
        width: '31%',
    },
    calorieLabel: {
        fontSize: RFValue(10), // Reduced from RFValue(12)
        color: '#666',
        marginBottom: hp('0.3%'), // Reduced margin
    },
    calorieValue: {
        fontSize: RFValue(12), // Reduced from RFValue(14)
        fontWeight: '700',
        color: '#111',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        height: hp('70%'),
        borderTopLeftRadius: wp('6%'),
        borderTopRightRadius: wp('6%'),
        padding: wp('5%'),
    },
    modalClose: {
        alignSelf: 'flex-end',
        padding: wp('2%'),
        marginBottom: hp('1%'),
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp('2%'),
    },
    weekText: {
        fontSize: RFValue(12),
        color: '#666',
        width: wp('10%'),
        textAlign: 'center',
    },
    modalCalendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('3%'),
        marginBottom: hp('3%'),
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp('2%'),
        paddingHorizontal: wp('2%'),
    },
    monthNavButton: {
        padding: wp('2%'),
        borderRadius: wp('2%'),
        backgroundColor: '#F4F2FA',
    },
    modalMonthTitle: {
        fontSize: RFValue(20),
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
        flex: 1,
    },
    segmentedContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    segmentedSvg: {
        position: 'absolute',
        width: '100%',
        height: '100%',

    },
    hiddenDay: {
        opacity: 0.3,
    },
    hiddenDayText: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#999',
    },
    legendTextActive: {
        color: '#4B3AAC',
        fontWeight: '700',
    },
    modalLegendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wp('1%'),
        backgroundColor: '#4B3AAC',
        padding: wp('1%'),
        borderRadius: wp('3%'),
        marginBottom: hp('2%'),
        justifyContent: 'center',
    },
    modalLegendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1%'),
        paddingVertical: hp('0.4%'),
        paddingHorizontal: wp('2%'),
        borderRadius: wp('3%'),
        backgroundColor: '#FFFFFF',
        borderWidth: wp('0.25%'),
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    modalLegendButtonActive: {
        backgroundColor: '#E5E7EB',
        borderColor: '#4B3AAC',
    },
    modalLegendButtonText: {
        fontSize: RFValue(12),
        color: '#666', // Light grey color for unselected
        fontWeight: '500',
    },
    modalLegendButtonTextActive: {
        color: '#111', // Black color for selected
        fontWeight: '600',
    },
    statsContainer: {

        padding: wp('4%'),
        borderRadius: wp('3%'),
        marginBottom: hp('2%'),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: RFValue(12),
        color: '#666',
        fontWeight: '500',
        marginBottom: hp('1%'),
    },
    statValue: {
        fontSize: RFValue(14),
        color: '#111',
        fontWeight: '600',
        marginTop: hp('0.5%'),
    },
    colorCircles: {
        flexDirection: 'row',
        gap: wp('1%'),
        marginBottom: hp('0.5%'),
    },
    colorCircle: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: wp('1.5%'),
    },


    horizontalStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    circleTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('2%'),
    },
    textContainer: {
        alignItems: 'flex-start',
    },
    textOnlyContainer: {
        alignItems: 'center',
    },
    segmentedCircleContainer: {
        width: wp('12%'),
        height: wp('12%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    segmentedCircleSvg: {
        width: wp('12%'),
        height: wp('12%'),
    },
    tickContainer: {
        width: wp('12%'),
        height: wp('12%'),
        borderRadius: wp('6%'),
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
});