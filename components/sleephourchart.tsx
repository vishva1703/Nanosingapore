import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

// Format date for API (YYYY-MM-DD)
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for display (e.g., "16 Nov")
const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Format decimal hours to hours and minutes (e.g., 8.5 -> "8h 30m")
const formatHoursToHoursMinutes = (decimalHours: number): string => {
  // Handle NaN, null, undefined, or invalid values
  if (!decimalHours || isNaN(decimalHours) || !isFinite(decimalHours)) {
    return '0h 0m';
  }
  
  if (decimalHours === 0) return '0h 0m';
  
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

export default function SleepHourChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [data, setData] = useState<Array<{ value: number; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(0);
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

  /**
   * Fetch sleep chart data from the API
   */
  const fetchSleepChartData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('========================================');
      console.log('[SleepHourChart] 🔄 STARTING FETCH...');
      console.log('Current week offset:', currentWeekOffset);
      
      // Calculate week start and end dates based on currentWeekOffset
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week

      const sDate = formatDate(startDate);
      const eDate = formatDate(endDate);

      console.log('[SleepHourChart] 📅 Date range:', { 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sDate, 
        eDate, 
        trend: 'weekly' 
      });

      // Fetch sleep chart data from API
      console.log('[SleepHourChart] 📤 Calling wellnessApi.getSleepChart...');
      const response = await wellnessApi.getSleepChart({
        sDate,
        eDate,
        trend: 'weekly',
      });
      console.log('[SleepHourChart] ✅ API call completed');

      console.log('[SleepHourChart] Sleep chart API response:', JSON.stringify(response, null, 2));
      console.log('[SleepHourChart] Response type:', typeof response);
      console.log('[SleepHourChart] Response keys:', response ? Object.keys(response) : 'null');

      // Transform API response to chart data format
      // API might return: { data: { hours: [{ date: "23", hours: 8.5 }, ...], average: 7.2 } }
      // Or similar to activity chart: { data: { sleep: [{ date: "23", hours: 8.5 }, ...] } }
      let sleepData: any[] = [];
      let responseAverage = null;
      
      // Handle different possible response structures (similar to activity chart pattern)
      if (response) {
        // Pattern 1: response.data.hours, response.data.sleep, response.data.list, etc.
        if (response.data) {
          if (Array.isArray(response.data.hours)) {
            sleepData = response.data.hours;
            console.log('[SleepHourChart] Found data in response.data.hours');
          } else if (Array.isArray(response.data.sleep)) {
            sleepData = response.data.sleep;
            console.log('[SleepHourChart] Found data in response.data.sleep');
          } else if (Array.isArray(response.data.list)) {
            sleepData = response.data.list;
            console.log('[SleepHourChart] Found data in response.data.list');
          } else if (response.data.data && Array.isArray(response.data.data.hours)) {
            sleepData = response.data.data.hours;
            console.log('[SleepHourChart] Found data in response.data.data.hours');
          } else if (response.data.data && Array.isArray(response.data.data.list)) {
            sleepData = response.data.data.list;
            console.log('[SleepHourChart] Found data in response.data.data.list');
          } else if (Array.isArray(response.data)) {
            sleepData = response.data;
            console.log('[SleepHourChart] Found data array directly in response.data');
          }
          
          if (response.data.average !== undefined) responseAverage = response.data.average;
        }
        
        // Pattern 2: response.result.hours, response.result.sleep, etc.
        if (sleepData.length === 0 && response.result) {
          if (Array.isArray(response.result.hours)) {
            sleepData = response.result.hours;
            console.log('[SleepHourChart] Found data in response.result.hours');
          } else if (Array.isArray(response.result.sleep)) {
            sleepData = response.result.sleep;
            console.log('[SleepHourChart] Found data in response.result.sleep');
          } else if (Array.isArray(response.result.list)) {
            sleepData = response.result.list;
            console.log('[SleepHourChart] Found data in response.result.list');
          } else if (response.result.data && Array.isArray(response.result.data.hours)) {
            sleepData = response.result.data.hours;
            console.log('[SleepHourChart] Found data in response.result.data.hours');
          } else if (Array.isArray(response.result)) {
            sleepData = response.result;
            console.log('[SleepHourChart] Found data array directly in response.result');
          }
          
          if (response.result.average !== undefined) responseAverage = response.result.average;
        }
        
        // Pattern 3: response.hours, response.sleep, response.list (direct)
        if (sleepData.length === 0) {
          if (Array.isArray(response.hours)) {
            sleepData = response.hours;
            console.log('[SleepHourChart] Found data in response.hours');
          } else if (Array.isArray(response.sleep)) {
            sleepData = response.sleep;
            console.log('[SleepHourChart] Found data in response.sleep');
          } else if (Array.isArray(response.list)) {
            sleepData = response.list;
            console.log('[SleepHourChart] Found data in response.list');
          }
        }
        
        // Pattern 4: response is directly an array
        if (sleepData.length === 0 && Array.isArray(response)) {
          sleepData = response;
          console.log('[SleepHourChart] Response is directly an array');
        }
        
        // Extract average from top level if not found yet
        if (responseAverage === null && response.average !== undefined) {
          responseAverage = response.average;
          console.log('[SleepHourChart] Found average at top level');
        }
      }

      console.log('[SleepHourChart] Extracted sleep data:', sleepData.length, 'items');
      console.log('[SleepHourChart] Sample data:', sleepData.slice(0, 2));
      console.log('[SleepHourChart] Average:', responseAverage);

      // Get the actual start date from API response if available
      let apiStartDate = startDate;
      if (response?.data?.startDate) {
        apiStartDate = new Date(response.data.startDate);
        console.log('[SleepHourChart] Using API startDate:', response.data.startDate);
      }

      // Transform data to chart format
      // API format: [{ date: "23", hours: 8.5 }, ...] or [{ date: "2024-11-23", hours: 8.5 }, ...]
      // Or similar to activity: [{ date: "23", value: 8.5 }, ...]
      const chartData = sleepData.map((item: any, index: number) => {
        let date: Date;
        
        if (item.date) {
          if (item.date.length <= 2) {
            // Day number only (e.g., "23", "24")
            date = new Date(apiStartDate);
            // The array is ordered, so index 0 = first day of week
            date.setDate(apiStartDate.getDate() + index);
          } else {
            // Full date string
            date = new Date(item.date);
          }
        } else if (item.startTime || item.fellAsleep) {
          // If date is not provided, try to get from startTime or fellAsleep
          const dateStr = item.startTime || item.fellAsleep;
          date = new Date(dateStr);
        } else {
          // Fallback: use index to calculate date from week start
          date = new Date(apiStartDate);
          date.setDate(apiStartDate.getDate() + index);
        }
        
        // Try multiple field names for hours
        const hours = item.hours || item.value || item.sleepHours || item.hour || 0;
        
        return {
          value: hours,
          label: formatDateForDisplay(date),
        };
      });

      // If no data, create empty data for the week
      if (chartData.length === 0) {
        const weekData = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          weekData.push({
            value: 0,
            label: formatDateForDisplay(date),
          });
        }
        setData(weekData);
        setAverage(0);
      } else {
        setData(chartData);
        
        // Calculate average from data or use API average
        if (responseAverage !== null && responseAverage !== undefined && !isNaN(responseAverage) && isFinite(responseAverage)) {
          setAverage(responseAverage);
        } else {
          const sum = chartData.reduce((sum, item) => {
            const value = item.value || 0;
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          const calculatedAvg = chartData.length > 0 ? sum / chartData.length : 0;
          setAverage(isNaN(calculatedAvg) || !isFinite(calculatedAvg) ? 0 : calculatedAvg);
        }
      }
    } catch (error: any) {
      console.error('========================================');
      console.error('[SleepHourChart] ❌ ERROR FETCHING SLEEP CHART DATA:');
      console.error('Error Type:', error?.constructor?.name || typeof error);
      console.error('Error Message:', error?.message);
      console.error('Error Response:', error?.response?.data);
      console.error('Error Status:', error?.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('========================================');
      
      // On error, show empty data for the week
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7));
      const weekData = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        weekData.push({
          value: 0,
          label: formatDateForDisplay(date),
        });
      }
      setData(weekData);
      setAverage(0);
    } finally {
      setLoading(false);
    }
  }, [currentWeekOffset]);

  // Fetch data when component mounts or week offset changes
  useEffect(() => {
    fetchSleepChartData();
  }, [fetchSleepChartData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSleepChartData();
    }, [fetchSleepChartData])
  );

  // Format average as hours and minutes using the same function for consistency
  const averageDisplay = formatHoursToHoursMinutes(average);

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
            {[10, 8, 6, 4].map((label) => (
              <Text
                key={label}
                style={{
                  fontSize: RFValue(11),
                  color: "#666",
                  textAlign: "right",
                }}
              >
                {formatHoursToHoursMinutes(label)}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1, position: "relative" }}>
            {loading ? (
              <View style={{ height: hp('14%'), justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#FB9E24" />
              </View>
            ) : (
              <LineChart
                data={data.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                width={wp('70%')}
                height={hp('14%')}
                spacing={wp('12%')}
                initialSpacing={wp('3%')}
                endSpacing={wp('3%')}
                color="#FB9E24"
                thickness={3}
                dataPointsColor="#FB9E24"
                dataPointsRadius={4}
                dataPointsWidth={2}
                curved
                areaChart
                startFillColor="#FB9E24"
                endFillColor="#FB9E24"
                startOpacity={0.3}
                endOpacity={0}
                hideRules={false}
                rulesColor="#E5E7EB"
                rulesType="solid"
                xAxisColor="#E5E7EB"
                yAxisColor="#E5E7EB"
                yAxisThickness={0}
                xAxisThickness={1}
                maxValue={data.length > 0 ? Math.max(...data.map(d => d.value), 12) : 12}
                noOfSections={3}
                yAxisLabelWidth={0}
                xAxisLabelTextStyle={{ fontSize: RFValue(10), color: "#444", textAlign: 'center', width: wp('12%') }}
                yAxisTextStyle={{ fontSize: RFValue(11), color: "#666" }}
                showVerticalLines={false}
                // Format Y-axis labels to show hours and minutes
                formatYLabel={(value) => {
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  return formatHoursToHoursMinutes(numValue);
                }}
              />
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

          <TouchableOpacity
            style={{
              backgroundColor: "#4B3AAC",
              paddingVertical: hp('1%'),
              paddingHorizontal: wp('5%'),
              borderRadius: wp('8%'),
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: wp('30%'),
            }}
            onPress={()=> router.push('/screen1/profile/logsleep')}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log Sleep
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