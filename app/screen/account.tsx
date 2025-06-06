import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../constants/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Pressable, Modal, Alert } from 'react-native';
import MenuBar from '../components/menubar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import DateTimePicker from '@react-native-community/datetimepicker';



export default function HomeScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1));
  const [originalUser, setOriginalUser] = useState<any>(null);
  
  const [secureText, setSecureText] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isEditable, setIsEditable] = useState(false);

  const [changesMade, setChangesMade] = useState(false); // Track if any change has been made

  const selectGender = (selectedGender: string) => {
    setGender(selectedGender);
    setModalVisible(false);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  //edit account
  //const [day, month, year] = data[2].split('/').map(Number);
  //const originalBirthDate = new Date(year, month - 1, day);

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');
      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy token.');
        return;
      }

      const response = await axiosInstance.get(API_ENDPOINTS.USER.GET_BY_ID(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data;

      setName(user.name || '');
      setGender(user.gender || '');
      setPhoneNumber(user.tel || '');
      setEmail(user.email || '');
      setLocation(user.address || '');
      setBirthDate(new Date(user.dob || '2000-01-01'));
      setPassword(user.password || '');

      setOriginalUser({
        name: user.name || '',
        gender: user.gender || '',
        tel: user.tel || '',
        email: user.email || '',
        address: user.address || '',
        dob: new Date(user.dob || '2000-01-01'),
        password: user.password || ''
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng.');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleSave = () => {
    if (!checkForChanges()) {
      setIsEditable(false); // No changes, exit edit mode
      return;
    }
    // If there are changes, ask for confirmation before saving
    Alert.alert(
      'Lưu thay đổi',
      'Bạn có chắc chắc muốn lưu thay đổi?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Lưu', onPress: () => saveData() },
      ]
    );
  };

  const saveData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userId = await AsyncStorage.getItem('user_id');
      await axios.put(API_ENDPOINTS.USER.UPDATE(userId), {
        name,
        tel: phoneNumber,
        email,
        address: location,
        dob: birthDate.toISOString(),
        gender,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Thành công', 'Cập nhật thông tin thành công.');
      setIsEditable(false);
      setOriginalUser({
        name,
        gender,
        tel: phoneNumber,
        email,
        address: location,
        dob: birthDate,
        password
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      Alert.alert('Lỗi', 'Cập nhật không thành công.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa tài khoản không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('access_token');
            const userId = await AsyncStorage.getItem('user_id');
            await axios.delete(API_ENDPOINTS.USER.DELETE(userId), {
              headers: { Authorization: `Bearer ${token}` },
          });
            await AsyncStorage.removeItem('access_token');
            router.replace('/screen/login');
          }
        }
      ]
    );
  };

  // Logic to check if there are any changes
  const checkForChanges = () => {
    if (!originalUser) return false;

    return (
      name !== originalUser.name ||
      gender !== originalUser.gender ||
      phoneNumber !== originalUser.tel ||
      email !== originalUser.email ||
      location !== originalUser.address ||
      birthDate.getTime() !== new Date(originalUser.dob).getTime()
    );
  };



  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Image
                source={require('../../assets/images/ava.png')}
                style={styles.avaImage}
              />
        <View style={styles.content}>
        <Text style={styles.inputtitle}>Họ và tên</Text>
              <View style={styles.inputContainer}>
                <Icon name="user" size={20} color="#34A262" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tên"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  editable={isEditable}
                />
              </View>

              <Text style={styles.inputtitle}>Giới tính</Text>
              <View style={styles.inputContainer}>
                <Icon name="venus-mars" size={20} color="#34A262" style={styles.icon} />
                <TouchableOpacity style={styles.input} onPress={() => isEditable && setModalVisible(true)} activeOpacity={isEditable ? 0.7 : 1}>
                  <Text style={{ color: gender ? '#000' : '#999' }}>
                    {gender || 'Giới tính'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    {['Nam', 'Nữ', 'Khác'].map((option) => (
                      <Pressable
                        key={option}
                        style={styles.modalOption}
                        onPress={() => selectGender(option)}
                      >
                        <Text style={styles.modalText}>{option}</Text>
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => setModalVisible(false)}
                      style={[styles.modalOption, { backgroundColor: '#eee' }]}>
                      <Text style={[styles.modalText, { color: '#888' }]}>Hủy</Text>
                    </Pressable>
                  </View>
                </View>
              </Modal>

              <Text style={styles.inputtitle}>Ngày sinh</Text>
              <View style={styles.inputContainer}>
                <Icon name="calendar" size={20} color="#34A262" style={styles.icon} />
                <TouchableOpacity style={styles.input} onPress={() => isEditable && setShowDatePicker(true)}>
                  <Text style={{ color: birthDate ? '#000' : '#999' }}>
                    {birthDate
                      ? `${birthDate.getDate().toString().padStart(2, '0')}/${(birthDate.getMonth() + 1).toString().padStart(2, '0')}/${birthDate.getFullYear()}`
                      : 'Chọn ngày sinh'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={birthDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                  />
                )}
              </View>

              <Text style={styles.inputtitle}>Số điện thoại</Text>
              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color="#34A262" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Số điện thoại"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable ={isEditable}
                />
              </View>
  
              <Text style={styles.inputtitle}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon name="envelope" size={20} color="#34A262" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={isEditable}
                />
              </View>

              <Text style={styles.inputtitle}>Địa chỉ</Text>
              <View style={styles.inputContainer}>
                <Icon name="map-marker" size={20} color="#34A262" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Địa chỉ"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={setLocation}
                  autoCapitalize="none"
                  editable={isEditable}
                />
              </View>
  
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {isEditable ? (
                  <TouchableOpacity style={styles.buttonSave} onPress={handleSave}>
                    <Text style={styles.buttonText}>Lưu</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={styles.buttonEdit} onPress={() => setIsEditable(true)}>
                      <Text style={styles.buttonText}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonDelete} onPress={handleDelete}>
                      <Text style={styles.buttonText}>Xóa tài khoản</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingBottom: 20, 
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  avaImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    marginBottom: 20,
    borderRadius: 8,
  },
  inputtitle: {
    marginBottom: 5,
    color: '#333',
    fontSize: 14,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonEdit: {
    backgroundColor: '#34A262',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 60,
  },
  buttonSave: {
    backgroundColor: '#34A262',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonDelete: {
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
