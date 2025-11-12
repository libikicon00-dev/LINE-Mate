// C:\Project\AwesomeProject\src\screens\TrendsScreen.js
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Rect, Line as SvgLine, Text as SvgText } from 'react-native-svg';
import { Feather as Icon } from '@react-native-vector-icons/feather';
import { useExpense } from '../context/ExpenseContext';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;

/* Soft palette */
const GREEN = '#36C2A5';
const GREEN_DARK = '#0E7C66';
const BLUE = '#6AA8FF';
const ORANGE = '#FF9E7D';
const RED = '#F56C6C';
const GRID = '#EEF5EF';
const BG = '#F6FFF6';

const PERIODS = ['week', 'month', 'year'];
const MODES = ['expense', 'income', 'net'];

const money = (n) => `NT$ ${Math.round(n || 0).toLocaleString('en-TW')}`;

/* ---------------- Helpers ---------------- */
function inPeriod(dateISO, period, ref = new Date()) {
  if (!dateISO) return false;
  const d = new Date(dateISO);
  const base = new Date(ref);

  if (period === 'week') {
    const end = new Date(base);
    const start = new Date(base);
    start.setDate(end.getDate() - 6);
    const k = d.toISOString().slice(0, 10);
    return k >= start.toISOString().slice(0, 10) && k <= end.toISOString().slice(0, 10);
  }
  if (period === 'month') {
    return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth();
  }
  // year
  return d.getFullYear() === base.getFullYear();
}

function buildSeries(state, period, mode, baseDate = new Date()) {
  const date = new Date(baseDate);
  const expenses = state.expenses || [];
  const incomes = state.incomes || [];

  if (period === 'week') {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(date);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const labels = days.map(
      d => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
    );
    const values = days.map(d => {
      const key = d.toISOString().slice(0, 10);
      const exp = expenses.filter(e => e.date === key).reduce((s, e) => s + (e.amount || 0), 0);
      const inc = incomes.filter(i => i.date === key).reduce((s, i) => s + (i.amount || 0), 0);
      if (mode === 'expense') return exp;
      if (mode === 'income') return inc;
      return inc - exp;
    });
    return { labels, values };
  }

  if (period === 'month') {
    const y = date.getFullYear();
    const m = date.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    const buckets = [[1, 7], [8, 14], [15, 21], [22, 28], [29, last]];
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5'];
    const values = buckets.map(([a, b]) => {
      let exp = 0, inc = 0;
      for (let d = a; d <= b; d++) {
        const key = new Date(y, m, d).toISOString().slice(0, 10);
        exp += expenses.filter(e => e.date === key).reduce((s, e) => s + (e.amount || 0), 0);
        inc += incomes.filter(i => i.date === key).reduce((s, i) => s + (i.amount || 0), 0);
      }
      if (mode === 'expense') return exp;
      if (mode === 'income') return inc;
      return inc - exp;
    });
    return { labels, values };
  }

  // year
  const y = date.getFullYear();
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const values = labels.map((_, idx) => {
    const mm = `${y}-${String(idx + 1).padStart(2, '0')}`;
    const exp = expenses.filter(e => e.date?.slice(0, 7) === mm).reduce((s, e) => s + (e.amount || 0), 0);
    const inc = incomes.filter(i => i.date?.slice(0, 7) === mm).reduce((s, i) => s + (i.amount || 0), 0);
    if (mode === 'expense') return exp;
    if (mode === 'income') return inc;
    return inc - exp;
  });
  return { labels, values };
}

/* breakdown list under the chart */
function buildBreakdown(state, period, mode, baseDate = new Date()) {
  const expenses = state.expenses || [];
  const incomes = state.incomes || [];

  if (mode === 'expense') {
    const map = {};
    expenses.forEach(e => {
      if (!inPeriod(e.date, period, baseDate)) return;
      const k = e.category || 'Others';
      map[k] = (map[k] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([label, amount]) => ({ label, amount, sign: 1 }));
  }

  if (mode === 'income') {
    const map = {};
    incomes.forEach(i => {
      if (!inPeriod(i.date, period, baseDate)) return;
      const k = i.source || 'Other';
      map[k] = (map[k] || 0) + (i.amount || 0);
    });
    return Object.entries(map).map(([label, amount]) => ({ label, amount, sign: 1 }));
  }

  // net: combine incomes (+) and expenses (-), sort by abs value
  const arr = [];
  const incMap = {};
  const expMap = {};
  incomes.forEach(i => {
    if (!inPeriod(i.date, period, baseDate)) return;
    const k = i.source || 'Other';
    incMap[k] = (incMap[k] || 0) + (i.amount || 0);
  });
  expenses.forEach(e => {
    if (!inPeriod(e.date, period, baseDate)) return;
    const k = e.category || 'Others';
    expMap[k] = (expMap[k] || 0) + (e.amount || 0);
  });

  Object.entries(incMap).forEach(([label, amount]) => arr.push({ label, amount, sign: 1 }));
  Object.entries(expMap).forEach(([label, amount]) => arr.push({ label, amount, sign: -1 }));

  return arr.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

/* icon per label (best-effort) */
const CAT_ICON = {
  Food: 'coffee',
  Shopping: 'shopping-bag',
  Transport: 'navigation',
  Family: 'users',
  Bills: 'file-text',
  Health: 'heart',
  Entertainment: 'film',
  Education: 'book',
  Others: 'grid',
  Other: 'grid',
  Salary: 'credit-card',
  Bonus: 'gift',
};

/* -------- BarChart: bars always up; color by sign -------- */
function BarChart({ labels, values, posColor, negColor }) {
  const H = 220;
  const P = 16;
  const W = CARD_W - 24;

  const max = Math.max(...values.map(v => Math.abs(v)), 1);
  const cellW = (W - P * 2) / values.length;
  const barW = Math.max(12, cellW - 10);

  return (
    <Svg width={W} height={H}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <SvgLine
          key={i}
          x1={0} x2={W}
          y1={H - P - t * (H - 2 * P)} y2={H - P - t * (H - 2 * P)}
          stroke={GRID}
          strokeWidth="1"
        />
      ))}

      {values.map((v, i) => {
        const h = (Math.abs(v) / max) * (H - 2 * P);
        const x = P + i * cellW + (cellW - barW) / 2;
        const y = H - P - h;
        const fill = v >= 0 ? posColor : negColor; // net âm -> đỏ nhưng cột vẫn hướng lên
        return <Rect key={i} x={x} y={y} width={barW} height={h} rx={8} fill={fill} opacity={0.95} />;
      })}

      {labels.map((lb, i) => {
        const x = P + i * cellW + cellW / 2;
        return (
          <SvgText key={i} x={x} y={H - 4} fontSize="10" fill="#65727A" textAnchor="middle">
            {lb}
          </SvgText>
        );
      })}
    </Svg>
  );
}

