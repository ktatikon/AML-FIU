import React from "react";
import { Tabs } from "expo-router";
import { Home, Wallet, Settings, BarChart2, Shield } from "lucide-react-native";
import Colors from "@/constants/colors";
import ErrorBoundary from "@/components/ErrorBoundary";

const TabLayout = React.memo(() => {
  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.dark.primary,
          tabBarInactiveTintColor: Colors.dark.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.dark.backgroundSecondary,
            borderTopColor: Colors.dark.border,
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            fontFamily: 'Poppins',
          },
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: Colors.dark.text,
            fontFamily: 'Poppins',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
            tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="aml"
          options={{
            title: "AML",
            tabBarIcon: ({ color }) => <Shield size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
});

TabLayout.displayName = 'TabLayout';

export default TabLayout;