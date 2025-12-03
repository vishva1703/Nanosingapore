import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
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

// Format minutes to hours and minutes (e.g., 1581 minutes -> "26h 21m")
const formatMinutesToHoursMinutes = (totalMinutes: number): string => {
  if (totalMinutes === 0) return "0m";
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

export default function ActiveMinutesChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [data, setData] = useState<Array<{ value: number; label: string; goal?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(0);
  const router = useRouter();
  // Generate year based on currentWeekOffset
  const getYear = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week
    return startDate.getFullYear();
  };

  const year = getYear();

  /**
   * Fetch activity chart data from the API
   */
  const fetchActivityChartData = useCallback(async () => {
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

      console.log('[ActiveMinutesChart] Fetching activity chart data:', { sDate, eDate, trend: 'weekly' });

      // Fetch activity chart data from API
      const response = await wellnessApi.getActivityChart({
        sDate,
        eDate,
        trend: 'weekly',
      });

      console.log('[ActiveMinutesChart] Activity chart API response:', JSON.stringify(response, null, 2));

      // Transform API response to chart data format
      // API returns: { data: { min: [{ date: "23", min: 0 }, ...], average: 1581 } }
      let minutesData: any[] = [];
      let responseAverage = null;
      let responseGoal = null;
      
      // Handle the actual API response structure
      if (response) {
        // Primary pattern: response.data.min (aggregated minutes per day)
        if (response.data) {
          if (Array.isArray(response.data.min)) {
            minutesData = response.data.min;
            console.log('[ActiveMinutesChart] Found data in response.data.min');
          } else if (response.data.data && Array.isArray(response.data.data.min)) {
            minutesData = response.data.data.min;
            console.log('[ActiveMinutesChart] Found data in response.data.data.min');
          } else if (Array.isArray(response.data.list)) {
            minutesData = response.data.list;
            console.log('[ActiveMinutesChart] Found data in response.data.list');
          } else if (Array.isArray(response.data)) {
            minutesData = response.data;
            console.log('[ActiveMinutesChart] Found data array in response.data');
          }
          
          if (response.data.average !== undefined) responseAverage = response.data.average;
          if (response.data.goal !== undefined) responseGoal = response.data.goal;
        }
        
        // Fallback patterns
        if (minutesData.length === 0 && response.result) {
          if (Array.isArray(response.result.min)) {
            minutesData = response.result.min;
          } else if (Array.isArray(response.result.list)) {
            minutesData = response.result.list;
          } else if (Array.isArray(response.result)) {
            minutesData = response.result;
          }
          
          if (response.result.average !== undefined) responseAverage = response.result.average;
          if (response.result.goal !== undefined) responseGoal = response.result.goal;
        }
        
        if (minutesData.length === 0 && Array.isArray(response.list)) {
          minutesData = response.list;
        }
        
        if (minutesData.length === 0 && Array.isArray(response)) {
          minutesData = response;
        }
        
        // Extract average and goal from top level if not found yet
        if (responseAverage === null && response.average !== undefined) {
          responseAverage = response.average;
        }
        if (responseGoal === null && response.goal !== undefined) {
          responseGoal = response.goal;
        }
      }

      console.log('[ActiveMinutesChart] Extracted minutes data:', minutesData);
      console.log('[ActiveMinutesChart] Average:', responseAverage);
      console.log('[ActiveMinutesChart] Goal:', responseGoal);

      // Get the actual start date from API response if available
      let apiStartDate = startDate;
      if (response?.data?.startDate) {
        apiStartDate = new Date(response.data.startDate);
        console.log('[ActiveMinutesChart] Using API startDate:', response.data.startDate);
      }

      // Transform data to chart format
      // API format: [{ date: "23", min: 0 }, { date: "24", min: 7260 }, ...]
      // The date field is just the day number, we need to map it to actual dates
      const chartData = minutesData.map((item: any, index: number) => {
        let date: Date;
        
        if (item.date) {
          // If date is just a day number (e.g., "23", "24")
          if (item.date.length <= 2) {
            const dayNum = parseInt(item.date, 10);
            if (!isNaN(dayNum)) {
              // Use the API's startDate to construct the full date
              date = new Date(apiStartDate);
              // Find which day of the week this corresponds to
              // The min array is ordered, so index 0 = first day of week
              date.setDate(apiStartDate.getDate() + index);
            } else {
              date = new Date(apiStartDate);
              date.setDate(apiStartDate.getDate() + index);
            }
          } else {
            // Full date string
            date = new Date(item.date);
          }
        } else {
          // Fallback: use index to calculate date from week start
          date = new Date(apiStartDate);
          date.setDate(apiStartDate.getDate() + index);
        }
        
        const minutes = item.min || item.minutes || item.value || item.activeMinutes || 0;
        
        return {
          value: minutes,
          label: formatDateForDisplay(date),
          goal: responseGoal && minutes >= responseGoal,
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
        if (responseAverage !== null && responseAverage !== undefined) {
          setAverage(Math.round(responseAverage));
        } else {
          const calculatedAvg = Math.round(
            chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length
          );
          setAverage(calculatedAvg);
        }
      }
    } catch (error: any) {
      console.error('[ActiveMinutesChart] Error fetching activity chart data:', error);
      // On error, show empty data
      setData([]);
      setAverage(0);
    } finally {
      setLoading(false);
    }
  }, [currentWeekOffset]);

  // Fetch data when component mounts or week offset changes
  useEffect(() => {
    fetchActivityChartData();
  }, [fetchActivityChartData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchActivityChartData();
    }, [fetchActivityChartData])
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
              {formatMinutesToHoursMinutes(average)}
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
            {/* Year */}
            <Text style={{ fontSize: RFValue(10), color: "#444", fontWeight: "600" }}>
              {year}
            </Text>
          </View>
        </View>

        {/* ---------- BAR CHART ---------- */}
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
            {[60, 45, 30, 15].map((label) => (
              <Text
                key={label}
                style={{
                  fontSize: RFValue(11),
                  color: "#666",
                  textAlign: "right",
                }}
              >
                {label}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1, position: "relative" }}>
            {loading ? (
              <View style={{ height: hp('18%'), justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#8D3CFF" />
              </View>
            ) : (
              <BarChart
                data={data.map((item) => {
                  const baseItem: any = {
                    value: item.value,
                    label: item.label,
                    frontColor: "#8D3CFF",
                  };

                  return baseItem;
                })}
                width={wp('70%')}
                height={hp('18%')}
                barWidth={wp('6.5%')}
                spacing={wp('5.5%')}
                barBorderRadius={wp('2%')}
                roundedBottom={false}
                yAxisThickness={0}
                yAxisColor="#E5E7EB"
                maxValue={data.length > 0 ? Math.max(...data.map(d => d.value), 90) : 90}
                noOfSections={3}
                yAxisLabelWidth={0}
                hideRules={false}
                rulesColor="#E5E7EB"
                rulesType="solid"
                initialSpacing={wp('2.5%')}
                xAxisLabelTextStyle={{ fontSize: RFValue(11), color: "#444" }}
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
<Text style={{ color: "#111", fontSize: RFValue(12), fontWeight: "600" }}>
  Goal: <Text style={{ color: "#111", fontWeight: "400" }}>
    {data.length > 0 ? data[data.length - 1].value : 0}m
  </Text>
</Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#4B3AAC",
              paddingVertical: hp('1%'),
              paddingHorizontal: wp('5%'),
              borderRadius: wp('8%'),
            }}
            onPress={()=> {router.push ('/screen1/profile/logactivity')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log activity
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "#111", fontWeight: "400", fontSize: RFValue(12) }}>
            1.4kg/week
          </Text>
        </View>
      </View>
    </View>
  );
}