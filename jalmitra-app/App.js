// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Theme } from './src/constants/theme';
import BrandMark from './src/components/BrandMark';
import LoginScreen    from './src/screens/LoginScreen';
import HomeScreen     from './src/screens/HomeScreen';
import ChatScreen     from './src/screens/ChatScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import FieldsScreen  from './src/screens/FieldsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import PumpScreen     from './src/screens/PumpScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainApp() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:   colors.navActive,
        tabBarInactiveTintColor: colors.navInactive,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor:  colors.navBorder,
          borderTopWidth:  1,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 10,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -6 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: Theme.font.family.text,
        },
        headerStyle: {
          backgroundColor: colors.bgCard,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
          fontFamily: Theme.font.family.display,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{
          title: 'Ghar',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home-variant' : 'home-variant-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen name="Pump" component={PumpScreen}
        options={{
          title: 'Sinchai',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'water-pump' : 'water-pump-off'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen name="Fields" component={FieldsScreen}
        options={{
          title: 'Khet',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name="leaf"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen name="Analytics" component={AnalyticsScreen}
        options={{
          title: 'Jaankari',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'chart-line' : 'chart-line-variant'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen name="Saathi" component={ChatScreen}
        options={{
          title: 'Saathi',
          headerTitle: 'JalMitra Saathi',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'message-text' : 'message-text-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen name="Alerts" component={AlertsScreen}
        options={{
          title: 'Alerts',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons
                name={focused ? 'bell' : 'bell-outline'}
                size={size}
                color={color}
              />
              <View style={{ position: 'absolute', top: -2, right: -6, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.red, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 8, color: '#fff', fontWeight: '800', fontFamily: Theme.font.family.text }}>3</Text>
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'account-circle' : 'account-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn, loading } = useAuth();
  const { isDark, colors } = useTheme();

  if (loading) {
    return (
      <>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent={false}
        />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bgBase,
        }}>
          <BrandMark size={72} subtitle="Smart sinchai, smart khet" align="center" tone="inverse" />
          <ActivityIndicator
            color={colors.amber}
            size="large"
            style={{ marginTop: 40 }}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor="transparent"
        translucent={false}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn
          ? <Stack.Screen name="Main" component={MainApp} />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}