import { Stack, useRouter } from 'expo-router';
import "./global.css";
import { Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {

  const router = useRouter();

  return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar style="dark" backgroundColor="#E5F7EB" translucent={false} />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screen/login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screen/register"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screen/home"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screen/activity"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
  );
}