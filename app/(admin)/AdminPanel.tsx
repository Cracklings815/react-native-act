"use client"

import { useEffect, useState } from "react"
import { Picker } from "@react-native-picker/picker"
import * as ImagePicker from "expo-image-picker"
import { useRouter, usePathname } from "expo-router"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { db } from "../../scripts/firebase"
import { ref, push, set, get, update, remove } from "firebase/database"

export default function AdminHome() {
  type Product = {
    id: string
    name: string
    category: string
    price: number
    stock: number
    image: string | null
  }

  const [products, setProducts] = useState<Product[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [newProduct, setNewProduct] = useState<{
    name: string
    category: string
    price: string
    stock: string
    image: string | null
  }>({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: null,
  })

  const fetchProducts = async () => {
    try {
      const snapshot = await get(ref(db, "products"))
      if (snapshot.exists()) {
        const data = snapshot.val()
        const productArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
        setProducts(productArray)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = async () => {
    const { name, category, price, stock, image } = newProduct

    if (!name || !category || !price || !stock || !image) {
      Alert.alert("Missing Fields", "Please fill out all product details and select an image.")
      return
    }

    // Check for duplicate product name (case-insensitive)
    const duplicateProduct = products.find(
      (product) => product.name.toLowerCase().trim() === name.toLowerCase().trim()
    )

    if (duplicateProduct) {
      Alert.alert(
        "Product Already Exists", 
        `A product named "${duplicateProduct.name}" already exists. Please choose a different name.`
      )
      return
    }

    try {
      const newProductRef = push(ref(db, "products"))
      const productData = {
        name: name.trim(), // Trim whitespace
        category,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock),
        image,
      }

      await set(newProductRef, productData)

      // Add the new product directly to local state
      const newProductWithId = {
        id: newProductRef.key!,
        ...productData,
      }
      setProducts((prev) => [...prev, newProductWithId])

      Alert.alert("Success", "Product added successfully.")

      setNewProduct({ name: "", category: "", price: "", stock: "", image: null })
      setModalVisible(false)
    } catch (error) {
      Alert.alert("Error", "Failed to add product.")
      console.error(error)
    }
  }

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access media library is required!")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    })

    if (!result.canceled) {
      setNewProduct({ ...newProduct, image: result.assets[0].uri })
    }
  }

  const increaseStock = async (id: string) => {
    const product = products.find((p) => p.id === id)
    if (!product) return

    try {
      const newStock = product.stock + 1
      await update(ref(db, `products/${id}`), { stock: newStock })

      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)))
    } catch (error) {
      console.error("Error updating stock:", error)
      Alert.alert("Error", "Failed to update stock.")
    }
  }

  const decreaseStock = async (id: string) => {
    const product = products.find((p) => p.id === id)
    if (!product || product.stock <= 0) return

    try {
      const newStock = product.stock - 1
      await update(ref(db, `products/${id}`), { stock: newStock })

      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)))
    } catch (error) {
      console.error("Error updating stock:", error)
      Alert.alert("Error", "Failed to update stock.")
    }
  }

  const deleteProduct = (id: string) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(ref(db, `products/${id}`))
            setProducts((prev) => prev.filter((p) => p.id !== id))
            Alert.alert("Success", "Product deleted successfully.")
          } catch (error) {
            Alert.alert("Error", "Failed to delete product.")
            console.error(error)
          }
        },
      },
    ])
  }

  // Add refresh function for pull-to-refresh or manual refresh
  const handleRefresh = async () => {
    await fetchProducts()
  }

  const router = useRouter()
  const pathname = usePathname()

  const isActiveRoute = (route: string) => {
    return pathname.includes(route)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#3F51B5" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                onError={() => console.log("Image failed to load for product:", item.name)}
              />
            )}
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.price}>₱{item.price.toFixed(2)}</Text>
            <Text style={styles.stock}>Stock: {item.stock}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => increaseStock(item.id)}>
                <Ionicons name="add" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => decreaseStock(item.id)}>
                <Ionicons name="remove" size={20} color="#FF9800" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteProduct(item.id)}>
                <Ionicons name="trash" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        // Add pull-to-refresh functionality
        refreshing={false}
        onRefresh={handleRefresh}
      />

      {/* Modal for Adding Product */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Product</Text>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={newProduct.category}
                onValueChange={(itemValue) => setNewProduct({ ...newProduct, category: itemValue })}
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                <Picker.Item label="Guppy" value="Guppy" />
                <Picker.Item label="Goldfish" value="Goldfish" />
                <Picker.Item label="Molly" value="Molly" />
              </Picker>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              keyboardType="numeric"
              value={newProduct.stock}
              onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
            />

            <View style={styles.imagePickerContainer}>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Ionicons name="image" size={24} color="#555" />
                <Text style={styles.imagePickerText}>{newProduct.image ? "Change Image" : "Add Image"}</Text>
              </TouchableOpacity>

              {newProduct.image && <Image source={{ uri: newProduct.image }} style={styles.previewImage} />}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#4CAF50" }]} onPress={handleAddProduct}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#F44336" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(admin)/AdminPanel")}>
          <Ionicons name="home" size={24} color={isActiveRoute("AdminPanel") ? "#3F51B5" : "#757575"} />
          <Text style={[styles.navLabel, { color: isActiveRoute("AdminPanel") ? "#3F51B5" : "#757575" }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(admin)/Sales")}>
          <Ionicons name="analytics" size={24} color={isActiveRoute("Sales") ? "#3F51B5" : "#757575"} />
          <Text style={[styles.navLabel, { color: isActiveRoute("Sales") ? "#3F51B5" : "#757575" }]}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            Alert.alert(
              "Confirm Logout",
              "Are you sure you want to logout?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: () => router.replace("/login"),
                },
              ],
              { cancelable: true },
            )
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={[styles.navLabel, { color: "#F44336" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#3F51B5",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3F51B5",
  },
  refreshButtonText: {
    color: "#3F51B5",
    marginLeft: 5,
    fontWeight: "bold",
  },
  grid: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    width: "48%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  category: {
    fontSize: 12,
    color: "#666",
  },
  price: {
    fontWeight: "500",
    color: "#3F51B5",
  },
  stock: {
    marginVertical: 6,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    overflow: "hidden",
    height: 55,
    justifyContent: "center",
  },
  picker: {
    fontSize: 10,
    height: 60,
  },
  imagePickerContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 8,
    fontSize: 16,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#3F51B5",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 10,
  },
  navItem: {
    alignItems: "center",
  },
  navLabel: {
    fontSize: 12,
    marginTop: 2,
  },
})
