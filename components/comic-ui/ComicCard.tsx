import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  time: string;
  badgeColor?: string;
}

export function ComicCard({ title, description, category, imageUrl, time, badgeColor }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CategoryBadge category={category} color={badgeColor} />
        <Text style={styles.time}>{time}</Text>
      </View>
      
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.validationButton}>
          <Text style={styles.footerText}>BANTU VALIDASI →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#000',
    padding: 18,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  time: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#000',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    borderStyle: 'dashed',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    color: '#000',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 3,
    borderTopColor: '#000',
    paddingTop: 15,
  },
  validationButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  footerText: {
    fontWeight: '900',
    fontSize: 14,
    color: '#000',
  }
});
