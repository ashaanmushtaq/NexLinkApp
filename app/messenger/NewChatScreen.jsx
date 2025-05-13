import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../config/FirebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

const NewChatScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const allUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUserId);

      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const startChat = async (selectedUser) => {
    const members = [currentUserId, selectedUser.id].sort();
    const conversationId = members.join('_');

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      await setDoc(conversationRef, {
        members,
        lastMessage: '',
        updatedAt: new Date(),
      });
    }

    navigation.navigate('ChatScreen', { conversationId });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Start a New Chat</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => startChat(item)}
          >
            <Text style={styles.userName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users found</Text>}
      />
    </View>
  );
};

export default NewChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  userItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    color: '#111',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
