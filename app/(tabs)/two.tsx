
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import { useTasks, TaskItem } from '../../context/TaskContext';



export default function CalendarScreen() {
  const { theme, isDark } = useTheme();
  const { tasks, selectedDate, setSelectedDate, toggleTask } = useTasks();

  const selectedTasks = useMemo(
    () => tasks.filter((task: { dueDate: any; }) => task.dueDate === selectedDate),
    [selectedDate, tasks]
  );

  // Generate dots for the calendar
  const markedDates = useMemo(() => {
    const marks: any = {};

    // Task indicators
    tasks.forEach((task: { dueDate: string | number; priority: string; }) => {
      if (!marks[task.dueDate]) {
        marks[task.dueDate] = {
          marked: true,
          dotColor: task.priority === 'High' ? '#DC2626' : (task.priority === 'Medium' ? '#6366F1' : '#059669')
        };
      }
    });

    // Selected state
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: '#6366F1',
      disableTouchEvent: false,
    };

    return marks;
  }, [tasks, selectedDate]);

  const stats = useMemo(() => {
    const completed = selectedTasks.filter((t: { completed: any; }) => t.completed).length;
    return {
      completed,
      total: selectedTasks.length,
      percent: selectedTasks.length > 0 ? (completed / selectedTasks.length) : 0
    };
  }, [selectedTasks]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View>
          <Text style={[styles.yearText, { color: isDark ? '#A78BFA' : '#6366F1' }]}>
            {new Date(selectedDate).getFullYear()}
          </Text>
          <Text style={[styles.monthText, { color: theme.text }]}>
            {new Date(selectedDate).toLocaleDateString(undefined, { month: 'long' })}
          </Text>
        </View>
        <Pressable
          onPress={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
          style={[styles.todayBtn, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}
        >
          <Text style={[styles.todayBtnText, { color: isDark ? '#A78BFA' : '#6366F1' }]}>Today</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.calendarCard, {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: isDark ? '#000' : '#6366F1'
          }]}
        >
          <Calendar
            current={selectedDate}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.surface,
              calendarBackground: theme.surface,
              textSectionTitleColor: theme.subtext,
              selectedDayBackgroundColor: isDark ? '#8B5CF6' : '#6366F1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: isDark ? '#A78BFA' : '#6366F1',
              dayTextColor: theme.text,
              textDisabledColor: isDark ? '#334155' : '#E5E7EB',
              dotColor: isDark ? '#A78BFA' : '#6366F1',
              selectedDotColor: '#ffffff',
              arrowColor: isDark ? '#A78BFA' : '#6366F1',
              monthTextColor: theme.text,
              indicatorColor: isDark ? '#A78BFA' : '#6366F1',
              textDayFontWeight: '600',
              textMonthFontWeight: '800',
              textDayHeaderFontWeight: '700',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 11,
            }}
            enableSwipeMonths={true}
          />
        </Animated.View>

        <View style={styles.agendaSection}>
          <View style={styles.agendaHeader}>
            <View>
              <Text style={[styles.agendaTitle, { color: theme.text }]}>
                {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'long' })}
              </Text>
              {selectedTasks.length > 0 && (
                <Text style={[styles.agendaSubtitle, { color: theme.subtext }]}>
                  {stats.completed}/{stats.total} tasks completed
                </Text>
              )}
            </View>
          </View>

          {selectedTasks.length === 0 ? (
            <Animated.View entering={FadeInUp.delay(200)} style={styles.emptyAgenda}>
              <View style={styles.emptyIconCircle}>
                <Feather name="coffee" size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyAgendaText}>No tasks planned. Take a break!</Text>
            </Animated.View>
          ) : (
            <View style={styles.agendaList}>
              {selectedTasks.map((task: TaskItem, index: number) => (
                <Animated.View key={task.id} entering={FadeInRight.delay(index * 100)}>
                  <Pressable
                    onPress={() => toggleTask(task.id)}
                    style={[styles.agendaItem, {
                      backgroundColor: theme.surface,
                      borderColor: theme.border
                    }]}
                  >
                    <View style={[styles.mark, { backgroundColor: task.priority === 'High' ? '#DC2626' : (task.priority === 'Medium' ? '#6366F1' : '#059669') }]} />
                    <View style={styles.itemBody}>
                      <Text style={[styles.itemText, { color: theme.text }, task.completed && styles.itemTextDone]}>{task.title}</Text>
                      <View style={styles.itemMetaRow}>
                        <View style={[styles.categoryPill, { backgroundColor: isDark ? '#1E293B' : '#F3F4F6' }]}>
                          <Text style={[styles.categoryPillText, { color: theme.subtext }]}>{task.category}</Text>
                        </View>
                        <Text style={[styles.itemMetaDot, { color: theme.border }]}>•</Text>
                        <Text style={[styles.itemMeta, { color: theme.subtext }]}>{task.priority}</Text>
                      </View>
                    </View>
                    <View style={[styles.checkCircle, task.completed && styles.checkCircleDone, { borderColor: theme.border }]}>
                      {task.completed && <Feather name="check" size={12} color="#FFF" />}
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getPriorityColor(p: string) {
  switch (p) {
    case 'High': return '#EF4444';
    case 'Medium': return '#6366F1';
    case 'Low': return '#10B981';
    default: return '#94A3B8';
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFF',
  },
  yearText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  monthText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    marginTop: -2,
  },
  todayBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  todayBtnText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  calendarCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  agendaSection: {
    paddingHorizontal: 24,
    marginTop: 28,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  agendaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  agendaSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  emptyAgenda: {
    paddingVertical: 48,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyAgendaText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  agendaList: {
    gap: 12,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  mark: {
    width: 4,
    height: 38,
    borderRadius: 2,
  },
  itemBody: {
    flex: 1,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemTextDone: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  itemMetaDot: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  itemMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
});
