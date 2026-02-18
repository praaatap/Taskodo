
import React, { useState } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Pressable,
    Modal, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTasks, PROFILE_TEMPLATES, ProfileTemplate } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
    const { theme, isDark } = useTheme();
    const { activeTemplateId, applyTemplate, habits } = useTasks();
    const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate | null>(null);

    const activeTemplate = PROFILE_TEMPLATES.find(t => t.id === activeTemplateId);

    const handleApply = (template: ProfileTemplate) => {
        Alert.alert(
            `Apply "${template.name}" Profile?`,
            `This will replace your current habits with ${template.habits.length} new habits from the ${template.name} template. Your tasks won't be affected.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply',
                    style: 'default',
                    onPress: async () => {
                        await applyTemplate(template.id);
                        setSelectedTemplate(null);
                    }
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
                    <Text style={[styles.subtitle, { color: theme.subtext }]}>Choose your productivity persona</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Active Profile Card */}
                {activeTemplate ? (
                    <Animated.View entering={FadeInDown.delay(50)}>
                        <LinearGradient
                            colors={[activeTemplate.color + 'DD', activeTemplate.color + '88']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.activeCard}
                        >
                            <View style={styles.activeCardTop}>
                                <Text style={styles.activeEmoji}>{activeTemplate.emoji}</Text>
                                <View style={styles.activeBadge}>
                                    <Feather name="check-circle" size={12} color="#FFF" />
                                    <Text style={styles.activeBadgeText}>Active</Text>
                                </View>
                            </View>
                            <Text style={styles.activeName}>{activeTemplate.name}</Text>
                            <Text style={styles.activeDesc}>{activeTemplate.description}</Text>
                            <View style={styles.activeHabitsRow}>
                                {activeTemplate.habits.slice(0, 3).map((h, i) => (
                                    <View key={i} style={styles.activeHabitChip}>
                                        <Text style={styles.activeHabitText}>{h}</Text>
                                    </View>
                                ))}
                                {activeTemplate.habits.length > 3 && (
                                    <View style={styles.activeHabitChip}>
                                        <Text style={styles.activeHabitText}>+{activeTemplate.habits.length - 3}</Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown.delay(50)}>
                        <View style={[styles.noProfileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={{ fontSize: 40 }}>🎯</Text>
                            <Text style={[styles.noProfileTitle, { color: theme.text }]}>No Profile Selected</Text>
                            <Text style={[styles.noProfileDesc, { color: theme.subtext }]}>
                                Pick a template below to get started with pre-configured habits and goals.
                            </Text>
                        </View>
                    </Animated.View>
                )}

                {/* Templates Grid */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>All Templates</Text>
                <View style={styles.grid}>
                    {PROFILE_TEMPLATES.map((template, index) => (
                        <Animated.View
                            key={template.id}
                            entering={FadeInDown.delay(100 + index * 60)}
                            style={styles.gridItem}
                        >
                            <Pressable
                                style={({ pressed }) => [
                                    styles.templateCard,
                                    { backgroundColor: theme.surface, borderColor: activeTemplateId === template.id ? template.color : theme.border },
                                    activeTemplateId === template.id && { borderWidth: 2 },
                                    pressed && { opacity: 0.85 },
                                ]}
                                onPress={() => setSelectedTemplate(template)}
                            >
                                {/* Color accent bar */}
                                <View style={[styles.cardAccent, { backgroundColor: template.color }]} />

                                <Text style={styles.templateEmoji}>{template.emoji}</Text>
                                <Text style={[styles.templateName, { color: theme.text }]}>{template.name}</Text>
                                <Text style={[styles.templateDesc, { color: theme.subtext }]} numberOfLines={2}>
                                    {template.description}
                                </Text>

                                {/* Habits preview */}
                                <View style={styles.habitsPreview}>
                                    {template.habits.slice(0, 2).map((h, i) => (
                                        <View key={i} style={styles.habitDot}>
                                            <View style={[styles.dot, { backgroundColor: template.color }]} />
                                            <Text style={[styles.habitDotText, { color: theme.subtext }]} numberOfLines={1}>{h}</Text>
                                        </View>
                                    ))}
                                </View>

                                {activeTemplateId === template.id ? (
                                    <View style={[styles.applyBtn, { backgroundColor: template.color }]}>
                                        <Feather name="check" size={14} color="#FFF" />
                                        <Text style={styles.applyBtnText}>Active</Text>
                                    </View>
                                ) : (
                                    <Pressable
                                        style={[styles.applyBtn, { backgroundColor: template.color + '18', borderWidth: 1, borderColor: template.color + '40' }]}
                                        onPress={() => handleApply(template)}
                                    >
                                        <Text style={[styles.applyBtnText, { color: template.color }]}>Apply</Text>
                                    </Pressable>
                                )}
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>

            </ScrollView>

            {/* Template Detail Modal */}
            <Modal
                visible={selectedTemplate !== null}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedTemplate(null)}
            >
                {selectedTemplate && (
                    <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Pressable
                                onPress={() => setSelectedTemplate(null)}
                                style={[styles.closeBtn, { backgroundColor: theme.surface }]}
                            >
                                <Feather name="x" size={20} color={theme.text} />
                            </Pressable>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {/* Hero */}
                            <LinearGradient
                                colors={[selectedTemplate.color + 'CC', selectedTemplate.color + '55']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                style={styles.modalHero}
                            >
                                <Text style={styles.modalEmoji}>{selectedTemplate.emoji}</Text>
                                <Text style={styles.modalName}>{selectedTemplate.name}</Text>
                                <Text style={styles.modalDesc}>{selectedTemplate.description}</Text>
                            </LinearGradient>

                            {/* Daily Goal */}
                            <View style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Feather name="target" size={20} color={selectedTemplate.color} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.goalLabel, { color: theme.subtext }]}>Daily Goal</Text>
                                    <Text style={[styles.goalValue, { color: theme.text }]}>
                                        {selectedTemplate.dailyGoal} tasks per day
                                    </Text>
                                </View>
                            </View>

                            {/* Habits */}
                            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Pre-configured Habits</Text>
                            {selectedTemplate.habits.map((habit, i) => (
                                <View key={i} style={[styles.habitRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <View style={[styles.habitRowDot, { backgroundColor: selectedTemplate.color }]} />
                                    <Text style={[styles.habitRowText, { color: theme.text }]}>{habit}</Text>
                                    <Feather name="check" size={16} color={selectedTemplate.color} />
                                </View>
                            ))}

                            {/* Categories */}
                            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Suggested Categories</Text>
                            <View style={styles.categoriesRow}>
                                {selectedTemplate.categories.map((cat, i) => (
                                    <View key={i} style={[styles.categoryChip, { backgroundColor: selectedTemplate.color + '18', borderColor: selectedTemplate.color + '40' }]}>
                                        <Text style={[styles.categoryChipText, { color: selectedTemplate.color }]}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Apply CTA */}
                        <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
                            <Pressable
                                onPress={() => handleApply(selectedTemplate)}
                                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                            >
                                <LinearGradient
                                    colors={[selectedTemplate.color, selectedTemplate.color + 'BB']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.applyFullBtn}
                                >
                                    <Text style={styles.applyFullBtnText}>
                                        Apply {selectedTemplate.name} Template
                                    </Text>
                                    <Feather name="arrow-right" size={20} color="#FFF" />
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </SafeAreaView>
                )}
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12,
    },
    title: { fontSize: 30, fontFamily: 'Outfit_700Bold', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, fontFamily: 'Outfit_500Medium', marginTop: 2 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },

    // Active Card
    activeCard: {
        borderRadius: 28, padding: 24, marginBottom: 24,
    },
    activeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    activeEmoji: { fontSize: 40 },
    activeBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20,
    },
    activeBadgeText: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 12 },
    activeName: { color: '#FFF', fontSize: 26, fontFamily: 'Outfit_700Bold', marginBottom: 4 },
    activeDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontFamily: 'Outfit_500Medium', marginBottom: 16 },
    activeHabitsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    activeHabitChip: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20,
    },
    activeHabitText: { color: '#FFF', fontSize: 11, fontFamily: 'Outfit_600SemiBold' },

    // No Profile
    noProfileCard: {
        borderRadius: 24, padding: 32, borderWidth: 1, borderStyle: 'dashed',
        alignItems: 'center', gap: 8, marginBottom: 24,
    },
    noProfileTitle: { fontSize: 18, fontFamily: 'Outfit_700Bold' },
    noProfileDesc: { fontSize: 13, fontFamily: 'Outfit_500Medium', textAlign: 'center', lineHeight: 20 },

    // Grid
    sectionTitle: { fontSize: 18, fontFamily: 'Outfit_700Bold', marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: { width: '47.5%' },
    templateCard: {
        borderRadius: 20, padding: 16, borderWidth: 1, overflow: 'hidden',
    },
    cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
    templateEmoji: { fontSize: 32, marginBottom: 8, marginTop: 4 },
    templateName: { fontSize: 16, fontFamily: 'Outfit_700Bold', marginBottom: 4 },
    templateDesc: { fontSize: 11, fontFamily: 'Outfit_500Medium', lineHeight: 16, marginBottom: 12 },
    habitsPreview: { gap: 4, marginBottom: 14 },
    habitDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 5, height: 5, borderRadius: 3 },
    habitDotText: { fontSize: 10, fontFamily: 'Outfit_500Medium', flex: 1 },
    applyBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 8, borderRadius: 12, gap: 5,
    },
    applyBtnText: { color: '#FFF', fontFamily: 'Outfit_700Bold', fontSize: 13 },

    // Modal
    modalContainer: { flex: 1 },
    modalHeader: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, alignItems: 'flex-end' },
    closeBtn: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: 'center', justifyContent: 'center',
    },
    modalContent: { paddingHorizontal: 24, paddingBottom: 24 },
    modalHero: { borderRadius: 28, padding: 28, alignItems: 'center', marginBottom: 20 },
    modalEmoji: { fontSize: 56, marginBottom: 12 },
    modalName: { color: '#FFF', fontSize: 28, fontFamily: 'Outfit_700Bold', marginBottom: 6 },
    modalDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: 'Outfit_500Medium', textAlign: 'center' },
    goalCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 24,
    },
    goalLabel: { fontSize: 11, fontFamily: 'Outfit_500Medium' },
    goalValue: { fontSize: 16, fontFamily: 'Outfit_700Bold' },
    modalSectionTitle: { fontSize: 16, fontFamily: 'Outfit_700Bold', marginBottom: 12 },
    habitRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 8,
    },
    habitRowDot: { width: 8, height: 8, borderRadius: 4 },
    habitRowText: { flex: 1, fontSize: 14, fontFamily: 'Outfit_600SemiBold' },
    categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    categoryChip: {
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
    },
    categoryChipText: { fontSize: 13, fontFamily: 'Outfit_600SemiBold' },
    modalFooter: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 12, borderTopWidth: 1 },
    applyFullBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 20, gap: 10,
    },
    applyFullBtnText: { color: '#FFF', fontSize: 17, fontFamily: 'Outfit_700Bold' },
});
