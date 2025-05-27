import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Alert, ScrollView, StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, Redirect } from "expo-router";
import { ref, onValue } from "firebase/database";
import { db } from "../../scripts/firebase";

const SettingsScreen = () => {
  const { email } = useLocalSearchParams();

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
    if (!email) return;

    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
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
    }, { onlyOnce: true });
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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => setRedirectToLogin(true) },
    ]);
  };

  if (redirectToLogin) return <Redirect href="/login" />;

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
            <TouchableOpacity onPress={() => setEditingAddress(!editingAddress)}>
              <Ionicons name={editingAddress ? "checkmark" : "create-outline"} size={18} color="#007AFF" />
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
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  profileSection: { alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "white", marginBottom: 10 },
  profileContainer: { position: "relative" },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: "#fff" },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#873A3A", borderRadius: 10, padding: 5
  },
  profileName: { fontSize: 20, fontWeight: "bold", color: "white", marginTop: 10 },
  profileEmail: { fontSize: 14, color: "#ccc" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 10 },
  inputLabel: { fontSize: 14, color: "#ccc", marginBottom: 5 },
  input: {
    backgroundColor: "#1E1E1E", color: "#fff", padding: 10,
    borderRadius: 6, marginBottom: 10
  },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10
  },
  addressText: { color: "#ccc", fontSize: 16 }
});

export default SettingsScreen;
