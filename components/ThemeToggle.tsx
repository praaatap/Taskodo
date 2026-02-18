import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    interpolate,
    useSharedValue,
    Extrapolate
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
    const { isDark, toggleTheme, theme } = useTheme();
    const rotation = useSharedValue(isDark ? 1 : 0);

    const handleToggle = () => {
        rotation.value = withSpring(isDark ? 0 : 1, { damping: 12, stiffness: 200 });
        toggleTheme();
    };

    const animStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(
            rotation.value,
            [0, 1],
            [0, 180],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ rotate: `${rotateValue}deg` }],
        };
    });

    return (
        <Pressable onPress={handleToggle} hitSlop={12}>
            <Animated.View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }, animStyle]}>
                <Feather
                    name={isDark ? "moon" : "sun"}
                    size={20}
                    color={isDark ? "#FACC15" : "#F59E0B"}
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
});
