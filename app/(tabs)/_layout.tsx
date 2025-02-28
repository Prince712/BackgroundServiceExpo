import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Background Services',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bell"size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}