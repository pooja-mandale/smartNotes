import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarContextType {
    showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

interface SnackbarProviderProps {
    children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<SnackbarType>('info');
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const showSnackbar = useCallback((msg: string, t: SnackbarType = 'info') => {
        setMessage(msg);
        setType(t);
        setVisible(true);
    }, []);

    const onDismiss = () => setVisible(false);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return theme.colors.primary; // Or a specific success color like #10B981
            case 'error':
                return theme.colors.error;
            default:
                return theme.colors.onSurface;
        }
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <View
                style={[styles.snackbarContainer, { bottom: insets.bottom }]}
                pointerEvents="box-none"
            >
                <Snackbar
                    visible={visible}
                    onDismiss={onDismiss}
                    duration={3000}
                    style={{ backgroundColor: getBackgroundColor(), borderRadius: 8 }}
                    action={{
                        label: 'Dismiss',
                        onPress: onDismiss,
                        textColor: 'white',
                    }}
                >
                    <Text style={{ color: 'white' }}>{message}</Text>
                </Snackbar>
            </View>
        </SnackbarContext.Provider>
    );
};

const styles = StyleSheet.create({
    snackbarContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
});
