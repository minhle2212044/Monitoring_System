import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MenuBar from '../components/menubar';
import { useRouter } from 'expo-router';

export default function ShoppingBagSuccess() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.checkCircle}>
          <Icon name="check" size={48} color="#fff" />
        </View>
        <Text style={styles.successText}>
          Đơn đổi thưởng của bạn đã được xác nhận. Tái chế ngay để tích thêm điểm thưởng nào!
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/screen/login')}>
          <Text style={styles.backButtonText}>TRỞ VỀ</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <MenuBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#067F38',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    marginHorizontal: 30,
  },
  backButton: {
    backgroundColor: '#B5EACB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 60,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
}); 