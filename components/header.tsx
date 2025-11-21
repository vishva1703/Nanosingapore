import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";

interface Props {
  title?: string;
  activeIndex?: number;
  onDayPress?: (index: number) => void;
  onSettingsPress?: () => void;
}

const days = ["M", "T", "W", "T", "F", "S", "S"];

const DashboardHeaderWeek: React.FC<Props> = ({
  title = "Dashboard",
  activeIndex = 2,
  onDayPress = () => {},
  onSettingsPress = () => {},
}) => {
  return (
    <>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
          <Ionicons name="calendar-outline" size={RFValue(20)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>

        <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={RFValue(20)} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Week Row */}
      <View style={styles.weekRow}>
        {days.map((day, i) => (
          <TouchableOpacity key={i} onPress={() => onDayPress(i)}>
            <View style={styles.weekDay}>
              <View
                style={[
                  styles.dayCircle,
                  i === activeIndex && styles.dayCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.weekDayLabel,
                    i === activeIndex && styles.weekDayLabelActive,
                  ]}
                >
                  {day}
                </Text>
              </View>

              <Text style={styles.dateText}>{20 + i}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    textAlign: "center",
  },

  settingsButton: {
    width: 60,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: hp("2%"),
  },

  weekDay: {
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
    borderStyle: "solid",
    borderColor: "#4a3aff",
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
