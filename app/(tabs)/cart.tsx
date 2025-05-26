import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

export default function Cart() {
  const router = useRouter();

  const cartItems: CartItem[] = [
    {
      id: "1",
      name: "African Full Red Guppy",
      price: 50,
      quantity: 1,
      image: require("@/assets/images/afr.jpg"),
    },
    {
      id: "2",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
    },
    {
      id: "3",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
    },
    {
      id: "4",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
    },
    {
      id: "5",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
    },
    {
      id: "6",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
    },
    {
      id: "7",
      name: "Blue Dragon Guppy",
      price: 50,
      quantity: 2,
      image: require("@/assets/images/bluedragon.jpg"),
    },
    
  ];

  // Animation setup
  const animations = useRef(cartItems.map(() => new Animated.Value(0))).current;

  useFocusEffect(
  React.useCallback(() => {
    animations.forEach((anim) => anim.setValue(0)); // Reset animations
    const anims = animations.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, anims).start();
  }, [animations])
);

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <View style={styles.container}>
    <Text style={styles.header}>My Cart</Text>

    <FlatList
      data={cartItems}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 100 }}
      renderItem={({ item, index }) => {
        const opacity = animations[index];
        const scale = opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        });

        return (
          <Animated.View style={[styles.cartItem, { opacity, transform: [{ scale }] }]}>
            <Image source={item.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₱ {item.price}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
          </Animated.View>
        );
      }}
      ListFooterComponent={
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ₱ {calculateTotal()}</Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push("/checkout")}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      }
    />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
  itemPrice: {
    fontSize: 16,
    color: "#FF5C5C",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#AAA",
  },
  totalContainer: {
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  checkoutButton: {
    marginTop: 12,
    backgroundColor: "#5CFF8A",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: "#5CFF8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
