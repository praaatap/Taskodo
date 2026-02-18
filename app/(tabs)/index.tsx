import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useTasks, TaskPriority, TaskCategory } from '../../context/TaskContext';
import { MascotCharacter } from '../../components/MascotCharacter';
import { HabitRow } from '../../components/HabitRow';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

export default function TasksScreen() {
    const {
        tasks,
        habits,
        addTask,
        toggleTask,
        deleteTask,
        toggleHabit,
        deleteHabit,
        mascotMood,
        mascotMessage,
        stats,
    } = useTasks();

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showAddInput, setShowAddInput] = useState(false);

    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = useMemo(() => tasks.filter(t => t.dueDate === today), [tasks, today]);

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        addTask({
            title: newTaskTitle,
            priority: 'Medium',
            category: 'Personal',
            dueDate: today,
            dueAt: new Date().toISOString(),
        });
        setNewTaskTitle('');
        setShowAddInput(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>✨ Today</Text>
                        <Text style={styles.statsSubtitle}>
                            Lv.{stats.level} • {stats.xp % 100} XP
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        <Pressable style={styles.iconBtn}>
                            <Feather name="search" size={20} color="#64748B" />
                        </Pressable>
                        <Pressable style={styles.iconBtn}>
                            <Feather name="bell" size={20} color="#64748B" />
                        </Pressable>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${(stats.xp % 100)}%` }]} />
                </View>

                {/* Task Progress Summary */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Tasks</Text>
                        <Text style={styles.summaryValue}>{stats.completedTasks}/{stats.totalTasks}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Habits</Text>
                        <Text style={styles.summaryValue}>{stats.activeHabits}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Mascot Section */}
                <MascotCharacter mood={mascotMood} message={mascotMessage} />

                {/* Habits Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Habits</Text>
                        <Pressable>
                            <Text style={styles.seeAll}>Manage</Text>
                        </Pressable>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.habitsScroll}
                    >
                        {habits.length === 0 ? (
                            <View style={styles.emptyHabit}>
                                <Text style={styles.emptyText}>Add habits to build streaks!</Text>
                            </View>
                        ) : (
                            habits.map(habit => (
                                <HabitRow
                                    key={habit.id}
                                    habit={habit}
                                    onToggle={toggleHabit}
                                    onDelete={deleteHabit}
                                />
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Tasks Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Focus</Text>
                        <Text style={styles.taskCount}>{todayTasks.length} tasks</Text>
                    </View>

                    {todayTasks.length === 0 ? (
                        <Animated.View entering={FadeInDown} style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🎯</Text>
                            <Text style={styles.emptyTitle}>All clear!</Text>
                            <Text style={styles.emptySubtitle}>Tap + to add your first task for today</Text>
                        </Animated.View>
                    ) : (
                        <View style={styles.taskList}>
                            {todayTasks.map((task, index) => (
                                <Animated.View
                                    key={task.id}
                                    entering={FadeInDown.delay(index * 50)}
                                    layout={Layout.springify()}
                                >
                                    <Pressable
                                        style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                                        onPress={() => toggleTask(task.id)}
                                        onLongPress={() => {
                                            Alert.alert("Delete Task", "Remove this task?", [
                                                { text: "Cancel", style: "cancel" },
                                                { text: "Delete", style: "destructive", onPress: () => deleteTask(task.id) }
                                            ]);
                                        }}
                                    >
                                        <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]} />
                                        <View style={styles.taskInfo}>
                                            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                                                {task.title}
                                            </Text>
                                            <View style={styles.taskMeta}>
                                                <Text style={styles.categoryText}>{task.category}</Text>
                                                <Text style={styles.metaDot}>•</Text>
                                                <Text style={styles.priorityText}>{task.priority}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.checkCircle, task.completed && styles.checkCircleDone]}>
                                            {task.completed && <Feather name="check" size={14} color="#FFF" />}
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Quick Add Input */}
            {showAddInput && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.addInputContainer}
                >
                    <View style={styles.addInputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="I want to..."
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleAddTask}
                        />
                        <Pressable onPress={handleAddTask} style={styles.addSubmitBtn}>
                            <Feather name="arrow-up" size={20} color="#FFF" />
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            )}

            {/* Floating Action Button */}
            {!showAddInput && (
                <Pressable
                    style={styles.fab}
                    onPress={() => setShowAddInput(true)}
                >
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        style={styles.fabGradient}
                    >
                        <Feather name="plus" size={28} color="#FFF" />
                    </LinearGradient>
                </Pressable>
            )}
        </SafeAreaView>
    );
}

function getPriorityColor(p: TaskPriority) {
    switch (p) {
        case 'High': return '#EF4444';
        case 'Medium': return '#6366F1';
        case 'Low': return '#10B981';
        default: return '#94A3B8';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingTop: 10,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    greeting: {
        fontSize: 28,
        fontFamily: 'Outfit_800ExtraBold',
        color: '#1F2937',
        letterSpacing: -1,
    },
    statsSubtitle: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: '#6366F1',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 24,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: 'Outfit_600SemiBold',
    },
    summaryValue: {
        fontSize: 12,
        color: '#1F2937',
        fontFamily: 'Outfit_800ExtraBold',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        color: '#1F2937',
    },
    seeAll: {
        fontSize: 13,
        color: '#6366F1',
        fontFamily: 'Outfit_600SemiBold',
    },
    taskCount: {
        fontSize: 13,
        color: '#9CA3AF',
        fontFamily: 'Outfit_600SemiBold',
    },
    habitsScroll: {
        paddingLeft: 24,
        paddingRight: 14,
    },
    emptyHabit: {
        paddingVertical: 10,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontStyle: 'italic',
        fontFamily: 'Outfit_500Medium',
    },
    taskList: {
        paddingHorizontal: 24,
        gap: 12,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    taskCardCompleted: {
        opacity: 0.6,
        backgroundColor: '#FFFFFF',
    },
    priorityTag: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: 16,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#1F2937',
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    categoryText: {
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'Outfit_700Bold',
        textTransform: 'uppercase',
    },
    metaDot: {
        color: '#D1D5DB',
    },
    priorityText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontFamily: 'Outfit_600SemiBold',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircleDone: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        marginHorizontal: 24,
        backgroundColor: '#F9FAFB',
        borderRadius: 32,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_800ExtraBold',
        color: '#1F2937',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        fontFamily: 'Outfit_500Medium',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addInputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 20,
    },
    addInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        height: 56,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#1F2937',
    },
    addSubmitBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
