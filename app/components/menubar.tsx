import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter, usePathname } from 'expo-router';

export default function MenuBar() {
  const router = useRouter();
  const pathname = usePathname() as string;

  const menuItems: { icon: string; route: string }[] = [
    { icon: 'home', route: '/screen/home' },
    { icon: 'line-chart', route: '/screen/activity' },
    { icon: 'history', route: '/screen/history' },
    { icon: 'user', route: '/screen/management' },
  ];

  return (
    <View style={styles.menuContainer}>
      {menuItems.map((item, index) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route as never)}
          >
            <Icon
              name={item.icon}
              size={24}
              color={isActive ? 'green' : '#444'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#ffffff',
  },
  menuItem: {
    alignItems: 'center',
  },
});
