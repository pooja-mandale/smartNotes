import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../hooks/redux';

export default function NotebooksScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { notebooks } = useAppSelector((state) => state.notebooks);

    const renderItem = ({ item }: { item: any }) => (
        <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            mode="elevated"
            onPress={() => router.push(`/notebook/${item.id}` as any)}
        >
            <Card.Title
                title={item.name}
                titleStyle={styles.cardTitle}
                subtitle={`${item.noteCount || 0} notes`}
                left={(props) => (
                    <Avatar.Icon
                        {...props}
                        icon={item.icon || 'folder-outline'}
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                        color={theme.colors.primary}
                    />
                )}
                right={(props) => <IconButton {...props} icon="chevron-right" />}
            />
        </Card>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={theme.colors.onSurface} />
                <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>All Notebooks</Text>
                <IconButton icon="plus" onPress={() => { /* Add notebook logic */ }} iconColor={theme.colors.primary} />
            </View>

            <FlatList
                data={notebooks}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="folder-open-outline" size={64} color={theme.colors.outline} />
                        <Text variant="bodyLarge" style={{ color: theme.colors.outline, marginTop: 16 }}>No notebooks found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    headerTitle: {
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    card: {
        marginBottom: 12,
        borderRadius: 16,
    },
    cardTitle: {
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
});
