import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useExpense } from '../context/ExpenseContext';

const LINE = '#00C853';
const SURFACE = '#F6FFF6';
const BORDER = '#E7EFE7';
const TEXT = '#1a1a1a';

const nt = (n) => `NT$ ${Math.round(n || 0).toLocaleString('en-TW')}`;

// 5 nhóm danh mục “chuẩn” để hiện lên
const CATALOG = ['Food & Drinks', 'Shopping', 'Family', 'Utility & Rent', 'Others'];

export default function BudgetsHome({ navigation }) {
  const { state, setBudget, setSettings, getMonthlySpendByCategory } = useExpense();
  const [cursor] = useState(new Date()); // tháng hiện tại

  // Tổng chi theo danh mục trong tháng đang xem
  const spends = useMemo(
    () => getMonthlySpendByCategory(cursor),
    [state.expenses, cursor, getMonthlySpendByCategory]
  );

  // Tạo danh sách hiển thị từ budgets (legacy) + số đã chi
  const entries = useMemo(() => {
    const arr = CATALOG.map((name) => ({
      category: name,
      limit: Number(state.budgets?.[name] || 0),
      spent: Number(spends[name] || 0),
    }));
    // Ưu tiên mục đã đặt limit
    arr.sort((a, b) => (b.limit > 0) - (a.limit > 0));
    return arr;
  }, [state.budgets, spends]);

  const progress = (spent, limit) => {
    if (!limit || limit <= 0) return 0;
    return Math.min(1, spent / limit);
  };

  const nearLimit = (spent, limit) => {
    if (!limit || limit <= 0) return false;
    // state.threshold là số 0..1 (ví dụ 0.9)
    return spent / limit >= (state.threshold || 0.9);
  };

  const monthLabel = cursor.toISOString().slice(0, 7);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Budgets</Text>

      {/* Banner giới thiệu khi chưa đặt ngân sách */}
      {Object.keys(state.budgets || {}).length === 0 && (
        <View style={styles.hero}>
          <Icon name="book-open" size={28} color={LINE} />
          <Text style={styles.heroTitle}>Set budgets to control your spending</Text>
          <View style={styles.heroList}>
            <Text style={styles.heroItem}>1. Track remaining budget</Text>
            <Text style={styles.heroItem}>2. Up to 20 categories</Text>
            <Text style={styles.heroItem}>3. Alerts when near limit</Text>
          </View>
          <TouchableOpacity
            style={styles.primary}
            onPress={() => navigation.navigate('EditBudget', { category: 'Food & Drinks' })}
          >
            <Text style={styles.primaryText}>Get started</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Danh sách ngân sách */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="target" size={18} color={LINE} />
            <Text style={styles.cardTitle}>This month • {monthLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditBudget', {})}>
            <Text style={[styles.link, { fontWeight: '700' }]}>+ Add budget</Text>
          </TouchableOpacity>
        </View>

        {entries.map((it) => {
          const p = progress(it.spent, it.limit);
          const left = (it.limit || 0) - (it.spent || 0);
          return (
            <View key={it.category} style={styles.item}>
              <View style={styles.itemHead}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="pie-chart" size={16} color={LINE} />
                  <Text style={styles.itemTitle}>{it.category}</Text>
                </View>
                {it.limit > 0 ? (
                  <Text style={styles.sub}>
                    {nt(it.spent)} / {nt(it.limit)}
                  </Text>
                ) : (
                  <Text style={[styles.sub, { color: '#999' }]}>No limit</Text>
                )}
              </View>

              {/* progress bar */}
              <View style={styles.barWrap}>
                <View style={[styles.barFill, { width: `${p * 100}%` }]} />
              </View>

              <View style={styles.itemFoot}>
                <Text style={styles.leftText}>
                  {it.limit > 0 ? (left >= 0 ? `${nt(left)} left` : `${nt(-left)} over`) : ''}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('EditBudget', { category: it.category, preset: it.limit })
                    }
                  >
                    <Text style={styles.link}>Edit</Text>
                  </TouchableOpacity>

                  {it.limit > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          'Remove budget',
                          `Remove limit for ${it.category}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', style: 'destructive', onPress: () => setBudget(it.category, 0) },
                          ]
                        )
                      }
                    >
                      <Text style={[styles.link, { color: '#E53935' }]}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {nearLimit(it.spent, it.limit) && (
                <View style={styles.alert}>
                  <Icon name="alert-triangle" size={14} color="#D97706" />
                  <Text style={styles.alertText}>
                    You’re nearing the limit for {it.category}.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Cài đặt ngưỡng cảnh báo */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="bell" size={18} color={LINE} />
          <Text style={styles.cardTitle}>Alert threshold</Text>
        </View>
        <Text style={styles.sub}>
          We’ll warn you when spending reaches this percentage of a budget.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[0.8, 0.9, 1.0].map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setSettings({ threshold: v })}
              style={[styles.pill, state.threshold === v && styles.pillActive]}
            >
              <Text
                style={[styles.pillText, state.threshold === v && styles.pillTextActive]}
              >
                {Math.round(v * 100)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SURFACE, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: TEXT, marginBottom: 10 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: { fontWeight: '700', color: TEXT },

  item: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: BORDER, marginTop: 8 },
  itemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemTitle: { fontWeight: '700', color: TEXT },
  sub: { color: '#666' },

  barWrap: { height: 10, backgroundColor: '#F1F5F1', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: LINE, borderRadius: 999 },

  itemFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  leftText: { color: '#0E7C66', fontWeight: '700' },

  hero: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: TEXT, marginTop: 6 },
  heroList: { marginTop: 8 },
  heroItem: { color: '#555', marginTop: 2 },
  primary: {
    marginTop: 12,
    backgroundColor: LINE,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800' },

  link: { color: LINE, fontWeight: '600' },

  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#E8FDEB' },
  pillActive: { backgroundColor: LINE },
  pillText: { color: LINE, fontWeight: '700' },
  pillTextActive: { color: '#fff' },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  alertText: { color: '#92400E', fontWeight: '600' },
});
