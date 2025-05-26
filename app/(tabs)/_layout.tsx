import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Feather from '@expo/vector-icons/Feather';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFD700', // Gold color for active tabs
        tabBarInactiveTintColor: '#FFFFFF80', // Semi-transparent white for inactive
        headerShown: false,
        tabBarButton: HapticTab,
        // Removed TabBarBackground - this was likely causing the white border
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#873A3A',
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            height: 85,
            paddingTop: 10,
            paddingBottom: 25,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          },
          default: {
            backgroundColor: '#873A3A',
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            height: 75,
            paddingTop: 8,
            paddingBottom: 8,
            paddingHorizontal: 10,
            // Remove all borders and shadows that could cause white lines
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            borderLeftWidth: 0,
            borderRightWidth: 0,
            elevation: 8, // Clean shadow for Android
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            // Ensure it sits flush at bottom
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            // Add subtle gradient effect simulation
            overflow: 'hidden',
          }, 
        }),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        // Add some padding to make icons more balanced
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      }}>

      {/* Home Page */}
      <Tabs.Screen
        name="main"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={26} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome 
              name="search" 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <Feather 
              name="shopping-cart" 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}