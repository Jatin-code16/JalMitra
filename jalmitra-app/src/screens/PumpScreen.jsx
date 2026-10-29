// src/screens/PumpScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { pumpAPI } from '../services/api';
import { Theme } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const DURATION_OPTIONS = [
  { label: '15 min', value: 15, iconName: 'flash' },
  { label: '30 min', value: 30, iconName: 'check-circle' },
  { label: '45 min', value: 45, iconName: 'water' },
  { label: '1 ghanta', value: 60, iconName: 'waves' },
  { label: '1.5 ghanta', value: 90, iconName: 'image-filter-hdr' },
];

export default function PumpScreen() {
  const { farmId } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);
  const [pumpStatus, setPumpStatus] = useState('OFF');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [pumpHistory, setPumpHistory] = useState([]);
  const [runtimeToday, setRuntimeToday] = useState(0);

  // Pulse animation when pump is ON
  useEffect(() => {
    if (pumpStatus === 'ON') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pumpStatus]);

  useEffect(() => { fetchPumpStatus(); }, []);

  const fetchPumpStatus = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        pumpAPI.getStatus(farmId),
        pumpAPI.getHistory(farmId),
      ]);
      setPumpStatus(statusRes.data.pump.status);
      setRuntimeToday(
        statusRes.data.pump.total_runtime_today_minutes || 0
      );
      setPumpHistory(historyRes.data.history || []);
    } catch (error) {
      console.log('Pump error:', error);
    } finally {
      setFetchingStatus(false);
    }
  };

  const handlePumpControl = (action) => {
    const isOn = action === 'ON';
    Alert.alert(
      isOn ? 'Pump Chalu Karein?' : 'Pump Band Karein?',
      isOn
        ? `${selectedDuration} minute ke liye pump chalu hoga.\nAuto band ho jayega.`
        : 'Pump abhi band kar dein?',
      [
        { text: 'Nahi', style: 'cancel' },
        {
          text: isOn ? 'Chalu Karo' : 'Band Karo',
          onPress: () => executePumpControl(action)
        },
      ]
    );
  };

  const executePumpControl = async (action) => {
    setLoading(true);
    try {
      await pumpAPI.control(farmId, action, selectedDuration);
      setPumpStatus(action);
      await fetchPumpStatus();
    } catch (error) {
      const msg = error.response?.data?.detail?.message
                  || 'Kuch galat hua.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const isPumpOn = pumpStatus === 'ON';

  if (fetchingStatus) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Pump status dekh raha hoon...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
      {/* ── Big Status Display ── */}
      <View style={[
        styles.statusHero,
        { backgroundColor: isPumpOn ? colors.primary : colors.bgCard2 }
      ]}>
        <Animated.View style={[
          styles.statusCircleOuter,
          {
            backgroundColor: isPumpOn
              ? 'rgba(255,255,255,0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
            transform: [{ scale: pulseAnim }]
          }
        ]}>
          <View style={[
            styles.statusCircleInner,
            {
              backgroundColor: isPumpOn
                ? 'rgba(255,255,255,0.15)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
            }
          ]}>
            <MaterialCommunityIcons
              name={isPumpOn ? 'water' : 'shower-head'}
              size={52}
              color={isPumpOn ? colors.bgScreen : colors.textSecondary}
            />
          </View>
        </Animated.View>

        <Text style={[styles.statusLabel, { color: isPumpOn ? 'rgba(255,255,255,0.6)' : colors.textTertiary }]}>
          Pump ki sthiti
        </Text>
        <Text style={[styles.statusText, { color: isPumpOn ? colors.bgScreen : colors.textPrimary }]}>
          {isPumpOn ? 'CHALU HAI' : 'BAND HAI'}
        </Text>
        <View style={[styles.runtimeBadge, { backgroundColor: isPumpOn ? 'rgba(255,255,255,0.12)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="timer" size={14} color={isPumpOn ? 'rgba(255,255,255,0.8)' : colors.textTertiary} />
            <Text style={[styles.runtimeText, { color: isPumpOn ? 'rgba(255,255,255,0.8)' : colors.textTertiary }]}>
              Aaj: {runtimeToday} minute chala
            </Text>
          </View>
        </View>
      </View>

      {/* ── Duration Selector ── */}
      {!isPumpOn && (
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <MaterialCommunityIcons name="timer" size={16} color={colors.textDark} />
            <Text style={styles.sectionTitle}>
              Kitni der chalana hai?
            </Text>
          </View>
          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.durationCard,
                  selectedDuration === opt.value && styles.durationSelected
                ]}
                onPress={() => setSelectedDuration(opt.value)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={opt.iconName}
                  size={22}
                  color={selectedDuration === opt.value ? colors.primary : colors.textMedium}
                  style={{ marginBottom: 4 }}
                />
                <Text style={[
                  styles.durationLabel,
                  selectedDuration === opt.value && styles.durationLabelSelected
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ── Main Control Button ── */}
      <View style={styles.controlSection}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isPumpOn ? styles.offButton : styles.onButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={() => handlePumpControl(isPumpOn ? 'OFF' : 'ON')}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.bgScreen} />
          ) : (
            <>
              <MaterialCommunityIcons
                name={isPumpOn ? 'stop-circle' : 'water'}
                size={36}
                color={colors.bgScreen}
              />
              <Text style={styles.controlText}>
                {isPumpOn ? 'PUMP BAND KARO' : 'PUMP CHALU KARO'}
              </Text>
              {!isPumpOn && (
                <Text style={styles.controlSub}>
                  {selectedDuration} minute ke liye
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {!isPumpOn && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12 }}>
            <MaterialCommunityIcons name="information" size={14} color={colors.textLight} />
            <Text style={styles.autoOffNote}>
              {selectedDuration} minute baad auto band ho jayega
            </Text>
          </View>
        )}
      </View>

      {/* ── Pump History ── */}
      {pumpHistory.length > 0 && (
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <MaterialCommunityIcons name="clipboard-text" size={16} color={colors.textDark} />
            <Text style={styles.sectionTitle}>Pichli activity</Text>
          </View>
          {pumpHistory.slice(0, 5).map((log, index) => (
            <View key={index} style={[
              styles.historyItem,
              index === pumpHistory.length - 1 && styles.historyItemLast
            ]}>
              <View style={[
                styles.historyDot,
                {
                  backgroundColor: log.action === 'ON'
                    ? colors.success : colors.danger
                }
              ]} />
              <View style={styles.historyInfo}>
                <Text style={styles.historyAction}>
                  Pump {log.action === 'ON' ? 'Chalu' : 'Band'} kiya
                  {log.duration_minutes
                    ? ` — ${log.duration_minutes} min` : ''}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MaterialCommunityIcons
                    name={log.triggered_by === 'farmer' ? 'account' : 'robot'}
                    size={14}
                    color={colors.textLight}
                  />
                  <Text style={styles.historyMeta}>
                    {log.triggered_by === 'farmer'
                      ? 'Aapne' : 'Auto'} •{' '}
                    {new Date(log.timestamp).toLocaleString('hi-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short'
                    })}
                  </Text>
                </View>
              </View>
              {log.water_used_liters > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <MaterialCommunityIcons name="water" size={13} color={colors.accent} />
                  <Text style={styles.historyWater}>
                    {log.water_used_liters}L
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textMedium,
    fontSize: 15,
    fontFamily: Theme.font.family.text,
  },

  // Hero
  statusHero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  statusCircleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusCircleInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Theme.font.family.text,
  },
  statusText: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1,
    fontFamily: Theme.font.family.display,
  },
  runtimeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
  },
  runtimeText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Theme.font.family.text,
  },

  // Section
  section: {
    backgroundColor: colors.bgScreen,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: Theme.radius.lg,
    padding: 16,
    ...Theme.shadow.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    fontFamily: Theme.font.family.display,
  },

  // Duration Grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationCard: {
    width: '30%',
    backgroundColor: colors.bgBase,
    borderRadius: Theme.radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  durationSelected: {
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primary,
  },
  durationLabel: {
    fontSize: 12,
    color: colors.textMedium,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Theme.font.family.text,
  },
  durationLabelSelected: {
    color: colors.primary,
  },

  // Control Button
  controlSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  controlButton: {
    width: '100%',
    borderRadius: Theme.radius.xl,
    paddingVertical: 24,
    alignItems: 'center',
    ...Theme.shadow.green,
  },
  onButton: {
    backgroundColor: colors.primary,
    ...Theme.shadow.green,
  },
  offButton: {
    backgroundColor: colors.danger,
    ...Theme.shadow.red,
  },
  buttonDisabled: { opacity: 0.65 },
  controlText: {
    color: colors.bgScreen,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 8,
    fontFamily: Theme.font.family.display,
  },
  controlSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
    fontFamily: Theme.font.family.text,
  },
  autoOffNote: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Theme.font.family.text,
  },

  // History
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyInfo: { flex: 1 },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    fontFamily: Theme.font.family.text,
  },
  historyMeta: {
    fontSize: 12,
    color: colors.textLight,
    fontFamily: Theme.font.family.text,
  },
  historyWater: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
    fontFamily: Theme.font.family.text,
  },
});