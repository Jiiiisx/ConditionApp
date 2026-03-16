import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export type IncidentCategory = 'FIRE' | 'ACCIDENT' | 'TRAFFIC' | 'OTHER';

export interface IncidentData {
  id: string;
  category: IncidentCategory;
  priorityScore: number;
  reportCount: number;
  incidentCount?: number; // Jumlah kejadian yang di-cluster
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

interface Props {
  incident: IncidentData;
  onPress?: () => void;
  extraBadge?: string;
}

const getCategoryColor = (category: IncidentCategory) => {
  switch (category) {
    case 'FIRE': return '#FF3B30';
    case 'ACCIDENT': return '#FF9500';
    case 'TRAFFIC': return '#FFCC00';
    default: return '#007AFF';
  }
};

const getCategoryIcon = (category: IncidentCategory): any => {
  switch (category) {
    case 'FIRE': return 'flame';
    case 'ACCIDENT': return 'warning';
    case 'TRAFFIC': return 'car';
    default: return 'information-circle';
  }
};

export function IncidentMarker({ incident, onPress, extraBadge }: Props) {
  const color = getCategoryColor(incident.category);
  const iconName = getCategoryIcon(incident.category);

  const baseSize = 45;
  const size = Math.min(baseSize + (incident.reportCount * 2), 70);

  return (
    <Marker 
      coordinate={incident.coordinate} 
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={incident.priorityScore}
    >
      <View style={[styles.markerContainer, { width: size + 10, height: size + 10 }]}>
        {/* White "Sticker" Outline */}
        <View style={[styles.stickerOutline, { width: size, height: size }]} />
        
        {/* Main Marker Circle */}
        <View style={[styles.pin, { backgroundColor: color, width: size - 6, height: size - 6 }]}>
          <Ionicons name={iconName} size={(size - 6) * 0.5} color="white" />
        </View>

        {(incident.reportCount > 1 || extraBadge) && (
          <View style={[styles.badge, extraBadge ? { backgroundColor: '#000' } : { backgroundColor: '#FFD700' }]}>
            <Text style={[styles.badgeText, extraBadge ? { color: 'white' } : { color: '#000' }]}>
              {extraBadge || incident.reportCount}
            </Text>
          </View>
        )}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerOutline: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#000',
    // Hard shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  pin: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
});
