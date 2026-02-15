
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTasks } from '../../context/TaskContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
    const strokeWidth = 10;
    const pct = Math.round(progress * 100);

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: '#F3F4F6',
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: '#6366F1',
                    borderTopColor: progress > 0.25 ? '#6366F1' : 'transparent',
                    borderRightColor: progress > 0.5 ? '#6366F1' : 'transparent',
                    borderBottomColor: progress > 0.75 ? '#6366F1' : 'transparent',
                    borderLeftColor: progress > 0 ? '#6366F1' : 'transparent',
                    transform: [{ rotate: '-45deg' }],
                }}
            />
            <View style={styles.ringInner}>
                <Text style={styles.ringPct}>{pct}%</Text>
                <Text style={styles.ringLabel}>Goal</Text>
            </View>
        </View>
    );
}

export default function StatsScreen() {
    const { tasks, streak } = useTasks();

    // Stats Calculation
    const completedTasks = tasks.filter((t) => t.completed);
    const completedCount = completedTasks.length;
    const totalCount = tasks.length;

    // Efficiency: Completed / (Completed + Overdue/Pending)
    // A better metric might be: Completed Tasks / Total Tasks created * 100
    const completionRate = totalCount > 0 ? completedCount / totalCount : 0;

    const weeklyData = useMemo(() => {
        const data: number[] = [];
        const today = new Date();

        // Generate last 7 days data
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().slice(0, 10);

            // Count tasks completed on this specific date
            const count = tasks.filter(t => {
                if (!t.completed || !t.completedAt) return false;
                return t.completedAt.slice(0, 10) === dateStr;
            }).length;

            data.push(count);
        }
        return data;
    }, [tasks]);

    const maxWeekly = Math.max(...weeklyData, 5); // Minimum scale of 5 for better visuals

    // Calculate Trend
    const lastWeekCount = weeklyData.slice(0, 3).reduce((a, b) => a + b, 0);
    const thisWeekCount = weeklyData.slice(3).reduce((a, b) => a + b, 0);
    const trend = lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.topHeader}>
                    <Text style={styles.headerTitle}>Performance</Text>
                    <View style={styles.periodBadge}>
                        <Text style={styles.periodText}>Last 7 Days</Text>
                    </View>
                </View>

                <Animated.View entering={FadeInDown.delay(100)} style={styles.mainScoreCard}>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreTitle}>Current Streak</Text>
                        <View style={styles.scoreRow}>
                            <Text style={styles.scoreValue}>{streak}</Text>
                            <Text style={styles.scoreUnit}>days</Text>
                            <Feather name="zap" size={24} color="#F59E0B" style={{ marginLeft: 8 }} />
                        </View>
                        <Text style={styles.scoreSub}>
                            {streak > 3 ? "You're on fire! Keep it up." : "Consistency is key."}
                        </Text>
                    </View>
                    <ProgressRing progress={completionRate} size={100} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)} style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Activity Analysis</Text>
                    <View style={styles.barsContainer}>
                        {weeklyData.map((val, i) => {
                            const height = (val / maxWeekly) * 100;
                            // Calculate day label for the last 7 days
                            const date = new Date();
                            date.setDate(date.getDate() - (6 - i));
                            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const isToday = i === 6;

                            return (
                                <View key={i} style={styles.barCol}>
                                    <View style={styles.barTrack}>
                                        <View
                                            style={[
                                                styles.barFill,
                                                { height: `${Math.max(height, 5)}%` },
                                                isToday && styles.barToday
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                                        {dayLabel}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </Animated.View>

                <View style={styles.statsRow}>
                    <Animated.View entering={FadeInDown.delay(300)} style={styles.miniCard}>
                        <Text style={styles.miniLabel}>Completed</Text>
                        <Text style={styles.miniValue}>{completedCount}</Text>
                        <View style={[styles.miniTrend, { backgroundColor: trend >= 0 ? '#ECFDF5' : '#FEF2F2' }]}>
                            <Feather
                                name={trend >= 0 ? "trending-up" : "trending-down"}
                                size={12}
                                color={trend >= 0 ? "#10B981" : "#EF4444"}
                            />
                            <Text style={[styles.trendText, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}>
                                {Math.abs(Math.round(trend))}%
                            </Text>
                        </View>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(400)} style={styles.miniCard}>
                        <Text style={styles.miniLabel}>Efficiency</Text>
                        <Text style={styles.miniValue}>{Math.round(completionRate * 100)}%</Text>
                        <View style={[styles.miniTrend, { backgroundColor: '#F9FAFB' }]}>
                            <Text style={[styles.trendText, { color: '#6B7280' }]}>Lifetime</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Category Breakdown */}
                <Animated.View entering={FadeInDown.delay(450)} style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Category Breakdown</Text>
                    {['Work', 'Personal', 'Health', 'Learning', 'Finance'].map((cat, i) => {
                        const catTasks = tasks.filter(t => t.category === cat);
                        const doneCatTasks = catTasks.filter(t => t.completed);
                        const ratio = catTasks.length > 0 ? doneCatTasks.length / catTasks.length : 0;
                        if (catTasks.length === 0) return null;

                        return (
                            <View key={cat} style={styles.categoryRow}>
                                <View style={styles.categoryInfo}>
                                    <Text style={styles.categoryName}>{cat}</Text>
                                    <Text style={styles.categoryCount}>{doneCatTasks.length}/{catTasks.length}</Text>
                                </View>
                                <View style={styles.categoryTrack}>
                                    <View style={[styles.categoryFill, { width: `${ratio * 100}%` }]} />
                                </View>
                            </View>
                        );
                    })}
                </Animated.View>

                {/* Productivity Insight */}
                <Animated.View entering={FadeInDown.delay(500)} style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                        <View style={styles.insightIcon}>
                            <Feather name="info" size={20} color="#8B5CF6" />
                        </View>
                        <Text style={styles.insightTitle}>Productivity Insight</Text>
                    </View>
                    <Text style={styles.insightText}>
                        Your most productive day is <Text style={{ fontWeight: '700', color: '#6366F1' }}>{DAYS[weeklyData.indexOf(Math.max(...weeklyData))] || 'Today'}</Text>.
                        You tend to finish {Math.max(...weeklyData)} tasks then.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(550)} style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Milestones</Text>
                    <View style={styles.milestoneRow}>
                        <View style={styles.milestoneItem}>
                            <View style={[styles.milestoneIcon, streak >= 3 && styles.milestoneIconActive]}>
                                <Feather name="zap" size={24} color={streak >= 3 ? '#6366F1' : '#E5E7EB'} />
                            </View>
                            <Text style={[styles.milestoneName, streak >= 3 && { color: '#1F2937' }]}>Hot Streak</Text>
                        </View>
                        <View style={styles.milestoneItem}>
                            <View style={[styles.milestoneIcon, completedCount >= 10 && styles.milestoneIconActive]}>
                                <Feather name="award" size={24} color={completedCount >= 10 ? '#6366F1' : '#E5E7EB'} />
                            </View>
                            <Text style={[styles.milestoneName, completedCount >= 10 && { color: '#1F2937' }]}>Expert</Text>
                        </View>
                        <View style={styles.milestoneItem}>
                            <View style={[styles.milestoneIcon, completedCount >= 50 && styles.milestoneIconActive]}>
                                <Feather name="lock" size={24} color={completedCount >= 50 ? '#6366F1' : '#E5E7EB'} />
                            </View>
                            <Text style={[styles.milestoneName, completedCount >= 50 && { color: '#1F2937' }]}>Master</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    periodBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B5563',
    },
    mainScoreCard: {
        backgroundColor: '#111827',
        borderRadius: 28,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    scoreInfo: {
        flex: 1,
    },
    scoreTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 40,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    scoreUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9CA3AF',
        marginLeft: 6,
    },
    scoreSub: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    ringInner: {
        alignItems: 'center',
    },
    ringPct: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    ringLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    sectionCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 20,
    },
    barsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barCol: {
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    barTrack: {
        width: 12,
        height: 100,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        backgroundColor: '#D1D5DB',
    },
    barToday: {
        backgroundColor: '#6366F1',
    },
    barLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    barLabelToday: {
        color: '#6366F1',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    miniCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 20,
    },
    miniLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
    },
    miniValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    miniTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    trendText: {
        fontSize: 10,
        fontWeight: '700',
    },
    milestoneRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    milestoneItem: {
        alignItems: 'center',
        gap: 8,
    },
    milestoneIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    milestoneIconActive: {
        backgroundColor: '#EFF6FF',
    },
    milestoneName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4B5563',
    },
    categoryRow: {
        marginBottom: 16,
    },
    categoryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    categoryCount: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    categoryTrack: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    categoryFill: {
        height: '100%',
        backgroundColor: '#6366F1',
    },
    insightCard: {
        backgroundColor: '#F5F3FF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#EDE9FE',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    insightIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    insightText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
});
