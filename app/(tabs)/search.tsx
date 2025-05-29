"use client"

import { useState, useEffect } from "react"
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { db } from "../../scripts/firebase"
import { ref, get } from "firebase/database"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  image: string
}

const Search = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAllProducts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
    } else {
      performSearch()
    }
  }, [searchQuery, allProducts])

  const fetchAllProducts = async () => {
    try {
      setLoading(true)
      const productsRef = ref(db, "products")
      const snapshot = await get(productsRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        const productsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
        setAllProducts(productsList)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      Alert.alert("Error", "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const performSearch = () => {
    const query = searchQuery.toLowerCase().trim()
    const filtered = allProducts.filter(
      (product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query),
    )
    setSearchResults(filtered)
  }

  const navigateToProductDetails = (product: Product) => {
    // Navigate to addtocart.tsx with product data
    router.push({
      pathname: "/addtocart",
      params: {
        product: JSON.stringify({
          id: product.id,
          name: product.name,
          price: product.price,
          stocks: product.stock, // Note: using 'stocks' to match addtocart.tsx
          category: product.category,
          image: product.image,
        }),
      },
    })
  }

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId))
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => navigateToProductDetails(item)} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={
            item.image && !imageErrors.has(item.id)
              ? { uri: item.image }
              : require("@/assets/images/Basic-Fish-Drawing.jpg")
          }
          style={styles.productImage}
          onError={() => handleImageError(item.id)}
        />

        {/* Stock Badge */}
        <View style={[styles.stockBadge, { backgroundColor: item.stock < 20 ? "#FF6B6B" : "#4ECDC4" }]}>
          <Text style={styles.stockBadgeText}>{item.stock}</Text>
        </View>

        {/* Out of Stock Overlay */}
        {item.stock === 0 && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>₱{item.price.toLocaleString()}</Text>
        <Text style={[styles.stockText, { color: item.stock > 0 ? "#4CAF50" : "#F44336" }]}>
          {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <Ionicons name="chevron-forward" size={20} color="#888" />
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search products..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : searchQuery.trim() === "" ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#666" />
            <Text style={styles.emptyText}>Search for products</Text>
            <Text style={styles.emptySubText}>Enter a product name or category</Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={60} color="#666" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubText}>Try searching with different keywords</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsHeader}>
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0A0A0A",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 40,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
  },
  emptySubText: {
    color: "#999",
    fontSize: 14,
    marginTop: 5,
  },
  resultsHeader: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#333",
  },
  imageContainer: {
    position: "relative",
    marginRight: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  stockBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
  },
  stockBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: "#FF6B6B",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  productInfo: {
    flex: 1,
  },
  categoryTag: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFD700",
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
  },
})

export default Search
