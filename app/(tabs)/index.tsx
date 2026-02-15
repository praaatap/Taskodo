import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTasks, TaskPriority, TaskCategory } from '@/context/TaskContext';
import { SwipeableTaskRow } from '@/components/SwipeableTaskRow';
import { AddTaskSheet } from '@/components/AddTaskSheet';
import { useToast } from '@/context/ToastContext';

export default function TodoScreen() {
  const { tasks, selectedDate, setSelectedDate, addTask, toggleTask, deleteTask, toggleSubtask } = useTasks();
  const { showToast } = useToast();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(false);

  const todaysTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === selectedDate),
    [selectedDate, tasks]
  );

  const groupedTasks = useMemo(() => {
    if (!groupByCategory) return { 'All Tasks': todaysTasks };
    return todaysTasks.reduce((acc, task) => {
      const cat = task.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(task);
      return acc;
    }, {} as Record<string, typeof todaysTasks>);
  }, [todaysTasks, groupByCategory]);

  const handleAddTask = (title: string, priority: TaskPriority, category: TaskCategory, minutes: number, subtasks: string[] = [], date?: string) => {
    addTask(title, date || selectedDate, priority, category, minutes, subtasks);
    showToast('Task added successfully', 'success');
  };

  const formattedDate = useMemo(() => {
    const d = new Date(selectedDate);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'My Tasks';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, [selectedDate]);

  return (
    <View style={styles.safe}>
      <StatusBar style="dark" />

      {/* Modern Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{formattedDate}</Text>
          <Text style={styles.headerSubtitle}>{todaysTasks.length} tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => setGroupByCategory(!groupByCategory)}
            style={[styles.iconBtn, groupByCategory && styles.iconBtnActive]}
          >
            <Feather name="layers" size={20} color={groupByCategory ? '#6366F1' : '#6B7280'} />
          </Pressable>
          <Pressable
            onPress={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            style={styles.todayBtn}
          >
            <Text style={styles.todayBtnText}>Today</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {todaysTasks.length === 0 ? (
            <Animated.View entering={FadeInUp} style={styles.emptyContainer}>
              <View style={styles.emptyCircle}>
                <Feather name="check" size={40} color="#6366F1" />
              </View>
              <Text style={styles.emptyText}>All clear for today!</Text>
              <Text style={styles.emptySubtext}>Tap the + to add a new task</Text>
            </Animated.View>
          ) : (
            <View style={styles.taskList}>
              {Object.entries(groupedTasks).map(([category, items], catIndex) => (
                <View key={category} style={styles.categorySection}>
                  {groupByCategory && (
                    <Animated.View
                      entering={FadeInDown.delay(catIndex * 100)}
                      style={styles.categoryHeaderRow}
                    >
                      <View style={styles.categoryHeaderLine} />
                      <Text style={styles.categoryHeader}>
                        {category}
                      </Text>
                      <View style={[styles.categoryCountBadge, { backgroundColor: '#EEF2FF' }]}>
                        <Text style={styles.categoryCountText}>{items.length}</Text>
                      </View>
                    </Animated.View>
                  )}
                  <View style={styles.categoryItems}>
                    {items.map((task, index) => (
                      <Animated.View
                        layout={Layout.springify().damping(14).stiffness(100).delay(index * 20)}
                        entering={FadeInDown.delay((catIndex * 100) + (index * 50))}
                        key={task.id}
                        style={styles.taskWrapper}
                      >
                        <SwipeableTaskRow
                          task={task}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onToggleSubtask={toggleSubtask}
                        />
                        {index < items.length - 1 && <View style={styles.divider} />}
                      </Animated.View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB - Material Design 3 Style */}
      <Pressable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.95 }] }
        ]}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={28} color="#FFF" />
          <Text style={styles.fabText}>New Task</Text>
        </LinearGradient>
      </Pressable>

      <AddTaskSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onAdd={handleAddTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#EEF2FF',
  },
  todayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  todayBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 12,
  },
  categoryHeaderLine: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#6366F1',
  },
  categoryHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
  },
  categoryItems: {
    gap: 8,
  },
  taskWrapper: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  taskList: {
    paddingTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginLeft: 72,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 10,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
