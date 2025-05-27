import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity, Animated, ScrollView, Dimensions, StatusBar, } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from "../../scripts/firebase";
import { ref, push, set, get } from 'firebase/database';

const { width: screenWidth } = Dimensions.get('window');

const products = [
  { id: '1', name: 'African Full Red Guppy', price: 50, stocks: 100, image: require('@/assets/images/afr.jpg'), category: 'Guppy', featured: true },
  { id: '2', name: 'Blue Dragon Guppy', price: 50, stocks: 200, image: require('@/assets/images/bluedragon.jpg'), category: 'Guppy' },
  { id: '3', name: 'Half Black White Guppy', price: 80, stocks: 50, image: require('@/assets/images/hbwhite.jpg'), category: 'Guppy' },
  { id: '4', name: 'Koi Guppy', price: 90, stocks: 10, image: require('@/assets/images/koi.jpg'), category: 'Guppy', featured: true },
  { id: '5', name: 'Full Gold Guppy', price: 85, stocks: 20, image: require('@/assets/images/gold.jpg'), category: 'Guppy' },
  { id: '6', name: 'Half Black Blue Guppy', price: 95, stocks: 5, image: require('@/assets/images/hbb3.jpg'), category: 'Guppy' },
  { id: '7', name: 'Black Ranchu Goldfish', price: 1000, stocks: 55, image: require('@/assets/images/ranchu.png'), category: 'Goldfish', featured: true },
  { id: '8', name: 'White Balloon Molly', price: 150, stocks: 5, image: require('@/assets/images/molly.jpg'), category: 'Molly' },
  { id: '9', name: 'Fancy Oranda Goldfish', price: 1500, stocks: 45, image: require('@/assets/images/oranda.jpg'), category: 'Goldfish', featured: true },
  { id: '10', name: 'Butterfly Telescope Goldfish', price: 5000, stocks: 5, image: require('@/assets/images/butterfly.jpg'), category: 'Goldfish' },
];

const categories = ['All', 'Guppy', 'Goldfish', 'Molly'];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  // const [filteredProducts, setFilteredProducts] = useState(products);

  // Animation values
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const categoryAnimation = useRef(new Animated.Value(0)).current;
  const productAnimations = useRef(products.map(() => new Animated.Value(0))).current;
  const featuredAnimation = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const snapshot = await get(ref(db, 'products')); // Adjust 'products' if your path is different
  //       if (snapshot.exists()) {
  //         const data = snapshot.val();
  //         const loadedProducts = Object.keys(data).map(key => ({
  //           id: key,
  //           ...data[key],
  //           image: getImageFromName(data[key].image), // This converts image name to local asset
  //         }));
  //         setProducts(loadedProducts);
  //         setFilteredProducts(loadedProducts);
  //       } else {
  //         console.log('No products found');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching products:', error);
  //     }
  //   };

  //   fetchProducts();
  // }, []);

  // const getImageFromName = (name: string) => {
  //   switch (name) {
  //     case 'afr.jpg': return require('@/assets/images/afr.jpg');
  //     case 'bluedragon.jpg': return require('@/assets/images/bluedragon.jpg');
  //     case 'hbwhite.jpg': return require('@/assets/images/hbwhite.jpg');
  //     case 'koi.jpg': return require('@/assets/images/koi.jpg');
  //     case 'gold.jpg': return require('@/assets/images/gold.jpg');
  //     case 'hbb3.jpg': return require('@/assets/images/hbb3.jpg');
  //     case 'ranchu.png': return require('@/assets/images/ranchu.png');
  //     case 'molly.jpg': return require('@/assets/images/molly.jpg');
  //     case 'oranda.jpg': return require('@/assets/images/oranda.jpg');
  //     case 'butterfly.jpg': return require('@/assets/images/butterfly.jpg');
  //     default: return require('@/assets/images/Basic-Fish-Drawing.jpg'); // fallback image
  //   }
  // };

  useEffect(() => {
    // Animate header
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animate categories
    Animated.timing(categoryAnimation, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Animate featured section
    Animated.timing(featuredAnimation, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Stagger product animations
    const staggerAnimations = productAnimations.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, staggerAnimations).start();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory, products]);


  const featuredProducts = products.filter(product => product.featured);

  interface Product {
    id: string;
    name: string;
    price: number;
    stocks: number;
    image: any;
    category: string;
    featured?: boolean;
  }

  interface ProductCardProps {
    item: Product;
    index: number;
    isLarge?: boolean;
  }

  const renderProductCard = (
    item: Product,
    index: number,
    isLarge: boolean = false
  ): React.ReactElement => {
    const opacity = productAnimations[products.findIndex((p) => p.id === item.id)];
    const scale = opacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          isLarge ? styles.featuredCard : styles.productCard,
          { opacity, transform: [{ scale }] },
        ]}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: '/addtocart', params: { product: JSON.stringify(item) } })
          }
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

          {/* Product image with overlay */}
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={isLarge ? styles.featuredImage : styles.productImage}
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
      </Animated.View>
    );
  };

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

        {/* Featured Section */}
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
            {featuredProducts.map((item, index) => renderProductCard(item, index, true))}
          </ScrollView>
        </Animated.View>

        {/* All Products */}
        <View style={styles.allProductsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Fish' : selectedCategory}
            </Text>
            <Text style={styles.productCount}>{filteredProducts.length} items</Text>
          </View>

          <View style={styles.productsGrid}>
            {filteredProducts.map((item, index) => renderProductCard(item, index))}
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
    paddingBottom: 100, // Space for tab bar
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#666',
    fontSize: 16,
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
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
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