import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchAllNotebooks } from '../../redux/slices/notebooksSlice';
import { fetchAllNotes } from '../../redux/slices/notesSlice';

export default function NotebookScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { notes } = useAppSelector((state) => state.notes);
    const { notebooks } = useAppSelector((state) => state.notebooks);

    useEffect(() => {
        dispatch(fetchAllNotes());
        dispatch(fetchAllNotebooks());
    }, [dispatch]);

    const { notebook, notebookNotes } = React.useMemo(() => {
        const nb = notebooks.find(n => n.id === id);
        const nbs = notes.filter(n => n.notebookId === id);
        return { notebook: nb, notebookNotes: nbs };
    }, [id, notebooks, notes]);

    const renderNote = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-slate-100"
            onPress={() => router.push(`/note/${item.id}` as any)}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-bold text-slate-900 flex-1">{item.title}</Text>
                {item.isPinned && (
                    <Ionicons name="pin" size={16} color="#3B82F6" />
                )}
            </View>
            <Text className="text-slate-500 line-clamp-2" numberOfLines={2}>
                {item.content.replace(/[#*]/g, '')}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-slate-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-slate-900">{notebook?.name || 'Notebook'}</Text>
                    <Text className="text-slate-500 text-xs">{notebookNotes.length} notes</Text>
                </View>
            </View>

            <FlatList
                data={notebookNotes}
                renderItem={renderNote}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24 }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
                        <Text className="text-slate-400 mt-4">No notes in this notebook.</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-400"
                onPress={() => router.push('/note/new')}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
