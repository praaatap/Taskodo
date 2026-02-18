
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Work' | 'Personal' | 'Health' | 'Education' | 'Other';
export type MascotMood = 'idle' | 'nudge' | 'celebrate';

export interface TaskItem {
    id: string;
    title: string;
    completed: boolean;
    priority: TaskPriority;
    category: TaskCategory;
    dueDate: string;
    dueAt: string;
    createdAt: string;
}

export interface Habit {
    id: string;
    title: string;
    completedDates: string[];
    streak: number;
    createdAt: string;
}

export interface ProfileTemplate {
    id: string;
    name: string;
    emoji: string;
    description: string;
    color: string;
    habits: string[];
    categories: TaskCategory[];
    dailyGoal: number;
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
    {
        id: 'student',
        name: 'Student',
        emoji: '🎓',
        description: 'Study sessions, assignments, exam prep',
        color: '#3B82F6',
        habits: ['Morning Study Session', 'Review Notes', 'Practice Problems', 'Read 30 Minutes'],
        categories: ['Education', 'Personal', 'Health'],
        dailyGoal: 5,
    },
    {
        id: 'entrepreneur',
        name: 'Entrepreneur',
        emoji: '💼',
        description: 'Deep work, networking, revenue goals',
        color: '#F59E0B',
        habits: ['90min Deep Work', 'Networking Call', 'Revenue Review', 'Email Inbox Zero'],
        categories: ['Work', 'Personal', 'Other'],
        dailyGoal: 8,
    },
    {
        id: 'athlete',
        name: 'Athlete',
        emoji: '🏃',
        description: 'Training, nutrition, recovery tracking',
        color: '#EF4444',
        habits: ['Morning Workout', 'Track Nutrition', 'Hydration Goal', 'Recovery Stretch'],
        categories: ['Health', 'Personal', 'Other'],
        dailyGoal: 4,
    },
    {
        id: 'creative',
        name: 'Creative',
        emoji: '🎨',
        description: 'Creative blocks, projects, inspiration',
        color: '#8B5CF6',
        habits: ['Creative Session', 'Inspiration Journal', 'Skill Practice', 'Portfolio Update'],
        categories: ['Work', 'Personal', 'Education'],
        dailyGoal: 3,
    },
    {
        id: 'developer',
        name: 'Developer',
        emoji: '👨‍💻',
        description: 'Code sessions, PR reviews, learning',
        color: '#06B6D4',
        habits: ['Code for 2 Hours', 'Review PRs', 'Learn Something New', 'Document Code'],
        categories: ['Work', 'Education', 'Other'],
        dailyGoal: 6,
    },
    {
        id: 'wellness',
        name: 'Wellness',
        emoji: '🧘',
        description: 'Meditation, sleep, mindfulness',
        color: '#10B981',
        habits: ['Morning Meditation', 'Gratitude Journal', 'Evening Walk', 'Sleep by 10pm'],
        categories: ['Health', 'Personal', 'Other'],
        dailyGoal: 4,
    },
];

