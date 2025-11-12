// C:\ProjectBeta\src\screens\UtilitiesScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LINE = '#00C853';
const TEXT = '#1a1a1a';
const SOFT = '#E8FDEB';

export default function UtilitiesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Utilities ⚙️</Text>
      <Text style={styles.subtitle}>
        Manage your financial tools and helpful features here.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BudgetsHome')}
      >
        <Text style={styles.btnText}>💰 Budget Overview</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Add')}
      >
        <Text style={styles.btnText}>🧾 Add Expense / Income</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Trends')}
      >
        <Text style={styles.btnText}>📊 Spending Trends</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: '800', color: LINE, marginBottom: 6 },
  subtitle: { color: TEXT, fontSize: 15, textAlign: 'center', marginBottom: 20 },
  button: {
    backgroundColor: LINE,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
  },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
