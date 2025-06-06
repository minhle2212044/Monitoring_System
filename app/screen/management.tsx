import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MenuBar from '../components/menubar';
import { useState, useEffect } from 'react';
import axiosInstance from '../constants/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter, RelativePathString } from 'expo-router';

export default function Management() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');

      if (!token || !userId) {
        Alert.alert('Lỗi', 'Không tìm thấy token hoặc userId');
        return;
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.USER.GET_BY_ID(userId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserInfo(response.data);
    } catch (error) {
      console.error('Lỗi lấy thông tin người dùng:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      {
        text: 'Huỷ',
        style: 'cancel',
      },
      {
        text: 'Đăng xuất',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('access_token');
            const userId = await AsyncStorage.getItem('user_id');

            if (!token || !userId) {
              Alert.alert('Lỗi', 'Không tìm thấy token hoặc userId');
              return;
            }

            // Gọi API đăng xuất
            await axiosInstance.post(
              API_ENDPOINTS.AUTH.SIGNOUT,
              { userId: Number(userId) },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // Xoá local storage và quay lại màn hình đăng nhập
            await AsyncStorage.clear();
            router.replace('/screen/login');
          } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            Alert.alert('Lỗi', 'Đăng xuất thất bại, vui lòng thử lại.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const managementOptions = [
    { title: 'Thông tin tài khoản', icon: 'user', target: '/screen/account' },
    { title: 'Thông báo', icon: 'bell', target: '/screen/notification' },
    { title: 'Lịch sử dữ liệu', icon: 'history', target: '/screen/history' },
    { title: 'Đăng xuất', icon: 'sign-out', isLogout: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ImageBackground
          source={require('../../assets/images/background2.png')}
          style={styles.bgImage}
          resizeMode="cover"
        >
          {userInfo && (
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text style={styles.userId}>ID: {userInfo.id}</Text>
            </View>
          )}
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {managementOptions.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (item.isLogout) {
                handleLogout();
              } else if (item.target) {
                router.push(item.target as RelativePathString);
              }
            }}
          >
            <View style={styles.manageCard}>
              <Icon
                name={item.icon}
                size={20}
                color={item.isLogout ? '#FF0000' : '#067F38'}
              />
              <Text
                style={[
                  styles.textCard,
                  item.isLogout && { color: '#FF0000' },
                ]}
              >
                {item.title}
              </Text>
              <Icon
                name="arrow-right"
                size={20}
                color={item.isLogout ? '#FF0000' : '#067F38'}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <MenuBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    width: '100%',
    height: 220,
  },
  bgImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#005622',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#005622',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  manageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  textCard: {
    fontSize: 16,
    color: '#000',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});