interface TaskContextType {
    tasks: TaskItem[];
    habits: Habit[];
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    addTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    addHabit: (title: string) => Promise<void>;
    toggleHabit: (id: string) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    mascotMood: MascotMood;
    mascotMessage: string;
    stats: {
        completedTasks: number;
        totalTasks: number;
        activeHabits: number;
        xp: number;
        level: number;
    };
    activeTemplateId: string | null;
    applyTemplate: (templateId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEYS = {
    TASKS: 'taskodo_tasks',
    HABITS: 'taskodo_habits',
    XP: 'taskodo_xp',
    ACTIVE_TEMPLATE: 'taskodo_active_template',
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [xp, setXp] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
    const [mascotMessage, setMascotMessage] = useState("Welcome back! Let's conquer the day.");
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
                if (storedTasks) setTasks(JSON.parse(storedTasks));

                const storedHabits = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
                if (storedHabits) setHabits(JSON.parse(storedHabits));

                const storedXp = await AsyncStorage.getItem(STORAGE_KEYS.XP);
                if (storedXp) setXp(parseInt(storedXp, 10));

                const storedTemplate = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TEMPLATE);
                if (storedTemplate) setActiveTemplateId(storedTemplate);
            } catch (error) {
                console.error('Failed to load tasks:', error);
            }
        };
        loadData();
    }, []);

    // Save data
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)).catch(console.error);
    }, [tasks]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch(console.error);
    }, [habits]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.XP, xp.toString()).catch(console.error);
    }, [xp]);

    useEffect(() => {
        if (activeTemplateId) {
            AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TEMPLATE, activeTemplateId).catch(console.error);
        }
    }, [activeTemplateId]);

    const addTask = async (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => {
        const newTask: TaskItem = {
            ...taskData,
            id: Math.random().toString(36).substring(2, 9),
            completed: false,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);
        setMascotMood('celebrate');
        setMascotMessage("Great! A new goal set for today.");
        setTimeout(() => setMascotMood('idle'), 3000);
    };

    const toggleTask = async (id: string) => {
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                const newCompleted = !task.completed;
                if (newCompleted) {
                    setXp(x => x + 10);
                    setMascotMood('celebrate');
                    setMascotMessage("Boom! Task completed. Keep it up!");
                    setTimeout(() => setMascotMood('idle'), 3000);
                }
                return { ...task, completed: newCompleted };
            }
            return task;
        }));
    };

    const deleteTask = async (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const addHabit = async (title: string) => {
        const newHabit: Habit = {
            id: Math.random().toString(36).substring(2, 9),
            title,
            completedDates: [],
            streak: 0,
            createdAt: new Date().toISOString(),
        };
        setHabits(prev => [...prev, newHabit]);
    };

    const toggleHabit = async (id: string) => {
        const today = new Date().toISOString().slice(0, 10);
        setHabits(prev => prev.map(habit => {
            if (habit.id === id) {
                const isCompletedToday = habit.completedDates.includes(today);
                let newDates = [...habit.completedDates];
                let newStreak = habit.streak;

                if (isCompletedToday) {
                    newDates = newDates.filter(d => d !== today);
                    newStreak = Math.max(0, newStreak - 1);
                } else {
                    newDates.push(today);
                    newStreak += 1;
                    setXp(x => x + 15);
                    setMascotMood('celebrate');
                    setMascotMessage("Habit streak improved! You're on fire.");
                    setTimeout(() => setMascotMood('idle'), 3000);
                }
                return { ...habit, completedDates: newDates, streak: newStreak };
            }
            return habit;
        }));
    };

    const deleteHabit = async (id: string) => {
        setHabits(prev => prev.filter(habit => habit.id !== id));
    };

    const applyTemplate = async (templateId: string) => {
        const template = PROFILE_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        // Replace habits with template habits
        const newHabits: Habit[] = template.habits.map(title => ({
            id: Math.random().toString(36).substring(2, 9),
            title,
            completedDates: [],
            streak: 0,
            createdAt: new Date().toISOString(),
        }));
        setHabits(newHabits);
        setActiveTemplateId(templateId);
        setMascotMood('celebrate');
        setMascotMessage(`${template.emoji} ${template.name} profile activated! Let's go!`);
        setTimeout(() => setMascotMood('idle'), 4000);
    };

    const stats = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const todayTasks = tasks.filter(t => t.dueDate === today);
        return {
            completedTasks: todayTasks.filter(t => t.completed).length,
            totalTasks: todayTasks.length,
            activeHabits: habits.length,
            xp: xp,
            level: Math.floor(xp / 100) + 1,
        };
    }, [tasks, habits, xp]);

    return (
        <TaskContext.Provider value={{
            tasks,
            habits,
            selectedDate,
            setSelectedDate,
            addTask,
            toggleTask,
            deleteTask,
            addHabit,
            toggleHabit,
            deleteHabit,
            mascotMood,
            mascotMessage,
            stats,
            activeTemplateId,
            applyTemplate,
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};
