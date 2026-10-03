import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import SettingsCard from '../components/SettingsCard';
import {
  getServerUrl,
  setServerUrl,
  getIsDemoMode,
  setIsDemoMode,
} from '../services/api';
import { playSosSound, triggerHaptic } from '../services/sound';

export default function SettingsScreen({
  status,
  isOnline,
  isDemo,
  soundEnabled,
  onToggleSound,
  onSaveSettings,
  onRefresh,
}) {
  const [serverUrlInput, setServerUrlInput] = useState(getServerUrl());
  const [demoSwitch, setDemoSwitch] = useState(getIsDemoMode());
  const [saveNetworkSuccess, setSaveNetworkSuccess] = useState(false);

  const handleSaveNetwork = () => {
    triggerHaptic('light');
    setServerUrl(serverUrlInput);
    setIsDemoMode(demoSwitch);
    setSaveNetworkSuccess(true);
    setTimeout(() => setSaveNetworkSuccess(false), 3000);
    if (onRefresh) onRefresh();
  };

  const handleTestSound = () => {
    triggerHaptic('heavy');
    playSosSound();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="settings" size={24} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>การตั้งค่าระบบ (Settings)</Text>
          <Text style={styles.screenSubTitle}>
            ปรับแต่งระยะสิ่งกีดขวาง เสียงแจ้งเตือน และการเชื่อมต่อ
          </Text>
        </View>
      </View>

      {/* 1. Distance & Alert Mode Settings Card */}
      <SettingsCard
        appliedThreshold={status.appliedThreshold}
        appliedMode={status.appliedMode}
        onSaveSettings={onSaveSettings}
      />

      {/* 2. Server & Hardware Connection Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="server-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>การเชื่อมต่อแว่นตา & เซิร์ฟเวอร์</Text>
        </View>

        {/* Connection Status indicator */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>สถานะปัจจุบัน:</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOnline
                  ? isDemo
                    ? COLORS.warningBg
                    : COLORS.successBg
                  : COLORS.dangerBg,
                borderColor: isOnline
                  ? isDemo
                    ? '#FDE68A'
                    : '#BBF7D0'
                  : COLORS.dangerBorder,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isOnline
                    ? isDemo
                      ? COLORS.warning
                      : COLORS.success
                    : COLORS.danger,
                },
              ]}
            />
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: isOnline
                    ? isDemo
                      ? COLORS.warning
                      : COLORS.success
                    : COLORS.danger,
                },
              ]}
            >
              {isOnline
                ? isDemo
                  ? 'โหมดจำลอง (Demo Mode)'
                  : 'เชื่อมต่อฐานข้อมูลแว่นตาแล้ว'
                : 'ไม่ได้เชื่อมต่อ'}
            </Text>
          </View>
        </View>

        {/* Demo Mode Toggle Switch */}
        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchTitle}>เปิดโหมดจำลอง (Demo Mode)</Text>
            <Text style={styles.switchDesc}>
              เปิดเพื่อทดสอบระบบจำลองระยะและ SOS โดยไม่ต้องมีฮาร์ดแวร์จริง
            </Text>
          </View>
          <Switch
            value={demoSwitch}
            onValueChange={(val) => {
              triggerHaptic('light');
              setDemoSwitch(val);
              setIsDemoMode(val);
              if (onRefresh) onRefresh();
            }}
            trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* Server IP / URL Input */}
        <View style={[styles.inputSection, demoSwitch && styles.inputDisabledSection]}>
          <Text style={styles.inputLabel}>URL เซิร์ฟเวอร์ XAMPP / ESP32</Text>
          <TextInput
            style={styles.textInput}
            value={serverUrlInput}
            onChangeText={setServerUrlInput}
            placeholder="http://127.0.0.1/glasses"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!demoSwitch}
          />
          <Text style={styles.inputHint}>
            *มือถือในวง Wi-Fi เดียวกันใช้ IP ของเครื่อง เช่น: http://127.0.0.1/glasses
          </Text>
        </View>

        {/* Save Connection Button */}
        <TouchableOpacity
          style={styles.saveNetworkBtn}
          onPress={handleSaveNetwork}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-done-outline" size={18} color={COLORS.white} />
          <Text style={styles.saveNetworkBtnText}>บันทึกการตั้งค่าเครือข่าย</Text>
        </TouchableOpacity>

        {saveNetworkSuccess && (
          <View style={styles.successNotice}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.successNoticeText}>บันทึกการเชื่อมต่อแล้ว</Text>
          </View>
        )}
      </View>

      {/* 3. Audio & Notifications Settings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="volume-high-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>เสียงเตือนและระบบสั่นในมือถือ</Text>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchTitle}>เสียงไซเรนฉุกเฉิน SOS บนมือถือ</Text>
            <Text style={styles.switchDesc}>
              ส่งเสียงไซเรนเตือนดังทันทีเมื่อตรวจพบสัญญาณขอความช่วยเหลือ SOS
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={() => {
              triggerHaptic('light');
              onToggleSound();
            }}
            trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <TouchableOpacity
          style={styles.testSoundBtn}
          onPress={handleTestSound}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={16} color={COLORS.primary} />
          <Text style={styles.testSoundBtnText}>ทดลองฟังเสียงไซเรน SOS</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 24,
  },
  topHeader: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  screenSubTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  switchTextWrap: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  inputSection: {
    marginTop: 12,
  },
  inputDisabledSection: {
    opacity: 0.5,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  inputHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  saveNetworkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  saveNetworkBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  successNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    justifyContent: 'center',
  },
  successNoticeText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },
  testSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  testSoundBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
