import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Keyboard, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useExpense } from '../context/ExpenseContext';

const LINE = '#00C853';
const SURFACE = '#F6FFF6';
const BORDER = '#E7EFE7';
const TEXT = '#1a1a1a';
const MUTED = '#6b7280';

const CATALOG = ['Food & Drinks', 'Shopping', 'Family', 'Utility & Rent', 'Others'];

const nt = (n) => `NT$ ${Math.round(n || 0).toLocaleString('en-TW')}`;

export default function EditBudgetScreen({ navigation, route }) {
  const { setBudget, getMonthlySpendByCategory, state } = useExpense();

  const { category: initialCat, preset } = route?.params || {};
  const [category, setCategory] = useState(initialCat || 'Food & Drinks');
  const [limit, setLimit] = useState(
    preset != null ? String(preset) : String(state.budgets?.[initialCat || 'Food & Drinks'] || '')
  );

  // Thống kê chi của tháng hiện tại để người dùng tham khảo
  const monthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const monthSpend = useMemo(() => {
    const map = getMonthlySpendByCategory(new Date());
    return Number(map[category] || 0);
  }, [category, state.expenses, getMonthlySpendByCategory]);

  const onSave = () => {
    const v = Number(limit);
    if (!category?.trim()) {
      Alert.alert('Error', 'Please choose a category.');
      return;
    }
    if (!Number.isFinite(v) || v < 0) {
      Alert.alert('Error', 'Limit must be a non-negative number.');
      return;
    }
    setBudget(category, v);
    Keyboard.dismiss();
    Alert.alert('Saved', `Budget for "${category}" set to ${nt(v)}.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const onRemove = () => {
    if (!category?.trim()) return;
    Alert.alert('Remove budget', `Remove limit for ${category}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setBudget(category, 0);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Edit budget</Text>

      {/* Chọn danh mục nhanh */}
      <View style={s.card}>
        <View style={s.rowHead}>
          <Icon name="layers" size={18} color={LINE} />
          <Text style={s.cardTitle}>Category</Text>
        </View>

        <View style={s.catWrap}>
          {CATALOG.map((c) => {
            const active = c === category;
            return (
              <TouchableOpacity
                key={c}
                activeOpacity={0.85}
                onPress={() => setCategory(c)}
                style={[s.pill, active && s.pillActive]}
              >
                <Text style={[s.pillText, active && s.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Nhập hạn mức */}
      <View style={s.card}>
        <View style={s.rowHead}>
          <Icon name="target" size={18} color={LINE} />
          <Text style={s.cardTitle}>Monthly limit • {monthKey}</Text>
        </View>

        <Text style={s.label}>Limit (NTD)</Text>
        <TextInput
          value={limit}
          onChangeText={setLimit}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#A3B3A3"
          style={s.input}
        />

        {/* Gợi ý nhanh */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {[2000, 3000, 5000, 8000, 10000, 15000].map((v) => (
            <TouchableOpacity key={v} style={s.pillGhost} onPress={() => setLimit(String(v))}>
              <Text style={s.pillGhostText}>{nt(v)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tham khảo số đã chi tháng này */}
        <View style={s.infoBox}>
          <Icon name="info" size={14} color={MUTED} />
          <Text style={s.infoText}>
            Spent this month in <Text style={{ fontWeight: '800' }}>{category}</Text>: {nt(monthSpend)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <TouchableOpacity style={[s.btn, { backgroundColor: '#fff', borderColor: BORDER }]} onPress={() => navigation.goBack()}>
          <Text style={[s.btnText, { color: '#111' }]}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, { backgroundColor: LINE }]} onPress={onSave}>
          <Text style={[s.btnText, { color: '#fff' }]}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Remove */}
      <TouchableOpacity style={s.remove} onPress={onRemove}>
        <Icon name="trash-2" size={16} color="#E53935" />
        <Text style={s.removeText}>Remove this budget</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: SURFACE, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: TEXT },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 12,
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontWeight: '700', color: TEXT },

  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#E8FDEB' },
  pillActive: { backgroundColor: LINE },
  pillText: { color: LINE, fontWeight: '700' },
  pillTextActive: { color: '#fff' },

  label: { fontWeight: '700', color: TEXT, marginTop: 6, marginBottom: 6 },
  input: {
    borderWidth: 2,
    borderColor: LINE,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontWeight: '700',
    color: TEXT,
  },

  pillGhost: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillGhostText: { color: '#111', fontWeight: '700' },

  infoBox: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F7F7FA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  infoText: { color: MUTED, fontSize: 12, fontWeight: '600' },

  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnText: { fontWeight: '800' },

  remove: {
    marginTop: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FAD4D4',
  },
  removeText: { color: '#E53935', fontWeight: '700' },
});
