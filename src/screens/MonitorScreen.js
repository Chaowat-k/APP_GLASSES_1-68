import React from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import Header from '../components/Header';
import SensorRadar from '../components/SensorRadar';
import HistoryChart from '../components/HistoryChart';
import { triggerHaptic } from '../services/sound';

export default function MonitorScreen({
  status,
  isOnline,
  isDemo,
  soundEnabled,
  refreshing,
  onRefresh,
  onToggleSound,
  onOpenSettings,
  onTriggerTestSos,
  onNavigateToSos,
}) {
  const pendingSos = status.unacknowledgedSos || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Top Header */}
      <Header
        isOnline={isOnline}
        isDemo={isDemo}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onOpenSettings={onOpenSettings}
        onTriggerTestSos={onTriggerTestSos}
      />

      {/* Quick SOS Warning Alert if any active unacknowledged SOS */}
      {pendingSos.length > 0 && (
        <TouchableOpacity
          style={styles.quickSosNotice}
          onPress={() => {
            triggerHaptic('heavy');
            if (onNavigateToSos) onNavigateToSos();
          }}
          activeOpacity={0.85}
        >
          <View style={styles.quickSosIcon}>
            <Ionicons name="warning" size={20} color={COLORS.white} />
          </View>
          <View style={styles.quickSosTextWrap}>
            <Text style={styles.quickSosTitle}>
              มีสัญญาณฉุกเฉิน SOS {pendingSos.length} รายการ!
            </Text>
            <Text style={styles.quickSosSub}>
              แตะที่นี่เพื่อไปหน้า SOS และรับทราบเหตุการณ์
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      )}

      {/* 3-Direction Sensor Radar & Metrics */}
      <SensorRadar
        left={status.left}
        center={status.center}
        right={status.right}
        risk={status.risk}
        tilt={status.tilt}
        count={status.count}
        appliedThreshold={status.appliedThreshold}
        appliedMode={status.appliedMode}
      />

      {/* 60 Past Readings SVG Chart & History Table */}
      <HistoryChart history={status.history} />
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
  quickSosNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  quickSosIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSosTextWrap: {
    flex: 1,
  },
  quickSosTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  quickSosSub: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
  },
});
