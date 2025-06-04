import React, { useState } from 'react';
import axiosInstance from '../constants/axiosInstance';
import { API_ENDPOINTS } from '../constants/api';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  
  const router = useRouter();

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        tel: phoneNumber,
        password: password,
      });

    const { access_token, refresh_token, user } = response.data;

    await AsyncStorage.setItem('access_token', access_token);
    await AsyncStorage.setItem('refresh_token', refresh_token);
    await AsyncStorage.setItem('user_id', user.toString());

    Alert.alert('Thành công', 'Đăng nhập thành công!');
    router.push('/screen/homepage');
  } catch (error: any) {
    console.error('Login error:', error?.response?.data || error.message);
    Alert.alert('Đăng nhập thất bại', error?.response?.data?.message || 'Đã có lỗi xảy ra');
  }
};

  const goToRegister = () => {
    router.push('/screen/register');
  };

  return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
            
            <View style={styles.content}>
            <Image
                source={require('../../assets/images/logo.png')}
                style={styles.titleImage}
                resizeMode="contain"
            />

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

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
            </TouchableOpacity>

            <View style={styles.signupRow}>
                <Text style={styles.normalText}>Không có tài khoản? </Text>
                <TouchableOpacity onPress={goToRegister}>
                <Text style={styles.linkText}>Đăng ký</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.linkText2}>LIÊN HỆ</Text>
            <View style={styles.emailRow}>
                <Icon name="envelope" size={20} color="#34A262" style={styles.emailIcon} />
                <Text style={styles.email}>recycleapp@gmail.com</Text>
            </View>
            </View>

            {/* Footer image here */}
            <Image
            source={require('../../assets/images/footer.png')} // change to your actual image
            style={styles.footerImage}
            resizeMode="contain"
            />
        </View>
        </TouchableWithoutFeedback>

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
  linkText2: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    fontWeight: 'bold',
  },
  email: {
    color: '#34A262',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  emailIcon: {
    marginRight: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  footerImage: {
    width: '100%',
    alignSelf: 'center',
  },
  
  
});
