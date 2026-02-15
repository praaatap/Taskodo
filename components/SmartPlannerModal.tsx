
import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskItem, TaskPriority, TaskCategory } from '../context/TaskContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

type SmartPlannerModalProps = {
    visible: boolean;
    onClose: () => void;
    suggestions: TaskItem[];
    onSelectTask: (task: TaskItem) => void;
};

export function SmartPlannerModal({ visible, onClose, suggestions, onSelectTask }: SmartPlannerModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.dialog}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="sparkles" size={24} color="#F59E0B" />
                        </View>
                        <Text style={styles.title}>Smart Daily Plan</Text>
                        <Text style={styles.subtitle}>
                            Based on your deadlines, priorities, and time of day, here is what you should focus on.
                        </Text>
                    </View>

                    <View style={styles.list}>
                        {suggestions.length === 0 ? (
                            <Text style={styles.emptyText}>No suggestions right now. You're all caught up!</Text>
                        ) : (
                            suggestions.map((task, index) => (
                                <Animated.View
                                    key={task.id}
                                    entering={FadeInDown.delay(index * 100).springify()}
                                >
                                    <Pressable
                                        style={styles.suggestionCard}
                                        onPress={() => onSelectTask(task)}
                                    >
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                            <View style={[styles.priorityBadge, { backgroundColor: getCategoryBg(task.category) }]}>
                                                <Text style={[styles.priorityText, { color: getCategoryColor(task.category) }]}>{task.category}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityBg(task.priority) }]}>
                                                <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>{task.priority}</Text>
                                            </View>
                                            <Text style={styles.dueText}>
                                                {new Date(task.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            ))
                        )}
                    </View>

                    <Pressable style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Got it</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

// Helper functions (duplicated for now, could be in a utils file)
function getPriorityColor(p: TaskPriority) {
    switch (p) {
        case 'High': return '#DC2626';
        case 'Medium': return '#2563EB';
        case 'Low': return '#059669';
        default: return '#6B7280';
    }
}

function getPriorityBg(p: TaskPriority) {
    switch (p) {
        case 'High': return '#FEF2F2';
        case 'Medium': return '#EFF6FF';
        case 'Low': return '#ECFDF5';
        default: return '#F3F4F6';
    }
}

function getCategoryColor(c: TaskCategory) {
    return '#4B5563';
}

function getCategoryBg(c: TaskCategory) {
    return '#F3F4F6';
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    dialog: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFBEB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    list: {
        gap: 12,
        marginBottom: 24,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginVertical: 20,
    },
    suggestionCard: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
        marginRight: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    dueText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    closeBtn: {
        backgroundColor: '#111827',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    closeBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
});
