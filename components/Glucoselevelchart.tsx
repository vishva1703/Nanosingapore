import { hp, RFValue, wp } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Circle, Line } from "react-native-svg";
import { useRouter } from "expo-router";
import wellnessApi from "@/api/wellnessApi";

const screenWidth = Dimensions.get("window").width;

// 🔹 Helper to get Monday of a given week offset
const getWeekStart = (offset = 0) => {
  const today = new Date();
  today.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  return today;
};

// 🔹 Get 7 days of week
const getWeekDates = (startDate: Date) => {
  return Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + idx);
    return d;
  });
};

export default function GlucoseChart() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [indicatorIndex, setIndicatorIndex] = useState<number | null>(null);
  const router = useRouter();
  const dates = useMemo(() => getWeekDates(getWeekStart(weekOffset)), [weekOffset]);
  const monthName = dates[0].toLocaleString("default", { month: "long" });

  // Dummy glucose values
  const values = [110, 130, 100, 140, 150, 120, 135];
  const avg = Math.round(values.reduce((a, b) => a + b) / values.length);

  const labels = dates.map((d) => `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        color: () => `#015724`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0,
    color: () => `#015724`,
    labelColor: () => `rgba(0, 0, 0, 1)`,
    fillShadowGradient: "#1EA540",
    fillShadowGradientOpacity: 0.35,
    propsForBackgroundLines: { strokeWidth: 0 },
  };

  const chartWidth = screenWidth - 20;

  // 👉 Set indicator to last point initially and when data changes
  useEffect(() => {
    if (values.length > 0) {
      const lastIndex = values.length - 1;
      setIndicatorIndex(lastIndex);
      // Don't set indicatorX here - it will be calculated in decorator using actual chart width
    }
  }, [weekOffset, values.length]);



  const handlePreviousWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);

  return (
    <View style={{ paddingHorizontal: 10, backgroundColor: "#FFF" }}>

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: hp("2%"),
          marginTop: hp("1%"),
        }}
      >
        {/* Average Left */}
        <View>
          <Text style={{ color: "#777", fontSize: RFValue(12), marginBottom: hp("0.5%") }}>
            Average
          </Text>
          <Text style={{ color: "#111", fontSize: RFValue(16), fontWeight: "600" }}>
            {avg}
          </Text>
        </View>

        {/* Date Navigator Right */}
        <View style={{ alignItems: "flex-end" }}>
          <View style={{ flexDirection: "row", marginBottom: hp("0.5%") }}>
            <TouchableOpacity onPress={handlePreviousWeek}>
              <Ionicons
                name="chevron-back"
                size={RFValue(20)}
                color="#444"
                style={{
                  padding: wp("1%"),
                  backgroundColor: "#F4F2FA",
                  borderRadius: wp("50%"),
                }}
              />
            </TouchableOpacity>
            <View style={{ width: wp("3%") }} />
            <TouchableOpacity onPress={handleNextWeek}>
              <Ionicons
                name="chevron-forward"
                size={RFValue(20)}
                color="#444"
                style={{
                  padding: wp("1%"),
                  backgroundColor: "#F4F2FA",
                  borderRadius: wp("50%"),
                }}
              />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: RFValue(10), color: "#444", fontWeight: "600" }}>
            {monthName}
          </Text>
        </View>
      </View>

      {/* CHART WITH SLIDING INDICATOR */}
      <View >
        <LineChart
          data={data}
          width={chartWidth}
          height={260}
          chartConfig={chartConfig}
          bezier
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          style={{ borderRadius: 16 }}
          decorator={({ height, width }: { height: number; width: number }) => {
            if (indicatorIndex === null || indicatorIndex < 0 || indicatorIndex >= values.length) {
              return null;
            }

            // Calculate X position based on actual chart width
            // react-native-chart-kit uses internal padding (typically 20px on each side)
            const chartPadding = 20;
            const availableWidth = width - (chartPadding * 2);
            const stepX = availableWidth / (values.length - 1);
            
            // Calculate actual X position for the indicator
            const actualX = chartPadding + (indicatorIndex * stepX);
            
            // Ensure X is within chart bounds
            const clampedX = Math.max(chartPadding, Math.min(actualX, width - chartPadding));

            // Calculate y position for the data point
            // Chart has padding at top and bottom for labels
            const topPadding = 20;
            const bottomPadding = 30;
            const chartHeight = height - topPadding - bottomPadding;
            
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            const valueRange = maxValue - minValue || 1;
            const normalizedValue = (values[indicatorIndex] - minValue) / valueRange;
            
            // Y coordinate: bottom padding + (inverted normalized value * chart height)
            const actualY = height - bottomPadding - (normalizedValue * chartHeight);
            
            // Ensure Y is within chart bounds
            const clampedY = Math.max(topPadding, Math.min(actualY, height - bottomPadding));

            return (
              <>
                {/* Sliding vertical line */}
                <Line
                  x1={clampedX}
                  y1={topPadding}
                  x2={clampedX}
                  y2={height - bottomPadding}
                  stroke="#015724"
                  strokeWidth="2"
                />

                {/* Highlight selected point */}
                <Circle
                  cx={clampedX}
                  cy={clampedY}
                  r="6"
                  fill="#015724"
                />
              </>
            );
          }}
        />
      </View>

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
            onPress={()=> {router.push('/screen1/profile/logglucose')}}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: RFValue(12) }}>
              Log Glucose
            </Text>
          </TouchableOpacity>
       
        </View>

    </View>
  );
}
