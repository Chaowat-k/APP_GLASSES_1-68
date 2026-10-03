import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { triggerHaptic } from '../services/sound';

export default function Header({
  isOnline,
  isDemo,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onTriggerTestSos,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="glasses-outline" size={26} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.title}>แว่นตาแจ้งเตือนสิ่งกีดขวาง</Text>
            <View style={styles.statusBadgeRow}>
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
              <Text style={styles.statusText}>
                {isOnline
                  ? isDemo
                    ? 'โหมดจำลอง (Demo Mode)'
                    : 'เชื่อมต่อแว่นตาแล้ว'
                  : 'ไม่ได้เชื่อมต่อ'}
              </Text>
            </View>
          </View>
        </View>

        {/* Server Config Button */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            triggerHaptic('light');
            onOpenSettings();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Action Quick Bar */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionChip,
            soundEnabled ? styles.actionChipActive : styles.actionChipInactive,
          ]}
          onPress={() => {
            triggerHaptic('light');
            onToggleSound();
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={soundEnabled ? 'volume-high' : 'volume-mute'}
            size={18}
            color={soundEnabled ? COLORS.white : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.actionChipText,
              soundEnabled && styles.actionChipTextActive,
            ]}
          >
            {soundEnabled ? 'เสียง SOS มือถือ: เปิด' : 'เสียง SOS มือถือ: ปิด'}
          </Text>
        </TouchableOpacity>

        {/* Quick test SOS simulation button */}
        {isDemo && (
          <TouchableOpacity
            style={styles.sosTestBtn}
            onPress={() => {
              triggerHaptic('heavy');
              if (onTriggerTestSos) onTriggerTestSos();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle" size={17} color={COLORS.danger} />
            <Text style={styles.sosTestBtnText}>ทดสอบส่ง SOS</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionChipInactive: {
    backgroundColor: COLORS.surfaceSubtle,
    borderColor: COLORS.surfaceBorder,
  },
  actionChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actionChipTextActive: {
    color: COLORS.white,
  },
  sosTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  sosTestBtnText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
});
