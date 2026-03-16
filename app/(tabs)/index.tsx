import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { ComicCard } from '@/components/comic-ui/ComicCard';
import { ActionButton } from '@/components/comic-ui/ActionButton';
import { ReportModal } from '@/components/comic-ui/ReportModal';

export default function FeedScreen() {
  const [activeTab, setActiveTab] = useState<'LOCAL' | 'CITY'>('LOCAL');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    let query = supabase
      .from('incidents')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (activeTab === 'LOCAL') {
      query = query.limit(10);
    }

    const { data, error } = await query;

    if (data) {
      setIncidents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();

    const channel = supabase
      .channel('public:incidents_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchFeed();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const filteredIncidents = incidents.filter(item => 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'FIRE': return '#FF3B30';
      case 'ACCIDENT': return '#FF9500';
      case 'TRAFFIC': return '#FFCC00';
      default: return '#007AFF';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 1) return 'Baru saja';
    if (diffInMins < 60) return `${diffInMins}m yang lalu`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}j yang lalu`;
    return then.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!isSearchVisible ? (
          <>
            <Text style={styles.logo}>CONDITION</Text>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setSearchVisible(true)}
            >
              <Ionicons name="search" size={24} color="black" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="#666" style={{ marginLeft: 10 }} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Cari kejadian..."
              autoFocus
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => { setSearchVisible(false); setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={20} color="#666" style={{ marginRight: 10 }} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'LOCAL' && styles.activeTab]} 
          onPress={() => setActiveTab('LOCAL')}
        >
          <Text style={[styles.tabText, activeTab === 'LOCAL' && styles.activeTabText]}>Sekitar Saya</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'CITY' && styles.activeTab]} 
          onPress={() => setActiveTab('CITY')}
        >
          <Text style={[styles.tabText, activeTab === 'CITY' && styles.activeTabText]}>Kota Ini</Text>
        </TouchableOpacity>
      </View>

      {loading && incidents.length === 0 ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
      ) : (
        <FlatList
          data={filteredIncidents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ComicCard 
              title={item.category}
              description={`Laporan ${item.category} terdeteksi di koordinat ${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}. Warga harap waspada.`}
              category={item.category}
              badgeColor={getCategoryColor(item.category)}
              time={getTimeAgo(item.created_at)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Belum ada laporan terbaru.</Text>
            </View>
          }
          onRefresh={fetchFeed}
          refreshing={loading}
        />
      )}

      <View style={styles.fabContainer}>
        <ActionButton 
          title="BOOM! LAPOR" 
          onPress={() => setReportModalVisible(true)} 
          color="#FF3B30"
          style={{ width: 220, height: 60 }}
          textStyle={{ fontSize: 20 }}
        />
      </View>

      <ReportModal 
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSuccess={fetchFeed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    height: 80,
  },
  logo: { fontSize: 32, fontWeight: '900', letterSpacing: -2, fontStyle: 'italic' },
  headerButton: { 
    width: 45, 
    height: 45, 
    borderRadius: 12, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#000', 
    shadowColor: '#000', 
    shadowOffset: { width: 3, height: 3 }, 
    shadowOpacity: 1, 
    shadowRadius: 0 
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#000',
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  tab: { marginRight: 20, paddingBottom: 5, borderBottomWidth: 5, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#000' },
  tabText: { fontSize: 18, fontWeight: '900', color: '#BBB', textTransform: 'uppercase' },
  activeTabText: { color: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 120 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', marginTop: 10, fontWeight: '900', color: '#ccc', fontSize: 18, textTransform: 'uppercase' },
  fabContainer: { position: 'absolute', bottom: 30, width: '100%', alignItems: 'center' }
});