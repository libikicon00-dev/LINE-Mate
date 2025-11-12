import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useExpense } from '../context/ExpenseContext';

export default function HomeScreen() {
  const { state } = useExpense();
  const monthKey = new Date().toISOString().slice(0, 7);

  // 📊 Lọc chi tiêu trong tháng
  const monthExpenses = useMemo(
    () => state.expenses.filter(e => e.date.slice(0, 7) === monthKey),
    [state.expenses, monthKey]
  );
  const total = monthExpenses.reduce((s, e) => s + e.amount, 0);

  // 💬 Chatbot phân tích chi tiêu
  const tip = useMemo(() => {
    const food = monthExpenses.filter(e =>
      e.category.toLowerCase().includes('food')
    );
    const ms = 24 * 3600 * 1000;
    const last7 = food
      .filter(e => Date.now() - new Date(e.date).getTime() < 7 * ms)
      .reduce((s, e) => s + e.amount, 0);
    const prev7 = food
      .filter(e => {
        const d = Date.now() - new Date(e.date).getTime();
        return d >= 7 * ms && d < 14 * ms;
      })
      .reduce((s, e) => s + e.amount, 0);

    if (prev7 > 0 && last7 > prev7 * 1.2) {
      return '⚠️ Chi ăn uống tuần này cao hơn 20% so với tuần trước. Hãy điều chỉnh để giữ cân bằng nhé 💚';
    }
    return '✅ Bạn đang chi tiêu hợp lý trong tuần này. Tiếp tục duy trì thói quen tốt!';
  }, [monthExpenses]);

  return (
    <View style={styles.container}>
      {/* Phần tiêu đề */}
      <Text style={styles.header}>Tháng {monthKey}</Text>

      {/* Tổng chi tháng */}
      <View style={styles.card}>
        <Text style={styles.totalTitle}>Tổng chi tháng này</Text>
        <Text style={styles.totalAmount}>{total.toLocaleString()} ₫</Text>
      </View>

      {/* Gợi ý chatbot */}
      <View style={styles.chatbotBox}>
        <Text style={styles.chatbotHeader}>💬 AI Coach</Text>
        <Text style={styles.chatbotText}>{tip}</Text>
      </View>
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
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  totalTitle: {
    fontSize: 16,
    color: '#444',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00C853',
    marginTop: 4,
  },
  chatbotBox: {
    backgroundColor: '#E8FDEB',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#00E676',
  },
  chatbotHeader: {
    fontWeight: '700',
    fontSize: 16,
    color: '#00C853',
    marginBottom: 6,
  },
  chatbotText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
});
