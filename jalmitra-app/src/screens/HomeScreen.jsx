// src/screens/HomeScreen.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity,
  Animated, Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sensorAPI, analyticsAPI, pumpAPI } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../constants/theme';
import BrandMark from '../components/BrandMark';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { farmer, farmId } = useAuth();
  const { colors, isDark } = useTheme();

  const [sensorData,     setSensorData]     = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [pumpStatus,     setPumpStatus]     = useState('OFF');
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [lastUpdated,    setLastUpdated]    = useState(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [sRes, rRes, pRes] = await Promise.all([
        sensorAPI.getLatest(farmId),
        analyticsAPI.getRecommendation(farmId),
        pumpAPI.getStatus(farmId),
      ]);
      setSensorData(sRes.data.data);
      setRecommendation(rRes.data);
      setPumpStatus(pRes.data.pump.status);
      setLastUpdated(new Date());
      animateIn();
    } catch (e) {
      console.log('Fetch error:', e);
      animateIn();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [farmId, animateIn]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const moisture = sensorData?.soil_moisture || 0;
  const temp     = sensorData?.temperature  || 0;

  const getMoistureStatus = (v) => {
    if (v < 40) return { label: 'Sukha', color: colors.red,   bg: colors.redFaint };
    if (v > 65) return { label: 'Zyada nami', color: colors.blue,  bg: colors.blueFaint };
    return             { label: 'Theek', color: colors.green, bg: colors.greenFaint };
  };

  const getTempStatus = (v) => {
    if (v > 38) return { label: 'Garam',   color: colors.amber, bg: colors.amberFaint };
    return             { label: 'Theek', color: colors.green,  bg: colors.greenFaint };
  };

  const getRecConfig = (rec) => {
    switch (rec) {
      case 'irrigate': return {
        bg: colors.greenFaint,
        border: colors.greenBorder,
        iconName: 'water',
        title: 'Sinchai Sujhav',
        subtitle: 'Mitti sukhi hai. 25 minute sinchai karein.',
        titleColor: colors.green,
        highlight: '25',
      };
      case 'skip': return {
        bg: colors.blueFaint,
        border: colors.border,
        iconName: 'check-circle',
        title: 'Abhi sinchai ki zarurat nahi',
        subtitle: 'Mitti ki nami theek hai. Shaam ko fir check karein.',
        titleColor: colors.blue,
        highlight: '',
      };
      default: return {
        bg: colors.amberFaint,
        border: colors.amberBorder,
        iconName: 'eye',
        title: 'Khet par nazar rakhein',
        subtitle: 'Mitti ki nami par dhyan dein.',
        titleColor: colors.amber,
        highlight: '',
      };
    }
  };

  const moistSt = getMoistureStatus(moisture);
  const tempSt  = getTempStatus(temp);
  const recConf = getRecConfig(recommendation?.recommendation);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bgScreen }}
        edges={['top']}
      >
        <View style={[styles.center, { backgroundColor: colors.bgBase }]}>
          <MaterialCommunityIcons name="sprout" size={48} color={colors.green} />
          <Text style={[styles.loadingTitle, { color: colors.green }]}>JalMitra</Text>
          <Text style={[styles.loadingText, { color: colors.textTertiary }]}>
            Aapke khet ka data aa raha hai...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgScreen }}
      edges={['top']}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgBase }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
      {/* ── TOP HEADER ── */}
      <View style={[styles.topHeader, { backgroundColor: colors.bgScreen }]}>
        {/* Logo */}
        <BrandMark
          size={26}
          subtitle="Smart sinchai, smart khet"
        />
        {/* Bell */}
        <TouchableOpacity style={styles.bellBtn}>
          <MaterialCommunityIcons name="bell" size={22} color={colors.textSecondary} />
          <View style={[styles.bellBadge, { backgroundColor: colors.red }]}>
            <Text style={styles.bellBadgeTxt}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── GREETING ── */}
      <View style={[styles.greeting, { backgroundColor: colors.bgScreen }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.greetHi, { color: colors.green }]}>
              Namaste, {farmer?.name?.split(' ')[0]} Bhai
            </Text>
            <MaterialCommunityIcons name="sprout" size={18} color={colors.green} />
          </View>
          <Text style={[styles.greetSub, { color: colors.textTertiary }]}>
            Chaliye, milke behtar ugayein.
          </Text>
        </View>
        {/* Farmer avatar */}
        <View style={[styles.farmerAvatar, { backgroundColor: colors.greenFaint, borderColor: colors.greenBorder }]}>
          <MaterialCommunityIcons name="account" size={32} color={colors.green} />
        </View>
      </View>

      {/* ── FIELD SELECTOR ── */}
      <View style={[styles.fieldSelectorWrap, { backgroundColor: colors.bgScreen }]}>
        <TouchableOpacity style={[styles.fieldSelector, { borderColor: colors.border, backgroundColor: colors.bgBase }]}>
          <MaterialCommunityIcons name="barley" size={16} color={colors.textSecondary} />
          <Text style={[styles.fieldSelectorTxt, { color: colors.textSecondary }]}>
            Gehun Khet — Indore
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* ── HERO RECOMMENDATION CARD ── */}
        <View style={[styles.heroCard, {
          backgroundColor: recConf.bg,
          borderColor: recConf.border,
          marginHorizontal: 16,
          marginTop: 12,
        }]}>
          <View style={styles.heroCardLeft}>
            <MaterialCommunityIcons name={recConf.iconName} size={52} color={recConf.titleColor} style={{ marginBottom: 8 }} />
          </View>
          <View style={styles.heroCardRight}>
            <Text style={[styles.heroTitle, { color: recConf.titleColor }]}>
              {recConf.title}
            </Text>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
              {recConf.subtitle}
            </Text>
            {recConf.highlight !== '' && (
              <View style={[styles.heroBadge, { backgroundColor: recConf.titleColor + '20' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name="water" size={12} color={recConf.titleColor} />
                  <Text style={[styles.heroBadgeTxt, { color: recConf.titleColor }]}>
                    {recConf.highlight} minute ka sujhav
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── 3 METRIC CARDS ── */}
        <View style={styles.metricsRow}>
          {/* Soil */}
          <MetricCard
            colors={colors}
            iconName="sprout"
            iconColor={colors.green}
            title="Mitti"
            value={`${moisture.toFixed(0)}%`}
            subtitle="Nami"
            status={moistSt.label}
            statusColor={moistSt.color}
            statusBg={moistSt.bg}
          />
          {/* Temp */}
          <MetricCard
            colors={colors}
            iconName="white-balance-sunny"
            iconColor={colors.amber}
            title="Taapman"
            value={`${temp.toFixed(0)}°C`}
            subtitle="Hawa ka taapman"
            status={tempSt.label}
            statusColor={tempSt.color}
            statusBg={tempSt.bg}
          />
          {/* Motor */}
          <MetricCard
            colors={colors}
            iconName="cog"
            iconColor={colors.textSecondary}
            title="Motor"
            value={pumpStatus}
            subtitle="Status"
            status={pumpStatus === 'ON' ? 'Chalu' : 'Band'}
            statusColor={pumpStatus === 'ON' ? colors.green : colors.red}
            statusBg={pumpStatus === 'ON' ? colors.greenFaint : colors.redFaint}
          />
        </View>

        {/* ── START PUMP BUTTON ── */}
        <TouchableOpacity
          style={[styles.startPumpBtn, { backgroundColor: colors.green }]}
          onPress={() => navigation.navigate('Pump')}
          activeOpacity={0.88}
        >
          <MaterialCommunityIcons name="play" size={18} color={colors.bgScreen} />
          <Text style={[styles.startPumpTxt, { color: colors.bgScreen }]}>
            {pumpStatus === 'ON' ? 'Pump Band' : 'Pump Chalu'}
          </Text>
        </TouchableOpacity>

        {/* ── NEXT IRRIGATION ── */}
        <TouchableOpacity
          style={[styles.nextIrrRow, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}
          activeOpacity={0.85}
        >
          <View style={[styles.nextIrrIcon, { backgroundColor: colors.greenFaint }]}>
            <MaterialCommunityIcons name="leaf" size={18} color={colors.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.nextIrrLabel, { color: colors.textTertiary }]}>
              Agle sinchai ka samay
            </Text>
            <Text style={[styles.nextIrrVal, { color: colors.green }]}>
              Kal subah 6:30
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="calendar" size={12} color={colors.textTertiary} />
            <Text style={[styles.nextIrrArrow, { color: colors.textTertiary }]}>
              Schedule dekhein
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* Last updated */}
        {lastUpdated && (
          <View style={styles.footer}>
            <View style={[styles.liveDot, { backgroundColor: colors.green }]} />
            <Text style={[styles.footerTxt, { color: colors.textTertiary }]}>
              Live · Update {lastUpdated.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit'
              })}
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Metric Card Component ──
function MetricCard({ colors, iconName, iconColor, title, value, subtitle, status, statusColor, statusBg }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
      <MaterialCommunityIcons name={iconName} size={24} color={iconColor || colors.textPrimary} style={{ marginBottom: 4 }} />
      <Text style={[styles.metricTitle, { color: colors.textTertiary }]}>{title}</Text>
      <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.metricSub, { color: colors.textTertiary }]}>{subtitle}</Text>
      <View style={[styles.metricBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.metricBadgeTxt, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1 },
  center:             { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTitle:       { fontSize: 24, fontWeight: '800', marginTop: 12, letterSpacing: 2, fontFamily: Theme.font.family.display },
  loadingText:        { fontSize: 14, marginTop: 6, fontFamily: Theme.font.family.text },

  // Header
  topHeader:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  logoRow:            { flexDirection: 'row', alignItems: 'center' },
  logoText:           { fontSize: 20, fontWeight: '900', letterSpacing: 0.5, fontFamily: Theme.font.family.display },
  logoSub:            { fontSize: 10, marginTop: 1, fontFamily: Theme.font.family.text },
  bellBtn:            { position: 'relative', padding: 4 },
  bellBadge:          { position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  bellBadgeTxt:       { fontSize: 9, color: '#fff', fontWeight: '800', fontFamily: Theme.font.family.text },

  // Greeting
  greeting:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  greetHi:            { fontSize: 20, fontWeight: '800', fontFamily: Theme.font.family.display },
  greetSub:           { fontSize: 13, marginTop: 3, fontFamily: Theme.font.family.text },
  farmerAvatar:       { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },

  // Field selector
  fieldSelectorWrap:  { paddingHorizontal: 16, paddingBottom: 8 },
  fieldSelector:      { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  fieldSelectorTxt:   { flex: 1, fontSize: 14, fontWeight: '600', fontFamily: Theme.font.family.text },
  fieldSelectorArrow: { fontSize: 14 },

  // Hero card
  heroCard:           { borderWidth: 1.5, borderRadius: Theme.radius.lg, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroCardLeft:       { alignItems: 'center' },
  heroCardRight:      { flex: 1 },
  heroTitle:          { fontSize: 18, fontWeight: '800', marginBottom: 4, lineHeight: 24, fontFamily: Theme.font.family.display },
  heroSub:            { fontSize: 13, lineHeight: 20, fontFamily: Theme.font.family.text },
  heroBadge:          { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  heroBadgeTxt:       { fontSize: 12, fontWeight: '700', fontFamily: Theme.font.family.text },

  // Metrics
  metricsRow:         { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 8 },
  metricCard:         { flex: 1, borderRadius: Theme.radius.md, padding: 12, alignItems: 'center', borderWidth: 1, ...Theme.shadow.sm },
  metricTitle:        { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: Theme.font.family.text },
  metricValue:        { fontSize: 20, fontWeight: '900', marginTop: 2, fontFamily: Theme.font.family.display },
  metricSub:          { fontSize: 9, marginTop: 2, textAlign: 'center', fontFamily: Theme.font.family.text },
  metricBadge:        { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  metricBadgeTxt:     { fontSize: 10, fontWeight: '700', fontFamily: Theme.font.family.text },

  // Start pump
  startPumpBtn:       { marginHorizontal: 16, marginTop: 14, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...Theme.shadow.green },
  startPumpIcon:      { fontSize: 18 },
  startPumpTxt:       { fontSize: 18, fontWeight: '800', letterSpacing: 0.5, fontFamily: Theme.font.family.display },

  // Next irrigation
  nextIrrRow:         { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, borderRadius: Theme.radius.md, padding: 14, borderWidth: 1, gap: 12 },
  nextIrrIcon:        { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  nextIrrLabel:       { fontSize: 11, fontWeight: '500', fontFamily: Theme.font.family.text },
  nextIrrVal:         { fontSize: 14, fontWeight: '700', marginTop: 2, fontFamily: Theme.font.family.display },
  nextIrrArrow:       { fontSize: 11, fontWeight: '600', fontFamily: Theme.font.family.text },

  // Footer
  footer:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 6 },
  liveDot:            { width: 7, height: 7, borderRadius: 4 },
  footerTxt:          { fontSize: 11, fontFamily: Theme.font.family.text },
});