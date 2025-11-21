import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";

export default function GlucoseLevelChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [rangeMin, setRangeMin] = useState(70);
  const [rangeMax, setRangeMax] = useState(90);
  const router = useRouter()
  // Generate month name based on currentWeekOffset
  const getMonthName = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[startDate.getMonth()];
  };

  const monthName = getMonthName();

  // Data ending at 20 Nov (index 4)
  const data = [
    { value: 68, label: "16 Nov" },
    { value: 85, label: "17 Nov" },
    { value: 72, label: "18 Nov" },
    { value: 92, label: "19 Nov" },
    { value: 75, label: "20 Nov" }, // Last data point
  ];

  // Calculate average from data
  const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  const averageDisplay = `${Math.round(average)} mg/dL`;
  
  // Last day index (20 Nov is the last value, index 4)
  const lastDayIndex = data.length - 1;
  
  // Calculate responsive spacing based on data length
  const chartWidth = wp('75%');
  const totalSpacing = chartWidth - wp('2.5%') - wp('2%');
  const spacingPerPoint = totalSpacing / (data.length - 1);

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
                <Ionicons name="chevron-back" size={RFValue(20)} color="#444" style={{ marginBottom: hp('0.5%'), backgroundColor: '#F4F2FA', borderRadius: wp('50%') }} />
              </TouchableOpacity>
              <View style={{ width: wp('3%') }} />
              <TouchableOpacity onPress={handleNextWeek}>
                <Ionicons name="chevron-forward" size={RFValue(20)} color="#444" style={{ marginBottom: hp('0.5%'), backgroundColor: '#F4F2FA', borderRadius: wp('50%') }} />
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
            {[90, 80, 70, 60].map((label) => (
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
            {/* Range Indicator - Background layer */}
            <View
              style={{
                position: "absolute",
                left: wp('2.5%'),
                right: wp('2%'),
                top: hp('1.2%'),
                bottom: hp('2.5%'),
                zIndex: 0,
              }}
            >
              {/* Calculate range position based on maxValue (90) and chart height */}
              {(() => {
                const chartHeight = hp('15%') - hp('1.2%') - hp('2.5%');
                const maxValue = 90;
                const minValue = 0;
                
                // Calculate top position (from top of chart)
                const rangeTop = ((maxValue - rangeMax) / (maxValue - minValue)) * chartHeight;
                // Calculate bottom position
                const rangeBottom = ((maxValue - rangeMin) / (maxValue - minValue)) * chartHeight;
                const rangeHeight = rangeBottom - rangeTop;
                
                return (
                  <View
                    style={{
                      position: "absolute",
                      top: rangeTop,
                      height: rangeHeight,
                      width: '100%',
                      backgroundColor: "#015724",
                      opacity: 0.15,
                      borderRadius: wp('1%'),
                    }}
                  />
                );
              })()}
            </View>
            
            {/* Line Chart */}
            <LineChart
              data={data.map((item, index) => ({
                value: item.value,
                label: item.label,
                dataPointColor: "#015724",
                dataPointRadius: 4,
                dataPointWidth: 2,
                // Show dot for all data points
                showDataPoint: true,
              }))}
              width={chartWidth}
              height={hp('15%')}
              spacing={spacingPerPoint}
              initialSpacing={wp('2.5%')}
              endSpacing={wp('2%')}
              color="#015724"
              thickness={3}
              dataPointsColor="#015724"
              dataPointsRadius={4}
              dataPointsWidth={2}
              curved={false} // Straight lines between points
              areaChart={false} // No area fill
              hideRules={false}
              rulesColor="#E5E7EB"
              rulesType="solid"
              xAxisColor="#E5E7EB"
              yAxisColor="#E5E7EB"
              yAxisThickness={0}
              xAxisThickness={1}
              maxValue={90}
              noOfSections={3}
              yAxisLabelWidth={0}
              xAxisLabelTextStyle={{ 
                fontSize: RFValue(10), 
                color: "#444",
                textAlign: 'center',
              }}
              yAxisTextStyle={{ fontSize: RFValue(11), color: "#666" }}
              showVerticalLines={false}
              focusEnabled={true}
              showDataPointOnFocus={true}
              showStripOnFocus={false}
            />
            
            {/* Current Day Vertical Line Indicator - at last value (20 Nov) */}
            {(() => {
              const initialSpacing = wp('2.5%');
              // Position at the last data point (20 Nov)
              const xPosition = initialSpacing + (lastDayIndex * spacingPerPoint);
              
              return (
                <View
                  style={{
                    position: "absolute",
                    left: xPosition,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: "#015724",
                    zIndex: 2,
                  }}
                />
              );
            })()}

            {/* Data Point Dots - Custom implementation for better control */}
            {data.map((item, index) => {
              const xPosition = wp('2.5%') + (index * spacingPerPoint);
              const chartHeight = hp('15%');
              const maxValue = 90;
              const minValue = 0;
              const valueRange = maxValue - minValue;
              const yPosition = ((maxValue - item.value) / valueRange) * (chartHeight - hp('3.7%')) + hp('1.2%');
              
              return (
                <View
                  key={index}
                  style={{
                    position: "absolute",
                    left: xPosition - 4, // Center the dot
                    top: yPosition - 4, // Center the dot
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#015724",
                    borderWidth: 2,
                    borderColor: "#fff",
                    zIndex: 3,
                  }}
                />
              );
            })}
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
            onPress={() => {router.push ('/screen1/profile/logglucose')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log glucose
            </Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </View>
  );
}