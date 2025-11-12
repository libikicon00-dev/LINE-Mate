// C:\ProjectBeta\src\context\ExpenseContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* =========================
   Types
   ========================= */
export type Expense = {
  id: string;
  date: string;      // ISO 'YYYY-MM-DD'
  amount: number;    // >= 0 (chi tiêu lưu dương cho nhất quán)
  category: string;
  note?: string;
  wallet?: string;
};

export type Income = {
  id: string;
  date: string;      // ISO 'YYYY-MM-DD'
  amount: number;    // >= 0
  source?: string;   // Salary, Bonus, ...
  note?: string;
  wallet?: string;
};

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  createdAt: string;    // ISO
  cooldownHours?: number;
};

/* =========================
   Monthly Budget
   ========================= */
export type Budget = {
  id: string;          // b_{category}_{month}
  month: string;       // 'YYYY-MM'
  category: string;    // chuẩn hóa để trùng Dashboard
  limit: number;       // NTD
  carryover?: boolean; // nếu true: vượt chi tháng này trừ vào tháng sau
};

/* Legacy budgets (giữ tương thích) */
export type Budgets = {
  [category: string]: number;
};

/* =========================
   Constants & Helpers
   ========================= */
const VERSION = 2; // bump nếu thay đổi cấu trúc state

export const normalizeCategory = (raw: string) => {
  const c = (raw || '').toLowerCase();
  if (c.includes('food') || c.includes('drink') || c.includes('grocer')) return 'Food & Drinks';
  if (c.includes('shopping') || c.includes('beauty') || c.includes('entertainment')) return 'Shopping';
  if (c.includes('family')) return 'Family';
  if (c.includes('bill') || c.includes('hous') || c.includes('rent') || c.includes('utility')) return 'Utility & Rent';
  if (c.includes('wishlist')) return 'Wishlist';
  return 'Others';
};

export const ym = (d: Date | string) =>
  (typeof d === 'string' ? d : d.toISOString()).slice(0, 7);

export const sumExpenseByCat = (expenses: Expense[], month: string, category: string) =>
  expenses
    .filter(e => e.date?.slice(0, 7) === month && normalizeCategory(e.category) === category)
    .reduce((s, e) => s + Math.abs(e.amount || 0), 0);

export const getOverspend = (
  expenses: Expense[],
  month: string,
  category: string,
  limit: number
) => {
  const spent = sumExpenseByCat(expenses, month, category);
  return Math.max(0, spent - (limit || 0)); // >0 nghĩa là lố
};

/* =========================
   Global State / Context
   ========================= */
export type ExpenseState = {
  __version: number;
  expenses: Expense[];
  incomes: Income[];
  wishlist: WishlistItem[];
  budgets: Budgets;          // legacy (category -> number)
  budgetsByMonth: Budget[];  // new monthly budgets
  threshold: number;         // % cảnh báo ở BudgetsHome: 0.8/0.9/1.0
};

export type ExpenseContextType = {
  state: ExpenseState;

  // CRUD
  addExpense: (e: Expense) => void;
  addIncome: (i: Income) => void;
  addWishlist: (w: WishlistItem) => void;
  removeWishlist: (id: string) => void;
  buyWishlist: (id: string) => void;

  // legacy
  setBudget: (category: string, value: number) => void;
  setSettings: (data: Partial<Pick<ExpenseState, 'threshold'>>) => void;
  setThreshold: (v: number) => void; // tiện gọi từ UI

  // monthly budgets
  setBudgetMonthly: (b: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  getBudgetInfo: (month: string, category: string) => { limit: number; spent: number; remain: number };
  getOverspendInfo: (month: string, category: string) => { limit: number; spent: number; over: number };
  rolloverMonth: (month: string) => void;

  // Selectors tiện dụng cho UI
  getMonthExpenses: (d: Date | string) => Expense[];
  getMonthIncomes:  (d: Date | string) => Income[];
  getMonthlySpendByCategory: (d: Date | string) => Record<string, number>;
  getMonthlyIncomeBuckets:   (d: Date | string) => Record<string, number>;
};

/* =========================
   Storage Keys
   ========================= */
const STORAGE_KEY_V2 = 'finmind_data_v2';
const STORAGE_KEY_V1 = 'finmind_data_v1';

/* =========================
   Initial
   ========================= */
const initialState: ExpenseState = {
  __version: VERSION,
  expenses: [],
  incomes: [],
  wishlist: [],
  budgets: {},
  budgetsByMonth: [],
  threshold: 0.9,
};

/* =========================
   Reducer
   ========================= */
type Action =
  | { type: 'HYDRATE'; payload?: Partial<ExpenseState> }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'ADD_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_WISHLIST'; payload: string }
  | { type: 'SET_BUDGET'; payload: { category: string; value: number } }
  | { type: 'SET_SETTINGS'; payload: { threshold: number } }
  // monthly budgets
  | { type: 'SET_BUDGET_MONTHLY'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: { id: string } }
  | { type: 'ROLLOVER_BUDGET'; payload: { month: string } };

