import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchFlashcardStats } from '../../redux/slices/flashcardsSlice';

export default function ProgressScreen() {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { loading } = useAppSelector(state => state.flashcards);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await dispatch(fetchFlashcardStats()).unwrap();
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const masteryPercent = stats ? Math.round((stats.learned / stats.total) * 100) || 0 : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadStats} colors={[theme.colors.primary]} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Your Progress</Text>
                    <Text variant="bodyLarge" style={[styles.headerSubtitle, { color: theme.colors.outline }]}>Keep the momentum going! 🔥</Text>
                </View>

                {/* Main Score Card */}
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryContainer]}
                    style={styles.scoreCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Mastery Level</Text>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>SCHOLAR</Text>
                        </View>
                    </View>

                    <Text style={styles.scorePercent}>{masteryPercent}%</Text>

                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${masteryPercent}%` }
                            ]}
                        />
                    </View>

                    <Text style={styles.scoreFooter}>
                        {stats?.learned} of {stats?.total} concepts internalized
                    </Text>
                </LinearGradient>

                {/* Stats Grid */}
                <View style={styles.gridContainer}>
                    <StatCard
                        label="Due Today"
                        value={stats?.due || 0}
                        icon="alarm-outline"
                        iconColor="#D97706"
                        bg="#FEF3C7"
                        theme={theme}
                    />
                    <StatCard
                        label="Avg Multiplier"
                        value={stats?.avgEasiness ? stats.avgEasiness.toFixed(1) : '2.5'}
                        icon="flash-outline"
                        iconColor="#EA580C"
                        bg="#FFEDD5"
                        theme={theme}
                    />
                    <StatCard
                        label="Total Cards"
                        value={stats?.total || 0}
                        icon="copy-outline"
                        iconColor="#2563EB"
                        bg="#DBEAFE"
                        theme={theme}
                    />
                    <StatCard
                        label="Internalized"
                        value={stats?.learned || 0}
                        icon="brain-outline"
                        iconColor="#059669"
                        bg="#D1FAE5"
                        theme={theme}
                    />
                </View>

                {/* Export Action */}
                <Surface style={[styles.exportCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                    <TouchableOpacity style={styles.exportButton} onPress={() => { /* export logic */ }}>
                        <View style={styles.exportLeft}>
                            <View style={[styles.exportIconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Ionicons name="share-outline" size={20} color={theme.colors.primary} />
                            </View>
                            <View>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Export Learning Data</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Generate a PDF study summary</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.outline} />
                    </TouchableOpacity>
                </Surface>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatCard({ label, value, icon, iconColor, bg, theme }: any) {
    return (
        <Surface style={[styles.statCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={0}>
            <View style={[styles.statIconContainer, { backgroundColor: theme.dark ? theme.colors.surfaceVariant : bg }]}>
                <Ionicons name={icon} size={22} color={theme.dark ? theme.colors.primary : iconColor} />
            </View>
            <Text variant="labelSmall" style={styles.statLabel}>{label}</Text>
            <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>{value}</Text>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    headerTitle: {
        fontWeight: 'bold',
    },
    headerSubtitle: {
        marginTop: 4,
    },
    scoreCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    levelBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    levelText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    scorePercent: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    scoreFooter: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        marginTop: 12,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statLabel: {
        color: '#94A3B8',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontWeight: 'bold',
        marginTop: 4,
    },
    exportCard: {
        borderRadius: 16,
        marginBottom: 24,
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    exportLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportIconContainer: {
        padding: 10,
        borderRadius: 10,
        marginRight: 12,
    },
});
