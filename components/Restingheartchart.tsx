import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";

export default function RestingHeartChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const router = useRouter();
  // Generate date range based on currentWeekOffset
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End of week

    const formatDate = (date: Date) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

  const data = [
    { value: 18, label: "16 Nov" },
    { value: 48, label: "17 Nov" },
    { value: 30, label: "18 Nov" },
    { value: 90, label: "19 Nov" },
    { value: 60, label: "20 Nov" },
    { value: 65, label: "21 Nov" },
  ];

  // Calculate average from data
  const average = Math.round(
    data.reduce((sum, item) => sum + item.value, 0) / data.length
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
              {average} bpm
            </Text>
          </View>

          {/* DATE SECTION - RIGHT SIDE */}
          <View style={{ alignItems: "flex-end", marginRight: wp('2%'), marginTop: hp('2%') }}>
           
            {/* Date Range */}
            <Text style={{ fontSize: RFValue(10), color: "#444", fontWeight: "600" }}>
              {dateRange.start} - {dateRange.end}
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
            <BarChart
              data={data.map((item) => {
                const baseItem: any = {
                  value: item.value,
                  label: item.label,
                  frontColor: "#0EA5E9", // Blue color for the filled portion (value)
                  backColor: "#F4F2FA", // Light gray color for the background/unfilled portion
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
              maxValue={90}
              noOfSections={3}
              yAxisLabelWidth={0}
              hideRules={false}
              rulesColor="#E5E7EB"
              rulesType="solid"
              initialSpacing={wp('2.5%')}
              xAxisLabelTextStyle={{ fontSize: RFValue(11), color: "#444" }}
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
              marginLeft: wp('26%'),
            }}
            onPress={() => {router.push('/screen1/profile/logheartrate')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log RHR
            </Text>
          </TouchableOpacity>
         
        </View>
      </View>
    </View>
  );
}