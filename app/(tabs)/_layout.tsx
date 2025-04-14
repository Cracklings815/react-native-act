import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {
            backgroundColor: '#873A3A',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            height: 70,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 10,

            
          }, 
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginTop: 5,
        },
      }}>

      {/* Home Page */}
      <Tabs.Screen
        name="main"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />

 
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <FontAwesome name="search" size={28} color={color} />,
        }}
      />


      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <Feather name="shopping-cart" size={28} color={color} />,
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={28} color={color} />,
        }}
      />
<<<<<<< HEAD
      {/* <Tabs.Screen
        name="yap"
        options={{
          title: 'yap',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={28} color={color} />,
        }}
      /> */}
=======

      <Tabs.Screen
        name="act"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <MaterialIcons name="local-activity" size={24} color={color} />,
        }}
      />
>>>>>>> 4f57d473e9acf6a3b9a4d2a6eab085d0b30d8647
    </Tabs>
    
  );
}
