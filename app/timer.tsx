import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const POMODORO_TIME = 25 * 60; // 25 minutes

export default function TimerScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    // Background timer handling could be complex within Expo Go without custom native modules, 
    // so we keep it simple foreground for now.
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Could trigger a sound here
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? POMODORO_TIME : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'left', 'right']}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Study Timer" />
            </Appbar.Header>

            <View style={styles.container}>
                <Surface style={[styles.timerCircle, { backgroundColor: theme.colors.surfaceVariant, elevation: 4 }]}>
                    <Text variant="displayLarge" style={{ fontWeight: 'bold', color: theme.colors.primary, fontVariant: ['tabular-nums'] }}>
                        {formatTime(timeLeft)}
                    </Text>
                    <Text variant="titleMedium" style={{ color: theme.colors.outline, marginTop: 10 }}>
                        {mode === 'focus' ? 'Focus Time' : 'Break Time'}
                    </Text>
                </Surface>

                <View style={styles.controls}>
                    <Button
                        mode="contained"
                        onPress={toggleTimer}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        icon={isActive ? "pause" : "play"}
                    >
                        {isActive ? "Pause" : "Start"}
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={resetTimer}
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        icon="refresh"
                    >
                        Reset
                    </Button>
                </View>

                <View style={styles.toggles}>
                    <Button
                        mode={mode === 'focus' ? 'contained-tonal' : 'text'}
                        onPress={() => { setMode('focus'); setTimeLeft(POMODORO_TIME); setIsActive(false); }}
                    >
                        Focus
                    </Button>
                    <Button
                        mode={mode === 'break' ? 'contained-tonal' : 'text'}
                        onPress={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                    >
                        Break
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    timerCircle: {
        width: 250,
        height: 250,
        borderRadius: 125,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
    },
    controls: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    button: {
        borderRadius: 8,
    },
    buttonContent: {
        height: 48,
        paddingHorizontal: 24,
    },
    toggles: {
        flexDirection: 'row',
        gap: 16,
    },
});
