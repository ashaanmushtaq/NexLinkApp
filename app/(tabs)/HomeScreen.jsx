import { FlatList, StyleSheet, Text, View, Alert, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/FirebaseConfig';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Avatar from '../components/Avatar';
import { fetchPost } from '../../service/postService';
import PostCard from '../components/PostCard'; // import the PostCard
import { onAuthStateChanged } from "firebase/auth";


const HomeScreen = ({ user }) => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        getPost();
      } else {
        setCurrentUser(null);
      }
    },[]);
  
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   getPost();
  // }, []);

  const getPost = async () => {
    const res = await fetchPost();
    if (res.success) {
      setPosts(res.data);
    } else {
      Alert.alert("Error", res.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // router.replace('../index'); // optional: redirect
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NexLink</Text>
        <View style={styles.icons}>
          <Pressable onPress={() => router.push('../main/Notification')}>
            <FontAwesome name="heart-o" size={24} color="#494949" />
          </Pressable>
          <Pressable onPress={() => router.push('../main/NewPost')}>
            <FontAwesome name="plus-square-o" size={24} color="#494949" />
          </Pressable>
          <Pressable onPress={() => router.push('/ProfileScreen')}>
            <Avatar
              uri={user?.photoURL}
              size={28}
              rounded={12}
              style={{ borderWidth: 2 }}
            />
          </Pressable>
        </View>
      </View>

      <FlatList
      data={posts}
      keyExtractor={(item, index) => item.id || index.toString()}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          user={currentUser} // Pass the current user
          navigateToUserProfile={(userId) => router.push(`/user/${userId}`)} // Using `router.push`
          handleUnfollow={(userId) => console.log('Unfollow user:', userId)}
          handleDelete={(postId) => console.log('Delete post:', postId)}
          handleHide={(postId) => console.log('Hide post:', postId)}
          navigateToComments={(postId) => router.push(`/comments/${postId}`)} // Using `router.push`
        />
      )}
      ListEmptyComponent={<Text style={styles.noPostText}>No posts to show</Text>}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#494949',
    textAlign: 'center',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  noPostText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
});
