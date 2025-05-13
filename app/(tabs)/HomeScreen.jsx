import { FlatList, StyleSheet, Text, View, Alert, Pressable, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/FirebaseConfig';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Avatar from '../components/Avatar';
import { fetchPost } from '../../service/postService';
import PostCard from '../components/PostCard';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const HomeScreen = ({ user }) => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        getPost();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        setLoading(true);
        getPost();
      }
    }, [currentUser])
  );

  const getPost = async () => {
    const res = await fetchPost();
    if (res.success) {
      setPosts(res.data || []);
      setAllLoaded(res.data.length === 0); // if no data, set all loaded
    } else {
      Alert.alert("Error", res.message);
    }
    setLoading(false);
  };

  const loadMorePosts = async () => {
    if (loadingMore || allLoaded) return;

    setLoadingMore(true);
    const res = await fetchPost(); // This should ideally support pagination
    if (res.success && res.data.length > 0) {
      // Avoid duplicates by filtering
      const newPosts = res.data.filter(
        (post) => !posts.some((existing) => existing.id === post.id)
      );
      setPosts((prev) => [...prev, ...newPosts]);
      if (newPosts.length === 0) {
        setAllLoaded(true); // no new posts means we are done
      }
    } else {
      setAllLoaded(true);
    }
    setLoadingMore(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const handleNotificationClick = () => {
    setHasNewNotifications(false);
    router.push('/main/NotificationScreen');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NexLink</Text>
        <View style={styles.icons}>
          <Pressable onPress={handleNotificationClick}>
            <FontAwesome name="heart-o" size={24} color="#494949" />
            {hasNewNotifications && (
              <View style={styles.notificationDot} />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('../main/NewPost')}>
            <FontAwesome name="plus-square-o" size={24} color="#494949" />
          </Pressable>
          <Pressable onPress={() => router.push('/messenger/ChatListScreen')}>
            <FontAwesome5 name="facebook-messenger" size={24} color="#494949" />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00c26f" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => `${item.id || `post-${index}`}`}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              user={currentUser}
              navigateToUserProfile={(userId) => router.push(`/user/${userId}`)}
              handleUnfollow={(userId) => console.log('Unfollow user:', userId)}
              handleDelete={(postId) => console.log('Delete post:', postId)}
              handleHide={(postId) => console.log('Hide post:', postId)}
              navigateToComments={(postId) => router.push(`/comments/${postId}`)}
            />
          )}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#00c26f" />
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>
            ) : allLoaded && posts.length > 0 ? (
              <Text style={styles.endMessage}>No more posts yet.</Text>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.noPostText}>No posts to show.</Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
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
    color: '#00c26f',
    textAlign: 'center',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  notificationDot: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  noPostText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#aaa',
  },
  footerLoading: {
    marginVertical: 10,
    alignItems: 'center',
  },
  endMessage: {
    textAlign: 'center',
    color: '#999',
    padding: 10,
  },
});
