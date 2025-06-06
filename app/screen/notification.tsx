import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../constants/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { useRouter } from 'expo-router';

type Notification = {
  id: number;
  time: string;
  message: string;
  type: string;
  userId: number;
};

const FILTERS = {
  ALL: 'Tất cả',
  UNREAD: 'Chưa đọc',
  READ: 'Đã đọc',
};

export default function NotificationScreen()  {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState(new Set()); // lưu id thông báo đã đọc tạm thời trên client
  const router = useRouter();

  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      setUserId(id);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await axiosInstance.get(API_ENDPOINTS.NOTICE.GET_BY_USER(userId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy thông báo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (noticeId: number) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axiosInstance.post(
        API_ENDPOINTS.NOTICE.MARK_AS_READ(noticeId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReadIds(prev => new Set(prev).add(noticeId));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc');
      console.error(error);
    }
  };

  // Xác định thông báo đã đọc dựa vào set readIds
  const isRead = (notice: Notification) => readIds.has(notice.id);
  const filteredNotifications = notifications.filter((n) => {
    if (filter === FILTERS.ALL) return true;
    if (filter === FILTERS.UNREAD) return !isRead(n);
    if (filter === FILTERS.READ) return isRead(n);
  });

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.noticeCard,
        isRead(item) ? styles.readNotice : styles.unreadNotice,
      ]}
      onPress={() => {
        if (!isRead(item)) {
          markAsRead(item.id);
        }
      }}
    >
      <Text style={styles.noticeTitle}>{item.type}</Text>
      <Text style={styles.noticeContent}>{item.message}</Text>
      <Text style={styles.noticeDate}>{new Date(item.time).toLocaleString()}</Text>
      {!isRead(item) && <Text style={styles.markReadText}>(Chưa đọc - bấm để đánh dấu)</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {Object.values(FILTERS).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#004d1a" style={{ marginTop: 20 }} />
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.noNotice}>
          <Text style={styles.noNoticeText}>Chưa có thông báo</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#004d1a',
  },
  filterButtonActive: {
    backgroundColor: '#004d1a',
  },
  filterText: {
    color: '#004d1a',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  unreadNotice: {
    backgroundColor: '#e6f4ea',
    borderColor: '#004d1a',
  },
  readNotice: {
    backgroundColor: '#f7f7f7',
    borderColor: '#ccc',
  },
  noticeTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
    color: '#004d1a',
  },
  noticeContent: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  noticeDate: {
    fontSize: 12,
    color: '#999',
  },
  markReadText: {
    marginTop: 6,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#d9534f',
  },
  noNotice: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noNoticeText: {
    fontSize: 18,
    color: '#999',
  },
});
