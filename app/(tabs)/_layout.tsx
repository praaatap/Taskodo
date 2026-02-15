import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { TaskProvider } from '../../context/TaskContext';

export default function TabLayout() {
  return (
    <TaskProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 64,
            paddingBottom: 10,
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
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="check-square"
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="two"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="calendar"
                size={22}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="pie-chart"
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </TaskProvider>
  );
}
