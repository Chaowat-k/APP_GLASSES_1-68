import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { triggerHaptic } from '../services/sound';

export default function BottomTabBar({ activeTab, onSelectTab, pendingSosCount = 0 }) {
  const insets = useSafeAreaInsets();

  const tabs = [
    {
      id: 'monitor',
      label: 'ตรวจจับระยะ',
      subLabel: 'เรดาร์ & ประวัติ',
      iconActive: 'glasses',
      iconInactive: 'glasses-outline',
    },
    {
      id: 'sos',
      label: 'ฉุกเฉิน SOS',
      subLabel: 'แจ้งเหตุ & บันทึก',
      iconActive: 'alert-circle',
      iconInactive: 'alert-circle-outline',
      badge: pendingSosCount,
    },
    {
      id: 'settings',
      label: 'การตั้งค่า',
      subLabel: 'ระยะ & ระบบ',
      iconActive: 'settings',
      iconInactive: 'settings-outline',
    },
  ];

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 10),
        },
      ]}
    >
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isSos = tab.id === 'sos';
          const hasBadge = Boolean(typeof tab.badge === 'number' && tab.badge > 0);

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                isActive && (isSos && hasBadge ? styles.tabItemActiveDanger : styles.tabItemActive),
              ]}
              onPress={() => {
                triggerHaptic('light');
                onSelectTab(tab.id);
              }}
              activeOpacity={0.75}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.iconInactive}
                  size={24}
                  color={
                    isActive
                      ? isSos && hasBadge
                        ? COLORS.danger
                        : COLORS.primary
                      : COLORS.textMuted
                  }
                />

                {/* SOS Notification Badge */}
                {hasBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive && (isSos && hasBadge ? styles.tabLabelActiveDanger : styles.tabLabelActive),
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryGlow,
  },
  tabItemActiveDanger: {
    backgroundColor: COLORS.dangerBg,
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabLabelActiveDanger: {
    color: COLORS.danger,
    fontWeight: '700',
  },
});
