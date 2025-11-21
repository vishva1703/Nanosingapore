import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";

export default function ActiveMinutesChart() {
  const [activeTab, setActiveTab] = useState("Yearly");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const router = useRouter();
  // Generate year based on currentWeekOffset
  const getYear = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6 + (currentWeekOffset * 7)); // Start of week
    return startDate.getFullYear();
  };

  const year = getYear();

  const data = [
    { value: 68, label: "16 Nov" },
    { value: 72, label: "17 Nov" },
    { value: 60, label: "18 Nov" },
    { value: 90, label: "19 Nov", goal: true }, // goal day
    { value: 50, label: "20 Nov" },
    { value: 40, label: "21 Nov" },
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
              {average}m
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
            <BarChart
              data={data.map((item) => {
                const baseItem: any = {
                  value: item.value,
                  label: item.label,
                  frontColor: "#8D3CFF", // Black color for all bars
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
<Text style={{ color: "#111", fontSize: RFValue(12) ,fontWeight: "600"}}>
  Goal: <Text style={{  color: "#111" ,fontWeight: "400"}}>
    {data[data.length - 1].value}
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