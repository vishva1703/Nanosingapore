import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

interface ChartDataPoint {
  value: number;
  label: string;
}

export default function CalorieIntakeChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMaxValue, setChartMaxValue] = useState<number>(4000);
  const [apiAverage, setApiAverage] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Format date to ISO format (YYYY-MM-DD)
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate month name based on currentWeekOffset
  const getMonthName = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[startDate.getMonth()];
  };

  const monthName = getMonthName();

  // Fetch calorie chart data from API
  const fetchCalorieChartData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate week start and end dates based on currentWeekOffset
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week (7 days ago from today)
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week

      const sDate = formatDateToISO(startDate);
      const eDate = formatDateToISO(endDate);

      console.log('[CalorieIntakeChart] Fetching calorie chart data:', { sDate, eDate, trend: 'weekly' });

      // Fetch calorie chart data from API
      const response = await wellnessApi.getCalorieChart({
        sDate,
        eDate,
        trend: 'weekly',
      });

      console.log('[CalorieIntakeChart] API response:', JSON.stringify(response, null, 2));

      // Transform API response to chart data format
      let dataList: any[] = [];
      let responseAverage: number | null = null;
      let apiChartMax: number | null = null;
      
      // Handle different possible response structures
      if (response) {
        // Pattern 1: response.data.cal (actual API response structure)
        if (response.data) {
          if (Array.isArray(response.data.cal)) {
            dataList = response.data.cal;
            console.log('[CalorieIntakeChart] Found data in response.data.cal');
          } else if (Array.isArray(response.data.list)) {
            dataList = response.data.list;
            console.log('[CalorieIntakeChart] Found data in response.data.list');
          } else if (response.data.data && Array.isArray(response.data.data.list)) {
            dataList = response.data.data.list;
            console.log('[CalorieIntakeChart] Found data in response.data.data.list');
          } else if (Array.isArray(response.data)) {
            dataList = response.data;
            console.log('[CalorieIntakeChart] Found data array directly in response.data');
          }
          
          if (response.data.average !== undefined) responseAverage = response.data.average;
          if (response.data.yAxisTicks?.max !== undefined) apiChartMax = response.data.yAxisTicks.max;
        }
        
        // Pattern 2: response.result.list
        if (dataList.length === 0 && response.result) {
          if (Array.isArray(response.result.list)) {
            dataList = response.result.list;
            console.log('[CalorieIntakeChart] Found data in response.result.list');
          } else if (Array.isArray(response.result)) {
            dataList = response.result;
            console.log('[CalorieIntakeChart] Found data array directly in response.result');
          }
          
          if (response.result.average !== undefined) responseAverage = response.result.average;
        }
        
        // Pattern 3: response.list (direct array)
        if (dataList.length === 0 && Array.isArray(response.list)) {
          dataList = response.list;
          console.log('[CalorieIntakeChart] Found data in response.list');
        }
        
        // Pattern 4: response is directly an array
        if (dataList.length === 0 && Array.isArray(response)) {
          dataList = response;
          console.log('[CalorieIntakeChart] Response is directly an array');
        }
        
        // Pattern 5: response.calories array
        if (dataList.length === 0 && Array.isArray(response.calories)) {
          dataList = response.calories;
          console.log('[CalorieIntakeChart] Found data in response.calories');
        }
        
        // Extract average from top level if not found yet
        if (responseAverage === null && response.average !== undefined) {
          responseAverage = response.average;
        }
      }
      
      console.log('[CalorieIntakeChart] Extracted dataList:', dataList.length, 'items');
      console.log('[CalorieIntakeChart] Response average:', responseAverage);
      console.log('[CalorieIntakeChart] Chart max value:', apiChartMax);
      
      // Transform data points to chart format
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Create a map of day numbers to actual dates for the week
      const weekDates: { [key: string]: Date } = {};
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        const dayNum = String(dayDate.getDate()).padStart(2, '0');
        weekDates[dayNum] = dayDate;
      }
      
      // Transform API data to chart format
      const transformedDataMap: { [key: string]: ChartDataPoint } = {};
      
      dataList.forEach((item: any, index: number) => {
        // Extract date - API returns day number as string (e.g., "30", "01")
        const dateDay = item.date || item.dateString || item.day;
        
        // Extract calories value - API uses "cal" field
        const value = item.cal !== undefined ? item.cal : 
                     (item.calories !== undefined ? item.calories : 
                     (item.totalCalories !== undefined ? item.totalCalories : 
                     (item.calorieIntake !== undefined ? item.calorieIntake :
                     (item.value !== undefined ? item.value : 0))));

        // Match the day number with the actual date in the week
        let matchedDate: Date | null = null;
        if (dateDay) {
          const dayNum = String(dateDay).padStart(2, '0');
          matchedDate = weekDates[dayNum] || null;
        }
        
        // If no match found, use index-based date
        if (!matchedDate) {
          matchedDate = new Date(startDate);
          matchedDate.setDate(startDate.getDate() + index);
        }

        const day = matchedDate.getDate();
        const month = matchedDate.getMonth();
        const label = `${day} ${monthNames[month]}`;
        
        transformedDataMap[label] = {
          value: Number(value) || 0,
          label: label,
        };
      });

      // Create final data array with all 7 days
      const filledData: ChartDataPoint[] = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        const day = dayDate.getDate();
        const month = dayDate.getMonth();
        const label = `${day} ${monthNames[month]}`;
        
        if (transformedDataMap[label]) {
          filledData.push(transformedDataMap[label]);
        } else {
          filledData.push({
            value: 0,
            label: label,
          });
        }
      }
      
      setData(filledData);
      
      // Store chart max value and average in state
      if (apiChartMax !== null) {
        setChartMaxValue(apiChartMax);
      } else {
        // Calculate from data if not provided by API
        const maxValue = filledData.length > 0 
          ? Math.max(...filledData.map(d => d.value), 0) 
          : 4000;
        setChartMaxValue(Math.max(4000, Math.ceil(maxValue / 1000) * 1000));
      }
      
      if (responseAverage !== null) {
        setApiAverage(responseAverage);
      } else {
        setApiAverage(null);
      }
    } catch (error: any) {
      console.error('[CalorieIntakeChart] Error fetching calorie chart data:', error);
      // On error, show placeholder data
      const today = new Date();
      const errorStartDate = new Date(today);
      errorStartDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7));
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const placeholderData: ChartDataPoint[] = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(errorStartDate);
        dayDate.setDate(errorStartDate.getDate() + i);
        placeholderData.push({
          value: 0,
          label: `${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}`,
        });
      }
      setData(placeholderData);
      setChartMaxValue(4000);
      setApiAverage(null);
    } finally {
      setLoading(false);
    }
  }, [currentWeekOffset]);

  // Fetch data when component mounts or week offset changes
  useEffect(() => {
    fetchCalorieChartData();
  }, [fetchCalorieChartData]);

  // Refresh data when screen comes into focus (after logging calories)
  useFocusEffect(
    useCallback(() => {
      fetchCalorieChartData();
    }, [fetchCalorieChartData])
  );

  // Calculate average from data (use API average if available, otherwise calculate)
  const average = apiAverage !== null
    ? apiAverage
    : (data.length > 0 
        ? data.reduce((sum, item) => sum + item.value, 0) / data.length 
        : 0);
  
  // Format average as calories
  const averageDisplay = `${Math.round(average)} cal`;

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

        {/* ---------- CHART SECTION ---------- */}
        <View style={{ position: "relative", flexDirection: "row" }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: hp('18%') }}>
              <ActivityIndicator size="small" color="#4B3AAC" />
            </View>
          ) : (
            <>
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
                {(() => {
                  const step = chartMaxValue / 4;
                  return [chartMaxValue, chartMaxValue - step, chartMaxValue - step * 2, chartMaxValue - step * 3].map((label) => (
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
                  ));
                })()}
              </View>

              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingRight: wp('3%') }}
                scrollEventThrottle={16}
              >
                {/* Combined Bar Chart and Line Chart */}
                <View style={{ 
                  width: data.length * wp('15%'), 
                  height: hp('18%'),
                  position: 'relative'
                }}>
                  {/* Bar Chart - Background with x-axis labels */}
                  <View style={{ 
                    position: "absolute", 
                    width: '100%', 
                    height: hp('14%'),
                    zIndex: 1
                  }}>
                    <BarChart
                      data={data}
                      roundedTop={true}
                      roundedBottom={true}
                      width={data.length * wp('15%')}
                      height={hp('14%')}
                      spacing={wp('8%')}
                      initialSpacing={wp('3%')}
                      endSpacing={wp('3%')}
                      barWidth={wp('8%')}
                      noOfSections={3}
                      maxValue={chartMaxValue}
                      yAxisThickness={0}
                      xAxisThickness={1}
                      yAxisLabelWidth={0}
                      hideRules={false}
                      frontColor="rgba(75, 58, 172, 0.15)"
                      isAnimated={true}
                      hideYAxisText={true}
                      xAxisLabelTextStyle={{ 
                        fontSize: RFValue(10), 
                        color: "#444", 
                        textAlign: 'center',
                      }}
                      showVerticalLines={false}
                      rulesColor="#E5E7EB"
                      rulesType="solid"
                      hideOrigin={true}
                    />
                  </View>

                  {/* Line Chart - Foreground (on top) */}
                  <View style={{ 
                    position: "absolute", 
                    width: '100%', 
                    height: hp('14%'),
                    zIndex: 2
                  }}>
                    <LineChart
                      data={data}
                      width={data.length * wp('15%')}
                      height={hp('14%')}
                      spacing={wp('8%')}
                      initialSpacing={wp('3%')}
                      endSpacing={wp('3%')}
                      color="#FF0000"
                      thickness={3}
                      dataPointsColor="#FF0000"
                      dataPointsRadius={5}
                      dataPointsWidth={3}
                      curved={true}
                      hideRules={true}
                      rulesColor="transparent"
                      xAxisColor="transparent"
                      yAxisColor="transparent"
                      yAxisThickness={0}
                      xAxisThickness={0}
                      maxValue={chartMaxValue}
                      noOfSections={3}
                      yAxisLabelWidth={0}
                      xAxisLabelTextStyle={{ 
                        fontSize: 1, // Completely hide x-axis labels for line chart
                        color: "transparent",
                      }}
                      yAxisTextStyle={{ fontSize: 1, color: "transparent" }}
                      showVerticalLines={false}
                      rotateLabel={false}
                      hideDataPoints={false}
                      focusEnabled={false}
                      showStripOnFocus={false}
                      adjustToWidth={true}
                      areaChart={false}
                      startFillColor="transparent"
                      endFillColor="transparent"
                      startOpacity={1}
                      endOpacity={1}
                      pointerConfig={{
                        pointerStripHeight: 0,
                        pointerStripWidth: 0,
                        pointerColor: 'transparent',
                      }}
                    />
                  </View>
                </View>
              </ScrollView>
            </>
          )}
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
            onPress={() => {router.push('/screen1/profile/logcalories')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log Calories
            </Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </View>
  );
}