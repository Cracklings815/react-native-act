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
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Settings</Text>

        <TouchableOpacity onPress={this.pickImage} style={styles.profilePicContainer}>
          <Image
            source={
              this.state.profilePic
                ? { uri: this.state.profilePic }
                : require("@/assets/images/2x2.png")
            }
            style={styles.profilePic}
          />
          <View style={styles.editIcon}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>

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

        <Text style={styles.sectionHeader}>Shipping Address</Text>

        {this.state.editingAddress ? (
          <>
            {["street", "city", "state", "postalCode", "country"].map((field, index) => {
              const placeholder = field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
              const iconNames = ["home", "location", "map", "code", "earth"];
              return (
                <View key={index} style={styles.inputContainer}>
                  <Ionicons
                    name={iconNames[index] as any}
                    size={20}
                    color="#40D740"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#888"
                    value={this.state[field as keyof State] as string}
                    keyboardType={field === "postalCode" ? "numeric" : "default"}
                    onChangeText={(text) =>
                      this.setState((prevState) => ({
                        ...prevState,
                        [field]: text,
                      }))
                    }
                  />
                </View>
              );
            })}
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

        <TouchableOpacity
          style={styles.changeAddressButton}
          onPress={() => this.setState((prev) => ({ editingAddress: !prev.editingAddress }))}
        >
          <Text style={styles.changeAddressText}>
            {this.state.editingAddress ? "Save Address" : "Change Address"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.changePasswordButton} onPress={this.handleChangePassword}>
          <Text style={styles.changePasswordText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
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
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
});
