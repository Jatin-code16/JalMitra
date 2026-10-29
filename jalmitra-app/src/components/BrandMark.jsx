import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';

export default function BrandMark({
  size = 32,
  title = 'JalMitra',
  subtitle,
  align = 'left',
  tone = 'brand',
}) {
  const { colors } = useTheme();
  const ringSize = size + 10;
  const titleSize = Math.max(16, Math.round(size * 0.65));
  const subSize = Math.max(11, Math.round(size * 0.28));
  const isInverse = tone === 'inverse';
  const titleColor = isInverse ? '#ffffff' : colors.green;
  const subtitleColor = isInverse ? 'rgba(255,255,255,0.85)' : colors.textTertiary;
  const ringBg = isInverse ? 'rgba(255,255,255,0.15)' : colors.greenFaint;
  const ringBorder = isInverse ? 'rgba(255,255,255,0.3)' : colors.greenBorder;

  return (
    <View style={[styles.row, align === 'center' && styles.center]}>
      <View
        style={[
          styles.logoWrap,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            backgroundColor: ringBg,
            borderColor: ringBorder,
          },
        ]}
      >
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.textCol}>
        <Text
          style={[
            styles.title,
            {
              color: titleColor,
              fontSize: titleSize,
              lineHeight: Math.round(titleSize * 1.1),
              fontFamily: Theme.font.family.display,
              letterSpacing: Theme.font.letterSpacing.wide,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              {
                color: subtitleColor,
                fontSize: subSize,
                lineHeight: Math.round(subSize * 1.35),
                fontFamily: Theme.font.family.text,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  center: {
    justifyContent: 'center',
  },
  logoWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  textCol: {
    flexShrink: 1,
  },
  title: {},
  subtitle: {
    marginTop: 2,
  },
});
