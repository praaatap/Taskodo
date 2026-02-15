
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

const priorities: TaskPriority[] = ['Low', 'Medium', 'High'];
const categories: TaskCategory[] = ['Work', 'Personal', 'Health', 'Learning', 'Finance'];

function getPriorityColor(p: TaskPriority) {
    switch (p) {
        case 'High': return '#DC2626';
        case 'Medium': return '#6366F1';
        case 'Low': return '#059669';
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
            sheetRef.current?.scrollTo(-700); // 700 is roughly the height for andy/ios
            setTimeout(() => inputRef.current?.focus(), 400);
        } else {
            sheetRef.current?.scrollTo(0);
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
        <CustomBottomSheet ref={sheetRef} snapPoints={[-750]} onClose={onClose}>
            <View style={styles.sheetContent}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.sheetTitle}>New Task</Text>

                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder="What needs to be done?"
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                        returnKeyType="next"
                        selectionColor="#6366F1"
                    />

                    <Text style={styles.label}>Category</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipScroll}
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

                    <View style={styles.row}>
                        <View style={styles.controlGroup}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.chipRow}>
                                {priorities.map((p) => (
                                    <Pressable
                                        key={p}
                                        onPress={() => setPriority(p)}
                                        style={[
                                            styles.chip,
                                            priority === p && {
                                                backgroundColor: getPriorityBg(p),
                                                borderColor: getPriorityColor(p),
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                priority === p && { color: getPriorityColor(p) },
                                            ]}
                                        >
                                            {p}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={styles.controlGroup}>
                            <Text style={styles.label}>When?</Text>
                            <View style={{ gap: 8 }}>
                                <Pressable
                                    onPress={() => setShowDatePicker(true)}
                                    style={styles.dateTimeBtn}
                                >
                                    <Feather name="calendar" size={16} color="#4B5563" />
                                    <Text style={styles.dateTimeText}>
                                        {targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setShowTimePicker(true)}
                                    style={styles.dateTimeBtn}
                                >
                                    <Feather name="clock" size={16} color="#4B5563" />
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

                    <Text style={styles.label}>Subtasks</Text>
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
                        <Pressable onPress={addSubtask} style={styles.addSubtaskBtn}>
                            <Feather name="plus" size={18} color="#6366F1" />
                        </Pressable>
                    </View>
                    {subtasks.length > 0 && (
                        <View style={styles.subtaskList}>
                            {subtasks.map((st, i) => (
                                <View key={i} style={styles.subtaskItem}>
                                    <View style={styles.subtaskDot} />
                                    <Text style={styles.subtaskText}>{st}</Text>
                                    <Pressable onPress={() => removeSubtask(i)} hitSlop={8}>
                                        <Feather name="x" size={16} color="#9CA3AF" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                <Pressable onPress={handleSave} style={styles.saveBtnWrap}>
                    <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.saveBtn}
                    >
                        <Text style={styles.saveBtnText}>Add Task</Text>
                        <Feather name="arrow-right" size={18} color="#FFF" />
                    </LinearGradient>
                </Pressable>
            </View>
        </CustomBottomSheet>
    );
}

const styles = StyleSheet.create({
    sheetContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    },
    scrollContent: {
        paddingBottom: 200, // Extra space for keyboard
    },
    sheetTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#8B5CF6',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
    },
    input: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 20,
        padding: 0,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    controlGroup: {
        flex: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    chipScroll: {
        marginBottom: 20,
    },
    chipScrollContent: {
        gap: 8,
    },
    chipRow: {
        flexDirection: 'row',
        gap: 6,
    },
    chip: {
        paddingHorizontal: 14,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    chipActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#6366F1',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
    },
    chipTextActive: {
        color: '#6366F1',
    },
    dateTimeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    dateTimeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    subtaskInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    subtaskInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827',
    },
    addSubtaskBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtaskList: {
        gap: 6,
        marginBottom: 4,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
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
        fontWeight: '500',
        color: '#374151',
    },
    saveBtnWrap: {
        marginTop: 'auto',
        backgroundColor: '#FFF',
        paddingTop: 12,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
