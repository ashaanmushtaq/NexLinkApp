import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../../config/FirebaseConfig'; // Import Firebase config file
import { collection, query, orderBy, startAt, endAt, getDocs } from 'firebase/firestore'; // Firestore methods
import { debounce } from 'lodash'; // Debounce library for limiting API calls
import { useRouter } from 'expo-router'; // Router for navigation
import Avatar from '../components/Avatar'; // Assuming you have an Avatar component
import { getAuth } from 'firebase/auth'; // Firebase Authentication to get current user
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomInput from '../components/CustomInput';

const SearchScreen = () => {
  const [searchText, setSearchText] = useState(''); // State for storing search text
  const [users, setUsers] = useState([]); // State for storing fetched users
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter(); // Initialize router for navigation
  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        console.log('Total users in Firestore:', querySnapshot.size); // Print user count

        querySnapshot.forEach((doc) => {
          console.log('User:', doc.id, doc.data()); // Optional: see full user data
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchAllUsers(); // Call the function to fetch users when the component mounts
  }, []);

  // Debounced function to fetch users from Firebase and avoid multiple API calls
  const debouncedSearch = debounce(async (text) => {
    setLoading(true); // Start loading spinner
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('displayName_lower'), // Order by display name
        startAt(text.trim().toLowerCase()), // Case-insensitive search, trimming spaces
        endAt(text.trim().toLowerCase() + '\uf8ff') // Search for all matching names
      );

      const querySnapshot = await getDocs(q);
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() }); // Add each user to the list
      });

      setUsers(usersList); // Update state with the fetched users
      setLoading(false); // Stop the loading spinner
    } catch (error) {
      console.log('Error fetching users:', error); // Error handling
      setLoading(false);
    }
  }, 500); // Debounce delay of 500ms

  const handleUserClick = (userId) => {
    const currentUser = auth.currentUser; // Get current logged-in user
    if (currentUser?.uid === userId) {
      router.push('/ProfileScreen'); // Navigate to own profile
    } else {
      router.push(`/main/${userId}`); // Navigate to user's public profile
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.userContainer} onPress={() => handleUserClick(item.id)}>
      <Avatar uri={item.photoURL || ''} size={40} rounded={20} /> {/* Show user avatar, default if photoURL is missing */}
      <Text style={styles.userName}>{item.displayName}</Text> {/* Display user name */}
    </TouchableOpacity>
  );

  const handleSearchTextChange = (text) => {
    setSearchText(text); // Update search text state
    debouncedSearch(text); // Trigger debounced search
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Search Users</Text>
      </View>
      <CustomInput
        placeholder="Search Users..."
        value={searchText}
        onChangeText={handleSearchTextChange} // Handle text input change
        style={styles.input}
        iconName="search1"
      />

      {/* Show loading indicator when fetching users */}
      {loading && (
        <ActivityIndicator size="large" color="#00c26f" style={styles.loadingIndicator} />
      )}

      {/* Display users in a list */}
      {users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem} // Render each user item
        />
      ) : (
        !loading && searchText.length > 0 && (
          <Text style={styles.noUserText}>User not found</Text> // Message if no user found
        )
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginLeft: 10,
  },
  backArrow: {
    fontSize: 26,
    color: '#00c26f',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10, // Add space between avatar and username
  },
  noUserText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
