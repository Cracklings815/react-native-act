import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity, Animated, ScrollView, Dimensions, StatusBar, } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from "../../scripts/firebase";
import { ref, push, set, get } from 'firebase/database';

const { width: screenWidth } = Dimensions.get('window');

const categories = ['All', 'Guppy', 'Goldfish', 'Molly'];

interface Product {
  id: string;
  name: string;
  price: number;
  stocks: number;
  image: string;
  category: string;
  featured?: boolean;
}

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Animation values
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const categoryAnimation = useRef(new Animated.Value(0)).current;
  const featuredAnimation = useRef(new Animated.Value(0)).current;

  // Fallback image for when database image fails to load
  const fallbackImage = require('@/assets/images/Basic-Fish-Drawing.jpg');

  // Helper function to validate URL
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Helper function to get image source
  const getImageSource = (item: Product) => {
    // If there's an error for this product, use fallback
    if (imageErrors.has(item.id)) {
      return fallbackImage;
    }

    // If image exists and is a valid URL, use it
    if (item.image && isValidUrl(item.image)) {
      return { uri: item.image };
    }

    // Otherwise use fallback
    return fallbackImage;
  };

  // Handle image load errors
  const handleImageError = (productId: string, productName: string) => {
    console.log(`Image load error for ${productName} (ID: ${productId})`);
    setImageErrors(prev => new Set(prev).add(productId));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products from Firebase...');

        const snapshot = await get(ref(db, 'products'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('Raw Firebase data:', data);

          const loadedProducts = Object.keys(data).map(key => {
            const product = {
              id: key,
              ...data[key],
              image: data[key].image || '', // Ensure image is always a string
            };
            console.log('Processed product:', product);
            return product;
          });

          console.log('All loaded products:', loadedProducts);

          setProducts(loadedProducts);
          setFilteredProducts(loadedProducts);
        } else {
          console.log('No products found in Firebase');
          // Fallback to hardcoded products for testing
          const fallbackProducts = [
            { id: '1', name: 'African Full Red Guppy', price: 50, stocks: 100, image: require('@/assets/images/afr.jpg'), category: 'Guppy', featured: true },
            { id: '2', name: 'Blue Dragon Guppy', price: 50, stocks: 200, image: require('@/assets/images/bluedragon.jpg'), category: 'Guppy' },
            { id: '3', name: 'Half Black White Guppy', price: 80, stocks: 50, image: require('@/assets/images/hbwhite.jpg'), category: 'Guppy' },
          ];
          setProducts(fallbackProducts);
          setFilteredProducts(fallbackProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to hardcoded products on error
        const fallbackProducts = [
          { id: '1', name: 'African Full Red Guppy', price: 50, stocks: 100, image: '', category: 'Guppy', featured: true },
          { id: '2', name: 'Blue Dragon Guppy', price: 50, stocks: 200, image: '', category: 'Guppy' },
          { id: '3', name: 'Half Black White Guppy', price: 80, stocks: 50, image: '', category: 'Guppy' },
        ];
        setProducts(fallbackProducts);
        setFilteredProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  useEffect(() => {
    // Start animations when component mounts
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.timing(categoryAnimation, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(featuredAnimation, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderProductCard = (
    item: Product,
    isLarge: boolean = false
  ): React.ReactElement => {
    console.log('Rendering product card for:', item.name);

    return (
      <View
        key={item.id}
        style={[
          isLarge ? styles.featuredCard : styles.productCard,
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            console.log('Product clicked:', item.name);
            router.push({ pathname: '/addtocart', params: { product: JSON.stringify(item) } });
          }}
          activeOpacity={0.9}
          style={styles.touchable}
        >
          {/* Stock badge */}
          <View
            style={[
              styles.stockBadge,
              { backgroundColor: item.stocks < 20 ? '#FF6B6B' : '#4ECDC4' },
            ]}
          >
            <Text style={styles.stockText}>{item.stocks}</Text>
          </View>

          {/* Product image with improved error handling */}
          <View style={styles.imageContainer}>
            <Image
              source={getImageSource(item)}
              style={isLarge ? styles.featuredImage : styles.productImage}
              onError={() => handleImageError(item.id, item.name)}
              onLoad={() => console.log('Image loaded successfully for:', item.name)}
              resizeMode="cover"
            />
          </View>

          {/* Product info */}
          <View style={styles.productInfo}>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={isLarge ? styles.featuredName : styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>₱{item.price}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() =>
                router.push({ pathname: '/addtocart', params: { product: JSON.stringify(item) } })
              }>
                <Ionicons name="add" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const featuredProducts = products.filter(product => product.featured);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnimation,
              transform: [{
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Welcome to</Text>
              <Text style={styles.storeTitle}>DOYKONG</Text>
              <Text style={styles.welcomeText}>Online Fish Store</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View
          style={[
            styles.categoriesContainer,
            {
              opacity: categoryAnimation,
              transform: [{
                translateX: categoryAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })
              }]
            }
          ]}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.activeCategoryButton
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.activeCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Debug Info */}
        {/* <View style={{ padding: 20 }}>
          <Text style={{ color: '#fff', marginBottom: 10 }}>
            Debug Info: {products.length} products loaded, {filteredProducts.length} filtered
          </Text>
          {imageErrors.size > 0 && (
            <Text style={{ color: '#FF6B6B', fontSize: 12 }}>
              Image errors: {imageErrors.size} products using fallback images
            </Text>
          )}
        </View> */}

        {/* Featured Section */}
        {featuredProducts.length > 0 && (
          <Animated.View
            style={[
              styles.featuredSection,
              {
                opacity: featuredAnimation,
                transform: [{
                  translateY: featuredAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Fish</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredProducts.map((item) => renderProductCard(item, true))}
            </ScrollView>
          </Animated.View>
        )}

        {/* All Products */}
        <View style={styles.allProductsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Fish' : selectedCategory}
            </Text>
            <Text style={styles.productCount}>{filteredProducts.length} items</Text>
          </View>

          <View style={styles.productsGrid}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => renderProductCard(item))
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', width: '100%' }}>
                No products found
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  storeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  categoriesContainer: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeCategoryButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  categoryText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#fff',
  },
  featuredSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  productCount: {
    color: '#888',
    fontSize: 14,
  },
  allProductsSection: {
    paddingHorizontal: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featuredCard: {
    width: 220,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  touchable: {
    position: 'relative',
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  stockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  productCategory: {
    fontSize: 10,
    color: '#4ECDC4',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 20,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 6,
  },
});