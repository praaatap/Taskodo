import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay,
    FadeOut
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
    const scale = useSharedValue(0.3);
    const opacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: withTiming(textOpacity.value === 1 ? 0 : 20) }]
    }));

    useEffect(() => {
        // 1. Initial appearance
        opacity.value = withTiming(1, { duration: 500 });
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });

        // 2. Text reveal
        textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

        // 3. Exit sequence
        const timeout = setTimeout(() => {
            SplashScreen.hideAsync().catch(() => { }); // Hide native splash if still visible

            // Scale up and fade out to reveal app
            scale.value = withTiming(50, { duration: 800 });
            opacity.value = withTiming(0, { duration: 600 });

            setTimeout(() => {
                onFinish(); // Unmount component
            }, 600);
        }, 2200); // Hold splash for ~2s

        return () => clearTimeout(timeout);
    }, []);

    // Splash Screen Colors (Forced light to match logo and native splash)
    const bg = '#FFFFFF';
    const text = '#0F172A';
    const subText = '#64748B';
    const iconContainerBg = '#FFFFFF';
    const shadowColor = '#6366F1';

    return (
        <Animated.View style={[styles.container, { backgroundColor: bg }]} exiting={FadeOut.duration(500)}>
            <StatusBar style="dark" />
            <View style={styles.center}>
                <Animated.View
                    style={[
                        styles.iconContainer,
                        iconStyle,
                        { backgroundColor: iconContainerBg, shadowColor }
                    ]}
                >
                    <Image
                        source={require('../assets/images/icon.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={[styles.textContainer, textStyle]}>
                    <Text style={[styles.title, { color: text }]}>Taskodo</Text>
                    <Text style={[styles.subtitle, { color: subText }]}>Master Your Flow</Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        alignItems: 'center',
        gap: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 40,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden', // Add overflow hidden to clip image if needed
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
