import wellnessApi from "@/api/wellnessApi";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

interface WeightDataPoint {
  value: number;
  label: string;
  date?: string;
  goal?: boolean;
}

interface WeightChartProps {
  activeTab?: string;
}

export default function WeightChart({ activeTab = "Yearly" }: WeightChartProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<WeightDataPoint[]>([]);
  const [average, setAverage] = useState(0);
  const [trend, setTrend] = useState("+0kg/week");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentUnit, setCurrentUnit] = useState("0kg"); // New state for current unit
  const router = useRouter();
  
  const getDateRange = () => {
    // Use selectedDate as the reference point instead of today
    const referenceDate = new Date(selectedDate);
    let startDate = new Date(referenceDate);
    let endDate = new Date(referenceDate);

    if (activeTab === "Weekly") {
      // Weekly: 7 days period - center the selected date in the week
      const dayOfWeek = referenceDate.getDay(); // 0 = Sunday, 6 = Saturday
      const daysFromStart = dayOfWeek; // Days from start of week
      startDate.setDate(referenceDate.getDate() - daysFromStart + (currentPeriodOffset * 7)); // Start of week
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week
    } else if (activeTab === "Monthly") {
      // Monthly: 7 months period - start from selected month
      startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + (currentPeriodOffset * 7), 1);
      endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 6); // 7 months total (0-6 = 7 months)
    } else if (activeTab === "Yearly") {
      // Yearly: 7 years period - start from selected year
      startDate = new Date(referenceDate.getFullYear() + (currentPeriodOffset * 7), referenceDate.getMonth(), 1);
      endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 6); // 7 years total (0-6 = 7 years)
    }

    const formatDate = (date: Date) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      if (activeTab === "Yearly") {
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
      }
      return ` ${months[date.getMonth()]} ${date.getDate()}`;
    };
   

    return {
      start: formatDate(startDate),
      end: formatDate(endDate),   
      startDate,
      endDate,
    };
  };

  const dateRange = getDateRange();

  // Generate all periods (7 days/months/years) in the range
  const generateAllPeriods = (): WeightDataPoint[] => {
    const periods: WeightDataPoint[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (activeTab === "Weekly") {
      // Generate 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(dateRange.startDate);
        date.setDate(dateRange.startDate.getDate() + i);
        const label = `${date.getDate()} ${months[date.getMonth()]}`;
        periods.push({
          value: 0,
          label,
          date: date.toISOString(),
          goal: false
        });
      }
    } else if (activeTab === "Monthly") {
      // Generate 7 months
      for (let i = 0; i < 7; i++) {
        const date = new Date(dateRange.startDate);
        date.setMonth(dateRange.startDate.getMonth() + i);
        const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
        periods.push({
          value: 0,
          label,
          date: date.toISOString(),
          goal: false
        });
      }
    } else if (activeTab === "Yearly") {
      // Generate 7 years
      for (let i = 0; i < 7; i++) {
        const date = new Date(dateRange.startDate);
        date.setFullYear(dateRange.startDate.getFullYear() + i);
        const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
        periods.push({
          value: 0,
          label,
          date: date.toISOString(),
          goal: false
        });
      }
    }
    
    return periods;
  };

  // Transform API response to chart data format
  const transformApiData = (apiData: any[], startDateStr?: string | null): WeightDataPoint[] => {
    // First, generate all periods (7 days/months/years)
    const allPeriods = generateAllPeriods();
    
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      // Return all periods with 0 values if no API data
      return allPeriods;
    }

    // Create a map to store API data by date
    const dataMap = new Map<string, number>();
    
    // Parse start date if provided (for day-only dates)
    let baseDate: Date | null = null;
    if (startDateStr) {
      try {
        baseDate = new Date(startDateStr);
        console.log('📅 [WeightChart] Base date from API:', baseDate.toISOString());
      } catch (e) {
        console.warn('⚠️ [WeightChart] Could not parse startDate:', startDateStr);
      }
    }
    
    // Process API data and map to periods
    for (const item of apiData) {
      console.log('🔍 [WeightChart] Processing item:', JSON.stringify(item, null, 2));
      
      // Handle different possible API response structures
      const weight = item.weight || 
                   item.value || 
                   item.kg || 
                   item.weight_kg || 
                   item.weightValue ||
                   item.weight?.kg ||
                   item.weight?.value ||
                   (typeof item.weight === 'number' ? item.weight : null) ||
                   item.data?.weight ||
                   item.data?.kg ||
                   0;
      
      let date = item.date || 
                 item.createdAt || 
                 item.timestamp || 
                 item.logDate ||
                 item.created_at ||
                 item.time ||
                 item.log_date ||
                 item.data?.date;
      
      // If date is just a day number (like "23", "24") and we have a base date, construct full date
      if (date && baseDate && typeof date === 'string' && /^\d{1,2}$/.test(date.trim())) {
        const dayNum = parseInt(date.trim(), 10);
        const fullDate = new Date(baseDate);
        fullDate.setDate(dayNum);
        date = fullDate.toISOString();
        console.log('📅 [WeightChart] Constructed full date from day number:', date, 'from day:', dayNum);
      }
      
      const weightNum = Number(weight);
      if (isNaN(weightNum) || weightNum < 0 || !date) {
        continue;
      }
      
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          // Create a key to match the period
          let periodKey: string;
          
          if (activeTab === "Weekly") {
            // For weekly, match by day (YYYY-MM-DD)
            periodKey = dateObj.toISOString().split('T')[0];
          } else if (activeTab === "Monthly") {
            // For monthly, match by year-month (YYYY-MM)
            periodKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth()).padStart(2, '0')}`;
          } else {
            // For yearly, match by year (YYYY)
            periodKey = `${dateObj.getFullYear()}`;
          }
          
          console.log('🔑 [WeightChart] Period key:', periodKey, 'weight:', weightNum);
          
          // Store the weight for this period (keep the maximum if multiple entries)
          const existingWeight = dataMap.get(periodKey) || 0;
          if (weightNum > existingWeight) {
            dataMap.set(periodKey, weightNum);
          }
        }
      } catch (e) {
        console.warn('⚠️ [WeightChart] Error processing date:', date, e);
      }
    }
    
    // Map API data to all periods
    const transformed = allPeriods.map(period => {
      if (!period.date) return period;
      
      try {
        const periodDate = new Date(period.date);
        let periodKey: string;
        
        if (activeTab === "Weekly") {
          // For weekly, match by day (YYYY-MM-DD)
          periodKey = periodDate.toISOString().split('T')[0];
        } else if (activeTab === "Monthly") {
          // For monthly, match by year-month (YYYY-MM)
          periodKey = `${periodDate.getFullYear()}-${String(periodDate.getMonth()).padStart(2, '0')}`;
        } else {
          // For yearly, match by year (YYYY)
          periodKey = `${periodDate.getFullYear()}`;
        }
        
        const weight = dataMap.get(periodKey) || 0;
        if (weight > 0) {
          console.log('✅ [WeightChart] Matched period:', periodKey, 'weight:', weight);
        }
        
        return {
          ...period,
          value: weight
        };
      } catch (e) {
        console.warn('⚠️ [WeightChart] Error mapping period:', period.date, e);
        return period;
      }
    });
    
    console.log('📊 [WeightChart] Transformed periods:', transformed.length);
    console.log('📊 [WeightChart] Data map size:', dataMap.size);
    
    return transformed;
  };

  // Calculate current unit (most recent non-zero weight)
  const calculateCurrentUnit = (data: WeightDataPoint[]): string => {
    if (!data || data.length === 0) return "0kg";
    
    // Find the most recent non-zero weight
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].value > 0) {
        return `${data[i].value}kg`;
      }
    }
    
    return "0kg";
  };

  // Calculate average and trend from data
  const calculateMetrics = (data: WeightDataPoint[], trendType: string = activeTab) => {
    if (data.length === 0) {
      setAverage(0);
      setTrend("+0kg/week");
      setCurrentUnit("0kg");
      return;
    }

    // Calculate average from non-zero values only
    const nonZeroData = data.filter(item => item.value > 0);
    if (nonZeroData.length === 0) {
      setAverage(0);
      setTrend("+0kg/week");
      setCurrentUnit("0kg");
      return;
    }

    // Calculate average
    const sum = nonZeroData.reduce((acc, item) => acc + item.value, 0);
    const avg = sum / nonZeroData.length;
    setAverage(Math.round(avg * 10) / 10);

    // Calculate current unit (most recent non-zero weight)
    setCurrentUnit(calculateCurrentUnit(data));

    // Calculate trend (difference between first and last non-zero values)
    const nonZeroValues = nonZeroData.map(item => item.value);
    if (nonZeroValues.length >= 2) {
      const first = nonZeroValues[0];
      const last = nonZeroValues[nonZeroValues.length - 1];
      const diff = last - first;
      const sign = diff >= 0 ? "+" : "";
      
      // Determine trend unit based on activeTab
      let trendUnit = "/week";
      let trendValue = Math.round(diff * 10) / 10;
      
      if (trendType === "Monthly") {
        trendUnit = "/month";
        // For monthly, show the difference as is (monthly change)
      } else if (trendType === "Yearly") {
        trendUnit = "/year";
        // For yearly, show the difference as is (yearly change)
      } else {
        // For weekly, show weekly change (difference is already for 7 days)
      }
      
      setTrend(`${sign}${trendValue}kg${trendUnit}`);
    } else {
      // Only one data point, no trend
      setTrend("0kg/week");
    }
  };

  // Fetch weight chart data
  const fetchWeightChart = async () => {
    try {
      setLoading(true);
      console.log('🔄 [WeightChart] Fetching weight chart data for trend:', activeTab);
      
      // Map activeTab to API trend parameter
      const trendMap: { [key: string]: string } = {
        "Weekly": "weekly",
        "Monthly": "monthly",
        "Yearly": "yearly"
      };
      
      // Format dates for API
      const formatDateForAPI = (date: Date) => {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };

      const params: any = {
        trend: trendMap[activeTab] || "weekly"
      };

      // Add date range for all trends
      params.sDate = formatDateForAPI(dateRange.startDate);
      params.eDate = formatDateForAPI(dateRange.endDate);

      console.log('📅 [WeightChart] Date range:', {
        trend: params.trend,
        sDate: params.sDate,
        eDate: params.eDate
      });

      const response = await wellnessApi.getWeightChart(params);
      console.log('📥 [WeightChart] API Response:', JSON.stringify(response, null, 2));
      console.log('📥 [WeightChart] Response type:', typeof response);
      console.log('📥 [WeightChart] Is array?', Array.isArray(response));
      console.log('📥 [WeightChart] Response keys:', response ? Object.keys(response) : 'null');

      // Handle different response structures
      let apiData = null;
      let responseAverage = null;
      let startDateStr = null;
      
      // Check for weights array in response (new API structure)
      if (response && response.weights && Array.isArray(response.weights)) {
        apiData = response.weights;
        responseAverage = response.average;
        startDateStr = response.startDate;
        console.log('✅ [WeightChart] Found weights array in response.weights');
        console.log('✅ [WeightChart] Average from API:', responseAverage);
        console.log('✅ [WeightChart] Start date from API:', startDateStr);
      }
      // Check for success/flag structure
      else if (response && (response.success || response.flag !== false) && response.data) {
        if (response.data.weights && Array.isArray(response.data.weights)) {
          apiData = response.data.weights;
          responseAverage = response.data.average;
          startDateStr = response.data.startDate;
          console.log('✅ [WeightChart] Found weights in response.data.weights');
        } else {
          apiData = response.data;
          console.log('✅ [WeightChart] Found data in response.data');
        }
      } else if (response && response.data && Array.isArray(response.data)) {
        apiData = response.data;
        console.log('✅ [WeightChart] Found data array in response.data');
      } else if (response && Array.isArray(response)) {
        apiData = response;
        console.log('✅ [WeightChart] Response is array directly');
      } else if (response && response.result) {
        apiData = response.result;
        console.log('✅ [WeightChart] Found data in response.result');
      } else if (response && typeof response === 'object') {
        // Try to find any array property (prioritize 'weights' if it exists)
        const arrayKeys = Object.keys(response).filter(key => Array.isArray(response[key]));
        if (arrayKeys.length > 0) {
          // Prefer 'weights' array if it exists
          if (arrayKeys.includes('weights')) {
            apiData = response.weights;
            responseAverage = response.average;
            startDateStr = response.startDate;
            console.log('✅ [WeightChart] Found weights array in response object');
          } else {
            apiData = response[arrayKeys[0]];
            console.log('✅ [WeightChart] Found data in response.' + arrayKeys[0]);
          }
        } else {
          apiData = response;
          console.log('✅ [WeightChart] Using entire response object');
        }
      } else {
        apiData = response;
        console.log('✅ [WeightChart] Using response as-is');
      }

      console.log('📊 [WeightChart] Extracted apiData:', apiData);
      console.log('📊 [WeightChart] apiData type:', typeof apiData);
      console.log('📊 [WeightChart] apiData is array?', Array.isArray(apiData));
      console.log('📊 [WeightChart] apiData length:', Array.isArray(apiData) ? apiData.length : 'N/A');

      if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        console.log('📊 [WeightChart] Raw API data sample:', apiData.slice(0, 3));
        const transformedData = transformApiData(apiData, startDateStr);
        console.log('📊 [WeightChart] Transformed data points:', transformedData);
        console.log('📊 [WeightChart] Transformed data length:', transformedData.length);
        console.log('📊 [WeightChart] Sample transformed data:', transformedData.slice(0, 3));
        
        if (transformedData.length > 0) {
          console.log('📊 [WeightChart] First value:', transformedData[0].value, 'Type:', typeof transformedData[0].value);
          console.log('📊 [WeightChart] Last value:', transformedData[transformedData.length - 1].value);
          console.log('📊 [WeightChart] Y-axis range:', yAxisRange);
        }
        
        setChartData(transformedData);
        
        // Use API average if available, otherwise calculate
        if (responseAverage !== null && responseAverage !== undefined) {
          setAverage(responseAverage);
          console.log('✅ [WeightChart] Using average from API:', responseAverage);
        } else {
          calculateMetrics(transformedData, activeTab);
        }
        
        console.log('✅ [WeightChart] Data loaded successfully:', transformedData.length, 'data points');
      } else {
        console.warn('⚠️ [WeightChart] No valid data array received from API');
        console.warn('⚠️ [WeightChart] apiData:', apiData);
        setChartData([]);
        calculateMetrics([], activeTab);
      }
    } catch (error) {
      console.error('❌ [WeightChart] Error fetching weight chart:', error);
      setChartData([]);
      calculateMetrics([], activeTab);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchWeightChart();
  }, [activeTab, currentPeriodOffset, selectedDate]);

  // Reset offset when trend changes
  useEffect(() => {
    setCurrentPeriodOffset(0);
  }, [activeTab]);

  // Reset offset when selected date changes
  useEffect(() => {
    setCurrentPeriodOffset(0);
  }, [selectedDate]);

  const handlePreviousPeriod = () => {
    setCurrentPeriodOffset(currentPeriodOffset - 1);
  };

  const handleNextPeriod = () => {
    setCurrentPeriodOffset(currentPeriodOffset + 1);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        console.log('📅 [WeightChart] Date selected:', date.toISOString().split('T')[0]);
      }
    } else {
      // iOS - date picker stays open, update on change
      if (date) {
        setSelectedDate(date);
        console.log('📅 [WeightChart] Date selected:', date.toISOString().split('T')[0]);
      }
    }
  };

  const formatSelectedDate = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${selectedDate.getDate()} ${months[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`;
  };

  // Calculate dynamic Y-axis range based on data
  const getYAxisRange = () => {
    if (chartData.length === 0) return { min: 60, max: 90 };
    
    const values = chartData.map(item => item.value).filter(v => v > 0);
    if (values.length === 0) return { min: 60, max: 90 };
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.2, 5); // Minimum 5kg padding
    
    return {
      min: Math.max(0, Math.floor(min - padding)),
      max: Math.ceil(max + padding)
    };
  };

  const yAxisRange = getYAxisRange();
  const yAxisLabels = [];
  const step = (yAxisRange.max - yAxisRange.min) / 3;
  for (let i = 3; i >= 0; i--) {
    yAxisLabels.push(Math.round(yAxisRange.min + step * i));
  }

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
              {average}kg
            </Text>
          </View>

          {/* DATE SECTION - RIGHT SIDE */}
          <View style={{ alignItems: "flex-end" }}>
            {/* Arrows and Calendar Icon */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: hp('0.5%') }}>
              <TouchableOpacity onPress={handlePreviousPeriod}>
                <Ionicons name="chevron-back" size={RFValue(20)} color="#444" style={{ marginBottom: hp('0.5%') , backgroundColor: '#F4F2FA',borderRadius: wp('50%'), padding: wp('1%') }} />
              </TouchableOpacity>
              <View style={{ width: wp('2%') }} />
              <TouchableOpacity onPress={handleNextPeriod}>
                <Ionicons name="chevron-forward" size={RFValue(20)} color="#444" style={{ marginBottom: hp('0.5%') , backgroundColor: '#F4F2FA',borderRadius: wp('50%'), padding: wp('1%') }} />
              </TouchableOpacity>
            </View>
            {/* Date Range */}
            <Text style={{ fontSize: RFValue(10), color: "#444", fontWeight: "600", textAlign: "right" }}>
              {dateRange.start} - {dateRange.end}
            </Text>
           
          </View>
        </View>

        {/* ---------- BAR CHART ---------- */}
        <View style={{ position: "relative", flexDirection: "row" }}>
          {/* Custom Y-axis labels */}
          <View
            style={{
              width: wp('12%'),
              justifyContent: "space-between",
              paddingTop: hp('1.2%'),
              paddingBottom: hp('2.5%'),
              paddingRight: wp('2%'),
              minHeight: hp('20%'),
              alignItems: 'flex-end',
            }}
          >
            {yAxisLabels.map((label, index) => (
              <Text
                key={`y-axis-${label}-${index}`}
                style={{
                  fontSize: RFValue(11),
                  color: "#666",
                  textAlign: "right",
                  fontWeight: "500",
                }}
              >
                {label}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1, position: "relative" }}>
            {loading ? (
              <View style={{ height: hp('20%'), justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4B3AAC" />
              </View>
            ) : chartData.length === 0 || chartData.every(item => item.value === 0) ? (
              <View style={{ height: hp('20%'), justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: "#666", fontSize: RFValue(12) }}>No weight data available</Text>
                <Text style={{ color: "#999", fontSize: RFValue(10), marginTop: hp('1%') }}>
                  Try selecting a different date or period
                </Text>
              </View>
            ) : (
              <>
                <BarChart
                  data={chartData.map((item, index) => {
                    // Ensure value is a valid number (can be 0)
                    const barValue = Number(item.value) || 0;
                    
                    console.log(`📊 [WeightChart] Bar ${index}: value=${barValue}, label=${item.label}, type=${typeof barValue}`);
                    
                    const baseItem: any = {
                      value: Math.max(0, barValue), // Ensure non-negative (0 is valid)
                      label: item.label || `Period ${index + 1}`,
                      frontColor: barValue > 0 ? "#000000" : "#E5E5E5", // Gray for empty periods, black for data
                    };

                    return baseItem;
                  })}
                  barWidth={wp('6.5%')}
                  spacing={wp('5.5%')}
                  barBorderRadius={wp('2%')}    
                  roundedBottom={false}
                  yAxisThickness={0}
                  yAxisColor="#E5E7EB"
                  maxValue={yAxisRange.max}
                  noOfSections={3}
                  yAxisLabelWidth={0}
                  hideRules={false}
                  rulesColor="#E5E7EB"
                  rulesType="solid"
                  initialSpacing={wp('2.5%')}
                  xAxisLabelTextStyle={{ fontSize: RFValue(11), color: "#444" }}
                  isAnimated={true}
                  animationDuration={800}
                  showGradient={false}
                  height={hp('16%')}
                />
                
                {/* Custom horizontal line at average */}
                {average > 0 && (
                  <>
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: wp('5%'),
                        bottom: `${((average - yAxisRange.min) / (yAxisRange.max - yAxisRange.min)) * 100}%`,
                        flexDirection: "row",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          height: hp('0.25%'),
                          borderTopWidth: hp('0.25%'),
                          borderTopColor: "#999",
                          borderStyle: "dashed",
                        }}
                      />
                    </View>
                    
                    {/* Trophy icon at the end of the average line */}
                    <View
                      style={{
                        position: "absolute",
                        right: wp('2%'),
                        bottom: `${((average - yAxisRange.min) / (yAxisRange.max - yAxisRange.min)) * 100}%`,
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        marginBottom: hp('0.9%'), // Adjust to center on the line
                      }}
                    >
                      <Ionicons name="trophy" size={RFValue(18)} color="#FFD700" />
                    </View>
                  </>
                )}
              </>
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
          {/* Updated Unit display */}
          <Text style={{ color: "#111", fontSize: RFValue(12), fontWeight: "600" }}>
            Unit: <Text style={{ color: "#111", fontWeight: "400" }}>
              {currentUnit}
            </Text>
          </Text>
          
          <TouchableOpacity
            style={{
              backgroundColor: "#4B3AAC",
              paddingVertical: hp('1%'),
              paddingHorizontal: wp('5%'),
              borderRadius: wp('8%'),
            }}
            onPress={() => {router.push(  '/screen1/profile/weightScreen')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log weight
            </Text>
          </TouchableOpacity>
          
          {/* Updated Trend display */}
          <Text style={{ color: "#111", fontWeight: "400", fontSize: RFValue(12) }}>
            {trend}
          </Text>
        </View>
      </View>

      {/* DATE PICKER */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: wp('6%'),
              borderTopRightRadius: wp('6%'),
              padding: wp('5%'),
              paddingBottom: hp('5%')
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: hp('2%')
              }}>
                <Text style={{
                  fontSize: RFValue(18),
                  fontWeight: '700',
                  color: '#111'
                }}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{
                    fontSize: RFValue(16),
                    fontWeight: '600',
                    color: '#4B3AAC'
                  }}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={{ height: hp('30%') }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}
    </View>
  );
}