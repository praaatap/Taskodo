import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskProvider } from '../../context/TaskContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <TaskProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 8,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -2,
          },
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#9CA3AF',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => (
              <Feather name="check-square" size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="two"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => (
              <Feather name="calendar" size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => (
              <Feather name="pie-chart" size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <Feather name="user" size={22} color={color} />
            ),
          }}
        />

      </Tabs>
    </TaskProvider>
  );
}
