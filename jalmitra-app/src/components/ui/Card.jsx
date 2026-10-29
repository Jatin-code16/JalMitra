// src/components/ui/Card.jsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

export function Card({ children, style, variant = 'default' }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={[
      styles.card,
      variant === 'elevated' && styles.elevated,
      variant === 'flat' && styles.flat,
      style
    ]}>
      {children}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.bgScreen,
    borderRadius: Theme.radius.lg,
    padding: Theme.space.md,
    ...Theme.shadow.sm,
  },
  elevated: {
    ...Theme.shadow.md,
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
});