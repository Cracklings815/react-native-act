import { Image, StyleSheet, View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

const products = [
  {
    id: '1',
    name: 'African Full Red Guppy',
    price: 50,
    stocks: 100,
    image: require('@/assets/images/afr.jpg'), 
  },
  {
    id: '2',
    name: 'Blue Dragon Guppy',
    price: 50,
    stocks: 200,
    image: require('@/assets/images/bluedragon.jpg'), 
  },
  {
    id: '3',
    name: 'Half Black White Guppy',
    price: 80,
    stocks: 50,
    image: require('@/assets/images/hbwhite.jpg'),
  },
  {
    id: '4',
    name: 'Koi Guppy',
    price: 90,
    stocks: 10,
    image: require('@/assets/images/koi.jpg'),
  },
  {
    id: '5',
    name: 'Full Gold Guppy',
    price: 85,
    stocks: 20,
    image: require('@/assets/images/gold.jpg'),
  },
  {
    id: '6',
    name: 'Half Black Blue Guppy',
    price: 95,
    stocks: 5,
    image: require('@/assets/images/hbb3.jpg'),
  },
];

export default function HomeScreen() {
  // Function to show alert
  interface Product {
    id: string;
    name: string;
    price: number;
    stocks: number;
    image: any; // Use a more specific type if possible for the image (e.g., ImageSourcePropType)
  }

  const showAlert = (item: Product): void => {
    Alert.alert(
      item.name, 
      `Price: ₱${item.price}\nStock: ${item.stocks} left`,
      [{ text: "OK", style: "default" }]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.flatListContainer}>
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => showAlert(item)} style={styles.productCard}>
              <Image source={item.image} style={styles.productImage} />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>₱ {item.price}</Text>
              <Text style={styles.productStock}>{item.stocks} in stock</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#110E0E',
  },
  flatListContainer: {
    width: '90%',
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productStock: {
    fontSize: 12,
    color: 'gray',
  },
});
