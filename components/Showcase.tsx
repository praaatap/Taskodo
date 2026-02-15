import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    Dimensions,
    Pressable,
    LayoutRectangle,
} from 'react-native';

import Animated, {
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ShowcaseStep = {
    id: string;
    title: string;
    description: string;
    layout?: LayoutRectangle;
    route?: string;
};

type ShowcaseContextType = {
    registerStep: (id: string, title: string, description: string, layout: LayoutRectangle, route?: string) => void;
    startTour: () => void;
    nextStep: () => void;
    stopTour: () => void;
    currentStepIndex: number;
    isActive: boolean;
};

const ShowcaseContext = createContext<ShowcaseContextType | null>(null);

export function ShowcaseProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [steps, setSteps] = useState<ShowcaseStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isActive, setIsActive] = useState(false);

    // Sort order for specific tour flow: Tasks -> Calendar -> Stats
    const SCREEN_ORDER = ['/(tabs)', '/(tabs)/two', '/(tabs)/stats'];

    // Helper to sort steps based on desired flow
    const sortSteps = (stepsToSort: ShowcaseStep[]) => {
        return stepsToSort.sort((a, b) => {
            // Prioritize by screen order
            const routeA = a.route || '/(tabs)';
            const routeB = b.route || '/(tabs)';
            const indexA = SCREEN_ORDER.indexOf(routeA);
            const indexB = SCREEN_ORDER.indexOf(routeB);

            if (indexA !== indexB) return indexA - indexB;
            return 0;
        });
    };

    const registerStep = useCallback((id: string, title: string, description: string, layout: LayoutRectangle, route: string = '/(tabs)') => {
        setSteps(prev => {
            const exists = prev.find(s => s.id === id);
            if (exists) {
                // Update existing
                const updated = prev.map(s => s.id === id ? { ...s, layout, route } : s);
                return sortSteps(updated);
            }
            const newSteps = [...prev, { id, title, description, layout, route }];
            return sortSteps(newSteps);
        });
    }, []);

    const startTour = useCallback(() => {
        if (steps.length > 0) {
            // Ensure we start on the first screen
            const firstStep = steps[0];
            if (firstStep.route && firstStep.route !== '/(tabs)') { // Assuming current is /(tabs) or check actual path
                // For now, just reset index and active
            }
            setCurrentStepIndex(0);
            setIsActive(true);
        }
    }, [steps]);

    const nextStep = useCallback(() => {
        setCurrentStepIndex(prev => {
            const next = prev + 1;
            if (next >= steps.length) {
                setIsActive(false);
                return -1;
            }

            // Check if we need to navigate
            const nextStepObj = steps[next];
            if (nextStepObj.route) {
                // We can't easily know "current" route here without hook, but we can just push.
                // Verify if it's different from previous step's route to avoid redundant pushes?
                // Or just push to ensure.
                router.push(nextStepObj.route as any);
            }

            return next;
        });
    }, [steps, router]);

    const stopTour = useCallback(() => {
        setIsActive(false);
        setCurrentStepIndex(-1);
    }, []);

    return (
        <ShowcaseContext.Provider value={{ registerStep, startTour, nextStep, stopTour, currentStepIndex, isActive }}>
            {children}
            {isActive && currentStepIndex >= 0 && (
                <ShowcaseOverlay step={steps[currentStepIndex]} />
            )}
        </ShowcaseContext.Provider>
    );
}

export function useShowcase() {
    const context = useContext(ShowcaseContext);
    if (!context) throw new Error('useShowcase must be used within ShowcaseProvider');
    return context;
}

export function ShowcaseStep({ id, title, description, children }: { id: string, title: string, description: string, children: React.ReactElement }) {
    const { registerStep, isActive } = useShowcase();
    const pathname = usePathname();
    const viewRef = useRef<View>(null);

    const onLayout = () => {
        viewRef.current?.measureInWindow((x, y, width, height) => {
            registerStep(id, title, description, { x, y: y - 10, width, height: height + 20 }, pathname);
        });
    };

    return (
        <View ref={viewRef} onLayout={onLayout} collapsable={false}>
            {children}
        </View>
    );
}

function ShowcaseOverlay({ step }: { step: ShowcaseStep }) {
    const { nextStep, stopTour } = useShowcase();
    const layout = step.layout || { x: 0, y: 0, width: 0, height: 0 };

    const tooltipX = layout.x + layout.width / 2;
    const isTooltipBottom = layout.y < SCREEN_HEIGHT / 2;
    const tooltipY = isTooltipBottom ? layout.y + layout.height + 15 : layout.y - 135;

    // Arrow positioning
    const arrowStyle = isTooltipBottom ? {
        top: -10,
        borderBottomColor: '#FFF',
        borderBottomWidth: 10,
    } : {
        bottom: -10,
        borderTopColor: '#FFF',
        borderTopWidth: 10,
    };

    return (
        <Modal transparent visible animationType="fade">
            <View style={styles.overlay}>
                {/* Spotlight effect using 4 views */}
                <View style={[styles.backdrop, { top: 0, left: 0, right: 0, height: layout.y }]} />
                <View style={[styles.backdrop, { top: layout.y + layout.height, left: 0, right: 0, bottom: 0 }]} />
                <View style={[styles.backdrop, { top: layout.y, left: 0, width: layout.x, height: layout.height }]} />
                <View style={[styles.backdrop, { top: layout.y, left: layout.x + layout.width, right: 0, height: layout.height }]} />

                {/* Highlight border */}
                <Animated.View
                    entering={FadeIn}
                    style={[
                        styles.highlight,
                        {
                            top: layout.y,
                            left: layout.x,
                            width: layout.width,
                            height: layout.height
                        }
                    ]}
                />

                {/* Tooltip */}
                <Animated.View
                    entering={FadeInDown}
                    style={[
                        styles.tooltip,
                        {
                            top: tooltipY,
                            left: Math.max(20, Math.min(SCREEN_WIDTH - 280, tooltipX - 130)),
                        }
                    ]}
                >
                    {/* Tooltip Arrow */}
                    <View style={[
                        styles.arrow,
                        arrowStyle,
                        { left: Math.max(20, Math.min(220, tooltipX - Math.max(20, Math.min(SCREEN_WIDTH - 280, tooltipX - 130)) - 8)) }
                    ]} />

                    <Text style={styles.tooltipTitle}>{step.title}</Text>
                    <Text style={styles.tooltipDesc}>{step.description}</Text>
                    <View style={styles.tooltipFooter}>
                        <Pressable onPress={stopTour} style={styles.skipBtn}>
                            <Text style={styles.skipText}>Skip</Text>
                        </Pressable>
                        <Pressable onPress={nextStep} style={styles.nextBtn}>
                            <Text style={styles.nextText}>Next</Text>
                            <Feather name="chevron-right" size={16} color="#FFF" />
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
    },
    backdrop: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    highlight: {
        position: 'absolute',
        borderWidth: 3,
        borderColor: '#FFF',
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    tooltip: {
        position: 'absolute',
        width: 260,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 20,
    },
    arrow: {
        position: 'absolute',
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    tooltipTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 6,
    },
    tooltipDesc: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 16,
    },
    tooltipFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipBtn: {
        padding: 8,
    },
    skipText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '600',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    nextText: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '800',
    },
});
