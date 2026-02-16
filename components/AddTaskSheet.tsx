
import React, { useRef, useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    Keyboard,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TaskPriority, TaskCategory } from '@/context/TaskContext';
import CustomBottomSheet, { BottomSheetRef } from './CustomBottomSheet';

type AddTaskSheetProps = {
    visible: boolean;
    onClose: () => void;
    onAdd: (title: string, priority: TaskPriority, category: TaskCategory, minutes: number, subtasks?: string[], date?: string) => void;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
const categories: TaskCategory[] = ['Work', 'Personal', 'Health', 'Learning', 'Finance'];

function getPriorityColor(p: TaskPriority) {
    switch (p) {
        case 'High': return '#EF4444';
        case 'Medium': return '#6366F1';
        case 'Low': return '#10B981';
    }
}

function getPriorityBg(p: TaskPriority) {
    switch (p) {
        case 'High': return '#FEF2F2';
        case 'Medium': return '#EEF2FF';
        case 'Low': return '#ECFDF5';
    }
}

export function AddTaskSheet({ visible, onClose, onAdd }: AddTaskSheetProps) {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('Medium');
    const [category, setCategory] = useState<TaskCategory>('Personal');
    const [targetDate, setTargetDate] = useState(() => {
        const d = new Date();
        d.setHours(d.getHours() + 1);
        d.setMinutes(0);
        d.setSeconds(0);
        return d;
    });

    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const inputRef = useRef<TextInput>(null);
    const sheetRef = useRef<BottomSheetRef>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        if (visible) {
            setTimeout(() => inputRef.current?.focus(), 500);
        } else {
            Keyboard.dismiss();
        }
    }, [visible]);

    const handleSave = () => {
        if (!title.trim()) return;
        const now = new Date();
        const diffMs = targetDate.getTime() - now.getTime();
        const minutes = Math.max(0, Math.ceil(diffMs / 60000));
        const dateStr = targetDate.toISOString().slice(0, 10);

        onAdd(title, priority, category, minutes, subtasks, dateStr);

        // Reset
        setTitle('');
        setSubtasks([]);
        setNewSubtask('');
        setPriority('Medium');
        setCategory('Personal');
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1);
        nextHour.setMinutes(0);
        setTargetDate(nextHour);

        onClose();
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, newSubtask.trim()]);
            setNewSubtask('');
        }
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(targetDate.getHours());
            newDate.setMinutes(targetDate.getMinutes());
            setTargetDate(newDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (selectedTime) {
            const newDate = new Date(targetDate);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setTargetDate(newDate);
        }
    };

    return (
        <CustomBottomSheet
            ref={sheetRef}
            visible={visible}
            snapPoints={[SCREEN_HEIGHT * 0.85]}
            onClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.sheetContent}>
                    <View style={styles.sheetHeader}>
                        <View>
                            <Text style={styles.sheetTitle}>Create Task</Text>
                            <Text style={styles.sheetSubtitle}>Plan your next move</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Feather name="x" size={20} color="#6B7280" />
                        </Pressable>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        style={styles.mainScroll}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.inputWrapper}>
                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                placeholder="What needs to be done?"
                                placeholderTextColor="#9CA3AF"
                                value={title}
                                onChangeText={setTitle}
                                returnKeyType="next"
                                selectionColor="#6366F1"
                                multiline
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipScrollContent}
                            >
                                {categories.map((c) => (
                                    <Pressable
                                        key={c}
                                        onPress={() => setCategory(c)}
                                        style={[styles.chip, category === c && styles.chipActive]}
                                    >
                                        <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                                            {c}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.dualRow}>
                            <View style={[styles.section, { flex: 1.2 }]}>
                                <Text style={styles.label}>Priority</Text>
                                <View style={styles.priorityRow}>
                                    {priorities.map((p) => (
                                        <Pressable
                                            key={p}
                                            onPress={() => setPriority(p)}
                                            style={[
                                                styles.pChip,
                                                priority === p && {
                                                    backgroundColor: getPriorityBg(p),
                                                    borderColor: getPriorityColor(p),
                                                },
                                            ]}
                                        >
                                            <View style={[
                                                styles.pDot,
                                                { backgroundColor: getPriorityColor(p) },
                                                priority !== p && { opacity: 0.3 }
                                            ]} />
                                            <Text style={[
                                                styles.pText,
                                                priority === p && { color: getPriorityColor(p) },
                                            ]}>
                                                {p}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <View style={[styles.section, { flex: 1 }]}>
                                <Text style={styles.label}>Schedule</Text>
                                <View style={styles.dateTimeGrid}>
                                    <Pressable
                                        onPress={() => setShowDatePicker(true)}
                                        style={styles.dateTimeBtn}
                                    >
                                        <Feather name="calendar" size={14} color="#6366F1" />
                                        <Text style={styles.dateTimeText}>
                                            {targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setShowTimePicker(true)}
                                        style={styles.dateTimeBtn}
                                    >
                                        <Feather name="clock" size={14} color="#6366F1" />
                                        <Text style={styles.dateTimeText}>
                                            {targetDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={targetDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                value={targetDate}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onTimeChange}
                            />
                        )}

                        <View style={styles.section}>
                            <Text style={styles.label}>Steps / Subtasks</Text>
                            <View style={styles.subtaskInputRow}>
                                <TextInput
                                    style={styles.subtaskInput}
                                    placeholder="Add a step..."
                                    placeholderTextColor="#9CA3AF"
                                    value={newSubtask}
                                    onChangeText={setNewSubtask}
                                    onSubmitEditing={addSubtask}
                                    selectionColor="#6366F1"
                                />
                                <Pressable
                                    onPress={addSubtask}
                                    style={[styles.addSubtaskBtn, !newSubtask.trim() && { opacity: 0.5 }]}
                                >
                                    <Feather name="plus" size={20} color="#FFF" />
                                </Pressable>
                            </View>
                            {subtasks.length > 0 && (
                                <View style={styles.subtaskList}>
                                    {subtasks.map((st, i) => (
                                        <View key={i} style={styles.subtaskItem}>
                                            <View style={styles.subtaskDot} />
                                            <Text style={styles.subtaskText}>{st}</Text>
                                            <Pressable onPress={() => removeSubtask(i)} hitSlop={12}>
                                                <Feather name="x" size={14} color="#9CA3AF" />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable
                            onPress={handleSave}
                            style={({ pressed }) => [
                                styles.saveBtn,
                                !title.trim() && styles.saveBtnDisabled,
                                pressed && title.trim() && { opacity: 0.9, transform: [{ scale: 0.98 }] }
                            ]}
                            disabled={!title.trim()}
                        >
                            <LinearGradient
                                colors={title.trim() ? ['#6366F1', '#8B5CF6'] : ['#E5E7EB', '#E5E7EB']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.saveBtnGradient}
                            >
                                <Text style={styles.saveBtnText}>Let's Go</Text>
                                <Feather name="zap" size={18} color="#FFF" />
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </CustomBottomSheet>
    );
}

const styles = StyleSheet.create({
    sheetContent: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 20,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
    },
    sheetSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    inputWrapper: {
        marginBottom: 24,
    },
    input: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        padding: 0,
        minHeight: 40,
    },
    section: {
        marginBottom: 24,
    },
    dualRow: {
        flexDirection: 'row',
        gap: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    chipScrollContent: {
        gap: 8,
        paddingRight: 24,
    },
    chip: {
        paddingHorizontal: 16,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
    },
    chipActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6B7280',
    },
    chipTextActive: {
        color: '#6366F1',
    },
    priorityRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
    },
    pDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    pText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
    },
    dateTimeGrid: {
        gap: 8,
    },
    dateTimeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
    },
    dateTimeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B5563',
    },
    subtaskInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    subtaskInput: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 48,
        fontSize: 14,
        color: '#111827',
    },
    addSubtaskBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    subtaskList: {
        gap: 8,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
    },
    subtaskDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#C7D2FE',
    },
    subtaskText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    saveBtn: {
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    saveBtnDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    saveBtnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
