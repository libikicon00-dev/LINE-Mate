// C:\ProjectBeta\src\screens\DashboardScreen.js
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // ✅ đúng cách import
import Svg, { G, Path, Circle, Polyline } from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import { useExpense } from '../context/ExpenseContext';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;

/* ===== Donut nhỏ kiểu MoMo ===== */
const CHART_SIZE = 200;           // đường kính nhỏ gọn
const R = CHART_SIZE / 2;
const INNER_R = R * 0.68;         // vòng trong
/* ================================= */

const LINE      = '#00C853';
const LINE_DARK = '#0E7C66';
const SURFACE   = '#F6FFF6';
const SURFACE_2 = '#E8FDEB';
const BORDER    = '#F1F5F1';
const TEXT_MAIN = '#1a1a1a';

/* 5 màu hài hoà (chỉ 5 lát) */
const PALETTE5 = ['#A8E6CF', '#FFD3B6', '#B3E5FC', '#D1C4E9', '#FFF9C4'];

const GRID_COLOR  = '#E6F5EA';
const nt = (n) => `NT$ ${Math.round(n || 0).toLocaleString('en-TW')}`;

export default function DashboardScreen({ navigation }) {
  const { state } = useExpense();

  const [viewMode, setViewMode] = useState('breakdown'); // 'breakdown' | 'trends'
  const [metric, setMetric]     = useState('spend');
  const [cursor, setCursor]     = useState(new Date());

  const monthKey   = cursor.toISOString().slice(0, 7);
  const monthTitle = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;

  const goPrev = () => { const d = new Date(cursor); d.setMonth(d.getMonth() - 1); setCursor(d); };
  const goNext = () => { const d = new Date(cursor); d.setMonth(d.getMonth() + 1); setCursor(d); };

  // Lọc theo tháng
  const monthExpenses = useMemo(
    () => state.expenses.filter(e => e.date?.slice(0, 7) === monthKey),
    [state.expenses, monthKey]
  );
  const monthIncomes = useMemo(
    () => (state.incomes || []).filter(i => i.date?.slice(0, 7) === monthKey),
    [state.incomes, monthKey]
  );

  const totalSpend  = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalIncome = monthIncomes.reduce((s, i) => s + (i.amount || 0), 0);

  /* ====== Gom về 5 nhóm ====== */
  const expenseBuckets = useMemo(() => {
    const b = { food: 0, shopping: 0, family: 0, bills: 0, others: 0 };
    monthExpenses.forEach(e => {
      const cat = (e.category || '').toLowerCase();
      const v = Math.abs(Number(e.amount) || 0);
      if (v <= 0) return;

      if (cat.includes('food') || cat.includes('drink') || cat.includes('grocer')) {
        b.food += v;
      } else if (cat.includes('shopping') || cat.includes('beauty') || cat.includes('entertainment')) {
        b.shopping += v;
      } else if (cat.includes('family')) {
        b.family += v;
      } else if (cat.includes('bill') || cat.includes('hous') || cat.includes('rent')) {
        b.bills += v;
      } else {
        b.others += v;
      }
    });
    return b;
  }, [monthExpenses]);

  const incomeBuckets = useMemo(() => {
    const b = { salary: 0, business: 0, bonus: 0, debt: 0, others: 0 };
    monthIncomes.forEach(i => {
      const src = (i.source || '').toLowerCase();
      const v = Math.abs(Number(i.amount) || 0);
      if (v <= 0) return;

      if (src.includes('salary')) {
        b.salary += v;
      } else if (src.includes('business') || src.includes('profit')) {
        b.business += v;
      } else if (src.includes('bonus') || src.includes('allowance')) {
        b.bonus += v;
      } else if (src.includes('debt') || src.includes('collection')) {
        b.debt += v;
      } else {
        b.others += v;
      }
    });
    return b;
  }, [monthIncomes]);
  /* =========================== */

  // Chuẩn hoá dữ liệu donut (5 lát)
  const pieData = useMemo(() => {
    const raw = (metric === 'income')
      ? [
          { key: 'salary',  label: 'Salary',             value: incomeBuckets.salary,  icon: 'briefcase' },
          { key: 'business',label: 'Business & Profit',  value: incomeBuckets.business,icon: 'bar-chart-2' },
          { key: 'bonus',   label: 'Bonus & Allowance',  value: incomeBuckets.bonus,   icon: 'award' },
          { key: 'debt',    label: 'Debt Collection',    value: incomeBuckets.debt,    icon: 'rotate-ccw' },
          { key: 'others',  label: 'Others',             value: incomeBuckets.others,  icon: 'grid' },
        ]
      : [
          { key: 'food',    label: 'Food & Drinks', value: expenseBuckets.food,    icon: 'coffee' },
          { key: 'shop',    label: 'Shopping',      value: expenseBuckets.shopping,icon: 'shopping-bag' },
          { key: 'family',  label: 'Family',        value: expenseBuckets.family,  icon: 'users' },
          { key: 'bills',   label: 'Utility & Rent',  value: expenseBuckets.bills,   icon: 'file-text' },
          { key: 'others',  label: 'Others',        value: expenseBuckets.others,  icon: 'grid' },
        ];

    // giữ thứ tự theo giá trị (lớn → nhỏ)
    const entries = raw.filter(d => d.value > 0);
    if (entries.length === 0) return [];

    entries.sort((a, b) => b.value - a.value);
    const total = entries.reduce((s, x) => s + x.value, 0);

    const arcs = d3Shape.pie().value(d => d.value).sort(null)(entries);
    return arcs.map((arc, idx) => ({
      ...arc.data,
      percent: arc.data.value / total,
      color: PALETTE5[idx], // đúng 5 màu
      path: d3Shape.arc().outerRadius(R).innerRadius(INNER_R).cornerRadius(6)(arc),
    }));
  }, [metric, expenseBuckets, incomeBuckets]);

  // 7-day trend (giữ nguyên)
  const trendData = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(cursor);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const sums = days.map(d => {
      const key = d.toISOString().slice(0, 10);
      if (metric === 'income') {
        return monthIncomes.filter(i => i.date === key)
          .reduce((s, i) => s + (i.amount || 0), 0);
      }
      return monthExpenses.filter(e => e.date === key)
        .reduce((s, e) => s + (e.amount || 0), 0);
    });
    return { sums };
  }, [cursor, metric, monthExpenses, monthIncomes]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Quick actions */}
      <View style={styles.quickRow} pointerEvents="auto">
        {[
          { icon: 'camera',       label: 'Scan receipt',     onPress: () => navigation.navigate('ReceiptImport') },
          { icon: 'trending-up',  label: 'Spending trends',  onPress: () => navigation.navigate('Trends') },
          { icon: 'repeat', label: 'Budgets', onPress: () => navigation.navigate('BudgetsHome') },
          { icon: 'grid',         label: 'More tools',       onPress: () => {} },
        ].map((it, i) => (
          <TouchableOpacity key={i} style={styles.quickCard} activeOpacity={0.85} onPress={it.onPress}>
            <Icon name={it.icon} size={18} color={LINE} />
            <Text style={styles.quickText}>{it.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Header */}
      <Text style={styles.sectionTitle}>Spending overview</Text>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setViewMode('breakdown')}
          style={[styles.toggleBtn, viewMode === 'breakdown' && styles.toggleActive]}
        >
          <Icon name="pie-chart" size={12} color={viewMode === 'breakdown' ? '#fff' : LINE} />
          <Text style={[styles.toggleText, viewMode === 'breakdown' && styles.toggleTextActive]}>Breakdown</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('trends')}
          style={[styles.toggleBtn, viewMode === 'trends' && styles.toggleActive]}
        >
          <Icon name="trending-up" size={12} color={viewMode === 'trends' ? '#fff' : LINE} />
          <Text style={[styles.toggleText, viewMode === 'trends' && styles.toggleTextActive]}>Trends</Text>
        </TouchableOpacity>
      </View>

      {/* Month selector */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={goPrev} style={styles.monthBtn}>
          <Icon name="chevron-left" size={20} color="#333" />
        </TouchableOpacity>
        <View style={styles.monthPill}>
          <Icon name="calendar" size={16} color={LINE} />
          <Text style={styles.monthText}>This month • {monthTitle}</Text>
        </View>
        <TouchableOpacity onPress={goNext} style={styles.monthBtn}>
          <Icon name="chevron-right" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Spend / Income cards */}
      <View style={styles.metricRow}>
        <TouchableOpacity
          style={[styles.metricCard, metric === 'spend' && styles.metricActive]}
          onPress={() => setMetric('spend')}
        >
          <Text style={styles.metricLabel}>Spend</Text>
          <Text style={styles.metricValue}>{nt(totalSpend)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.metricCard, metric === 'income' && styles.metricActive]}
          onPress={() => setMetric('income')}
        >
          <Text style={styles.metricLabel}>Income</Text>
          <Text style={styles.metricValue}>{nt(totalIncome)}</Text>
        </TouchableOpacity>
      </View>

      {/* Add CTA */}
      <TouchableOpacity
        style={styles.cta}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Add', { mode: metric === 'income' ? 'income' : 'spend' })}
      >
        <Icon name="plus-square" size={18} color="#fff" />
        <Text style={styles.ctaText}>{metric === 'income' ? 'Add income' : 'Add expense'}</Text>
      </TouchableOpacity>

      {/* Body */}
      {viewMode === 'breakdown' ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="pie-chart" size={18} color={LINE} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>
              {metric === 'income' ? 'Income sources breakdown' : 'Category breakdown'}
            </Text>
          </View>

          {pieData.length === 0 ? (
            <Text style={styles.empty}>No data for this month.</Text>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: CHART_SIZE, height: CHART_SIZE, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={CHART_SIZE} height={CHART_SIZE}>
                  <G x={R} y={R}>
                    {pieData.map((s, i) => (
                      <Path key={`slice-${i}`} d={s.path} fill={s.color} />
                    ))}
                    <Circle r={INNER_R * 0.98} fill="#fff" />
                  </G>
                </Svg>

                {/* total ở giữa */}
                <View style={[styles.centerOverlay, { width: CHART_SIZE, height: CHART_SIZE }]}>
                  <Text style={styles.centerTop}>Total</Text>
                  <Text style={styles.centerValue}>
                    {metric === 'income' ? nt(totalIncome) : nt(totalSpend)}
                  </Text>
                </View>
              </View>

              {/* legend 5 mục */}
              <View style={{ marginTop: 10, width: CARD_W - 24 }}>
                {pieData.map((d, idx) => (
                  <View key={d.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: d.color, marginRight: 8 }} />
                    <Icon name={d.icon} size={14} color={d.color} style={{ marginRight: 6 }} />
                    <Text style={{ flex: 1, color: TEXT_MAIN, fontWeight: '600' }}>{d.label}</Text>
                    <Text style={{ color: '#666' }}>{Math.round(d.percent * 100)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <View className="header" style={styles.cardHeader}>
            <Icon name="trending-up" size={18} color={LINE} style={{ marginRight: 6 }} />
            <Text style={styles.cardTitle}>{metric === 'income' ? '7-day income' : '7-day spend'}</Text>
          </View>

          {/* line chart đơn giản giữ nguyên */}
          <View style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
            <View style={{ height: 180, justifyContent: 'flex-end' }}>
              {/* grid */}
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 24 }}>
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <View key={i}
                    style={{
                      position: 'absolute', left: 0, right: 0, bottom: `${t * 100}%`,
                      borderTopWidth: 1, borderTopColor: GRID_COLOR,
                    }}
                  />
                ))}
              </View>

              {/* line */}
              <Svg width="100%" height="100%">
                {(() => {
                  const max = Math.max(...trendData.sums, 1);
                  const pad = 12;
                  const w = width - 32 - 16;
                  const h = 180 - 24 - 8;
                  const step = (w - pad * 2) / (trendData.sums.length - 1);
                  const points = trendData.sums
                    .map((v, i) => {
                      const x = pad + i * step;
                      const y = h - (v / max) * h + 8;
                      return `${x},${y}`;
                    })
                    .join(' ');
                  return (
                    <>
                      <Polyline points={points} fill="none" stroke={LINE} strokeOpacity={0.25} strokeWidth="6" />
                      <Polyline points={points} fill="none" stroke={LINE} strokeWidth="2.5" />
                    </>
                  );
                })()}
              </Svg>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: SURFACE, padding: 16 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: LINE_DARK, marginBottom: 8 },

  quickRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  quickCard:    {
    width: (CARD_W - 24) / 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: BORDER,
  },
  quickText:    { marginTop: 6, fontSize: 12, color: '#333', textAlign: 'center' },

  toggleRow:    { flexDirection: 'row', gap: 6, marginBottom: 10, justifyContent: 'flex-start' },
  toggleBtn:    {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999, backgroundColor: SURFACE_2,
  },
  toggleActive: { backgroundColor: LINE },
  toggleText:   { color: LINE, fontWeight: '700', fontSize: 12 },
  toggleTextActive: { color: '#fff' },

  monthRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  monthBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 1 },
  monthPill:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: SURFACE_2 },
  monthText:    { color: TEXT_MAIN, fontWeight: '600' },

  metricRow:    { flexDirection: 'row', gap: 10 },
  metricCard:   { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: BORDER },
  metricActive: { borderColor: LINE, backgroundColor: '#E9F6F3' },
  metricLabel:  { color: '#666', marginBottom: 4, fontWeight: '600' },
  metricValue:  { color: LINE_DARK, fontWeight: '800', fontSize: 16 },

  cta:          { marginTop: 12, backgroundColor: LINE, borderRadius: 10, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  ctaText:      { color: '#fff', fontWeight: '700' },

  card:         { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, width: CARD_W, alignSelf: 'center', elevation: 2 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle:    { fontWeight: '700', color: '#333' },
  empty:        { textAlign: 'center', color: '#888', paddingVertical: 16 },

  centerOverlay: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
  centerTop:     { color: '#999', fontSize: 12 },
  centerValue:   { color: TEXT_MAIN, fontWeight: '800', marginTop: 4 },
});
