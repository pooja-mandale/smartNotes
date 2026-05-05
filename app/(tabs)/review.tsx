import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { nextCard, reviewFlashcardAction, startReviewSession } from '../../redux/slices/flashcardsSlice';

export default function ReviewScreen() {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { dueFlashcards, currentFlashcard, sessionStats } = useAppSelector((state) => state.flashcards);

    // State
    const [showAnswer, setShowAnswer] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(1));
    const [helpVisible, setHelpVisible] = useState(false);

    useEffect(() => {
        dispatch(startReviewSession());
    }, [dispatch]);

    const handleReview = async (quality: number) => {
        if (!currentFlashcard) return;

        // Animate out
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(async () => {
            await dispatch(reviewFlashcardAction({ id: currentFlashcard.id, quality: quality as any }));
            dispatch(nextCard());
            setShowAnswer(false);

            // Animate in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });
    };

    if (dueFlashcards.length === 0 && !currentFlashcard) {
        return (
            <SafeAreaView style={[styles.centeredContainer, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.successIconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Ionicons name="checkmark-done" size={48} color={theme.colors.primary} />
                </View>
                <Text variant="headlineSmall" style={[styles.successTitle, { color: theme.colors.onSurface }]}>All Clear!</Text>
                <Text variant="bodyMedium" style={[styles.successText, { color: theme.colors.outline }]}>
                    You've reviewed all your due cards for today. Check back later!
                </Text>

                {/* Session Summary - Enhanced */}
                {sessionStats && sessionStats.reviewedCards > 0 && (
                    <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 8, color: theme.colors.onSurface }}>Session Summary</Text>
                        <Text style={{ color: theme.colors.onSurface }}>Cards Reviewed: {sessionStats.reviewedCards}</Text>
                        <Text style={{ color: theme.colors.onSurface }}>Correct Answers: {sessionStats.hardCount + sessionStats.goodCount + sessionStats.easyCount}</Text>
                    </Surface>
                )}
            </SafeAreaView>
        );
    }

    if (!currentFlashcard) return null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>Review Session</Text>
                <IconButton icon="help-circle-outline" onPress={() => setHelpVisible(true)} iconColor={theme.colors.onSurface} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                backgroundColor: theme.colors.primary,
                                width: `${(sessionStats?.reviewedCards || 0) / (dueFlashcards.length + (sessionStats?.reviewedCards || 0)) * 100}%`
                            }
                        ]}
                    />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.outline }]}>
                    {sessionStats?.reviewedCards} / {dueFlashcards.length + (sessionStats?.reviewedCards || 0)}
                </Text>
            </View>

            {/* Card Content */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated" elevation={2}>
                    <Text style={[styles.cardLabel, { color: theme.colors.outline }]}>
                        {showAnswer ? 'Answer' : 'Question'}
                    </Text>

                    <Text variant="headlineSmall" style={[styles.cardText, { color: theme.colors.onSurface }]}>
                        {showAnswer ? currentFlashcard.answer : currentFlashcard.question}
                    </Text>
                </Surface>
            </Animated.View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                {!showAnswer ? (
                    <Button
                        mode="contained"
                        onPress={() => setShowAnswer(true)}
                        style={styles.showAnswerButton}
                        contentStyle={{ height: 56 }}
                        labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                    >
                        Show Answer
                    </Button>
                ) : (
                    <View style={styles.ratingContainer}>
                        <RatingButton label="Again" color="#EF4444" sub="< 1m" onPress={() => handleReview(0)} />
                        <RatingButton label="Hard" color="#F97316" sub="2d" onPress={() => handleReview(1)} />
                        <RatingButton label="Good" color="#10B981" sub="4d" onPress={() => handleReview(2)} />
                        <RatingButton label="Easy" color="#3B82F6" sub="7d" onPress={() => handleReview(3)} />
                    </View>
                )}
            </View>

            <Portal>
                <Dialog visible={helpVisible} onDismiss={() => setHelpVisible(false)} style={{ backgroundColor: 'white' }}>
                    <Dialog.Icon icon="school-outline" />
                    <Dialog.Title style={{ textAlign: 'center' }}>How Reviewing Works</Dialog.Title>
                    <Dialog.ScrollArea>
                        <ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
                            <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                                This app uses <Text style={{ fontWeight: 'bold' }}>Spaced Repetition</Text> to help you remember efficiently.
                            </Text>

                            <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#EF4444' }}>Again</Text>
                            <Text variant="bodySmall" style={{ marginBottom: 8, color: '#64748B' }}>Complete blackout. Resets progress.</Text>

                            <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#F97316' }}>Hard</Text>
                            <Text variant="bodySmall" style={{ marginBottom: 8, color: '#64748B' }}>Correct, but required significant mental effort.</Text>

                            <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#10B981' }}>Good</Text>
                            <Text variant="bodySmall" style={{ marginBottom: 8, color: '#64748B' }}>Correct response with a little hesitation.</Text>

                            <Text variant="titleSmall" style={{ fontWeight: 'bold', color: '#3B82F6' }}>Easy</Text>
                            <Text variant="bodySmall" style={{ marginBottom: 8, color: '#64748B' }}>Perfect recall. No hesitation.</Text>
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={() => setHelpVisible(false)}>Got it</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

function RatingButton({ label, color, sub, onPress }: any) {
    return (
        <TouchableOpacity
            style={[styles.ratingButton, { backgroundColor: color }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={styles.ratingButtonText}>{label}</Text>
            {sub && <Text style={styles.ratingButtonSubText}>{sub}</Text>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    centeredContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    successIconContainer: {
        backgroundColor: '#D1FAE5',
        padding: 24,
        borderRadius: 50,
        marginBottom: 24,
    },
    successTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    successText: {
        textAlign: 'center',
        color: '#64748B',
        marginBottom: 24,
    },
    summaryCard: {
        padding: 16,
        borderRadius: 16,
        width: '100%',
        backgroundColor: 'white',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        marginLeft: 16,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 32,
        justifyContent: 'center',
        backgroundColor: 'white',
        alignItems: 'center', // Center text horizontally
    },
    cardLabel: {
        position: 'absolute',
        top: 32,
        alignSelf: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: '#94A3B8',
    },
    cardText: {
        textAlign: 'center',
        fontWeight: 'bold',
        lineHeight: 32,
    },
    controlsContainer: {
        marginTop: 32,
    },
    showAnswerButton: {
        borderRadius: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    ratingButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    ratingButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    ratingButtonSubText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 10,
        marginTop: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
});
