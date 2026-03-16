import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton } from './ActionButton';
import { supabase } from '@/lib/supabase';
import * as Location from 'expo-location';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLocation?: { latitude: number; longitude: number };
}

type Category = 'FIRE' | 'ACCIDENT' | 'TRAFFIC' | 'OTHER';

const CATEGORIES: { label: string; value: Category; icon: any; color: string }[] = [
  { label: 'KEBAKARAN', value: 'FIRE', icon: 'flame', color: '#FF3B30' },
  { label: 'KECELAKAAN', value: 'ACCIDENT', icon: 'warning', color: '#FF9500' },
  { label: 'KEMACETAN', value: 'TRAFFIC', icon: 'car', color: '#FFCC00' },
  { label: 'LAINNYA', value: 'OTHER', icon: 'help-circle', color: '#007AFF' },
];

export function ReportModal({ visible, onClose, onSuccess, initialLocation }: Props) {
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Eits!', 'Pilih kategori dulu dong!');
      return;
    }

    setLoading(true);
    try {
      let location = initialLocation;
      
      if (!location) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentPos = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentPos.coords.latitude,
            longitude: currentPos.coords.longitude,
          };
        } else {
          // Fallback to a default location if permission denied and no initial location
          location = { latitude: -6.2088, longitude: 106.8456 }; 
        }
      }

      // 1. Insert into incidents table
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .insert([
          { 
            category, 
            latitude: location.latitude, 
            longitude: location.longitude,
            priority_score: 50,
            status: 'ACTIVE'
          }
        ])
        .select()
        .single();

      if (incidentError) throw incidentError;

      // 2. Insert into reports table (Simplified for prototype: using a dummy user_id)
      // In a real app, we would get the actual user ID from Supabase Auth
      const dummyUserId = '00000000-0000-0000-0000-000000000000'; // Replace with real ID if possible
      
      // Attempt to get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || dummyUserId;

      const { error: reportError } = await supabase
        .from('reports')
        .insert([
          {
            incident_id: incident.id,
            user_id: userId,
            description: description,
            media_type: 'IMAGE', // Placeholder
          }
        ]);

      if (reportError) {
          // If profile doesn't exist for dummy/new user, this might fail
          // For prototype v1, we focus on the incident being created
          console.warn('Report entry failed, but incident was created:', reportError.message);
      }

      Alert.alert('BOOM!', 'Laporan kamu sudah terkirim!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      Alert.alert('Waduh!', error.message || 'Gagal mengirim laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCategory(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>LAPOR KEJADIAN!</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              <Text style={styles.sectionLabel}>APA YANG TERJADI?</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: cat.color },
                      category === cat.value && styles.selectedCategory
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Ionicons name={cat.icon} size={32} color="white" />
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    {category === cat.value && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-sharp" size={16} color="black" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>CERITAKAN DETAILNYA</Text>
              <TextInput
                style={styles.input}
                placeholder="Apa yang kamu lihat? (misal: Api besar di ruko...)"
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                blurOnSubmit={true}
              />

              <Text style={styles.sectionLabel}>BUKTI VISUAL (OPSIONAL)</Text>
              <TouchableOpacity style={styles.mediaPlaceholder}>
                <Ionicons name="camera" size={40} color="#999" />
                <Text style={styles.mediaPlaceholderText}>AMBIL FOTO / VIDEO</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.footer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF3B30" />
                  <Text style={styles.loadingText}>MENGIRIM...</Text>
                </View>
              ) : (
                <ActionButton 
                  title="KIRIM LAPORAN! 🚀" 
                  onPress={handleSubmit} 
                  color="#FF3B30" // Gunakan merah agar sangat kontras
                  style={{ width: '100%' }}
                  textStyle={{ color: '#fff', fontSize: 18 }}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderWidth: 4,
    borderColor: '#000',
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
    marginTop: 10,
    color: '#666',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    position: 'relative',
  },
  selectedCategory: {
    transform: [{ scale: 0.95 }, { translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 1, height: 1 },
  },
  categoryLabel: {
    color: 'white',
    fontWeight: '900',
    marginTop: 8,
    fontSize: 12,
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    padding: 15,
    fontSize: 16,
    fontWeight: 'bold',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  mediaPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#000',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholderText: {
    fontWeight: '900',
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  footer: {
    marginTop: 15,
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontWeight: '900',
    fontSize: 16,
    fontStyle: 'italic',
  }
  });