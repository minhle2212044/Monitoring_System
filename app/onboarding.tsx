
import React, { useRef, useState } from 'react';
import {View, Text, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent,} from 'react-native';
import { useRouter } from "expo-router";

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    image: require('../assets/images/favicon.png'),
    title: '',
    description: '',
  },
  {
    key: '2',
    image: require('../assets/images/favicon.png'),
    title: '',
    description: '',
  },
  {
    key: '3',
    image: require('../assets/images/favicon.png'),
    title: '',
    description: '',
  },
];

const OnboardingScreen = ({ onDone }: { onDone: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const router = useRouter();
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
        router.push("./screen/login");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>
                {item.key === '2' ? (
                    <>
                    <Text style={{ color: '#000' }}>Why</Text>
                    <Text style={{ color: '#067F38' }}> Recycle</Text>
                    <Text style={{ color: '#000' }}>?</Text>
                    </>
                ) : (
                    item.title
                )}
            </Text>

            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { opacity: i === currentIndex ? 1 : 0.3 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#067F38',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34A262',
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: '#34A262',
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
