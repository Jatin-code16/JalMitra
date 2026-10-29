// src/screens/ProfileScreen.jsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { pumpAPI, analyticsAPI } from '../services/api';
import { Theme } from '../constants/theme';
import BrandMark from '../components/BrandMark';

const MENU_ITEMS = [
  { iconName: 'web',          label: 'Bhasha Settings',         key: 'language' },
  { iconName: 'bell',         label: 'Notification Settings',  key: 'notifications' },
  { iconName: 'barley',       label: 'Khet Management',         key: 'fields' },
  { iconName: 'information',  label: 'JalMitra ke baare mein',  key: 'about' },
  { iconName: 'headphones',   label: 'Madad & Support',         key: 'help' },
];

export default function ProfileScreen({ navigation }) {
  const { farmer, farmId, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [stats, setStats] = useState({
    fields:      1,
    irrigations: 0,
    waterSaved:  0,
  });

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchStats();
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();
  }, []);

  const fetchStats = async () => {
    try {
      const [pRes, wRes] = await Promise.all([
        pumpAPI.getHistory(farmId, 50),
        analyticsAPI.getWeekly(farmId),
      ]);
      const irrigations = (pRes.data.history || []).filter(l => l.action === 'ON').length;
      const water = wRes.data.summary?.total_water_used_liters || 0;
      setStats({ fields: 1, irrigations, waterSaved: Math.round(water) });
    } catch (e) {
      console.log('Stats error:', e);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Kya aap logout karna chahte hain?',
      [
        { text: 'Nahi', style: 'cancel' },
        { text: 'Haan, Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleMenuPress = (key) => {
    switch (key) {
      case 'fields':
        navigation.navigate('Fields');
        break;
      case 'about':
        Alert.alert(
          'JalMitra',
          'Version 1.0.0\n\nSmart sinchai, smart khet.\n\nBharatiya kisano ke liye se.'
        );
        break;
      case 'help':
        Alert.alert('Help', 'Support ke liye: support@jalmitra.in');
        break;
      default:
        Alert.alert('Jald Aayega!', 'Yeh feature jald aa raha hai.');
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgScreen }}
      edges={['top']}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.bgScreen }]}>
        <BrandMark size={24} />
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: colors.greenFaint, borderColor: colors.greenBorder }]}
          onPress={() => Alert.alert('Settings', 'Poora settings screen jaldi aayega!')}
        >
          <MaterialCommunityIcons name="cog" size={18} color={colors.green} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgBase }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Farmer Profile Card ── */}
          <View style={[styles.profileCard, { backgroundColor: colors.bgScreen }]}>
            {/* Avatar */}
            <View style={[styles.avatarWrap, { borderColor: colors.greenBorder, backgroundColor: colors.greenFaint }]}>
              <MaterialCommunityIcons name="account" size={52} color={colors.green} />
            </View>

            {/* Name + Location */}
            <Text style={[styles.farmerName, { color: colors.textPrimary }]}>
              {farmer?.name || 'Kisan Bhai'}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={14} color={colors.textTertiary} />
              <Text style={[styles.locationTxt, { color: colors.textTertiary }]}>
                Raipur, Chhattisgarh
              </Text>
            </View>
          </View>

          {/* ── Stats Row ── */}
          <View style={[styles.statsCard, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
            <StatItem
              colors={colors}
              iconName="barley"
              value={stats.fields}
              label="Khet"
            />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem
              colors={colors}
              iconName="water-pump"
              value={stats.irrigations}
              label="Sanchai"
            />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <StatItem
              colors={colors}
              iconName="water"
              value={`${stats.waterSaved}L`}
              label="Pani Bachat"
            />
          </View>

          {/* ── Theme Toggle ── */}
          <View style={[styles.themeCard, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
            <MaterialCommunityIcons
              name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
              size={22}
              color={isDark ? colors.amber : colors.amber}
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.themeSub, { color: colors.textTertiary }]}>
                {isDark ? 'Raat ke liye dark theme' : 'Din ke liye light theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.green + '80' }}
              thumbColor={isDark ? colors.green : colors.textFaint}
            />
          </View>

          {/* ── Menu Items ── */}
          <View style={[styles.menuCard, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.menuRow,
                  { borderTopColor: colors.border },
                  i === 0 && { borderTopWidth: 0 },
                ]}
                onPress={() => handleMenuPress(item.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconWrap, { backgroundColor: colors.greenFaint }]}>
                  <MaterialCommunityIcons name={item.iconName} size={18} color={colors.green} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>
                  {item.label}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textFaint} />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Logout ── */}
          <TouchableOpacity
            style={[styles.logoutRow, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: colors.redFaint }]}>
              <MaterialCommunityIcons name="logout" size={18} color={colors.red} />
            </View>
            <Text style={[styles.logoutTxt, { color: colors.red }]}>Logout</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.red} />
          </TouchableOpacity>

          {/* App Version */}
          <Text style={[styles.version, { color: colors.textFaint }]}>
            JalMitra v1.0.0 · Smart sinchai, smart khet.
          </Text>

          <View style={{ height: 32 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stat Item Component ──
function StatItem({ colors, iconName, value, label }) {
  return (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={iconName} size={22} color={colors.green} />
      <Text style={[styles.statValue, { color: colors.green }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },

  topBar:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  settingsBtn:    { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  profileCard:    { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  avatarWrap:     { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 3, marginBottom: 14 },
  farmerName:     { fontSize: 26, fontWeight: '900', marginBottom: 6, fontFamily: Theme.font.family.display },
  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationTxt:    { fontSize: 14, fontFamily: Theme.font.family.text },

  statsCard:      { flexDirection: 'row', marginHorizontal: 16, marginBottom: 14, borderRadius: Theme.radius.lg, borderWidth: 1, overflow: 'hidden', ...Theme.shadow.sm },
  statItem:       { flex: 1, alignItems: 'center', paddingVertical: 18, gap: 4 },
  statValue:      { fontSize: 22, fontWeight: '900', fontFamily: Theme.font.family.display },
  statLabel:      { fontSize: 12, fontFamily: Theme.font.family.text },
  statDivider:    { width: 1, marginVertical: 16 },

  themeCard:      { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 14, borderRadius: Theme.radius.md, borderWidth: 1, padding: 16, ...Theme.shadow.sm },
  themeLabel:     { fontSize: 15, fontWeight: '700', fontFamily: Theme.font.family.display },
  themeSub:       { fontSize: 12, marginTop: 2, fontFamily: Theme.font.family.text },

  menuCard:       { marginHorizontal: 16, marginBottom: 14, borderRadius: Theme.radius.lg, borderWidth: 1, overflow: 'hidden', ...Theme.shadow.sm },
  menuRow:        { flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: 1, gap: 14 },
  menuIconWrap:   { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  menuLabel:      { flex: 1, fontSize: 15, fontWeight: '500', fontFamily: Theme.font.family.text },

  logoutRow:      { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 14, borderRadius: Theme.radius.md, borderWidth: 1, padding: 14, gap: 14, ...Theme.shadow.sm },
  logoutTxt:      { flex: 1, fontSize: 15, fontWeight: '700', fontFamily: Theme.font.family.text },

  version:        { textAlign: 'center', fontSize: 11, marginBottom: 8, fontFamily: Theme.font.family.text },
});