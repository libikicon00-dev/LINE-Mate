// C:\ProjectBeta\src\components\CategoryPickerModal.js
import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const LINE = "#00C853";
const BG_SOFT = "#F1FFF5";
const BORDER = "#E6F4EA";
const TEXT = "#1a1a1a";
const MUTED = "#6b7280";

const EXPENSE_GROUPS = [
  {
    title: "Daily spending",
    items: [
      { key: "groceries", name: "Groceries", icon: "shopping-cart" },
      { key: "food", name: "Food & Drinks", icon: "coffee" },
      { key: "transport", name: "Transport", icon: "truck" },
    ],
  },
  {
    title: "Incidental costs",
    items: [
      { key: "shopping", name: "Shopping", icon: "shopping-bag" },
      { key: "entertainment", name: "Entertainment", icon: "film" },
      { key: "beauty", name: "Beauty", icon: "scissors" },
      { key: "health", name: "Health", icon: "heart" },
      { key: "charity", name: "Charity", icon: "heart" },
    ],
  },
  {
    title: "Fixed costs",
    items: [
      { key: "bills", name: "Bills", icon: "file-text" },
      { key: "housing", name: "Housing", icon: "home" },
      { key: "family", name: "Family", icon: "users" },
    ],
  },
  {
    title: "Investing & saving",
    items: [
      { key: "investment", name: "Investment", icon: "trending-up" },
      { key: "education", name: "Education", icon: "book-open" },
      { key: "others", name: "Others", icon: "grid" },
    ],
  },
];

const INCOME_GROUPS = [
  {
    title: "Income",
    items: [
      { key: "salary", name: "Salary", icon: "briefcase" },
      { key: "business", name: "Business", icon: "bar-chart-2" },
      { key: "profit", name: "Profit", icon: "trending-up" },
      { key: "bonus", name: "Bonus", icon: "award" },
      { key: "allowance", name: "Allowance", icon: "credit-card" },
      { key: "debt_collection", name: "Debt Collection", icon: "rotate-ccw" },
      { key: "others_income", name: "Others", icon: "grid" },
    ],
  },
];

export default function CategoryPickerModal({
  visible,
  onClose,
  mode, // "expense" | "income"
  onSelect,
  onCreateNew,
  title,
}) {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const src = mode === "income" ? INCOME_GROUPS : EXPENSE_GROUPS;
    const needle = q.trim().toLowerCase();
    if (!needle) return src;
    return src
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.name.toLowerCase().includes(needle) ||
            i.key.toLowerCase().includes(needle)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [mode, q]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}>
        <View style={{ maxHeight: "85%", backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 16 }}>
          {/* Header */}
          <View style={{ paddingTop: 12, paddingBottom: 8, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: TEXT }}>{title ?? "Choose category"}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Icon name="x" size={22} color={TEXT} />
            </Pressable>
          </View>

          {/* Search + Create new */}
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 12, backgroundColor: "#fff", height: 44 }}>
              <Icon name="search" size={18} color={MUTED} />
              <TextInput
                placeholder="Search category"
                placeholderTextColor={MUTED}
                value={q}
                onChangeText={setQ}
                style={{ marginLeft: 8, flex: 1, color: TEXT, paddingVertical: 8 }}
              />
            </View>

            <TouchableOpacity
              onPress={onCreateNew}
              activeOpacity={0.85}
              style={{ height: 40, alignSelf: "flex-start", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", borderRadius: 10, backgroundColor: BG_SOFT, borderWidth: 1, borderColor: BORDER, gap: 8 }}
            >
              <Icon name="plus-circle" size={18} color={LINE} />
              <Text style={{ color: LINE, fontWeight: "600" }}>Create new</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={{ marginTop: 10 }} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}>
            {groups.map((g) => (
              <View key={g.title} style={{ marginTop: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, marginBottom: 8 }}>
                  <Icon name="dollar-sign" size={16} color={LINE} />
                  <Text style={{ color: LINE, fontWeight: "700" }}>{g.title}</Text>
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {g.items.map((it) => (
                    <Pressable
                      key={it.key}
                      onPress={() => { onSelect(it); onClose(); }}
                      style={{ width: "31%", alignItems: "center", paddingVertical: 14, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: BORDER }}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: BG_SOFT, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                        <Icon name={it.icon} size={22} color={LINE} />
                      </View>
                      <Text numberOfLines={1} style={{ color: TEXT, fontSize: 12, fontWeight: "600" }}>{it.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            {groups.length === 0 && (
              <View style={{ paddingVertical: 40, alignItems: "center", gap: 8 }}>
                <Icon name="inbox" size={24} color={MUTED} />
                <Text style={{ color: MUTED }}>No category found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
