import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { Appbar, Button, Dialog, Divider, IconButton, Menu, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSnackbar } from '../../components/GlobalSnackbar';
import { getFlashcardsByNote } from '../../database/queries/flashcards';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clearCurrentNote, createNoteAction, deleteNoteAction, fetchNoteById, updateNoteAction } from '../../redux/slices/notesSlice';
import { exportNoteToPDF } from '../../services/export';

export default function NoteEditorScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const isNew = id === 'new';
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { showSnackbar } = useSnackbar();
    const { currentNote, loading } = useAppSelector((state) => state.notes);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [notebookId, setNotebookId] = useState('default-notebook-001');
    const [menuVisible, setMenuVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            dispatch(fetchNoteById(id));
        } else {
            dispatch(clearCurrentNote());
            setTitle('');
            setContent('');
        }
    }, [id, isNew, dispatch]);

    useEffect(() => {
        if (currentNote && !isNew) {
            setTitle(currentNote.title);
            setContent(currentNote.content);
            setNotebookId(currentNote.notebookId);
        }
    }, [currentNote, isNew]);

    const handleSave = async () => {
        if (!title.trim()) {
            showSnackbar('Please enter a title', 'error');
            return;
        }
        setIsSaving(true);
        Keyboard.dismiss();

        try {
            const noteData = {
                title: title.trim(),
                content: content.trim(),
                notebookId,
                tags: '[]',
                isPinned: currentNote?.isPinned || false
            };

            if (isNew) {
                await dispatch(createNoteAction(noteData)).unwrap();
            } else {
                await dispatch(updateNoteAction({
                    id: id!,
                    data: noteData
                })).unwrap();
            }
            showSnackbar('Note saved successfully', 'success');
            router.back();
        } catch (err) {
            console.error('Failed to save', err);
            showSnackbar('Failed to save note', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await dispatch(deleteNoteAction(id));
            setDeleteDialogVisible(false);
            showSnackbar('Note deleted', 'info');
            router.back();
        } catch (err) {
            console.error(err);
            showSnackbar('Failed to delete note', 'error');
        }
    };

    const handleExport = async () => {
        if (isNew || !currentNote) return;
        setMenuVisible(false);
        try {
            const cards = await getFlashcardsByNote(id!);
            await exportNoteToPDF(currentNote, cards);
            showSnackbar('PDF exported successfully', 'success');
        } catch (err) {
            console.error(err);
            showSnackbar('Failed to export PDF', 'error');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
            <Appbar.Header mode="center-aligned" statusBarHeight={0}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={isNew ? "New Note" : "Edit Note"} />
                <Appbar.Action icon="content-save" onPress={handleSave} disabled={isSaving} />
                {!isNew && (
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
                    >
                        <Menu.Item onPress={handleExport} title="Export to PDF" leadingIcon="file-export" />
                        <Menu.Item onPress={() => { setMenuVisible(false); router.push(`/mindmap/${id}` as any); }} title="View Mind Map" leadingIcon="sitemap" />
                        <Divider />
                        <Menu.Item onPress={() => { setMenuVisible(false); setDeleteDialogVisible(true); }} title="Delete" leadingIcon="delete" titleStyle={{ color: theme.colors.error }} />
                    </Menu>
                )}
            </Appbar.Header>

            <View style={{ flex: 1, padding: 16 }}>
                <TextInput
                    mode="flat"
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                    style={{ backgroundColor: 'transparent', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}
                    contentStyle={{ fontSize: 24, fontWeight: 'bold' }}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                />

                <Surface style={{ padding: 8, borderRadius: 8, backgroundColor: theme.colors.secondaryContainer, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }} elevation={0}>
                    <IconButton icon="notebook" size={20} />
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSecondaryContainer }}>General Notebook</Text>
                </Surface>

                <TextInput
                    mode="flat"
                    placeholder="Start typing your note here... Use Q: / A: for flashcards."
                    value={content}
                    onChangeText={setContent}
                    multiline
                    style={{ flex: 1, backgroundColor: 'transparent', textAlignVertical: 'top' }}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                />
            </View>

            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Delete Note</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Are you sure you want to delete this note?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleDelete} textColor={theme.colors.error}>Delete</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}
