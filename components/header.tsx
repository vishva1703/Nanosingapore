import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import { router } from "expo-router";

interface Props {
  title?: string;
  activeIndex?: number;
  onDayPress?: (date: Date) => void;
  onSettingsPress?: () => void;
}

const DashboardHeaderWeek: React.FC<Props> = ({
  title = "Dashboard",
  activeIndex = 0,
  onDayPress = () => { },
  onSettingsPress = () => {router.push("/screen1/profile/setting")},
}) => {
  const scrollRef = useRef<ScrollView>(null);

  const DAYS_TO_RENDER = 21; // big enough for looping
  const MIDDLE = Math.floor(DAYS_TO_RENDER / 3);

  // Base date = today or fixed — your choice

  const [baseDate, setBaseDate] = React.useState(new Date(2024, 0, 1));
  const [selectedDate, setSelectedDate] = React.useState(baseDate);

  const dates = React.useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < DAYS_TO_RENDER; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + (i - MIDDLE));
      arr.push(d);
    }
    return arr;
  }, [baseDate]);

  // Generate continuous real dates
  for (let i = 0; i < DAYS_TO_RENDER; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + (i - MIDDLE));
    dates.push(d);
  }

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: MIDDLE * wp("14%"),
        animated: false,
      });
    }, 10);
  }, []);

  const handleScroll = (event: any) => {
    const itemWidth = wp("14%");
    const x = event.nativeEvent.contentOffset.x;

    const start = MIDDLE * itemWidth - itemWidth;
    const end = MIDDLE * itemWidth + itemWidth;

    // SCROLL RIGHT → Next day
    if (x > end) {
      setBaseDate((prev) => {
        const next = new Date(prev);
        next.setDate(prev.getDate() + 1);
        return next;
      });

      scrollRef.current?.scrollTo({
        x: MIDDLE * itemWidth,
        animated: false,
      });
    }

    // SCROLL LEFT → Previous day
    if (x < start) {
      setBaseDate((prev) => {
        const next = new Date(prev);
        next.setDate(prev.getDate() - 1);
        return next;
      });

      scrollRef.current?.scrollTo({
        x: MIDDLE * itemWidth,
        animated: false,
      });
    }
  };


  const getDayLetter = (date: Date) =>
    ["S", "M", "T", "W", "T", "F", "S"][date.getDay()];

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
          <Ionicons name="calendar-outline" size={RFValue(20)} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>

        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/screen1/profile/setting")}>
          <Ionicons name="settings-outline" size={RFValue(20)} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Infinite Real-Date Scroll */}
      <View style={{ height: wp("20%") }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {dates.map((date, i) => {
            const isActive =
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            return (
              <TouchableOpacity key={i} onPress={() => {
                setSelectedDate(date);
                onDayPress(date);

                const itemWidth = wp("14%");
                scrollRef.current?.scrollTo({
                  x: i * itemWidth,
                  animated: true,
                });
              }}
              >
                <View style={styles.weekDayContainer}>
                  <View
                    style={[styles.dayCircle, isActive && styles.dayCircleActive]}
                  >
                    <Text
                      style={[
                        styles.weekDayLabel,
                        isActive && styles.weekDayLabelActive,
                      ]}
                    >
                      {getDayLetter(date)}
                    </Text>
                  </View>

                  <Text style={styles.dateText}>{date.getDate()}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

export default DashboardHeaderWeek;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp("5%"),
    marginTop: hp("4%"),
  },
  headerTitle: {
    fontSize: RFValue(20),
    fontWeight: "400",
  },
  settingsButton: {
    width: 60,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: wp("4%"),
  },
  weekDayContainer: {
    width: wp("14%"),
    alignItems: "center",
  },
  dayCircle: {
    width: wp("9%"),
    height: wp("9%"),
    borderRadius: wp("4.5%"),
    borderWidth: 2,
    borderColor: "#aaa",
    borderStyle: "dotted",
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleActive: {
    backgroundColor: "#4B3AAC",
    borderColor: "#4a3aff",
    borderStyle: "solid",
  },
  weekDayLabel: {
    fontWeight: "500",
    color: "#555",
  },
  weekDayLabelActive: {
    color: "#fff",
  },
  dateText: {
    color: "#999",
    fontSize: RFValue(11),
    marginTop: 4,
  },
});
