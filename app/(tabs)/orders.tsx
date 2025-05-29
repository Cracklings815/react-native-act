import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../scripts/firebase";
import { ref, get, update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: any;
  category?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: number;
  userEmail?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
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
        Alert.alert('Error', 'Please log in to view your orders');
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

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Get user email if not already available
      const email = userEmail || await getUserEmail();
      if (!email) return;

      // Use sanitized email as key (replace dots with underscores)
      const sanitizedEmail = email.replace(/\./g, '_');
      const ordersRef = ref(db, `orders/${sanitizedEmail}`);

      console.log(`Fetching orders for user: ${email}`);
      const snapshot = await get(ordersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList = Object.keys(data).map(key => {
          // Process each order
          const order = data[key];

          // Process items in each order
          const processedItems = order.items.map((item: any) => ({
            ...item,
            image: getImageFromName(item.image),
          }));

          return {
            id: key,
            ...order,
            items: processedItems,
          };
        }).sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first

        setOrders(ordersList);

        // Create animations for orders
        ordersList.forEach(order => {
          if (!animations[order.id]) {
            animations[order.id] = new Animated.Value(0);
          }
        });
      } else {
        console.log('No orders found for user:', email);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const initializeOrders = async () => {
        await getUserEmail();
        fetchOrders();
      };

      initializeOrders();
    }, [])
  );

  useEffect(() => {
    // Animate orders when they load
    const animationPromises = orders
      .map((order, index) => {
        if (animations[order.id]) {
          animations[order.id].setValue(0);
          return Animated.timing(animations[order.id], {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
          });
        }
        return null;
      })
      .filter(
        (anim): anim is Animated.CompositeAnimation => anim !== null
      );

    if (animationPromises.length > 0) {
      Animated.parallel(animationPromises).start();
    }
  }, [orders]);


  const handleOrderReceived = async (orderId: string) => {
    if (!userEmail) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      const sanitizedEmail = userEmail.replace(/\./g, '_');
      await update(ref(db, `orders/${sanitizedEmail}/${orderId}`), {
        status: 'Completed'
      });

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: 'Completed' } : order
        )
      );

      Alert.alert('Success', 'Order marked as received!');
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFC107';
      case 'processing': return '#2196F3';
      case 'shipped': return '#FF9800';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const renderOrderCard = (order: Order) => {
    const opacity = animations[order.id] || new Animated.Value(1);
    const scale = opacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    return (
      <Animated.View
        key={order.id}
        style={[
          styles.card,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          {order.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.itemInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₱{item.price}</Text>
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>₱{item.totalPrice}</Text>
            </View>
          ))}

          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} more item(s)
            </Text>
          )}
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <Text style={styles.totalAmount}>Total: ₱{order.totalAmount}</Text>
          {order.status.toLowerCase() === 'pending' && (
            <TouchableOpacity
              style={styles.receivedButton}
              onPress={() => handleOrderReceived(order.id)}
            >
              <Text style={styles.receivedButtonText}>Order Received</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Initializing orders...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="receipt-outline" size={80} color="#666" />
        <Text style={styles.emptyText}>No orders yet</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pendingOrders = orders.filter((order) => order.status.toLowerCase() !== 'completed');
  const completedOrders = orders.filter((order) => order.status.toLowerCase() === 'completed');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.header}>My Orders</Text>

      {pendingOrders.length > 0 && (
        <>
          <Text style={styles.section}>Pending</Text>
          {pendingOrders.map(order => renderOrderCard(order))}
        </>
      )}

      {completedOrders.length > 0 && (
        <>
          <Text style={styles.section}>Completed</Text>
          {completedOrders.map(order => renderOrderCard(order))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#F5F5F5",
    textAlign: "center",
    marginVertical: 30,
  },
  section: {
    fontSize: 18,
    fontWeight: "500",
    color: "#D1D1D1",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  itemsContainer: {
    padding: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EAEAEA",
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    color: "#FF4C4C",
    marginBottom: 2,
  },
  quantity: {
    fontSize: 13,
    color: "#999",
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 15,
    color: "#FF4C4C",
    fontWeight: 'bold',
  },
  moreItems: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  receivedButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  receivedButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});