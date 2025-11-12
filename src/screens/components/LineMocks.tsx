import { Image } from 'react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather as Icon } from '@react-native-vector-icons/feather';

const TEAL = '#1BCFB7';         // LINE teal
const TEAL_DARK = '#10B6A2';
const SLATE = '#222833';
const SLATE_CARD = '#2B3340';
const MUTED = '#9AA4B2';
const WHITE = '#FFFFFF';

// ---------- Transaction history preview ----------
export function LineHistoryPreview() {
  const rows = [
    { d: '10/26', title: 'Parking (Taipei)', amount: -15 },
    { d: '10/23', title: 'Mobile transfer', amount: -108 },
    { d: '10/23', title: 'Agency fee', amount: 2669 },
    { d: '10/23', title: 'Card payment · foodpa', amount: -243 },
  ];
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TWD Overview and Details</Text>
        <View style={styles.tabsRow}>
          {['Recent', 'Oct', 'Sep', 'Aug', 'Jul'].map((t, i) => (
            <Text key={t} style={[styles.tab, i === 0 && styles.tabActive]}>{t}</Text>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
        {rows.map((r, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowDate}>{r.d}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>{r.title}</Text>
              <Text style={styles.rowSub}>Note</Text>
            </View>
            <Text style={[styles.rowAmt, { color: r.amount >= 0 ? TEAL : TEAL } ]}>
              {r.amount >= 0 ? '' : '-'}{Math.abs(r.amount)}
            </Text>
            <Icon name="chevron-down" size={16} color={MUTED} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------- Transfer success preview ----------
export function LineSuccessPreview() {
  return (
    <View style={[styles.wrap, { alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
      <View style={styles.bigCheck}>
        <Icon name="check" size={28} color={WHITE} />
      </View>
      <Text style={styles.successTitle}>Transfer successful</Text>
      <Text style={styles.successMoney}>$100</Text>
      <Text style={styles.successTime}>2025/10/26 19:44:25</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Transfer-out</Text>
          <Text style={styles.infoValue}>Shilin Branch{'\n'}816800****6711</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Transfer-in</Text>
          <Text style={styles.infoValue}>Snicky N***N{'\n'}0081680012628427</Text>
        </View>
      </View>

      <View style={styles.footerBar}>
        <Text style={styles.footerText}>Close</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: SLATE,
    borderWidth: 1,
    borderColor: '#2E3745',
  },
  header: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { color: WHITE, fontWeight: '700' },
  tabsRow: { flexDirection: 'row', marginTop: 8, gap: 16 },
  tab: { color: MUTED, fontWeight: '700' },
  tabActive: { color: WHITE, borderBottomWidth: 2, borderBottomColor: TEAL, paddingBottom: 2 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SLATE_CARD,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginTop: 8,
    gap: 10,
  },
  rowDate: { width: 48, color: MUTED, fontWeight: '700' },
  rowTitle: { color: WHITE, fontWeight: '700' },
  rowSub: { color: MUTED, marginTop: 2, fontSize: 12 },
  rowAmt: { width: 70, textAlign: 'right', fontWeight: '800' },

  bigCheck: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: TEAL_DARK, alignItems: 'center', justifyContent: 'center',
    marginTop: 4, marginBottom: 4,
  },
  successTitle: { color: WHITE, fontWeight: '800', marginTop: 2 },
  successMoney: { color: TEAL, fontWeight: '900', fontSize: 28, marginTop: 6 },
  successTime: { color: MUTED, marginTop: 4 },

  infoCard: {
    marginTop: 12, width: '94%',
    backgroundColor: SLATE_CARD, borderRadius: 14, padding: 14,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  infoLabel: { color: MUTED, width: 110 },
  infoValue: { color: WHITE, flex: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#3A4453', marginVertical: 10 },

  footerBar: {
    marginTop: 12, width: '100%',
    borderTopWidth: 1, borderTopColor: '#3A4453',
    paddingVertical: 10, alignItems: 'center',
  },
  footerText: { color: WHITE, fontWeight: '700' },
});
