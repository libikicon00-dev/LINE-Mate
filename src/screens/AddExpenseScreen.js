import React, { useMemo, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, Keyboard, Modal, Pressable, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import CategoryPickerModal from './components/CategoryPickerModal';
import { useExpense } from '../context/ExpenseContext';

const LINE = '#00C853';
const LINE_SOFT = '#E8FDEB';
const BORDER = '#E7EFE7';
const TEXT = '#1a1a1a';
const MUTED = '#666';

const EXPENSE_PRESETS = [
  { key: 'Food',     label: 'Food & Drinks', icon: 'coffee' },
  { key: 'Shopping', label: 'Shopping',      icon: 'shopping-bag' },
  { key: 'Family',   label: 'Family',        icon: 'users' },
  { key: 'Others',   label: 'Others',        icon: 'grid' }, // mở modal
];

const INCOME_PRESETS = [
  { key: 'Business', label: 'Business', icon: 'bar-chart-2' },
  { key: 'Salary',   label: 'Salary',   icon: 'briefcase' },
  { key: 'Bonus',    label: 'Bonus',    icon: 'gift' },
  { key: 'Others',   label: 'Others',   icon: 'grid' }, // mở modal
];

const MONEY_SOURCES = [
  { key: 'Cash',     label: 'Cash',     icon: 'pocket' },
  { key: 'Bank',     label: 'Bank',     icon: 'credit-card' },
  { key: 'LinePay',  label: 'Line Pay', icon: 'smartphone' },
  { key: 'LuckyBag', label: 'Lucky Bag',icon: 'gift' },
];

function Tile({ label, icon, active, onPress, widthPct = '23%' }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: '#E6F8EA' }}
      style={{
        width: widthPct,
        aspectRatio: 1,
        marginBottom: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: active ? LINE : BORDER,
        backgroundColor: active ? LINE_SOFT : '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <Icon name={icon} size={22} color={active ? LINE : '#00A85C'} />
      <Text
        numberOfLines={1}
        style={{
          marginTop: 8,
          fontWeight: '600',
          fontSize: 12,
          color: active ? LINE : TEXT,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function BottomSheet({ title, visible, onClose, children }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={onClose} />
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: Platform.OS === 'ios' ? 28 : 16,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: TEXT }}>{title}</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Icon name="x" size={20} color={MUTED} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </Modal>
  );
}

export default function AddExpenseScreen({ mode = 'spend', navigation }) {
  const isIncome = mode === 'income';
  const { addExpense, addIncome } = useExpense();

  const presets = useMemo(() => (isIncome ? INCOME_PRESETS : EXPENSE_PRESETS), [isIncome]);

  const [amount, setAmount] = useState('');
  const [picked, setPicked] = useState(isIncome ? 'Business' : 'Food');
  const [note, setNote] = useState('');

  const [dateObj, setDateObj] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const [moneySource, setMoneySource] = useState('Cash');
  const selectedSourceMeta = MONEY_SOURCES.find(m => m.key === moneySource) || MONEY_SOURCES[0];
  const [sourceSheet, setSourceSheet] = useState(false);

  const [catModal, setCatModal] = useState(false);
  const [pickedMeta, setPickedMeta] = useState({
    icon: isIncome ? 'bar-chart-2' : 'coffee',
    label: isIncome ? 'Business' : 'Food & Drinks',
  });

  useEffect(() => {
    setPicked(isIncome ? 'Business' : 'Food');
    setPickedMeta({
      icon: isIncome ? 'bar-chart-2' : 'coffee',
      label: isIncome ? 'Business' : 'Food & Drinks',
    });
  }, [isIncome]);

  const chosen = presets.find(p => p.key === picked) || presets[0];
  const dateISO = dateObj.toISOString().slice(0, 10);
  const niceDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dateObj);

  const handlePresetPress = (it) => {
    if (it.key === 'Others') setCatModal(true);
    else {
      setPicked(it.key);
      setPickedMeta({ icon: it.icon, label: it.label });
    }
  };

  const actuallySave = () => {
    const val = Number(amount);
    if (isIncome) {
      addIncome({
        id: `i_${Date.now()}`,
        date: dateISO,
        amount: val,
        source: pickedMeta.label || 'Others',
        note,
        wallet: moneySource,
      });
      Alert.alert('Saved', 'Income added.');
    } else {
      addExpense({
        id: `e_${Date.now()}`,
        date: dateISO,
        amount: val,
        category: pickedMeta.label || 'Others',
        note,
        wallet: moneySource,
      });
      Alert.alert('Saved', 'Expense added.');
    }
    setAmount('');
    setNote('');
    Keyboard.dismiss();
    navigation?.goBack?.();
  };

  const onSavePress = () => {
    const val = Number(amount);
    if (!val || val <= 0) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }
    // ⭐ Không còn kiểm tra/hiển thị Budgets ở đây
    actuallySave();
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ padding: 16, backgroundColor: '#F6FFF6', paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: BORDER,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: LINE, marginBottom: 6 }}>
            {isIncome ? 'Add income' : 'Add expense'}
          </Text>

          <Text style={{ fontWeight: '700', color: TEXT, marginBottom: 6 }}>Amount*</Text>
          <TextInput
            placeholder="0"
            placeholderTextColor="#A3B3A3"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={{
              borderWidth: 2,
              borderColor: LINE,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              backgroundColor: '#fff',
              fontWeight: '700',
              color: TEXT,
              marginBottom: 12,
            }}
          />

          <Text style={{ fontWeight: '700', color: TEXT, marginBottom: 8 }}>
            {isIncome ? 'Category (income)*' : 'Category (expense)*'}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: LINE_SOFT,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              alignSelf: 'flex-start',
              marginBottom: 10,
            }}
          >
            <Icon name={pickedMeta.icon} size={16} color={LINE} />
            <Text style={{ marginLeft: 6, color: LINE, fontWeight: '800' }}>
              {pickedMeta.label}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {presets.map(it => (
              <Tile
                key={it.key}
                label={it.label}
                icon={it.icon}
                active={pickedMeta.label === it.label}
                onPress={() => handlePresetPress(it)}
              />
            ))}
          </View>

          <Text style={{ fontWeight: '700', color: TEXT, marginTop: 8 }}>Transaction date*</Text>
          <TouchableOpacity
            onPress={() => setShowDate(true)}
            activeOpacity={0.85}
            style={{
              borderWidth: 2,
              borderColor: LINE,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              backgroundColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 6,
            }}
          >
            <Icon name="calendar" size={18} color={LINE} />
            <Text style={{ marginLeft: 10, fontWeight: '700', color: TEXT }}>{niceDate}</Text>
            <View style={{ flex: 1 }} />
            <Icon name="chevron-down" size={18} color={MUTED} />
          </TouchableOpacity>

          <Text style={{ fontWeight: '700', color: TEXT, marginTop: 12 }}>Money source*</Text>
          <TouchableOpacity
            onPress={() => setSourceSheet(true)}
            activeOpacity={0.85}
            style={{
              borderWidth: 2,
              borderColor: LINE,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              backgroundColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 6,
            }}
          >
            <View
              style={{
                backgroundColor: LINE_SOFT,
                borderRadius: 999,
                paddingVertical: 4,
                paddingHorizontal: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon name={selectedSourceMeta.icon} size={16} color={LINE} />
              <Text style={{ marginLeft: 6, color: LINE, fontWeight: '800' }}>
                {selectedSourceMeta.label}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Icon name="chevron-down" size={18} color={MUTED} />
          </TouchableOpacity>

          <Text style={{ fontWeight: '700', color: TEXT, marginTop: 12 }}>Note</Text>
          <TextInput
            placeholder="Optional note..."
            placeholderTextColor="#A3B3A3"
            value={note}
            onChangeText={setNote}
            style={{
              borderWidth: 2,
              borderColor: LINE,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              backgroundColor: '#fff',
              color: TEXT,
              marginTop: 6,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={onSavePress}
          activeOpacity={0.9}
          style={{
            backgroundColor: LINE,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            {isIncome ? 'Add Income' : 'Add Expense'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showDate && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          onChange={(_, selected) => {
            if (Platform.OS === 'android') setShowDate(false);
            if (selected) setDateObj(selected);
          }}
        />
      )}

      <BottomSheet
        title="Select money source"
        visible={sourceSheet}
        onClose={() => setSourceSheet(false)}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            gap: 12,
            marginTop: 8,
          }}
        >
          {MONEY_SOURCES.map(m => (
            <Tile
              key={m.key}
              label={m.label}
              icon={m.icon}
              active={moneySource === m.key}
              onPress={() => {
                setMoneySource(m.key);
                setSourceSheet(false);
              }}
              widthPct="30%"
            />
          ))}
        </View>
      </BottomSheet>

      <CategoryPickerModal
        visible={catModal}
        onClose={() => setCatModal(false)}
        mode={isIncome ? 'income' : 'expense'}
        title="Choose category"
        onSelect={(c) => {
          setPicked(c.key);
          setPickedMeta({ icon: c.icon, label: c.name });
        }}
        onCreateNew={() => setCatModal(false)}
      />
    </>
  );
}
