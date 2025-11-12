import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AddExpenseScreen from './AddExpenseScreen';

const LINE = '#00C853';
const BORDER = '#E7EFE7';

export default function AddTransactionScreen({ route }) {
  const initial = route?.params?.mode === 'income' ? 1 : 0;
  const [tab, setTab] = useState(initial); // 0 = expense, 1 = income

  return (
    <View style={{ flex: 1, backgroundColor: '#F6FFF6' }}>
      {/* Segmented tabs */}
      <View
        style={{
          flexDirection: 'row',
          margin: 12,
          backgroundColor: '#fff',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: BORDER,
          overflow: 'hidden',
        }}
      >
        {['Expense', 'Income'].map((label, idx) => {
          const active = tab === idx;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => setTab(idx)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: active ? '#E8FDEB' : '#fff',
                borderRightWidth: idx === 0 ? 1 : 0,
                borderRightColor: BORDER,
              }}
            >
              <Text style={{ fontWeight: '700', color: active ? LINE : '#333' }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chỉ render FORM – không render Budgets */}
      <AddExpenseScreen mode={tab === 0 ? 'spend' : 'income'} />
    </View>
  );
}
