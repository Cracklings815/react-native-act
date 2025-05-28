import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router } from "expo-router";
import { ref, get, update } from "firebase/database";
import { db } from "../../scripts/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    // Load email from AsyncStorage
    const loadEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          console.warn("No stored email found");
        }
      } catch (error) {
        console.error("Failed to load email from AsyncStorage:", error);
      }
    };
    loadEmail();
  }, []);

  useEffect(() => {
    console.log("Received email:", email); // Debug
    if (!email) return;

    const fetchUserData = async () => {
      try {
        const snapshot = await get(ref(db, "users"));
        const users = snapshot.val();
        for (const userId in users) {
          const user = users[userId];
          if (user.email === email) {
            setUsername(user.username || "");
            setUserEmail(user.email || "");
            setStreet(user.street || "");
            setCity(user.city || "");
            setStateName(user.state || "");
            setPostalCode(user.postalCode || "");
            setCountry(user.country || "");
            break;
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [email]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const saveAddress = async () => {
    try {
      const snapshot = await get(ref(db, "users"));
      const users = snapshot.val();

      let userFound = false;

      for (const userId in users) {
        if (users[userId].email === email) {
          const userRef = ref(db, `users/${userId}`);
          await update(userRef, {
            street: street || "",
            city: city || "",
            state: stateName || "",
            postalCode: postalCode || "",
            country: country || "",
          });
          userFound = true;
          break;
        }
      }

      if (userFound) {
        Alert.alert("Success", "Address updated!");
        console.log("Saving address for:", email);
        setEditingAddress(false);
      } else {
        Alert.alert("Error", "User not found.");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      Alert.alert("Error", "Failed to update address.");
    }
  };


  const handleLogout = async () => {
    Alert.alert("Exit", "User Logout");
    await AsyncStorage.removeItem("userEmail");
    router.replace("/login");
  };

  // if (redirectToLogin) return <Redirect href="/login" />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={pickImage} style={styles.profileContainer}>
            <Image
              source={profilePic ? { uri: profilePic } : require("@/assets/images/2x2.png")}
              style={styles.profileImage}
            />
            <View style={styles.editBadge}>
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{username}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput style={styles.input} value={username} editable={false} />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.input} value={userEmail} editable={false} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity onPress={editingAddress ? saveAddress : () => setEditingAddress(true)}>
              <Ionicons
                name={editingAddress ? "checkmark" : "create-outline"}
                size={18}
                color={editingAddress ? "#00C851" : "#007AFF"}
              />
            </TouchableOpacity>
          </View>

          {editingAddress ? (
            <>
              {[{ label: "Street", value: street, setter: setStreet },
              { label: "City", value: city, setter: setCity },
              { label: "State", value: stateName, setter: setStateName },
              { label: "Postal Code", value: postalCode, setter: setPostalCode },
              { label: "Country", value: country, setter: setCountry },
              ].map(({ label, value, setter }, index) => (
                <View key={index}>
                  <Text style={styles.inputLabel}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setter}
                    placeholder={`Enter ${label}`}
                  />
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.addressText}>
              {[street, city, stateName, postalCode, country].filter(Boolean).join(", ") || "No address set"}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: "red", marginTop: 20 }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    marginTop: 20
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 50
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10
  },
  profileContainer: {
    position: "relative"
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff"
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#873A3A",
    borderRadius: 10,
    padding: 5
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginTop: 10
  },
  profileEmail: {
    fontSize: 14,
    color: "#ccc"
  },
  section: {
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10
  },
  inputLabel: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 5
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  addressText: {
    color: "#ccc",
    fontSize: 16
  }
});

export default SettingsScreen;
