import React, { useState } from 'react';
import axiosInstance from '../constants/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, 
        ScrollView, KeyboardAvoidingView, Platform, Modal, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined); // New state for birthday

  const [secureText, setSecureText] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectGender = (selectedGender: string) => {
    setGender(selectedGender);
    setModalVisible(false);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  const router = useRouter();

  const handleRegister = async () => {

    console.log('Name:', name);
    console.log('Gender:', gender);
    console.log('Phone Number:', phoneNumber);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Birth Date:', birthDate?.toISOString());

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;
  
    if (!name || !gender || !phoneNumber || !email || !password || !birthDate || !location) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
  
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại đúng định dạng.');
      return;
    }
  
    if (!emailRegex.test(email)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập đúng định dạng email.');
      return;
    }
  
    if (password.length < 6) {
      Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: email,
        password: password,
        name: name,
        tel: phoneNumber,
        dob: birthDate,
        address: location,
        gender: gender,
        //Nếu mở rộng để có phần của bên thu gom cần truyền role = "COLLECTOR"
      });

      Alert.alert('Thành công', 'Đăng ký thành công, hãy đăng nhập lại.', [
        {
          text: 'OK',
          onPress: () => router.push('/screen/login'),
        },
      ]);
    } catch (error: any) {
      console.error('Register error:', error?.response?.data || error.message);
      Alert.alert('Đăng ký thất bại', error?.response?.data?.message || 'Đã có lỗi xảy ra');
    }
  };

  const goToLogin = () => {
    router.push('/screen/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss(); 
            setShowDatePicker(false);}}>
        <View style={styles.container}>
          
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.titleImage}
            resizeMode="contain"
          />
  
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
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
                />
              </View>

              <Text style={styles.inputtitle}>Giới tính</Text>
              <View style={styles.inputContainer}>
                <Icon name="venus-mars" size={20} color="#34A262" style={styles.icon} />
                <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
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
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: birthDate ? '#000' : '#999' }}>
                    {birthDate ? birthDate.toLocaleDateString() : 'Chọn ngày sinh'}
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
                />
              </View>
  
              <Text style={styles.inputtitle}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#34A262" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                  <Icon name={secureText ? "eye" : "eye-slash"} size={20} />
                </TouchableOpacity>
              </View>
  
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>ĐĂNG KÝ</Text>
              </TouchableOpacity>
  
              <View style={styles.signupRow}>
                <Text style={styles.normalText}>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={goToLogin}>
                  <Text style={styles.linkText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  titleImage: {
    width: '65%',
    height: '15%',
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 50,
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
  button: {
    backgroundColor: '#34A262',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  normalText: {
    color: '#333',
    fontSize: 14,
  },
  linkText: {
    color: '#34A262',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  scrollContainer: {
    paddingBottom: 40,
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
});