/* ---------------- Screen ---------------- */
export default function TrendsScreen() {
  const { state } = useExpense();
  const [periodIdx, setPeriodIdx] = useState(2); // default Year (như ảnh MoMo)
  const [modeIdx, setModeIdx] = useState(2);     // default Net

  const period = PERIODS[periodIdx];
  const mode = MODES[modeIdx];

  const series = useMemo(() => buildSeries(state, period, mode), [state, period, mode]);
  const rows = useMemo(() => buildBreakdown(state, period, mode), [state, period, mode]);

  // màu: Expense = xanh dương, Income = xanh lá, Net dương = xanh lá, Net âm = đỏ pastel
  const POS = mode === 'expense' ? BLUE : mode === 'income' ? GREEN : GREEN;
  const NEG = mode === 'net' ? RED : POS;

  const total = series.values.reduce((s, v) => s + v, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      {/* Period tabs */}
      <View style={styles.segmentRow}>
        {['Week', 'Month', 'Year'].map((t, i) => (
          <TouchableOpacity key={t} onPress={() => setPeriodIdx(i)} style={[styles.segment, periodIdx === i && styles.segmentActive]}>
            <Text style={[styles.segmentText, periodIdx === i && styles.segmentTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mode tabs */}
      <View style={[styles.segmentRow, { marginTop: 8 }]}>
        {[
          { t: 'Expense', icon: 'arrow-up-right' },
          { t: 'Income', icon: 'arrow-down-left' },
          { t: 'Net', icon: 'shuffle' },
        ].map((it, i) => (
          <TouchableOpacity key={it.t} onPress={() => setModeIdx(i)} style={[styles.segment, modeIdx === i && styles.segmentActive]}>
            <Icon name={it.icon} size={14} color={modeIdx === i ? '#fff' : GREEN} />
            <Text style={[styles.segmentText, modeIdx === i && styles.segmentTextActive]}>{it.t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {mode === 'expense' ? 'Total expense' : mode === 'income' ? 'Total income' : 'Total net'}
        </Text>
        <Text style={[styles.big, { color: total >= 0 ? POS : NEG }]}>{money(total)}</Text>
      </View>

      {/* Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {mode === 'expense' ? 'Expense trend' : mode === 'income' ? 'Income trend' : 'Net trend'}
        </Text>

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <BarChart labels={series.labels} values={series.values} posColor={POS} negColor={NEG} />
        </View>

        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: POS, marginRight: 6 }} />
          <Text style={{ color: '#55636A' }}>
            {mode === 'net' ? 'Net = Income − Expense (negative shows in red).' :
              mode === 'income' ? 'Total income in period.' : 'Total expense in period.'}
          </Text>
        </View>
      </View>

      {/* Breakdown list under the chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {mode === 'expense' ? 'By category' : mode === 'income' ? 'By source' : 'Breakdown'}
        </Text>
        {rows.length === 0 ? (
          <Text style={{ color: '#88939A', marginTop: 8 }}>No data for this period.</Text>
        ) : (
          rows.map((r, idx) => {
            const color = mode === 'net' ? (r.sign >= 0 ? GREEN_DARK : RED) : '#1a1a1a';
            const iconName = CAT_ICON[r.label] || (mode === 'income' ? 'credit-card' : 'grid');
            return (
              <View key={idx} style={styles.row}>
                <View style={styles.left}>
                  <View style={styles.iconBox}>
                    <Icon name={iconName} size={16} color={GREEN_DARK} />
                  </View>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                </View>
                <Text style={[styles.rowValue, { color }]}>
                  {money(r.amount * (mode === 'net' ? r.sign : 1))}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, backgroundColor: '#E8F5F1',
    borderWidth: 1, borderColor: '#D7EFE7',
  },
  segmentActive: { backgroundColor: GREEN, borderColor: GREEN },
  segmentText: { color: GREEN, fontWeight: '700' },
  segmentTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12,
    width: CARD_W, alignSelf: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { fontWeight: '700', color: '#1a1a1a' },
  big: { marginTop: 6, fontSize: 24, fontWeight: '800' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF1EF',
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#E8F5F1', marginRight: 10,
  },
  rowLabel: { color: '#1a1a1a', fontWeight: '600' },
  rowValue: { marginLeft: 'auto', fontWeight: '800' },
});
