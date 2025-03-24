import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

interface Info {
  name: string;
  course: string;
}

const Activity = () => {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [Data, setData] = useState<Info>({ name: "", course: "" }); 

  const SubmitBtn = () => {
    if (name && course) {
      setData({ name, course });
      Alert.alert("Success", "Info Submitted");
    } else {
      Alert.alert("Error");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#888" value={name} onChangeText={setName} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Course" placeholderTextColor="#888" value={course} onChangeText={setCourse} />
      </View>

      <TouchableOpacity style={styles.Button} onPress={SubmitBtn}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      <View>
        <View style={styles.display}>
          <Text style={styles.Text}>Your name is: {Data.name}</Text>
          <Text style={styles.Text}>You are from: {Data.course}</Text>
        </View>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    paddingHorizontal: 15,
    width: "100%",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFF",
  },
  Button: {
    width: "100%",
    backgroundColor: "#873A3A",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  display: {
    marginTop: 20,
    alignItems: "center",
    
  },
  Text: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 5,
  },
});

export default Activity;