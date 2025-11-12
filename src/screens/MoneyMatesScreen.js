import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

// ✅ alias theo yêu cầu của bạn
import { Feather as Icon } from "@react-native-vector-icons/feather";
import { MaterialCommunityIcons as MC } from "@react-native-vector-icons/materialcommunityicons";

const LINE = "#00C300";
const LINE_SOFT = "#E8FBE8";
const BORDER = "#EAEAEA";
const TEXT = "#111";
const MUTED = "#666";

export default function MoneyMatesScreen({ navigation }) {
  const [msg, setMsg] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF6FF0A" }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MoneyMates</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting / Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <MC name="robot-happy-outline" size={28} color={LINE} />
          </View>
          <Text style={styles.heroTitle}>How’s money going lately?</Text>
          <Text style={styles.heroDesc}>
            MoneyMates can auto-track spending and teach you money basics. Chat
            to get started!
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickWrap}>
          <QuickItem
            icon="zap"
            text="Smart spending tips with MoneyMates"
            onPress={() => navigation.navigate("AIChat", { topic: "smart_spending" })}
          />
          <QuickItem
            icon="message-circle"
            text="Record an expense via chat"
            onPress={() => navigation.navigate("AIChat", { topic: "logging" })}
          />
          <QuickItem
            icon="dollar-sign"
            text="Set this month’s budget"
            onPress={() => navigation.navigate("AIChat", { topic: "budgeting" })}
            last
          />
        </View>

        {/* Suggestions */}
        <Text style={styles.section}>Suggestions for you</Text>
        <View style={styles.suggestRow}>
          <SuggestCard
            title="Analyze Food spending"
            onPress={() => navigation.navigate("AIChat", { topic: "food_analysis" })}
          />
          <SuggestCard
            title="Biggest expenses last month"
            onPress={() => navigation.navigate("AIChat", { topic: "top_expenses" })}
          />
          <SuggestCard
            title="Risk alerts & overspending"
            danger
            onPress={() => navigation.navigate("AIChat", { topic: "risk_alerts" })}
          />
        </View>
      </ScrollView>

      {/* Bottom chat bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Type a message..."
          placeholderTextColor={MUTED}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            navigation.navigate("AIChat", { topic: "smart_spending", seed: msg });
            setMsg("");
          }}
        >
          <Icon name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- sub components ---------- */

function QuickItem({ icon, text, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.quickItem, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.quickIcon}>
        <Icon name={icon} size={18} color={LINE} />
      </View>
      <Text style={styles.quickText}>{text}</Text>
      <Icon name="chevron-right" size={18} color={MUTED} />
    </TouchableOpacity>
  );
}

function SuggestCard({ title, onPress, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      style={[
        styles.suggestCard,
        danger && { backgroundColor: "#FFF8E7", borderColor: "#FFB30033" },
      ]}
    >
      <View style={{ flexDirection: "row", gap: 4, marginBottom: 8 }}>
        <MC name="sparkles" size={16} color={LINE} />
        <MC name="sparkles" size={16} color={LINE} />
      </View>
      <Text style={styles.suggestTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: TEXT },

  hero: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LINE_SOFT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  heroTitle: { fontSize: 20, fontWeight: "800", color: TEXT, marginBottom: 6 },
  heroDesc: { fontSize: 14, color: MUTED, lineHeight: 20 },

  quickWrap: {
    backgroundColor: "#F9FAF9",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 12,
  },
  quickItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  quickIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LINE_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  quickText: { flex: 1, fontSize: 15, color: TEXT, fontWeight: "600" },

  section: { fontSize: 16, fontWeight: "800", color: TEXT, marginVertical: 10 },
  suggestRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  suggestCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 14,
  },
  suggestTitle: { fontSize: 15, fontWeight: "700", color: TEXT },

  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    fontSize: 15,
    color: TEXT,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: LINE,
    alignItems: "center",
    justifyContent: "center",
  },
});
