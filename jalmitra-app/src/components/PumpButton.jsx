import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Theme } from "../constants/theme";

const PumpButton = ({ onPress, isOn }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isOn ? styles.on : styles.off,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.text}>{isOn ? "Pump Band" : "Pump Chalu"}</Text>
    </Pressable>
  );
};

const createStyles = (colors) => StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    minWidth: 160,
    alignItems: "center",
  },
  on: {
    backgroundColor: colors.pumpOff,
  },
  off: {
    backgroundColor: colors.pumpOn,
  },
  text: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: Theme.font.family.display,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default PumpButton;
