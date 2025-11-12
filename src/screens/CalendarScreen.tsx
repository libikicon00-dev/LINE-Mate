// C:\Project\AwesomeProject\src\screens\CalendarScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather as Icon } from '@react-native-vector-icons/feather';

// Import context (an toàn)
let useExpense: any;
try {
  useExpense = require('../context/ExpenseContext').useExpense;
} catch {}

/* -------------------- TYPES -------------------- */
type Txn = {
  id: string;
  date: string;   // 'YYYY-MM-DD'
  amount: number; // income >=0, expense <0
  title: string;
  tag?: string;
};

type DayCell = {
  date: Date | null;
  ymd?: string;
  income: number;
  expense: number; // âm (tích lũy chi)
};

/* -------------------- NO MOCK DATA -------------------- */
// ❌ Loại bỏ dữ liệu mẫu để không bị “ảo” số
const MOCK: Txn[] = []; // để trống

/* -------------------- UTILITIES -------------------- */
// Locale & currency cho Đài Loan
const TW_LOCALE = 'en-TW';
const TW_CURRENCY = 'TWD';
let twFormatter: Intl.NumberFormat;
try {
  twFormatter = new Intl.NumberFormat(TW_LOCALE, {
    style: 'currency',
    currency: TW_CURRENCY,
    maximumFractionDigits: 0,
  });
} catch {
  twFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
}
const currency = (v: number) => {
  try {
    return twFormatter.format(Math.abs(v));
  } catch {
    return 'NT$' + Math.abs(v).toLocaleString();
  }
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

function shortNumber(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
  return String(v);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

function buildMonthMatrix(base: Date, txns: Txn[]): DayCell[] {
  const first = startOfMonth(base);
  const last = endOfMonth(base);
  const dow = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();

  const map: Record<string, { income: number; expense: number }> = {};
  for (const t of txns) {
    if (!map[t.date]) map[t.date] = { income: 0, expense: 0 };
    if (t.amount >= 0) map[t.date].income += t.amount;
    else map[t.date].expense += t.amount; // âm
  }

  const cells: DayCell[] = [];
  for (let i = 0; i < dow; i++) cells.push({ date: null, income: 0, expense: 0 });
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(base.getFullYear(), base.getMonth(), day);
    const k = ymd(d);
    cells.push({
      date: d,
      ymd: k,
      income: map[k]?.income ?? 0,
      expense: map[k]?.expense ?? 0,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, income: 0, expense: 0 });
  return cells;
}

/* -------------------- MAIN COMPONENT -------------------- */
export default function CalendarScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(ymd(today));

  // Lấy dữ liệu thật từ Context
  let contextTxns: Txn[] | undefined;
  let resetAll: (() => void) | undefined;
  try {
    if (useExpense) {
      const ctx = useExpense();
      const { state } = ctx;
      resetAll = ctx.resetAll; // nếu bạn đã thêm API resetAll
      const ex: Txn[] = (state?.expenses || []).map((e: any) => ({
        id: 'ex-' + e.id,
        date: e.date,
        amount: -Math.abs(e.amount),
        title: e.note || e.category || 'Expense',
        tag: e.wallet || e.category,
      }));
      const inc: Txn[] = (state?.incomes || []).map((i: any) => ({
        id: 'in-' + i.id,
        date: i.date,
        amount: Math.abs(i.amount),
        title: i.source || 'Income',
        tag: i.wallet || 'Income',
      }));
      contextTxns = [...inc, ...ex];
    }
  } catch {}

  // ❗Không dùng fallback MOCK nữa
  const allTxns = useMemo(() => {
    const base = Array.isArray(contextTxns) ? contextTxns : [];
    return base.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    });
  }, [contextTxns, today]);

  const totals = useMemo(() => {
    let income = 0, expense = 0;
    for (const t of allTxns) {
      if (t.amount >= 0) income += t.amount;
      else expense += Math.abs(t.amount);
    }
    return { income, expense, balance: income - expense };
  }, [allTxns]);

  const cells = useMemo(() => buildMonthMatrix(today, allTxns), [today, allTxns]);
  const dailyTxns = allTxns.filter(t => t.date === selectedDate);

  /* -------------------- RENDER -------------------- */
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.topbar}>
        <Text
          style={s.timeLabel}
          onLongPress={() => {
            if (!resetAll) return;
            Alert.alert(
              'Reset data',
              'Delete all transactions and budgets?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: () => resetAll && resetAll() },
              ]
            );
          }}
        >
          This Month
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Icon name="check-circle" size={18} color="#666" />
          <Icon name="sliders" size={18} color="#666" />
          <Icon name="home" size={18} color="#666" />
        </View>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryBox}>
          <Text style={s.summaryTitle}>Total Income</Text>
          <Text style={[s.summaryValue, { color: '#1e88e5' }]}>{currency(totals.income)}</Text>
        </View>
        <View style={s.summaryBox}>
          <Text style={s.summaryTitle}>Total Expense</Text>
          <Text style={[s.summaryValue, { color: '#e53935' }]}>{currency(totals.expense)}</Text>
        </View>
        <View style={s.summaryBox}>
          <Text style={s.summaryTitle}>Balance</Text>
          <Text style={[s.summaryValue, { color: '#2e7d32' }]}>{currency(totals.balance)}</Text>
        </View>
      </View>

      {/* Calendar */}
      <View style={s.calendarCard}>
        <View style={s.weekHeader}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <Text key={d} style={s.weekHeaderText}>{d}</Text>
          ))}
        </View>

        <View style={s.grid}>
          {cells.map((c, idx) => {
            if (!c.date) return <View key={idx} style={s.cell} />;
            const k = ymd(c.date);
            const isToday = k === ymd(today);
            const isSelected = k === selectedDate;
            return (
              <TouchableOpacity
                key={idx}
                style={[s.cell, isSelected && { backgroundColor: '#E8FDEB', borderRadius: 8 }]}
                onPress={() => setSelectedDate(k)}
                activeOpacity={0.8}
              >
                <Text style={[s.dayNum, isToday && { color: '#00C853' }]}>{c.date.getDate()}</Text>
                {!!c.income && <Text style={s.incomeText}>{shortNumber(c.income)}</Text>}
                {!!c.expense && <Text style={s.expenseText}>{shortNumber(Math.abs(c.expense))}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Transaction List */}
      <ScrollView style={s.list} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={s.listTitle}>Transactions on {formatDate(selectedDate)}</Text>
        {dailyTxns.length === 0 ? (
          <Text style={{ color: '#777', fontSize: 13, textAlign: 'center', marginTop: 10 }}>
            No transactions for this day.
          </Text>
        ) : (
          dailyTxns.map(item => (
            <View
              key={item.id}
              style={[
                s.row,
                { borderLeftWidth: 3, borderLeftColor: item.amount >= 0 ? '#1e88e5' : '#e53935' },
              ]}
            >
              <View style={s.rowLeft}>
                <Icon
                  name={item.amount >= 0 ? 'arrow-down-left' : 'arrow-up-right'}
                  size={18}
                  color="#999"
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{item.title}</Text>
                  {!!item.tag && (
                    <View style={s.tag}>
                      <Text style={s.tagText}>{item.tag}</Text>
                      <Icon name="chevron-down" size={14} color="#b555c6" />
                    </View>
                  )}
                </View>
              </View>
              <Text
                style={[s.amount, { color: item.amount >= 0 ? '#1e88e5' : '#111' }]}
              >
                {item.amount >= 0 ? '+' : '-'}
                {currency(item.amount)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* -------------------- STYLES -------------------- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topbar: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: { fontSize: 18, fontWeight: '700', color: '#222' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    gap: 8,
  },
  summaryBox: { flex: 1, backgroundColor: '#f7f7f9', borderRadius: 12, padding: 12 },
  summaryTitle: { fontSize: 12, color: '#666', marginBottom: 6 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  calendarCard: {
    marginTop: 12,
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
  },
  weekHeader: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4 },
  weekHeaderText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#777', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 6 },
  cell: { width: `${100 / 7}%`, paddingVertical: 8, alignItems: 'center' },
  dayNum: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 2 },
  incomeText: { fontSize: 11, color: '#1e88e5', fontWeight: '700' },
  expenseText: { fontSize: 11, color: '#e53935', fontWeight: '700' },
  list: { flex: 1, marginTop: 12, paddingHorizontal: 12 },
  listTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#222' },
  row: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowTitle: { fontSize: 14, color: '#111', fontWeight: '600' },
  tag: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#f7e9fb',
    borderWidth: 1,
    borderColor: '#edccf7',
  },
  tagText: { fontSize: 12, color: '#b555c6', fontWeight: '700' },
  amount: { fontSize: 14, fontWeight: '800', minWidth: 96, textAlign: 'right' },
});
