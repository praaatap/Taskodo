
import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTaskNotification, cancelTaskNotification } from '@/utils/notifications';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Learning' | 'Finance';
export type MascotMood = 'idle' | 'nudge' | 'celebrate';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Habit = {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // YYYY-MM-DD
};

export type TaskItem = {
  id: string;
  title: string;
  dueDate: string;
  dueAt: string;
  remindAfterMinutes: number;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  createdAt: string;
  completedAt?: string; // Track when task was completed for streaks
  subtasks: Subtask[];
  notificationId?: string;
};

type TaskContextValue = {
  tasks: TaskItem[];
  selectedDate: string;
  mascotMood: MascotMood;
  mascotMessage: string;
  streak: number;
  habits: Habit[];
  isLoading: boolean;
  setSelectedDate: (date: string) => void;
  addTask: (
    title: string,
    dueDate: string,
    priority: TaskPriority,
    category: TaskCategory,
    remindAfterMinutes: number,
    subtasks?: string[]
  ) => void;
  toggleTask: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  dismissMascot: () => void;
  deleteTask: (taskId: string) => void;
  getSmartSuggestions: () => TaskItem[];
  addHabit: (title: string) => void;
  toggleHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
};

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

const STORAGE_KEY = '@taskodo_data_v1';

function getDueAt(dueDate: string, remindAfterMinutes: number) {
  const now = new Date();
  const due = new Date(dueDate);
  due.setHours(now.getHours(), now.getMinutes(), 0, 0);
  due.setMinutes(due.getMinutes() + remindAfterMinutes);
  return due.toISOString();
}

