import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

interface ChartDataPoint {
  value: number;
  label: string;
}

export default function Ketonchart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAverage, setApiAverage] = useState<number | null>(null);
  const router = useRouter();

  // Format date to ISO format (YYYY-MM-DD)
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate date range based on currentWeekOffset
  const getMonthName = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[startDate.getMonth()];
  };

  const monthName = getMonthName();

  // Fetch ketone chart data from API
  const fetchKetoneChartData = useCallback(async () => {
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

      console.log('[Ketonchart] Fetching ketone chart data:', { sDate, eDate, trend: 'weekly' });

      // Fetch ketone chart data from API
      const response = await wellnessApi.getKetoneChart({
        sDate,
        eDate,
        trend: 'weekly',
      });

      console.log('[Ketonchart] API response:', JSON.stringify(response, null, 2));

      // Transform API response to chart data format
      let dataList: any[] = [];
      let responseAverage: number | null = null;
      
      // Handle different possible response structures
      if (response) {
        if (response.data) {
          if (Array.isArray(response.data.levels)) {
            dataList = response.data.levels;
          } else if (Array.isArray(response.data.ketone)) {
            dataList = response.data.ketone;
          } else if (Array.isArray(response.data.list)) {
            dataList = response.data.list;
          } else if (Array.isArray(response.data)) {
            dataList = response.data;
          }
          
          if (response.data.average !== undefined) responseAverage = response.data.average;
        }
        
        if (dataList.length === 0 && response.result) {
          if (Array.isArray(response.result.list)) {
            dataList = response.result.list;
          } else if (Array.isArray(response.result)) {
            dataList = response.result;
          }
          if (response.result.average !== undefined) responseAverage = response.result.average;
        }
        
        if (dataList.length === 0 && Array.isArray(response.list)) {
          dataList = response.list;
        }
        
        if (dataList.length === 0 && Array.isArray(response)) {
          dataList = response;
        }
        
        if (dataList.length === 0 && Array.isArray(response.ketone)) {
          dataList = response.ketone;
        }
        
        if (responseAverage === null && response.average !== undefined) {
          responseAverage = response.average;
        }
      }
      
      console.log('[Ketonchart] Extracted dataList:', dataList.length, 'items');

      // Get API's startDate and endDate if available (more accurate than our calculation)
      let apiStartDate = startDate;
      let apiEndDate = endDate;
      if (response?.data?.startDate) {
        apiStartDate = new Date(response.data.startDate);
        console.log('[Ketonchart] Using API startDate:', response.data.startDate);
      }
      if (response?.data?.endDate) {
        apiEndDate = new Date(response.data.endDate);
        console.log('[Ketonchart] Using API endDate:', response.data.endDate);
      }

      // Transform data points to chart format
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Create a map of day numbers to dates for the week
      // API returns day numbers like "23", "24", "30", "01"
      const weekDatesByDayNumber: { [key: string]: Date } = {};
      const weekDatesByFullDate: { [key: string]: Date } = {};
      const weekDateStrings: string[] = [];
      
      // Build date map for the week (7 days)
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(apiStartDate);
        dayDate.setDate(apiStartDate.getDate() + i);
        const fullDate = formatDateToISO(dayDate);
        const dayNumber = String(dayDate.getDate()).padStart(2, '0');
        
        // Map by day number (e.g., "23", "24")
        weekDatesByDayNumber[dayNumber] = dayDate;
        // Also map by full date for fallback
        weekDatesByFullDate[fullDate] = dayDate;
        weekDateStrings.push(fullDate);
        
        console.log(`[Ketonchart] Week day ${i}: dayNumber=${dayNumber}, fullDate=${fullDate}`);
      }
      
      // Transform API data to chart format
      const transformedDataMap: { [key: string]: ChartDataPoint } = {};
      
      dataList.forEach((item: any, index: number) => {
        // API returns date as day number string (e.g., "23", "24", "30", "01")
        const dateDay = item.date || item.dateString || item.day;
        const fullDateStr = item.fullDate || item.dateFull || item.dateISO;
        const value = item.level !== undefined ? item.level : 
                     (item.ketone !== undefined ? item.ketone : 
                     (item.value !== undefined ? item.value : 0));

        console.log(`[Ketonchart] Processing item ${index}:`, {
          dateDay,
          fullDateStr,
          value,
          rawItem: item
        });

        let matchedDate: Date | null = null;

        // First try to match by full date if available
        if (fullDateStr && weekDatesByFullDate[fullDateStr]) {
          matchedDate = weekDatesByFullDate[fullDateStr];
          console.log(`[Ketonchart] Matched by full date: ${fullDateStr}`);
        }
        // Then try to match by day number (API's primary format)
        else if (dateDay) {
          const dayNumber = String(dateDay).padStart(2, '0');
          matchedDate = weekDatesByDayNumber[dayNumber] || null;
          if (matchedDate) {
            console.log(`[Ketonchart] Matched by day number: ${dayNumber}`);
          } else {
            console.log(`[Ketonchart] Day number ${dayNumber} not found in week range`);
          }
        }

        // Only process if we found a matching date
        if (matchedDate) {
          const day = matchedDate.getDate();
          const month = matchedDate.getMonth();
          const label = `${day} ${monthNames[month]}`;
          
          const ketoneValue = Number(value) || 0;
          
          console.log(`[Ketonchart] Mapped to chart: label=${label}, value=${ketoneValue}`);
          
          // Store the value - if multiple values for same date, use the latest/highest one
          if (!transformedDataMap[label] || ketoneValue > transformedDataMap[label].value) {
            transformedDataMap[label] = {
              value: ketoneValue,
              label: label,
            };
          }
        } else {
          console.log(`[Ketonchart] Skipping item ${index} - could not match date ${dateDay}`);
        }
      });

      // Create final data array with all 7 days using API's date range
      const filledData: ChartDataPoint[] = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(apiStartDate);
        dayDate.setDate(apiStartDate.getDate() + i);
        const day = dayDate.getDate();
        const month = dayDate.getMonth();
        const label = `${day} ${monthNames[month]}`;
        
        if (transformedDataMap[label]) {
          filledData.push(transformedDataMap[label]);
          console.log(`[Ketonchart] Day ${i} (${label}): Value = ${transformedDataMap[label].value}`);
        } else {
          filledData.push({
            value: 0,
            label: label,
          });
          console.log(`[Ketonchart] Day ${i} (${label}): No data, using 0`);
        }
      }
      
      console.log('[Ketonchart] Final chart data:', JSON.stringify(filledData, null, 2));
      
      setData(filledData);
      
      // Store average in state
      if (responseAverage !== null) {
        setApiAverage(responseAverage);
      } else {
        // Calculate average from data if API doesn't provide it
        const nonZeroValues = filledData.filter(d => d.value > 0).map(d => d.value);
        if (nonZeroValues.length > 0) {
          const calculatedAverage = nonZeroValues.reduce((sum, val) => sum + val, 0) / nonZeroValues.length;
          setApiAverage(calculatedAverage);
        } else {
          setApiAverage(null);
        }
      }
    } catch (error: any) {
      console.error('[Ketonchart] Error fetching ketone chart data:', error);
      // On error, set empty data
      setData([]);
      setApiAverage(null);
    } finally {
      setLoading(false);
    }
  }, [currentWeekOffset]);

  // Fetch data when component mounts or week offset changes
  useFocusEffect(
    useCallback(() => {
      fetchKetoneChartData();
    }, [fetchKetoneChartData])
  );

  // Calculate average display
  const average = apiAverage !== null 
    ? apiAverage 
    : (data.length > 0 ? data.reduce((sum, item) => sum + item.value, 0) / data.length : 0);
  const averageDisplay = `${average.toFixed(1)} mmol/L`;

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
            {/* Date Range */}
            <Text style={{ fontSize: RFValue(10), color: "#444", fontWeight: "600" }}>
              {monthName}
            </Text>
          </View>
        </View>

        {/* ---------- BAR CHART ---------- */}
        <View style={{ position: "relative", flexDirection: "row" }}>
          {/* Custom Y-axis labels */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: hp('20%') }}>
              <ActivityIndicator size="small" color="#4B3AAC" />
            </View>
          ) : (
            <>
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
                  const maxValue = Math.max(...data.map(d => d.value), 1);
                  const step = maxValue / 3;
                  return [maxValue, maxValue * 2/3, maxValue * 1/3, 0].map((label, idx) => (
                    <Text
                      key={idx}
                      style={{
                        fontSize: RFValue(11),
                        color: "#666",
                        textAlign: "right",
                      }}
                    >
                      {label.toFixed(1)}
                    </Text>
                  ));
                })()}
              </View>

              <View style={{ flex: 1, position: "relative" }}>
                <BarChart
                  data={data.map((item) => {
                    const baseItem: any = {
                      value: item.value,
                      label: item.label,
                      frontColor: "#FF3D8A",
                    };
                    return baseItem;
                  })}
                  width={wp('65%')}
                  height={hp('20%')}
                  barWidth={wp('3.5%')}
                  spacing={wp('9.5%')}
                  barBorderRadius={wp('2%')}    
                  roundedBottom={false}
                  yAxisThickness={0}
                  yAxisColor="#E5E7EB"
                  maxValue={Math.max(...data.map(d => d.value), 1) || 1}
                  noOfSections={3}
                  yAxisLabelWidth={0}
                  hideRules={false}
                  rulesColor="#E5E7EB"
                  rulesType="solid"
                  initialSpacing={wp('2.5%')}
                  xAxisLabelTextStyle={{ fontSize: RFValue(11), color: "#444" }}
                />
              </View>
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
            onPress={()=> {router.push('/screen1/profile/logketons')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log Ketones
            </Text>
          </TouchableOpacity>
       
        </View>
      </View>
    </View>
  );
}