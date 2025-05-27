import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";








import { db } from "../scripts/firebase";
import { ref, onValue } from "firebase/database";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState<"admin" | "user" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();


  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      let found = false;

      for (const userId in users) {
        const user = users[userId];
        if (user.email === email && user.password === password) {
          found = true;
          Alert.alert("Welcome", `Logged in as ${user.role}`);
          setRedirect(user.role === "admin" ? "admin" : "user");
          break;
        }
      }

      if (!found) {
        Alert.alert("Error", "Invalid email or password.");
      }
    }, {
      onlyOnce: true
    });
  };

  if (redirect === "admin") {
    return <Redirect href="/(admin)/AdminPanel" />;
  }

  if (redirect === "user") {
    return <Redirect href="/main" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#873A3A" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#873A3A" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Redirecting to reset password.")}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupLink}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingHorizontal: 15,
    width: "100%",
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFF",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#FFAA33",
    marginBottom: 15,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#873A3A",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    color: "#BBB",
  },
  signupLink: {
    fontSize: 16,
    color: "#873A3A",
    fontWeight: "bold",
  },
});

export default LoginScreen;
