import React, { Component } from 'react';
import { Text, View, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export class Search extends Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search..."
            placeholderTextColor="#888"
          />
        </View>

        
        <View style={styles.content}>
          <Text style={styles.resultText}>Search Results Will Appear Here</Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#110E0E',
    justifyContent: 'flex-start', 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 50, // Moves the search bar down
    height: 40,
  },
  searchIcon: {
    marginRight: 8, 
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    marginTop: 30, 
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Search;
