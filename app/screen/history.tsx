import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import MenuBar from '../components/menubar';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Thêm picker

import { API_ENDPOINTS } from '../constants/api'; // Đảm bảo đường dẫn đúng

type HistoryItem = {
  id: number;
  time: string;
  type: string;
  data: number;
  unit: string;
  deviceId: number;
};

const PAGE_SIZE = 10;

const DATA_TYPES = ['temperature', 'humidity', 'CO2', 'PM25', 'light'];

const TYPE_LABELS: Record<string, string> = {
  temperature: 'Nhiệt độ',
  humidity: 'Độ ẩm',
  CO2: 'CO2',
  PM25: 'PM2.5',
  light: 'Ánh sáng',
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) throw new Error('User ID is missing');

      const params: any = {
        userId,
        page,
        pageSize: PAGE_SIZE,
      };
      if (selectedType) params.type = selectedType;
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await axios.get(API_ENDPOINTS.HISTORY.GET, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setHistory(response.data.data);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error('Error fetching history:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, selectedType, startDate, endDate]);

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (event.type !== 'dismissed' && selectedDate) {
        setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (event.type !== 'dismissed' && selectedDate) {
        setEndDate(selectedDate);
    }
};

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 2 }]}>
        {new Date(item.time).toLocaleString()}
      </Text>
      <Text style={styles.cell}>{TYPE_LABELS[item.type] || item.type}</Text>
      <Text style={styles.cell}>{`${item.data} ${item.unit}`}</Text>
    </View>
  );

  return (
  <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
        <Text style={styles.headerText}>History</Text>
        </View>

    {/* Nội dung chính có thể cuộn, chiếm phần còn lại của màn hình */}
    <View style={{ flex: 1 }}>
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.datePicker}>
          <Text>{startDate ? startDate.toLocaleDateString() : 'Start Date'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.datePicker}>
          <Text>{endDate ? endDate.toLocaleDateString() : 'End Date'}</Text>
        </TouchableOpacity>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedType}
            onValueChange={(itemValue) =>
              setSelectedType(itemValue === '' ? undefined : itemValue)
            }
            style={styles.picker}
          >
            <Picker.Item label="Tất cả loại dữ liệu" value="" />
            {DATA_TYPES.map((type) => (
              <Picker.Item key={type} label={TYPE_LABELS[type]} value={type} />
            ))}
          </Picker>
        </View>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          maximumDate={endDate || undefined}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate || undefined}
          maximumDate={new Date()}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />
      ) : (
        <>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}>Thời gian</Text>
            <Text style={[styles.cell, { fontWeight: 'bold' }]}>Loại</Text>
            <Text style={[styles.cell, { fontWeight: 'bold' }]}>Giá trị</Text>
          </View>

          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20 }}>Không có dữ liệu</Text>
            }
          />

          <View style={styles.pagePickerContainer}>
  <Text style={{ marginRight: 10 }}>Chọn trang:</Text>
  <Picker
    selectedValue={page}
    style={styles.pagePicker}
    onValueChange={(itemValue) => setPage(itemValue)}
    mode="dropdown" // hoặc "dialog" tùy nền tảng
  >
    {[...Array(Math.ceil(total / PAGE_SIZE)).keys()].map((i) => {
      const pageNum = i + 1;
      return <Picker.Item key={pageNum} label={`Trang ${pageNum}`} value={pageNum} />;
    })}
  </Picker>
</View>
        </>
      )}
    </View>

    {/* Menu bar luôn ở dưới */}
    <View style={styles.footer}>
      <MenuBar />
    </View>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  header: {
    backgroundColor: '#90EE90',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  datePicker: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1.5,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 5,
    height: 50,
  },
    headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerRow: { backgroundColor: '#f0f0f0' },
  cell: { flex: 1, textAlign: 'center' },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  pageButton: {
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: '#aaa',
  },
  pageInfo: {
    fontWeight: 'bold',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  pagePickerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 10,
},

pagePicker: {
  width: 150,
  height: 60,
},
});
