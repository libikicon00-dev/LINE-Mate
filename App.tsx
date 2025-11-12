// C:\ProjectBeta\App.tsx
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import UtilitiesScreen from './src/screens/UtilitiesScreen';
import AIChatScreen from './src/screens/AIChatScreen';         // màn chat chi tiết (stack)
import SplashScreen from './src/screens/SplashScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import AddWishlistScreen from './src/screens/AddWishlistScreen';
import ReceiptImportScreen from './src/screens/ReceiptImportScreen';
import AIChatHub from './src/screens/AIChatHub';                // hub hiển thị 3 thẻ
// Budgets
import BudgetsHome from './src/screens/BudgetsHome';
import EditBudgetScreen from './src/screens/EditBudgetScreen';

// Icons
import { Feather as Icon } from '@react-native-vector-icons/feather';

// Context
import * as ExpenseCon from './src/context/ExpenseContext';

// Custom tab bar
import CustomTabBar from './src/screens/components/CustomTabBar';

enableScreens(true);

/* ================== Navigation types ================== */
type RootTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Utilities: undefined;
  AIHub: undefined;            // ⬅️ đổi tên tab, tránh trùng
};

type RootStackParamList = {
  Splash: undefined;
  MainTabs: undefined;
  AddWishlist: undefined;
  Trends: undefined;
  Add: { mode: 'spend' | 'income' } | undefined;
  ReceiptImport: { tab?: 'manual' | 'image' } | undefined;

  // Budgets
  BudgetsHome: undefined;
  EditBudget: { category?: string; preset?: number } | undefined;

  // AI Chat detail (đi từ Hub -> chi tiết)
  AIChatDetail: { topic?: string } | undefined;
};
/* ====================================================== */

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/* ================== Theme ================== */
const LINE_GREEN = '#00C853';
const LINE_LIGHT = '#00E676';

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: LINE_GREEN,
    background: '#F8FFF8',
    card: '#fff',
    text: '#1a1a1a',
    border: '#eee',
    notification: LINE_LIGHT,
  },
} as const;

/* ================== Tab icons map ================== */
const TAB_ICONS = {
  Dashboard: 'bar-chart-2',
  Calendar: 'calendar',
  Utilities: 'grid',
  AIHub: 'message-circle',     // ⬅️ khớp tên tab
} as const;

/* ================== Tabs ================== */
function MainTabs() {
  const { state } = ExpenseCon.useExpense();
  const wishlistCount = state.wishlist?.length ?? 0;

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#fff', shadowColor: '#eee', elevation: 1 },
        headerTitleStyle: { fontWeight: '700', color: '#1a1a1a' },
        tabBarActiveTintColor: LINE_GREEN,
        tabBarInactiveTintColor: '#999',
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const name = TAB_ICONS[route.name as keyof typeof TAB_ICONS] ?? 'circle';
          return <Icon name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Calendar"  component={CalendarScreen}  options={{ title: 'Calendar' }} />
      <Tab.Screen
        name="AIHub"                                       // ⬅️ chỉ 1 màn tab duy nhất
        component={AIChatHub}
        options={{ title: 'AI Chat' }}
      />
      <Tab.Screen
        name="Utilities"
        component={UtilitiesScreen}
        options={{
          title: 'Utilities',
              }}
      />
    </Tab.Navigator>
  );
}

/* ================== App Root ================== */
export default function App() {
  return (
    <ExpenseCon.ExpenseProvider>
      <NavigationContainer theme={AppTheme}>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* Optional single screens */}
          <Stack.Screen name="AddWishlist" component={AddWishlistScreen} />

          {/* Budgets module */}
          <Stack.Screen
            name="BudgetsHome"
            component={BudgetsHome}
            options={{
              headerShown: true,
              title: 'Budgets',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: '#1a1a1a', fontWeight: '700' },
            }}
          />
          <Stack.Screen
            name="EditBudget"
            component={EditBudgetScreen}
            options={{
              headerShown: true,
              title: 'Edit budget',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: '#1a1a1a', fontWeight: '700' },
            }}
          />

          <Stack.Screen
            name="Trends"
            component={TrendsScreen}
            options={{
              headerShown: true,
              title: 'Spending Trends',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: '#1a1a1a', fontWeight: '700' },
            }}
          />

          <Stack.Screen
            name="Add"
            component={AddTransactionScreen}
            options={{
              headerShown: true,
              title: 'Add Transaction',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: '#1a1a1a', fontWeight: '700' },
            }}
          />

          <Stack.Screen
            name="ReceiptImport"
            component={ReceiptImportScreen}
            options={{
              headerShown: true,
              title: 'Scan receipt',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: '#1a1a1a', fontWeight: '700' },
            }}
          />

          {/* Chat detail */}
          <Stack.Screen
            name="AIChatDetail"
            component={AIChatScreen}
            options={{
              headerShown: true,
              title: 'AI Chat',
              headerStyle: { backgroundColor: '#fff' },
              headerTitleStyle: { color: '#1a1a1a', fontWeight: '700' },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ExpenseCon.ExpenseProvider>
  );
}
