import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  category: string;
  color?: string;
}

export function CategoryBadge({ category, color = '#FFFF00' }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{category.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
});
