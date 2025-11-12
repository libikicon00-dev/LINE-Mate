import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Keyboard, StyleSheet } from 'react-native';
import { useExpense } from '../context/ExpenseContext';

export default function SettingsScreen() {
  const { state, setSettings } = useExpense();
  const [threshold, setThreshold] = useState(String(state.threshold));

  const save = () => {
    const num = Number(threshold);
    if (Number.isNaN(num) || num < 0) {
      Alert.alert('⚠️ Lỗi', 'Vui lòng nhập ngưỡng hợp lệ (số dương).');
      return;
    }
    setSettings({ threshold: num });
    Keyboard.dismiss();
    Alert.alert('✅ Thành công', 'Đã cập nhật ngưỡng “Pause Before You Buy”.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cài đặt chi tiêu</Text>

      <Text style={styles.label}>Ngưỡng “Pause Before You Buy” (₫)</Text>
      <TextInput
        value={threshold}
        onChangeText={setThreshold}
        keyboardType="numeric"
        placeholder="VD: 1000000"
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      <View style={{ marginTop: 8 }}>
        <Button title="💾 Lưu thay đổi" color="#00C853" onPress={save} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Ngưỡng hiện tại</Text>
        <Text style={styles.infoValue}>{state.threshold.toLocaleString()} ₫</Text>
      </View>

      <Text style={styles.tip}>
        💡 Nếu bạn định mua món hàng vượt quá ngưỡng này, hệ thống sẽ nhắc bạn “Pause Before You Buy” để tránh chi tiêu bốc đồng.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFF8',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00C853',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00C853',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  infoBox: {
    marginTop: 24,
    backgroundColor: '#E8FDEB',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00E676',
  },
  infoLabel: {
    fontSize: 15,
    color: '#555',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00C853',
    marginTop: 4,
  },
  tip: {
    color: '#666',
    marginTop: 20,
    fontSize: 14,
    lineHeight: 20,
  },
});
