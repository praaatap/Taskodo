
import React, { useState } from 'react';
import { Modal, StyleSheet, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';

type AddHabitModalProps = {
    visible: boolean;
    onClose: () => void;
    onAdd: (title: string) => void;
};

export function AddHabitModal({ visible, onClose, onAdd }: AddHabitModalProps) {
    const [title, setTitle] = useState('');

    const handleAdd = () => {
        if (title.trim()) {
            onAdd(title);
            setTitle('');
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.dialog}>
                    <Text style={styles.title}>New Habit</Text>
                    <Text style={styles.subtitle}>Build a streak. What will you do every day?</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Drink Water, Read 10 pages..."
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                        onSubmitEditing={handleAdd}
                    />

                    <View style={styles.actions}>
                        <Pressable style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={[styles.addBtn, !title.trim() && styles.disabled]} onPress={handleAdd}>
                            <Text style={styles.addText}>Start Habit</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    dialog: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        marginBottom: 24,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
    addBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    disabled: {
        opacity: 0.5,
    },
    addText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
