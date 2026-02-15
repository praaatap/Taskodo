
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    FadeInUp,
    FadeOutUp,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type ToastProps = {
    message: string;
    type: 'success' | 'error' | 'info';
    onHide: () => void;
};

const { width } = Dimensions.get('window');

export function Toast({ message, type, onHide }: ToastProps) {
    const translateY = useSharedValue(-100);

    useEffect(() => {
        translateY.value = withSequence(
            withSpring(0, { damping: 15, stiffness: 120 }),
            withDelay(2500, withSpring(-120, { damping: 15 }, (finished) => {
                if (finished) {
                    runOnJS(onHide)();
                }
            }))
        );
    }, [onHide]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const getIcon = () => {
        switch (type) {
            case 'success': return <Ionicons name="checkmark-circle" size={20} color="#059669" />;
            case 'error': return <Ionicons name="alert-circle" size={20} color="#DC2626" />;
            default: return <Ionicons name="information-circle" size={20} color="#2563EB" />;
        }
    };

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View style={[styles.capsule, animatedStyle]}>
                <View style={styles.iconContainer}>
                    {getIcon()}
                </View>
                <Text style={styles.message} numberOfLines={1}>
                    {message}
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Positioned near top safe area
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
        paddingHorizontal: 20,
    },
    capsule: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        maxWidth: width - 80,
    },
    iconContainer: {
        marginRight: 10,
    },
    message: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
});
