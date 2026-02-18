
import React, { useMemo, useState } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Dimensions,
    Pressable, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 130;

type DateRange = 'Week' | 'Month' | 'Year';

// Mock data for different date ranges
const RANGE_DATA: Record<DateRange, { bars: number[]; labels: string[] }> = {
    Week: { bars: [45, 60, 85, 40, 95, 70, 55], labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] },
    Month: { bars: [60, 45, 80, 55, 70, 90, 40, 65, 75, 50, 85, 60], labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'] },
    Year: { bars: [55, 70, 65, 80, 75, 90, 85, 60, 70, 80, 75, 95], labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] },
};

const INSIGHTS: Record<DateRange, string> = {
    Week: "You complete 40% more tasks before noon. Try scheduling your hardest tasks in the morning!",
    Month: "Your productivity peaks in the 3rd week of the month. You're 28% more consistent than last month.",
    Year: "December is your strongest month. You've improved your completion rate by 35% this year!",
};

export default function StatsScreen() {
    const { theme, isDark } = useTheme();
    const { tasks, habits, stats } = useTasks();
    const [range, setRange] = useState<DateRange>('Week');

    const completionRate = useMemo(() => {
        const total = tasks.length || 1;
        const completed = tasks.filter(t => t.completed).length;
        return completed / total;
    }, [tasks]);

    const today = new Date().toISOString().slice(0, 10);
    const chartData = RANGE_DATA[range];
    const peakIndex = chartData.bars.indexOf(Math.max(...chartData.bars));

    const maxStreak = useMemo(() => {
        return habits.reduce((max, h) => Math.max(max, h.streak), 0);
    }, [habits]);

    const focusScore = Math.round(
        (completionRate * 0.5 + (maxStreak > 0 ? Math.min(maxStreak / 10, 1) * 0.3 : 0) + 0.2) * 100
    );

    const handleExport = () => {
        Alert.alert("Export Data", "Your latest productivity report has been exported successfully!");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
                    <Text style={[styles.subtitle, { color: theme.subtext }]}>Your productivity insights</Text>
                </View>
                <Pressable
                    onPress={handleExport}
                    style={({ pressed }) => [
                        styles.shareBtn,
                        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 }
                    ]}
                >
                    <Feather name="share-2" size={20} color={theme.text} />
                </Pressable>
            </View>

            {/* Date Range Selector */}
            <View style={[styles.rangeRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {(['Week', 'Month', 'Year'] as DateRange[]).map(r => (
                    <Pressable
                        key={r}
                        onPress={() => setRange(r)}
                        style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
                    >
                        {range === r ? (
                            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.rangeBtnGradient}>
                                <Text style={styles.rangeBtnTextActive}>{r}</Text>
                            </LinearGradient>
                        ) : (
                            <Text style={[styles.rangeBtnText, { color: theme.subtext }]}>{r}</Text>
                        )}
                    </Pressable>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Stats Row */}
                <Animated.View entering={FadeInDown.delay(50)} style={styles.heroRow}>
                    <HeroStat
                        label="Tasks Done"
                        value={stats.completedTasks.toString()}
                        icon="check-circle"
                        color="#10B981"
                        bg="#DCFCE7"
                        trend="+12%"
                        theme={theme}
                    />
                    <HeroStat
                        label="Streak"
                        value={`${maxStreak}d`}
                        icon="zap"
                        color="#F59E0B"
                        bg="#FEF3C7"
                        trend="Best!"
                        theme={theme}
                    />
                    <HeroStat
                        label="Focus Score"
                        value={`${focusScore}%`}
                        icon="target"
                        color="#6366F1"
                        bg="#EDE9FE"
                        trend="+5%"
                        theme={theme}
                    />
                </Animated.View>

                {/* Activity Chart */}
                <Animated.View entering={FadeInDown.delay(100)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Activity Stream</Text>
                        <View style={styles.peakBadge}>
                            <Feather name="trending-up" size={12} color="#6366F1" />
                            <Text style={styles.peakBadgeText}>Peak: {chartData.labels[peakIndex]}</Text>
                        </View>
                    </View>
                    <View style={styles.chartRow}>
                        {chartData.bars.map((val, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={styles.barTrack}>
                                    <LinearGradient
                                        colors={i === peakIndex ? ['#F59E0B', '#FBBF24'] : ['#6366F1', '#8B5CF6']}
                                        style={[styles.barFill, { height: `${val}%` as any }]}
                                    />
                                </View>
                                <Text style={[styles.barDay, { color: theme.subtext }]}>{chartData.labels[i]}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Habit Performance Rings */}
                {habits.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(150)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 20 }]}>Habit Performance</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ringsRow}>
                            {habits.map((habit, i) => {
                                const pct = Math.min(habit.streak * 10, 100);
                                const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
                                const color = colors[i % colors.length];
                                return (
                                    <View key={habit.id} style={styles.ringItem}>
                                        <HabitRing percent={pct} color={color} size={72} />
                                        <Text style={[styles.ringLabel, { color: theme.text }]} numberOfLines={2}>
                                            {habit.title}
                                        </Text>
                                        <Text style={[styles.ringStreak, { color: theme.subtext }]}>
                                            {habit.streak}d streak
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* AI Insight Card */}
                <Animated.View entering={FadeInDown.delay(200)}>
                    <LinearGradient
                        colors={isDark ? ['#2D1B69', '#1E1B4B'] : ['#EDE9FE', '#F5F3FF']}
                        style={[styles.insightCard, { borderColor: '#8B5CF630' }]}
                    >
                        <View style={styles.insightHeader}>
                            <View style={styles.insightIconBadge}>
                                <Text style={{ fontSize: 16 }}>✨</Text>
                            </View>
                            <Text style={[styles.insightTitle, { color: isDark ? '#C4B5FD' : '#6366F1' }]}>
                                AI Insight
                            </Text>
                        </View>
                        <Text style={[styles.insightText, { color: isDark ? '#E2E8F0' : '#374151' }]}>
                            {INSIGHTS[range]}
                        </Text>
                    </LinearGradient>
                </Animated.View>

                {/* Category Breakdown */}
                <Animated.View entering={FadeInDown.delay(250)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 20 }]}>Focus Distribution</Text>
                    <DistributionItem label="Work" percent={65} color="#6366F1" theme={theme} />
                    <DistributionItem label="Personal" percent={25} color="#EC4899" theme={theme} />
                    <DistributionItem label="Health" percent={10} color="#10B981" theme={theme} />
                </Animated.View>

                {/* Milestones */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
                    <Text style={[styles.cardTitle, { color: theme.text, marginLeft: 4, marginBottom: 16 }]}>Achievements</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestoneScroll}>
                        <MilestoneCard icon="award" title="Early Bird" desc="5 tasks before 8am" color="#F59E0B" unlocked theme={theme} />
                        <MilestoneCard icon="zap" title="On Fire" desc="Complete 10 tasks" color="#EF4444" unlocked theme={theme} />
                        <MilestoneCard icon="target" title="Bullseye" desc="Perfect week" color="#10B981" theme={theme} />
                        <MilestoneCard icon="star" title="Superstar" desc="Level 10 reached" color="#8B5CF6" theme={theme} />
                        <MilestoneCard icon="trending-up" title="Consistent" desc="30 day streak" color="#06B6D4" theme={theme} />
                    </ScrollView>
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function HeroStat({ label, value, icon, color, bg, trend, theme }: any) {
    return (
        <View style={[styles.heroStat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.heroStatIcon, { backgroundColor: bg }]}>
                <Feather name={icon} size={16} color={color} />
            </View>
            <Text style={[styles.heroStatValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.heroStatLabel, { color: theme.subtext }]}>{label}</Text>
            <Text style={[styles.heroStatTrend, { color }]}>{trend}</Text>
        </View>
    );
}

function HabitRing({ percent, color, size }: { percent: number; color: string; size: number }) {
    const r = (size - 10) / 2;
    const circumference = 2 * Math.PI * r;
    const strokeDash = (percent / 100) * circumference;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            {/* Background ring */}
            <View style={{
                position: 'absolute', width: size, height: size,
                borderRadius: size / 2, borderWidth: 6,
                borderColor: color + '20',
            }} />
            {/* Progress ring using a simple arc approximation */}
            <View style={{
                position: 'absolute', width: size, height: size,
                borderRadius: size / 2, borderWidth: 6,
                borderColor: color,
                borderTopColor: percent > 25 ? color : 'transparent',
                borderRightColor: percent > 50 ? color : 'transparent',
                borderBottomColor: percent > 75 ? color : 'transparent',
                borderLeftColor: percent > 0 ? color : 'transparent',
                transform: [{ rotate: '-90deg' }],
            }} />
            <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color }}>{percent}%</Text>
        </View>
    );
}

function DistributionItem({ label, percent, color, theme }: any) {
    return (
        <View style={styles.distItem}>
            <View style={styles.distHeader}>
                <View style={[styles.distDot, { backgroundColor: color }]} />
                <Text style={[styles.distLabel, { color: theme.text }]}>{label}</Text>
                <Text style={[styles.distPercent, { color: theme.subtext }]}>{percent}%</Text>
            </View>
            <View style={[styles.distTrack, { backgroundColor: theme.background }]}>
                <View style={[styles.distFill, { width: `${percent}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

function MilestoneCard({ icon, title, desc, color, unlocked = false, theme }: any) {
    return (
        <View style={[styles.milestoneCard, { backgroundColor: theme.surface, borderColor: theme.border }, !unlocked && { opacity: 0.5 }]}>
            <View style={[styles.milestoneIcon, { backgroundColor: color + '18' }]}>
                <Feather name={icon} size={22} color={unlocked ? color : theme.subtext} />
            </View>
            <Text style={[styles.milestoneTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.milestoneDesc, { color: theme.subtext }]}>{desc}</Text>
            {!unlocked && (
                <View style={styles.lockBadge}>
                    <Feather name="lock" size={10} color={theme.subtext} />
                </View>
            )}
        </View>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 12,
    },
    title: { fontSize: 30, fontFamily: 'Outfit_700Bold', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, fontFamily: 'Outfit_500Medium', marginTop: 2 },
    shareBtn: {
        width: 44, height: 44, borderRadius: 14,
        borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
    rangeRow: {
        flexDirection: 'row',
        marginHorizontal: 24,
        borderRadius: 16,
        borderWidth: 1,
        padding: 4,
        marginBottom: 16,
    },
    rangeBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    rangeBtnActive: {},
    rangeBtnGradient: { paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
    rangeBtnText: { textAlign: 'center', paddingVertical: 8, fontFamily: 'Outfit_600SemiBold', fontSize: 13 },
    rangeBtnTextActive: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 13 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
    heroRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    heroStat: {
        flex: 1, borderRadius: 20, padding: 14, borderWidth: 1,
        alignItems: 'center', gap: 4,
    },
    heroStatIcon: {
        width: 36, height: 36, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    },
    heroStatValue: { fontSize: 20, fontFamily: 'Outfit_700Bold' },
    heroStatLabel: { fontSize: 10, fontFamily: 'Outfit_500Medium', textAlign: 'center' },
    heroStatTrend: { fontSize: 11, fontFamily: 'Outfit_700Bold' },
    card: {
        borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
    },
    cardTitle: { fontSize: 17, fontFamily: 'Outfit_700Bold' },
    peakBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20,
    },
    peakBadgeText: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#6366F1' },
    chartRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: CHART_HEIGHT,
        paddingBottom: 8,
    },
    barCol: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
    barTrack: {
        width: 10, flex: 1, borderRadius: 5,
        justifyContent: 'flex-end', overflow: 'hidden',
    },
    barFill: { width: '100%', borderRadius: 5, minHeight: 8 },
    barDay: { fontSize: 10, fontFamily: 'Outfit_600SemiBold', marginTop: 8 },
    ringsRow: { gap: 20, paddingRight: 8 },
    ringItem: { alignItems: 'center', gap: 8, width: 80 },
    ringLabel: { fontSize: 11, fontFamily: 'Outfit_600SemiBold', textAlign: 'center', lineHeight: 15 },
    ringStreak: { fontSize: 10, fontFamily: 'Outfit_500Medium' },
    insightCard: {
        borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 16,
    },
    insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    insightIconBadge: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: '#8B5CF620', alignItems: 'center', justifyContent: 'center',
    },
    insightTitle: { fontSize: 14, fontFamily: 'Outfit_700Bold' },
    insightText: { fontSize: 14, fontFamily: 'Outfit_500Medium', lineHeight: 22 },
    section: { marginBottom: 16 },
    milestoneScroll: { gap: 12, paddingRight: 8 },
    milestoneCard: {
        width: 140, padding: 16, borderRadius: 20, borderWidth: 1,
    },
    milestoneIcon: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    milestoneTitle: { fontSize: 14, fontFamily: 'Outfit_700Bold', marginBottom: 4 },
    milestoneDesc: { fontSize: 11, fontFamily: 'Outfit_500Medium', lineHeight: 15 },
    lockBadge: {
        position: 'absolute', top: 10, right: 10,
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
    },
    distItem: { marginBottom: 14 },
    distHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    distDot: { width: 10, height: 10, borderRadius: 5 },
    distLabel: { fontSize: 14, fontFamily: 'Outfit_600SemiBold', flex: 1 },
    distPercent: { fontSize: 13, fontFamily: 'Outfit_500Medium' },
    distTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
    distFill: { height: '100%', borderRadius: 4 },
});
