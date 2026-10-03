import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './src/theme/colors';
import {
  fetchStatus,
  saveSettings,
  acknowledgeSos,
  triggerSimulatedSos,
  triggerSos,
  getIsDemoMode,
} from './src/services/api';
import { playSosSound, triggerHaptic } from './src/services/sound';

import MonitorScreen from './src/screens/MonitorScreen';
import SosScreen from './src/screens/SosScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BottomTabBar from './src/components/BottomTabBar';
import GlobalSosAlert from './src/components/GlobalSosAlert';
import ServerConfigModal from './src/components/ServerConfigModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('monitor'); // 'monitor' | 'sos' | 'settings'
  const [isOnline, setIsOnline] = useState(true);
  const [isDemo, setIsDemo] = useState(getIsDemoMode());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);

  // Live status data
  const [status, setStatus] = useState({
    left: 120,
    center: 180,
    right: 95,
    risk: 'ปลอดภัย',
    tilt: 'ระนาบปกติ (0°)',
    count: 0,
    appliedThreshold: 100,
    appliedMode: 'both',
    unacknowledgedSos: [],
    history: [],
    sosHistory: [],
  });

  const prevSosCountRef = useRef(0);

  // Poll status periodically (every 1.8 seconds)
  const loadData = async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    try {
      const res = await fetchStatus();
      setIsOnline(res.online);
      setIsDemo(res.isDemo);

      if (res.data) {
        setStatus((prev) => ({
          ...prev,
          ...res.data,
        }));

        // Trigger sound & haptic if new unacknowledged SOS arrives
        const unacked = res.data.unacknowledgedSos || [];
        if (unacked.length > prevSosCountRef.current) {
          if (soundEnabled) {
            playSosSound();
          } else {
            triggerHaptic('error');
          }
        }
        prevSosCountRef.current = unacked.length;
      }
    } catch (e) {
      setIsOnline(false);
    } finally {
      if (showLoading) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 1800);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Handle SOS acknowledgment
  const handleAcknowledgeSos = async (sosId) => {
    await acknowledgeSos(sosId);
    await loadData();
  };

  // Handle saving threshold & mode
  const handleSaveSettings = async (threshold, mode) => {
    const res = await saveSettings(threshold, mode);
    if (res.success) {
      await loadData();
    }
    return res;
  };

  // Trigger SOS event (either from test button or emergency button)
  const handleTriggerSos = async (customMessage) => {
    await triggerSos(customMessage);
    if (soundEnabled) {
      playSosSound();
    } else {
      triggerHaptic('error');
    }
    await loadData();
  };

  // Legacy test trigger for header button
  const handleTriggerTestSos = () => {
    handleTriggerSos('ทดสอบส่งสัญญาณ SOS จากแถบหัวเรื่อง');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Active Screen Tab View */}
        <View style={styles.screenContainer}>
          {activeTab === 'monitor' && (
            <MonitorScreen
              status={status}
              isOnline={isOnline}
              isDemo={isDemo}
              soundEnabled={soundEnabled}
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onOpenSettings={() => setConfigModalVisible(true)}
              onTriggerTestSos={handleTriggerTestSos}
              onNavigateToSos={() => setActiveTab('sos')}
            />
          )}

          {activeTab === 'sos' && (
            <SosScreen
              status={status}
              isOnline={isOnline}
              isDemo={isDemo}
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              onTriggerSos={handleTriggerSos}
              onAcknowledgeSos={handleAcknowledgeSos}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              status={status}
              isOnline={isOnline}
              isDemo={isDemo}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onSaveSettings={handleSaveSettings}
              onRefresh={() => loadData(true)}
            />
          )}
        </View>

        {/* Bottom Navigation Tab Bar (Always visible at bottom) */}
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          pendingSosCount={status.unacknowledgedSos.length}
        />

        {/* Global Emergency Alert Overlay (Active across ALL screens/tabs!) */}
        <GlobalSosAlert
          events={status.unacknowledgedSos}
          onAcknowledge={handleAcknowledgeSos}
          onNavigateToSos={() => setActiveTab('sos')}
        />

        {/* Quick Server & Demo Mode Configuration Modal */}
        <ServerConfigModal
          visible={configModalVisible}
          onClose={() => setConfigModalVisible(false)}
          onRefresh={() => loadData(true)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
