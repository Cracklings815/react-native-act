import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function Checkout() {
  const router = useRouter();

  // Function to show confirmation alert
  const handlePayment = () => {
    Alert.alert(
      "Confirm Payment",
      "Are you sure you want to proceed with the payment?",
      [
      { text: "Cancel", style: "cancel" },
      { text: "Yes, Proceed", onPress: () => Alert.alert("Payment Successful", "Your payment has been processed."), style: "default" },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.text}>Confirm your order details and proceed with payment.</Text>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Items:</Text>
          <Text style={styles.summaryValue}>3</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Price:</Text>
          <Text style={styles.summaryValue}>₱ 150</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "transparent",
    padding: 10,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5CFF8A",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#CCC",
    textAlign: "center",
    marginBottom: 30,
  },
  summaryContainer: {
    width: width - 40,
    padding: 20,
    backgroundColor: "#2C2C2C",
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#CCC",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  payButton: {
    width: width - 40,
    backgroundColor: "#5CFF8A",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#5CFF8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  payText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
