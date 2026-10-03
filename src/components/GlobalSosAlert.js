import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { triggerHaptic } from '../services/sound';

export default function GlobalSosAlert({
  events = [],
  onAcknowledge,
  onNavigateToSos,
}) {
  const [dismissedSessionId, setDismissedSessionId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Track latest event ID so if a new alert arrives, show it immediately
  const latestEventId = events && events.length > 0 ? events[0].id : null;

  useEffect(() => {
    if (latestEventId && latestEventId !== dismissedSessionId) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [latestEventId, dismissedSessionId]);

  if (!events || events.length === 0) {
    return null;
  }

  // If user tapped "ดูหน้า SOS & บันทึก", close modal for this alert session
  if (dismissedSessionId === latestEventId) {
    return null;
  }

  const handleGoToSos = () => {
    triggerHaptic('light');
    setDismissedSessionId(latestEventId);
    if (onNavigateToSos) onNavigateToSos();
  };

  const handleAckOne = (id) => {
    triggerHaptic('heavy');
    onAcknowledge(id);
  };

  const handleAckAll = () => {
    triggerHaptic('heavy');
    events.forEach((ev) => onAcknowledge(ev.id));
  };

  return (
    <Modal
      visible={events.length > 0}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertCard, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.sirenCircle}>
              <Ionicons name="warning" size={30} color={COLORS.white} />
            </View>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.alertBadge}>แจ้งเตือนภัยฉุกเฉิน (EMERGENCY)</Text>
              <Text style={styles.alertTitle}>ตรวจพบสัญญาณ SOS จากแว่นตา!</Text>
            </View>
          </View>

          <Text style={styles.alertDescription}>
            มีสัญญาณขอความช่วยเหลือฉุกเฉินที่ยังไม่ได้รับทราบ กรุณาตรวจสอบความปลอดภัยของผู้สวมใส่แว่นตาทันที
          </Text>

          {/* Scrollable Events Container for multiple alerts & narrow screens */}
          <View style={styles.scrollWrapper}>
            <ScrollView
              style={styles.eventsScrollView}
              contentContainerStyle={styles.eventsContent}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {events.map((ev, index) => (
                <View key={ev.id || index} style={styles.eventCard}>
                  {/* Top: Full width message row */}
                  <View style={styles.eventTopRow}>
                    <View style={styles.eventDot} />
                    <Text style={styles.eventMessage}>
                      {ev.message || `สัญญาณฉุกเฉิน SOS #${ev.id}`}
                    </Text>
                  </View>

                  {/* Bottom: Time and Acknowledge Button */}
                  <View style={styles.eventBottomRow}>
                    <View style={styles.timeTag}>
                      <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.eventTimestamp}>{ev.time}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.singleAckBtn}
                      onPress={() => handleAckOne(ev.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-sharp" size={15} color={COLORS.white} />
                      <Text style={styles.singleAckBtnText}>รับทราบ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 2 Full-Width Stacked Bottom Action Buttons */}
          <View style={styles.actionsColumn}>
            {/* Primary Action: Acknowledge All */}
            <TouchableOpacity
              style={styles.acknowledgeAllBtn}
              onPress={handleAckAll}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={20} color={COLORS.white} />
              <Text style={styles.acknowledgeAllBtnText}>
                {events.length > 1
                  ? `รับทราบทั้งหมด (${events.length} รายการ)`
                  : 'รับทราบทั้งหมด'}
              </Text>
            </TouchableOpacity>

            {/* Secondary Action: Go to SOS Screen */}
            <TouchableOpacity
              style={styles.goToSosBtn}
              onPress={handleGoToSos}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-outline" size={18} color={COLORS.primary} />
              <Text style={styles.goToSosBtnText}>ดูหน้า SOS & บันทึกประวัติ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    zIndex: 9999,
  },
  alertCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  sirenCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitleWrap: {
    flex: 1,
  },
  alertBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.danger,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
    lineHeight: 22,
  },
  alertDescription: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  scrollWrapper: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    marginBottom: 14,
    maxHeight: 240,
    overflow: 'hidden',
  },
  eventsScrollView: {
    maxHeight: 240,
  },
  eventsContent: {
    padding: 8,
    gap: 8,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    gap: 8,
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    marginTop: 5,
  },
  eventMessage: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    lineHeight: 18,
  },
  eventBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTimestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  singleAckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  singleAckBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  // 2 Stacked Action Buttons
  actionsColumn: {
    gap: 8,
    width: '100%',
  },
  acknowledgeAllBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  acknowledgeAllBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  goToSosBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceBorder,
    paddingVertical: 11,
    borderRadius: 12,
  },
  goToSosBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
