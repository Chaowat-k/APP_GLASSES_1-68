import React, { useRef, useEffect } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import SosHistoryCard from '../components/SosHistoryCard';
import { triggerHaptic } from '../services/sound';

export default function SosScreen({
  status,
  isOnline,
  isDemo,
  refreshing,
  onRefresh,
  onTriggerSos,
  onAcknowledgeSos,
}) {
  const pendingSos = status.unacknowledgedSos || [];
  const hasActiveAlert = pendingSos.length > 0;


  const emergencyContacts = [
    { number: '1669', name: 'การแพทย์ฉุกเฉิน (EMS)', desc: 'กู้ชีพ เจ็บป่วยฉุกเฉิน 24 ชม.', icon: 'medkit' },
    { number: '191', name: 'ตำรวจ เหตุด่วนเหตุร้าย', desc: 'สถานีตำรวจทั่วประเทศ', icon: 'shield' },
    { number: '199', name: 'ดับเพลิงและกู้ภัย', desc: 'อัคคีภัย สัตว์มีพิษ ภัยพิบัติ', icon: 'flame' },
    { number: '1479', name: 'สายด่วนคนพิการประชารัฐ', desc: 'ปรึกษาและช่วยเหลือผู้พิการ', icon: 'heart' },
  ];

  const handleCall = (number) => {
    triggerHaptic('light');
    Linking.openURL(`tel:${number}`).catch(() => {
      // If tel URL cannot be opened on emulator/web
    });
  };

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
      {/* Screen Title Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="alert-circle" size={24} color={COLORS.danger} />
          </View>
          <View>
            <Text style={styles.screenTitle}>ศูนย์ช่วยเหลือฉุกเฉิน (SOS)</Text>
            <Text style={styles.screenSubTitle}>
              {hasActiveAlert
                ? `ตรวจพบสัญญาณ SOS ค้างอยู่ ${pendingSos.length} รายการ`
                : 'ระบบเฝ้าระวังความปลอดภัยพร้อมทำงาน'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            hasActiveAlert ? styles.statusPillDanger : styles.statusPillSafe,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: hasActiveAlert ? COLORS.danger : COLORS.success },
            ]}
          />
          <Text
            style={[
              styles.statusPillText,
              { color: hasActiveAlert ? COLORS.danger : COLORS.success },
            ]}
          >
            {hasActiveAlert ? 'มีเหตุฉุกเฉิน' : 'สถานะปกติ'}
          </Text>
        </View>
      </View>


      {/* Active Pending SOS Events List */}
      {hasActiveAlert && (
        <View style={styles.activeAlertCard}>
          <View style={styles.activeAlertHeader}>
            <View style={styles.activeAlertHeaderLeft}>
              <Ionicons name="warning" size={20} color={COLORS.danger} />
              <Text style={styles.activeAlertTitle}>
                สัญญาณ SOS ที่ยังไม่ได้รับทราบ ({pendingSos.length})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.ackAllBtn}
              onPress={() => {
                triggerHaptic('heavy');
                pendingSos.forEach((ev) => onAcknowledgeSos(ev.id));
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.ackAllBtnText}>รับทราบทั้งหมด</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventsList}>
            {pendingSos.map((ev) => (
              <View key={ev.id} style={styles.eventItem}>
                <View style={styles.eventTopRow}>
                  <View style={styles.eventDot} />
                  <Text style={styles.eventMsg}>
                    {ev.message || `สัญญาณฉุกเฉิน SOS #${ev.id}`}
                  </Text>
                </View>

                <View style={styles.eventBottomRow}>
                  <View style={styles.timeTag}>
                    <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.eventTime}>{ev.time}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.itemAckBtn}
                    onPress={() => {
                      triggerHaptic('heavy');
                      onAcknowledgeSos(ev.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={15} color={COLORS.white} />
                    <Text style={styles.itemAckBtnText}>รับทราบ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quick Emergency Phone Contacts */}
      <View style={styles.contactsCard}>
        <View style={styles.contactsHeader}>
          <Ionicons name="call" size={18} color={COLORS.primary} />
          <Text style={styles.contactsTitle}>เบอร์โทรฉุกเฉินสำคัญ (โทรออกได้ทันที)</Text>
        </View>

        <View style={styles.contactsGrid}>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.number}
              style={styles.contactItem}
              onPress={() => handleCall(contact.number)}
              activeOpacity={0.7}
            >
              <View style={styles.contactIconWrap}>
                <Ionicons name={contact.icon} size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.contactTopRow}>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                  <Ionicons name="call-outline" size={15} color={COLORS.primary} />
                </View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDesc}>{contact.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Past 20 SOS Logs */}
      <SosHistoryCard sosHistory={status.sosHistory} />
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
    justifyContent: 'space-between',
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusPillSafe: {
    backgroundColor: COLORS.successBg,
    borderColor: '#BBF7D0',
    borderWidth: 1,
  },
  statusPillDanger: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  activeAlertCard: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  activeAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activeAlertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  activeAlertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
  },
  ackAllBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ackAllBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  eventsList: {
    gap: 8,
  },
  eventItem: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
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
  eventMsg: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700',
    lineHeight: 18,
  },
  eventBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTime: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  itemAckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.danger,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 8,
  },
  itemAckBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  contactsCard: {
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
  contactsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  contactsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactsGrid: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  contactIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  contactDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
