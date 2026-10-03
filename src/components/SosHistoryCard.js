import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function SosHistoryCard({ sosHistory = [] }) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={20} color={COLORS.danger} />
          <Text style={styles.title}>ประวัติ SOS ล่าสุด 20 รายการ</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{sosHistory.length} รายการ</Text>
        </View>
      </View>

      {sosHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>ยังไม่มีประวัติการส่งสัญญาณ SOS</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {sosHistory.slice(0, 20).map((item, index) => (
            <View key={item.id || index} style={styles.itemRow}>
              <View style={styles.timelineCol}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: item.acknowledged
                        ? COLORS.textMuted
                        : COLORS.danger,
                    },
                  ]}
                />
                {index < Math.min(19, sosHistory.length - 1) && (
                  <View style={styles.line} />
                )}
              </View>

              <View style={styles.contentCol}>
                <View style={styles.contentTop}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.acknowledged
                        ? styles.statusPillAck
                        : styles.statusPillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.acknowledged
                          ? styles.statusPillTextAck
                          : styles.statusPillTextPending,
                      ]}
                    >
                      {item.acknowledged ? 'รับทราบแล้ว' : 'ยังไม่รับทราบ'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.descText}>
                  {item.message || 'ส่งสัญญาณฉุกเฉิน SOS'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.note}>
        *เวลาเป็นเวลาที่เซิร์ฟเวอร์รับ ไม่ใช่เวลาที่กด หากส่งย้อนหลังตอนเครือข่ายกลับมา
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  list: {
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineCol: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingBottom: 14,
  },
  contentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillAck: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  statusPillPending: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusPillTextAck: {
    color: COLORS.textSecondary,
  },
  statusPillTextPending: {
    color: COLORS.danger,
  },
  descText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  note: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
});
