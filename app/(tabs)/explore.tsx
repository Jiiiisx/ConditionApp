import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal, 
  Text, 
  ScrollView 
} from 'react-native';
import MapView, { LongPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { IncidentMarker, IncidentData, IncidentCategory } from '@/components/incident-marker';
import { supabase } from '@/lib/supabase';
import { ReportModal } from '@/components/comic-ui/ReportModal';

export default function ExploreScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<IncidentData[] | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);

  const fetchIncidents = async () => {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('status', 'ACTIVE');

    if (data) {
      const formattedData: IncidentData[] = data.map(item => ({
        id: item.id,
        category: item.category as IncidentCategory,
        priorityScore: item.priority_score,
        reportCount: 1,
        coordinate: {
          latitude: item.latitude,
          longitude: item.longitude,
        },
      }));
      setIncidents(formattedData);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
      
      await fetchIncidents();
      setLoading(false);

      const channel = supabase
        .channel('public:incidents_explore')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
          fetchIncidents();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    })();
  }, []);

  const handleMapLongPress = (e: LongPressEvent) => {
    setSelectedLocation(e.nativeEvent.coordinate);
    setReportModalVisible(true);
  };

  const getClusters = () => {
    const clusters: IncidentData[][] = [];
    const threshold = 0.005;

    incidents.forEach(incident => {
      let foundCluster = clusters.find(cluster => {
        const first = cluster[0];
        const dist = Math.sqrt(
          Math.pow(incident.coordinate.latitude - first.coordinate.latitude, 2) +
          Math.pow(incident.coordinate.longitude - first.coordinate.longitude, 2)
        );
        return dist < threshold;
      });

      if (foundCluster) {
        foundCluster.push(incident);
      } else {
        clusters.push([incident]);
      }
    });

    return clusters.map(group => {
      const sorted = [...group].sort((a, b) => b.priorityScore - a.priorityScore);
      return {
        hero: sorted[0],
        all: sorted,
        count: group.length
      };
    });
  };

  if (loading && !location) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /><Text style={styles.loadingText}>Mencari Lokasi...</Text></View>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || -6.2,
          longitude: location?.coords.longitude || 106.8,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        onLongPress={handleMapLongPress}
      >
        {getClusters().map((cluster, idx) => (
          <IncidentMarker 
            key={idx}
            incident={cluster.hero}
            extraBadge={cluster.count > 1 ? `+${cluster.count - 1}` : undefined}
            onPress={() => setSelectedCluster(cluster.all)}
          />
        ))}
      </MapView>

      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapButton} onPress={() => fetchIncidents()}>
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.mapButton, { marginTop: 15, backgroundColor: '#FF3B30' }]}
          onPress={() => {
            setSelectedLocation(undefined);
            setReportModalVisible(true);
          }}
        >
          <Ionicons name="megaphone" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>TEKAN LAMA PETA UNTUK LAPOR LOKASI SPESIFIK</Text>
      </View>

      <Modal visible={selectedCluster !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailContent}>
            <View style={styles.header}>
              <Text style={styles.detailTitle}>AREA INI ({selectedCluster?.length})</Text>
              <TouchableOpacity onPress={() => setSelectedCluster(null)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {selectedCluster?.map((inc) => (
                <View key={inc.id} style={styles.incidentRow}>
                  <View style={[styles.iconBox, { backgroundColor: inc.category === 'FIRE' ? '#FF3B30' : inc.category === 'ACCIDENT' ? '#FF9500' : '#FFCC00' }]}>
                    <Ionicons name={inc.category === 'FIRE' ? 'flame' : inc.category === 'ACCIDENT' ? 'warning' : 'car'} size={24} color="white" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.rowTitle}>{inc.category}</Text>
                    <Text style={styles.rowSubtitle}>KEJADIAN AKTIF</Text>
                  </View>
                  <TouchableOpacity style={styles.rowAction}>
                    <Ionicons name="chevron-forward" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ReportModal 
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSuccess={fetchIncidents}
        initialLocation={selectedLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, fontWeight: '900', fontStyle: 'italic' },
  mapControls: { position: 'absolute', top: 60, right: 20 },
  mapButton: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  hintContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
  },
  hintText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  detailContent: { 
    backgroundColor: 'white', 
    padding: 25, 
    borderRadius: 30, 
    borderWidth: 4, 
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center' },
  detailTitle: { fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  incidentRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    marginBottom: 15, 
    borderWidth: 3, 
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  iconBox: { width: 45, height: 45, borderRadius: 12, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontWeight: '900', fontSize: 16, textTransform: 'uppercase' },
  rowSubtitle: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  rowAction: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }
});