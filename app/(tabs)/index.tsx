import wellnessApi from "@/api/wellnessApi";
import { useActivity } from "@/components/ActivityContext";
import { useFood } from "@/components/FoodContext";
import FoodlistContent from "@/components/foodlistcontent";
import DashboardHeaderWeek from "@/components/header";
import { IconSymbol } from '@/components/ui/icon-symbol';
import WaterContent from "@/components/watercontent";
import { getMacroData } from "@/utils/onboardingStorage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  PanResponder,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

interface FoodItem {
  id: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
  [key: string]: any;
}

interface DashboardData {
  calories?: {
    consumed?: number;
    goal?: number;
    remaining?: number;
  };
  nutrients?: {
    protein?: {
      consumed?: number;
      goal?: number;
      remaining?: number;
    };
    carbs?: {
      consumed?: number;
      goal?: number;
      remaining?: number;
    };
    fat?: {
      consumed?: number;
      goal?: number;
      remaining?: number;
    };
  };
  water?: {
    consumed?: number;
    goal?: number;
    remaining?: number;
  };
  [key: string]: any;
}

interface RecentLog {
  id?: string;
  type?: string;
  name?: string;
  calories?: number | string;
  time?: string;
  date?: string;
  logId?: string;
  [key: string]: any;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MAX_CALORIES = 3000;
const MAX_CARBS = 400; 
const MAX_PROTEIN = 250; 
const MAX_FATS = 150; 

const calculateProgress = (goal: number = 0, total: number = 1): number => {
  if (total <= 0 || goal <= 0) return 0;
  const progress = goal / total;
  return Math.min(Math.max(progress, 0), 1);
};

const calculateConsumptionProgress = (consumed: number = 0, goal: number = 1): number => {
  if (goal <= 0) return 0;
  const progress = consumed / goal;
  return Math.min(Math.max(progress, 0), 1); 
};

const mergeWithMacroData = (dashboard: DashboardData, macroData?: any): DashboardData => {
  if (!macroData || !macroData.macroNutrient) {
    console.log("🔄 No macro data to merge");
    return dashboard;
  }
  
  console.log("🔄 Merging with macro data:", macroData);

  if (!dashboard) {
    dashboard = {
      calories: {},
      nutrients: {}
    };
  }

  const { calories, protein, carbs, fats } = macroData.macroNutrient;

  if (!dashboard.calories) dashboard.calories = {};
  if (calories?.goal || calories?.value) {
    dashboard.calories.goal = dashboard.calories.goal || calories.goal || calories.value;
    console.log("✅ Set calories goal from planscreen:", dashboard.calories.goal);
  }

  if (!dashboard.nutrients) dashboard.nutrients = {};
  
  if (!dashboard.nutrients.protein) dashboard.nutrients.protein = {};
  if (protein?.goal || protein?.value) {
    dashboard.nutrients.protein.goal = dashboard.nutrients.protein.goal || protein.goal || protein.value;
    console.log("✅ Set protein goal from planscreen:", dashboard.nutrients.protein.goal);
  }

  if (!dashboard.nutrients.carbs) dashboard.nutrients.carbs = {};
  if (carbs?.goal || carbs?.value) {
    dashboard.nutrients.carbs.goal = dashboard.nutrients.carbs.goal || carbs.goal || carbs.value;
    console.log("✅ Set carbs goal from planscreen:", dashboard.nutrients.carbs.goal);
  }

  if (!dashboard.nutrients.fat) dashboard.nutrients.fat = {};
  if (fats?.goal || fats?.value) {
    dashboard.nutrients.fat.goal = dashboard.nutrients.fat.goal || fats.goal || fats.value;
    console.log("✅ Set fat goal from planscreen:", dashboard.nutrients.fat.goal);
  }

  return dashboard;
};

const createDashboardFromMacroData = (macroData: any): DashboardData | null => {
  if (!macroData || !macroData.macroNutrient) {
    console.log("📊 No macro data available for dashboard creation");
    return null;
  }

  console.log("📊 Creating dashboard from macro data:", macroData);

  const { calories, protein, carbs, fats } = macroData.macroNutrient;

  const caloriesGoal = calories?.goal || calories?.value || 2000;
  const proteinGoal = protein?.goal || protein?.value || 150;
  const carbsGoal = carbs?.goal || carbs?.value || 200;
  const fatsGoal = fats?.goal || fats?.value || 65;

  console.log("🎯 Using goals - Calories:", caloriesGoal, "Protein:", proteinGoal, "Carbs:", carbsGoal, "Fats:", fatsGoal);

  const dashboard = {
    calories: {
      consumed: 0,
      goal: caloriesGoal,
      remaining: caloriesGoal,
    },
    nutrients: {
      protein: {
        consumed: 0,
        goal: proteinGoal,
        remaining: proteinGoal,
      },
      carbs: {
        consumed: 0,
        goal: carbsGoal,
        remaining: carbsGoal,
      },
      fat: {
        consumed: 0,
        goal: fatsGoal,
        remaining: fatsGoal,
      },
    },
  };

  console.log("📈 Created dashboard:", dashboard);
  return dashboard;
};

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [page, setPage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [storedMacroData, setStoredMacroData] = useState<any>(null);
  const [foodList, setFoodList] = useState<FoodItem[]>([]);
const [foodListLoading, setFoodListLoading] = useState(false);
const [foodListPage, setFoodListPage] = useState(1);
const [hasMoreFoods, setHasMoreFoods] = useState(true);
  const { activities, isAnalyzing, addActivity } = useActivity();
  const { myFoods, removeFood, addFood } = useFood();
  const [swipedIndex, setSwipedIndex] = useState<number | null>(null);
  const swipeAnimations = React.useRef<{ [key: number]: Animated.Value }>({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

 // In your component
const fetchFoodList = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
  try {
    setFoodListLoading(true);
    
    const response = await wellnessApi.getFoodList({
      page,
      limit: 20,
      search: "" // You can add search functionality later
    });

    console.log('Food list API response:', response);
    
    // Now response should be the array of food items directly
    const foods = Array.isArray(response) ? response : [];
    
    if (isRefresh || page === 1) {
      setFoodList(foods);
    } else {
      setFoodList(prev => [...prev, ...foods]);
    }
    
    // Check if there are more items to load
    // Since your API returns empty array when no data, we can check length
    if (foods.length < 20) {
      setHasMoreFoods(false);
    } else {
      setHasMoreFoods(true);
    }
  } catch (error: any) {
    console.error('Error fetching food list:', error);
    Alert.alert(
      'Error',
      error?.response?.data?.message || error?.message || 'Failed to load food list'
    );
  } finally {
    setFoodListLoading(false);
  }
}, []);

  // Add this useEffect to load food list
React.useEffect(() => {
  if (hasMounted.current) {
    console.log('=== FETCHING FOOD LIST ===');
    fetchFoodList(1, true);
  }
}, [fetchFoodList]);

  const fetchDashboardData = useCallback(async (date: Date, showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
        setRefreshing(true);
      }
      const dateString = formatDate(date);
      
      console.log('=== FETCHING DASHBOARD DATA ===');
      console.log('Date:', dateString);
      
      const [dashboardResponse, recentLogsResponse] = await Promise.all([
        wellnessApi.getDashboard(dateString),
        wellnessApi.getRecentLogs({ page: 1, limit: 20, date: dateString })
      ]);

      console.log('Dashboard Response:', dashboardResponse);
      console.log('Recent Logs Response:', recentLogsResponse);

      const dashboard = dashboardResponse?.data || dashboardResponse?.result || dashboardResponse;
      
      const macroData = await getMacroData();
      console.log("📦 Fresh macro data from storage:", JSON.stringify(macroData, null, 2));
      
      if (macroData) {
        setStoredMacroData(macroData);
      }
      
if (dashboard) {
  console.log('📋 Original dashboard data:', dashboard);
  
  // Merge with stored macro data to get calculated goals
  const mergedDashboard = mergeWithMacroData(dashboard, macroData);
  setDashboardData(mergedDashboard);
  
  console.log('✅ Final merged dashboard:', mergedDashboard);
  console.log('  - Calories goal:', mergedDashboard.calories?.goal);
  console.log('  - Protein goal:', mergedDashboard.nutrients?.protein?.goal);
  console.log('  - Carbs goal:', mergedDashboard.nutrients?.carbs?.goal);
  console.log('  - Fat goal:', mergedDashboard.nutrients?.fat?.goal);
} else {
  console.warn('⚠️ No dashboard data found in response');
  if (macroData) {
    const macroBasedDashboard = createDashboardFromMacroData(macroData);
    if (macroBasedDashboard) {
      setDashboardData(macroBasedDashboard);
      console.log('✅ Created dashboard from stored macro data:', macroBasedDashboard);
    }
  } else {
    setDashboardData({
      calories: { consumed: 0, goal: 2000, remaining: 2000 },
      nutrients: {
        protein: { consumed: 0, goal: 150, remaining: 150 },
        carbs: { consumed: 0, goal: 200, remaining: 200 },
        fat: { consumed: 0, goal: 65, remaining: 65 },
      }
    });
  }
}
      // Handle different response structures for recent logs
      let logs = [];
      if (recentLogsResponse?.data?.list) {
        logs = recentLogsResponse.data.list;
        console.log('✅ [Dashboard] Extracted logs from response.data.list');
      } else if (recentLogsResponse?.data) {
        logs = Array.isArray(recentLogsResponse.data) ? recentLogsResponse.data : [];
        console.log('✅ [Dashboard] Extracted logs from response.data');
      } else if (recentLogsResponse?.result) {
        logs = Array.isArray(recentLogsResponse.result) ? recentLogsResponse.result : [];
        console.log('✅ [Dashboard] Extracted logs from response.result');
      } else if (recentLogsResponse?.logs) {
        logs = Array.isArray(recentLogsResponse.logs) ? recentLogsResponse.logs : [];
        console.log('✅ [Dashboard] Extracted logs from response.logs');
      } else if (Array.isArray(recentLogsResponse)) {
        logs = recentLogsResponse;
        console.log('✅ [Dashboard] Using response as array directly');
      } else {
        logs = [];
        console.warn('⚠️ [Dashboard] Invalid logs format from API:', recentLogsResponse);
      }
      
      if (Array.isArray(logs)) {
        setRecentLogs(logs);
        console.log('✅ [Dashboard] Recent logs set:', logs.length, 'items');
        console.log('📋 [Dashboard] Recent logs sample:', logs.length > 0 ? JSON.stringify(logs[0], null, 2) : 'No logs');
        
        // Log exercise types found
        const exerciseLogs = logs.filter((log: any) => 
          log.type === 'activity' || 
          log.type === 'exercise' || 
          log.type === 'Run' || 
          log.type === 'run' ||
          log.type === 'WeightLifting' ||
          log.type === 'weightlifting' ||
          log.type === 'weight_lifting' ||
          log.duration !== undefined ||
          log.intensity !== undefined
        );
        console.log('🏃 [Dashboard] Exercise logs found:', exerciseLogs.length);
        if (exerciseLogs.length > 0) {
          console.log('🏃 [Dashboard] Exercise log types:', exerciseLogs.map((log: any) => log.type || 'unknown'));
        }
      } else {
        console.warn('⚠️ [Dashboard] Logs is not an array:', typeof logs);
        setRecentLogs([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error message:', error?.message);
            if (showLoading && !dashboardData) {
        Alert.alert(
          'Error',
          error?.response?.data?.message || error?.message || 'Failed to load dashboard data. Please try again.'
        );
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  const hasMounted = React.useRef(false);
  
  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      console.log('=== INITIAL MOUNT - FETCHING DASHBOARD DATA ===');
      fetchDashboardData(selectedDate, true);
    }
  }, []); 
    useFocusEffect(
    useCallback(() => {
      if (!hasMounted.current) {
        return;
      }
      
      console.log("🔄 [Dashboard] Screen focused - refreshing dashboard data");
      console.log("🔄 [Dashboard] Selected date:", formatDate(selectedDate));
      console.log("🔄 [Dashboard] Refresh param:", params.refresh);
      
      // Refresh dashboard data when screen comes into focus
      // This ensures data is fresh after logging exercises, foods, etc.
      // Add a small delay if refresh param is present (coming from exercise log)
      const refreshDelay = params.refresh ? 1000 : 0;
      
      setTimeout(() => {
        fetchDashboardData(selectedDate, false);
      }, refreshDelay);
    }, [selectedDate, fetchDashboardData, params.refresh])
  );

  const handleAddFoodToLog = async (foodItem: FoodItem) => {
    try {
      const dateString = formatDate(selectedDate);
      
      const response = await wellnessApi.logFoodFromSearch({
        foodId: foodItem.id,
        date: dateString
      });
      
      console.log('Food added to log:', response);
      
      // Refresh dashboard to show updated data
      await fetchDashboardData(selectedDate, false);
      
      Alert.alert('Success', `${foodItem.name} added to your daily log!`);
    } catch (error: any) {
      console.error('Error adding food to log:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to add food to log'
      );
    }
  };
  const handleDatePress = useCallback((date: Date) => {
    console.log('=== DATE CHANGED ===', formatDate(date));
    setSelectedDate(date);
    fetchDashboardData(date, true);
  }, [fetchDashboardData]);

  const handleDeleteFood = useCallback(async (foodId: string, logId?: string) => {
    try {
      removeFood(foodId);
      if (logId) {
        await wellnessApi.deleteFood(logId);
      }
      
      await fetchDashboardData(selectedDate);
    } catch (error: any) {
      console.error('Error deleting food:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to delete food. Please try again.'
      );
      await fetchDashboardData(selectedDate);
    }
  }, [selectedDate, fetchDashboardData, removeFood]);

  const nutrients1 = React.useMemo(() => {
    const protein = dashboardData?.nutrients?.protein || {};
    const carbs = dashboardData?.nutrients?.carbs || {};
    const fat = dashboardData?.nutrients?.fat || {};
  
    const proteinGoal = protein.goal || 150;
    const carbsGoal = carbs.goal || 200;
    const fatGoal = fat.goal || 65;
  
    console.log("📈 Nutrients1 - Protein:", proteinGoal, "Carbs:", carbsGoal, "Fat:", fatGoal);
  
    return [
      {
        label: "Protein",
        grams: Math.round(proteinGoal),
        color: "#ff595e",
        value: calculateProgress(proteinGoal, MAX_PROTEIN),
        icon: require("../../assets/images/meat.png")
      },
      {
        label: "Carbs",
        grams: Math.round(carbsGoal),
        color: "#ffca3a",
        value: calculateProgress(carbsGoal, MAX_CARBS),
        icon: require("../../assets/images/grass.png")
      },
      {
        label: "Fat",
        grams: Math.round(fatGoal),
        color: "#8ac926",
        value: calculateProgress(fatGoal, MAX_FATS),
        icon: require("../../assets/images/avacado.png")
      },
    ];
  }, [dashboardData]);
  
  const nutrients = React.useMemo(() => {
    const protein = dashboardData?.nutrients?.protein || {};
    const carbs = dashboardData?.nutrients?.carbs || {};
    const fat = dashboardData?.nutrients?.fat || {};
  
    const proteinGoal = protein.goal || 150;
    const carbsGoal = carbs.goal || 200;
    const fatGoal = fat.goal || 65;
  
    console.log("📈 Nutrients - Protein:", proteinGoal, "Carbs:", carbsGoal, "Fat:", fatGoal);
  
    return [
      {
        label: "Protein",
        grams: Math.round(proteinGoal),
        color: "#44CAF3",
        value: calculateProgress(proteinGoal, MAX_PROTEIN),
        icon: require("../../assets/images/meat.png")
      },
      {
        label: "Carbs",
        grams: Math.round(carbsGoal),
        color: "#44CAF3",
        value: calculateProgress(carbsGoal, MAX_CARBS),
        icon: require("../../assets/images/grass.png")
      },
      {
        label: "Fat",
        grams: Math.round(fatGoal),
        color: "#44CAF3",
        value: calculateProgress(fatGoal, MAX_FATS),
        icon: require("../../assets/images/avacado.png")
      },
    ];
  }, [dashboardData]);
  const caloriesData = React.useMemo(() => {
    const calories = dashboardData?.calories || {};
    
    const caloriesGoal = calories.goal || 2000;
    const caloriesConsumed = calories.consumed || 0;
    const caloriesRemaining = caloriesGoal - caloriesConsumed;
  
    console.log("🔥 Calories data - Goal:", caloriesGoal, "Consumed:", caloriesConsumed, "Remaining:", caloriesRemaining);
  
    return {
      consumed: caloriesConsumed,
      goal: caloriesGoal,
      remaining: caloriesRemaining,
    };
  }, [dashboardData]);

  const allFoods = React.useMemo(() => {
    const apiFoods = recentLogs
      .filter((log: RecentLog) => {
        return (log.type === 'food' || !log.type) && log.name;
      })
      .map((log: RecentLog) => ({
        id: log.logId || log.id || `api-food-${Date.now()}-${Math.random()}`,
        name: log.name || 'Unknown Food',
        calories: log.calories?.toString() || '0',
        cookedType: log.cookedType || '',
        logId: log.logId || log.id,
        fromApi: true, 
        ...log
      }));
    
      const contextFoods = myFoods
      .filter(f => f.id) 
      .map(f => ({
        ...f,
          fromContext: true, 
        logId: f.id, 
      }));
    
    const apiFoodIds = new Set(apiFoods.map(f => f.logId || f.id));
    const uniqueContextFoods = contextFoods.filter(f => {
      const foodId = f.logId || f.id;
      return foodId && !apiFoodIds.has(foodId);
    });
    
    return [...apiFoods, ...uniqueContextFoods];
  }, [recentLogs, myFoods]);

  const allActivities = React.useMemo(() => {
    // Filter for exercise/activity logs - check multiple possible type values and fields
    const apiActivities = recentLogs
      .filter((log: RecentLog) => {
        const logType = (log.type || '').toLowerCase();
        // Check for explicit exercise types
        const isExerciseType = logType === 'activity' || 
                              logType === 'exercise' || 
                              logType === 'run' || 
                              logType === 'weightlifting' ||
                              logType === 'weight_lifting' ||
                              logType === 'weight-lifting';
        
        // Check for exercise indicators (duration + intensity suggests exercise)
        const hasExerciseFields = (log.duration !== undefined && log.duration !== null) ||
                                 (log.intensity !== undefined && log.intensity !== null);
        
        // Check for exercise name patterns
        const hasExerciseName = log.name && (
          log.name.toLowerCase().includes('run') ||
          log.name.toLowerCase().includes('weight') ||
          log.name.toLowerCase().includes('exercise') ||
          log.name.toLowerCase().includes('activity')
        );
        
        return isExerciseType || (hasExerciseFields && !log.name) || hasExerciseName;
      })
      .map((log: RecentLog) => {
        // Map the type to a display-friendly name
        let displayType = log.type || 'Exercise';
        if (displayType.toLowerCase() === 'run') {
          displayType = 'Run';
        } else if (displayType.toLowerCase().includes('weight')) {
          displayType = 'WeightLifting';
        }
        
        // Helper function to safely extract numeric value (handles objects with value property)
        const getNumericValue = (val: any): number => {
          if (val === null || val === undefined) return 0;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0 : parsed;
          }
          if (typeof val === 'object' && 'value' in val) {
            return getNumericValue(val.value);
          }
          return 0;
        };
        
        return {
          id: log.logId || log.id || `api-activity-${Date.now()}-${Math.random()}`,
          type: displayType,
          name: log.name || displayType,
          calories: getNumericValue(log.calories),
          duration: getNumericValue(log.duration),
          intensity: getNumericValue(log.intensity),
          time: log.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: log.date || formatDate(selectedDate),
          fromApi: true,
          logId: log.logId || log.id,
        };
      });
    
    console.log('🏃 [Dashboard] API Activities found:', apiActivities.length);
    if (apiActivities.length > 0) {
      console.log('🏃 [Dashboard] API Activities:', JSON.stringify(apiActivities.slice(0, 2), null, 2));
    }
    
    const contextActivities = activities
      .filter(a => a.id) 
      .map(a => ({
        ...a,
        fromContext: true, 
        logId: a.id, 
      }));
    
    const apiActivityIds = new Set(apiActivities.map(a => a.logId || a.id));
    const uniqueContextActivities = contextActivities.filter(a => {
      const activityId = a.logId || a.id;
      return activityId && !apiActivityIds.has(activityId);
    });

    return [...apiActivities, ...uniqueContextActivities];
  }, [recentLogs, activities, selectedDate]);
  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };
  const actionButtons = [
    {
      id: 1,
      title: "Scan food",
      icon: "camera-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/scanfood/camera")
    },
    {
      id: 2,
      title: "Food database",
      icon: "fast-food-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/fooddatabase/save?tab=all")
    },
    {
      id: 3,
      title: "Log exercise",
      icon: "barbell-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/Exercise")
    },
    {
      id: 4,
      title: "Save foods",
      icon: "bookmark-outline",
      color: "#FFFFFF",
      onPress: () => router.push("/screen1/fooddatabase/save?tab=savescans")
    },
  ];

  const toggleActions = () => {
    if (showActions) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowActions(false));
    } else {
      setShowActions(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };


  const onHorizontalScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const screenWidth = wp("100%");
    const currentPage = Math.round(x / screenWidth);

    setPage(currentPage);
  };

  const scrollViewRef = React.useRef<ScrollView>(null);

  const goToPage = (pageIndex: number) => {
    setPage(pageIndex);
    scrollViewRef.current?.scrollTo({
      x: pageIndex * wp("100%"),
      animated: true,
    });
  };

  const backgroundStyle = {
    opacity: fadeAnim,
  };

  const cardStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
    opacity: slideAnim,
  };

  const firstRow = actionButtons.slice(0, 2);
  const secondRow = actionButtons.slice(2, 4);

  return (
    <SafeAreaView style={styles.container}>
      <DashboardHeaderWeek
        title="Dashboard"
        activeIndex={2}
        onDayPress={handleDatePress}
        onSettingsPress={() => router.push("/screen1/profile/setting")}
      />

      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B3AAC" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      )}

      <ScrollView
        style={styles.verticalScrollView}
        contentContainerStyle={styles.verticalScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchDashboardData(selectedDate)}
            tintColor="#4B3AAC"
          />
        }
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onHorizontalScroll}
          scrollEventThrottle={16}
          style={styles.horizontalScroll}
          nestedScrollEnabled={true}
        >
          <View style={styles.page}>
            <FoodlistContent 
              nutrients={nutrients1}
              calories={caloriesData}
              loading={loading}
            />
          </View>

          <View style={styles.page}>
            <WaterContent
              showPopup={showPopup}
              setShowPopup={setShowPopup}
              showWaterModal={showWaterModal}
              setShowWaterModal={setShowWaterModal}
              selectedAmount={selectedAmount}
              setSelectedAmount={setSelectedAmount}
              nutrients={nutrients}
              date={formatDate(selectedDate)}
              onRefresh={() => fetchDashboardData(selectedDate, false)}
              currentWaterIntake={dashboardData?.water?.consumed || 0}
              steps={dashboardData?.steps || dashboardData?.stepCount || dashboardData?.stepsCount || 0}
            />
          </View>
        </ScrollView>

        {isAnalyzing && (
          <View style={styles.analyzingBox}>
            <Image
              source={require("../../assets/images/weight lifting.png")}
              style={styles.analyzingIcon}
            />

            <Text style={styles.analyzingTitle}>Analyzing exercise...</Text>

            <View style={styles.skeletonBar} />
            <View style={[styles.skeletonBar, { width: "70%" }]} />
            <View style={[styles.skeletonBar, { width: "50%" }]} />

            <Text style={styles.analyzingNote}>We'll notify you when done!</Text>
          </View>
        )}

        <View style={styles.paginationDots}>
          <TouchableOpacity onPress={() => goToPage(0)}>
            <View style={[styles.dot, page === 0 && styles.activeDot]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goToPage(1)}>
            <View style={[styles.dot, page === 1 && styles.activeDot]} />
          </TouchableOpacity>
        </View>

        {allActivities.length > 0 && (
          <View style={styles.activityList}>
            <Text style={styles.activityListTitle}>Recently Logged</Text>
            {allActivities.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.activityCard}
                onPress={() => {
                  router.push({
                    pathname: '/screen1/DescribeExercise',
                    params: {
                      activityId: item.logId || item.id,
                      activityType: item.type || '',
                      activityDescription: item.description || item.name || '',
                      activityDuration: String(item.duration || 0),
                      activityIntensity: String(item.intensity || 1),
                      activityCalories: String(item.calories || 0),
                      activityDate: item.date || formatDate(selectedDate),
                      activityTime: item.time || '',
                      activityLogId: item.logId || item.id || '',
                    }
                  });
                }}
              >

                <Text style={styles.activityTime}>
                  {item.time ? item.time : "10:28"}
                </Text>

                <View style={styles.activityRow}>
                  <View style={styles.activityIconBox}>
                    <Image
                      source={item.type === "WeightLifting"
                        ? require("../../assets/images/weight lifting.png")
                        : require("../../assets/images/run.png")}
                      style={styles.activityIcon}
                    />
                  </View>

                  <View style={styles.activityInfo}>

                    <Text style={styles.activityTitle}>{item.type}</Text>

                    <Text style={styles.activityCalories}>
                      <Ionicons name="flame-outline" size={RFValue(16)} color="#111" />
                      {typeof item.calories === 'number' ? item.calories : Number(item.calories) || 0} calories
                    </Text>

                    <Text style={styles.activityDetails}>
                      <Image source={require("../../assets/images/flash.png")} style={{ width: 16, height: 16 }} />
                      Intensity:
                      {(() => {
                        const intensity = typeof item.intensity === 'number' ? item.intensity : Number(item.intensity) || 1;
                        return intensity === 2 ? " High" : intensity === 1 ? " Medium" : " Low";
                      })()}
                      {"   "}<IconSymbol size={16} name="clock.fill" color="#111" /> {typeof item.duration === 'number' ? item.duration : Number(item.duration) || 0} Mins
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {allFoods.length > 0 && (
          <View style={styles.foodListSection}>
            <Text style={styles.foodListSectionTitle}>My Foods</Text>
            {allFoods.map((item: any, index: number) => {
              if (!swipeAnimations.current[index]) {
                swipeAnimations.current[index] = new Animated.Value(0);
              }

              const panResponder = PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_, gestureState) => {
                  return Math.abs(gestureState.dx) > 10;
                },
                onPanResponderGrant: () => {
                  if (swipedIndex !== null && swipedIndex !== index) {
                    Animated.spring(swipeAnimations.current[swipedIndex], {
                      toValue: 0,
                      useNativeDriver: true,
                    }).start();
                    setSwipedIndex(null);
                  }
                },
                onPanResponderMove: (_, gestureState) => {
                  if (gestureState.dx < 0) {
                    swipeAnimations.current[index].setValue(gestureState.dx);
                  }
                },
                onPanResponderRelease: (_, gestureState) => {
                  const swipeThreshold = -80;
                  if (gestureState.dx < swipeThreshold) {     
                    Animated.spring(swipeAnimations.current[index], {
                      toValue: -80,
                      useNativeDriver: true,
                    }).start();
                    setSwipedIndex(index);
                  } else {
                    Animated.spring(swipeAnimations.current[index], {
                      toValue: 0,
                      useNativeDriver: true,
                    }).start();
                    setSwipedIndex(null);
                  }
                },
              });

              const handleDelete = async () => {
                Animated.timing(swipeAnimations.current[index], {
                  toValue: -wp("100%"),
                  duration: 300,
                  useNativeDriver: true,
                }).start(async () => {
                  if (item.id) {
                    await handleDeleteFood(item.id, item.logId);
                  } else {
                    swipeAnimations.current[index].setValue(0);
                    setSwipedIndex(null);
                  }
                });
              };

              const handleResetSwipe = () => {
                Animated.spring(swipeAnimations.current[index], {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
                setSwipedIndex(null);
              };


              return (
                <View key={index} style={styles.swipeContainer}>
                  {swipedIndex === index && (
                    <View style={styles.deleteButtonContainer}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                      >
                        <Ionicons name="trash-outline" size={RFValue(20)} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <Animated.View
                    style={[
                      styles.foodCard,
                      {
                        transform: [{ translateX: swipeAnimations.current[index] }],
                      },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    <TouchableOpacity
                      style={styles.foodCardTouchable}
                      onPress={() => {
                        if (swipedIndex === index) {
                          handleResetSwipe();
                        } else {
                          router.push({
                            pathname: "/screen1/fooddatabase/SelectedFood",
                            params: {
                              ...item,
                            }
                          });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.foodCardContent}>
                        <Text style={styles.foodCardName}>{item.name}</Text>
                        <View style={styles.foodCardRow}>
                          <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
                          <Text style={styles.foodCardSubtitle}>
                            {item.calories} cal-oz, {item.cookedType}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.foodCardPlusButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (swipedIndex === index) {
                            handleResetSwipe();
                          } else {
                            router.push({
                              pathname: "/screen1/fooddatabase/SelectedFood",
                              params: {
                                ...item,
                              }
                            });
                          }
                        }}
                      >
                        <Text style={styles.foodCardPlusText}>+</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        )}

        {/* Add this section after your existing "My Foods" section */}
{foodList.length > 0 && (
  <View style={styles.foodListSection}>
    <Text style={styles.foodListSectionTitle}>My Food Database</Text>
    {foodList.map((item: FoodItem, index: number) => (
      <TouchableOpacity
        key={`api-food-${item.id}-${index}`}
        style={styles.foodCard}
        onPress={() => {
          // Navigate to food detail screen
          router.push({
            pathname: "/screen1/fooddatabase/SelectedFood",
            params: {
              id: item.id,
              name: item.name,
              calories: item.calories?.toString() || '0',
              protein: item.protein?.toString() || '0',
              carbs: item.carbs?.toString() || '0',
              fat: item.fat?.toString() || '0',
              servingSize: item.servingSize || '',
              fromApi: 'true'
            }
          });
        }}
      >
        <View style={styles.foodCardContent}>
          <Text style={styles.foodCardName}>{item.name}</Text>
          <View style={styles.foodCardRow}>
            <Ionicons name="flame-outline" size={RFValue(14)} color="#666" />
            <Text style={styles.foodCardSubtitle}>
              {item.calories || 0} calories
              {item.servingSize && ` • ${item.servingSize}`}
            </Text>
          </View>
          {/* Nutrition info */}
          {(item.protein || item.carbs || item.fat) && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionText}>
                P: {item.protein || 0}g
              </Text>
              <Text style={styles.nutritionText}>
                C: {item.carbs || 0}g
              </Text>
              <Text style={styles.nutritionText}>
                F: {item.fat || 0}g
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.foodCardPlusButton}
          onPress={(e) => {
            e.stopPropagation();
            // Add to daily log
            handleAddFoodToLog(item);
          }}
        >
          <Text style={styles.foodCardPlusText}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ))}
    
    {/* Load more button */}
    {hasMoreFoods && (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={() => {
          const nextPage = foodListPage + 1;
          setFoodListPage(nextPage);
          fetchFoodList(nextPage, false);
        }}
        disabled={foodListLoading}
      >
        <Text style={styles.loadMoreText}>
          {foodListLoading ? 'Loading...' : 'Load More'}
        </Text>
      </TouchableOpacity>
    )}
  </View>
)}

        {allActivities.length === 0 && allFoods.length === 0 && !loading && (
          <View style={styles.foodListContainer}>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>You haven't logged anything</Text>
              <Text style={styles.foodTime}>
                Start tracking by adding activity.
              </Text>
            </View>
            <Image
              source={require("../../assets/images/arrow.png")}
              style={styles.arrow}
            />
          </View>
        )}

        <View style={{ height: hp("10%") }} />
      </ScrollView>

      {showActions && (
        <Animated.View style={[styles.overlay, backgroundStyle]}>
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={toggleActions}
            activeOpacity={1}
          >
            <Animated.View style={[styles.actionCard, cardStyle]}>
              <View style={styles.actionRow}>
                {secondRow.map((button) => (
                  <TouchableOpacity
                    key={button.id}
                    style={[styles.actionItem, { backgroundColor: button.color }]}
                    onPress={() => {
                      button.onPress();
                      toggleActions();
                    }}
                  >
                    <Ionicons name={button.icon as any} size={RFValue(24)} color="#111" />
                    <Text style={styles.actionText}>{button.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>


              <View style={styles.actionRow}>
                {firstRow.map((button) => (
                  <TouchableOpacity
                    key={button.id}
                    style={[styles.actionItem, { backgroundColor: button.color }]}
                    onPress={() => {
                      button.onPress();
                      toggleActions();
                    }}
                  >
                    <Ionicons name={button.icon as any} size={RFValue(24)} color="#111" />
                    <Text style={styles.actionText}>{button.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={toggleActions}
      >
        <Animated.View style={rotateStyle}>
          <Ionicons name="add" size={RFValue(30)} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8fc",
  },
  verticalScrollView: {
    flex: 1,
  },
  verticalScrollContent: {
    flexGrow: 1,
  },
  horizontalScroll: {
    height: hp("45%"),
  },
  page: {
    width: wp("100%"),
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp("1%"),
  },
  dot: {
    width: wp("2.5%"),
    height: wp("2.5%"),
    borderRadius: wp("1.25%"),
    backgroundColor: "#E5E7EB",
    marginHorizontal: wp("1%"),
  },
  activeDot: {
    backgroundColor: "#4B3AAC",
  },
  addButton: {
    position: "absolute",
    bottom: hp("1%"),
    right: wp("6%"),
    backgroundColor: "#4B3AAC",
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("7.5%"),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 110, 
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 100, 
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: hp("15%"),
  },
  actionCard: {
    borderRadius: wp("6%"),
    padding: wp("5%"),
    width: wp("90%"),
    

  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("2%"),
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp("2%"),
    borderRadius: wp("4%"),
    marginHorizontal: wp("1%"),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  actionText: {
    color: "#111",
    fontSize: RFValue(12),
    fontWeight: "600",
    marginTop: hp("1%"),
    textAlign: "center",
  },
  foodListContainer: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    borderRadius: wp("6%"),
    padding: wp("4%"),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("8%"),
    height: hp("10%"),
  },
  foodInfo: {
    flex: 1,
    justifyContent: "center",
  },
  foodName: {
    fontSize: RFValue(15),
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
  foodTime: {
    fontSize: RFValue(11),
    color: "#888",
    marginTop: hp("0.5%"),
    textAlign: "center",
    marginLeft: wp("10%"),
    marginRight: wp("10%"),
  },
  arrow: {
    width: wp("15%"),
    height: hp("8%"),
    resizeMode: "contain",
    position: "absolute",
    top: hp("10%"),
    right: wp("20%"),
    zIndex: 10,
  },
  activityList: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
  },
  activityListTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#222",
    marginBottom: hp("1%"),
  },

  activityCard: {
    backgroundColor: "#fff",
    borderRadius: wp("4%"),
    padding: wp("4%"),
    marginBottom: hp("1.5%"),

  },

  activityTime: {
    position: "absolute",
    right: wp("4%"),
    top: hp("1%"),
    fontSize: RFValue(10),
    color: "#999",
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  activityIconBox: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("3%"),
    backgroundColor: "#F2F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("4%"),
  },

  activityIcon: {
    width: wp("7%"),
    height: wp("7%"),
    resizeMode: "contain",
  },

  activityInfo: {
    flex: 1,
  },

  activityTitle: {
    fontSize: RFValue(14),
    fontWeight: "700",
    color: "#222",
  },

  activityCalories: {
    marginTop: hp("0.5%"),
    fontSize: RFValue(12),
    color: "#555",
  },

  activityDetails: {
    marginTop: hp("0.5%"),
    fontSize: RFValue(11),
    color: "#777",
    flexDirection: "row",
    alignItems: "center",
    gap: wp("1%"),
  },
  analyzingBox: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    backgroundColor: "#fff",
    padding: wp("5%"),
    borderRadius: wp("5%"),
    alignItems: "flex-start"
  },
  analyzingIcon: {
    width: wp("10%"),
    height: wp("10%"),
    resizeMode: "contain",
    marginBottom: hp("1%")
  },
  analyzingTitle: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#222",
    marginBottom: hp("1%")
  },
  skeletonBar: {
    height: hp("1.2%"),
    backgroundColor: "#E5E5EE",
    borderRadius: 8,
    width: "85%",
    marginVertical: hp("0.5%")
  },
  analyzingNote: {
    marginTop: hp("1.5%"),
    color: "#999",
    fontSize: RFValue(11)
  },

  foodListSection: {
    marginHorizontal: wp("5%"),
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
  },

  foodListSectionTitle: {
    fontSize: RFValue(16),
    fontWeight: "700",
    color: "#222",
    marginBottom: hp("1%"),
  },

  foodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    borderRadius: wp("4%"),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 2, 
  },

  foodCardContent: {
    flex: 1,
    marginRight: wp("2%"),
  },

  foodCardName: {
    fontSize: RFValue(15),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("0.5%"),
  },

  foodCardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("0.3%"),
  },

  foodCardSubtitle: {
    fontSize: RFValue(12),
    marginLeft: wp("1%"),
    color: "#666",
  },

  foodCardPlusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  foodCardPlusText: {
    fontSize: RFValue(20),
    color: "#4B3AAC",
    fontWeight: "900",
  },
  swipeContainer: {
    position: "relative",
    marginBottom: hp("1%"),
    borderRadius: wp("4%"),
    overflow: "hidden", 
  },

  deleteButtonContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    backgroundColor: "#4B3AAC", 
    zIndex: 1,
  },

  deleteButton: {
    backgroundColor: "#4B3AAC",
    width: 80,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: wp("4%"),
  },

  foodCardTouchable: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp("5%"),
  },
  loadingText: {
    marginTop: hp("2%"),
    fontSize: RFValue(14),
    color: "#666",
  },
  nutritionRow: {
    flexDirection: 'row',
    marginTop: hp('0.5%'),
    gap: wp('3%'),
  },
  nutritionText: {
    fontSize: RFValue(11),
    color: '#888',
  },
  loadMoreButton: {
    backgroundColor: '#4B3AAC',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: '600',
  },

});