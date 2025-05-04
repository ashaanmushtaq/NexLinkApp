import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchSinglePost } from '../../service/postService';
import PostCard from '../components/PostCard';

const PostDetailsScreen = () => {
  const { postId } = useLocalSearchParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) {
      Alert.alert('Invalid', 'Post ID not provided');
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      const res = await fetchSinglePost(postId);
      if (res.success) {
        setPost(res.data);
      } else {
        Alert.alert('Error', res.message);
      }
      setLoading(false);
    };

    loadPost();
  }, [postId]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Post</Text>
      <View style={{ width: 24 }} /> {/* Placeholder for right-side spacing */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        {renderHeader()}
        <ActivityIndicator size="large" color="#00c26f" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        {renderHeader()}
        <Text style={styles.notFoundText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <PostCard post={post} user={post.user || {}} />
    </View>
  );
};

export default PostDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft:12,
  },
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    marginTop: 40,
    color: '#666',
  },
});
