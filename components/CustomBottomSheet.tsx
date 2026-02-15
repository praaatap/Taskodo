
import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { Dimensions, StyleSheet, View, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    children?: React.ReactNode;
    snapPoints?: number[];
    onClose?: () => void;
}

export interface BottomSheetRef {
    scrollTo: (destination: number) => void;
    isActive: () => boolean;
}

const CustomBottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
    ({ children, snapPoints = [-300], onClose }, ref) => {
        const translateY = useSharedValue(0);
        const active = useSharedValue(false);

        const scrollTo = useCallback((destination: number) => {
            'worklet';
            active.value = destination !== 0;
            translateY.value = withSpring(destination, { damping: 15, stiffness: 100 });
        }, []);

        const isActive = useCallback(() => {
            return active.value;
        }, []);

        useImperativeHandle(ref, () => ({ scrollTo, isActive }), [scrollTo, isActive]);

        const context = useSharedValue({ y: 0 });
        const gesture = Gesture.Pan()
            .onStart(() => {
                context.value = { y: translateY.value };
            })
            .onUpdate((event) => {
                translateY.value = event.translationY + context.value.y;
                translateY.value = Math.max(translateY.value, snapPoints[snapPoints.length - 1] - 50);
            })
            .onEnd(() => {
                // Find closest snap point
                const currentY = translateY.value;
                let closest = 0;
                let minDiff = Math.abs(currentY - 0);

                [0, ...snapPoints].forEach(p => {
                    const diff = Math.abs(currentY - p);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = p;
                    }
                });

                if (closest === 0) {
                    if (onClose) runOnJS(onClose)();
                }
                scrollTo(closest);
            });

        const rBottomSheetStyle = useAnimatedStyle(() => {
            const borderRadius = interpolate(
                translateY.value,
                [snapPoints[snapPoints.length - 1], 0],
                [28, 5],
                Extrapolation.CLAMP
            );

            return {
                borderRadius,
                transform: [{ translateY: translateY.value }],
            };
        });

        const rBackdropStyle = useAnimatedStyle(() => {
            return {
                opacity: withTiming(active.value ? 1 : 0),
            };
        }, []);

        const rBackdropProps = useAnimatedStyle(() => {
            return {
                display: translateY.value === 0 ? 'none' : 'flex',
            };
        });

        return (
            <>
                <Animated.View
                    style={[
                        styles.backdrop,
                        rBackdropStyle,
                        rBackdropProps,
                    ]}
                >
                    <BlurView intensity={20} style={StyleSheet.absoluteFill}>
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={() => {
                                scrollTo(0);
                                if (onClose) onClose();
                            }}
                        />
                    </BlurView>
                </Animated.View>
                <GestureDetector gesture={gesture}>
                    <Animated.View
                        style={[styles.bottomSheetContainer, rBottomSheetStyle]}
                    >
                        <View style={styles.line} />
                        {children}
                    </Animated.View>
                </GestureDetector>
            </>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        top: SCREEN_HEIGHT,
        zIndex: 1000,
    },
    line: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        alignSelf: 'center',
        marginVertical: 12,
        borderRadius: 2,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
    },
});

export default CustomBottomSheet;
