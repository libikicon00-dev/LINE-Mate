import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useExpense } from '../context/ExpenseContext';

export default function AddWishlistScreen({ navigation }) {
  const { addWishlist, state } = useExpense();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cooldown, setCooldown] = useState(String(state.threshold / 3600 || 24)); // giờ chờ mặc định 24h

  const save = () => {
    const num = Number(price);
    const cd = Number(cooldown);
    if (!name.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm.');
    if (!num || num <= 0) return Alert.alert('Lỗi', 'Giá không hợp lệ.');
    if (!cd || cd <= 0) return Alert.alert('Lỗi', 'Thời gian chờ không hợp lệ.');

    const item = {
      id: `w_${Date.now()}`,
      name,
      price: num,
      cooldownHours: cd,
      createdAt: new Date().toISOString(),
    };

    addWishlist(item);
    Alert.alert('✅ Đã thêm', `Đã thêm "${name}" vào danh sách chờ.`);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Add to Wishlist</Text>

      <Text>Tên sản phẩm</Text>
      <TextInput
        placeholder="VD: Tai nghe Bluetooth"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
      />

      <Text>Giá (₫)</Text>
      <TextInput
        placeholder="VD: 1500000"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
      />

      <Text>Thời gian chờ (giờ)</Text>
      <TextInput
        placeholder="VD: 24"
        value={cooldown}
        onChangeText={setCooldown}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
      />

      <Button title="Thêm vào Wishlist" onPress={save} />
    </View>
  );
}
