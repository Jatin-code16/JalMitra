// src/screens/LoginScreen.jsx

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Theme } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import BrandMark from '../components/BrandMark';

const FEATURE_CHIPS = [
  { iconName: 'water', label: 'Smart Sinchai' },
  { iconName: 'robot', label: 'AI Saathi' },
  { iconName: 'translate', label: 'Hinglish-first' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isNewFarmer, setIsNewFarmer] = useState(false);
  const [loading, setLoading] = useState(false);
  const styles = createStyles(colors);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const slideToOTP = () => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert('Galat Number',
        '10 digit ka Indian phone number dalein');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.sendOTP(phone);
      const data = response.data;
      setIsNewFarmer(data.is_new_farmer);
      setStep('otp');
      slideToOTP();
      Alert.alert(
        'OTP Bheja Gaya!',
        `Phone pe OTP aaya hoga.\n\nTest OTP: ${data.debug_otp}`
      );
    } catch (error) {
      Alert.alert('Error',
        error.response?.data?.detail?.message
        || 'Kuch galat hua.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Galat OTP', '6 digit ka OTP dalein');
      return;
    }
    if (isNewFarmer && !name.trim()) {
      Alert.alert('Naam Zaroori', 'Apna naam dalein');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(
        phone, otp, name.trim() || undefined
      );
      const data = response.data;
      await login(data.farmer, data.farms, data.token);
    } catch (error) {
      Alert.alert('OTP Galat',
        error.response?.data?.detail?.message
        || 'OTP sahi nahi hai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.primary }}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Top Brand Section */}
      <View style={styles.topSection}>
        <View style={styles.topGlow} />
        <BrandMark
          size={72}
          subtitle="Aapke khet ka smart saathi"
          align="center"
          tone="inverse"
        />
        <Text style={styles.topTag}>Hinglish-first • AI saathi • Smart sinchai</Text>
      </View>

      {/* Bottom White Card */}
      <View style={styles.bottomCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <MaterialCommunityIcons
            name={step === 'phone' ? 'cellphone' : 'key'}
            size={20}
            color={colors.textDark}
          />
          <Text style={styles.cardTitle}>
            {step === 'phone'
              ? 'Mobile number dijiye'
              : 'OTP verify kijiye'}
          </Text>
        </View>
        <Text style={styles.cardSubtitle}>
          {step === 'phone'
            ? 'Registered number par OTP aayega'
            : `OTP ${phone} par bheja gaya hai`}
        </Text>

        {step === 'phone' ? (
          <>
            {/* Phone Input */}
            <View style={styles.inputWrapper}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 16, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.bgBase }}>
                <MaterialCommunityIcons name="phone" size={16} color={colors.textMedium} />
                <Text style={styles.inputPrefix}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="10 digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn,
                loading && styles.btnDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color={colors.bgScreen} />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.primaryBtnText}>
                      OTP Bhejein
                    </Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color={colors.bgScreen} />
                  </View>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Name Input (new farmer only) */}
            {isNewFarmer && (
              <>
                <Text style={styles.inputLabel}>Aapka Naam</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Jaise: Ramu Kumar"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />
              </>
            )}

            {/* OTP Input */}
            <Text style={styles.inputLabel}>OTP (6 digit)</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="• • • • • •"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus={!isNewFarmer}
            />

            <TouchableOpacity
              style={[styles.primaryBtn,
                loading && styles.btnDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color={colors.bgScreen} />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.primaryBtnText}>
                      Login Karo
                    </Text>
                    <MaterialCommunityIcons name="rocket-launch" size={16} color={colors.bgScreen} />
                  </View>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setStep('phone');
                setOtp('');
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="arrow-left" size={14} color={colors.accent} />
                <Text style={styles.backBtnText}>
                  Number Badlein
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Features Row */}
        <View style={styles.featuresRow}>
          {FEATURE_CHIPS.map((f, i) => (
            <View key={i} style={styles.featureChip}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name={f.iconName} size={14} color={colors.primary} />
                <Text style={styles.featureChipText}>{f.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  // Top Brand Section
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  topGlow: {
    position: 'absolute',
    top: 20,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topTag: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Theme.font.family.text,
  },

  // Bottom Card
  bottomCard: {
    backgroundColor: colors.bgScreen,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    fontFamily: Theme.font.family.display,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 24,
    lineHeight: 19,
    fontFamily: Theme.font.family.text,
  },

  // Phone Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgBase,
    borderRadius: Theme.radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  inputPrefix: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMedium,
    fontFamily: Theme.font.family.text,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    paddingHorizontal: 14,
    letterSpacing: 2,
    fontFamily: Theme.font.family.display,
  },

  // Regular Input
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMedium,
    marginBottom: 8,
    marginTop: 4,
    fontFamily: Theme.font.family.text,
  },
  input: {
    backgroundColor: colors.bgBase,
    borderRadius: Theme.radius.md,
    padding: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.textDark,
    marginBottom: 14,
    fontFamily: Theme.font.family.text,
  },
  otpInput: {
    letterSpacing: 12,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: Theme.font.family.display,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: Theme.radius.md,
    padding: 18,
    alignItems: 'center',
    marginTop: 4,
    ...Theme.shadow.green,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: colors.bgScreen,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Theme.font.family.display,
  },
  backBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  backBtnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Theme.font.family.text,
  },

  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    flexWrap: 'wrap',
  },
  featureChip: {
    backgroundColor: colors.primaryFaint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featureChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: Theme.font.family.text,
  },
});