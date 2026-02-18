import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Pressable,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCopilot } from 'react-native-copilot';

const { width } = Dimensions.get('window');

const FEATURES = [
    {
        icon: 'check-square',
        title: 'Smart Task Management',
        desc: 'Organize your day with categories and priorities. Swipe to complete or delete tasks in an instant.',
        color: '#6366F1',
    },
    {
        icon: 'calendar',
        title: 'Modern Timeline',
        desc: 'Visual calendar with priority-colored indicators. Track your upcoming workload at a glance.',
        color: '#8B5CF6',
    },
    {
        icon: 'pie-chart',
        title: 'Deep Analytics',
        desc: 'Data-driven insights into your productivity. Watch your growth with beautiful charts.',
        color: '#EC4899',
    },
    {
        icon: 'zap',
        title: 'Focus Mode',
        desc: 'Enter deep work sessions with our integrated focus timer and mascot companion.',
        color: '#F59E0B',
    },
];


export default function ShowcaseScreen() {
    const { start } = useCopilot();

    const handleStartTour = () => {
        router.push('/(tabs)');
        setTimeout(() => {
            start();
        }, 500);
    };


    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(800)} style={styles.heroSection}>
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroContent}>
                            <Text style={styles.heroTag}>Enterprise Ready</Text>
                            <Text style={styles.heroTitle}>Experience the Future of Focus</Text>
                            <Text style={styles.heroSubtitle}>
                                Taskodo is designed to be the most beautiful and functional productivity suite you've ever used.
                            </Text>

                            <Pressable
                                onPress={handleStartTour}
                                style={styles.tourBtn}
                            >
                                <Text style={styles.tourBtnText}>Restart Tour</Text>
                                <Feather name="refresh-cw" size={16} color="#6366F1" />
                            </Pressable>
                        </View>
                    </LinearGradient>
                </Animated.View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Core Capabilities</Text>
                    <View style={styles.featureGrid}>
                        {FEATURES.map((feature, index) => (
                            <Animated.View
                                key={feature.title}
                                entering={FadeInUp.delay(200 + index * 100)}
                                style={styles.featureCard}
                            >
                                <View style={[styles.iconBox, { backgroundColor: feature.color + '15' }]}>
                                    <Feather name={feature.icon as any} size={24} color={feature.color} />
                                </View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                <Animated.View entering={FadeInUp.delay(600)} style={styles.indexSection}>
                    <View style={styles.indexCard}>
                        <View style={styles.indexHeader}>
                            <Feather name="list" size={20} color="#111827" />
                            <Text style={styles.indexTitle}>Project Index</Text>
                        </View>
                        <View style={styles.indexList}>
                            <View style={styles.indexItem}>
                                <Text style={styles.indexItemLabel}>Version</Text>
                                <Text style={styles.indexItemValue}>1.0.0 Stable</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.indexItem}>
                                <Text style={styles.indexItemLabel}>Tech Stack</Text>
                                <Text style={styles.indexItemValue}>React Native + Expo</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.indexItem}>
                                <Text style={styles.indexItemLabel}>Architecture</Text>
                                <Text style={styles.indexItemValue}>File-based Routing</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#FAFBFF',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    heroCard: {
        borderRadius: 32,
        padding: 32,
        overflow: 'hidden',
    },
    heroContent: {
        zIndex: 2,
    },
    heroTag: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        lineHeight: 40,
        marginBottom: 16,
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 24,
        fontWeight: '500',
    },
    tourBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginTop: 24,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    tourBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#6366F1',
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    featureGrid: {
        gap: 16,
    },
    featureCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    featureDesc: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
        fontWeight: '500',
    },
    indexSection: {
        paddingHorizontal: 24,
    },
    indexCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    indexHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    indexTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    indexList: {
        gap: 16,
    },
    indexItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    indexItemLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    indexItemValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
});
