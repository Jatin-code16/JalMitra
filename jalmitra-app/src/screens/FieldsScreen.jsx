// src/screens/FieldsScreen.jsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sensorAPI, analyticsAPI } from '../services/api';
import { Theme } from '../constants/theme';
import BrandMark from '../components/BrandMark';

// ── Crop config — icon + color per crop type ──
const CROP_CONFIG = {
  wheat:      { iconName: 'barley',     label: 'Wheat',      color: '#D4A843' },
  rice:       { iconName: 'barley',     label: 'Rice',       color: '#5aad6e' },
  cotton:     { iconName: 'leaf',       label: 'Cotton',     color: '#5a8ed4' },
  sugarcane:  { iconName: 'grass',      label: 'Sugarcane',  color: '#2D8A4E' },
  maize:      { iconName: 'corn',       label: 'Maize',      color: '#E65100' },
  vegetables: { iconName: 'food-apple', label: 'Vegetables', color: '#1B6B3A' },
  soybean:    { iconName: 'seed',       label: 'Soybean',    color: '#8B6914' },
  default:    { iconName: 'sprout',     label: 'Other',      color: '#5aad6e' },
};

export default function FieldsScreen({ navigation }) {
  const { farmer, farmId } = useAuth();
  const { colors } = useTheme();

  const [fields,     setFields]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // For now we have one farm — show it with live data
  const fetchFields = async () => {
    try {
      const [sensorRes, recRes] = await Promise.all([
        sensorAPI.getLatest(farmId),
        analyticsAPI.getRecommendation(farmId),
      ]);

      // Build field list from our single farm
      // In production, fetch from /farms endpoint
      setFields([
        {
          id: farmId,
          name: 'Mera Khet',
          crop_type: 'wheat',
          location: 'Raipur, CG',
          area_acres: 2.5,
          soil_moisture: sensorRes.data.data?.soil_moisture,
          temperature: sensorRes.data.data?.temperature,
          recommendation: recRes.data?.recommendation,
          sensor_online: sensorRes.data.status?.sensor_online,
        },
        // Mock second field for demo
        {
          id: 'farm_demo',
          name: 'Doosra Khet',
          crop_type: 'vegetables',
          location: 'Durg, CG',
          area_acres: 1.2,
          soil_moisture: 21,
          temperature: 32,
          recommendation: 'irrigate',
          sensor_online: false,
          isDemoField: true,
        },
      ]);
    } catch (e) {
      console.log('Fields error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchFields(); }, []);

  const getMoistureStatus = (v, rec) => {
    if (!v) return { label: 'Offline', color: colors.textFaint, bg: colors.alertGreyBg, border: colors.alertGreyBorder };
    if (rec === 'irrigate' || v < 40) return { label: 'Sukha Alert', color: colors.red, bg: colors.alertRedBg, border: colors.alertRedBorder };
    if (v > 65)  return { label: 'Zyada nami', color: colors.blue, bg: colors.blueFaint, border: colors.border };
    return              { label: 'Online',  color: colors.green, bg: colors.greenFaint, border: colors.greenBorder };
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgBase }} edges={['top']}>
        <View style={[styles.center, { backgroundColor: colors.bgBase }]}>
          <ActivityIndicator size="large" color={colors.green} />
          <Text style={[styles.loadingTxt, { color: colors.textTertiary }]}>
            Khet load ho rahe hain...
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
      {/* ── Top Header ── */}
      <View style={[styles.topHeader, { backgroundColor: colors.bgScreen }]}>
        <BrandMark size={24} />
        <View style={styles.headerRight}>
          <TouchableOpacity style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="bell" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgBase }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchFields(); }}
            colors={[colors.green]}
            tintColor={colors.green}
          />
        }
      >
        {/* Page Header */}
        <View style={[styles.pageHeader, { backgroundColor: colors.bgScreen }]}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
            Aapke Khet
          </Text>
          <Text style={[styles.pageSub, { color: colors.textTertiary }]}>
            Apne sabhi khet yahan dekhein aur manage karein.
          </Text>
        </View>

        {/* Fields List */}
        <View style={styles.fieldsList}>
          {fields.map((field) => {
            const crop   = CROP_CONFIG[field.crop_type] || CROP_CONFIG.default;
            const status = getMoistureStatus(field.soil_moisture, field.recommendation);

            return (
              <TouchableOpacity
                key={field.id}
                style={[styles.fieldCard, {
                  backgroundColor: colors.bgScreen,
                  borderColor: colors.border,
                }]}
                activeOpacity={0.88}
                onPress={() => {
                  if (!field.isDemoField) {
                    navigation.navigate('Home');
                  }
                }}
              >
                {/* Crop Image / Icon Block */}
                <View style={[styles.cropImageBlock, { backgroundColor: crop.color + '18' }]}>
                  <MaterialCommunityIcons name={crop.iconName} size={38} color={crop.color} />
                </View>

                {/* Field Info */}
                <View style={styles.fieldInfo}>
                  {/* Name + Status badge */}
                  <View style={styles.fieldNameRow}>
                    <Text style={[styles.fieldName, { color: colors.textPrimary }]}>
                      {field.name}
                    </Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: status.bg,
                      borderColor: status.border,
                    }]}>
                      <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                      <Text style={[styles.statusTxt, { color: status.color }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Location */}
                  <View style={styles.locationRow}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={colors.textTertiary} />
                    <Text style={[styles.locationTxt, { color: colors.textTertiary }]}>
                      {field.location}
                    </Text>
                  </View>

                  {/* Crop + Area */}
                  <View style={styles.cropRow}>
                    <View style={[styles.cropTag, { backgroundColor: crop.color + '18' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name={crop.iconName} size={12} color={crop.color} />
                        <Text style={[styles.cropTagTxt, { color: crop.color }]}>
                          {crop.label}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <MaterialCommunityIcons name="ruler-square" size={11} color={colors.textTertiary} />
                      <Text style={[styles.areaTag, { color: colors.textTertiary }]}>
                        {field.area_acres} acre
                      </Text>
                    </View>
                  </View>

                  {/* Moisture pill */}
                  {field.soil_moisture && (
                    <View style={[styles.moisturePill, {
                      backgroundColor: colors.blueFaint,
                      borderColor: colors.border,
                    }]}>
                      <MaterialCommunityIcons name="water" size={14} color={colors.blue} />
                      <Text style={[styles.moistureTxt, { color: colors.blue }]}>
                        {field.soil_moisture.toFixed(0)}% Nami
                      </Text>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textFaint} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Field FAB area */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Floating Add Button ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.green }]}
        activeOpacity={0.88}
        onPress={() => alert('Naya khet add karne ki feature jald aa rahi hai!')}
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.bgScreen} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingTxt:     { fontSize: 14, fontFamily: Theme.font.family.text },

  topHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  headerRight:    { flexDirection: 'row', alignItems: 'center' },

  pageHeader:     { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },
  pageTitle:      { fontSize: 32, fontWeight: '900', fontFamily: Theme.font.family.display },
  pageSub:        { fontSize: 14, marginTop: 4, lineHeight: 20, fontFamily: Theme.font.family.text },

  fieldsList:     { padding: 16, gap: 14 },

  fieldCard:      { flexDirection: 'row', alignItems: 'center', borderRadius: Theme.radius.lg, borderWidth: 1, padding: 14, gap: 14, ...Theme.shadow.sm },

  cropImageBlock: { width: 72, height: 72, borderRadius: Theme.radius.md, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },

  fieldInfo:      { flex: 1, gap: 6 },
  fieldNameRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  fieldName:      { fontSize: 17, fontWeight: '800', flex: 1, fontFamily: Theme.font.family.display },

  statusBadge:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, gap: 5, flexShrink: 0 },
  statusDot:      { width: 7, height: 7, borderRadius: 4 },
  statusTxt:      { fontSize: 11, fontWeight: '700', fontFamily: Theme.font.family.text },

  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationTxt:    { fontSize: 12, fontFamily: Theme.font.family.text },

  cropRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cropTag:        { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  cropTagTxt:     { fontSize: 11, fontWeight: '700', fontFamily: Theme.font.family.text },
  areaTag:        { fontSize: 11, fontFamily: Theme.font.family.text },

  moisturePill:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, gap: 5, alignSelf: 'flex-start' },
  moistureTxt:    { fontSize: 13, fontWeight: '700', fontFamily: Theme.font.family.text },

  fab:            { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', ...Theme.shadow.green },
});