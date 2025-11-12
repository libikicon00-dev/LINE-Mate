import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Feather";

const LINE = "#00C853";
const SOFT = "#F1FFF4";
const BORDER = "#E7EFE7";
const TEXT = "#1A1A1A";
const MUTED = "#6B7280";

export default function AIChatHub() {
  const navigation = useNavigation();

  const go = (payload) => navigation.navigate("AIChatDetail", payload);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>MoneyMates — AI Chat (Demo)</Text>
        <Text style={styles.heroSub}>Smart with money, kind with you 💚</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <TouchableOpacity style={styles.btnGhost} onPress={() => go({ reset: true })}>
            <Text style={styles.btnGhostText}>Reset chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnGhost}
            onPress={() =>
              go({
                topic: "smart_spending",
                seedQuestion: "How to split my income into budgets?",
                seedAnswer:
                "Here’s a plan tuned to your pattern:\n\n" +
                "1) Food & Drinks: keep a soft cap of NT$9,500. With a daily floor of NT$250, your base is ~NT$7,500; give yourself ~NT$2,000 buffer for weekends or eating out. Batch-cook twice a week to pull average back to ~NT$230/day.\n" +
                "2) Transport: you already have a T-Pass (NT$1,200). Set a taxi micro-budget of NT$600 for the whole month and tag it “Occasional Taxi.” Anything above that needs a trade-off decision.\n" +
                "3) Shopping: cap at NT$2,000 this month (you overshot before). Use a 48-hour wishlist cooldown; if an item still matters after 2 days, buy it. This alone typically saves NT$1,000–2,000.\n" +
                "4) Utility& Rent: keep this stable (~NT$16–17.5k). Pay on payday so cashflow stays clean.\n" +
                "5) Others: move recurring items out of “Others.” Create explicit categories (e.g., Gifts, Education) so ‘Others’ stays < NT$1,000.\n\n" +
                "Rule of thumb: Needs ~50%, Wants ~30%, Savings/Growth ~20%. On income ~NT$42,000 → Needs ~NT$21,000, Wants ~NT$12,600, Savings ~NT$8,400. Lock Savings first (auto-transfer), let the app allocate the rest."

              })
            }
          >
            <Text style={styles.btnGhostText}>Load demo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3 ô tính năng */}
      <CardRow
        icon="video"
        title="Smart spending tips"
        subtitle="Quick, practical coaching"
        onPress={() =>
          go({
            topic: "smart_spending",
            seedQuestion: "Give me some smart spending tips this month.",
            seedAnswer:
            "Here’s a plan tuned to your pattern:\n\n" +
  "1) Food & Drinks: keep a soft cap of NT$9,500. With a daily floor of NT$250, your base is ~NT$7,500; give yourself ~NT$2,000 buffer for weekends or eating out. Batch-cook twice a week to pull average back to ~NT$230/day.\n" +

  "2) Transport: you already have a T-Pass (NT$1,200). Set a taxi micro-budget of NT$600 for the whole month and tag it “Occasional Taxi.” Anything above that needs a trade-off decision.\n" +

  "3) Shopping: cap at NT$2,000 this month (you overshot before). Use a 48-hour wishlist cooldown; if an item still matters after 2 days, buy it. This alone typically saves NT$1,000–2,000.\n" +
  
  "4) Utility & Rent: keep this stable (~NT$16–17.5k). Pay on payday so cashflow stays clean.\n" +


  "5) Others: move recurring items out of “Others.” Create explicit categories (e.g., Gifts, Education) so ‘Others’ stays < NT$1,000.\n\n" +

  "Rule of thumb: Needs ~50%, Wants ~30%, Savings/Growth ~20%. On income ~NT$42,000 → Needs ~NT$21,000, Wants ~NT$12,600, Savings ~NT$8,400. Lock Savings first (auto-transfer), let the app allocate the rest."
          })
        }
      />
      <CardRow
        icon="message-circle"
        title="Log expenses via chat"
        subtitle={`Type like: “Lunch 120 NTD Cash”`}
        onPress={() =>
          go({
            topic: "log_expense",
            seedQuestion: "Lunch 120 NTD Cash; Taxi 180 NTD Line Pay",
            seedAnswer:
            "Logged ✅\n" +
  "• Lunch — NT$120 (Food & Drinks, Cash)\n" +
  "• Taxi — NT$180 (Transport, Line Pay)\n\n" +
  "Tips to make chat logging fast:\n" +
  "• One line per item: “Milk 90 NTD Bank” or “Dinner 250 NTD Cash”.\n" +
  "• I’ll auto-guess category & source; you just confirm.\n" +
  "• If it’s a budgeted category (Food, Shopping), I’ll show remaining instantly so you see the impact."

          })
        }
      />
      <CardRow
        icon="tag"
        title="Set monthly budget"
        subtitle="Auto-split & suggestions"
        onPress={() =>
          go({
            topic: "budgeting",
            seedQuestion: "Suggest a monthly budget split for me.",
            seedAnswer:
             "Based on your recent pattern, here’s a realistic split and caps you can lock now:\n\n" +
  "• Food & Drinks → 28–30% (cap ~NT$9,500). Base ~NT$7,500 from NT$250/day + week-end buffer.\n" +
  "• Shopping → 5% (cap ~NT$2,000) to undo last month’s overspend.\n" +
  "• Utility & Rent → 38–42% (cap ~NT$16,500–17,500) depending on bills.\n" +
  "• Transport → T-Pass NT$1,200 fixed + Taxi micro-budget NT$600.\n" +
  "• Others → cap NT$1,000; break out recurring items into named categories.\n\n" +
  "That keeps Needs ≈ 50%, Wants ≈ 30%, Savings/Growth ≈ 20% (≈ NT$8,400). Lock Savings first, then I’ll auto-distribute the rest into the caps above."
          })
        }
      />
    </ScrollView>
  );
}

function CardRow({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={18} color={LINE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
      </View>
      <Icon name="chevron-right" size={18} color={MUTED} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#F6FFF6", padding: 12 },
  hero: {
    backgroundColor: LINE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
  heroSub: { color: "#fff", opacity: 0.9, marginTop: 4 },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnGhostText: { color: "#fff", fontWeight: "700" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: SOFT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardTitle: { color: TEXT, fontWeight: "700" },
  cardSub: { color: MUTED, marginTop: 2 },
});
