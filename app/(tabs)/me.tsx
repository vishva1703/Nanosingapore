import { ProfileAPI } from '@/api/profile';
import ActiveMinutesChart from '@/components/activemintuschart';
import CalorieIntakeChart from '@/components/calorieintake';
import GlucoseLevelChart from '@/components/Glucoselevelchart';
import Ketonchart from '@/components/Ketonchart';
import RestingHeartChart from '@/components/Restingheartchart';
import SleepHourChart from '@/components/sleephourchart';
import FastingHoursChart from '@/components/Totalfastingchart';
import Weightchart from '@/components/Weightchart';
import { Storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

interface CalendarDay {
    day: number;
    status: ('fasting' | 'calLogged' | 'activity')[];
    isSelected: boolean;
}

interface UserProfile {
    name: string;
    currentWeight: number;
    startedWeight: number;
    targetWeight: number;
    weeklyCalorieIntake: number;
    weeklyCalorieBalance: number;
    estimatedGoalTime: string;
    height?: {
        cm: number;
        feet: number;
        inches: number;
    };
    dateOfBirth?: string;
    gender?: string;
    activityLevel?: string;
}

interface CalendarData {
    date: string;
    log: string[];
    value?: number;
    status?: string;
    activityType?: string;
}

interface CalendarChartResponse {
    success: boolean;
    data: CalendarData[];
    message?: string;
    flag?: boolean;
}

interface CalendarStats {
    completedDays: number;
    longestStreak: number;
    totalFasts: number;
    averageFastDuration: string;
    totalLogged: number;
    averageCalories: number;
    activityAverage: string;
}

export default function MeScreen() {
    const [currentWeight, setCurrentWeight] = useState(85);
    const [startedWeight, setStartedWeight] = useState(92);
    const [targetWeight, setTargetWeight] = useState(72);
    const [weeklyCalorieIntake, setWeeklyCalorieIntake] = useState(8400);
    const [weeklyCalorieBalance, setWeeklyCalorieBalance] = useState(-500);
    const [estimatedGoalTime, setEstimatedGoalTime] = useState('1');
    const [activeTab, setActiveTab] = useState("Yearly");
    const [showAllCalendarDays, setShowAllCalendarDays] = useState(false);
    const [calendarModalVisible, setCalendarModalVisible] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activeFilters, setActiveFilters] = useState<('fasting' | 'calLogged' | 'activity')[]>([]);
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Cameron Williamson');
    const [refreshing, setRefreshing] = useState(false);
    const [waterIntakeSettings, setWaterIntakeSettings] = useState<{ value?: number; unit?: string } | null>(null);
    const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [calendarStats, setCalendarStats] = useState<CalendarStats>({
        completedDays: 0,
        longestStreak: 0,
        totalFasts: 0,
        averageFastDuration: '0h 0m',
        totalLogged: 0,
        averageCalories: 0,
        activityAverage: '0h 0m'
    });

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

    const [fullMonthCalendar, setFullMonthCalendar] = useState<CalendarDay[]>([
        { day: 0, status: [], isSelected: false },
        { day: 0, status: [], isSelected: false },
        { day: 0, status: [], isSelected: false },
        { day: 0, status: [], isSelected: false },
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

    const fetchCalendarData = async (month?: Date) => {
        try {
            setCalendarLoading(true);
            const targetMonth = month || new Date();
            const startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
            const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

            const formattedStart = startDate.toISOString().split('T')[0];
            const formattedEnd = endDate.toISOString().split('T')[0];

            console.log('📅 [MeScreen] Fetching calendar data for:', {
                start: formattedStart,
                end: formattedEnd,
                month: targetMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
            });

            const response = await ProfileAPI.getCalendarChart({
                sDate: formattedStart,
                eDate: formattedEnd
            }) as CalendarChartResponse;

            console.log('📅 [MeScreen] Calendar API Response:', response);

            if (response.success && response.data) {
                setCalendarData(response.data);
                console.log('✅ [MeScreen] Calendar data loaded:', response.data.length, 'entries');

                const transformedCalendar = transformCalendarData(response.data, targetMonth);
                setFullMonthCalendar(transformedCalendar);
                calculateStatistics(response.data, targetMonth);
                updateMiniCalendarView(transformedCalendar);
            } else {
                console.warn('⚠️ [MeScreen] No calendar data available:', response.message);
                setDefaultCalendarData();
            }
        } catch (error) {
            console.error('❌ [MeScreen] Error fetching calendar data:', error);
            setDefaultCalendarData();
        } finally {
            setCalendarLoading(false);
        }
    };

    const transformCalendarData = (data: CalendarData[], month: Date): CalendarDay[] => {
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

        const calendar: CalendarDay[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendar.push({ day: 0, status: [], isSelected: false });
        }

        const dateStatusMap: Record<number, ('fasting' | 'calLogged' | 'activity')[]> = {};

        data.forEach(item => {
            try {
                const dateObj = new Date(item.date);
                const date = dateObj.getDate();

                if (!dateStatusMap[date]) {
                    dateStatusMap[date] = [];
                }
                const logColors = item.log || [];

                logColors.forEach(colorCode => {
                    switch (colorCode) {
                        case '0xff015724': 
                            if (!dateStatusMap[date].includes('fasting')) {
                                dateStatusMap[date].push('fasting');
                            }
                            break;
                        case '0xff5EDF7E': 
                            if (!dateStatusMap[date].includes('calLogged')) {
                                dateStatusMap[date].push('calLogged');
                            }
                            break;
                        default:
                            console.log('Unknown color code:', colorCode);
                            // You might want to add this to activity or another category
                            if (!dateStatusMap[date].includes('activity')) {
                                dateStatusMap[date].push('activity');
                            }
                    }
                });

            } catch (e) {
                console.warn('⚠️ Error parsing calendar item:', item, e);
            }
        });

        for (let day = 1; day <= daysInMonth; day++) {
            const statuses = dateStatusMap[day] || [];
            calendar.push({
                day,
                status: statuses,
                isSelected: false
            });
        }

        return calendar;
    };

    // Calculate statistics from calendar data
    const calculateStatistics = (data: CalendarData[], month: Date) => {
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        // Filter data for current month and active filters
        const filteredData = data.filter(item => {
            try {
                const itemDate = new Date(item.date);
                return itemDate >= monthStart && itemDate <= monthEnd;
            } catch (e) {
                return false;
            }
        });

        let stats: CalendarStats = {
            completedDays: 0,
            longestStreak: 0,
            totalFasts: 0,
            averageFastDuration: '0h 0m',
            totalLogged: 0,
            averageCalories: 0,
            activityAverage: '0h 0m'
        };

        // Calculate based on color codes in log array
        if (activeFilters.length === 0) {
            // Calculate for all activities - days with any log entries
            const daysWithLogs = filteredData.filter(item => item.log && item.log.length > 0);
            stats.completedDays = daysWithLogs.length;
            stats.longestStreak = calculateLongestStreak(daysWithLogs);
        } else if (activeFilters.includes('fasting')) {
            // Filter days with fasting color code (0xff015724)
            const fastingData = filteredData.filter(item =>
                item.log && item.log.includes('0xff015724')
            );
            stats.completedDays = fastingData.length;
            stats.totalFasts = fastingData.length;
            stats.averageFastDuration = calculateAverageDuration(fastingData);
        } else if (activeFilters.includes('calLogged')) {
            // Filter days with cal logged color code (0xff5EDF7E)
            const calorieData = filteredData.filter(item =>
                item.log && item.log.includes('0xff5EDF7E')
            );
            stats.completedDays = calorieData.length;
            stats.totalLogged = calorieData.length;
            stats.averageCalories = calculateAverageValue(calorieData);
        } else if (activeFilters.includes('activity')) {
            // Filter days with any other color codes or specific activity codes
            const activityData = filteredData.filter(item =>
                item.log && item.log.length > 0
            );
            stats.completedDays = activityData.length;
            stats.activityAverage = calculateAverageDuration(activityData);
        }

        setCalendarStats(stats);
    };

    // Update the calculateLongestStreak function to work with the new structure
    const calculateLongestStreak = (data: CalendarData[]): number => {
        if (data.length === 0) return 0;

        // Get unique dates that have logs
        const datesWithLogs = data
            .filter(item => item.log && item.log.length > 0)
            .map(item => {
                try {
                    return new Date(item.date).toISOString().split('T')[0];
                } catch (e) {
                    return '';
                }
            })
            .filter(date => date !== '');

        if (datesWithLogs.length === 0) return 0;

        const sortedDates = [...new Set(datesWithLogs)]
            .sort()
            .map(date => new Date(date));

        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);

            // Check if dates are consecutive
            const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return longestStreak;
    };

    // Update the helper functions to handle empty data properly
    const calculateAverageDuration = (data: CalendarData[]): string => {
        if (data.length === 0) return '0h 0m';

        // For now, return a placeholder since we don't have duration data
        // You can modify this based on actual duration data from your API
        return '12h 0m'; // Placeholder
    };

    const calculateAverageValue = (data: CalendarData[]): number => {
        if (data.length === 0) return 0;

        // For now, return a placeholder since we don't have calorie data
        // You can modify this based on actual calorie data from your API
        return 1500; // Placeholder for average calories
    };

    // Update mini calendar view
    const updateMiniCalendarView = (fullCalendar: CalendarDay[]) => {
        // Take first 12 non-empty days for mini calendar
        const nonEmptyDays = fullCalendar.filter(day => day.day !== 0);
        const miniDays = nonEmptyDays.slice(0, 12);

        // Add empty days if needed to fill 12 slots
        while (miniDays.length < 12) {
            miniDays.push({ day: 0, status: [], isSelected: false });
        }

        setCalendarDays(miniDays);
    };

    const setDefaultCalendarData = () => {
        // Keep your existing default data as fallback
        const defaultFullMonth: CalendarDay[] = [
            // ... your existing default fullMonthCalendar data
        ];
        setFullMonthCalendar(defaultFullMonth);
        updateMiniCalendarView(defaultFullMonth);
        setCalendarStats({
            completedDays: 0,
            longestStreak: 0,
            totalFasts: 0,
            averageFastDuration: '0h 0m',
            totalLogged: 0,
            averageCalories: 0,
            activityAverage: '0h 0m'
        });
    };

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            console.log('🔄 [MeScreen] Fetching profile data...');

            // Fetch profile dashboard data
            const profileResponse = await ProfileAPI.getProfileDashboard();
            console.log('📊 [MeScreen] Profile API Response:', JSON.stringify(profileResponse, null, 2));

            if (!profileResponse) {
                console.error('❌ [MeScreen] No response from ProfileAPI');
                setDefaultValues();
                return;
            }

            // Check if API call was successful (handle both flag and success)
            const isSuccess = profileResponse.success || (profileResponse as any).flag === true;
            if (!isSuccess) {
                const errorMsg = profileResponse.error || (profileResponse as any).message;
                console.error('❌ [MeScreen] Profile API call failed:', errorMsg);
                console.error('❌ [MeScreen] Error details:', (profileResponse as any).errorDetails);
                // Still try to use default values, but log the error
                setDefaultValues();
                return;
            }

            if (profileResponse && (profileResponse.success || (profileResponse as any).flag) && profileResponse.data) {
                const profileData = profileResponse.data;
                console.log('📋 [MeScreen] Profile Data to process:', JSON.stringify(profileData, null, 2));

                // Extract currentWeight - handle new API structure: weight.kg or old structures
                const currentWeightValue = profileData.weight?.kg ||
                    profileData.weight ||
                    profileData.currentWeight?.kg ||
                    profileData.currentWeight ||
                    profileData.current_weight?.kg ||
                    profileData.current_weight ||
                    85;
                setCurrentWeight(currentWeightValue);
                console.log('✅ [MeScreen] Current Weight set to:', currentWeightValue);

                // Extract startedWeight - handle both {kg: X} and direct number
                const startedWeightValue = profileData.startedWeight?.kg ||
                    profileData.startedWeight ||
                    profileData.started_weight?.kg ||
                    profileData.started_weight ||
                    92;
                setStartedWeight(startedWeightValue);
                console.log('✅ [MeScreen] Started Weight set to:', startedWeightValue);

                // Extract targetWeight/goalWeight - handle new API structure: goalWeight.kg or old structures
                const targetWeightValue = profileData.goalWeight?.kg ||
                    profileData.goalWeight ||
                    profileData.targetWeight?.kg ||
                    profileData.targetWeight ||
                    profileData.target_weight?.kg ||
                    profileData.target_weight ||
                    profileData.goal_weight?.kg ||
                    72;
                setTargetWeight(targetWeightValue);
                console.log('✅ [MeScreen] Target Weight set to:', targetWeightValue);

                // Extract weekly calorie intake
                const weeklyCalorieIntakeValue = profileData.weeklyCalorieIntake !== undefined
                    ? profileData.weeklyCalorieIntake
                    : (profileData.weekly_calorie_intake ||
                        profileData.weeklyCalorie ||
                        8400);
                setWeeklyCalorieIntake(weeklyCalorieIntakeValue);
                console.log('✅ [MeScreen] Weekly Calorie Intake set to:', weeklyCalorieIntakeValue);

                // Extract weekly calorie balance
                const weeklyCalorieBalanceValue = profileData.weeklyCalorieBalance !== undefined
                    ? profileData.weeklyCalorieBalance
                    : (profileData.weekly_calorie_balance ||
                        profileData.weeklyBalance ||
                        -500);
                setWeeklyCalorieBalance(weeklyCalorieBalanceValue);
                console.log('✅ [MeScreen] Weekly Calorie Balance set to:', weeklyCalorieBalanceValue);

                // Extract estimated goal time - handle new API structure: estimatedGoalAchievementTime
                const estimatedGoalTimeValue = profileData.estimatedGoalAchievementTime !== undefined
                    ? String(profileData.estimatedGoalAchievementTime)
                    : (profileData.estimatedGoalTime ||
                        profileData.estimated_goal_time ||
                        profileData.goalTime ||
                        '1');
                setEstimatedGoalTime(estimatedGoalTimeValue);
                console.log('✅ [MeScreen] Estimated Goal Time set to:', estimatedGoalTimeValue);

                // Extract name - check multiple possible locations
                const nameValue = profileData.name ||
                    profileData.userName ||
                    profileData.user_name ||
                    profileData.fullName ||
                    profileData.full_name;

                if (nameValue) {
                    setUserName(nameValue);
                    console.log('✅ [MeScreen] User Name set to:', nameValue);
                } else {
                    // Fetch personal details for name if not in dashboard data
                    try {
                        const personalDetailsResponse = await ProfileAPI.getPersonalDetails();
                        console.log('👤 [MeScreen] Personal Details Response:', JSON.stringify(personalDetailsResponse, null, 2));

                        if (personalDetailsResponse && (personalDetailsResponse.success || personalDetailsResponse.flag) && personalDetailsResponse.data) {
                            const personalData = personalDetailsResponse.data;
                            const personalName = personalData.name ||
                                personalData.userName ||
                                personalData.user_name ||
                                personalData.fullName ||
                                personalData.full_name ||
                                'Cameron Williamson';
                            setUserName(personalName);
                            console.log('✅ [MeScreen] User Name from personal details set to:', personalName);
                        }
                    } catch (personalError) {
                        console.error('❌ [MeScreen] Error fetching personal details:', personalError);
                        // Keep default name if personal details fetch fails
                    }
                }

                // Fetch water intake settings
                try {
                    const waterSettingsResponse = await ProfileAPI.getWaterIntakeSettings();
                    console.log('💧 [MeScreen] Water Intake Settings Response:', JSON.stringify(waterSettingsResponse, null, 2));

                    if (waterSettingsResponse && waterSettingsResponse.success && waterSettingsResponse.data) {
                        const waterData = waterSettingsResponse.data;
                        setWaterIntakeSettings({
                            value: waterData.value,
                            unit: waterData.unit
                        });
                        console.log('✅ [MeScreen] Water Intake Settings set to:', waterData);
                    } else {
                        console.warn('⚠️ [MeScreen] Water intake settings response not successful or missing data');
                        setWaterIntakeSettings(null);
                    }
                } catch (waterError) {
                    console.error('❌ [MeScreen] Error fetching water intake settings:', waterError);
                    setWaterIntakeSettings(null);
                }
            } else {
                console.error('❌ [MeScreen] Profile API response not successful or missing data:', profileResponse);
                setDefaultValues();
            }
        } catch (error) {
            console.error('❌ [MeScreen] Error fetching profile data:', error);
            if (error instanceof Error) {
                console.error('❌ [MeScreen] Error message:', error.message);
                console.error('❌ [MeScreen] Error stack:', error.stack);
            }
            setDefaultValues();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const setDefaultValues = () => {
        setCurrentWeight(85);
        setStartedWeight(92);
        setTargetWeight(72);
        setWeeklyCalorieIntake(8400);
        setWeeklyCalorieBalance(-500);
        setEstimatedGoalTime('1');
        setUserName('Cameron Williamson');
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                const existingToken = await Storage.getToken();
                if (existingToken) {
                    console.log('✅ [MeScreen] Found existing authentication token');
                } else {
                    console.warn('⚠️ [MeScreen] No authentication token found in storage');
                    console.warn('⚠️ [MeScreen] Please ensure user is logged in');
                }

                await fetchProfileData();
                await fetchCalendarData(); // Fetch calendar data
            } catch (error) {
                console.error('❌ [MeScreen] Error initializing data:', error);
                if (error instanceof Error) {
                    console.error('❌ [MeScreen] Error message:', error.message);
                    console.error('❌ [MeScreen] Error stack:', error.stack);
                }
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    useFocusEffect(
        useCallback(() => {
          // Check if weight parameter is passed from HeightWeightScreen
          if (params.weight) {
            const weightValue = parseFloat(params.weight as string);
            if (!isNaN(weightValue) && weightValue >= 40 && weightValue <= 160) {
              console.log('📝 [MeScreen] Received updated weight from params:', weightValue);
              
              // Update local state immediately for visual feedback
              setCurrentWeight(weightValue);
              
              // Note: The API call should already have been made in HeightWeightScreen
              // But we can still trigger a refresh to ensure everything is in sync
              fetchProfileData();
            }
          } else {
            // If no params, just refresh normally
            fetchProfileData();
            fetchCalendarData();
          }
        }, [params.weight])
      );

      const updateWeightOnServer = async (weight: number) => {
        try {
          if (ProfileAPI.setCurrentWeight) {
            const lbs = Math.round(weight * 2.20462);
            console.log('🔄 [MeScreen] Updating weight on server:', { kg: weight, lbs });
            
            const response = await ProfileAPI.setCurrentWeight({
              kg: weight,
              lbs: lbs
            });
            
            console.log('✅ [MeScreen] Weight update response:', response);
            
            if (response.success || (response as any).flag === true) {
              console.log('✅ Weight updated successfully on server');
            } else {
              console.warn('⚠️ Weight update may not have been successful');
            }
          }
        } catch (error) {
          console.error('❌ Error updating weight on server:', error);
        }
      };

    const handleRefresh = () => {
        setRefreshing(true);
        Promise.all([
            fetchProfileData(),
            fetchCalendarData()
        ]).finally(() => {
            setRefreshing(false);
        });
    };

    const totalWeightLoss = startedWeight - targetWeight;
    const currentWeightLoss = startedWeight - currentWeight;
    const progressPercentage = Math.min(100, Math.max(0, (currentWeightLoss / totalWeightLoss) * 100));

    const toggleFilter = (filter: 'fasting' | 'calLogged' | 'activity') => {
        setActiveFilters(prev => {
            const newFilters = prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter];

            // Recalculate statistics when filters change
            if (calendarData.length > 0) {
                calculateStatistics(calendarData, currentMonth);
            }

            return newFilters;
        });
    };

    const shouldShowDay = (dayStatus: string[]) => {
        if (activeFilters.length === 0) return true;
        return activeFilters.some(filter => dayStatus.includes(filter));
    };

    const goToPreviousMonth = () => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        setCurrentMonth(newMonth);
        fetchCalendarData(newMonth);
    };

    const goToNextMonth = () => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        setCurrentMonth(newMonth);
        fetchCalendarData(newMonth);
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const handleDateSelect = (index: number, isFullMonth: boolean = false) => {
        if (isFullMonth) {
            const updatedCalendar = [...fullMonthCalendar];
            updatedCalendar[index] = {
                ...updatedCalendar[index],
                isSelected: !updatedCalendar[index].isSelected,
            };
            setFullMonthCalendar(updatedCalendar);
        } else {
            const updatedCalendar = [...calendarDays];
            updatedCalendar[index] = {
                ...updatedCalendar[index],
                isSelected: !updatedCalendar[index].isSelected,
            };
            setCalendarDays(updatedCalendar);
        }
    };

    const openCalendarModal = () => {
        setCalendarModalVisible(true);
        fetchCalendarData(currentMonth); // Ensure fresh data when opening modal
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4B3AAC" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
        if (status.length > 0) {
            return {
                borderColor: '#E5E7EB',
                borderWidth: borderWidth,
                backgroundColor: 'transparent'
            };
        }

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
                {statusCount > 0 && (
                    <View style={styles.segmentedContainer}>
                        <Svg width="100%" height="100%" viewBox="0 0 100 100" style={styles.segmentedSvg}>
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

                            {statusCount === 2 && (
                                <>
                                    {hasFasting && hasCalLogged && (
                                        <>
                                            <Circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="#4B3AAC"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
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
                                                strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
                                                strokeDashoffset={Math.PI * 45}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </>
                                    )}

                                    {hasFasting && hasActivity && (
                                        <>
                                            <Circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="#4B3AAC"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
                                                strokeDashoffset="0"
                                                transform="rotate(-90 50 50)"
                                            />
                                            <Circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="#34D399"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
                                                strokeDashoffset={Math.PI * 45}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </>
                                    )}
                                    {hasCalLogged && hasActivity && (
                                        <>
                                            <Circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="#10B981"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
                                                strokeDashoffset="0"
                                                transform="rotate(-90 50 50)"
                                            />
                                            <Circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="#34D399"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${Math.PI * 45} ${Math.PI * 45}`}
                                                strokeDashoffset={Math.PI * 45}
                                                transform="rotate(-90 50 50)"
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {statusCount === 3 && (
                                <>
                                    <Circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="#4B3AAC"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(2 * Math.PI * 45) / 3} ${(2 * Math.PI * 45) * (2 / 3)}`}
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
                                        strokeDasharray={`${(2 * Math.PI * 45) / 3} ${(2 * Math.PI * 45) * (2 / 3)}`}
                                        strokeDashoffset={-(2 * Math.PI * 45) / 3}
                                        transform="rotate(-90 50 50)"
                                    />

                                    <Circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        stroke="#34D399"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(2 * Math.PI * 45) / 3} ${(2 * Math.PI * 45) * (2 / 3)}`}
                                        strokeDashoffset={-((2 * Math.PI * 45) * 2) / 3}
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

    const radius = wp('20%');
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#4B3AAC']}
                        tintColor="#4B3AAC"
                    />
                }
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

                        <Text style={styles.profileName}>{userName}</Text>
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

                                    <TouchableOpacity style={styles.logWeightButton} onPress={() => router.push({
                                        pathname: "/screen1/profile/weightScreen",
                                        params: { currentWeight: currentWeight.toString() }
                                    })}>
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

                {/* Calendar Section */}
                <View style={styles.calendarHeader}>
                    <Text style={styles.calendarTitle}>Calendar</Text>
                    <View style={styles.calendarHeaderActions}>
                        <TouchableOpacity onPress={openCalendarModal}>
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

                {/* Trends Section */}
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

                {/* Chart sections */}
                <View style={styles.chartHeaderSection}>
                    <Text style={styles.chartHeaderText}>Weight</Text>
                </View>
                <View style={styles.weightChartSection}>
                    <View style={styles.weightChartWrapper}>
                        <Weightchart activeTab={activeTab} />
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

            {/* Calendar Modal */}
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
                                disabled={calendarLoading}
                            >
                                <Ionicons name="chevron-back" size={RFValue(20)} color="#111" />
                            </TouchableOpacity>

                            <Text style={styles.modalMonthTitle}>
                                {formatMonthYear(currentMonth)}
                                {calendarLoading && ' (Loading...)'}
                            </Text>

                            <TouchableOpacity
                                style={styles.monthNavButton}
                                onPress={goToNextMonth}
                                disabled={calendarLoading}
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

                        {calendarLoading ? (
                            <View style={styles.calendarLoadingContainer}>
                                <ActivityIndicator size="large" color="#4B3AAC" />
                                <Text style={styles.calendarLoadingText}>Loading calendar data...</Text>
                            </View>
                        ) : (
                            <>
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

                                {/* Statistics Section */}
                                <View style={styles.statsContainer}>
                                    {activeFilters.length === 0 ? (
                                        // All selected - Show balanced stats
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
                                                        <Text style={styles.statValue}>{calendarStats.completedDays} days</Text>
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
                                                        <Text style={styles.statValue}>{calendarStats.longestStreak}</Text>
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
                                                        <Text style={styles.statValue}>{calendarStats.completedDays} days</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.horizontalStatItem}>
                                                <View style={styles.textOnlyContainer}>
                                                    <Text style={styles.statLabel}>Total fast</Text>
                                                    <Text style={styles.statValue}>{calendarStats.totalFasts}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.horizontalStatItem}>
                                                <View style={styles.textOnlyContainer}>
                                                    <Text style={styles.statLabel}>Fast avg.</Text>
                                                    <Text style={styles.statValue}>{calendarStats.averageFastDuration}</Text>
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
                                                        <Text style={styles.statValue}>{calendarStats.completedDays} days</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.horizontalStatItem}>
                                                <View style={styles.textOnlyContainer}>
                                                    <Text style={styles.statLabel}>Total logged</Text>
                                                    <Text style={styles.statValue}>{calendarStats.totalLogged}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.horizontalStatItem}>
                                                <View style={styles.textOnlyContainer}>
                                                    <Text style={styles.statLabel}>Cal avg.</Text>
                                                    <Text style={styles.statValue}>{calendarStats.averageCalories} kcal</Text>
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
                                                        <Text style={styles.statValue}>{calendarStats.completedDays} days</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={styles.horizontalStatItem}>
                                                <View style={styles.textOnlyContainer}>
                                                    <Text style={styles.statLabel}>Activity avg.</Text>
                                                    <Text style={styles.statValue}>{calendarStats.activityAverage}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ) : null}
                                </View>

                                {/* FULL Calendar Grid */}
                                <View style={styles.modalCalendarGrid}>
                                    {fullMonthCalendar.map((item, index) => renderCalendarDay(item, index, true))}
                                </View>
                            </>
                        )}
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
        padding: wp('3.5%'),
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
        marginRight: wp('6%'),
        marginBottom: hp('0%'),
    },
    progressContainer: {
        position: 'relative',
        minWidth: wp('42%'),
        minHeight: wp('42%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSvg: {
        position: 'absolute',
        width: 'auto'
    },
    progressInner: {
        width: wp('42%'),
        height: wp('42%'),
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp('1.5%'),
    },
    progressLabel: {
        fontSize: RFValue(12),
        color: '#666',
        marginBottom: hp('0.8%'),
    },
    progressValue: {
        fontSize: RFValue(18),
        fontWeight: '700',
        color: '#111',
        marginBottom: hp('0.8%'),
    },
    progressBadge: {
        position: "absolute",
        backgroundColor: "#10B981",
        paddingHorizontal: wp("2.5%"),
        paddingVertical: hp("0.4%"),
        borderRadius: wp("20%"),
        justifyContent: "center",
        alignItems: "center",
        minWidth: wp("10%"),
    },
    progressBadgeText: {
        fontSize: RFValue(10),
        fontWeight: '700',
        color: '#fff',
    },
    weightInfoContainer: {
        paddingLeft: wp('5%'),
        flex: 1,
        justifyContent: 'space-between',
        marginTop: hp('0%'),
    },
    weightInfoItem: {
        marginBottom: hp('1.5%'),
        marginTop: hp('3%')
    },
    weightInfoLabel: {
        fontSize: RFValue(12),
        color: '#666',
        marginBottom: hp('0.3%'),
    },
    weightInfoValue: {
        fontSize: RFValue(14),
        fontWeight: '600',
        color: '#111',
    },
    targetWeightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1.5%'),
    },
    editTargetButton: {
        padding: wp('0.8%'),
    },
    logWeightButton: {
        backgroundColor: '#F3F3FA',
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        borderRadius: wp('8%'),
        alignSelf: 'center',
    },
    logWeightButtonText: {
        fontSize: RFValue(11),
        fontWeight: '600',
        color: '#111',
    },
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
        marginTop: hp('1.5%'),
        paddingVertical: hp('0.5%'),
        gap: wp('1.5%'),
    },
    calorieItem: {
        width: '31%',
    },
    calorieLabel: {
        fontSize: RFValue(10),
        color: '#666',
        marginBottom: hp('0.3%'),
    },
    calorieValue: {
        fontSize: RFValue(12),
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
        height: hp('85%'),
        borderTopLeftRadius: wp('6%'),
        borderTopRightRadius: wp('6%'),
        padding: wp('5%'),
        paddingBottom: hp('5%'),
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
        color: '#666',
        fontWeight: '500',
    },
    modalLegendButtonTextActive: {
        color: '#111',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: hp('2%'),
        fontSize: RFValue(16),
        color: '#666',
    },
    calendarLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: hp('30%'),
    },
    calendarLoadingText: {
        marginTop: hp('1%'),
        fontSize: RFValue(14),
        color: '#666',
    },
});