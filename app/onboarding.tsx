
import React, { useRef, useState, useCallback } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

type SlideData = {
    id: string;
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle: string;
    accent: string;
    accentBg: string;
    decorIcons: (keyof typeof Feather.glyphMap)[];
};

const SLIDES: SlideData[] = [
    {
        id: '1',
        icon: 'target',
        title: 'Master Your\nDaily Flow',
        subtitle: 'Experience Taskodo, a premium workspace designed for clarity. Create tasks, build habits, and focus on what truly matters.',
        accent: '#6366F1',
        accentBg: '#EEF2FF',
        decorIcons: ['check-square', 'calendar', 'clock'],
    },
    {
        id: '2',
        icon: 'cpu',
        title: 'Your Personal\nAI Companion',
        subtitle: 'Taskodo learns your patterns to keep you at peak performance. Intelligent nudges and daily celebrations included.',
        accent: '#8B5CF6',
        accentBg: '#F5F3FF',
        decorIcons: ['zap', 'trending-up', 'star'],
    },
    {
        id: '3',
        icon: 'bar-chart-2',
        title: 'Data-Driven\nSuccess',
        subtitle: 'Beautiful insights and milestone rewards. Watch your growth through Taskodo\'s advanced productivity analytics.',
        accent: '#6366F1',
        accentBg: '#EEF2FF',
        decorIcons: ['award', 'activity', 'pie-chart'],
    },
];

function FloatingIcon({ icon, delay, x, y, size = 24 }: {
    icon: keyof typeof Feather.glyphMap;
    delay: number;
    x: number;
    y: number;
    size?: number;
}) {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 600 });
        translateY.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 1800 + delay, easing: Easing.inOut(Easing.ease) }),
                withTiming(8, { duration: 1800 + delay, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true,
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[{
                position: 'absolute',
                left: x,
                top: y,
                width: size + 24,
                height: size + 24,
                borderRadius: (size + 24) / 2,
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                alignItems: 'center',
                justifyContent: 'center',
            }, animStyle]}
        >
            <Feather name={icon} size={size} color="rgba(99, 102, 241, 0.35)" />
        </Animated.View>
    );
}

function HeroIcon({ icon, accent, accentBg }: { icon: keyof typeof Feather.glyphMap; accent: string; accentBg: string }) {
    const scale = useSharedValue(0.8);
    const rotate = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 100 });
        rotate.value = withRepeat(
            withSequence(
                withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true,
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotate.value}deg` },
        ],
    }));

    return (
        <Animated.View style={[styles.heroIconOuter, { backgroundColor: accentBg }, animStyle]}>
            <LinearGradient
                colors={[accent, '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroIconInner}
            >
                <Feather name={icon} size={44} color="#FFFFFF" />
            </LinearGradient>
        </Animated.View>
    );
}

function Slide({ item, index }: { item: SlideData; index: number }) {
    return (
        <View style={[styles.slide, { width }]}>
            {/* Floating decorative icons */}
            <FloatingIcon icon={item.decorIcons[0]} delay={0} x={width * 0.08} y={height * 0.06} size={20} />
            <FloatingIcon icon={item.decorIcons[1]} delay={300} x={width * 0.7} y={height * 0.03} size={18} />
            <FloatingIcon icon={item.decorIcons[2]} delay={600} x={width * 0.55} y={height * 0.32} size={16} />

            {/* Hero icon */}
            <HeroIcon icon={item.icon} accent={item.accent} accentBg={item.accentBg} />

            <Animated.Text
                entering={FadeInDown.delay(200).springify().damping(14)}
                style={styles.slideTitle}
            >
                {item.title}
            </Animated.Text>
            <Animated.Text
                entering={FadeInDown.delay(400).springify().damping(14)}
                style={styles.slideSubtitle}
            >
                {item.subtitle}
            </Animated.Text>
        </View>
    );
}

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index != null) {
                setActiveIndex(viewableItems[0].index);
            }
        }
    ).current;

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
        } else {
            router.replace('/(tabs)');
        }
    };

    const handleSkip = () => {
        router.replace('/(tabs)');
    };

    const isLast = activeIndex === SLIDES.length - 1;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Top bar */}
            <Animated.View
                entering={FadeIn.delay(300)}
                style={[styles.topBar, { paddingTop: insets.top + 8 }]}
            >
                <View style={styles.logoBadge}>
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoIcon}
                    >
                        <Feather name="check-square" size={14} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.logoText}>Taskodo</Text>
                </View>
                {!isLast && (
                    <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                        <Feather name="chevron-right" size={14} color="#9CA3AF" />
                    </Pressable>
                )}
            </Animated.View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <Slide item={item} index={index} />}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />

            {/* Bottom */}
            <Animated.View
                entering={FadeInUp.delay(500)}
                style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}
            >
                {/* Page indicator */}
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                activeIndex === i && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Step counter */}
                <Text style={styles.stepText}>
                    {activeIndex + 1} of {SLIDES.length}
                </Text>

                {/* CTA Button */}
                <Pressable onPress={handleNext}>
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.ctaButton}
                    >
                        <Text style={styles.ctaText}>
                            {isLast ? 'Get Started' : 'Continue'}
                        </Text>
                        <Feather
                            name={isLast ? 'arrow-right' : 'chevron-right'}
                            size={20}
                            color="#FFFFFF"
                        />
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    logoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        letterSpacing: -0.3,
    },
    skipBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    skipText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 36,
    },
    heroIconOuter: {
        width: 120,
        height: 120,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    heroIconInner: {
        width: 88,
        height: 88,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    slideTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
        lineHeight: 42,
    },
    slideSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '500',
        paddingHorizontal: 10,
    },
    bottom: {
        paddingHorizontal: 32,
        gap: 16,
        alignItems: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
    },
    dotActive: {
        backgroundColor: '#6366F1',
        width: 28,
    },
    stepText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 20,
        gap: 10,
        width: width - 64,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    ctaText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
});
