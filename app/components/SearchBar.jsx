import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { searchUsers } from '../../service/userService'; // A service function to query users from Firestore

const SearchBar = ({ onSearchResults }) => {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (query.length > 0) {
      const results = await searchUsers(query);
      onSearchResults(results);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for users"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity onPress={handleSearch}>
        <FontAwesome name="search" size={20} color="#494949" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    marginRight: 10,
  },
});

export default SearchBar;
