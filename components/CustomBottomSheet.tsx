
import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { Dimensions, StyleSheet, View, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    children?: React.ReactNode;
    visible?: boolean;
    onClose?: () => void;
    snapPoints?: number[];
}

export interface BottomSheetRef {
    scrollTo: (destination: number) => void;
    isActive: () => boolean;
}

const CustomBottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
    ({ children, visible = false, onClose, snapPoints = [700] }, ref) => {
        const translateY = useSharedValue(SCREEN_HEIGHT);

        const scrollTo = useCallback((destination: number) => {
            'worklet';
            translateY.value = withSpring(destination, { damping: 15, stiffness: 100 });
        }, []);

        const isActive = useCallback(() => {
            return translateY.value < SCREEN_HEIGHT;
        }, []);

        useImperativeHandle(ref, () => ({ scrollTo, isActive }), [scrollTo, isActive]);

        const context = useSharedValue({ y: 0 });
        const gesture = Gesture.Pan()
            .onStart(() => {
                context.value = { y: translateY.value };
            })
            .onUpdate((event) => {
                translateY.value = event.translationY + context.value.y;
                translateY.value = Math.max(translateY.value, SCREEN_HEIGHT - Math.max(...snapPoints));
            })
            .onEnd(() => {
                const currentY = translateY.value;
                const points = [SCREEN_HEIGHT, ...snapPoints.map(p => SCREEN_HEIGHT - Math.abs(p))];

                let closest = SCREEN_HEIGHT;
                let minDiff = Math.abs(currentY - SCREEN_HEIGHT);

                points.forEach(p => {
                    const diff = Math.abs(currentY - p);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = p;
                    }
                });

                if (closest === SCREEN_HEIGHT) {
                    if (onClose) runOnJS(onClose)();
                }
                scrollTo(closest);
            });

        const rBottomSheetStyle = useAnimatedStyle(() => {
            const borderRadius = interpolate(
                translateY.value,
                [SCREEN_HEIGHT - Math.max(...snapPoints), SCREEN_HEIGHT],
                [32, 5],
                Extrapolation.CLAMP
            );

            return {
                borderRadius,
                transform: [{ translateY: translateY.value }],
            };
        });

        // Initialize position based on visibility
        React.useEffect(() => {
            if (visible) {
                scrollTo(SCREEN_HEIGHT - Math.max(...snapPoints));
            } else {
                scrollTo(SCREEN_HEIGHT);
            }
        }, [visible, snapPoints]);

        return (
            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={onClose}
            >
                <View style={styles.modalRoot}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => {
                            scrollTo(SCREEN_HEIGHT);
                            if (onClose) onClose();
                        }}
                    >
                        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                    </Pressable>

                    <GestureDetector gesture={gesture}>
                        <Animated.View
                            style={[styles.bottomSheetContainer, rBottomSheetStyle]}
                        >
                            <View style={styles.handleContainer}>
                                <View style={styles.line} />
                            </View>
                            {children}
                        </Animated.View>
                    </GestureDetector>
                </View>
            </Modal>
        );
    }
);

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
        justifyContent: 'flex-end', // Add this
    },
    handleContainer: {
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    line: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
    },
});

export default CustomBottomSheet;
