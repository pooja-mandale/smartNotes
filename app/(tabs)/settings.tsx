import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Surface, Switch, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { resetDatabase } from '../../database/init';
import { setDailyReminders, setDarkMode, setThemeColor } from '../../redux/slices/settingsSlice';
import { RootState } from '../../redux/store';

import { cancelAllReminders } from '../../services/notifications';

export default function SettingsScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { darkMode, dailyReminders, themeColor } = useSelector((state: RootState) => state.settings);

    const handleToggleReminders = (val: boolean) => {
        dispatch(setDailyReminders(val));
        if (!val) {
            cancelAllReminders();
        }
    };

    const handleResetData = () => {
        Alert.alert(
            'Erase All Data',
            'Are you absolutely sure? This will delete all your notes, notebooks, and flashcards. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Erase Everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resetDatabase();
                            dispatch({ type: 'GLOBAL_RESET' });
                            Alert.alert('Success', 'All data has been erased.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset database.');
                        }
                    },
                },
            ]
        );
    };

    const handleFeedback = () => {
        Linking.openURL('mailto:support@thinkstack.app?subject=ThinkStack Feedback');
    };

    const themeColors = [
        { name: 'Indigo', color: '#6366F1' },
        { name: 'Emerald', color: '#10B981' },
        { name: 'Rose', color: '#F43F5E' },
        { name: 'Amber', color: '#F59E0B' },
        { name: 'Sky', color: '#0EA5E9' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Section */}
                <Surface style={[styles.profileCard, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={1}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                        <Ionicons name="person" size={32} color={theme.colors.primary} />
                    </View>
                    <View>
                        <Text variant="titleLarge" style={[styles.profileName, { color: theme.colors.onSurface }]}>ThinkStack User</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>Offline Personal Vault</Text>
                    </View>
                </Surface>

                {/* Settings Group */}
                <Text variant="labelSmall" style={styles.sectionHeader}>Preferences</Text>
                <Surface style={[styles.settingsGroup, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={1}>
                    <SettingItem
                        icon="moon-outline"
                        label="Dark Mode"
                        toggle={true}
                        value={darkMode}
                        onToggle={(val: boolean) => dispatch(setDarkMode(val))}
                    />
                    <Divider />
                    <SettingItem
                        icon="notifications-outline"
                        label="Daily Reminders"
                        toggle={true}
                        value={dailyReminders}
                        onToggle={handleToggleReminders}
                    />
                </Surface>

                <Text variant="labelSmall" style={styles.sectionHeader}>Appearance</Text>
                <Surface style={[styles.settingsGroup, { backgroundColor: theme.colors.surface, padding: 16 }]} mode="elevated" elevation={1}>
                    <Text variant="bodyMedium" style={{ marginBottom: 12, color: theme.colors.onSurfaceVariant }}>Primary Theme Color</Text>
                    <View style={styles.colorRow}>
                        {themeColors.map((item) => (
                            <TouchableRipple
                                key={item.color}
                                onPress={() => dispatch(setThemeColor(item.color))}
                                style={[
                                    styles.colorCircle,
                                    { backgroundColor: item.color },
                                    themeColor === item.color && { borderWidth: 3, borderColor: theme.colors.onSurface }
                                ]}
                            >
                                <View />
                            </TouchableRipple>
                        ))}
                    </View>
                </Surface>

                <Text variant="labelSmall" style={styles.sectionHeader}>Data Management</Text>
                <Surface style={[styles.settingsGroup, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={1}>
                    <SettingItem
                        icon="trash-outline"
                        label="Erase All Data"
                        destructive={true}
                        onPress={handleResetData}
                    />
                </Surface>

                <Text variant="labelSmall" style={styles.sectionHeader}>About</Text>
                <Surface style={[styles.settingsGroup, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={1}>
                    <SettingItem
                        icon="information-circle-outline"
                        label="Version"
                        displayValue="1.0.0"
                    />
                    <Divider />
                    <SettingItem
                        icon="mail-outline"
                        label="Send Feedback"
                        onPress={handleFeedback}
                    />
                    <Divider />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label="Privacy Policy"
                        onPress={() => Linking.openURL('https://thinkstack.app/privacy')}
                    />
                    <Divider />
                    <SettingItem
                        icon="globe-outline"
                        label="Developer Portfolio"
                        onPress={() => Linking.openURL('https://poojaMandale.vercel.app')}
                    />
                </Surface>

                <View style={styles.footer}>
                    <Text variant="labelSmall" style={[styles.versionText, { color: theme.colors.outline }]}>THINKSTACK</Text>
                    <Text variant="bodySmall" style={[styles.subFooterText, { color: theme.colors.outline }]}>100% Offline | Spaced Repetition</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 12, fontSize: 10, opacity: 0.8 }}>Made with ❤️ by Pooja Mandale</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function SettingItem({ icon, label, toggle, value, destructive, displayValue, onToggle, onPress }: any) {
    const theme = useTheme();
    const color = destructive ? theme.colors.error : theme.colors.onSurface;

    return (
        <TouchableRipple onPress={onPress}>
            <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: destructive ? theme.colors.errorContainer : theme.colors.surfaceVariant }]}>
                        <Ionicons name={icon} size={20} color={destructive ? theme.colors.error : theme.colors.onSurfaceVariant} />
                    </View>
                    <Text variant="bodyLarge" style={{ color: color, fontWeight: '500' }}>{label}</Text>
                </View>

                {toggle ? (
                    <Switch
                        value={value}
                        onValueChange={onToggle}
                        thumbColor={value ? theme.colors.primary : theme.colors.surface}
                        trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                    />
                ) : (
                    <View style={styles.settingRight}>
                        {displayValue && <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>{displayValue}</Text>}
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.onSurfaceVariant} />
                    </View>
                )}
            </View>
        </TouchableRipple>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 16,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    profileName: {
        fontWeight: 'bold',
    },
    sectionHeader: {
        marginBottom: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginLeft: 4,
        opacity: 0.6,
    },
    settingsGroup: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        padding: 8,
        borderRadius: 10,
        marginRight: 12,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    versionText: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    subFooterText: {
        marginTop: 4,
        fontSize: 10,
    },
});
