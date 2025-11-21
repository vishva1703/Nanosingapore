import { RulerPicker } from "react-native-ruler-picker";
import { View, StyleSheet } from "react-native";

export default function Ruler() {
  return (
    <View style={styles.container}>
      <RulerPicker
        min={0}
        max={240}
        step={1}
        fractionDigits={0}
        initialValue={0}
        unit="kg"
        height={65}
        onValueChange={(value) => console.log("Live:", value)}
        onValueChangeEnd={(value) => console.log("Final:", value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