// Calculate streak based on consecutive days with at least one completed task
function calculateStreak(tasks: TaskItem[]): number {
  const completedTasks = tasks.filter(t => t.completed && t.completedAt);
  if (completedTasks.length === 0) return 0;

  // Get unique dates of completion, sorted descending
  const uniqueDates = Array.from(new Set(
    completedTasks.map(t => t.completedAt!.slice(0, 10))
  )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // If no task completed today or yesterday, streak is broken (0)
  // Unless we want to be lenient and show the streak from yesterday until end of today
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 0;
  let currentDate = uniqueDates[0] === today ? today : yesterday;

  // Check strict consecutive days
  for (const date of uniqueDates) {
    if (date === currentDate) {
      streak++;
      // Move to previous day
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = prevDate.toISOString().slice(0, 10);
    } else {
      break;
    }
  }

  return streak;
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [mascotMessage, setMascotMessage] = useState('Stay focused. Your plan is waiting.');
  const [streak, setStreak] = useState(0);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!AsyncStorage) {
          console.error('AsyncStorage is null. Check if the native module is linked correctly.');
          setIsLoading(false);
          return;
        }
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          const data = JSON.parse(jsonValue);
          setTasks(data.tasks || []);
          setStreak(data.streak || 0);
          setHabits(data.habits || []);
          // Recalculate streak on load to ensure accuracy
          const calculatedStreak = calculateStreak(data.tasks || []);
          setStreak(calculatedStreak);
        }
      } catch (e) {
        console.error('Failed to load tasks', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data whenever tasks change
  useEffect(() => {
    const saveData = async () => {
      if (isLoading) return; // Don't save if we haven't loaded yet
      try {
        if (!AsyncStorage) return;
        const data = {
          tasks,
          streak,
          habits,
          lastUpdated: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save tasks', e);
      }
    };
    saveData();
  }, [tasks, streak, habits, isLoading]);

  // Mascot logic interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const overdue = tasks.find(
        (task) => !task.completed && new Date(task.dueAt).getTime() <= now
      );

      if (overdue) {
        setMascotMood('nudge');
        setMascotMessage(`"${overdue.title}" is overdue. Finish it now.`);
        return;
      }

      if (tasks.length > 0 && tasks.every((task) => task.completed)) {
        setMascotMood('celebrate');
        setMascotMessage('All tasks complete. Great execution.');
        return;
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [tasks]);

  const contextValue = useMemo<TaskContextValue>(
    () => ({
      tasks,
      selectedDate,
      mascotMood,
      mascotMessage,
      streak,
      habits,
      isLoading,
      setSelectedDate,
      addTask: (title, dueDate, priority, category, remindAfterMinutes, subtaskTitles = []) => {
        const cleanedTitle = title.trim();
        if (!cleanedTitle) return;

        setTasks((prev) => {
          const newTasks = [
            {
              id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              title: cleanedTitle,
              dueDate,
              dueAt: getDueAt(dueDate, remindAfterMinutes),
              remindAfterMinutes,
              priority,
              category,
              completed: false,
              createdAt: new Date().toISOString(),
              subtasks: subtaskTitles.map(st => ({
                id: `sub-${Math.random().toString(36).slice(2, 7)}`,
                title: st,
                completed: false
              }))
            },
            ...prev,
          ];
          // Schedule notification
          const taskDate = new Date(dueDate);
          const now = new Date();
          // Adjust taskDate to the calculated dueAt
          const finalDueAt = new Date(getDueAt(dueDate, remindAfterMinutes));

          if (finalDueAt > now) {
            scheduleTaskNotification(newTasks[0].id, cleanedTitle, finalDueAt)
              .then(id => {
                setTasks(currentTasks => currentTasks.map(t => t.id === newTasks[0].id ? { ...t, notificationId: id } : t));
              })
              .catch((e: any) => console.error('Failed to schedule', e));
          }

          return newTasks;
        });

        setMascotMood('idle');
        setMascotMessage(`Timer set for ${remindAfterMinutes} min.`);
      },
      toggleTask: (taskId) => {
        setTasks((prev) => {
          const newTasks = prev.map((task) => {
            if (task.id === taskId) {
              const isNowCompleted = !task.completed;
              return {
                ...task,
                completed: isNowCompleted,
                completedAt: isNowCompleted ? new Date().toISOString() : undefined
              };
            }
            return task;
          });

          // Calculate new streak immediately based on the new state of tasks
          const newStreak = calculateStreak(newTasks);
          setStreak(newStreak);

          // Trigger mascot if completing
          const target = newTasks.find(t => t.id === taskId);
          if (target?.completed) {
            setMascotMood('celebrate');
            setMascotMessage(`Excellent. "${target.title}" is done.`);
          }

          return newTasks;
        });
      },
      toggleSubtask: (taskId, subtaskId) => {
        setTasks((prev) => prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              subtasks: task.subtasks.map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              )
            };
          }
          return task;
        }));
      },
      deleteTask: (taskId) => {
        setTasks(prev => {
          const target = prev.find(t => t.id === taskId);
          if (target?.notificationId) {
            cancelTaskNotification(target.notificationId).catch((e: any) => console.error('Failed to cancel', e));
          }
          const newTasks = prev.filter(t => t.id !== taskId);

          // Recalculate streak in case a completed task defined the streak
          const newStreak = calculateStreak(newTasks);
          setStreak(newStreak);
          return newTasks;
        });
      },
      dismissMascot: () => {
        setMascotMood('idle');
        setMascotMessage('Back to focus mode.');
      },
      getSmartSuggestions: () => {
        const now = new Date();
        const hour = now.getHours();
        const incompleteTasks = tasks.filter(t => !t.completed);

        // Simple scoring system
        return incompleteTasks.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Priority Weight
          if (a.priority === 'High') scoreA += 10;
          if (a.priority === 'Medium') scoreA += 5;
          if (b.priority === 'High') scoreB += 10;
          if (b.priority === 'Medium') scoreB += 5;

          // Due Time Weight
          const timeA = new Date(a.dueAt).getTime();
          const timeB = new Date(b.dueAt).getTime();

          if (timeA < now.getTime()) scoreA += 20; // Overdue
          if (timeB < now.getTime()) scoreB += 20;

          if (timeA - now.getTime() < 7200000) scoreA += 5; // Due in 2 hours
          if (timeB - now.getTime() < 7200000) scoreB += 5;

          // Contextual Weight (Time of Day)
          const isWorkHours = hour >= 9 && hour <= 17;
          if (isWorkHours && a.category === 'Work') scoreA += 3;
          if (isWorkHours && b.category === 'Work') scoreB += 3;

          if (!isWorkHours && (a.category === 'Personal' || a.category === 'Health')) scoreA += 3;
          if (!isWorkHours && (b.category === 'Personal' || b.category === 'Health')) scoreB += 3;

          return scoreB - scoreA;
        }).slice(0, 3);
      },
      addHabit: (title: string) => {
        if (!title.trim()) return;
        setHabits(prev => [
          ...prev,
          {
            id: `habit-${Date.now()}`,
            title: title.trim(),
            streak: 0,
            completedDates: []
          }
        ]);
        // showToast && console.log('Habit added'); // Toast depends on external
      },
      toggleHabit: (habitId: string) => {
        setHabits(prev => prev.map(h => {
          if (h.id !== habitId) return h;

          const today = new Date().toISOString().slice(0, 10);
          const isCompletedToday = h.completedDates.includes(today);

          let newCompletedDates = [...h.completedDates];
          let newStreak = h.streak;

          if (isCompletedToday) {
            newCompletedDates = newCompletedDates.filter(d => d !== today);
            // Simple streak reduction logic (imperfect but functional for v1)
            newStreak = Math.max(0, newStreak - 1);
          } else {
            newCompletedDates.push(today);
            // Check if yesterday was completed to increment streak correctly
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            if (newCompletedDates.includes(yesterday)) {
              newStreak += 1;
            } else {
              newStreak = 1; // Start over or 1 if just started today
            }
          }

          return {
            ...h,
            completedDates: newCompletedDates,
            streak: newStreak
          };
        }));
      },
      deleteHabit: (habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
      }
    }),
    [selectedDate, tasks, streak, habits, mascotMood, mascotMessage, isLoading]
  );

  return (
    <TaskContext.Provider value={contextValue}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {children}
      </SafeAreaView>
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used inside TaskProvider');
  }
  return context;
}
