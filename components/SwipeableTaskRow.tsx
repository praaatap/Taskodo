
import React from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { GestureDetector, Gesture, GestureUpdateEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
    withTiming,
} from "react-native-reanimated";
import { Feather } from '@expo/vector-icons';
import { TaskItem, TaskPriority, TaskCategory } from '../context/TaskContext';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type SwipeableTaskRowProps = {
    task: TaskItem;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleSubtask: (taskId: string, subtaskId: string) => void;
};

// Helper functions for colors
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

export function SwipeableTaskRow({ task, onToggle, onDelete, onToggleSubtask }: SwipeableTaskRowProps) {
    const translateX = useSharedValue(0);
    const context = useSharedValue({ x: 0 });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            context.value = { x: translateX.value };
        })
        .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
            translateX.value = event.translationX + context.value.x;
        })
        .onEnd(() => {
            const config = { damping: 15, stiffness: 100 };
            if (translateX.value > SWIPE_THRESHOLD) {
                // Swiped Right (Complete)
                translateX.value = withSpring(SCREEN_WIDTH, config, () => {
                    runOnJS(onToggle)(task.id);
                    // Snap back
                    translateX.value = withSpring(0, config);
                });
            } else if (translateX.value < -SWIPE_THRESHOLD) {
                // Swiped Left (Delete)
                translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 }, () => {
                    runOnJS(onDelete)(task.id);
                });
            } else {
                translateX.value = withSpring(0, config);
            }
        });

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const rLeftContainerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolate.CLAMP);
        return { opacity };
    });

    const rRightContainerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolate.CLAMP);
        return { opacity };
    });

    return (
        <View style={styles.container}>
            {/* Left Action (Complete) */}
            <Animated.View style={[styles.actionContainer, styles.leftAction, rLeftContainerStyle]}>
                <Feather name="check-circle" size={28} color="#059669" />
            </Animated.View>

            {/* Right Action (Delete) */}
            <Animated.View style={[styles.actionContainer, styles.rightAction, rRightContainerStyle]}>
                <Feather name="trash-2" size={28} color="#DC2626" />
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.taskCard, task.completed && styles.taskCardDone, rStyle]}>
                    <Pressable
                        onPress={() => onToggle(task.id)}
                        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
                    >
                        {task.completed && <Feather name="check" size={16} color="#FFF" />}
                    </Pressable>

                    <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                            {task.title}
                        </Text>

                        {/* Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                            <View style={styles.subtaskList}>
                                {task.subtasks.map(sub => (
                                    <Pressable
                                        key={sub.id}
                                        style={styles.subtaskRow}
                                        onPress={(e) => {
                                            e.stopPropagation(); // Stop propagation to not trigger row toggle
                                            onToggleSubtask(task.id, sub.id);
                                        }}
                                    >
                                        <View style={[styles.subtaskCheckbox, sub.completed && styles.subtaskCheckboxChecked]}>
                                            {sub.completed && <Feather name="check" size={10} color="#FFF" />}
                                        </View>
                                        <Text style={[styles.subtaskText, sub.completed && styles.subtaskTextDone]}>
                                            {sub.title}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        <View style={styles.taskMeta}>
                            <View style={[styles.priorityBadge, { backgroundColor: getCategoryBg(task.category) }]}>
                                <Text style={[styles.priorityText, { color: getCategoryColor(task.category) }]}>{task.category}</Text>
                            </View>
                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityBg(task.priority) }]}>
                                <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>{task.priority}</Text>
                            </View>
                            <Text style={styles.timerMeta}>
                                <Feather name="clock" size={12} color="#9CA3AF" /> {task.remindAfterMinutes}m
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        justifyContent: 'center',
    },
    actionContainer: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    leftAction: {
        alignItems: 'flex-start',
        backgroundColor: '#ECFDF5',
    },
    rightAction: {
        alignItems: 'flex-end',
        backgroundColor: '#FEF2F2',
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'flex-start', // specific alignment
        gap: 16,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    taskCardDone: {
        opacity: 0.7,
        backgroundColor: '#F9FAFB',
        elevation: 0,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        marginTop: 2,
    },
    checkboxChecked: {
        borderColor: '#6366F1',
        backgroundColor: '#6366F1',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
    },
    taskTitleDone: {
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    subtaskList: {
        marginTop: 8,
        gap: 6,
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subtaskCheckbox: {
        width: 16,
        height: 16,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    subtaskCheckboxChecked: {
        borderColor: '#6366F1',
        backgroundColor: '#6366F1',
    },
    subtaskText: {
        fontSize: 13,
        color: '#4B5563',
    },
    subtaskTextDone: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // reduced gap
        marginTop: 8,
        flexWrap: 'wrap',
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
    timerMeta: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
});
