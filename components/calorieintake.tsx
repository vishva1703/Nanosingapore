import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

export default function CalorieIntakeChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate month name based on currentWeekOffset
  const getMonthName = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[startDate.getMonth()];
  };

  const monthName = getMonthName();

  // Your 6 data points for 16 Nov to 21 Nov
  const data = [
    { value: 4000, label: "16 Nov" },
    { value: 3200, label: "17 Nov" },
    { value: 3500, label: "18 Nov" },
    { value: 3800, label: "19 Nov" },
    { value: 3200, label: "20 Nov" },
    { value: 2400, label: "21 Nov" },
  ];

  // Calculate average from data
  const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  
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
            {[4000, 3000, 2000, 1000].map((label) => (
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
                  maxValue={4000}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  yAxisLabelWidth={0}
                  hideRules={false}
                  frontColor="rgba(75, 58, 172, 0.3)"
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
                  maxValue={4000}
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