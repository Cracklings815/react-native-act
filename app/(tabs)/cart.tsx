import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../scripts/firebase";
import { ref, get, remove, push, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
  category: string;
  totalPrice: number;
  addedAt: number;
  userEmail: string;
}

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Animation setup
  const animations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Get user email from AsyncStorage
  const getUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
        console.log('Current user email:', email);
        return email;
      } else {
        console.log('No user email found in AsyncStorage');
        Alert.alert('Error', 'Please log in to view your cart');
        router.push('/login');
        return null;
      }
    } catch (error) {
      console.error('Error getting user email:', error);
      Alert.alert('Error', 'Please log in again');
      router.push('/login');
      return null;
    } finally {
      setInitialLoading(false);
    }
  };

  const getImageFromName = (imageName: string) => {
    switch (imageName) {
      case 'afr.jpg': return require('@/assets/images/afr.jpg');
      case 'bluedragon.jpg': return require('@/assets/images/bluedragon.jpg');
      case 'hbwhite.jpg': return require('@/assets/images/hbwhite.jpg');
      case 'koi.jpg': return require('@/assets/images/koi.jpg');
      case 'gold.jpg': return require('@/assets/images/gold.jpg');
      case 'hbb3.jpg': return require('@/assets/images/hbb3.jpg');
      case 'ranchu.png': return require('@/assets/images/ranchu.png');
      case 'molly.jpg': return require('@/assets/images/molly.jpg');
      case 'oranda.jpg': return require('@/assets/images/oranda.jpg');
      case 'butterfly.jpg': return require('@/assets/images/butterfly.jpg');
      default: return require('@/assets/images/Basic-Fish-Drawing.jpg');
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);

      // Get user email if not already available
      const email = userEmail || await getUserEmail();
      if (!email) return;

      // Use sanitized email as key (replace dots with underscores)
      const sanitizedEmail = email.replace(/\./g, '_');
      const cartRef = ref(db, `cart/${sanitizedEmail}`);

      console.log(`Fetching cart items for user: ${email}`);
      const snapshot = await get(cartRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          image: getImageFromName(data[key].image),
        }));

        setCartItems(items);

        // Create animations for new items
        items.forEach(item => {
          if (!animations[item.id]) {
            animations[item.id] = new Animated.Value(0);
          }
        });
      } else {
        console.log('No cart items found for user:', email);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const initializeCart = async () => {
        await getUserEmail();
        fetchCartItems();
      };

      initializeCart();

      return () => {
        // Reset selections when leaving the screen
        setSelectedItems(new Set());
        setSelectAll(false);
      };
    }, [])
  );

  useEffect(() => {
    const animationPromises = cartItems.map((item, index) => {
      if (animations[item.id]) {
        animations[item.id].setValue(0);
        return Animated.timing(animations[item.id], {
          toValue: 1,
          duration: 400,
          delay: index * 100,
          useNativeDriver: true,
        });
      }
      return null;
    }).filter(
      (anim): anim is Animated.CompositeAnimation => anim !== null
    );

    if (animationPromises.length > 0) {
      Animated.parallel(animationPromises).start();
    }
  }, [cartItems]);


  const toggleSelectItem = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    setSelectAll(newSelectedItems.size === cartItems.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  const deleteItem = async (itemId: string) => {
    if (!userEmail) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const sanitizedEmail = userEmail.replace(/\./g, '_');
              await remove(ref(db, `cart/${sanitizedEmail}/${itemId}`));

              // Animate out the item
              if (animations[itemId]) {
                Animated.timing(animations[itemId], {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  fetchCartItems();
                });
              } else {
                fetchCartItems();
              }

              // Remove from selected items
              const newSelectedItems = new Set(selectedItems);
              newSelectedItems.delete(itemId);
              setSelectedItems(newSelectedItems);
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const deleteSelectedItems = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (selectedItems.size === 0) {
      Alert.alert('No Items Selected', 'Please select items to delete');
      return;
    }

    Alert.alert(
      'Remove Selected Items',
      `Are you sure you want to remove ${selectedItems.size} item(s) from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const sanitizedEmail = userEmail.replace(/\./g, '_');
              const deletePromises = Array.from(selectedItems).map(itemId =>
                remove(ref(db, `cart/${sanitizedEmail}/${itemId}`))
              );
              await Promise.all(deletePromises);

              setSelectedItems(new Set());
              setSelectAll(false);
              fetchCartItems();
            } catch (error) {
              console.error('Error removing items:', error);
              Alert.alert('Error', 'Failed to remove items');
            }
          },
        },
      ]
    );
  };

  const proceedToCheckout = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'Please log in to checkout');
      router.push('/login');
      return;
    }

    if (selectedItems.size === 0) {
      Alert.alert('No Items Selected', 'Please select items to checkout');
      return;
    }

    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    const totalAmount = selectedCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    try {
      // Create order in Firebase under user's email
      const sanitizedEmail = userEmail.replace(/\./g, '_');
      const orderRef = ref(db, `orders/${sanitizedEmail}`);
      const order = {
        items: selectedCartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category,
          totalPrice: item.totalPrice,
        })),
        totalAmount,
        status: 'Pending',
        createdAt: Date.now(),
        orderNumber: `ORD-${Date.now()}`,
        userEmail: userEmail,
      };

      await push(orderRef, order);

      // Remove selected items from cart
      const deletePromises = Array.from(selectedItems).map(itemId =>
        remove(ref(db, `cart/${sanitizedEmail}/${itemId}`))
      );
      await Promise.all(deletePromises);

      Alert.alert(
        'Order Placed',
        `Your order has been placed successfully!
Order Total: ₱${totalAmount}`,
        [
          {
            text: 'View Orders', onPress: () => {
              setSelectedItems(new Set());
              setSelectAll(false);
              fetchCartItems();
              router.push('/orders');
            }
          },
          {
            text: 'Continue Shopping', onPress: () => {
              setSelectedItems(new Set());
              setSelectAll(false);
              fetchCartItems();
              router.push('/');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const calculateSelectedTotal = (): number => {
    return cartItems
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#5CFF8A" />
        <Text style={styles.loadingText}>Initializing cart...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#5CFF8A" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="cart-outline" size={80} color="#666" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/main')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
            <Ionicons
              name={selectAll ? "checkbox" : "checkbox-outline"}
              size={20}
              color="#5CFF8A"
            />
            <Text style={styles.selectAllText}>All</Text>
          </TouchableOpacity>
          {selectedItems.size > 0 && (
            <TouchableOpacity onPress={deleteSelectedItems} style={styles.deleteButton}>
              <Ionicons name="trash" size={20} color="#FF5C5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => {
          const isSelected = selectedItems.has(item.id);
          const opacity = animations[item.id] || new Animated.Value(1);
          const scale = opacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          });

          return (
            <Animated.View style={[
              styles.cartItem,
              isSelected && styles.selectedItem,
              { opacity, transform: [{ scale }] }
            ]}>
              <TouchableOpacity
                onPress={() => toggleSelectItem(item.id)}
                style={styles.checkbox}
              >
                <Ionicons
                  name={isSelected ? "checkbox" : "checkbox-outline"}
                  size={24}
                  color={isSelected ? "#5CFF8A" : "#666"}
                />
              </TouchableOpacity>

              <Image source={item.image} style={styles.itemImage} />

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>₱{item.price} x {item.quantity}</Text>
                <Text style={styles.itemTotal}>Total: ₱{item.totalPrice}</Text>
              </View>

              <TouchableOpacity
                onPress={() => deleteItem(item.id)}
                style={styles.deleteItemButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF5C5C" />
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>
            {selectedItems.size > 0 ? `Selected (${selectedItems.size})` : 'Total'}:
          </Text>
          <Text style={styles.totalText}>
            ₱{selectedItems.size > 0 ? calculateSelectedTotal() : calculateTotal()}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            selectedItems.size === 0 && styles.disabledButton
          ]}
          onPress={proceedToCheckout}
          disabled={selectedItems.size === 0}
        >
          <Text style={styles.checkoutText}>
            Checkout ({selectedItems.size})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  selectAllText: {
    color: '#5CFF8A',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 92, 92, 0.1)',
    borderRadius: 8,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedItem: {
    borderColor: '#5CFF8A',
    borderWidth: 2,
    backgroundColor: 'rgba(92, 255, 138, 0.1)',
  },
  checkbox: {
    marginRight: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: "#5CFF8A",
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: "#FF5C5C",
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#AAA",
  },
  deleteItemButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 92, 92, 0.1)',
    borderRadius: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginBottom: 80
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: '#AAA',
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  checkoutButton: {
    backgroundColor: "#5CFF8A",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: "#5CFF8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#5CFF8A',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});