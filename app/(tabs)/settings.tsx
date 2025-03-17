import React, { Component } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons"; // Import icons

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
      { text: "Logout", onPress: () => console.log("User logged out") },
    ]);
  };

  handleChangePassword = () => {
    Alert.alert("Change Password", "Redirecting to change password screen.");
  };

  render() {
    return (
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.header}>Settings</Text>

        {/* Profile Picture */}
        <TouchableOpacity onPress={this.pickImage} style={styles.profilePicContainer}>
          <Image
            source={
              this.state.profilePic ? { uri: this.state.profilePic } : require("@/assets/images/2x2.png")
            }
            style={styles.profilePic}
          />
          <View style={styles.editIcon}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Username and Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="#40D740" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={this.state.username}
            placeholder="Username"
            placeholderTextColor="#888"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#40D740" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={this.state.email}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
          />
        </View>

        {/* Shipping Address Section */}
        <Text style={styles.sectionHeader}>Shipping Address</Text>
        {this.state.editingAddress ? (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="home" size={20} color="#40D740" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={this.state.street}
                onChangeText={(text) => this.setState({ street: text })}
                placeholder="Street"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#40D740" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={this.state.city}
                onChangeText={(text) => this.setState({ city: text })}
                placeholder="City"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="map" size={20} color="#40D740" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={this.state.state}
                onChangeText={(text) => this.setState({ state: text })}
                placeholder="State"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="code" size={20} color="#40D740" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={this.state.postalCode}
                onChangeText={(text) => this.setState({ postalCode: text })}
                placeholder="Postal Code"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="earth" size={20} color="#40D740" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={this.state.country}
                onChangeText={(text) => this.setState({ country: text })}
                placeholder="Country"
                placeholderTextColor="#888"
              />
            </View>
          </>
        ) : (
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {this.state.street ? `${this.state.street}, ` : ""}
              {this.state.city ? `${this.state.city}, ` : ""}
              {this.state.state ? `${this.state.state}, ` : ""}
              {this.state.postalCode ? `${this.state.postalCode}, ` : ""}
              {this.state.country ? `${this.state.country}` : "Manaoag, Pangasinan"}
            </Text>
          </View>
        )}

        {/* Change Address Button */}
        <TouchableOpacity
          style={styles.changeAddressButton}
          onPress={() => this.setState((prevState) => ({ editingAddress: !prevState.editingAddress }))}
        >
          <Text style={styles.changeAddressText}>
            {this.state.editingAddress ? "Save Address" : "Change Address"}
          </Text>
        </TouchableOpacity>

        {/* Change Password Button */}
        <TouchableOpacity style={styles.changePasswordButton} onPress={this.handleChangePassword}>
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  profilePicContainer: {
    alignSelf: "center",
    marginBottom: 20,
    position: "relative",
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: "#40D740",
    borderWidth: 2,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#40D740",
    borderRadius: 15,
    padding: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFF",
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    marginBottom: 10,
  },
  addressContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 16,
    color: "#FFF",
  },
  changeAddressButton: {
    marginTop: 10,
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#FFAA33",
    shadowColor: "#FFAA33",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  changeAddressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  changePasswordButton: {
    marginTop: 10,
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#3385FF",
    shadowColor: "#3385FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  logoutButton: {
    marginTop: 20,
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#FF3333",
    shadowColor: "#FF3333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
});