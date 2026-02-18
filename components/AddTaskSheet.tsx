
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { TaskPriority, TaskCategory } from '../context/TaskContext';
import CustomBottomSheet, { BottomSheetRef } from './CustomBottomSheet';
import { BlurView } from 'expo-blur';

interface AddTaskSheetProps {
    bottomSheetRef: React.RefObject<BottomSheetRef | null>;
    onAddTask: (task: { title: string; priority: TaskPriority; category: TaskCategory; dueDate: string }) => void;
    visible: boolean;
    onClose: () => void;
}

export default function AddTaskSheet({ bottomSheetRef, onAddTask, visible, onClose }: AddTaskSheetProps) {
    const { theme, isDark } = useTheme();
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('Medium');
    const [category, setCategory] = useState<TaskCategory>('Personal');
    const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

    const handleCreate = () => {
        if (!title.trim()) return;
        onAddTask({ title, priority, category, dueDate });
        setTitle('');
        setPriority('Medium');
        setCategory('Personal');
        onClose(); // Use prop to close
    };

    const priorities: TaskPriority[] = ['High', 'Medium', 'Low'];
    const categories: TaskCategory[] = ['Work', 'Personal', 'Health', 'Education', 'Other'];

    return (
        <CustomBottomSheet ref={bottomSheetRef} snapPoints={[500]} visible={visible} onClose={onClose}>
            <View style={[styles.container, { backgroundColor: theme.surface }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>New Task</Text>
                    <Pressable onPress={onClose}>
                        <Feather name="x" size={24} color={theme.subtext} />
                    </Pressable>
                </View>

                <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="What needs to be done?"
                        placeholderTextColor={theme.subtext}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Priority</Text>
                    <View style={styles.chipRow}>
                        {priorities.map(p => (
                            <Pressable
                                key={p}
                                onPress={() => setPriority(p)}
                                style={[
                                    styles.chip,
                                    { borderColor: theme.border, backgroundColor: theme.background },
                                    priority === p && { borderColor: getPriorityColor(p), backgroundColor: getPriorityColor(p) + '20' }
                                ]}
                            >
                                <Text style={[
                                    styles.chipText,
                                    { color: theme.subtext },
                                    priority === p && { color: getPriorityColor(p), fontWeight: '700' }
                                ]}>{p}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Category</Text>
                    <View style={styles.chipRow}>
                        {categories.map(c => (
                            <Pressable
                                key={c}
                                onPress={() => setCategory(c)}
                                style={[
                                    styles.chip,
                                    { borderColor: theme.border, backgroundColor: theme.background },
                                    category === c && { borderColor: '#6366F1', backgroundColor: '#6366F120' }
                                ]}
                            >
                                <Text style={[
                                    styles.chipText,
                                    { color: theme.subtext },
                                    category === c && { color: '#6366F1', fontWeight: '700' }
                                ]}>{c}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Pressable style={[styles.dateBtn, { backgroundColor: theme.background }]}>
                        <Feather name="calendar" size={18} color={theme.text} />
                        <Text style={[styles.dateText, { color: theme.text }]}>Today</Text>
                    </Pressable>

                    <Pressable onPress={handleCreate} style={styles.createBtn}>
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.createBtnText}>Create Task</Text>
                            <Feather name="arrow-up" size={20} color="#FFF" />
                        </LinearGradient>
                    </Pressable>
                </View>

            </View>
        </CustomBottomSheet>
    );
}

function getPriorityColor(p: TaskPriority) {
    switch (p) {
        case 'High': return '#EF4444';
        case 'Medium': return '#F59E0B';
        case 'Low': return '#10B981';
        default: return '#94A3B8';
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingBottom: 40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    inputContainer: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
    },
    input: {
        fontSize: 18,
        fontWeight: '600',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
    },
    createBtn: {
        flex: 1,
        marginLeft: 16,
        height: 56,
        borderRadius: 18,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    gradientBtn: {
        flex: 1,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    createBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
