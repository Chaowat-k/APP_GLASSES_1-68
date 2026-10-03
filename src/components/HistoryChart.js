import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { triggerHaptic } from '../services/sound';

export default function HistoryChart({ history = [] }) {
  const [showTable, setShowTable] = useState(false);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 64);

  const chartHeight = 160;
  const paddingLeft = 32;
  const paddingRight = 10;
  const paddingTop = 12;
  const paddingBottom = 22;
  const maxCm = 400;

  // Compute SVG polyline points for a sensor array
  const generatePoints = (key) => {
    if (!history || history.length === 0) return '';
    const usableWidth = Math.max(100, containerWidth - paddingLeft - paddingRight);
    const stepX = usableWidth / Math.max(1, history.length - 1);

    const points = [];
    history.forEach((item, index) => {
      const val = item[key];
      if (val !== null && val !== undefined && !isNaN(val)) {
        const x = paddingLeft + index * stepX;
        const clampedVal = Math.min(maxCm, Math.max(0, Number(val)));
        const y =
          paddingTop +
          (chartHeight - paddingTop - paddingBottom) * (1 - clampedVal / maxCm);
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
    });
    return points.join(' ');
  };

  const leftPoints = generatePoints('left');
  const centerPoints = generatePoints('center');
  const rightPoints = generatePoints('right');

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width - 32;
        if (w > 100) setContainerWidth(w);
      }}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="stats-chart-outline" size={20} color={COLORS.primary} />
          <Text style={styles.title}>ระยะย้อนหลัง 60 รายการ</Text>
        </View>
        <TouchableOpacity
          style={styles.toggleTableBtn}
          onPress={() => {
            triggerHaptic('light');
            setShowTable(!showTable);
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showTable ? 'chevron-up' : 'list-outline'}
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.toggleTableText}>
            {showTable ? 'ซ่อนตาราง' : 'ดูตาราง'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.sensorLeft }]} />
          <Text style={styles.legendText}>ซ้าย: ฟ้า</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.sensorCenter }]} />
          <Text style={styles.legendText}>กลาง: เขียว</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.sensorRight }]} />
          <Text style={styles.legendText}>ขวา: ส้ม</Text>
        </View>
      </View>

      {/* Interactive SVG Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={containerWidth} height={chartHeight}>
          {/* Y Axis Grid lines (0, 100, 200, 300, 400 cm) */}
          {[0, 100, 200, 300, 400].map((level) => {
            const y =
              paddingTop +
              (chartHeight - paddingTop - paddingBottom) * (1 - level / maxCm);
            return (
              <React.Fragment key={`grid-${level}`}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={containerWidth - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={paddingLeft - 4}
                  y={y + 3}
                  fontSize="9"
                  fill="#64748B"
                  textAnchor="end"
                >
                  {level}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Polylines for Left, Center, Right */}
          {leftPoints ? (
            <Polyline
              points={leftPoints}
              fill="none"
              stroke={COLORS.sensorLeft}
              strokeWidth="2.5"
            />
          ) : null}
          {centerPoints ? (
            <Polyline
              points={centerPoints}
              fill="none"
              stroke={COLORS.sensorCenter}
              strokeWidth="2.5"
            />
          ) : null}
          {rightPoints ? (
            <Polyline
              points={rightPoints}
              fill="none"
              stroke={COLORS.sensorRight}
              strokeWidth="2.5"
            />
          ) : null}
        </Svg>
      </View>

      <Text style={styles.chartNote}>
        แกนตั้ง 0–400 ซม. · แกนนอนรายการเก่าไปใหม่ (ช่วงเวลาระหว่างรายการอาจไม่เท่ากัน)
      </Text>

      {/* Optional Detailed History Table */}
      {showTable && (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>ตารางบันทึกระยะเซนเซอร์ (รายการล่าสุด)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 95 }]}>เวลา</Text>
                <Text style={[styles.th, { width: 65, color: COLORS.sensorLeft }]}>ซ้าย</Text>
                <Text style={[styles.th, { width: 65, color: COLORS.sensorCenter }]}>กลาง</Text>
                <Text style={[styles.th, { width: 65, color: COLORS.sensorRight }]}>ขวา</Text>
                <Text style={[styles.th, { width: 85 }]}>จำนวนเตือน</Text>
              </View>
              <ScrollView style={{ maxHeight: 220 }}>
                {history
                  .slice(-25)
                  .reverse()
                  .map((row, idx) => (
                    <View
                      key={row.id || idx}
                      style={[
                        styles.tableRow,
                        idx % 2 === 1 && styles.tableRowAlt,
                      ]}
                    >
                      <Text style={[styles.td, { width: 95 }]}>{row.time}</Text>
                      <Text style={[styles.td, { width: 65, fontWeight: '700', color: COLORS.sensorLeft }]}>
                        {row.left !== null ? `${row.left}` : '—'}
                      </Text>
                      <Text style={[styles.td, { width: 65, fontWeight: '700', color: COLORS.sensorCenter }]}>
                        {row.center !== null ? `${row.center}` : '—'}
                      </Text>
                      <Text style={[styles.td, { width: 65, fontWeight: '700', color: COLORS.sensorRight }]}>
                        {row.right !== null ? `${row.right}` : '—'}
                      </Text>
                      <Text style={[styles.td, { width: 85, color: COLORS.textSecondary }]}>
                        {row.count ?? '—'}
                      </Text>
                    </View>
                  ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
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
    marginBottom: 10,
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
  toggleTableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  toggleTableText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chartWrapper: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  chartNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 16,
  },
  tableCard: {
    marginTop: 14,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    paddingBottom: 6,
    marginBottom: 4,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  tableRowAlt: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  td: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
});
