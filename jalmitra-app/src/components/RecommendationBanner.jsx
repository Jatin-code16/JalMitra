import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Theme } from "../constants/theme";

const RecommendationBanner = ({ message }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Salah</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  banner: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accentDark,
    marginBottom: 4,
    fontFamily: Theme.font.family.display,
  },
  message: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Theme.font.family.text,
  },
});

export default RecommendationBanner;
