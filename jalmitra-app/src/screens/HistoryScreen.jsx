// src/screens/HistoryScreen.jsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { sensorAPI, pumpAPI } from '../services/api';
import { Theme } from '../constants/theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

export default function HistoryScreen() {
  const { farmId } = useAuth();
  const { colors } = useTheme();

  const [activeFilter, setActiveFilter] = useState('7days');
  const [readings,     setReadings]     = useState([]);
  const [pumpHistory,  setPumpHistory]  = useState([]);
  const [refreshing,   setRefreshing]   = useState(false);

  const fetchData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        sensorAPI.getHistory(farmId),
        pumpAPI.getHistory(farmId, 10),
      ]);
      setReadings(sRes.data.data || []);
      setPumpHistory(pRes.data.history || []);
    } catch (e) {
      console.log('History error:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const FILTERS = [
    { key: '7days',   iconName: 'calendar',  label: 'Pichhle 7 din' },
    { key: 'month',   iconName: 'calendar',  label: 'Pichhla mahina' },
    { key: 'bycrop',  iconName: 'leaf',      label: 'Fasal ke hisab se' },
  ];

  // Build chart data from readings (last 7 points)
  const chartData = readings.slice(0, 7).reverse();
  const maxMoisture = Math.max(...chartData.map(r => r.soil_moisture || 0), 100);
  const CHART_HEIGHT = 120;

  // Label days
  const getDayLabel = (timestamp, index, total) => {
    if (index === total - 1) return 'Aaj';
    const days = total - 1 - index;
    return `${days} din\npehle`;
  };

  // Water used calculation
  const totalWater = pumpHistory
    .filter(l => l.action === 'ON')
    .reduce((sum, l) => sum + (l.water_used_liters || 0), 0);

  const irrigationEvents = pumpHistory.filter(l => l.action === 'ON');

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
        {/* ── Page Header ── */}
        <View style={[styles.pageHeader, { backgroundColor: colors.bgScreen }]}>
          <View style={styles.pageHeaderTop}>
            <TouchableOpacity>
              <MaterialCommunityIcons name="arrow-left" size={20} color={colors.green} />
            </TouchableOpacity>
            <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>
              Sinchai History
            </Text>
            <TouchableOpacity>
              <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filter Pills ── */}
        <View style={[styles.filterRow, { backgroundColor: colors.bgScreen }]}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterPill,
                activeFilter === f.key
                  ? [styles.filterPillActive, { backgroundColor: colors.green }]
                  : [styles.filterPillInactive, { borderColor: colors.border, backgroundColor: colors.bgBase }]
              ]}
              onPress={() => setActiveFilter(f.key)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons
                  name={f.iconName}
                  size={12}
                  color={activeFilter === f.key ? colors.bgScreen : colors.textTertiary}
                />
                <Text style={[
                  styles.filterTxt,
                  { color: activeFilter === f.key ? colors.bgScreen : colors.textTertiary }
                ]}>
                  {f.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Moisture Chart Card ── */}
        <View style={[styles.chartCard, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <MaterialCommunityIcons name="water" size={18} color={colors.blue} />
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                Mitti Nami Trend (%)
              </Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={[styles.legendLine, { backgroundColor: colors.green }]} />
              <Text style={[styles.legendTxt, { color: colors.textTertiary }]}>
                Nami (%)
              </Text>
            </View>
          </View>

          {/* Y axis + bars */}
          <View style={styles.chartBody}>
            {/* Y axis labels */}
            <View style={styles.yAxis}>
              {[100, 75, 50, 25, 0].map(v => (
                <Text key={v} style={[styles.yLabel, { color: colors.textFaint }]}>{v}</Text>
              ))}
            </View>

            {/* Chart area */}
            <View style={styles.chartArea}>
              {/* Horizontal grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={[styles.gridLine, {
                    bottom: (i / 4) * CHART_HEIGHT,
                    borderBottomColor: colors.border,
                  }]}
                />
              ))}

              {/* Ideal zone shading */}
              <View style={[styles.idealZone, {
                bottom: (40 / 100) * CHART_HEIGHT,
                height: (20 / 100) * CHART_HEIGHT,
                backgroundColor: colors.green + '15',
                borderTopColor: colors.green + '40',
                borderBottomColor: colors.green + '40',
              }]} />

              {/* Data points + line */}
              {chartData.length > 0 ? (
                <View style={styles.dataPointsWrap}>
                  {chartData.map((r, i) => {
                    const val = r.soil_moisture || 0;
                    const x = (i / Math.max(chartData.length - 1, 1)) * (CHART_WIDTH - 40);
                    const y = (val / 100) * CHART_HEIGHT;
                    const pointColor = val < 40 ? colors.red : val > 65 ? colors.blue : colors.green;

                    return (
                      <View
                        key={i}
                        style={[styles.dataPoint, {
                          left: x - 4,
                          bottom: y - 4,
                          backgroundColor: pointColor,
                          borderColor: colors.bgScreen,
                        }]}
                      />
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noDataWrap}>
                  <Text style={[styles.noDataTxt, { color: colors.textFaint }]}>
                    Data aa raha hai...
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* X axis labels */}
          <View style={styles.xAxis}>
            {chartData.map((r, i) => (
              <View key={i} style={styles.xLabelWrap}>
                <Text style={[styles.xLabel, { color: colors.textFaint }]}>
                  {getDayLabel(r.timestamp, i, chartData.length)}
                </Text>
                {r.soil_moisture && (
                  <Text style={[styles.xValue, { color: colors.green }]}>
                    {r.soil_moisture.toFixed(0)}%
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── Irrigation Events ── */}
        <View style={[styles.eventsSection, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
          <View style={styles.eventsHeader}>
            <View style={styles.eventsTitleRow}>
              <MaterialCommunityIcons name="refresh" size={18} color={colors.textPrimary} />
              <Text style={[styles.eventsTitle, { color: colors.textPrimary }]}>
                Sinchai Events
              </Text>
            </View>
            <Text style={[styles.eventsTotal, { color: colors.green }]}>
              Total: {irrigationEvents.length}
            </Text>
          </View>

          {irrigationEvents.length === 0 ? (
            <View style={styles.noEvents}>
              <Text style={[styles.noEventsTxt, { color: colors.textTertiary }]}>
                Abhi tak koi sinchai event nahi hai.
              </Text>
            </View>
          ) : (
            irrigationEvents.map((event, i) => {
              const date = new Date(event.timestamp);
              const dateStr = date.toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              });
              const timeStr = date.toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.eventCard, {
                    backgroundColor: colors.bgBase,
                    borderColor: colors.border,
                  }]}
                  activeOpacity={0.85}
                >
                  {/* Left icon */}
                  <View style={[styles.eventIcon, { backgroundColor: colors.greenFaint }]}>
                    <MaterialCommunityIcons name="water" size={22} color={colors.green} />
                  </View>

                  {/* Date + Location */}
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventDate, { color: colors.textPrimary }]}>
                      {dateStr}
                    </Text>
                    <View style={styles.eventLocationRow}>
                      <MaterialCommunityIcons name="map-marker" size={11} color={colors.textTertiary} />
                      <Text style={[styles.eventLocation, { color: colors.textTertiary }]}>
                        Gehun Khet — Raipur
                      </Text>
                    </View>
                  </View>

                  {/* Duration */}
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaRow}>
                      <MaterialCommunityIcons name="timer" size={12} color={colors.green} />
                      <Text style={[styles.eventMetaVal, { color: colors.green }]}>
                        {event.duration_minutes || '--'} min
                      </Text>
                    </View>
                    <Text style={[styles.eventMetaLabel, { color: colors.textTertiary }]}>
                      Avadhi
                    </Text>
                  </View>

                  {/* Water */}
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaRow}>
                      <MaterialCommunityIcons name="water" size={12} color={colors.blue} />
                      <Text style={[styles.eventWaterVal, { color: colors.blue }]}>
                        {event.water_used_liters
                          ? `${event.water_used_liters.toLocaleString()} L`
                          : '--'}
                      </Text>
                    </View>
                    <Text style={[styles.eventMetaLabel, { color: colors.textTertiary }]}>
                      Pani use
                    </Text>
                  </View>

                  <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textFaint} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },

  pageHeader:       { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  pageHeaderTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle:        { fontSize: 22, fontWeight: '900', flex: 1, textAlign: 'center', fontFamily: Theme.font.family.display },

  filterRow:        { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterPill:       { borderRadius: 24, paddingHorizontal: 14, paddingVertical: 8 },
  filterPillActive: { },
  filterPillInactive:{ borderWidth: 1 },
  filterTxt:        { fontSize: 12, fontWeight: '600', fontFamily: Theme.font.family.text },

  chartCard:        { marginHorizontal: 16, marginBottom: 14, borderRadius: Theme.radius.lg, borderWidth: 1, padding: 16, ...Theme.shadow.sm },
  chartHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  chartTitleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartTitle:       { fontSize: 14, fontWeight: '700', fontFamily: Theme.font.family.display },
  chartLegend:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine:       { width: 20, height: 2.5, borderRadius: 2 },
  legendTxt:        { fontSize: 11, fontFamily: Theme.font.family.text },

  chartBody:        { flexDirection: 'row', height: 120, marginBottom: 8 },
  yAxis:            { width: 28, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4 },
  yLabel:           { fontSize: 9, fontFamily: Theme.font.family.text },
  chartArea:        { flex: 1, position: 'relative' },
  gridLine:         { position: 'absolute', left: 0, right: 0, borderBottomWidth: 1, borderStyle: 'dashed' },
  idealZone:        { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderBottomWidth: 1 },
  dataPointsWrap:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dataPoint:        { position: 'absolute', width: 9, height: 9, borderRadius: 5, borderWidth: 2 },
  noDataWrap:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataTxt:        { fontSize: 13, fontFamily: Theme.font.family.text },

  xAxis:            { flexDirection: 'row', paddingLeft: 28, marginTop: 4 },
  xLabelWrap:       { flex: 1, alignItems: 'center' },
  xLabel:           { fontSize: 8, textAlign: 'center', lineHeight: 12, fontFamily: Theme.font.family.text },
  xValue:           { fontSize: 9, fontWeight: '700', marginTop: 2, fontFamily: Theme.font.family.text },

  eventsSection:    { marginHorizontal: 16, borderRadius: Theme.radius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  eventsHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 12 },
  eventsTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eventsTitle:      { fontSize: 16, fontWeight: '800', fontFamily: Theme.font.family.display },
  eventsTotal:      { fontSize: 14, fontWeight: '700', fontFamily: Theme.font.family.text },

  noEvents:         { padding: 24, alignItems: 'center' },
  noEventsTxt:      { fontSize: 13, fontFamily: Theme.font.family.text },

  eventCard:        { flexDirection: 'row', alignItems: 'center', borderRadius: Theme.radius.md, borderWidth: 1, margin: 10, marginTop: 0, padding: 14, gap: 10 },
  eventIcon:        { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  eventInfo:        { flex: 1, gap: 4 },
  eventDate:        { fontSize: 14, fontWeight: '700', fontFamily: Theme.font.family.display },
  eventLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  eventLocation:    { fontSize: 11, fontFamily: Theme.font.family.text },
  eventMeta:        { alignItems: 'center', gap: 2 },
  eventMetaRow:     { flexDirection: 'row', alignItems: 'center', gap: 3 },
  eventMetaVal:     { fontSize: 13, fontWeight: '700', fontFamily: Theme.font.family.text },
  eventWaterVal:    { fontSize: 13, fontWeight: '700', fontFamily: Theme.font.family.text },
  eventMetaLabel:   { fontSize: 9, fontFamily: Theme.font.family.text },
});