function reducer(state: ExpenseState, action: Action): ExpenseState {
  switch (action.type) {
    case 'HYDRATE': {
      const p = action.payload ?? {};
      return {
        ...state,
        __version: VERSION,
        expenses: Array.isArray(p.expenses) ? p.expenses : state.expenses,
        incomes: Array.isArray(p.incomes) ? p.incomes : state.incomes,
        wishlist: Array.isArray(p.wishlist) ? p.wishlist : state.wishlist,
        budgets: { ...state.budgets, ...(p.budgets ?? {}) },
        budgetsByMonth: Array.isArray(p.budgetsByMonth) ? p.budgetsByMonth : state.budgetsByMonth,
        threshold: typeof p.threshold === 'number' ? p.threshold : state.threshold,
      };
    }

    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };

    case 'ADD_INCOME':
      return { ...state, incomes: [action.payload, ...state.incomes] };

    case 'ADD_WISHLIST':
      return { ...state, wishlist: [action.payload, ...state.wishlist] };

    case 'REMOVE_WISHLIST':
      return { ...state, wishlist: state.wishlist.filter(w => w.id !== action.payload) };

    case 'SET_BUDGET':
      return { ...state, budgets: { ...state.budgets, [action.payload.category]: action.payload.value } };

    case 'SET_SETTINGS':
      return { ...state, threshold: action.payload.threshold };

    case 'SET_BUDGET_MONTHLY': {
      const b = action.payload;
      const rest = (state.budgetsByMonth || []).filter(
        x => !(x.month === b.month && normalizeCategory(x.category) === normalizeCategory(b.category))
      );
      return { ...state, budgetsByMonth: [b, ...rest] };
    }

    case 'DELETE_BUDGET':
      return { ...state, budgetsByMonth: state.budgetsByMonth.filter(b => b.id !== action.payload.id) };

    case 'ROLLOVER_BUDGET': {
      const curMonth = action.payload.month;
      const next = new Date(curMonth + '-01');
      next.setMonth(next.getMonth() + 1);
      const nextMonth = ym(next);

      const nextBudgets = [...state.budgetsByMonth];

      state.budgetsByMonth.forEach(b => {
        if (b.month !== curMonth || !b.carryover) return;
        const cat = normalizeCategory(b.category);
        const spent = sumExpenseByCat(state.expenses, curMonth, cat);
        const over = spent - b.limit; // > 0: quá hạn mức
        if (over > 0) {
          const existed = nextBudgets.find(
            x => x.month === nextMonth && normalizeCategory(x.category) === cat
          );
          const newLimit = Math.max(0, (existed?.limit || 0) - over);
          const nextB: Budget = {
            id: `b_${cat}_${nextMonth}`,
            month: nextMonth,
            category: cat,
            limit: newLimit,
            carryover: true,
          };
          if (existed) {
            const idx = nextBudgets.findIndex(
              x => x.month === nextMonth && normalizeCategory(x.category) === cat
            );
            nextBudgets[idx] = nextB;
          } else {
            nextBudgets.push(nextB);
          }
        }
      });

      return { ...state, budgetsByMonth: nextBudgets };
    }

    default:
      return state;
  }
}

