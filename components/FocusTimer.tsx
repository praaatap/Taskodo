import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

type FocusTimerProps = {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
};

const WORK_SECONDS = 25 * 60; // 25 min
const BREAK_SECONDS = 5 * 60;  // 5 min

export function FocusTimer({ visible, onClose, onComplete }: FocusTimerProps) {
    const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    const totalSeconds = isBreak ? BREAK_SECONDS : WORK_SECONDS;
    const progress = 1 - secondsLeft / totalSeconds;

    useEffect(() => {
        if (!visible) {
            setSecondsLeft(WORK_SECONDS);
            setIsRunning(false);
            setIsBreak(false);
        }
    }, [visible]);

    useEffect(() => {
        if (!isRunning || !visible) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsRunning(false);
                    if (!isBreak) {
                        onComplete();
                        setIsBreak(true);
                        return BREAK_SECONDS;
                    } else {
                        setIsBreak(false);
                        return WORK_SECONDS;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, visible, isBreak, onComplete]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const handleToggle = () => setIsRunning(!isRunning);
    const handleReset = () => {
        setIsRunning(false);
        setIsBreak(false);
        setSecondsLeft(WORK_SECONDS);
    };

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.card}>
                    {/* Close */}
                    <Pressable style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </Pressable>

                    {/* Phase Label */}
                    <View style={[styles.phaseTag, isBreak && styles.phaseTagBreak]}>
                        <Ionicons
                            name={isBreak ? 'cafe-outline' : 'flame-outline'}
                            size={16}
                            color={isBreak ? '#059669' : '#DC2626'}
                        />
                        <Text style={[styles.phaseText, isBreak && styles.phaseTextBreak]}>
                            {isBreak ? 'Break Time' : 'Focus Mode'}
                        </Text>
                    </View>

                    {/* Timer Display */}
                    <View style={styles.timerCircle}>
                        <Text style={styles.timeText}>{timeStr}</Text>
                        <Text style={styles.timerSub}>
                            {isBreak ? 'Relax and recharge' : 'Stay in the zone'}
                        </Text>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }, isBreak && styles.progressBreak]} />
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsRow}>
                        <Pressable style={styles.secondaryBtn} onPress={handleReset}>
                            <Ionicons name="refresh" size={22} color="#6B7280" />
                        </Pressable>

                        <Pressable style={[styles.primaryBtn, isRunning && styles.pauseBtn]} onPress={handleToggle}>
                            <Ionicons
                                name={isRunning ? 'pause' : 'play'}
                                size={28}
                                color="#FFF"
                            />
                        </Pressable>

                        <Pressable style={styles.secondaryBtn} onPress={onClose}>
                            <Ionicons name="stop" size={22} color="#6B7280" />
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 20,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    },
    phaseTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 32,
    },
    phaseTagBreak: {
        backgroundColor: '#ECFDF5',
    },
    phaseText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#DC2626',
    },
    phaseTextBreak: {
        color: '#059669',
    },
    timerCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 6,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    timeText: {
        fontSize: 48,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: 2,
    },
    timerSub: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    progressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        marginBottom: 32,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2563EB',
        borderRadius: 3,
    },
    progressBreak: {
        backgroundColor: '#059669',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    secondaryBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    pauseBtn: {
        backgroundColor: '#DC2626',
        shadowColor: '#DC2626',
    },
});
