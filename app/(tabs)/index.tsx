import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Badge, Button, Card, FAB, IconButton, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchDueFlashcards, fetchFlashcardStats } from '../../redux/slices/flashcardsSlice';
import { fetchAllNotebooks } from '../../redux/slices/notebooksSlice';
import { fetchAllNotes } from '../../redux/slices/notesSlice';
import { scheduleReviewReminder } from '../../services/notifications';

export default function HomeScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { notes } = useAppSelector((state) => state.notes);
    const { notebooks } = useAppSelector((state) => state.notebooks);
    const { stats } = useAppSelector((state) => state.flashcards);

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                dispatch(fetchAllNotes()),
                dispatch(fetchAllNotebooks()),
                dispatch(fetchDueFlashcards()),
                dispatch(fetchFlashcardStats())
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchAllNotes());
        dispatch(fetchAllNotebooks());
        dispatch(fetchDueFlashcards());
        dispatch(fetchFlashcardStats());
    }, [dispatch]);

    useEffect(() => {
        scheduleReviewReminder(stats?.due || 0);
    }, [stats?.due]);

    const recentNotes = React.useMemo(() => {
        return [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
    }, [notes]);

    const dueCount = stats?.due || 0;

    const renderNotebook = ({ item }: { item: any }) => (
        <Card
            mode="contained"
            style={[styles.notebookCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(`/notebook/${item.id}` as any)}
        >
            <Card.Content style={styles.notebookContent}>
                <Avatar.Icon size={48} icon={item.icon || 'folder-outline'} style={{ backgroundColor: theme.colors.primaryContainer, marginBottom: 12 }} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.notebookTitle} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {item.noteCount || 0} notes
                </Text>
            </Card.Content>
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <StatusBar style={theme.dark ? 'light' : 'dark'} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>Good Morning,</Text>
                        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                            Smart Learner
                        </Text>
                    </View>
                    <Surface style={[styles.notificationButton, { backgroundColor: theme.colors.surface }]} mode="elevated">
                        <IconButton
                            icon="bell-outline"
                            size={24}
                            onPress={() => { }}
                            iconColor={theme.colors.onSurface}
                        />
                        <Badge
                            visible={true}
                            size={10}
                            style={[styles.badge, { backgroundColor: theme.colors.error }]}
                        />
                    </Surface>
                </View>

                {/* Hero / Review Section */}
                <View style={styles.heroSection}>
                    <TouchableRipple
                        onPress={() => router.push('/review')}
                        style={styles.heroRipple}
                        borderless
                    >
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryContainer]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroGradient}
                        >
                            <View style={styles.heroDecoration}>
                                <MaterialCommunityIcons name="cards-outline" size={120} color="white" />
                            </View>

                            <View style={styles.heroContent}>
                                <View>
                                    <Surface style={[styles.dailyTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]} mode="flat">
                                        <Text style={styles.dailyTagText}>Daily Review</Text>
                                    </Surface>
                                    <Text variant="displayMedium" style={styles.dueCountText}>
                                        {dueCount}
                                    </Text>
                                    <Text style={styles.dueLabelText}>Cards due today</Text>

                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <Button
                                            mode="contained"
                                            onPress={() => router.push('/review')}
                                            buttonColor="white"
                                            textColor={theme.colors.primary}
                                            style={styles.startButton}
                                            labelStyle={styles.startButtonLabel}
                                        >
                                            Start Session
                                        </Button>
                                        <Button
                                            mode="contained"
                                            onPress={() => router.push('/timer' as any)}
                                            buttonColor="rgba(255,255,255,0.2)"
                                            textColor="white"
                                            style={styles.startButton}
                                            labelStyle={styles.startButtonLabel}
                                            icon="timer-outline"
                                        >
                                            Timer
                                        </Button>
                                    </View>
                                </View>

                                <Surface style={[styles.playButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]} mode="flat">
                                    <MaterialCommunityIcons name="play" size={32} color="white" />
                                </Surface>
                            </View>
                        </LinearGradient>
                    </TouchableRipple>
                </View>

                {/* Statistics Grid */}
                <View style={styles.statsGrid}>
                    {[
                        { label: 'Notes', value: notes.length, icon: 'file-document-outline', color: '#3B82F6' },
                        { label: 'Mastered', value: stats?.learned || 0, icon: 'check-circle-outline', color: '#10B981' },
                        { label: 'Reviews', value: stats?.totalReviews || 0, icon: 'chart-line', color: '#F59E0B' },
                    ].map((stat, index) => (
                        <Surface key={index} style={[styles.statCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                            <Avatar.Icon size={40} icon={stat.icon} style={{ backgroundColor: stat.color + '15', marginBottom: 8 }} color={stat.color} />
                            <Text variant="titleLarge" style={styles.statValue}>{stat.value}</Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline, textTransform: 'uppercase' }}>{stat.label}</Text>
                        </Surface>
                    ))}
                </View>

                {/* Notebooks Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleLarge" style={styles.sectionTitle}>Notebooks</Text>
                        <Button mode="text" onPress={() => router.push('/notebooks' as any)}>View All</Button>
                    </View>

                    <FlatList
                        data={notebooks}
                        renderItem={renderNotebook}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.notebookListContent}
                    />
                </View>

                {/* Recent Notes Section */}
                <View style={styles.recentFilesSection}>
                    <Text variant="titleLarge" style={styles.sectionTitleBottom}>Recent Notes</Text>

                    {recentNotes.length === 0 ? (
                        <Surface style={[styles.emptyState, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                            <MaterialCommunityIcons name="note-edit-outline" size={40} color={theme.colors.outline} />
                            <Text style={{ color: theme.colors.outline, marginTop: 8 }}>Create your first note</Text>
                        </Surface>
                    ) : (
                        recentNotes.map((note) => (
                            <Card key={note.id} style={[styles.noteCard, { backgroundColor: theme.colors.surface }]} mode="elevated" onPress={() => router.push(`/note/${note.id}` as any)}>
                                <Card.Title
                                    title={note.title}
                                    titleStyle={styles.noteTitle}
                                    subtitle={`${new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${notebooks.find(nb => nb.id === note.notebookId)?.name || 'General'}`}
                                    left={(props) => <Avatar.Icon {...props} icon={note.isPinned ? 'pin' : 'file-document-outline'} size={40} style={{ backgroundColor: note.isPinned ? theme.colors.primaryContainer : theme.colors.surfaceVariant }} color={note.isPinned ? theme.colors.primary : theme.colors.onSurfaceVariant} />}
                                    right={(props) => <IconButton {...props} icon="chevron-right" />}
                                />
                            </Card>
                        ))
                    )}
                </View>

            </ScrollView>

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/note/new')}
                color="white"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationButton: {
        borderRadius: 30,
        elevation: 2,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    heroSection: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    heroRipple: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    heroGradient: {
        padding: 24,
        borderRadius: 24,
    },
    heroDecoration: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        opacity: 0.1,
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dailyTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    dailyTagText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    dueCountText: {
        color: 'white',
        fontWeight: 'bold',
    },
    dueLabelText: {
        color: '#E0E7FF',
        fontSize: 16,
        marginBottom: 20,
    },
    startButton: {
        alignSelf: 'flex-start',
        borderRadius: 12,
    },
    startButtonLabel: {
        fontWeight: 'bold',
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsGrid: {
        paddingHorizontal: 24,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '31%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontWeight: 'bold',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
    },
    notebookListContent: {
        paddingHorizontal: 24,
    },
    notebookCard: {
        width: 150,
        marginRight: 16,
    },
    notebookContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    notebookTitle: {
        fontWeight: 'bold',
    },
    recentFilesSection: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    sectionTitleBottom: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    noteCard: {
        marginBottom: 12,
    },
    noteTitle: {
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
