import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, Keyboard } from 'react-native';
import { useExpense } from '../context/ExpenseContext'; // ✅ đúng đường dẫn

export default function BudgetScreen() {
  const { state, setBudget } = useExpense();
  const [cat, setCat] = useState('Food');
  const [val, setVal] = useState('');

  const data = Object.keys(state.budgets).map(k => ({
    cat: k,
    budget: state.budgets[k],
  }));

  const saveBudget = () => {
    const num = Number(val);
    if (!cat.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập danh mục.');
      return;
    }
    if (!num || num < 0) {
      Alert.alert('Lỗi', 'Ngân sách không hợp lệ.');
      return;
    }
    setBudget(cat.trim(), num);
    setVal('');
    Keyboard.dismiss();
    Alert.alert('✅ Thành công', `Đã lưu ngân sách cho ${cat}.`);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#F8FFF8' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#00C853' }}>
        Quản lý ngân sách
      </Text>

      <View style={{ marginTop: 16, gap: 10 }}>
        <Text style={{ fontWeight: '600' }}>Danh mục</Text>
        <TextInput
          placeholder="VD: Food / Shopping / Transport..."
          placeholderTextColor="#aaa"
          style={{
            borderWidth: 1,
            borderColor: '#00C853',
            borderRadius: 8,
            padding: 10,
            backgroundColor: '#fff',
          }}
          value={cat}
          onChangeText={setCat}
        />

        <Text style={{ fontWeight: '600' }}>Ngân sách (₫)</Text>
        <TextInput
          placeholder="VD: 2000000"
          placeholderTextColor="#aaa"
          style={{
            borderWidth: 1,
            borderColor: '#00C853',
            borderRadius: 8,
            padding: 10,
            backgroundColor: '#fff',
          }}
          value={val}
          onChangeText={setVal}
          keyboardType="numeric"
        />

        <View style={{ marginTop: 8 }}>
          <Button title="💾 Lưu ngân sách" color="#00C853" onPress={saveBudget} />
        </View>
      </View>

      <Text style={{ marginTop: 24, fontSize: 18, fontWeight: '700', color: '#333' }}>
        Hiện tại
      </Text>

      <FlatList
        data={data}
        keyExtractor={i => i.cat}
        renderItem={({ item }) => (
          <View
            style={{
              paddingVertical: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: '#ccc',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontWeight: '600', color: '#333' }}>{item.cat}</Text>
            <Text style={{ color: '#00C853' }}>{item.budget.toLocaleString()} ₫</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#777', marginTop: 12 }}>Chưa có ngân sách nào được lưu.</Text>
        }
      />
    </View>
  );
}
