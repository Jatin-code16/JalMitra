// src/screens/SettingsScreen.jsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
  TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { Theme } from '../constants/theme';

export default function SettingsScreen() {
  const { farmer, farmId, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(farmer?.name || '');
  const [saving, setSaving] = useState(false);
  const [hindiMode, setHindiMode] = useState(true);

  const handleSaveName = async () => {
    if (!newName.trim()) {
      Alert.alert('Naam Zaroori Hai', 'Apna naam dalein');
      return;
    }
    setSaving(true);
    try {
      await authAPI.updateProfile({ name: newName.trim() });
      Alert.alert('Ho Gaya!', 'Naam update ho gaya');
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Naam update nahi hua');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Kya aap logout karna chahte hain?', [
      { text: 'Nahi', style: 'cancel' },
      { text: 'Haan', style: 'destructive', onPress: logout },
    ]);
  };

  // ── Inline styles using colors ──
  const themed = {
    container:    { backgroundColor: colors.bgBase },
    profileCard:  { backgroundColor: colors.bgCard2 },
    avatarCircle: { backgroundColor: colors.bgCard },
    section:      { backgroundColor: colors.bgCard, borderColor: colors.border },
    row:          { borderTopColor: colors.border },
    input:        { backgroundColor: colors.bgBase, borderColor: colors.border, color: colors.textPrimary },
    logoutBtn:    { borderColor: colors.red },
  };

  const FEATURE_TAGS = [
    { iconName: 'water',     label: 'Smart Sinchai' },
    { iconName: 'robot',     label: 'AI Saathi' },
    { iconName: 'chart-bar', label: 'Analytics' },
    { iconName: 'translate', label: 'Hinglish-first' },
  ];

  return (
    <SafeAreaView style={[styles.container, themed.container]} edges={['top']}>
      <ScrollView style={styles.scroll}>

      {/* Profile Card */}
      <View style={[styles.profileCard, themed.profileCard]}>
        <View style={[styles.avatarCircle, themed.avatarCircle]}>
          <Text style={styles.avatarText}>
            {farmer?.name?.[0]?.toUpperCase() || 'K'}
          </Text>
        </View>
        <Text style={[styles.farmerName, { color: colors.textPrimary }]}>
          {farmer?.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <MaterialCommunityIcons name="cellphone" size={14} color={colors.textTertiary} />
          <Text style={[styles.farmerPhone, { color: colors.textTertiary }]}>
            {farmer?.phone}
          </Text>
        </View>
        <View style={[styles.farmTag, { backgroundColor: colors.bgAction, borderColor: colors.borderAction }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="barley" size={12} color={colors.green} />
            <Text style={[styles.farmTagTxt, { color: colors.green }]}>
              {farmId}
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Section */}
      <View style={[styles.section, themed.section]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, paddingBottom: 6 }}>
          <MaterialCommunityIcons name="account" size={14} color={colors.textTertiary} />
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            PROFILE
          </Text>
        </View>

        {editing ? (
          <View style={[styles.editRow, themed.row]}>
            <TextInput
              style={[styles.nameInput, themed.input]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Apna naam dalein"
              placeholderTextColor={colors.textFaint}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.amber }]}
              onPress={handleSaveName}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={colors.textDark} size="small" />
                : <Text style={styles.saveBtnTxt}>Save</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => { setEditing(false); setNewName(farmer?.name || ''); }}
            >
              <Text style={[styles.cancelBtnTxt, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SettingRow
            colors={colors}
            iconName="pencil"
            label="Naam Badlein"
            value={farmer?.name}
            onPress={() => setEditing(true)}
          />
        )}

        <SettingRow
          colors={colors}
          iconName="cellphone"
          label="Phone Number"
          value={farmer?.phone}
          disabled
        />
      </View>

      {/* Farm Section */}
      <View style={[styles.section, themed.section]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, paddingBottom: 6 }}>
          <MaterialCommunityIcons name="barley" size={14} color={colors.textTertiary} />
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            KHET KI JAANKARI
          </Text>
        </View>
        <SettingRow colors={colors} iconName="identifier"  label="Farm ID"   value={farmId}          disabled />
        <SettingRow colors={colors} iconName="sprout"      label="Fasal"     value="Gehun (Wheat)"   disabled />
      </View>

      {/* App Settings */}
      <View style={[styles.section, themed.section]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, paddingBottom: 6 }}>
          <MaterialCommunityIcons name="cog" size={14} color={colors.textTertiary} />
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            APP SETTINGS
          </Text>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.switchRow, { borderTopColor: colors.border }]}>
          <MaterialCommunityIcons
            name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'}
            size={20}
            color={colors.amber}
          />
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Text style={[styles.switchSub, { color: colors.textTertiary }]}>
              {isDark ? 'Raat ke liye dark' : 'Din ke liye light'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.amber + '80' }}
            thumbColor={isDark ? colors.amber : colors.textFaint}
          />
        </View>

        {/* Hinglish Mode */}
        <View style={[styles.switchRow, { borderTopColor: colors.border }]}>
          <MaterialCommunityIcons name="translate" size={20} color={colors.green} />
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
              Hinglish Mode
            </Text>
            <Text style={[styles.switchSub, { color: colors.textTertiary }]}>
              App Hinglish mein dikhe
            </Text>
          </View>
          <Switch
            value={hindiMode}
            onValueChange={setHindiMode}
            trackColor={{ false: colors.border, true: colors.green + '80' }}
            thumbColor={hindiMode ? colors.green : colors.textFaint}
          />
        </View>
      </View>

      {/* About */}
      <View style={[styles.section, themed.section]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, paddingBottom: 6 }}>
          <MaterialCommunityIcons name="information" size={14} color={colors.textTertiary} />
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            BAARE MEIN
          </Text>
        </View>
        <View style={styles.aboutCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="sprout" size={20} color={colors.amber} />
            <Text style={[styles.aboutName, { color: colors.amber }]}>JalMitra</Text>
          </View>
          <Text style={[styles.aboutVer, { color: colors.textTertiary }]}>Version 1.0.0</Text>
          <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
            Smart sinchai system — AI saathi for kisan.
          </Text>
          <View style={styles.featureTags}>
            {FEATURE_TAGS.map((f, i) => (
              <View key={i} style={[styles.featureTag, { backgroundColor: colors.bgAction, borderColor: colors.borderAction }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MaterialCommunityIcons name={f.iconName} size={12} color={colors.green} />
                  <Text style={[styles.featureTagTxt, { color: colors.green }]}>{f.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={[styles.logoutBtn, themed.logoutBtn]} onPress={handleLogout}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="logout" size={18} color={colors.red} />
          <Text style={[styles.logoutTxt, { color: colors.red }]}>Logout karein</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Extracted SettingRow ──
function SettingRow({ colors, iconName, label, value, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        { borderTopColor: colors.border },
        disabled && { opacity: 0.65 },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={iconName} size={20} color={colors.textSecondary} />
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
        {value && (
          <Text style={[styles.rowValue, { color: colors.textTertiary }]}>{value}</Text>
        )}
      </View>
      {!disabled && (
        <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textFaint} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { flex: 1 },
  profileCard:  { padding: 32, alignItems: 'center' },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:   { fontSize: 32, fontWeight: '800', color: '#d4a843', fontFamily: Theme.font.family.display },
  farmerName:   { fontSize: 22, fontWeight: '800', fontFamily: Theme.font.family.display },
  farmerPhone:  { fontSize: 14, fontFamily: Theme.font.family.text },
  farmTag:      { marginTop: 10, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  farmTagTxt:   { fontSize: 12, fontWeight: '600', fontFamily: Theme.font.family.text },
  section:      { marginHorizontal: 16, marginTop: 14, borderRadius: Theme.radius.md, overflow: 'hidden', borderWidth: 1 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, fontFamily: Theme.font.family.text },
  settingRow:   { flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: 1, gap: 12 },
  rowInfo:      { flex: 1 },
  rowLabel:     { fontSize: 14, fontWeight: '600', fontFamily: Theme.font.family.text },
  rowValue:     { fontSize: 12, marginTop: 2, fontFamily: Theme.font.family.text },
  editRow:      { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1 },
  nameInput:    { flex: 1, borderRadius: 10, padding: 10, fontSize: 14, borderWidth: 1, fontFamily: Theme.font.family.text },
  saveBtn:      { borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  saveBtnTxt:   { fontWeight: '700', color: '#0e0e0a', fontSize: 13, fontFamily: Theme.font.family.display },
  cancelBtn:    { borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1 },
  cancelBtnTxt: { fontSize: 13, fontFamily: Theme.font.family.text },
  switchRow:    { flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: 1, gap: 12 },
  switchInfo:   { flex: 1 },
  switchLabel:  { fontSize: 14, fontWeight: '600', fontFamily: Theme.font.family.display },
  switchSub:    { fontSize: 12, marginTop: 2, fontFamily: Theme.font.family.text },
  aboutCard:    { padding: 16, borderTopWidth: 1, alignItems: 'center', borderTopColor: 'transparent' },
  aboutName:    { fontSize: 22, fontWeight: '800', fontFamily: Theme.font.family.display },
  aboutVer:     { fontSize: 12, marginTop: 2, fontFamily: Theme.font.family.text },
  aboutDesc:    { fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 10, fontFamily: Theme.font.family.text },
  featureTags:  { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 },
  featureTag:   { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  featureTagTxt:{ fontSize: 12, fontWeight: '600', fontFamily: Theme.font.family.text },
  logoutBtn:    { marginHorizontal: 16, marginTop: 14, borderRadius: Theme.radius.md, padding: 18, alignItems: 'center', borderWidth: 1.5, backgroundColor: 'transparent' },
  logoutTxt:    { fontSize: 16, fontWeight: '700', fontFamily: Theme.font.family.display },
});