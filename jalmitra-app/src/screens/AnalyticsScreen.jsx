// src/screens/AnalyticsScreen.jsx

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, sensorAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';

export default function AnalyticsScreen() {
  const { farmId } = useAuth();
  const { colors } = useTheme();
  const [weekly, setWeekly] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(colors);

  const fetchData = async () => {
    try {
      const [weeklyRes, historyRes] = await Promise.all([
        analyticsAPI.getWeekly(farmId),
        sensorAPI.getHistory(farmId),
      ]);
      setWeekly(weeklyRes.data);
      setHistory(historyRes.data.data || []);
    } catch (error) {
      console.log('Analytics error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Data load ho raha hai...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const summary = weekly?.summary;
  const waterChange = summary?.vs_last_week_percent || 0;
  const recent = history.slice(0, 7).reverse();
  const toNumber = (value) =>
    typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const moistureSeries = recent.map((r) => toNumber(r.soil_moisture));
  const tempSeries = recent.map((r) => toNumber(r.temperature));
  const humiditySeries = recent.map((r) => toNumber(r.humidity));
  const timeLabels = recent.map((r) =>
    new Date(r.timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
  const latestMoisture = recent.length ? toNumber(recent[recent.length - 1].soil_moisture) : null;
  const latestTemp = recent.length ? toNumber(recent[recent.length - 1].temperature) : null;
  const latestHumidity = recent.length ? toNumber(recent[recent.length - 1].humidity) : null;
  const waterTrendText = waterChange === 0
    ? 'Pichle hafte jaisa'
    : `${Math.abs(waterChange)}% ${waterChange < 0 ? 'kam' : 'zyada'}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
      {/* Week Header */}
      <View style={styles.weekHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="calendar" size={18} color={colors.bgScreen} />
          <Text style={styles.weekTitle}>Is hafte ki summary</Text>
        </View>
        {weekly?.week && (
          <Text style={styles.weekRange}>
            {weekly.week.from} → {weekly.week.to}
          </Text>
        )}
      </View>

      {/* Simple Summary */}
      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Is hafte ka seedha summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {summary.total_water_used_liters}L
              </Text>
              <Text style={styles.summaryLabel}>Pani upyog</Text>
              <Text style={[
                styles.summarySub,
                { color: waterChange < 0 ? colors.success : colors.warning }
              ]}>
                {waterTrendText}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.green }]}>
                {summary.pump_on_count}
              </Text>
              <Text style={styles.summaryLabel}>Pump chalu</Text>
              <Text style={styles.summarySub}>
                {summary.days_irrigated} din sinchai
              </Text>
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryFootText}>
              Pani bacha din: {summary.days_skipped} / 7
            </Text>
          </View>
        </View>
      )}

      {/* Visual Plots */}
      {recent.length > 0 ? (
        <View style={styles.plotsWrap}>
          <PlotCard
            title="Mitti ki nami"
            valueText={latestMoisture == null ? '--' : `${Math.round(latestMoisture)}%`}
            data={moistureSeries}
            labels={timeLabels}
            max={100}
            color={colors.green}
            hint="Sukha < 40 | Theek 40-65 | Zyada nami"
            styles={styles}
          />
          <PlotCard
            title="Taapman"
            valueText={latestTemp == null ? '--' : `${Math.round(latestTemp)}°C`}
            data={tempSeries}
            labels={timeLabels}
            max={50}
            color={colors.amber}
            hint="Normal 18-35°C"
            styles={styles}
          />
          <PlotCard
            title="Humidity"
            valueText={latestHumidity == null ? '--' : `${Math.round(latestHumidity)}%`}
            data={humiditySeries}
            labels={timeLabels}
            max={100}
            color={colors.blue}
            hint="Ideal 45-70%"
            styles={styles}
          />
        </View>
      ) : (
        <View style={styles.plotEmpty}>
          <Text style={styles.plotEmptyTitle}>Plots ban rahe hain...</Text>
          <Text style={styles.plotEmptySub}>
            Sensor data aate hi simple charts dikh jaenge.
          </Text>
        </View>
      )}

      {/* AI Insight */}
      {weekly?.insight && (
        <View style={styles.insightCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <MaterialCommunityIcons name="robot" size={14} color={colors.primary} />
            <Text style={styles.insightTitle}>
              JalMitra ki Salah
            </Text>
          </View>
          <Text style={styles.insightText}>
            {weekly.insight}
          </Text>
        </View>
      )}

      {/* Recent Readings */}
      {history.length > 0 && (
        <View style={styles.historyCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <MaterialCommunityIcons name="chart-bar" size={16} color={colors.textDark} />
            <Text style={styles.historyTitle}>
              Taza readings (last 5)
            </Text>
          </View>
          {history.slice(0, 5).map((reading, index) => (
            <View key={index} style={styles.readingRow}>
              <Text style={styles.readingTime}>
                {new Date(reading.timestamp)
                  .toLocaleString('hi-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short'
                  })}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <MaterialCommunityIcons name="water" size={12} color={colors.green} />
                <Text style={styles.readingValue}>
                  {reading.soil_moisture == null ? '--' : `${reading.soil_moisture.toFixed(1)}%`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <MaterialCommunityIcons name="thermometer" size={12} color={colors.amber} />
                <Text style={styles.readingValue}>
                  {reading.temperature == null ? '--' : `${reading.temperature.toFixed(1)}°C`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <MaterialCommunityIcons name="weather-windy" size={12} color={colors.blue} />
                <Text style={styles.readingValue}>
                  {reading.humidity == null ? '--' : `${reading.humidity.toFixed(1)}%`}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Line Chart ──
function getSeriesStats(data) {
  if (!data.length) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.min(...data),
    max: Math.max(...data),
  };
}

function LineChart({ data, max = 100, color, styles }) {
  const [width, setWidth] = useState(0);
  const height = 80;
  const safeData = data.length ? data : [0, 0];
  const safeMax = Math.max(max, ...safeData, 1);

  const points = safeData.map((value, index) => {
    const x = safeData.length === 1
      ? width / 2
      : (index / (safeData.length - 1)) * width;
    const y = height - (value / safeMax) * height;
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = width
    ? `M 0 ${height} ${linePath} L ${width} ${height} Z`
    : '';

  const gradientId = `grad-${color.replace('#', '')}`;

  const lastPoint = points[points.length - 1];

  return (
    <View
      style={styles.chartFrame}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Svg width={width} height={height} style={styles.chartSvg}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </LinearGradient>
          </Defs>
          <Line x1="0" y1={height * 0.33} x2={width} y2={height * 0.33} stroke={color} strokeOpacity={0.12} />
          <Line x1="0" y1={height * 0.66} x2={width} y2={height * 0.66} stroke={color} strokeOpacity={0.12} />
          <Path d={areaPath} fill={`url(#${gradientId})`} />
          <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />
          {lastPoint && (
            <Circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={4}
              fill={color}
              stroke="#ffffff"
              strokeWidth={2}
            />
          )}
        </Svg>
      )}
    </View>
  );
}

// ── Plot Card ──
function PlotCard({ title, valueText, data, labels, max, color, hint, styles }) {
  const stats = getSeriesStats(data);
  return (
    <View style={styles.plotCard}>
      <View style={styles.plotHeader}>
        <Text style={styles.plotTitle}>{title}</Text>
        <Text style={[styles.plotValue, { color }]}>{valueText}</Text>
      </View>
      <LineChart data={data} max={max} color={color} styles={styles} />
      <TimeAxis labels={labels} styles={styles} />
      <View style={styles.chartMetaRow}>
        <Text style={styles.chartMetaText}>Min {Math.round(stats.min)}</Text>
        <Text style={styles.chartMetaText}>Max {Math.round(stats.max)}</Text>
      </View>
      {hint ? (
        <Text style={styles.plotHint}>{hint}</Text>
      ) : null}
    </View>
  );
}

function TimeAxis({ labels = [], styles }) {
  if (!labels.length) return null;
  const lastIndex = labels.length - 1;
  const midIndex = Math.floor(lastIndex / 2);
  return (
    <View style={styles.axisRow}>
      <Text style={styles.axisLabel}>{labels[0]}</Text>
      <Text style={styles.axisLabel}>{labels[midIndex]}</Text>
      <Text style={styles.axisLabel}>{labels[lastIndex]}</Text>
    </View>
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
    fontFamily: Theme.font.family.text,
  },

  // Week Header
  weekHeader: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 16,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.bgScreen,
    fontFamily: Theme.font.family.display,
  },
  weekRange: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontFamily: Theme.font.family.text,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.bgScreen,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Theme.shadow.sm,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    fontFamily: Theme.font.family.display,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Theme.font.family.display,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontFamily: Theme.font.family.text,
  },
  summarySub: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: Theme.font.family.text,
  },
  summaryDivider: {
    width: 1,
    height: 56,
    marginHorizontal: 12,
  },
  summaryFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryFootText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    fontFamily: Theme.font.family.text,
  },

  // Plots
  plotsWrap: {
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  plotCard: {
    backgroundColor: colors.bgScreen,
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...Theme.shadow.sm,
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  plotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: Theme.font.family.display,
  },
  plotValue: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Theme.font.family.display,
  },
  plotHint: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 8,
    fontFamily: Theme.font.family.text,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textFaint,
    fontFamily: Theme.font.family.text,
  },
  chartMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartMetaText: {
    fontSize: 10,
    color: colors.textFaint,
    fontFamily: Theme.font.family.text,
  },
  chartFrame: {
    height: 80,
    backgroundColor: colors.bgBase,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chartSvg: {
    borderRadius: 12,
  },
  plotEmpty: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgScreen,
  },
  plotEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: Theme.font.family.display,
  },
  plotEmptySub: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 6,
    fontFamily: Theme.font.family.text,
  },

  // Insight
  insightCard: {
    backgroundColor: colors.primaryFaint,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Theme.radius.lg,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: Theme.font.family.display,
  },
  insightText: {
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 22,
    fontFamily: Theme.font.family.text,
  },

  // History
  historyCard: {
    backgroundColor: colors.bgScreen,
    margin: 16,
    marginTop: 12,
    borderRadius: Theme.radius.lg,
    padding: 16,
    ...Theme.shadow.sm,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    fontFamily: Theme.font.family.display,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  readingTime: {
    fontSize: 11,
    color: colors.textLight,
    flex: 1,
    fontFamily: Theme.font.family.text,
  },
  readingValue: {
    fontSize: 12,
    color: colors.textDark,
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: Theme.font.family.text,
  },
});