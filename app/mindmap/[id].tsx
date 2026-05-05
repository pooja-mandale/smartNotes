import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchNoteById } from '../../redux/slices/notesSlice';
import { MindMapNode, parseMindMapFromNote } from '../../utils/mindmap';

const NodeView = ({ node, theme }: { node: MindMapNode; theme: any }) => {
    return (
        <View style={styles.nodeContainer}>
            <Card style={[styles.nodeCard, { borderColor: theme.colors.primary }]} mode="outlined">
                <Card.Content style={styles.nodeContent}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{node.text}</Text>
                </Card.Content>
            </Card>

            {node.children.length > 0 && (
                <View style={styles.childrenContainer}>
                    <View style={[styles.connectorLine, { backgroundColor: theme.colors.outlineVariant }]} />
                    <View style={styles.childrenList}>
                        {node.children.map((child: MindMapNode) => (
                            <View key={child.id} style={styles.childWrapper}>
                                <View style={[styles.horizontalLine, { backgroundColor: theme.colors.outlineVariant }]} />
                                <NodeView node={child} theme={theme} />
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

export default function MindMapScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { currentNote } = useAppSelector((state) => state.notes);
    const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchNoteById(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (currentNote) {
            const data = parseMindMapFromNote(currentNote.content, currentNote.title);
            setMindMapData(data);
        }
    }, [currentNote]);

    if (!mindMapData) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Mind Map" />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.container} horizontal>
                <ScrollView contentContainerStyle={styles.verticalScroll}>
                    <View style={styles.treeRoot}>
                        <NodeView node={mindMapData} theme={theme} />
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        minWidth: '100%',
    },
    verticalScroll: {
        flexGrow: 1,
    },
    treeRoot: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nodeCard: {
        minWidth: 100,
        maxWidth: 200,
        marginRight: 20, // Space for connector
        backgroundColor: 'white',
        borderRadius: 8,
    },
    nodeContent: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    childrenContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    childrenList: {
        flexDirection: 'column',
    },
    childWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    connectorLine: {
        width: 20,
        height: 2,
    },
    horizontalLine: {
        width: 20,
        height: 2,
        marginRight: 0,
    },
});
