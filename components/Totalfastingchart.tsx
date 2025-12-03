import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

interface ChartDataPoint {
  value: number;
  label: string;
}

export default function Totalfastingchart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [averageDisplay, setAverageDisplay] = useState<string>("0h 0m");
  const [goal, setGoal] = useState<number>(72);
  const [maxValue, setMaxValue] = useState<number>(90);
  const router = useRouter();

  // Generate month name based on currentWeekOffset
  const getMonthName = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[startDate.getMonth()];
  };

  const monthName = getMonthName();

  // Format hours and minutes for display
  const formatHoursMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Format date for API (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  /**
   * Fetch fasting chart data from the API
   * 
   * DATA FLOW EXPLANATION:
   * 1. User saves fasting/weight data in saveweight.tsx (or fasting logging screen)
   * 2. Data is sent to backend via wellnessApi.logWeight() or similar API
   * 3. Backend stores the data in database
   * 4. This function fetches the stored data via wellnessApi.getFastingChart()
   * 5. API returns data for the selected date range (weekly view)
   * 6. Data is transformed and displayed in the chart
   * 
   * REFRESH BEHAVIOR:
   * - Chart refreshes automatically when:
   *   - Component mounts
   *   - Week offset changes (previous/next week)
   *   - Screen comes into focus (after navigating back from saveweight screen)
   */
  const fetchFastingChartData = async () => {
    try {
      setLoading(true);
      
      // Calculate week start and end dates based on currentWeekOffset
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week (7 days ago from today)
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week

      const sDate = formatDate(startDate);
      const eDate = formatDate(endDate);

      console.log('[Totalfastingchart] Fetching fasting chart data:', { sDate, eDate, trend: 'weekly' });

      // Fetch fasting chart data from API
      // This API retrieves all fasting data that was previously saved/logged
      const response = await wellnessApi.getFastingChart({
        sDate,
        eDate,
        trend: 'weekly',
      });

      console.log('[Totalfastingchart] Fasting chart API response:', JSON.stringify(response, null, 2));
      console.log('[Totalfastingchart] Response type:', typeof response);
      console.log('[Totalfastingchart] Response keys:', response ? Object.keys(response) : 'null');

      // Transform API response to chart data format
      // Handle different possible response structures from the API
      let dataList = [];
      let responseAverage = null;
      let responseGoal = null;
      
      // Try multiple response structure patterns
      if (response) {
        // Pattern 1: response.data.list or response.data.data.list
        if (response.data) {
          if (Array.isArray(response.data.list)) {
            dataList = response.data.list;
            console.log('[Totalfastingchart] Found data in response.data.list');
          } else if (response.data.data && Array.isArray(response.data.data.list)) {
            dataList = response.data.data.list;
            console.log('[Totalfastingchart] Found data in response.data.data.list');
          } else if (Array.isArray(response.data)) {
            dataList = response.data;
            console.log('[Totalfastingchart] Found data array directly in response.data');
          }
          
          // Extract average and goal from response.data
          if (response.data.average !== undefined) responseAverage = response.data.average;
          if (response.data.goal !== undefined) responseGoal = response.data.goal;
        }
        
        // Pattern 2: response.result.list or response.result.data.list
        if (dataList.length === 0 && response.result) {
          if (Array.isArray(response.result.list)) {
            dataList = response.result.list;
            console.log('[Totalfastingchart] Found data in response.result.list');
          } else if (response.result.data && Array.isArray(response.result.data.list)) {
            dataList = response.result.data.list;
            console.log('[Totalfastingchart] Found data in response.result.data.list');
          } else if (Array.isArray(response.result)) {
            dataList = response.result;
            console.log('[Totalfastingchart] Found data array directly in response.result');
          }
          
          if (response.result.average !== undefined) responseAverage = response.result.average;
          if (response.result.goal !== undefined) responseGoal = response.result.goal;
        }
        
        // Pattern 3: response.list (direct array)
        if (dataList.length === 0 && Array.isArray(response.list)) {
          dataList = response.list;
          console.log('[Totalfastingchart] Found data in response.list');
        }
        
        // Pattern 4: response is directly an array
        if (dataList.length === 0 && Array.isArray(response)) {
          dataList = response;
          console.log('[Totalfastingchart] Response is directly an array');
        }
        
        // Extract average and goal from top level if not found yet
        if (responseAverage === null && response.average !== undefined) responseAverage = response.average;
        if (responseGoal === null && response.goal !== undefined) responseGoal = response.goal;
      }
      
      console.log('[Totalfastingchart] Extracted dataList:', dataList.length, 'items');
      console.log('[Totalfastingchart] Sample data:', dataList.slice(0, 2));
      
      // Transform data points to chart format
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const transformedData: ChartDataPoint[] = dataList.map((item: any, index: number) => {
        // Extract date and value from API response
        // Try multiple possible field names
        const date = item.date || item.dateString || item.day || item.createdAt || item.logDate;
        
        // Extract fasting hours value - try multiple possible field names
        const value = item.hours || 
                     item.totalHours || 
                     item.fastingHours ||
                     item.fastingTime ||
                     item.duration ||
                     item.value || 
                     (typeof item === 'number' ? item : 0);
        
        console.log('[Totalfastingchart] Processing item:', { index, date, value, itemKeys: Object.keys(item || {}) });

        // Format label (e.g., "16 Nov")
        let label = '';
        if (date) {
          const dateObj = new Date(date);
          const day = dateObj.getDate();
          label = `${day} ${monthNames[dateObj.getMonth()]}`;
        } else {
          // Fallback: use day of week if no date
          const dayDate = new Date(startDate);
          dayDate.setDate(startDate.getDate() + index);
          label = `${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}`;
        }

        return {
          value: value,
          label: label,
        };
      });

      // If no data, create placeholder data
      if (transformedData.length === 0) {
        // Generate empty data for the week
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(startDate);
          dayDate.setDate(startDate.getDate() + i);
          const day = dayDate.getDate();
          transformedData.push({
            value: 0,
            label: `${day} ${monthNames[dayDate.getMonth()]}`,
          });
        }
      }

      setChartData(transformedData);

      // Calculate average
      const totalHours = transformedData.reduce((sum, item) => sum + item.value, 0);
      const avgHours = transformedData.length > 0 ? totalHours / transformedData.length : 0;
      setAverageDisplay(formatHoursMinutes(Math.round(avgHours * 60))); // Convert hours to minutes

      // Update goal if provided
      if (responseGoal !== undefined && responseGoal !== null) {
        setGoal(responseGoal);
        console.log('[Totalfastingchart] Updated goal from API:', responseGoal);
      }
      
      // Update average if provided from API
      if (responseAverage !== null && responseAverage !== undefined) {
        setAverageDisplay(formatHoursMinutes(Math.round(responseAverage * 60)));
        console.log('[Totalfastingchart] Updated average from API:', responseAverage);
      }

      // Calculate max value for chart (round up to nearest 10)
      const maxVal = Math.max(...transformedData.map(d => d.value), goal || 72, 60);
      setMaxValue(Math.ceil(maxVal / 10) * 10);

    } catch (error: any) {
      console.error('[Totalfastingchart] Error fetching fasting chart data:', error);
      console.error('[Totalfastingchart] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack,
      });
      
      // Set empty data on error but still show the chart structure
      setChartData([]);
      setAverageDisplay("0h 0m");
      
      // You can optionally show an error alert here
      // Alert.alert('Error', 'Failed to fetch fasting chart data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or week offset changes
  useEffect(() => {
    console.log('[Totalfastingchart] Component mounted or week offset changed, fetching data...', { currentWeekOffset });
    fetchFastingChartData();
    // Note: fetchFastingChartData is defined above, so we disable exhaustive deps warning
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekOffset]);

  // Refresh data when screen comes into focus (e.g., after navigating back from saveweight screen)
  // This ensures the chart shows the latest data after logging weight or fasting
  useFocusEffect(
    useCallback(() => {
      console.log('[Totalfastingchart] Screen focused, refreshing fasting chart data...');
      fetchFastingChartData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWeekOffset]) // Refresh with the current week offset
  );

  const handlePreviousWeek = () => {
    setCurrentWeekOffset(currentWeekOffset - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
  };

  return (
    <View style={{ width: '100%' }}>
     

      {/* ---------- CARD ---------- */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: wp('4.5%'),
          padding: wp('4%'),
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
        }}
      >
        {/* HEADER */}
       

        {/* AVERAGE AND DATE SECTION - SIDE BY SIDE */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: hp('2%'),
          }}
        >
          {/* AVERAGE - LEFT SIDE */}
          <View style={{ alignItems: "flex-start" }}>
            <Text style={{ color: "#777", fontSize: RFValue(12), marginBottom: hp('0.5%') }}>
              Average
            </Text>
            <Text style={{ color: "#111", fontSize: RFValue(16), fontWeight: "600" }}>
              {averageDisplay}
            </Text>
          </View>

          {/* DATE SECTION - RIGHT SIDE */}
          <View style={{ alignItems: "flex-end" }}>
            {/* Arrows - Close together */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hp('0.5%') }}>
              <TouchableOpacity onPress={handlePreviousWeek}>
                <Ionicons name="chevron-back" size={RFValue(20)} color="#444" style={{ marginBottom: hp('0.5%') , backgroundColor: '#F4F2FA',borderRadius: wp('50%') }} />
              </TouchableOpacity>
              <View style={{ width: wp('3%') }} />
              <TouchableOpacity onPress={handleNextWeek}>
                <Ionicons name="chevron-forward" size={RFValue(20)} color="#444" style={{ marginBottom: hp('0.5%') , backgroundColor: '#F4F2FA',borderRadius: wp('50%') }} />
              </TouchableOpacity>
            </View>
            {/* Month Name */}
            <Text style={{ fontSize: RFValue(10), color: "#444", fontWeight: "600" }}>
              {monthName}
            </Text>
          </View>
        </View>

        {/* ---------- LINE CHART ---------- */}
        <View style={{ position: "relative", flexDirection: "row" }}>
          {/* Custom Y-axis labels */}
          <View
            style={{
              width: wp('10%'),
              justifyContent: "space-between",
              paddingTop: hp('1.2%'),
              paddingBottom: hp('2.5%'),
              paddingRight: wp('2%'),
            }}
          >
            {Array.from({ length: 4 }, (_, i) => maxValue - (i * (maxValue / 3))).map((label) => (
              <Text
                key={label}
                style={{
                  fontSize: RFValue(11),
                  color: "#666",
                  textAlign: "right",
                }}
              >
                {Math.round(label)}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1, position: "relative" }}>
            {loading ? (
              <View style={{ height: hp('15%'), justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#4B3AAC" />
              </View>
            ) : chartData.length > 0 ? (
              <LineChart
                data={chartData.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                width={wp('75%')}
                height={hp('15%')}
                spacing={wp('12%')}
                initialSpacing={wp('2.5%')}
                endSpacing={wp('2%')}
                color="#22C55E"
                thickness={3}
                dataPointsColor="transparent"
                dataPointsRadius={0}
                dataPointsWidth={0}
                curved
                areaChart
                startFillColor="#22C55E"
                endFillColor="#22C55E"
                startOpacity={0.3}
                endOpacity={0}
                hideRules={false}
                rulesColor="#E5E7EB"
                rulesType="solid"
                xAxisColor="#E5E7EB"
                yAxisColor="#E5E7EB"
                yAxisThickness={0}
                xAxisThickness={1}
                maxValue={maxValue}
                noOfSections={3}
                yAxisLabelWidth={0}
                xAxisLabelTextStyle={{ fontSize: RFValue(11), color: "#444" }}
                yAxisTextStyle={{ fontSize: RFValue(11), color: "#666" }}
                showVerticalLines={false}
              />
            ) : (
              <View style={{ height: hp('15%'), justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: RFValue(12), color: "#999" }}>No data available</Text>
              </View>
            )}
            
            
              
            
           
          </View>
        </View>

        {/* ---------- FOOTER ---------- */}
        <View
          style={{
            marginTop: hp('1.7%'),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
<Text style={{ color: "#111", fontSize: RFValue(12), fontWeight: "600" }}>
          Goal: <Text style={{ color: "#111", fontWeight: "400" }}>
            {goal}
          </Text>
        </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#4B3AAC",
              paddingVertical: hp('1%'),
              paddingHorizontal: wp('5%'),
              borderRadius: wp('8%'),
            }}
            onPress={() => {router.push(  '/screen1/profile/saveweight')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log fasting
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "#111", fontWeight: "400", fontSize: RFValue(12) }}>
            1.4/week
          </Text>
        </View>
      </View>
    </View>
  );
}