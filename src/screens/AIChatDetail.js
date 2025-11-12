// C:\ProjectBeta\src\screens\AIChatDetail.js
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useExpense } from '../context/ExpenseContext';

const LINE = '#00C853';
const LIGHT = '#E8FDEB';
const BORDER = '#E7EFE7';
const TEXT = '#1A1A1A';

const SEEDS = {
  tips: [
    { sender: 'bot', text: 'Got it. Here are 3 quick ways to cut spend without pain:' },
    { sender: 'bot', text: '1) Lock daily food cap at NT$250 and batch-cook twice a week.' },
    { sender: 'bot', text: '2) Use Line Pay for rewards; move “fun money” to a separate wallet on payday.' },
    { sender: 'bot', text: '3) Auto-save 10% the moment income arrives. Small rule, big effect.' },
  ],
  log: [
    { sender: 'bot', text: 'Log in one line, I’ll parse it:' },
    { sender: 'bot', text: '- "Lunch 120 NTD Cash"\n- "Taxi 180 NTD Line Pay"\n- "Milk 90 NTD Bank"' },
    { sender: 'bot', text: 'I’ll guess category & source; you just confirm.' },
  ],
  budget: [
    { sender: 'bot', text: 'Tell me your monthly income and I’ll suggest a split (50/30/20 or custom).' },
    { sender: 'bot', text: 'Example: Income NT$40,000 → Needs 20,000 • Wants 12,000 • Savings 8,000.' },
  ],
  demo: [
    { sender: 'bot', text: 'Welcome back! Try asking: “How to split income?” or “Where did I overspend?”' },
  ],
  reset: [{ sender: 'bot', text: 'Chat has been reset. What do you want to work on today?' }],
};

const SUGGESTIONS_BY_TOPIC = {
  tips: ['Give me 3 grocery hacks', 'How to stop impulse buys?', 'Cheap weekend ideas?'],
  log: ['Lunch 120 NTD Cash', 'Milk 90 NTD Bank', 'Taxi 180 NTD Line Pay'],
  budget: ['Explain the 50/30/20 rule', 'Make a budget for 40,000 NTD', 'How much can I save monthly?'],
  demo: ['How to split my income?', 'Where am I overspending?', 'Best way to start saving?'],
  reset: ['Smart spending tips', 'Set monthly budget', 'Log expenses via chat'],
};

export default function AIChatDetail({ route }) {
  const topic = route?.params?.topic ?? 'demo';
  const { state } = useExpense();

  const snapshot = useMemo(() => {
    const inc = (state.incomes || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const exp = (state.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return { inc: Math.round(inc), exp: Math.round(exp), bal: Math.round(inc - exp) };
  }, [state]);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'MoneyMates is here. I use your local numbers to tailor advice.' },
    { sender: 'bot', text: `Snapshot → Income ~NT$ ${snapshot.inc}, Spending ~NT$ ${snapshot.exp}, Balance ~NT$ ${snapshot.bal}.` },
    ...(SEEDS[topic] || SEEDS.demo),
  ]);

  const suggestions = SUGGESTIONS_BY_TOPIC[topic] || SUGGESTIONS_BY_TOPIC.demo;

  const reply = (userText) => {
    // append user
    setMessages((m) => [...m, { sender: 'user', text: userText }]);

    // very small deterministic “fake AI”
    let bot;
    if (/50\/30\/20/i.test(userText)) {
      bot = 'The 50/30/20 rule = 50% Needs, 30% Wants, 20% Savings. For you, try 55/25/20 while rent is high.';
    } else if (/split.*income|budget/i.test(userText)) {
      const needs = Math.round(snapshot.inc * 0.55);
      const wants = Math.round(snapshot.inc * 0.25);
      const save  = Math.round(snapshot.inc * 0.20);
      bot = `Try this split: Needs ~NT$ ${needs}, Wants ~NT$ ${wants}, Savings ~NT$ ${save}. Lock “Savings” first.`;
    } else if (/impulse|buy/i.test(userText)) {
      bot = 'Use the 24-hour rule and hide cards from shopping apps. Add a “pause” tag to any wishlist item > NT$500.';
    } else if (/log|lunch|milk|taxi|NTD|cash|bank|line pay/i.test(userText)) {
      bot = 'Logged ✔️ Category guessed. You can edit later in Calendar. Try adding 2–3 more to see the trend.';
    } else {
      bot = 'Noted. If you tell me income and 3 biggest spend categories, I’ll craft a one-week plan you can follow.';
    }

    setMessages((m) => [...m, { sender: 'bot', text: bot }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F6FFF6' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* header strip like your screenshot */}
      <View style={s.header}>
        <Text style={s.hTitle}>MoneyMates — AI Chat (Demo)</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[s.bubble, item.sender === 'user' ? s.user : s.bot]}>
            <Text style={{ color: item.sender === 'user' ? '#fff' : TEXT, lineHeight: 20 }}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
      />

      {/* suggestion chips based on previous advice */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestRow}>
        {suggestions.map((t) => (
          <TouchableOpacity key={t} style={s.suggest} onPress={() => reply(t)}>
            <Text style={s.suggestTxt}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* input bar */}
      <View style={s.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your question..."
          placeholderTextColor="#777"
          style={s.input}
          returnKeyType="send"
          onSubmitEditing={() => { if (input.trim()) { reply(input.trim()); setInput(''); } }}
        />
        <TouchableOpacity style={s.send} onPress={() => { if (input.trim()) { reply(input.trim()); setInput(''); } }}>
          <Icon name="send" size={16} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6, fontWeight: '700' }}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: LINE, paddingHorizontal: 16, paddingVertical: 12, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  hTitle: { color: '#fff', fontWeight: '800' },

  bubble: { marginVertical: 6, padding: 14, borderRadius: 18, maxWidth: '86%' },
  user: { alignSelf: 'flex-end', backgroundColor: LINE },
  bot: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER },

  suggestRow: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 6, backgroundColor: '#F6FFF6' },
  suggest: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#B2F2BF', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  suggestTxt: { color: LINE, fontWeight: '600' },

  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: BORDER, backgroundColor: '#fff' },
  input: { flex: 1, height: 42, borderWidth: 1, borderColor: BORDER, borderRadius: 20, paddingHorizontal: 12, backgroundColor: '#FAFAFA', color: TEXT },
  send: { marginLeft: 10, backgroundColor: LINE, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
});
