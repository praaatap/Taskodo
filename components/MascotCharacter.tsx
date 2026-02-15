
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MascotMood } from '@/context/TaskContext';

type MascotProps = {
  mood: MascotMood;
  message: string;
};

const MOODS = {
  idle: { face: '●‿●', color: '#6366F1', label: 'Flow Assistant' },
  nudge: { face: '●︿●', color: '#E11D48', label: 'Action Needed' },
  celebrate: { face: '●◡●', color: '#059669', label: 'Amazing Work' },
};

export function MascotCharacter({ mood, message }: MascotProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const currentMood = MOODS[mood] || MOODS.idle;

  useEffect(() => {
    scale.value = 1;
    rotation.value = 0;
    translateY.value = 0;

    switch (mood) {
      case 'celebrate':
        scale.value = withSequence(withTiming(1.2, { duration: 180 }), withSpring(1));
        rotation.value = withRepeat(
          withSequence(withTiming(-5, { duration: 100 }), withTiming(5, { duration: 100 })),
          4,
          true
        );
        break;
      case 'nudge':
        translateY.value = withRepeat(
          withSequence(withTiming(-4, { duration: 150 }), withTiming(4, { duration: 150 })),
          -1,
          true
        );
        break;
      default:
        translateY.value = withRepeat(
          withSequence(withTiming(-3, { duration: 2000 }), withTiming(0, { duration: 2000 })),
          -1,
          true
        );
    }
  }, [mood, rotation, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mascotBody, animatedStyle, { borderColor: currentMood.color }]}>
        <Text style={[styles.face, { color: currentMood.color }]}>{currentMood.face}</Text>
      </Animated.View>
      <View style={styles.bubble}>
        <Text style={[styles.bubbleLabel, { color: currentMood.color }]}>{currentMood.label}</Text>
        <Text style={styles.bubbleText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 24,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  mascotBody: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  face: {
    fontSize: 16,
    fontWeight: '700',
  },
  bubble: {
    flex: 1,
  },
  bubbleLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 20,
  },
});
