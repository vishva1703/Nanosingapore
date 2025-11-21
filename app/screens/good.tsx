import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Ruler from "@/components/Ruler";

const { width } = Dimensions.get("window");

export default function DesiredScreen() {
  return (
    <View style={styles.container}>
      <View style={{ width }}> 
        {/* full width ensures scroll area is centered */}
        <Ruler />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
