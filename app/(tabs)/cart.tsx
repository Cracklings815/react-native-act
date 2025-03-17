import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

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
      image: require("@+/assets/images/bluedragon.jpg"),
    },
  ];

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Cart</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={item.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₱ {item.price}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₱ {calculateTotal()}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push("/checkout")}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#110E0E",
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 30,
    textAlign: "center",
    marginTop: 30,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  itemPrice: {
    fontSize: 14,
    color: "#FF5C5C",
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#555",
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  checkoutButton: {
    marginTop: 10,
    backgroundColor: "#5CFF8A",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
