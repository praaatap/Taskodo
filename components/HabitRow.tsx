
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Habit } from '../context/TaskContext';

type HabitRowProps = {
    habit: Habit;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
};

export function HabitRow({ habit, onToggle, onDelete }: HabitRowProps) {
    const today = new Date().toISOString().slice(0, 10);
    const isCompletedToday = habit.completedDates.includes(today);

    const handleLongPress = () => {
        Alert.alert(
            "Delete Habit",
            `Are you sure you want to delete "${habit.title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => onDelete(habit.id) }
            ]
        );
    };

    return (
        <Pressable
            style={[styles.container, isCompletedToday && styles.containerDone]}
            onPress={() => onToggle(habit.id)}
            onLongPress={handleLongPress}
            delayLongPress={500}
        >
            <View style={[styles.iconBox, isCompletedToday && styles.iconBoxDone]}>
                {isCompletedToday ? (
                    <Feather name="check" size={24} color="#FFFFFF" />
                ) : (
                    <Text style={styles.initial}>{habit.title.charAt(0).toUpperCase()}</Text>
                )}
            </View>

            <View style={styles.info}>
                <Text style={[styles.title, isCompletedToday && styles.titleDone]} numberOfLines={1}>
                    {habit.title}
                </Text>
                <View style={styles.streakBadge}>
                    <Feather name="zap" size={10} color={isCompletedToday ? "#F59E0B" : "#9CA3AF"} />
                    <Text style={[styles.streakText, isCompletedToday && styles.streakTextDone]}>
                        {habit.streak}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 90,
        height: 100,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    containerDone: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    iconBoxDone: {
        backgroundColor: '#6366F1',
    },
    initial: {
        fontSize: 20,
        fontWeight: '700',
        color: '#6B7280',
    },
    info: {
        alignItems: 'center',
        gap: 4,
        width: '100%',
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    titleDone: {
        color: '#1E40AF',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
        backgroundColor: '#F1F5F9',
    },
    streakText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    streakTextDone: {
        color: '#D97706',
    }
});
