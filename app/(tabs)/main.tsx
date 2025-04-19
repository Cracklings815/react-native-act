import React, { useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';

const products = [
  { id: '1', name: 'African Full Red Guppy', price: 50, stocks: 100, image: require('@/assets/images/afr.jpg') },
  { id: '2', name: 'Blue Dragon Guppy', price: 50, stocks: 200, image: require('@/assets/images/bluedragon.jpg') },
  { id: '3', name: 'Half Black White Guppy', price: 80, stocks: 50, image: require('@/assets/images/hbwhite.jpg') },
  { id: '4', name: 'Koi Guppy', price: 90, stocks: 10, image: require('@/assets/images/koi.jpg') },
  { id: '5', name: 'Full Gold Guppy', price: 85, stocks: 20, image: require('@/assets/images/gold.jpg') },
  { id: '6', name: 'Half Black Blue Guppy', price: 95, stocks: 5, image: require('@/assets/images/hbb3.jpg') },
  { id: '7', name: 'Black Ranchu Goldfish', price: 1000, stocks: 55, image: require('@/assets/images/ranchu.png') },
  { id: '8', name: 'White Balloon Molly', price: 150, stocks: 5, image: require('@/assets/images/molly.jpg') },
  { id: '9', name: 'Fancy Oranda Goldish', price: 1500, stocks: 45, image: require('@/assets/images/oranda.jpg') },
  { id: '10', name: 'Butterfly Telescope Goldfish', price: 5000, stocks: 5, image: require('@/assets/images/butterfly.jpg') },
];

export default function HomeScreen() {
  // Create an Animated.Value for each product
  const animations = useRef(products.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const staggerAnimations = animations.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, staggerAnimations).start();
  }, [animations]);

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.header}>Available Fish</Text>
      <View style={styles.flatListContainer}>
        {products.map((item, index) => {
          const opacity = animations[index];
          const scale = opacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          });
          return (
            <Animated.View
              key={item.id}
              style={[styles.productCard, { opacity, transform: [{ scale }] }]}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push({ pathname: '/addtocart', params: { product: JSON.stringify(item) } })
                }
                activeOpacity={0.8}
                style={styles.touchable}
              >
                <Image source={item.image} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₱ {item.price}</Text>
                <Text style={styles.productStock}>{item.stocks} in stock</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1A1A1A',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  flatListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#252525',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  touchable: {
    alignItems: 'center',
    padding: 15,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    color: '#F39C12',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productStock: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 4,
  },
});
