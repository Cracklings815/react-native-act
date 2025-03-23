import { Image, StyleSheet, View, FlatList, Text, TouchableOpacity } from 'react-native';
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
  return (
    <ThemedView style={styles.container}>
      <Text style={styles.header}>Available Fish</Text>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/addtocart', params: { product: JSON.stringify(item) } })} 
            style={styles.productCard}
            activeOpacity={0.8}
          >
            <Image source={item.image} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>₱ {item.price}</Text>
            <Text style={styles.productStock}>{item.stocks} in stock</Text>
          </TouchableOpacity>
        )}
      />
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
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 15,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
  },
  productPrice: {
    color: '#F39C12',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productStock: {
    fontSize: 12,
    color: '#A0A0A0',
  },
});