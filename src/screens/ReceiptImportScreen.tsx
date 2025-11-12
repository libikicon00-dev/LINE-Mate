// C:\ProjectBeta\src\screens\ReceiptImportScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Feather as Icon } from '@react-native-vector-icons/feather';
import SegmentedTabs from './components/SegmentedTabs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const LINE = '#00C853';
const BG = '#F6FFF6';
const BORDER = '#E7EFE7';

/** ---- Navigation types ---- */
type RootStackParamList = {
  MainTabs: undefined;
  Add: { mode: 'spend' | 'income' };
  ReceiptImport: { tab?: 'manual' | 'image' } | undefined;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ReceiptRoute = RouteProp<RootStackParamList, 'ReceiptImport'>;
/** -------------------------- */

export default function ReceiptImportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ReceiptRoute>();

  // default tab from param; fallback to 'manual'
  const initialTab: 'manual' | 'image' =
    route.params?.tab === 'image' ? 'image' : 'manual';
  const [tab, setTab] = useState<'manual' | 'image'>(initialTab);

  const handleChange = (key: 'manual' | 'image') => {
    if (key === 'manual') {
      // Navigate to Add (manual input)
      setTimeout(() => navigation.navigate('Add', { mode: 'spend' }), 80);
    } else {
      setTab('image');
    }
  };

  // Auto jump when opened on "manual"
  useEffect(() => {
    if (tab === 'manual') {
      const t = setTimeout(() => navigation.navigate('Add', { mode: 'spend' }), 80);
      return () => clearTimeout(t);
    }
  }, [tab, navigation]);

  const pickImages = () => {
    Alert.alert('Choose images', 'Image picker is not wired yet.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Segmented Tabs */}
      <View style={{ margin: 16 }}>
        <SegmentedTabs<'manual' | 'image'>
          segments={[
            { key: 'manual', label: 'Manual input', icon: <Icon name="edit-3" size={14} color="transparent" /> },
            { key: 'image',  label: 'From images',  icon: <Icon name="image" size={14} color="transparent" /> },
          ]}
          value={tab}
          onChange={handleChange}
          height={40}
          bg="#E8FDEB"
          activeBg="#fff"
          activeColor={LINE}
          inactiveColor="#0E7C66"
        />
      </View>

      {/* Only render "From images" UI. Manual navigates away. */}
      {tab === 'image' && (
        <View style={styles.card}>
          <Text style={styles.title}>Add transactions from images</Text>
          <Text style={styles.desc}>
            Select up to 3 screenshots of your bank history or payment receipts.
            We’ll try to extract amounts, notes and dates automatically.
          </Text>

          {/* ---- Image grid ---- */}
          <View style={styles.grid}>
            {/* Transaction history preview */}
            <TouchableOpacity style={styles.tile} activeOpacity={0.9} onPress={pickImages}>
              <Image
                source={require('../../assets/mock/1.jpg')} // ✅ đúng đường dẫn
                style={{ width: '100%', height: 80, borderRadius: 10 }}
                resizeMode="cover"
              />
              <Text style={styles.tileText}>Transaction history</Text>
              <Icon name="check" size={14} color={LINE} style={styles.tick} />
            </TouchableOpacity>

            {/* Transfer success preview */}
            <TouchableOpacity style={styles.tile} activeOpacity={0.9} onPress={pickImages}>
              <Image
                source={require('../../assets/mock/2.jpg')} // ✅ đúng đường dẫn
                style={{ width: '100%', height: 80, borderRadius: 10 }}
                resizeMode="cover"
              />
              <Text style={styles.tileText}>Success result</Text>
              <Icon name="check" size={14} color={LINE} style={styles.tick} />
            </TouchableOpacity>

            {/* Coming soon tiles */}
            <View style={[styles.tile, styles.tileDisabled]}>
              <Icon name="grid" size={18} color="#B0BEB0" />
              <Text style={[styles.tileText, { color: '#B0BEB0' }]}>QR image (coming soon)</Text>
            </View>
            <View style={[styles.tile, styles.tileDisabled]}>
              <Icon name="smartphone" size={18} color="#B0BEB0" />
              <Text style={[styles.tileText, { color: '#B0BEB0' }]}>Blurred image (coming soon)</Text>
            </View>
          </View>

          {/* ---- Button ---- */}
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.9} onPress={pickImages}>
            <Text style={styles.primaryText}>Choose images</Text>
          </TouchableOpacity>

          {/* ---- Tip ---- */}
          <View style={styles.tip}>
            <Text style={styles.tipTitle}>Tip</Text>
            <Text style={styles.tipText}>
              To add manually, tap the green “Record” button in the bottom bar or the
              “Add expense / Add income” buttons on the Dashboard.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/* ----------- Styles ----------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  card: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  title: { color: LINE, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  desc: { color: '#444', marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#F7FFF8',
    borderWidth: 1,
    borderColor: '#DDF3E3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    overflow: 'hidden',
  },
  tileDisabled: { backgroundColor: '#FAFAFA', borderColor: '#EEE' },
  tileText: { marginTop: 8, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  tick: { position: 'absolute', right: 8, top: 8 },

  primaryBtn: {
    marginTop: 8,
    backgroundColor: LINE,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryText: { color: '#fff', fontWeight: '800' },

  tip: {
    marginTop: 12,
    backgroundColor: '#F0FFF3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7F1DD',
    padding: 12,
  },
  tipTitle: { color: LINE, fontWeight: '800', marginBottom: 4 },
  tipText: { color: '#4b4b4b' },
});
