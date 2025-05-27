import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
  status: "pending" | "completed";
}

export default function OrdersPage() {
  const orders: OrderItem[] = [
    {
      id: "1",
      name: "African Full Red Guppy",
      price: 50,
      quantity: 1,
      image: require("@/assets/images/afr.jpg"),
      status: "pending",
    },
    {
      id: "2",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
      status: "completed",
    },
    {
      id: "3",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 1,
      image: require("@/assets/images/bluedragon.jpg"),
      status: "pending",
    },
    {
      id: "4",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
      status: "completed",
    },
    {
      id: "5",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
      status: "completed",
    },
    {
      id: "6",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
      status: "completed",
    },
  ];

  const animations = useRef(orders.map(() => new Animated.Value(0))).current;

  useFocusEffect(
    React.useCallback(() => {
      animations.forEach((anim) => anim.setValue(0));
      const anims = animations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      );
      Animated.stagger(100, anims).start();
    }, [])
  );

  const renderItem = (item: OrderItem, index: number) => {
    const opacity = animations[index];
    const scale = opacity.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.card,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Image source={item.image} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₱{item.price}</Text>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
          <Text
            style={[
              styles.status,
              item.status === "pending"
                ? styles.statusPending
                : styles.statusCompleted,
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const pendingOrders = orders.filter((item) => item.status === "pending");
  const completedOrders = orders.filter((item) => item.status === "completed");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }} // extra space for bottom nav bar
    >
      <Text style={styles.header}>My Orders</Text>

      <Text style={styles.section}>Pending</Text>
      {pendingOrders.map((item, index) => renderItem(item, index))}

      <Text style={styles.section}>Completed</Text>
      {completedOrders.map((item, index) =>
        renderItem(item, index + pendingOrders.length)
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  info: {
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
  status: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusPending: {
    color: "#FFC107",
    backgroundColor: "#2B2B1D",
  },
  statusCompleted: {
    color: "#4CAF50",
    backgroundColor: "#1D2B1F",
  },
});
