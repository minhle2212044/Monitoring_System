import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView, 
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';
import MenuBar from '../components/menubar';
import Icon from 'react-native-vector-icons/FontAwesome5';

type Activity = {
  id: number;
  title: string;
  suggestion: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
};

const PRIORITY_ORDER = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const getIconByTitle = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('tưới') || lower.includes('nước')) return 'tint'; // 💧
  if (lower.includes('môi trường') || lower.includes('cây')) return 'leaf'; // 🌿
  if (lower.includes('thể thao') || lower.includes('chạy') || lower.includes('vận động')) return 'running'; // 🏃
  if (lower.includes('ngoài trời') || lower.includes('nắng') || lower.includes('trời')) return 'cloud-sun'; // 🌤
  return 'lightbulb'; // Mặc định
};

const categories = [
  { key: 'outdoor', label: 'Ngoài trời', icon: 'cloud-sun', color: ['#A2D5F2', '#07689F'] },
  { key: 'watering', label: 'Tưới cây', icon: 'tint', color: ['#A1E3D8', '#3AB4F2'] },
  { key: 'sports', label: 'Thể thao', icon: 'running', color: ['#FFB347', '#FF6961'] },
  { key: 'environment', label: 'Môi trường', icon: 'leaf', color: ['#ACE1AF', '#228B22'] },
];

export default function ActivityScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filterByCategory = (activity: Activity) => {
    if (!selectedCategory) return true;
    const map: Record<string, string[]> = {
      outdoor: ['Hoạt động ngoài trời'],
      watering: ['Tưới nước cho cây'],
      sports: ['Hoạt động thể thao'],
      environment: ['Trồng cây', 'Làm vườn'],
    };
  return map[selectedCategory]?.includes(activity.title);
  };
  const fetchSuggestedActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User ID is missing');

      const response = await axios.get(API_ENDPOINTS.ACTIVITY.GET_SUGGESTED(userId), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedActivities = response.data.data.sort(
        (a: Activity, b: Activity) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      );
      setActivities(sortedActivities);
    } catch (error: any) {
      console.error('Error fetching suggested activities:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestedActivities();
  }, []);

  const renderItem = ({ item }: { item: Activity }) => (
    <View style={[styles.card, styles[`priority_${item.priority}`]]}>
      <View style={styles.cardHeader}>
        <Icon
          name={getIconByTitle(item.title)}
          size={22}
          color="#007aff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.description}>{item.suggestion}</Text>
      <Text style={styles.priority}>{item.priority}</Text>
    </View>
  );

  return (
  <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Suggested Activities</Text>
    </View>

    {/* BƯỚC 3: Thanh chọn loại */}
    <View style={styles.categoryContainer}>
  {categories.map((cat) => (
    <TouchableOpacity
      key={cat.key}
      style={[
        styles.categoryItem,
        selectedCategory === cat.key && { backgroundColor: cat.color[0] },
      ]}
      onPress={() =>
        setSelectedCategory(cat.key === selectedCategory ? null : cat.key)
      }
    >
      <Icon name={cat.icon} size={20} color="#fff" />
      <Text style={styles.categoryLabel}>{cat.label}</Text>
    </TouchableOpacity>
  ))}
</View>

    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007aff" />
        </View>
      ) : (
        // BƯỚC 4: Lọc danh sách hoạt động
        <FlatList
          data={activities.filter(filterByCategory)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>

    <View style={styles.footer}>
      <MenuBar />
    </View>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#90EE90',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
  priority: {
    marginTop: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#888',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  priority_HIGH: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  priority_MEDIUM: {
    borderLeftWidth: 5,
    borderLeftColor: '#f1c40f',
  },
  priority_LOW: {
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: '#ccc',
    padding: 8,
    borderRadius: 10,
    width: '23%',
  },
  categoryLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});
