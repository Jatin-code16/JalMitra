// src/screens/AlertsScreen.jsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';
import BrandMark from '../components/BrandMark';

const MOCK_ALERTS = [
  {
    id: '1',
    type: 'danger',
    iconName: 'sprout',
    title: 'Mitti sookh rahi hai',
    message: 'Gehun khet ki nami gir kar',
    highlight: '21%',
    time: 'Aaj, 8:30 AM',
    dismissed: false,
  },
  {
    id: '2',
    type: 'warning',
    iconName: 'cog',
    title: 'Motor zyada der se chal rahi hai',
    message: 'Pump chal raha hai',
    highlight: '50 minutes',
    suffix: ', ek baar check karein',
    time: 'Aaj, 7:45 AM',
    dismissed: false,
  },
  {
    id: '3',
    type: 'grey',
    iconName: 'access-point-off',
    title: 'Device offline hai',
    message: 'Sabzi khet ka device offline hai',
    highlight: '2 hours',
    time: 'Aaj, 6:10 AM',
    dismissed: false,
  },
];

export default function AlertsScreen() {
  const { colors } = useTheme();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const dismiss = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'danger':  return { bg: colors.alertRedBg,   border: colors.alertRedBorder,   highlight: colors.red };
      case 'warning': return { bg: colors.alertAmberBg, border: colors.alertAmberBorder, highlight: colors.amber };
      default:        return { bg: colors.alertGreyBg,  border: colors.alertGreyBorder,  highlight: colors.textSecondary };
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bgScreen }}
      edges={['top']}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgBase }]}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.bgScreen }]}>
        <BrandMark size={24} />
        <View style={styles.bellWrap}>
          <MaterialCommunityIcons name="bell" size={22} color={colors.textSecondary} />
          {alerts.length > 0 && (
            <View style={[styles.bellBadge, { backgroundColor: colors.red }]}>
              <Text style={styles.bellBadgeTxt}>{alerts.length}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.pageHeader, { backgroundColor: colors.bgScreen }]}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Alerts & Updates</Text>
        <Text style={[styles.pageSub, { color: colors.textTertiary }]}>
          Khet aur devices ki updates yahan milengi.
        </Text>
      </View>

      <View style={styles.alertsList}>
        {alerts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.bgScreen, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="check-circle" size={40} color={colors.green} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTxt, { color: colors.textPrimary }]}>
              Sab theek hai!
            </Text>
            <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
              Koi alert nahi hai abhi.
            </Text>
          </View>
        ) : (
          alerts.map(alert => {
            const st = getAlertStyle(alert.type);
            return (
              <View
                key={alert.id}
                style={[styles.alertCard, { backgroundColor: st.bg, borderColor: st.border }]}
              >
                <View style={styles.alertTop}>
                  {/* Icon circle */}
                  <View style={[styles.alertIconWrap, { backgroundColor: st.highlight + '20' }]}>
                    <MaterialCommunityIcons name={alert.iconName} size={28} color={st.highlight} />
                    <View style={[styles.alertSeverityDot, { backgroundColor: st.highlight }]}>
                      <Text style={{ fontSize: 8, color: '#fff', fontWeight: '800', fontFamily: Theme.font.family.text }}>!</Text>
                    </View>
                  </View>

                  {/* Content */}
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, { color: st.highlight }]}>
                      {alert.title}
                    </Text>
                    <Text style={[styles.alertMsg, { color: colors.textPrimary }]}>
                      {alert.message}{' '}
                      <Text style={[styles.alertHighlight, { color: st.highlight }]}>
                        {alert.highlight}
                      </Text>
                      {alert.suffix || ''}
                    </Text>
                  </View>
                </View>

                {/* Bottom row */}
                <View style={[styles.alertBottom, { borderTopColor: st.border }]}>
                  <Text style={[styles.alertTime, { color: colors.textTertiary }]}>
                    {alert.time}
                  </Text>
                  <TouchableOpacity
                    style={[styles.dismissBtn, { borderColor: st.highlight }]}
                    onPress={() => dismiss(alert.id)}
                  >
                    <Text style={[styles.dismissTxt, { color: st.highlight }]}>Hatao</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  topHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  bellWrap:         { position: 'relative' },
  bellBadge:        { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  bellBadgeTxt:     { fontSize: 9, color: '#fff', fontWeight: '800', fontFamily: Theme.font.family.text },
  pageHeader:       { paddingHorizontal: 16, paddingBottom: 16 },
  pageTitle:        { fontSize: 32, fontWeight: '900', fontFamily: Theme.font.family.display },
  pageSub:          { fontSize: 14, marginTop: 4, lineHeight: 20, fontFamily: Theme.font.family.text },
  alertsList:       { padding: 16, gap: 14 },
  alertCard:        { borderRadius: Theme.radius.lg, borderWidth: 1.5, overflow: 'hidden' },
  alertTop:         { flexDirection: 'row', padding: 16, gap: 14, alignItems: 'flex-start' },
  alertIconWrap:    { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', position: 'relative', flexShrink: 0 },
  alertSeverityDot: { position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  alertContent:     { flex: 1 },
  alertTitle:       { fontSize: 17, fontWeight: '800', marginBottom: 4, fontFamily: Theme.font.family.display },
  alertMsg:         { fontSize: 14, lineHeight: 21, fontFamily: Theme.font.family.text },
  alertHighlight:   { fontWeight: '800', fontFamily: Theme.font.family.display },
  alertBottom:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  alertTime:        { fontSize: 12, fontFamily: Theme.font.family.text },
  dismissBtn:       { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 6 },
  dismissTxt:       { fontSize: 13, fontWeight: '700', fontFamily: Theme.font.family.text },
  emptyCard:        { borderRadius: Theme.radius.lg, borderWidth: 1, padding: 40, alignItems: 'center' },
  emptyTxt:         { fontSize: 18, fontWeight: '700', fontFamily: Theme.font.family.display },
  emptySub:         { fontSize: 14, marginTop: 6, fontFamily: Theme.font.family.text },
});