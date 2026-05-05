import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

export default function TabLayout() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { darkMode, themeColor } = useSelector((state: RootState) => state.settings);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: themeColor,
                tabBarInactiveTintColor: darkMode ? '#64748B' : '#94A3B8',
                tabBarStyle: {
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 8,
                    borderTopWidth: 0,
                    backgroundColor: theme.colors.surface,
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -10 },
                    shadowOpacity: darkMode ? 0.3 : 0.05,
                    shadowRadius: 20,
                },
                headerShown: false,
                tabBarLabelStyle: {
                    fontWeight: '600',
                    fontSize: 11,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Notes',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "book" : "book-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="review"
                options={{
                    title: 'Review',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "repeat" : "repeat-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "analytics" : "analytics-outline"} size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
