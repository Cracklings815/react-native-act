import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";

interface State {
  username: string;
  email: string;
  profilePic: string | null;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  editingAddress: boolean;
  redirectToLogin: boolean;
  redirectToYap: boolean;
  redirectToAct2: boolean;
}

export default class Settings extends Component<{}, State> {
  state: State = {
    username: "JohnDoe",
    email: "johndoe@example.com",
    profilePic: null,
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    editingAddress: false,
    redirectToLogin: false,
    redirectToYap: false,
    redirectToAct2: false,
  };

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      this.setState({ profilePic: result.assets[0].uri });
    }
  };

  handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => this.setState({ redirectToLogin: true }) },
    ]);
  };

  handleChangePassword = () => {
    Alert.alert("Change Password", "Redirecting to change password screen.");
  };

  render() {
    if (this.state.redirectToLogin) return <Redirect href="/login" />;
    if (this.state.redirectToYap) return <Redirect href="/yap" />;
    if (this.state.redirectToAct2) return <Redirect href="/act2" />;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Settings</Text>
            </View>
            <TouchableOpacity onPress={this.pickImage} style={styles.profileContainer}>
              <Image
                source={
                  this.state.profilePic
                    ? { uri: this.state.profilePic }
                    : require("@/assets/images/2x2.png")
                }
                style={styles.profileImage}
              />
              <View style={styles.editBadge}>
                <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{this.state.username}</Text>
            <Text style={styles.profileEmail}>{this.state.email}</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={this.state.username}
                  placeholder="Enter username"
                  placeholderTextColor="#A0A0A0"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={this.state.email}
                  placeholder="Enter email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <TouchableOpacity
                onPress={() => this.setState(prev => ({ editingAddress: !prev.editingAddress }))}
                style={styles.editButton}
              >
                <Ionicons 
                  name={this.state.editingAddress ? "checkmark" : "create-outline"} 
                  size={18} 
                  color="#007AFF" 
                />
              </TouchableOpacity>
            </View>

            {this.state.editingAddress ? (
              <View>
                {[
                  { field: "street", label: "Street Address", icon: "home-outline" },
                  { field: "city", label: "City", icon: "location-outline" },
                  { field: "state", label: "State", icon: "map-outline" },
                  { field: "postalCode", label: "Postal Code", icon: "code-outline" },
                  { field: "country", label: "Country", icon: "earth-outline" }
                ].map(({ field, label }, index) => (
                  <View key={index} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{label}</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        placeholderTextColor="#A0A0A0"
                        value={this.state[field as keyof State] as string}
                        keyboardType={field === "postalCode" ? "numeric" : "default"}
                        onChangeText={(text) =>
                          this.setState(prevState => ({
                            ...prevState,
                            [field]: text,
                          }))
                        }
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.addressDisplay}>
                <Text style={styles.addressText}>
                  {[this.state.street, this.state.city, this.state.state, this.state.postalCode, this.state.country]
                    .filter(Boolean)
                    .join(", ") || "Manaoag, Pangasinan"}
                </Text>
              </View>
            )}
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.actionButton} onPress={this.handleChangePassword}>
              <View style={styles.actionContent}>
                <Ionicons name="lock-closed-outline" size={20} color="#007AFF" />
                <Text style={styles.actionText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={this.handleLogout}>
              <View style={styles.actionContent}>
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "flex-start",
    width: "100%",  
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textAlign: "left",  
    width: "100%",  
  },
  profileSection: {
    backgroundColor: "#1C1C1E",
    paddingVertical: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  profileContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#8E8E93",
  },
  section: {
    backgroundColor: "#1C1C1E",
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  editButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  addressDisplay: {
    backgroundColor: "#2C2C2E",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  addressText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 12,
    fontWeight: "500",
  },
  logoutText: {
    color: "#FF3B30",
  },
});