/* =========================
   Provider
   ========================= */
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load & migrate
  useEffect(() => {
    (async () => {
      try {
        const v2 = await AsyncStorage.getItem(STORAGE_KEY_V2);
        if (v2) {
          const data = JSON.parse(v2) as Partial<ExpenseState>;
          dispatch({ type: 'HYDRATE', payload: data });
          return;
        }
        const v1 = await AsyncStorage.getItem(STORAGE_KEY_V1);
        if (v1) {
          const d1 = JSON.parse(v1) as Partial<ExpenseState>;
          const migrated: Partial<ExpenseState> = {
            __version: VERSION,
            expenses: Array.isArray(d1.expenses) ? d1.expenses : [],
            incomes: [],
            wishlist: Array.isArray(d1.wishlist) ? d1.wishlist : [],
            budgets: d1.budgets ?? {},
            budgetsByMonth: [],
            threshold: typeof d1.threshold === 'number' ? d1.threshold : initialState.threshold,
          };
          dispatch({ type: 'HYDRATE', payload: migrated });
          await AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ ...initialState, ...migrated }));
        }
      } catch (e) {
        console.error('Error loading data:', e);
      }
    })();
  }, []);

  // Persist
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ ...state, __version: VERSION })).catch(() => {});
  }, [state]);

  /* ===== Actions ===== */
  const addExpense = React.useCallback((e: Expense) => {
    if (!Number.isFinite(e.amount) || e.amount < 0) return;
    const normalized: Expense = { ...e, category: normalizeCategory(e.category) };
    dispatch({ type: 'ADD_EXPENSE', payload: normalized });
  }, []);

  const addIncome = React.useCallback((i: Income) => {
    if (!Number.isFinite(i.amount) || i.amount < 0) return;
    dispatch({ type: 'ADD_INCOME', payload: i });
  }, []);

  const addWishlist = React.useCallback((w: WishlistItem) => {
    if (!w.name?.trim() || !Number.isFinite(w.price) || w.price < 0) return;
    dispatch({ type: 'ADD_WISHLIST', payload: w });
  }, []);

  const removeWishlist = React.useCallback((id: string) => {
    dispatch({ type: 'REMOVE_WISHLIST', payload: id });
  }, []);

  const buyWishlist = React.useCallback((id: string) => {
    const item = state.wishlist.find(w => w.id === id);
    if (!item) return;
    const expense: Expense = {
      id: `e_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amount: item.price,
      category: 'Wishlist',
      note: item.name,
    };
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    dispatch({ type: 'REMOVE_WISHLIST', payload: id });
  }, [state.wishlist]);

  // legacy budget
  const setBudget = React.useCallback((category: string, value: number) => {
    if (!category.trim() || !Number.isFinite(value) || value < 0) return;
    dispatch({ type: 'SET_BUDGET', payload: { category: normalizeCategory(category), value } });
  }, []);

  const setSettings = React.useCallback((data: Partial<Pick<ExpenseState, 'threshold'>>) => {
    const th = data.threshold;
    if (th == null) return;
    if (!Number.isFinite(th) || th < 0 || th > 1) return;
    dispatch({ type: 'SET_SETTINGS', payload: { threshold: th } });
  }, []);

  const setThreshold = React.useCallback((v: number) => {
    if (!Number.isFinite(v) || v < 0 || v > 1) return;
    dispatch({ type: 'SET_SETTINGS', payload: { threshold: v } });
  }, []);

  // monthly budgets
  const setBudgetMonthly = React.useCallback((b: Omit<Budget, 'id'>) => {
    if (!b.category?.trim() || !b.month?.trim() || !Number.isFinite(b.limit) || b.limit < 0) return;
    const cat = normalizeCategory(b.category);
    const payload: Budget = { ...b, id: `b_${cat}_${b.month}`, category: cat };
    dispatch({ type: 'SET_BUDGET_MONTHLY', payload });
  }, []);

  const deleteBudget = React.useCallback((id: string) => {
    dispatch({ type: 'DELETE_BUDGET', payload: { id } });
  }, []);

  const getBudgetInfo = React.useCallback(
    (month: string, category: string) => {
      const cat = normalizeCategory(category);
      const limit =
        state.budgetsByMonth.find(b => b.month === month && normalizeCategory(b.category) === cat)?.limit || 0;
      const spent = sumExpenseByCat(state.expenses, month, cat);
      return { limit, spent, remain: Math.max(0, limit - spent) };
    },
    [state.expenses, state.budgetsByMonth]
  );

  const getOverspendInfo = React.useCallback(
    (month: string, category: string) => {
      const cat = normalizeCategory(category);
      const limit =
        state.budgetsByMonth.find(b => b.month === month && normalizeCategory(b.category) === cat)?.limit || 0;
      const spent = sumExpenseByCat(state.expenses, month, cat);
      const over = Math.max(0, spent - limit);
      return { limit, spent, over };
    },
    [state.expenses, state.budgetsByMonth]
  );

  const rolloverMonth = React.useCallback((month: string) => {
    dispatch({ type: 'ROLLOVER_BUDGET', payload: { month } });
  }, []);

  /* ===== Selectors for UI ===== */
  const getMonthExpenses = React.useCallback((d: Date | string) => {
    const key = typeof d === 'string' ? d.slice(0, 7) : ym(d);
    return state.expenses.filter(e => e.date?.slice(0, 7) === key);
  }, [state.expenses]);

  const getMonthIncomes = React.useCallback((d: Date | string) => {
    const key = typeof d === 'string' ? d.slice(0, 7) : ym(d);
    return state.incomes.filter(i => i.date?.slice(0, 7) === key);
  }, [state.incomes]);

  const getMonthlySpendByCategory = React.useCallback((d: Date | string) => {
    const key = typeof d === 'string' ? d.slice(0, 7) : ym(d);
    const buckets: Record<string, number> = {
      'Food & Drinks': 0,
      'Shopping': 0,
      'Family': 0,
      'Utility & Rent': 0,
      'Wishlist': 0,
      'Others': 0,
    };
    state.expenses.forEach(e => {
      if (e.date?.slice(0, 7) !== key) return;
      const k = normalizeCategory(e.category);
      buckets[k] = (buckets[k] || 0) + Math.abs(e.amount || 0);
    });
    return buckets;
  }, [state.expenses]);

  const getMonthlyIncomeBuckets = React.useCallback((d: Date | string) => {
    const key = typeof d === 'string' ? d.slice(0, 7) : ym(d);
    const buckets: Record<string, number> = {
      'Salary': 0, 'Business & Profit': 0, 'Bonus & Allowance': 0, 'Debt Collection': 0, 'Others': 0,
    };
    state.incomes.forEach(i => {
      if (i.date?.slice(0, 7) !== key) return;
      const s = (i.source || '').toLowerCase();
      const v = Math.abs(Number(i.amount) || 0);
      if (s.includes('salary')) buckets['Salary'] += v;
      else if (s.includes('business') || s.includes('profit')) buckets['Business & Profit'] += v;
      else if (s.includes('bonus') || s.includes('allowance')) buckets['Bonus & Allowance'] += v;
      else if (s.includes('debt') || s.includes('collection')) buckets['Debt Collection'] += v;
      else buckets['Others'] += v;
    });
    return buckets;
  }, [state.incomes]);

  return (
    <ExpenseContext.Provider
      value={{
        state,
        addExpense,
        addIncome,
        addWishlist,
        removeWishlist,
        buyWishlist,
        setBudget,
        setSettings,
        setThreshold,
        setBudgetMonthly,
        deleteBudget,
        getBudgetInfo,
        getOverspendInfo,
        rolloverMonth,
        getMonthExpenses,
        getMonthIncomes,
        getMonthlySpendByCategory,
        getMonthlyIncomeBuckets,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

/* =========================
   Hook
   ========================= */
export function useExpense() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpense must be used within an ExpenseProvider');
  return ctx;
}
