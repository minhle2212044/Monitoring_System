// components/HeaderTitle.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderTitleProps {
  title: string;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 20,
    backgroundColor: '#067F38', // màu xanh lá đậm
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default HeaderTitle;
