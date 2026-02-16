
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TooltipProps } from 'react-native-copilot';

export const TourTooltip = ({
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrev,
    handleStop,
    currentStep,
}: TooltipProps) => {
    return (
        <View style={styles.tooltip}>
            <View style={styles.header}>
                <Text style={styles.title}>{currentStep.name}</Text>
                <Pressable onPress={handleStop} style={styles.closeBtn}>
                    <Feather name="x" size={16} color="#9CA3AF" />
                </Pressable>
            </View>
            <Text style={styles.text}>{currentStep.text}</Text>

            <View style={styles.footer}>
                <View style={styles.progress}>
                    <Text style={styles.stepCount}>
                        Step {currentStep.order}
                    </Text>
                </View>

                <View style={styles.actions}>
                    {!isFirstStep && (
                        <Pressable onPress={handlePrev} style={styles.backBtn}>
                            <Text style={styles.backText}>Back</Text>
                        </Pressable>
                    )}
                    <Pressable onPress={handleNext} style={styles.nextBtn}>
                        <Text style={styles.nextText}>{isLastStep ? 'Finish' : 'Next'}</Text>
                        {!isLastStep && <Feather name="arrow-right" size={14} color="#FFF" />}
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tooltip: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        width: 280,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    closeBtn: {
        padding: 4,
    },
    text: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
        fontWeight: '500',
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progress: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stepCount: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backBtn: {
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    backText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    nextBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nextText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
});
