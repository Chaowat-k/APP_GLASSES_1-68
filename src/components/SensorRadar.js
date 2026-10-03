import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function SensorRadar({
  left,
  center,
  right,
  risk,
  tilt,
  count,
  appliedThreshold,
  appliedMode,
}) {
  // Helper to format sensor display value
  const renderDistance = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    const n = Number(val);
    // If integer or rounded, format cleanly
    return Number.isInteger(n) ? `${n}` : n.toFixed(1);
  };

  // Helper to determine distance warning level
  const getDistanceLevel = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'none';
    const num = Number(val);
    const thresh = Number(appliedThreshold) || 100;
    if (num <= 40) return 'danger';
    if (num <= thresh) return 'warning';
    return 'safe';
  };

  // Helper for progress bar fill width (0 - 300cm max)
  const getProgressWidth = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 0;
    const num = Math.min(300, Math.max(0, Number(val)));
    return (num / 300) * 100;
  };

  const getRiskColor = () => {
    if (!risk) return COLORS.textSecondary;
    if (risk.includes('อันตราย') || risk.includes('ระยะเตือน') || risk.includes('ไม่สามารถติดต่อ')) return COLORS.danger;
    if (risk.includes('ระวัง') || risk.includes('ไม่อัปเดต') || risk.includes('ไม่ครบ')) return COLORS.warning;
    return COLORS.success;
  };

  const getModeLabel = (mode) => {
    if (mode === 'vibration') return 'สั่น';
    if (mode === 'sound') return 'เสียง';
    return 'สั่นและเสียง';
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="scan-outline" size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>ระยะตรวจจับสิ่งกีดขวาง (เซนติเมตร)</Text>
        </View>
        <View style={styles.unitBadge}>
          <Text style={styles.unitText}>cm</Text>
        </View>
      </View>

      {/* 3 Sensor Direction Cards (ซ้าย - กลาง - ขวา) */}
      <View style={styles.grid}>
        {/* Left Sensor Card */}
        <View
          style={[
            styles.card,
            { borderColor: getDistanceLevel(left) === 'danger' ? COLORS.danger : COLORS.surfaceBorder },
            getDistanceLevel(left) === 'danger' && styles.cardAlert,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.directionDot, { backgroundColor: COLORS.sensorLeft }]} />
            <Text style={styles.cardLabel}>ซ้าย</Text>
          </View>
          <View style={styles.valueRow}>
            <Text
              style={[styles.valueText, { color: COLORS.sensorLeft }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {renderDistance(left)}
            </Text>
            {left !== null && (
              <Text style={styles.unitSmall} numberOfLines={1}>
                ซม.
              </Text>
            )}
          </View>
          {/* Visual Mini Progress Bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${getProgressWidth(left)}%`,
                  backgroundColor: COLORS.sensorLeft,
                },
              ]}
            />
          </View>
        </View>

        {/* Center Sensor Card */}
        <View
          style={[
            styles.card,
            { borderColor: getDistanceLevel(center) === 'danger' ? COLORS.danger : COLORS.surfaceBorder },
            getDistanceLevel(center) === 'danger' && styles.cardAlert,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.directionDot, { backgroundColor: COLORS.sensorCenter }]} />
            <Text style={styles.cardLabel}>กลาง</Text>
          </View>
          <View style={styles.valueRow}>
            <Text
              style={[styles.valueText, { color: COLORS.sensorCenter }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {renderDistance(center)}
            </Text>
            {center !== null && (
              <Text style={styles.unitSmall} numberOfLines={1}>
                ซม.
              </Text>
            )}
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${getProgressWidth(center)}%`,
                  backgroundColor: COLORS.sensorCenter,
                },
              ]}
            />
          </View>
        </View>

        {/* Right Sensor Card */}
        <View
          style={[
            styles.card,
            { borderColor: getDistanceLevel(right) === 'danger' ? COLORS.danger : COLORS.surfaceBorder },
            getDistanceLevel(right) === 'danger' && styles.cardAlert,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.directionDot, { backgroundColor: COLORS.sensorRight }]} />
            <Text style={styles.cardLabel}>ขวา</Text>
          </View>
          <View style={styles.valueRow}>
            <Text
              style={[styles.valueText, { color: COLORS.sensorRight }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {renderDistance(right)}
            </Text>
            {right !== null && (
              <Text style={styles.unitSmall} numberOfLines={1}>
                ซม.
              </Text>
            )}
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${getProgressWidth(right)}%`,
                  backgroundColor: COLORS.sensorRight,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Sensor Metadata & Status Pills */}
      <View style={styles.statusGrid}>
        {/* Risk Status */}
        <View style={styles.statusTile}>
          <Text style={styles.tileLabel}>ระดับความเสี่ยง</Text>
          <View style={styles.tileValueRow}>
            <View style={[styles.riskDot, { backgroundColor: getRiskColor() }]} />
            <Text style={[styles.tileValue, { color: getRiskColor() }]} numberOfLines={1}>
              {risk || '—'}
            </Text>
          </View>
        </View>

        {/* Tilt Status */}
        <View style={styles.statusTile}>
          <Text style={styles.tileLabel}>องศาความเอียงศีรษะ</Text>
          <View style={styles.tileValueRow}>
            <Text style={styles.tileValue} numberOfLines={1}>{tilt || '—'}</Text>
          </View>
        </View>

        {/* Warning Count */}
        <View style={styles.statusTile}>
          <Text style={styles.tileLabel}>จำนวนครั้งที่เตือน</Text>
          <View style={styles.tileValueRow}>
            <Text style={styles.tileValueHighlight} numberOfLines={1}>
              {count !== undefined && count !== null ? `${count} ครั้ง` : '—'}
            </Text>
          </View>
        </View>

        {/* Applied Threshold */}
        <View style={styles.statusTile}>
          <Text style={styles.tileLabel}>ค่าที่เครื่องใช้อยู่</Text>
          <View style={styles.tileValueRow}>
            <Text style={styles.tileValue} numberOfLines={1}>
              {appliedThreshold ? `${appliedThreshold} ซม. (${getModeLabel(appliedMode)})` : '—'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.captionNote}>
        *ไม่ทราบระยะ (—) อาจเกิดจากอยู่นอกช่วงวัด วัตถุไม่สะท้อน หรือสาย/เซนเซอร์ขัดข้อง
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unitBadge: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  unitText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1.5,
    minHeight: 100,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardAlert: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  directionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: 2,
    marginVertical: 4,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  valueText: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  unitSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 1,
    flexShrink: 0,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.surfaceBorder,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusGrid: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  statusTile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    gap: 12,
  },
  tileLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 0,
    minWidth: 110,
  },
  tileValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginLeft: 8,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  tileValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  tileValueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'right',
  },
  captionNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 10,
    lineHeight: 16,
  },
});
