import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Theme } from "../constants/theme";

const SensorCard = ({ label, value, unit }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 6,
    fontFamily: Theme.font.family.text,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    fontFamily: Theme.font.family.display,
  },
  unit: {
    fontSize: 14,
    color: colors.muted,
    fontFamily: Theme.font.family.text,
  },
});

export default SensorCard;
