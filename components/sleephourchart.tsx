import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

export default function SleepHourChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Generate month name based on currentWeekOffset
  const getMonthName = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[startDate.getMonth()];
  };

  const monthName = getMonthName();

  const data = [
    { value: 4.3, label: "16 Nov" },
    { value: 6, label: "17 Nov" },
    { value: 6, label: "17 Nov" },
    { value: 9.2, label: "18 Nov" },
    { value: 8, label: "19 Nov" },
    { value: 10, label: "20 Nov" },
    { value: 9.8, label: "21 Nov" },
    { value: 11.2, label: "21 Nov" },
  ];

  // Calculate average from data
  const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  
  // Format average as hours and minutes
  const hours = Math.floor(average);
  const minutes = Math.round((average - hours) * 60);
  const averageDisplay = `${hours}h ${minutes}m`;

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
                {label.toString().padStart(2, '0')}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1, position: "relative" }}>
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
              maxValue={12}
              noOfSections={3}
              yAxisLabelWidth={0}
              xAxisLabelTextStyle={{ fontSize: RFValue(10), color: "#444", textAlign: 'center', width: wp('12%') }}
              yAxisTextStyle={{ fontSize: RFValue(11), color: "#666" }}
              showVerticalLines={false}
            />
            
            
              
            
           
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