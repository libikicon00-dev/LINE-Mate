// C:\ProjectBeta\src\screens\AIChatScreen.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useExpense, normalizeCategory } from "../context/ExpenseContext";

const LINE = "#00C853";
const SOFT = "#E8FDEB";
const BORDER = "#E7EFE7";
const TEXT = "#1A1A1A";
const WHITE = "#fff";
const MUTED = "#666";

export default function AIChatScreen() {
  const route = useRoute();
  const { state } = useExpense();

  const topic = route.params?.topic || "budgeting";
  const seedQuestion = route.params?.seedQuestion || null;
  const seedAnswer = route.params?.seedAnswer || null;
  const reset = route.params?.reset || false;

  const listRef = useRef(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    { id: "intro", sender: "bot", text: greetingForTopic(topic) },
  ]);
  // NEW: gợi ý sau trả lời (mỗi item là 1 text box)
  const [suggestions, setSuggestions] = useState([]);

  const summary = useMemo(() => summarizeState(state), [state]);

  // Auto scroll khi thay đổi
  useEffect(() => {
    listRef.current?.scrollToEnd?.({ animated: true });
  }, [messages, loading, suggestions]);

  // Seed Q&A flow with 2s typing delay
  useEffect(() => {
    if (reset) {
      setMessages([{ id: "intro", sender: "bot", text: greetingForTopic(topic) }]);
      setSuggestions([]);
      return;
    }
    if (!seedQuestion || !seedAnswer) return;

    const t1 = setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now().toString(), sender: "user", text: seedQuestion }]);
      setLoading(true);
    }, 200);

    const t2 = setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: String(Date.now() + 1), sender: "bot", text: personalize(seedAnswer, summary) },
      ]);
      setLoading(false);
      setSuggestions(suggestionsByTopic(topic, summary)); // gợi ý khởi động
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [seedQuestion, seedAnswer, reset, topic, summary]);

  const sendMessage = (text) => {
    const q = (text || "").trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now().toString(), sender: "user", text: q }]);
    setLoading(true);

    // Fake reply after 1.8s
    setTimeout(() => {
      const reply = cannedReply(q, summary, state);
      setMessages((m) => [...m, { id: String(Date.now() + 1), sender: "bot", text: reply }]);
      setLoading(false);
      // Tách gạch đầu dòng thành gợi ý; nếu không có thì fallback theo topic
      const next = extractBulletsToSuggestions(reply);
      setSuggestions(next.length ? next : suggestionsByTopic(topic, summary));
    }, 1800);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: SOFT }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MoneyMates — AI Chat (Demo)</Text>
        <Text style={styles.headerSub}>Smart with money, kind with you 💚</Text>
      </View>

      {/* Chat list */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === "user" ? styles.user : styles.bot]}>
            <Text style={{ color: item.sender === "user" ? "#fff" : TEXT, lineHeight: 20 }}>
              {item.text}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View>
            {loading ? (
              <View style={[styles.bubble, styles.bot, styles.loading]}>
                <ActivityIndicator color={LINE} />
                <Text style={{ marginLeft: 8, color: MUTED }}>Typing…</Text>
              </View>
            ) : null}

            {/* NEW: các gợi ý sau trả lời (mỗi item là 1 "text box" riêng) */}
            {suggestions.length > 0 && (
              <View style={{ marginTop: 8 }}>
                {suggestions.map((s, idx) => (
                  <TouchableOpacity key={`${s}-${idx}`} activeOpacity={0.9} onPress={() => sendMessage(s)}>
                    <View style={styles.suggestBubble}>
                      <Text style={styles.suggestText}>{s}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your question…"
          placeholderTextColor={MUTED}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage(input)}>
          <Text style={{ color: WHITE, fontWeight: "700" }}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ===== helpers ===== */
function greetingForTopic(topic) {
  switch (topic) {
    case "smart_spending":
      return "👋 Ready for smart spending? I’ll tailor tips to your habits.";
    case "log_expense":
      return "🧾 You can log expenses in one line. I’ll guess category & source.";
    default:
      return "💰 Let’s build a simple, realistic monthly budget together.";
  }
}

function summarizeState(state) {
  const total = (state.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const income = (state.incomes || []).reduce((s, i) => s + Number(i.amount || 0), 0);
  return { total, income };
}

function breakdownByCategory(state) {
  const buckets = {
    "Food & Drinks": 0,
    Shopping: 0,
    Family: 0,
    "Utility & Rent": 0,
    Wishlist: 0,
    Others: 0,
  };
  (state.expenses || []).forEach((e) => {
    const k = normalizeCategory(e.category);
    buckets[k] = (buckets[k] || 0) + Math.abs(Number(e.amount || 0));
  });
  return buckets;
}

function personalize(answer, summary) {
  return answer
    .replaceAll("{income}", String(Math.round(summary.income || 0)))
    .replaceAll("{spend}", String(Math.round(summary.total || 0)));
}

// Tạo gợi ý “mặc định” theo topic
function suggestionsByTopic(topic, summary) {
  const inc = Math.round(summary.income || 42000);
  if (topic === "budgeting") {
    return [
      `Explain 50/30/20 using NT$ ${inc}`,
      "How to auto-transfer 20% savings?",
      "Which categories should I trim first?",
    ];
  }
  if (topic === "smart_spending") {
    return [
      "5 ways to cut Food cost without cooking daily",
      "How to avoid impulse shopping with Wishlist?",
      "Should I set a taxi micro-budget?",
    ];
  }
  // log_expense
  return ["Log: Lunch 120 NTD Cash", "Log: Taxi 180 NTD Line Pay", "Log: Milk 90 NTD Bank"];
}

// Tách các dòng gạch đầu dòng trong reply thành gợi ý
function extractBulletsToSuggestions(text) {
  const lines = text.split(/\n+/).map((l) => l.trim());
  const bullets = lines.filter((l) => /^(\d+[\).\s-]|[-•–])\s*/.test(l));
  return bullets.map((b) => b.replace(/^(\d+[\).\s-]|[-•–])\s*/, "")).slice(0, 6);
}

function cannedReply(q, summary, state) {
  const inc = Math.round(summary.income || 42000);
  const byCat = breakdownByCategory(state || { expenses: [] });
  const food = Math.round(byCat["Food & Drinks"] || 0);
  const shop = Math.round(byCat["Shopping"] || 0);
  const util = Math.round(byCat["Utility & Rent"] || 0);
  const others = Math.round(byCat["Others"] || 0);

  if (/50\/?30\/?20|split|budget/i.test(q))
    return (
      `Here’s a practical 50/30/20 split based on your income (~NT$ ${inc}):\n` +
      `1) Essentials (Rent, Utilities, T-Pass, basic Food) ~50% → ~NT$ ${Math.round(inc * 0.5)}\n` +
      `2) Fun/Wants (Shopping, eating out, entertainment) ~30% → ~NT$ ${Math.round(inc * 0.3)}\n` +
      `3) Growth/Savings (cash buffer, debt paydown, skills) ~20% → ~NT$ ${Math.round(inc * 0.2)}\n\n` +
      `Your current month snapshot: Food ~NT$ ${food}, Shopping ~NT$ ${shop}, Utility & Rent ~NT$ ${util}, Others ~NT$ ${others}.\n` +
      `• Keep Food near NT$ 9,500 (base NT$ 250/day + weekend buffer)\n` +
      `• Cap Shopping at NT$ 2,000 with a 48-hour Wishlist rule\n` +
      `• If Food > cap, move snacks/drinks to “Wants” so Essentials stay clean`
    );

  if (/save|saving/i.test(q))
    return (
      `Target savings ≈ 20% of income → ~NT$ ${Math.round(inc * 0.2)} per month.\n` +
      `• Set an auto-transfer on payday so savings are “paid first”.\n` +
      `• Keep Food average at NT$ 250/day; batch-buy staples weekly.\n` +
      `• Use Wishlist + 48-hour cooldown to reduce impulse buys.\n` +
      `• Transport: T-Pass for routine; taxi micro-budget NT$ 600/month.\n` +
      `Consistently doing these trims 5–10% from Food/Shopping will cover most of the saving target.`
    );

  if (/taxi|t-?pass|transport/i.test(q))
    return (
      `Transport plan:\n` +
      `1) Use your T-Pass for bus/MRT; that’s the default for daily rides.\n` +
      `2) Hard-cap taxi at NT$ 600/month; tag extra rides as “Occasional Taxi”.\n` +
      `3) Late nights: split fare or book ahead; always log right after the ride.`
    );

  // Mặc định: câu trả lời dài có gạch đầu dòng để sinh gợi ý
  return (
    `Three quick actions you can take now:\n` +
    `• Lock 20% savings by auto-transfer on payday.\n` +
    `• Keep Food around NT$ 250/day (plan groceries weekly, bring water).\n` +
    `• Move non-urgent buys to Wishlist with a 48-hour cooldown.`
  );
}

/* ===== styles ===== */
const styles = StyleSheet.create({
  header: {
    backgroundColor: LINE,
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  headerSub: { color: "#fff", opacity: 0.9, marginTop: 4 },

  bubble: { marginVertical: 6, padding: 14, borderRadius: 18, maxWidth: "85%" },
  user: { alignSelf: "flex-end", backgroundColor: LINE },
  bot: { alignSelf: "flex-start", backgroundColor: WHITE, borderWidth: 1, borderColor: BORDER },
  loading: { flexDirection: "row", alignItems: "center" },

  // mỗi gợi ý là một “text box” riêng
  suggestBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderColor: "#B2F2BF",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 6,
    elevation: 1,
  },
  suggestText: { color: LINE, fontWeight: "700" },

  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
  },
  input: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: BORDER,
    color: TEXT,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: LINE,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
});
