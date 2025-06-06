import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuBar from '../components/menubar';
import axios from 'axios';
import HeaderTitle from '../components/HeaderTitle';
import { API_ENDPOINTS } from '../constants/api';

type SensorItem = {
  label: string;
  value: string;
  icon: string;
};
const defaultSensorData: SensorItem[] = [
  { label: 'Temperature', value: '--', icon: '🌡️' },
  { label: 'Humidity', value: '--', icon: '💧' },
  { label: 'CO2', value: '--', icon: '🟢' },
  { label: 'PM2.5', value: '--', icon: '🌫️' },
];
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 40) / 2;
export default function HomeScreen() {
  const [sensorData, setSensorData] = useState<SensorItem[]>(defaultSensorData);

  const fetchSensorData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');

      const response = await axios.get(API_ENDPOINTS.COREIOT.GET_LOCAL_DATA(userId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.error('No data received from CoreIoT');
        return;
      }
      const deviceList = response.data;
      if (deviceList.length === 0 || !deviceList[0].data) return;

      const dataMap = deviceList[0].data.reduce((acc: Record<string, string>, item: any) => {
        acc[item.type] = `${item.data} ${item.unit}`;
        return acc;
      }, {});
      const mappedData: SensorItem[] = [
        { label: 'Temperature', value: dataMap.temperature || '--', icon: '🌡️' },
        { label: 'Humidity', value: dataMap.humidity || '--', icon: '💧' },
        { label: 'CO2', value: dataMap.CO2  || '--', icon: '🟢' },
        { label: 'PM2.5', value: dataMap.PM25  || '--', icon: '🌫️' },
      ];
      setSensorData(mappedData);
    } catch (error: any) {
      console.error('Error fetching sensor data:', error.message);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 5000); // Mỗi 5 giây

    return () => clearInterval(intervalId); // Cleanup khi component unmount
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Air Quality Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {sensorData.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          ))}
        </View>
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
    backgroundColor: '#f0f8ff',
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
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  card: {
    width: cardWidth,
    height: 160,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  icon: {
    fontSize: 32,
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginTop: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#1e90ff',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});
