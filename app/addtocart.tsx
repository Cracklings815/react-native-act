import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; 

export default function AddToCartScreen() {
  const params = useLocalSearchParams();
  const product = typeof params.product === 'string' ? JSON.parse(params.product) : null;
  const [quantity, setQuantity] = useState(1);

  if (!product) return <Text style={styles.errorText}>Product not found</Text>;

  const handleAddToCart = () => {
    Alert.alert("Success", `${product.name} (x${quantity}) added to cart!`);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
       <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Image source={product.image} style={styles.productImage} />
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>₱ {product.price}</Text>
        <Text style={styles.productStock}>{product.stocks} in stock</Text>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            onPress={() => setQuantity((prev) => Math.max(1, prev - 1))} 
            style={styles.quantityButton}
          >
            <Text style={styles.quantityText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityValue}>{quantity}</Text>
          
          <TouchableOpacity 
            onPress={() => setQuantity((prev) => Math.min(product.stocks, prev + 1))} 
            style={styles.quantityButton}
          >
            <Text style={styles.quantityText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: '90%',
  },
  productImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E63946',
    marginBottom: 5,
  },
  productStock: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#EFEFEF',
    padding: 8,
    borderRadius: 10,
  },
  quantityButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 15,
  },
  quantityText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#1D3557',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});
