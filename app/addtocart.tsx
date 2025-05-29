import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../scripts/firebase';
import { ref, push, get, update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AddToCartScreen() {
  const params = useLocalSearchParams();
  const product = typeof params.product === 'string' ? JSON.parse(params.product) : null;
  const [quantity, setQuantity] = useState(1);
  const [currentStock, setCurrentStock] = useState(product?.stocks || 0);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Get user email from AsyncStorage
    getUserEmail();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch product data including image and stock from Firebase
    if (product?.id) {
      fetchProductData();
    }
  }, []);

  const getUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
        console.log('Current user email:', email);
      } else {
        Alert.alert('Error', 'Please log in to add items to cart');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error getting user email:', error);
      Alert.alert('Error', 'Please log in again');
      router.push('/login');
    }
  };

  const fetchProductData = async () => {
    try {
      console.log('Fetching product data for:', product.id);
      const productRef = ref(db, `products/${product.id}`);
      const snapshot = await get(productRef);

      if (snapshot.exists()) {
        const productData = snapshot.val();
        console.log('Product data from Firebase:', productData);

        // Update stock
        if (productData.stock !== undefined) {
          setCurrentStock(productData.stock);
          // Reset quantity if it exceeds available stock
          if (quantity > productData.stock) {
            setQuantity(Math.min(quantity, productData.stock));
          }
        }

        // Set product image
        if (productData.image) {
          setProductImage(productData.image);
          console.log('Product image URL:', productData.image);
        }
      } else {
        console.log('No product data found for:', product.id);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const fetchLatestStock = async () => {
    try {
      console.log('Fetching stock for product:', product.id);
      const stockRef = ref(db, `products/${product.id}/stock`);
      const snapshot = await get(stockRef);
      if (snapshot.exists()) {
        const latestStock = snapshot.val();
        console.log('Latest stock:', latestStock);
        setCurrentStock(latestStock);
        // Reset quantity if it exceeds available stock
        if (quantity > latestStock) {
          setQuantity(Math.min(quantity, latestStock));
        }
      } else {
        console.log('No stock data found for product:', product.id);
      }
    } catch (error) {
      console.error('Error fetching latest stock:', error);
    }
  };

  const increaseQuantity = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Stock Limit', `Only ${currentStock} items available in stock`);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="fish-outline" size={64} color="#666" />
        <Text style={styles.errorText}>Fish not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'Please log in to add items to cart');
      router.push('/login');
      return;
    }

    if (currentStock === 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }

    if (quantity > currentStock) {
      Alert.alert('Insufficient Stock', `Only ${currentStock} items available`);
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      console.log('Starting add to cart process for user:', userEmail);
      console.log('Product:', product);
      console.log('Quantity:', quantity);

      // Double-check stock before adding to cart
      const stockRef = ref(db, `products/${product.id}/stock`);
      const stockSnapshot = await get(stockRef);
      const availableStock = stockSnapshot.val();

      console.log('Available stock check:', availableStock);

      if (quantity > availableStock) {
        Alert.alert('Insufficient Stock', `Only ${availableStock} items available`);
        setCurrentStock(availableStock);
        setQuantity(Math.min(quantity, availableStock));
        setLoading(false);
        return;
      }

      // Prepare cart item data with Firebase image URL
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: productImage || product.image, // Use Firebase image URL
        category: product.category || 'Fish',
        totalPrice: product.price * quantity,
        addedAt: Date.now(),
        userEmail: userEmail, // Store user email with cart item
      };

      console.log('Cart item to be added:', cartItem);

      // Add to user-specific cart in Firebase
      const userCartRef = ref(db, `cart/${userEmail.replace(/\./g, '_')}`);
      console.log('Adding to user cart reference:', userCartRef);

      const result = await push(userCartRef, cartItem);
      console.log('Cart item added successfully with key:', result.key);

      // Update stock in database
      const newStock = availableStock - quantity;
      console.log('Updating stock from', availableStock, 'to', newStock);

      await update(ref(db, `products/${product.id}`), {
        stock: newStock
      });

      console.log('Stock updated successfully');

      // Update local stock
      setCurrentStock(newStock);

      Alert.alert(
        "Added to Cart! 🎉",
        `${product.name} (x${quantity}) has been added to your cart.`,
        [
          { text: "Continue Shopping", onPress: () => router.back() },
          { text: "View Cart", onPress: () => router.push('/cart') }
        ]
      );

    } catch (error) {
      console.error('Error adding to cart:', error);

      if (error instanceof Error) {
        console.error('Error details:', error.message);
        Alert.alert('Error', `Failed to add item to cart: ${error.message}`);
      } else {
        // fallback for unknown error types
        Alert.alert('Error', 'Failed to add item to cart: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'Please log in to make a purchase');
      router.push('/login');
      return;
    }

    if (currentStock === 0) {
      Alert.alert('Out of Stock', 'This item is currently out of stock');
      return;
    }

    if (quantity > currentStock) {
      Alert.alert('Insufficient Stock', `Only ${currentStock} items available`);
      return;
    }

    // Add to cart first, then navigate to cart
    await handleAddToCart();
    // Navigate to cart for checkout
    router.push('/cart');
  };

  const totalPrice = product.price * quantity;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Product Details</Text>

        <TouchableOpacity onPress={() => router.push('/cart')} style={styles.headerButton}>
          <Ionicons name="bag-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Image Section */}
        <Animated.View
          style={[
            styles.imageSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.imageContainer}>
            {imageLoading ? (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={styles.loadingText}>Loading image...</Text>
              </View>
            ) : productImage ? (
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
                onError={(error) => {
                  // console.error('Image loading error:', error);
                  setProductImage(null);
                }}
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons name="fish-outline" size={100} color="#666" />
                {/* <Text style={styles.placeholderText}>No image available</Text> */}
              </View>
            )}

            {/* Stock Badge */}
            <View style={[
              styles.stockBadge,
              { backgroundColor: currentStock < 20 ? '#FF6B6B' : '#4ECDC4' }
            ]}>
              <Ionicons name="cube-outline" size={12} color="#fff" />
              <Text style={styles.stockBadgeText}>{currentStock}</Text>
            </View>

            {/* Out of Stock Overlay */}
            {currentStock === 0 && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Product Info Section */}
        <Animated.View
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Category & Rating */}
          <View style={styles.metaInfo}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{product.category || 'Fish'}</Text>
            </View>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons key={star} name="star" size={14} color="#FFD700" />
              ))}
              <Text style={styles.ratingText}>(4.8)</Text>
            </View>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₱{product.price}</Text>
            <Text style={styles.priceUnit}>per fish</Text>
          </View>

          {/* Stock Warning */}
          {currentStock > 0 && currentStock < 10 && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={16} color="#FF6B6B" />
              <Text style={styles.warningText}>
                Only {currentStock} items left in stock!
              </Text>
            </View>
          )}

        </Animated.View>
      </ScrollView>

      {/* Bottom Action Section */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={decreaseQuantity}
              style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color={quantity <= 1 ? "#666" : "#fff"} />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityValue}>{quantity}</Text>
            </View>

            <TouchableOpacity
              onPress={increaseQuantity}
              style={[styles.quantityButton, quantity >= currentStock && styles.disabledButton]}
              disabled={quantity >= currentStock}
            >
              <Ionicons name="add" size={20} color={quantity >= currentStock ? "#666" : "#fff"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Price */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₱{totalPrice.toLocaleString()}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.buyNowButton, currentStock === 0 && styles.disabledButton]}
            onPress={handleBuyNow}
            disabled={currentStock === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.buyNowText}>Buy Now</Text>
              </>
            )}
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.addToCartButton, currentStock === 0 && styles.disabledButton]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
              disabled={currentStock === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="bag-add" size={20} color="#fff" />
                  <Text style={styles.addToCartText}>
                    {currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 20,
    width: screenWidth - 40,
    alignItems: 'center',
    minHeight: 290, // Ensure consistent height
  },
  productImage: {
    width: 250,
    height: 250,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  imageLoadingContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  placeholderContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  stockBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 30,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  priceUnit: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  warningText: {
    color: '#FF6B6B',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSection: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  quantityDisplay: {
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  buyNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});