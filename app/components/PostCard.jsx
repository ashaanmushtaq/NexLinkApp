import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image as RNImage,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Avatar from './Avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { likePost, unlikePost, isPostLiked, getLikesCount } from '../../config/likes';
import { getCommentsCount } from '../../config/comments';
import { Ionicons } from '@expo/vector-icons';
import MenuModal from '../components/MenuModal';
import CommentsModal from '../components/CommentsModal';

dayjs.extend(relativeTime);

const PostCard = ({
  post,
  user, // pass authUser here
  navigateToUserProfile,
  handleUnfollow,
  handleDelete,
  handleHide,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const postTime = post?.createdAt
    ? dayjs(post.createdAt.toDate ? post.createdAt.toDate() : post.createdAt).fromNow()
    : '';

  const loadLikesAndComments = async () => {
    if (!post?.id || !user?.uid) return;
    try {
      const [isLiked, totalLikes, totalComments] = await Promise.all([
        isPostLiked(post.id, user.uid),
        getLikesCount(post.id),
        getCommentsCount(post.id),
      ]);
      setLiked(isLiked);
      setLikesCount(totalLikes);
      setCommentsCount(totalComments);
    } catch (error) {
      console.log('Error loading likes/comments:', error);
    }
  };

  useEffect(() => {
    loadLikesAndComments();
  }, [post?.id, user?.uid]);

  const handleLikeToggle = async () => {
    if (!post?.id || !user?.uid) return;
    try {
      setLoading(true);
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      if (liked) {
        await unlikePost(post.id, user.uid);
        setLikesCount((prev) => Math.max(prev - 1, 0));
      } else {
        await likePost(post.id, user.uid);
        setLikesCount((prev) => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.log('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Avatar uri={user?.photoURL} size={32} rounded={16} />
        <View>
          <Text style={styles.userName}>{post.userName}</Text>
          <Text style={styles.time}>{postTime}</Text>
        </View>
        <TouchableOpacity onPress={() => setOptionsVisible(true)} style={styles.menuIcon}>
          <Ionicons name="ellipsis-vertical" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Media */}
      {post?.mediaUrl && post?.mediaType === 'image' && (
        <RNImage
          source={{ uri: post.mediaUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      {post?.mediaUrl && post?.mediaType === 'video' && (
        <View style={styles.videoBox}>
          <Text style={styles.videoText}>Video Uploaded</Text>
        </View>
      )}

      {/* Caption */}
      <Text style={styles.caption}>{post?.caption}</Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleLikeToggle} style={styles.actionBtn} disabled={loading}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? 'red' : 'gray'}
            />
          </Animated.View>
          {loading ? (
            <ActivityIndicator size="small" color="#999" />
          ) : (
            <Text style={styles.countText}>{likesCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCommentsVisible(true)} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="gray" />
          <Text style={styles.countText}>{commentsCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <MenuModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        onViewProfile={() => {
          setOptionsVisible(false);
          navigateToUserProfile(post.userId);
        }}
        onUnfollow={() => {
          setOptionsVisible(false);
          handleUnfollow(post.userId);
        }}
        onDelete={() => {
          setOptionsVisible(false);
          handleDelete(post.id);
        }}
        onHide={() => {
          setOptionsVisible(false);
          handleHide(post.id);
        }}
      />

      <CommentsModal
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        postId={post.id}
        user={user}
        onCommentPosted={() => setCommentsCount((prev) => prev + 1)}
      />
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: { fontSize: 16, fontWeight: 'bold' },
  time: { fontSize: 12, color: '#888' },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  videoBox: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 8,
  },
  videoText: { fontSize: 16, color: '#555' },
  caption: { fontSize: 14, color: '#333', marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'flex-start',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 13,
    color: '#333',
  },
  menuIcon: {
    marginLeft: 'auto',
    padding: 6,
  },
});
